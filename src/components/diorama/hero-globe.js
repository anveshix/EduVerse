// Home's illustrative Three.js globe. Coastlines use the bundled Natural Earth
// texture; the scene is decorative and must not be used as a navigation map.
import { makeToolkit } from './toolkit.js';

export function createHeroGlobe3d(api, { textureUrl = null, reducedMotion = false } = {}) {
  const tk = makeToolkit(api, null);
  const { THREE, group } = tk;
  api.target.set(0, 0, 0);
  const globe = new THREE.Group();
  group.add(globe);
  globe.rotation.y = -2.4;

  const radius = 4.1;
  const material = new THREE.MeshStandardMaterial({ color: 0x327c91, roughness: 0.78, metalness: 0.08 });
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, 64, 40), material);
  globe.add(sphere);
  // Let the surface block raycasts to markers on the far side of the globe.
  api.markPickable?.(sphere, null);
  let texture = null, disposed = false;
  if (textureUrl) {
    try {
      texture = new THREE.TextureLoader().load(textureUrl, (loaded) => {
        if (disposed) { loaded.dispose(); return; }
        loaded.colorSpace = THREE.SRGBColorSpace;
        material.map = loaded; material.color.setHex(0xffffff); material.needsUpdate = true;
        api.invalidate();
      }, undefined, () => { /* The plain sphere remains usable if the texture cannot load. */ });
    } catch { /* Keep the untextured globe rather than failing the home page. */ }
  }

  // Approximate positions illustrate the subjects; they are not official locations or boundaries.
  const spots = [
    { lat: 28, lon: 84, en: 'Himalayan landscapes', hi: 'हिमालयी भू-दृश्य', theme: 'T02' },
    { lat: 5, lon: 82, en: 'Indian Ocean', hi: 'हिंद महासागर', theme: 'T10' },
    { lat: 43, lon: 66, en: 'Historic trade routes', hi: 'ऐतिहासिक व्यापार मार्ग', theme: 'T13' },
  ];
  for (const spot of spots) {
    const phi = (spot.lon + 180) * Math.PI / 180, theta = (90 - spot.lat) * Math.PI / 180;
    const direction = new THREE.Vector3(-Math.cos(phi) * Math.sin(theta), Math.cos(theta), Math.sin(phi) * Math.sin(theta));
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 12), new THREE.MeshStandardMaterial({ color: 0xffd47a, emissive: 0xa5530c, emissiveIntensity: 0.5 }));
    dot.position.copy(direction).multiplyScalar(radius + 0.06); globe.add(dot);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.025, 8, 32), new THREE.MeshBasicMaterial({ color: 0xffe6a2 }));
    ring.position.copy(direction).multiplyScalar(radius + 0.09);
    ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);
    globe.add(ring);
    tk.pick(dot, spot.en, spot.hi, { theme: spot.theme });
    tk.pick(ring, spot.en, spot.hi, { theme: spot.theme });
  }
  const orbit = new THREE.Mesh(new THREE.TorusGeometry(5.15, 0.025, 8, 96), new THREE.MeshBasicMaterial({ color: 0xf2b95e, transparent: true, opacity: 0.72 }));
  orbit.rotation.set(1.1, -0.25, 0.32); group.add(orbit);
  const orbit2 = new THREE.Mesh(new THREE.TorusGeometry(5.55, 0.012, 8, 96), new THREE.MeshBasicMaterial({ color: 0x9dd8d3, transparent: true, opacity: 0.24 }));
  orbit2.rotation.set(1.3, 0.2, -0.25); group.add(orbit2);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(4.32, 48, 32), new THREE.MeshBasicMaterial({ color: 0x6bc9c0, transparent: true, opacity: 0.09, side: THREE.BackSide }));
  group.add(glow);

  let spinning = !reducedMotion;
  api.setPlaying(spinning);
  api.invalidate();
  return {
    update() {}, place() {}, relabel() {},
    setReducedMotion(value) { spinning = !value; api.setPlaying(spinning); api.invalidate(); },
    tick(_now, dt) { if (spinning) { globe.rotation.y += dt * 0.06; api.invalidate(); } },
    dispose() { disposed = true; texture?.dispose(); tk.dispose(); },
  };
}
