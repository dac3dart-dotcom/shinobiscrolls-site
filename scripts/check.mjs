import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const required = ['index.html', 'styles.css', 'app.js', 'src/config/branding.js', 'src/config/languages.js', 'src/config/bookIndex.en.js', 'src/config/bookIndex.ja.js', 'src/config/bookIndex.es.js', 'src/config/bookIndex.fr.js', 'src/config/bookIndex.de.js', 'src/config/bookIndex.ro.js', 'src/i18n/en.js', 'src/config/siteConfig.js', 'public/branding/navigation/shuriken.png', 'public/branding/navigation/crow.png', 'public/branding/navigation/fire.png', 'public/branding/navigation/katana-left.png', 'public/branding/navigation/katana-right.png', 'public/branding/navigation/senbon.png', 'public/branding/text/title.png', 'public/branding/text/subtitle.png', 'public/branding/text/author-line.png'];
for (const file of required) await access(resolve(root, file));
const html = await readFile(resolve(root, 'index.html'), 'utf8');
const js = await readFile(resolve(root, 'app.js'), 'utf8');
if (!html.includes('Densetsu No Shinobi No Sho') || !js.includes('languages') || !js.includes('pdfPath')) throw new Error('Required site configuration is missing.');
console.log(`Checked ${required.length} required site files.`);
