// T03.L2: seven local, student-entered observations. No weather API or inferred climate data.
import { h } from '../../core/dom.js';
import * as i18n from '../../core/i18n.js';
import * as store from '../../core/store.js';
import { bi, relabelBi } from '../../components/widgets.js';
import { blankWeatherDiary, normalizeWeatherDiary, summarizeWeatherDiary, temperatureReading } from '../../engines/domain/weather-diary.js';

const b = (en, hi) => ({ en, hi });
const C = {
  kicker: b('FIELD NOTE · YOUR EVIDENCE', 'क्षेत्र टिप्पणी · आपका प्रमाण'),
  title: b('A seven-day weather diary', 'सात दिनों की मौसम डायरी'),
  intro: b('Observe your own place on seven consecutive days, at a similar time when possible. Enter only what you actually observe; leave unknown fields blank.', 'अपने क्षेत्र का लगातार सात दिनों तक, संभव हो तो लगभग एक ही समय पर निरीक्षण करें। केवल वास्तव में देखी बातें भरें; अज्ञात स्थान खाली छोड़ें।'),
  safe: b('Observe from indoors or a safe sheltered place. During thunderstorms stay indoors, away from windows; skip the observation if unsafe. Never go onto a roof or into floodwater to collect data.', 'घर के भीतर या सुरक्षित आश्रय से निरीक्षण करें। गरज-बिजली में घर के भीतर खिड़कियों से दूर रहें; असुरक्षित हो तो प्रेक्षण छोड़ दें। आँकड़े लेने छत या बाढ़ के पानी में कभी न जाएँ।'),
  place: b('Place or locality (optional; general name only)', 'स्थान या इलाका (वैकल्पिक; केवल सामान्य नाम)'),
  placeHint: b('For example, Patna, a village, or your own locality. Do not enter a name, exact address or other personal details.', 'उदाहरण: पटना, कोई गाँव या अपना इलाका। अपना नाम, पूरा पता या अन्य निजी जानकारी न भरें।'),
  choose: b('Choose a day to edit', 'संपादित करने के लिए दिन चुनें'),
  legend: b('R: rain seen / N: not seen / ?: not recorded', 'R: वर्षा दिखी / N: नहीं दिखी / ?: दर्ज नहीं'),
  date: b('Date (optional)', 'तिथि (वैकल्पिक)'),
  time: b('Observation time (optional)', 'निरीक्षण का समय (वैकल्पिक)'),
  sky: b('Sky', 'आकाश'),
  rain: b('Rain at observation time', 'निरीक्षण के समय वर्षा'),
  wind: b('Wind, estimated from a safe view', 'सुरक्षित स्थान से पवन का अनुमान'),
  temperature: b('Measured temperature (°C, optional)', 'मापा गया तापमान (°C, वैकल्पिक)'),
  tempHint: b('Use a thermometer if available; do not guess. Enter −90 to 60 °C, or leave blank.', 'थर्मामीटर हो तो उपयोग करें; अनुमान न लगाएँ। −90 से 60 °C भरें या खाली छोड़ें।'),
  tempError: b('Enter a number from −90 to 60 °C, or leave this field blank.', '−90 से 60 °C के बीच संख्या भरें या यह स्थान खाली छोड़ें।'),
  rainHint: b('“Not seen” describes that moment only; it does not establish zero rainfall for the whole day. Blank means not recorded.', '“नहीं दिखी” केवल उस समय का वर्णन है; इससे पूरे दिन की वर्षा शून्य सिद्ध नहीं होती। खाली का अर्थ है दर्ज नहीं।'),
  summary: b('Evidence so far', 'अब तक का प्रमाण'),
  reflection: b('What changed, and what can this week not tell you about climate? (optional)', 'क्या बदला, और यह सप्ताह जलवायु के बारे में क्या नहीं बता सकता? (वैकल्पिक)'),
  climate: b('A week records weather, not climate or a forecast. Climate describes long-term patterns and variability; WMO standard climate normals use 30-year periods. The station graphs below use illustrative numbers, not official observations.', 'एक सप्ताह का विवरण मौसम है, जलवायु या पूर्वानुमान नहीं। जलवायु लंबे समय के पैटर्न और परिवर्तनशीलता को बताती है; WMO के मानक जलवायु औसत 30 वर्षों पर आधारित हैं। नीचे के केंद्र आरेखों के आँकड़े केवल उदाहरण हैं, आधिकारिक प्रेक्षण नहीं।'),
  source: b('WMO: climate normals and 30-year baselines', 'WMO: जलवायु औसत और 30-वर्षीय आधार'),
  saved: b('Saved only in this browser on this device. Clearing browser data removes the diary; the model Reset does not.', 'केवल इस उपकरण के इसी ब्राउज़र में सुरक्षित। ब्राउज़र का डेटा मिटाने से डायरी मिट जाएगी; मॉडल का रीसेट इसे नहीं मिटाता।'),
  blocked: b('Browser storage is unavailable. Your diary is temporary and will be lost when this page closes or reloads.', 'ब्राउज़र में संग्रह उपलब्ध नहीं है। डायरी अस्थायी है और पृष्ठ बंद या पुनः लोड करने पर मिट जाएगी।'),
  clear: b('Clear diary', 'डायरी मिटाएँ'),
  confirm: b('Clear the place, reflection and all seven days? This cannot be undone.', 'स्थान, चिंतन और सातों दिन मिटाएँ? इसे वापस नहीं लाया जा सकता।'),
  yes: b('Yes, clear all diary entries', 'हाँ, पूरी डायरी मिटाएँ'),
  cancel: b('Cancel', 'रद्द करें'),
};
const OPTIONS = {
  sky: [
    { id: '', ...b('Not recorded', 'दर्ज नहीं') },
    { id: 'clear', ...b('Clear or mostly clear', 'साफ़ या अधिकतर साफ़') },
    { id: 'partly', ...b('Partly cloudy', 'आंशिक बादल') },
    { id: 'cloudy', ...b('Mostly cloudy / overcast', 'अधिकतर बादल / बादलों से ढका') },
  ],
  rain: [
    { id: '', ...b('Not recorded', 'दर्ज नहीं') },
    { id: 'seen', ...b('Rain seen', 'वर्षा दिखी') },
    { id: 'not-seen', ...b('No rain seen', 'वर्षा नहीं दिखी') },
  ],
  wind: [
    { id: '', ...b('Not recorded', 'दर्ज नहीं') },
    { id: 'calm', ...b('Calm: little visible movement', 'शांत: दिखाई देने वाली हलचल कम') },
    { id: 'breezy', ...b('Breezy: leaves moving', 'हल्की हवा: पत्ते हिलते हुए') },
    { id: 'windy', ...b('Windy: branches moving', 'तेज़ हवा: डालियाँ हिलती हुई') },
  ],
};
const text = (o) => i18n.pair(o.en, o.hi);
// Dynamic bilingual summaries retain language tags for assistive technology.
const setCopy = (el, copy) => { el.dataset.bi = JSON.stringify(copy); el.innerHTML = i18n.pairHtml(copy.en, copy.hi, { block: true }); };
const label = (id, copy) => h('label', { for: id }, bi(copy, { tag: 'span' }));

