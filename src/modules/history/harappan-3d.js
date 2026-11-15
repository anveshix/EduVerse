// T04.L4: a stylised composite teaching model, not a survey of any one site.
import * as i18n from '../../core/i18n.js';
import { harappanPlan } from '../../engines/domain/history.js';
import { stopFor, stopVisible } from './harappan-tour.js';

export function createHarappan3d(api, labelHost) {
  const { THREE, scene } = api;
  const group = new THREE.Group();
  scene.add(group);
  let labels = [];

  const clear = () => {
    api.clearPickables?.();
    for (const c of [...group.children]) {
      group.remove(c);
      c.traverse((o) => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
    }
  };

  function addLabel(v, id, en, hi, selected) {
    const el = document.createElement('span');
    el.className = 'gl-lbl';
    el.dataset.harappaLabel = id;
    el.textContent = `${selected ? '▶ ' : ''}${i18n.pair(en, hi)}`;
    labelHost.append(el);
    labels.push({ v, el, en, hi, selected });
  }
  function pick(mesh, id, en, hi) { api.markPickable?.(mesh, { tour: id, en, hi }); }
  function frame(x, y, z, w, h, d) {
    const geometry = new THREE.BoxGeometry(w, h, d);
    const edge = new THREE.EdgesGeometry(geometry);
    geometry.dispose();
    const outline = new THREE.LineSegments(edge, new THREE.LineBasicMaterial({ color: 0xffd43b }));
    outline.position.set(x, y, z); group.add(outline);
  }

  function update(S) {
    clear(); labelHost.replaceChildren(); labels = [];
    const plan = harappanPlan(S), selected = stopFor(S.tourStop);
    const brick = new THREE.MeshStandardMaterial({ color: 0xc27046, roughness: 0.9 });
    const darkBrick = new THREE.MeshStandardMaterial({ color: 0x9b5332, roughness: 0.92 });
    const earth = new THREE.MeshStandardMaterial({ color: 0xd9be8c, roughness: 0.95 });
    const water = new THREE.MeshStandardMaterial({ color: 0x2c8fb8, roughness: 0.3 });
    const roadMat = new THREE.MeshStandardMaterial({ color: 0xb99c70, roughness: 1 });
    const drainMat = new THREE.MeshStandardMaterial({ color: 0x4b5563, roughness: 0.9 });

    const box = (w, h, d, material, x, y, z) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
      mesh.position.set(x, y, z); group.add(mesh); return mesh;
    };
    box(17, 0.6, 12, earth, 0, -2.5, 0);

    // Raised western sector; its exact height and placement are illustrative.
    const citadel = box(6.2, 1.6, 9.6, darkBrick, -4.8, -1.4, 0);
    pick(citadel, 'raised', 'Raised sector (schematic)', 'ऊँचा भाग (योजनाबद्ध)');
    addLabel(new THREE.Vector3(-6.8, 0.3, 0), 'raised', 'Raised sector', 'ऊँचा भाग', selected.id === 'raised');

    if (plan.greatBath) {
      // A small open tank with two stylised stair flights; not to scale.
      box(3.8, 0.2, 3.1, brick, -4.8, -0.5, -1.8);
      box(0.28, 0.5, 3.1, brick, -6.56, -0.16, -1.8);
      box(0.28, 0.5, 3.1, brick, -3.04, -0.16, -1.8);
      box(3.25, 0.5, 0.28, brick, -4.8, -0.16, -3.21);
      box(3.25, 0.5, 0.28, brick, -4.8, -0.16, -0.39);
      const pool = box(2.9, 0.08, 2.1, water, -4.8, -0.36, -1.8);
      pick(pool, 'bath', 'Great Bath: interpretation of use is uncertain', 'विशाल स्नानागार: उपयोग की व्याख्या अनिश्चित');
      for (const side of [-1, 1]) for (let step = 0; step < 3; step++) {
        const stair = box(2.1, 0.12, 0.23, brick, -4.8, -0.09 - step * 0.1, -1.8 + side * (1.12 - step * 0.23));
        pick(stair, 'bath', 'Great Bath: interpretation of use is uncertain', 'विशाल स्नानागार: उपयोग की व्याख्या अनिश्चित');
      }
      addLabel(new THREE.Vector3(-4.8, 0.65, -1.8), 'bath', 'Great Bath', 'विशाल स्नानागार', selected.id === 'bath');
    }
    if (plan.granary) {
      // Retain the legacy toggle but not its formerly definite granary label.
      const platform = box(4.2, 1.2, 2.6, brick, -4.8, 0, 2.2);
      pick(platform, 'platform', 'Brick platform: use uncertain', 'ईंट चबूतरा: उपयोग अनिश्चित');
      addLabel(new THREE.Vector3(-4.8, 1.0, 2.2), 'platform', 'Brick platform · use uncertain', 'ईंट चबूतरा · उपयोग अनिश्चित', selected.id === 'platform');
    }

    // Six schematic blocks, matching the 2D plan; the chosen number of wells is repeated per block.
    if (plan.gridStreets) {
      const road = box(8.7, 0.05, 1.0, roadMat, 3.6, -2.18, 0);
      pick(road, 'streets', 'Aligned model blocks and street', 'संरेखित मॉडल खंड और सड़क');
      for (const x of [2.2, 5.0]) {
        const lane = box(0.7, 0.05, 9.0, roadMat, x, -2.18, 0);
        pick(lane, 'streets', 'Aligned model blocks and street', 'संरेखित मॉडल खंड और सड़क');
      }
    }
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        const jx = plan.gridStreets ? 0 : ((r + c) % 2 ? 0.5 : -0.45);
        const jz = plan.gridStreets ? 0 : (c % 2 ? -0.4 : 0.4);
        const x = 0.8 + c * 2.8 + jx, z = -2.65 + r * 5.3 + jz;
        const house = box(1.8, 1.0 + ((r + c) % 2) * 0.35, 1.9, brick, x, -1.7, z);
        pick(house, 'streets', 'Schematic neighbourhood block', 'योजनाबद्ध मोहल्ला खंड');
        for (let w = 0; w < plan.wells; w++) {
          const well = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.42, 12), darkBrick);
          well.position.set(x - 0.55 + w * 0.55, -1.98, z + 1.12); group.add(well);
          pick(well, 'wells', 'Illustrated well; count is invented', 'चित्रित कुआँ; संख्या काल्पनिक है');
          const opening = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 12), water);
          opening.position.set(x - 0.55 + w * 0.55, -1.75, z + 1.12); group.add(opening);
          pick(opening, 'wells', 'Illustrated well; count is invented', 'चित्रित कुआँ; संख्या काल्पनिक है');
        }
      }
    }
    addLabel(new THREE.Vector3(3.6, -0.3, -3), 'streets', plan.gridStreets ? 'Aligned blocks' : 'Staggered blocks', plan.gridStreets ? 'संरेखित खंड' : 'अव्यवस्थित खंड', selected.id === 'streets');
    if (plan.wells) addLabel(new THREE.Vector3(0.8, -1.0, -1.53), 'wells', 'Illustrated wells', 'चित्रित कुएँ', selected.id === 'wells');

    if (plan.coveredDrains) {
      const drain = box(8.5, 0.16, 0.32, drainMat, 3.6, -2.08, 0);
      pick(drain, 'drains', 'Covered drain: wastewater interpretation', 'ढकी नाली: अपशिष्ट जल की व्याख्या');
      addLabel(new THREE.Vector3(3.8, -1.4, 0.5), 'drains', 'Covered drain', 'ढकी नाली', selected.id === 'drains');
    }

    if (stopVisible(selected, plan)) {
      const frames = {
        raised: [-4.8, -1.1, 0, 6.5, 2.2, 9.9],
        bath: [-4.8, -0.15, -1.8, 4.0, 0.9, 3.3],
        platform: [-4.8, 0, 2.2, 4.4, 1.4, 2.8],
        streets: [3.6, -1.5, 0, 9.6, 2.2, 9.5],
        drains: [3.6, -2.0, 0, 8.8, 0.5, 0.65],
        wells: [0.8, -1.9, -1.53, 1.9, 0.7, 0.7],
      };
      frame(...frames[selected.id]);
    }
    api.invalidate();
  }

  function place(showLabels) {
    for (const l of labels) {
      const q = api.project(l.v);
      l.el.style.transform = `translate(${q.x.toFixed(0)}px,${q.y.toFixed(0)}px) translate(-50%,-50%)`;
      l.el.hidden = !showLabels || !q.visible;
    }
  }
  const relabel = () => labels.forEach((l) => { l.el.textContent = `${l.selected ? '▶ ' : ''}${i18n.pair(l.en, l.hi)}`; });
  return { update, place, relabel, dispose() { clear(); labelHost.replaceChildren(); scene.remove(group); } };
}
