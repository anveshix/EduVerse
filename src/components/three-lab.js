// Bridges any declarative lab-kit spec with an interactive Three.js 3D/VR stage + guided Spatial Field Tour + Cardboard Stereo & WebXR.
import { h } from '../core/dom.js';
import { t, pair } from '../core/i18n.js';
import * as store from '../core/store.js';
import { playTap, playFlip } from '../core/sound.js';
import { button } from './widgets.js';
import { webglAvailable } from '../engines/webgl.js';
import { xrSupport } from '../engines/xr.js';
import { createScene } from '../engines/three-scene.js';
import { THEME_NEP } from '../data/nep-cbq.js';

export function attachThreeStage(labEl, getState, create3dView, { ariaKey = 'pb.gl.aria', mode2dKey = 'pb.mode.2d', mode3dKey = 'pb.mode.3d', insertBeforeEl, themeId, tourStops, onInspect } = {}) {
  const stops = tourStops || (themeId && THEME_NEP[themeId]?.tours) || [];
  const glHost = h('div', { class: 'gl-host', 'aria-label': t(ariaKey), 'data-k-aria': ariaKey });
  const glLabels = h('div', { class: 'gl-labels', 'aria-hidden': 'true' });
  const inspectPill = h('div', { class: 'gl-inspect', hidden: true });
  const tourPill = h('div', { class: 'gl-tour-pill', hidden: true });
  const view3d = h('div', { class: 'view3d', hidden: true }, glHost, glLabels, inspectPill, tourPill);
  const modeNote = h('p', { class: 'note gl-mode-note' });
  let api = null, view3dObj = null, destroyed = false, lastPick = null;
  let tourIdx = -1, currentStop = null;
  // Keep at most one asynchronous scene construction alive. A tab or preference
  // change invalidates it before it can attach a stale WebGL context.
  let wanted = false, generation = 0, loading = null, pendingFocus = null;

  const spinBtn = h('button', {
    type: 'button',
    class: 'btn ghost',
    'data-k': 'pb.btn.spin',
    'aria-pressed': 'false',
    onclick: () => {
      playTap();
      if (!api) return;
      const next = !api.isAutoRotate();
      api.setAutoRotate(next);
      spinBtn.setAttribute('aria-pressed', String(api.isAutoRotate()));
    },
  }, t('pb.btn.spin'));

  const stereoBtn = h('button', {
    type: 'button',
    class: 'btn ghost vr-btn',
    'data-k': 'vr.stereo',
    'aria-pressed': 'false',
    onclick: () => {
      playTap();
      if (!api) return;
      const on = api.setStereo(!api.isStereo());
      stereoBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      view3d.classList.toggle('gl-stereo', on);
    },
  }, t('vr.stereo'));

  const tourBtn = stops.length ? h('button', {
    type: 'button',
    class: 'btn ghost vr-btn',
    'data-k': 'vr.tour',
    onclick: () => {
      playFlip();
      if (!api || !stops.length) return;
      tourIdx = (tourIdx + 1) % stops.length;
      currentStop = stops[tourIdx];
      pendingFocus = null; delete view3d.dataset.tourFocus;
      api.setAutoRotate(false);
      spinBtn.setAttribute('aria-pressed', 'false');
      api.flyTo({ az: currentStop.az, pol: currentStop.pol, r: currentStop.r }, 900);
      tourPill.textContent = `🥽 (${tourIdx + 1}/${stops.length}) ${pair(currentStop.en, currentStop.hi)}`;
      tourPill.hidden = false;
    },
  }, t('vr.tour')) : null;

  const xrBtn = h('button', {
    type: 'button',
    class: 'btn primary vr-btn',
    'data-k': 'vr.enter',
    hidden: true,
    onclick: async () => {
      playTap();
      await api?.enterWebXR?.();
    },
  }, t('vr.enter'));

  xrSupport().then((sup) => {
    if (!destroyed && sup.vr) xrBtn.hidden = false;
  }).catch(() => {});

  const presets = h('div', { class: 'row gl-presets' },
    ...['overview', 'close', 'section', 'top'].map((p) => button(`pb.cam.${p}`, () => {
      currentStop = null; pendingFocus = null; delete view3d.dataset.tourFocus;
      tourPill.hidden = true;
      api?.preset(p);
    }, 'btn ghost')),
    spinBtn,
    tourBtn,
    stereoBtn,
    xrBtn);
  presets.hidden = true;

  const mainCol = labEl.querySelector('.lab-main');
  const anchor = insertBeforeEl || labEl.querySelector('.lab-graphic');
  mainCol.insertBefore(view3d, anchor);
  mainCol.insertBefore(presets, anchor);
  mainCol.insertBefore(modeNote, anchor.nextSibling);

  const lowG = () => store.get().lowGraphics || !webglAvailable();

  function showInspect(info) {
    lastPick = info;
    if (!info) { inspectPill.hidden = true; return; }
    playTap();
    inspectPill.textContent = pair(info.en, info.hi);
    inspectPill.hidden = false;
  }

  function setMode(key) { modeNote.dataset.k = key; modeNote.textContent = t(key); }

  function applyFocus() {
    if (!api || !pendingFocus) return;
    currentStop = null; tourPill.hidden = true;
    api.setAutoRotate(false);
    spinBtn.setAttribute('aria-pressed', 'false');
    api.flyTo(pendingFocus.view, 900);
    if (pendingFocus.id) view3d.dataset.tourFocus = pendingFocus.id;
  }

  // Companion tours may request a camera focus while 3D is loading or disabled.
  function focus(view, id) { pendingFocus = { view, id }; applyFocus(); }

  function clearStage() {
    view3dObj?.dispose?.(); api?.dispose();
    api = null; view3dObj = null; lastPick = null; currentStop = null; tourIdx = -1;
    glHost.replaceChildren(); glLabels.replaceChildren();
    inspectPill.hidden = true; tourPill.hidden = true;
    view3d.classList.remove('gl-stereo');
    delete view3d.dataset.tourFocus;
    stereoBtn.setAttribute('aria-pressed', 'false'); spinBtn.setAttribute('aria-pressed', 'false');
    view3d.hidden = true; presets.hidden = true;
  }

  async function enable() {
    if (destroyed) return;
    wanted = true;
    if (lowG()) { clearStage(); setMode(mode2dKey); return; }
    if (api && view3dObj) { view3dObj.update(getState()); return; }
    if (loading) return loading;
    const request = ++generation;
    const stale = () => destroyed || !wanted || request !== generation || lowG();
    view3d.hidden = false; setMode('pb.mode.load');
    const job = (async () => {
      let sceneApi = null, built = null;
      try {
        sceneApi = await createScene(glHost, {
          lowGraphics: store.get().lowGraphics,
          reducedMotion: store.get().reducedMotion,
          vrStage: true,
          onTick: (now) => view3dObj?.tick?.(now),
          onAfterRender: (stereoOn) => view3dObj?.place?.(!stereoOn),
          onPick: (info) => { showInspect(info); onInspect?.(info); },
        });
        if (stale()) { sceneApi.dispose(); return; }
        sceneApi.renderer.domElement.setAttribute('aria-label', t(ariaKey));
        sceneApi.renderer.domElement.dataset.kAria = ariaKey;
        const result = create3dView(sceneApi, glLabels);
        built = typeof result?.then === 'function' ? await result : result;
        if (stale() || !built) {
          built?.dispose?.(); sceneApi.dispose(); glLabels.replaceChildren(); return;
        }
        api = sceneApi; view3dObj = built; sceneApi = null; built = null;
        view3dObj.update(getState());
        presets.hidden = false; setMode(mode3dKey); applyFocus();
      } catch {
        built?.dispose?.(); sceneApi?.dispose();
        if (request === generation && !destroyed) { clearStage(); setMode(mode2dKey); }
        else if (!api) glLabels.replaceChildren();
      }
    })();
    loading = job;
    await job;
    if (loading === job) loading = null;
    // If a tab was closed and reopened during loading, build only the latest request.
    if (!destroyed && wanted && request !== generation && !lowG() && !api) return enable();
  }

  function disable() {
    wanted = false; generation++;
    clearStage();
  }

  const offStore = store.subscribe((_s, keys) => {
    if (keys.includes('lowGraphics') || keys.includes('reducedMotion')) {
      disable();
      if (!destroyed && !view3d.closest('.tabpanel')?.hidden) enable();
    }
  });

  return {
    enable,
    disable,
    update(S) { view3dObj?.update(S); },
    focus,
    relabel() {
      view3dObj?.relabel?.();
      if (lastPick && !inspectPill.hidden) inspectPill.textContent = pair(lastPick.en, lastPick.hi);
      if (currentStop && !tourPill.hidden) tourPill.textContent = `🥽 (${tourIdx + 1}/${stops.length}) ${pair(currentStop.en, currentStop.hi)}`;
      modeNote.textContent = t(modeNote.dataset.k || mode2dKey);
    },
    destroy() { destroyed = true; offStore(); disable(); },
  };
}
