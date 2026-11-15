// Generate the decorative equirectangular Earth texture from the bundled,
// public-domain Natural Earth 110m land polygons. This is not an official map.
import fs from 'node:fs';

const { land } = JSON.parse(fs.readFileSync('data/geo/land.simplified.json', 'utf8'));
const width = 2048, height = 1024;
const coord = ([lon, lat]) => `${((lon + 180) * width / 360).toFixed(1)},${((90 - lat) * height / 180).toFixed(1)}`;
const paths = land.map((polygon) => `<path d="${polygon.map((ring) => `M${ring.map(coord).join(' ')}Z`).join(' ')}"/>`).join('');
const longitudeLines = Array.from({ length: 12 }, (_, i) => `<path d="M${i * 171},0V1024"/>`).join('');
const latitudeLines = Array.from({ length: 6 }, (_, i) => `<path d="M0,${i * 171}H2048"/>`).join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<title>Stylised Earth texture from Natural Earth 110m land</title>
<defs><linearGradient id="ocean" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#286887"/><stop offset=".5" stop-color="#1c7790"/><stop offset="1" stop-color="#245875"/></linearGradient></defs>
<path fill="url(#ocean)" d="M0 0H2048V1024H0Z"/>
<g fill="none" stroke="#b7e5dc" stroke-width="1.2" opacity=".21">${longitudeLines}${latitudeLines}</g>
<g fill="#c1d9bb" stroke="#93bdb0" stroke-width="1.3" stroke-linejoin="round" fill-rule="evenodd">${paths}</g></svg>
`;
fs.writeFileSync('assets/images/globe-world.svg', svg);
console.log(`assets/images/globe-world.svg: ${land.length} simplified land polygons`);