export function createWeatherDiary() {
  let state = store.simState('T03.weatherDiary', blankWeatherDiary());
  if (!state || typeof state !== 'object' || Array.isArray(state)) {
    store.resetSim('T03.weatherDiary');
    state = store.simState('T03.weatherDiary', blankWeatherDiary());
  }
  Object.assign(state, normalizeWeatherDiary(state));

  const place = h('input', { id: 'diary-place', type: 'text', maxlength: '60', autocomplete: 'off', 'aria-describedby': 'diary-place-hint', 'data-diary-place': '' });
  const reflection = h('textarea', { id: 'diary-reflection', rows: '3', maxlength: '600', 'data-diary-reflection': '' });
  const date = h('input', { id: 'diary-date', type: 'date', 'data-diary-field': 'date' });
  const time = h('input', { id: 'diary-time', type: 'time', 'data-diary-field': 'time' });
  const sky = h('select', { id: 'diary-sky', 'data-diary-field': 'sky' });
  const rain = h('select', { id: 'diary-rain', 'aria-describedby': 'diary-rain-hint', 'data-diary-field': 'rain' });
  const wind = h('select', { id: 'diary-wind', 'data-diary-field': 'wind' });
  const temperature = h('input', { id: 'diary-temperature', type: 'number', min: '-90', max: '60', step: 'any', inputmode: 'decimal', 'aria-describedby': 'diary-temp-hint diary-temp-error', 'data-diary-field': 'temperature' });
  const error = bi(C.tempError, { tag: 'p', cls: 'weather-error' }); error.id = 'diary-temp-error'; error.hidden = true;
  const fields = { date, time, sky, rain, wind, temperature };
  const dayLabel = h('legend', { class: 'weather-editor-title' });
  const rainHint = bi(C.rainHint, { tag: 'p', cls: 'note weather-field-hint' }); rainHint.id = 'diary-rain-hint';
  const tempHint = bi(C.tempHint, { tag: 'p', cls: 'note weather-field-hint' }); tempHint.id = 'diary-temp-hint';
  const groupLabel = text(C.choose);
  const progressLabel = h('p', { id: 'diary-progress-label', class: 'weather-progress-label' });
  const progress = h('progress', { max: '7', value: '0', 'aria-labelledby': 'diary-progress-label' });
  const rainSummary = h('p', { 'data-diary-summary': 'rain' });
  const tempSummary = h('p', { 'data-diary-summary': 'temperature' });
  const datesSummary = h('p', { 'data-diary-summary': 'dates' });
  const storage = h('p', { class: 'note weather-storage', 'data-diary-storage': '' });
  const buttons = Array.from({ length: 7 }, (_, i) => {
    const number = h('span', { class: 'weather-day-number' });
    const symbol = h('span', { class: 'weather-day-symbol', 'aria-hidden': 'true' });
    const button = h('button', {
      type: 'button', class: 'btn weather-day', 'data-diary-day': String(i + 1), 'aria-pressed': 'false',
      onclick: () => { state.active = i; save(); renderEditor(); renderDays(); },
    }, number, symbol);
    return { button, number, symbol };
  });
  const dayGroup = h('div', { class: 'weather-days', role: 'group', 'aria-label': groupLabel }, ...buttons.map((x) => x.button));
  const confirmBox = h('div', { class: 'weather-confirm', hidden: true });
  const clearButton = h('button', { type: 'button', class: 'btn ghost', 'data-diary-clear': '', onclick: () => { confirmBox.hidden = false; yesButton.focus(); } }, bi(C.clear, { tag: 'span' }));
  const yesButton = h('button', {
    type: 'button', class: 'btn', 'data-diary-confirm-clear': '',
    onclick: () => {
      Object.assign(state, blankWeatherDiary());
      place.value = ''; reflection.value = ''; confirmBox.hidden = true;
      save(); renderEditor(); renderDays(); renderSummary(); clearButton.focus();
    },
  }, bi(C.yes, { tag: 'span' }));
  const cancelButton = h('button', { type: 'button', class: 'btn ghost', onclick: () => { confirmBox.hidden = true; clearButton.focus(); } }, bi(C.cancel, { tag: 'span' }));
  confirmBox.append(bi(C.confirm, { tag: 'p' }), h('div', { class: 'row' }, yesButton, cancelButton));

  const field = (id, copy, input, ...notes) => h('div', { class: 'weather-field' }, label(id, copy), input, ...notes);
  const placeHint = bi(C.placeHint, { tag: 'p', cls: 'note weather-field-hint' }); placeHint.id = 'diary-place-hint';
  const el = h('section', { class: 'weather-diary', 'aria-labelledby': 'weather-diary-title' },
    bi(C.kicker, { tag: 'p', cls: 'weather-kicker' }),
    bi(C.title, { tag: 'h3', cls: 'weather-title' }),
    bi(C.intro, { tag: 'p', cls: 'weather-intro' }),
    bi(C.safe, { tag: 'p', cls: 'weather-safety' }),
    field('diary-place', C.place, place, placeHint),
    h('div', { class: 'weather-board' },
      h('div', { class: 'weather-entry' },
        bi(C.choose, { tag: 'h4', cls: 'weather-subhead' }), dayGroup,
        bi(C.legend, { tag: 'p', cls: 'note weather-legend' }),
        h('fieldset', { class: 'weather-editor' }, dayLabel,
          h('div', { class: 'weather-fields' },
            field('diary-date', C.date, date), field('diary-time', C.time, time),
            field('diary-sky', C.sky, sky), field('diary-rain', C.rain, rain, rainHint),
            field('diary-wind', C.wind, wind), field('diary-temperature', C.temperature, temperature, tempHint, error)))),
      h('aside', { class: 'weather-summary', 'aria-labelledby': 'weather-summary-title' },
        bi(C.summary, { tag: 'h4', cls: 'weather-summary-title' }),
        h('div', { role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' }, progressLabel, progress, rainSummary, tempSummary, datesSummary),
        field('diary-reflection', C.reflection, reflection))),
    bi(C.climate, { tag: 'p', cls: 'weather-climate' }),
    h('a', { class: 'weather-source', href: 'https://wmo.int/media/news/wmo-publishes-global-update-of-climate-datasets', target: '_blank', rel: 'noopener noreferrer' }, bi(C.source, { tag: 'span' })),
    storage, h('div', { class: 'weather-actions' }, clearButton, confirmBox));
  el.querySelector('.weather-title').id = 'weather-diary-title';
  el.querySelector('.weather-summary-title').id = 'weather-summary-title';

  function storageNote() { setCopy(storage, store.storageBlocked() ? C.blocked : C.saved); }
  function save() { store.saveSim(); storageNote(); }
  function setOptions() {
    for (const [key, choices] of Object.entries(OPTIONS)) {
      const select = fields[key];
      if (!select.options.length) choices.forEach((o) => select.append(h('option', { value: o.id })));
      choices.forEach((o, i) => { select.options[i].textContent = text(o); });
    }
  }
  function renderDays() {
    dayGroup.setAttribute('aria-label', text(C.choose));
    buttons.forEach(({ button, number, symbol }, i) => {
      const status = OPTIONS.rain.find((o) => o.id === state.days[i].rain) || OPTIONS.rain[0];
      const labelText = b(`Day ${i + 1}: ${status.en}`, `दिन ${i + 1}: ${status.hi}`);
      number.textContent = text(b(`Day ${i + 1}`, `दिन ${i + 1}`));
      symbol.textContent = state.days[i].rain === 'seen' ? 'R' : state.days[i].rain === 'not-seen' ? 'N' : '?';
      button.dataset.rain = state.days[i].rain || 'unknown';
      button.setAttribute('aria-pressed', String(i === state.active));
      button.setAttribute('aria-label', text(labelText));
      button.title = text(labelText);
    });
  }
  function validateTemperature() {
    const invalid = temperature.value !== '' && temperatureReading(temperature.value) === null;
    temperature.setAttribute('aria-invalid', String(invalid));
    error.hidden = !invalid;
  }
  function renderEditor() {
    const day = state.days[state.active];
    dayLabel.textContent = text(b(`Day ${state.active + 1}`, `दिन ${state.active + 1}`));
    for (const [key, input] of Object.entries(fields)) input.value = day[key];
    validateTemperature();
  }
  function renderSummary() {
    const r = summarizeWeatherDiary(state.days);
    progress.value = r.observed;
    setCopy(progressLabel, b(`${r.observed}/7 day entries have at least one observation`, `${r.observed}/7 दिन के खानों में कम से कम एक प्रेक्षण दर्ज है`));
    setCopy(rainSummary, b(`Rain seen: ${r.rainSeen} · Not seen: ${r.rainNotSeen} · Not recorded: ${r.rainUnrecorded}`, `वर्षा दिखी: ${r.rainSeen} · नहीं दिखी: ${r.rainNotSeen} · दर्ज नहीं: ${r.rainUnrecorded}`));
    const temps = r.temperatures
      ? b(`${r.temperatures} temperature reading(s): ${r.minTemperature}–${r.maxTemperature} °C (not daily highs or lows).`, `${r.temperatures} तापमान प्रेक्षण: ${r.minTemperature}–${r.maxTemperature} °C (ये दैनिक अधिकतम या न्यूनतम नहीं हैं)।`)
      : b('Temperature: not recorded.', 'तापमान: दर्ज नहीं।');
    setCopy(tempSummary, temps);
    const dates = !r.dates
      ? b('Add dates for seven consecutive days; a date alone is not an observation.', 'लगातार सात दिनों की तिथियाँ भरें; केवल तिथि प्रेक्षण नहीं है।')
      : !r.consecutive
        ? b('Dates do not match seven consecutive days. Check the dates you entered.', 'तिथियाँ लगातार सात दिनों से मेल नहीं खातीं। भरी हुई तिथियाँ जाँचें।')
        : r.dates < 7
          ? b(`${r.dates}/7 dates entered; the dates so far do not conflict.`, `${r.dates}/7 तिथियाँ भरीं; अभी तक की तिथियाँ परस्पर मेल खाती हैं।`)
          : b('All seven dates are consecutive.', 'सातों तिथियाँ लगातार हैं।');
    setCopy(datesSummary, dates);
    datesSummary.classList.toggle('weather-warning', !r.consecutive);
  }
  place.value = state.place;
  reflection.value = state.reflection;
  place.addEventListener('input', () => { state.place = place.value; save(); });
  reflection.addEventListener('input', () => { state.reflection = reflection.value; save(); });
  for (const [key, input] of Object.entries(fields)) {
    input.addEventListener(input.tagName === 'SELECT' ? 'change' : 'input', () => {
      state.days[state.active][key] = input.value;
      if (key === 'temperature') validateTemperature();
      save(); renderDays(); renderSummary();
    });
  }
  setOptions(); renderEditor(); renderDays(); renderSummary(); storageNote();
  return {
    el,
    relabel() { relabelBi(el); setOptions(); renderEditor(); renderDays(); renderSummary(); storageNote(); },
    destroy() {},
  };
}
