import test from 'node:test';
import assert from 'node:assert/strict';
import {
  blankWeatherDay, blankWeatherDiary, normalizeWeatherDiary, observationDate, summarizeWeatherDiary, temperatureReading,
} from '../src/engines/domain/weather-diary.js';
import { MONSOON_STAGES } from '../src/modules/geography/monsoon-inquiry.js';
import { MONTH_NAMES } from '../src/modules/geography/climate-table.js';
import { climateGrapher, monsoonMap } from '../src/modules/geography/t03-specs.js';
import * as store from '../src/core/store.js';

const seven = () => Array.from({ length: 7 }, blankWeatherDay);

test('weather diary: missing rain and missing temperature are not zeros', () => {
  const days = seven();
  assert.deepEqual(summarizeWeatherDiary(days), {
    observed: 0, rainSeen: 0, rainNotSeen: 0, rainUnrecorded: 7,
    temperatures: 0, minTemperature: null, maxTemperature: null, dates: 0, consecutive: true,
  });
  days[0].date = '2024-02-28'; // A date alone does not count as a weather observation.
  days[1].rain = 'not-seen';
  days[2].rain = 'seen';
  days[3].temperature = '0';
  days[4].temperature = '-12.5';
  days[5].temperature = '61'; // kept editable, excluded from observation counts and extrema
  const result = summarizeWeatherDiary([...days, { rain: 'seen' }]);
  assert.equal(result.observed, 4);
  assert.deepEqual([result.rainSeen, result.rainNotSeen, result.rainUnrecorded], [1, 1, 5]);
  assert.deepEqual([result.temperatures, result.minTemperature, result.maxTemperature], [2, -12.5, 0]);
  assert.equal(result.dates, 1);
  assert.equal(temperatureReading(''), null);
  assert.equal(temperatureReading('  '), null);
  assert.equal(temperatureReading('0'), 0);
  assert.equal(temperatureReading('-90'), -90);
  assert.equal(temperatureReading('60'), 60);
  assert.equal(temperatureReading('61'), null);
  assert.equal(temperatureReading('0x10'), null);
  assert.equal(temperatureReading('banana'), null);
});

test('weather diary: calendar sequence handles leap days, missing dates, duplicates and year boundaries', () => {
  assert.equal(observationDate('2024-02-30'), null);
  assert.equal(observationDate('2023-02-29'), null);
  assert.equal(observationDate('0000-01-01'), null);
  assert.equal(observationDate('2024-02-29') - observationDate('2024-02-28'), 1);
  assert.equal(observationDate('2025-01-01') - observationDate('2024-12-31'), 1);
  const days = seven();
  days[0].date = '2024-02-28';
  days[2].date = '2024-03-01'; // day two can be blank without implying a conflict
  assert.equal(summarizeWeatherDiary(days).consecutive, true);
  days[1].date = '2024-02-28';
  assert.equal(summarizeWeatherDiary(days).consecutive, false, 'duplicate dates cannot describe consecutive days');
  days[1].date = '2024-02-29';
  assert.equal(summarizeWeatherDiary(days).consecutive, true);
  days[2].date = '2024-03-02';
  assert.equal(summarizeWeatherDiary(days).consecutive, false);
});

test('weather diary: saved state is bounded and repairs malformed records without fabricating observations', () => {
  assert.equal(blankWeatherDiary().days.length, 7);
  const state = normalizeWeatherDiary({
    place: 'x'.repeat(100), reflection: 'y'.repeat(700), active: 12,
    days: [{ date: '2024-02-30', time: '25:61', sky: 'unknown', rain: 'unknown', wind: 'bad', temperature: '61' }, null],
  });
  assert.equal(state.place.length, 60);
  assert.equal(state.reflection.length, 600);
  assert.equal(state.active, 0);
  assert.deepEqual(state.days[0], { date: '', time: '', sky: '', rain: '', wind: '', temperature: '61' });
  assert.equal(state.days.length, 7);
  assert.equal(summarizeWeatherDiary(state.days).observed, 0);
});

test('monsoon stages and map explain seasonal mechanisms bilingually without presenting a forecast', () => {
  assert.deepEqual(MONSOON_STAGES.map((s) => [s.id, s.season]), [
    ['heat', 'sw'], ['crossing', 'sw'], ['branches', 'sw'], ['retreat', 'ne'],
  ]);
  for (const stage of MONSOON_STAGES) {
    for (const pair of [stage.label, stage.body, stage.question, ...stage.chain]) {
      assert.ok(pair.en && /[\u0900-\u097f]/.test(pair.hi), `${stage.id} must be bilingual`);
    }
  }
  assert.match(MONSOON_STAGES[0].body.en, /convergence zone/i);
  assert.match(MONSOON_STAGES[1].body.en, /Coriolis/i);
  assert.match(MONSOON_STAGES[2].body.en, /Western Ghats[\s\S]*Bihar/i);
  assert.match(MONSOON_STAGES[3].body.en, /Tamil Nadu[\s\S]*Bihar/i);
  store.set({ lang: 'en' });
  const sw = monsoonMap.view({ season: 'sw', crop: 'rice' });
  const ne = monsoonMap.view({ season: 'ne', crop: 'rice' });
  assert.equal((sw.svg.match(/data-monsoon-arrow=/g) || []).length, 2);
  assert.equal((ne.svg.match(/data-monsoon-arrow=/g) || []).length, 1);
  assert.match(sw.svg, /Bihar/);
  assert.match(ne.svg, /Tamil Nadu/);
  assert.match(ne.aria, /not measured rainfall/i);
  assert.match(ne.lines[0].en, /not a daily forecast/i);
  store.set({ lang: 'hi' });
  assert.match(monsoonMap.view({ season: 'ne', crop: 'rice' }).aria, /मानचित्र/);
  assert.equal(climateGrapher.note.kind, 'fictional');
  assert.match(climateGrapher.view(climateGrapher.init()).lines[0].en, /not official station observations or climate normals/i);
  assert.equal(MONTH_NAMES.length, 12);
  assert.ok(MONTH_NAMES.every((m) => m.en && /[\u0900-\u097f]/.test(m.hi)));
});
