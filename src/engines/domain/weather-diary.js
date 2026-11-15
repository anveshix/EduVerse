// Seven observation slots, not a weather service or a climate dataset. Pure helpers for the T03 diary.
export const DIARY_DAYS = 7;
export const SKY_VALUES = ['clear', 'partly', 'cloudy'];
export const RAIN_VALUES = ['seen', 'not-seen'];
export const WIND_VALUES = ['calm', 'breezy', 'windy'];
const DAY_MS = 86_400_000;

export const blankWeatherDay = () => ({ date: '', time: '', sky: '', rain: '', wind: '', temperature: '' });
export const blankWeatherDiary = () => ({ place: '', reflection: '', active: 0, days: Array.from({ length: DIARY_DAYS }, blankWeatherDay) });

// UTC calendar arithmetic avoids local daylight-saving changes; reject impossible dates such as February 30.
export function observationDate(date) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || date.startsWith('0000-')) return null;
  const ms = Date.parse(`${date}T00:00:00Z`);
  return Number.isFinite(ms) && new Date(ms).toISOString().slice(0, 10) === date ? ms / DAY_MS : null;
}

// Blank is not zero. Invalid/out-of-range values remain editable, but are excluded from the summary.
export function temperatureReading(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const raw = String(value).trim();
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(raw)) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= -90 && n <= 60 ? n : null;
}

export function normalizeWeatherDiary(saved) {
  const src = saved && typeof saved === 'object' ? saved : {};
  const days = Array.isArray(src.days) ? src.days : [];
  const clean = (value, max = 30) => typeof value === 'string' ? value.slice(0, max) : '';
  return {
    place: clean(src.place, 60),
    reflection: clean(src.reflection, 600),
    active: Number.isInteger(src.active) && src.active >= 0 && src.active < DIARY_DAYS ? src.active : 0,
    days: Array.from({ length: DIARY_DAYS }, (_, i) => {
      const d = days[i] && typeof days[i] === 'object' ? days[i] : {};
      const time = clean(d.time, 5);
      return {
        date: observationDate(d.date) === null ? '' : d.date,
        time: /^([01]\d|2[0-3]):[0-5]\d$/.test(time) ? time : '',
        sky: SKY_VALUES.includes(d.sky) ? d.sky : '',
        rain: RAIN_VALUES.includes(d.rain) ? d.rain : '',
        wind: WIND_VALUES.includes(d.wind) ? d.wind : '',
        temperature: clean(d.temperature),
      };
    }),
  };
}

export function summarizeWeatherDiary(input) {
  const days = Array.from({ length: DIARY_DAYS }, (_, i) => input?.[i] || {});
  const rainSeen = days.filter((d) => d.rain === 'seen').length;
  const rainNotSeen = days.filter((d) => d.rain === 'not-seen').length;
  const temperatures = days.map((d) => temperatureReading(d.temperature)).filter((n) => n !== null);
  const observed = days.filter((d) => SKY_VALUES.includes(d.sky) || RAIN_VALUES.includes(d.rain)
    || WIND_VALUES.includes(d.wind) || temperatureReading(d.temperature) !== null).length;
  const dates = days.map((d, i) => ({ day: observationDate(d.date), index: i })).filter((d) => d.day !== null);
  // Each entered date should imply the same starting date, even if there are blank days in between.
  const consecutive = dates.every((d) => d.day - d.index === dates[0].day - dates[0].index);
  return {
    observed, rainSeen, rainNotSeen, rainUnrecorded: DIARY_DAYS - rainSeen - rainNotSeen,
    temperatures: temperatures.length,
    minTemperature: temperatures.length ? Math.min(...temperatures) : null,
    maxTemperature: temperatures.length ? Math.max(...temperatures) : null,
    dates: dates.length, consecutive,
  };
}
