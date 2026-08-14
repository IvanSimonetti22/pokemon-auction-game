const fs = require('fs');
const https = require('https');
const path = require('path');

const BASE_URL = 'https://cdn.jsdelivr.net/gh/InventivetalentDev/minecraft-assets@1.20.4/assets/minecraft/textures/';
const OUT_DIR = path.join(__dirname, 'public', 'assets', 'particles');

const filesToDownload = {
  'azalea_leaves.png': 'block/azalea_leaves.png',
  'heart.png': 'particle/heart.png',
  'cherry_0.png': 'particle/cherry_0.png',
  'soul_fire_flame.png': 'particle/soul_fire_flame.png',
  'critical_hit.png': 'particle/critical_hit.png',
  'totem_of_undying.png': 'item/totem_of_undying.png',
  'glint.png': 'particle/glint.png',
  'spell_0.png': 'particle/spell_0.png',
  'generic_4.png': 'particle/generic_4.png',
  'nautilus.png': 'particle/nautilus.png'
};

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function download() {
  for (const [filename, githubPath] of Object.entries(filesToDownload)) {
    const url = BASE_URL + githubPath;
    const dest = path.join(OUT_DIR, filename);
    
    console.log(`Downloading ${url}...`);
    
    await new Promise((resolve, reject) => {
      https.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
      }, (res) => {
        if (res.statusCode !== 200) {
          console.error(`Failed to download ${filename}: HTTP ${res.statusCode}`);
          resolve(); // skip
          return;
        }
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`Saved ${filename}`);
          resolve();
        });
      }).on('error', (err) => {
        console.error(`Error downloading ${filename}: ${err.message}`);
        resolve();
      });
    });
  }
}

download().then(() => console.log('Done!'));
