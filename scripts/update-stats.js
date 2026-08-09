#!/usr/bin/env node
/**
 * update-stats.js
 * Descarga los stats y logros de TODOS los jugadores usando la API de Pterodactyl.
 * Los combina en un solo archivo `src/server_data.json` para que el panel los consuma.
 */

const fs   = require('fs');
const path = require('path');

// ── Leer .env sin dependencias extra ──
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && !k.startsWith('#') && v.length) {
      process.env[k.trim()] = v.join('=').trim();
    }
  });
}

const {
  PTERO_PANEL_URL = 'https://panel.baires.host',
  PTERO_API_KEY,
  PTERO_SERVER_ID = '044fe798',
  SERVER_ROOT     = '/',
} = process.env;

if (!PTERO_API_KEY) {
  console.error('\n❌  Falta la API key. Completá PTERO_API_KEY en el archivo .env');
  process.exit(1);
}

const WORLD        = path.posix.join(SERVER_ROOT, 'world', 'players');
const OUT_FILE     = path.join(__dirname, '..', 'src', 'server_data.json');

const headers = {
  'Authorization': `Bearer ${PTERO_API_KEY}`,
  'Accept':        'application/json',
};

// Obtiene la lista de archivos de un directorio
async function listDirectory(directory) {
  const apiUrl = `${PTERO_PANEL_URL}/api/client/servers/${PTERO_SERVER_ID}/files/list?directory=${encodeURIComponent(directory)}`;
  const res = await fetch(apiUrl, { headers });
  if (!res.ok) {
    if (res.status === 404) return []; // Si no existe el directorio, devolvemos vacío
    const body = await res.text().catch(() => '');
    throw new Error(`Error listando ${directory}: ${res.status} ${body.slice(0, 120)}`);
  }
  const json = await res.json();
  return (json.data || []).map(f => f.attributes.name).filter(n => n.endsWith('.json'));
}

// Descarga el contenido de un archivo
async function downloadFileContent(remotePath) {
  const apiUrl = `${PTERO_PANEL_URL}/api/client/servers/${PTERO_SERVER_ID}/files/download?file=${encodeURIComponent(remotePath)}`;
  const res = await fetch(apiUrl, { headers });
  if (!res.ok) {
    if (res.status === 404) return null;
    const body = await res.text().catch(() => '');
    throw new Error(`Error obteniendo link para ${remotePath}: ${res.status} ${body.slice(0, 120)}`);
  }
  const { attributes } = await res.json();
  if (!attributes?.url) return null;

  const fileRes = await fetch(attributes.url);
  if (!fileRes.ok) {
    if (fileRes.status === 404) return null;
    throw new Error(`Error descargando ${remotePath}: ${fileRes.status}`);
  }
  return fileRes.text();
}

async function main() {
  console.log(`\n🔗  Panel: ${PTERO_PANEL_URL}  |  Server: ${PTERO_SERVER_ID}\n`);
  try {
    console.log('🔍  Buscando jugadores en el servidor...');
    const statsFiles = await listDirectory(path.posix.join(WORLD, 'stats'));
    
    // Obtenemos todos los UUIDs (quitando el .json)
    const uuids = [...new Set(statsFiles.map(f => f.replace('.json', '')))];
    console.log(`👥  Se encontraron ${uuids.length} jugadores.`);

    const serverData = {};

    console.log('⏳  Descargando caché de usuarios...');
    const usercacheRaw = await downloadFileContent(path.posix.join(SERVER_ROOT, 'usercache.json'));
    let usercache = [];
    if (usercacheRaw) {
      try { usercache = JSON.parse(usercacheRaw); } catch(e) {}
    }

    for (const uuid of uuids) {
      console.log(`⏳  Descargando datos de ${uuid}...`);
      const cached = usercache.find(u => u.uuid === uuid);
      serverData[uuid] = { stats: null, logros: null, username: cached ? cached.name : null };

      const statsRaw = await downloadFileContent(path.posix.join(WORLD, 'stats', `${uuid}.json`));
      if (statsRaw) {
        try { serverData[uuid].stats = JSON.parse(statsRaw); } catch(e) {}
      }

      const logrosRaw = await downloadFileContent(path.posix.join(WORLD, 'advancements', `${uuid}.json`));
      if (logrosRaw) {
        try { serverData[uuid].logros = JSON.parse(logrosRaw); } catch(e) {}
      }
    }

    // Guardamos el mega JSON
    const tmp = OUT_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(serverData), 'utf8');
    fs.renameSync(tmp, OUT_FILE);
    
    const kb = (fs.statSync(OUT_FILE).size / 1024).toFixed(1);
    console.log(`\n✅  Datos guardados en src/server_data.json (${kb} KB)`);
    console.log('🎉  Listo! Recargá el panel para ver los datos de todos los jugadores.\n');

  } catch (err) {
    console.error('\n❌  Error:', err.message);
    process.exit(1);
  }
}

main();
