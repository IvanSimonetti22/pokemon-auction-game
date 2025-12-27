// 📂 server/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    // 🔥 CAMBIO CRÍTICO: Permitir que Vercel se conecte
    origin: "*", // El asterisco permite acceso desde cualquier lugar (Vercel)
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

// 🔥 CONFIGURACIÓN DE PRUEBAS
const TEST_MODE = false;
const FORCED_SPAWNS = ['charizard', 'gengar', 'lucario', 'salamence', 'metagross'];

const PSEUDO_LEGENDARIES = [
  'dragonite', 'tyranitar', 'salamence', 'metagross', 'garchomp',
  'hydreigon', 'goodra', 'kommo-o', 'dragapult', 'baxcalibur'
];

const ULTRA_BEASTS = [
  'nihilego', 'buzzwole', 'pheromosa', 'xurkitree', 'celesteela',
  'kartana', 'guzzlord', 'poipole', 'naganadel', 'stakataka', 'blacephalon'
];

const TYPE_TRANSLATIONS = {
  normal: 'Normal', fighting: 'Pelea', flying: 'Volador', poison: 'Veneno',
  ground: 'Tierra', rock: 'Roca', bug: 'Insecto', ghost: 'Fantasma',
  steel: 'Acero', fire: 'Fuego', water: 'Agua', grass: 'Planta',
  electric: 'Eléctrico', psychic: 'Psíquico', ice: 'Hielo', dragon: 'Dragón',
  dark: 'Siniestro', fairy: 'Hada'
};

// 💎 MASTER LIST DE OBJETOS (SIN COVERT CLOAK)
const MASTER_ITEM_LIST = [
  'life-orb', 'choice-band', 'choice-specs', 'choice-scarf', 'expert-belt',
  'muscle-band', 'wise-glasses', 'scope-lens', 'wide-lens', 'zoom-lens',
  'razor-claw', 'weakness-policy', 'throat-spray', 'white-herb', 'power-herb',
  'leftovers', 'black-sludge', 'rocky-helmet', 'assault-vest', 'eviolite',
  'focus-sash', 'heavy-duty-boots', 'safety-goggles', 'air-balloon',
  'eject-button', 'red-card', 'shell-bell', 'light-clay', 'mirror-herb',
  'loaded-dice', 'kings-rock', 'quick-claw', 'flame-orb', 'toxic-orb', // covert-cloak eliminado
  'sitrus-berry', 'lum-berry', 'salac-berry', 'liechi-berry', 'petaya-berry',
  'apicot-berry', 'custap-berry', 'chesto-berry'
];

// 🔥 SISTEMA DE DUPLICADOS
const seenPokemonNames = new Set();
const MEGA_STONES = {
  'venusaur': ['venusaurite'],
  'charizard': ['charizardite-x', 'charizardite-y'],
  'blastoise': ['blastoisinite'],
  'beedrill': ['beedrillite'],
  'pidgeot': ['pidgeotite'],
  'alakazam': ['alakazite'],
  'slowbro': ['slowbronite'],
  'gengar': ['gengarite'],
  'kangaskhan': ['kangaskhanite'],
  'pinsir': ['pinsirite'],
  'gyarados': ['gyaradosite'],
  'aerodactyl': ['aerodactylite'],
  'mewtwo': ['mewtwonite-x', 'mewtwonite-y'],
  'ampharos': ['ampharosite'],
  'steelix': ['steelixite'],
  'scizor': ['scizorite'],
  'heracross': ['heracronite'],
  'houndoom': ['houndoominite'],
  'tyranitar': ['tyranitarite'],
  'sceptile': ['sceptilite'],
  'blaziken': ['blazikenite'],
  'swampert': ['swampertite'],
  'gardevoir': ['gardevoirite'],
  'sableye': ['sablenite'],
  'mawile': ['mawilite'],
  'aggron': ['aggronite'],
  'medicham': ['medichamite'],
  'manectric': ['manectite'],
  'sharpedo': ['sharpedonite'],
  'camerupt': ['cameruptite'],
  'altaria': ['altarianite'],
  'banette': ['banettite'],
  'absol': ['absolite'],
  'glalie': ['glalitite'],
  'salamence': ['salamencite'],
  'metagross': ['metagrossite'],
  'latias': ['latiasite'],
  'latios': ['latiosite'],
  'rayquaza': ['dragon-scale'], // Hack: Rayquaza no usa piedra, pero por flavor
  'lopunny': ['lopunnite'],
  'garchomp': ['garchompite'],
  'lucario': ['lucarionite'],
  'abomasnow': ['abomasite'],
  'gallade': ['galladite'],
  'audino': ['audinite'],
  'diancie': ['diancite']
};

let persistentData = {};
let activeSockets = {};
let playersState = {};

let gameState = {
  status: 'lobby',
  phase: 'pokemon',
  currentAuction: null,
  pokemonPool: [],
  itemPool: [],
  timer: 0,
  highestBid: 0,
  highestBidder: null,
  roundsPlayed: 0
};

// --- BUFFER DE POKÉMON ---
let pokemonBuffer = []; // Cola de Pokémon listos para salir
const BUFFER_SIZE = 2;  // Cuántos Pokémon queremos tener adelantados
let isFetching = false; // Semáforo para no saturar la API
// --------------------------

let gameStatus = 'lobby'; // 'lobby', 'playing', 'management'
let hostId = null;        // ID del socket del líder de la sala
let gameSettings = {      // Configuración por defecto
  mode: 'competitivo',  // 'iniciales', 'competitivo', 'random', etc.
  region: 'all'
};

// LISTA DE PRECIOS DE TIENDA (Debe coincidir con el frontend)
const SHOP_PRICES = {
  'leftovers': 2000,
  'life-orb': 1500,
  'choice-scarf': 1000,
  'focus-sash': 1000,
  'sitrus-berry': 500
};

// Nombres para SHOWDOWN (Inglés)
const SHOP_NAMES_EN = {
  'leftovers': 'Leftovers',
  'life-orb': 'Life Orb',
  'choice-scarf': 'Choice Scarf',
  'focus-sash': 'Focus Sash',
  'sitrus-berry': 'Sitrus Berry'
};

// Nombres para la INTERFAZ (Español)
const SHOP_NAMES_ES = {
  'leftovers': 'Restos',
  'life-orb': 'Vidasfera',
  'choice-scarf': 'Pañuelo Elección',
  'focus-sash': 'Banda Focus',
  'sitrus-berry': 'Baya Zidra'
};

let timerInterval = null;
let nextRoundTimeout = null;

const stopGameFull = () => {
  console.log("💀 RESETEANDO SERVIDOR...");
  clearInterval(timerInterval);
  clearTimeout(nextRoundTimeout);
  gameState = {
    status: 'lobby', phase: 'pokemon', currentAuction: null,
    pokemonPool: [], itemPool: [], timer: 0, highestBid: 0, highestBidder: null
  };
  persistentData = {};
  seenPokemonNames.clear(); // 🔥 LIMPIAR LISTA DE VISTOS
  Object.keys(playersState).forEach(nick => { playersState[nick].isReady = false; });
  activeSockets = {};
  io.emit('game_reset');
};

// --- FUNCIÓN DE GENERACIÓN (Un solo Pokémon) ---
const fetchPokemonData = async (mode = 'competitivo', region = 'all') => {
  try {
    // Intentos para encontrar uno no repetido
    for (let i = 0; i < 5; i++) {
      let targetNameOrId;
      if (TEST_MODE && Math.random() < 0.3) {
        targetNameOrId = FORCED_SPAWNS[Math.floor(Math.random() * FORCED_SPAWNS.length)];
      } else {
        targetNameOrId = Math.floor(Math.random() * 905) + 1;
      }

      const speciesRes = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${targetNameOrId}`);
      const baseSpeciesData = speciesRes.data;
      let finalName = baseSpeciesData.name;

      // 🔥 FIX COSMOEM: SIEMPRE buscamos la evolución final, incluso para legendarios
      // Esto arregla que slaga Cosmog/Cosmoem en lugar de Solgaleo/Lunala
      // Y asegura que siempre tengamos la forma más fuerte disponible.
      const evoRes = await axios.get(baseSpeciesData.evolution_chain.url);
      const possibleFinals = getAllFinalEvolutions(evoRes.data.chain);
      finalName = possibleFinals[Math.floor(Math.random() * possibleFinals.length)];

      // 🔥 VALIDAR DUPLICADOS
      if (seenPokemonNames.has(finalName)) {
        console.log(`♻️ Duplicado evitado: ${finalName}`);
        continue; // Reintentar otro
      }

      // Si pasamos la validación, procedemos
      const finalPokemonRes = await axios.get(`https://pokeapi.co/api/v2/pokemon/${finalName}`);
      const finalData = finalPokemonRes.data;
      const finalSpeciesRes = await axios.get(finalData.species.url);

      const nameEntry = finalSpeciesRes.data.names.find(n => n.language.name === 'es');
      const finalDisplayName = nameEntry ? nameEntry.name : finalData.name;

      const stats = finalData.stats.map(s => ({
        name: s.stat.name.replace('hp', 'HP').replace('attack', 'Ataque').replace('defense', 'Defensa').replace('special-attack', 'Atq. Esp').replace('special-defense', 'Def. Esp').replace('speed', 'Velocidad'),
        value: s.base_stat
      }));

      const abilities = await Promise.all(finalData.abilities.map(async (a) => {
        try {
          const abRes = await axios.get(a.ability.url);
          const abilityData = abRes.data;
          const spaEntry = abilityData.names.find(n => n.language.name === 'es');
          const displayName = spaEntry ? spaEntry.name : abilityData.name;
          const engEntry = abilityData.names.find(n => n.language.name === 'en');
          const engName = engEntry ? engEntry.name : abilityData.name;
          const flavor = abilityData.flavor_text_entries.find(f => f.language.name === 'es');
          return { name: displayName, engName: engName, isHidden: a.is_hidden, description: flavor ? flavor.flavor_text : "..." };
        } catch { return { name: a.ability.name, engName: a.ability.name, description: "...", isHidden: a.is_hidden }; }
      }));

      const types = finalData.types.map(t => ({ original: t.type.name, translated: TYPE_TRANSLATIONS[t.type.name] || t.type.name }));
      const sprites = finalData.sprites.other['official-artwork'];
      let isShiny = TEST_MODE ? true : Math.floor(Math.random() * 4096) === 0;

      let price = 100;
      let rarity = 'comun';
      if (ULTRA_BEASTS.includes(finalData.name)) { price = 800; rarity = 'ultraente'; }
      else if (finalSpeciesRes.data.is_mythical) { price = 1500; rarity = 'singular'; }
      else if (finalSpeciesRes.data.is_legendary) { price = 1000; rarity = 'legendario'; }
      else if (PSEUDO_LEGENDARIES.includes(finalData.name)) { price = 500; rarity = 'pseudolegendario'; }

      // 🔥 REGISTRAR COMO VISTO
      seenPokemonNames.add(finalName);

      return {
        id: `poke-${Date.now()}-${Math.random()}`,
        type: 'pokemon',
        name: finalData.name,
        displayName: finalDisplayName,
        sprite: isShiny ? (sprites.front_shiny || sprites.front_default) : sprites.front_default,
        miniSprite: isShiny ? (finalData.sprites.front_shiny || finalData.sprites.front_default) : finalData.sprites.front_default,
        rarity, basePrice: price, stats, abilities, types,
        cry: finalData.cries ? finalData.cries.latest : null,
        isShiny, heldItem: null
      };
    }
    return null; // Falló tras 5 intentos (raro)
  } catch (e) {
    console.error("Error fetching pokemon:", e.message);
    return null;
  }
};

// --- FUNCIÓN DE PRE-CARGA (BUFFER) ---
async function fillPokemonBuffer() {
  // 🛑 AGREGAR ESTO: Si ya no estamos en fase pokemon, no hacer nada.
  if (gameState.phase !== 'pokemon') return;

  if (isFetching) return;
  if (pokemonBuffer.length >= BUFFER_SIZE) return;

  isFetching = true;
  try {
    console.log(`[BUFFER] Rellenando... (Actual: ${pokemonBuffer.length})`);
    while (pokemonBuffer.length < BUFFER_SIZE) {
      const newPokemon = await fetchPokemonData(gameSettings.mode, gameSettings.region);
      if (newPokemon) {
        pokemonBuffer.push(newPokemon);
      } else {
        // Breve pausa si falló (para no saturar si hay error de red)
        await new Promise(r => setTimeout(r, 500));
      }
    }
    console.log(`[BUFFER] Listo. Pokémon en espera: ${pokemonBuffer.length}`);
  } catch (error) {
    console.error("Error rellenando buffer:", error);
  } finally {
    isFetching = false;
  }
}

const handleDisconnect = (socketId) => {
  const key = activeSockets[socketId];
  if (key) {
    delete activeSockets[socketId];

    const remainingIds = Object.keys(activeSockets);

    // CASO 1: SALA VACÍA (Reset Total)
    if (remainingIds.length === 0) {
      console.log("💀 Sala vacía. Reiniciando servidor...");
      stopGameFull(); // Usamos la función existente que ya resetea todo
      gameStatus = 'lobby'; // Aseguramos estado
      hostId = null;
    }
    // CASO 2: QUEDAN JUGADORES (Reasignar Host)
    else {
      // Si el que se fue era el host, le pasamos la corona al siguiente
      if (socketId === hostId) {
        hostId = remainingIds[0];
        io.emit('host_changed', hostId);
      }
      broadcastPlayerList();
    }
  }
};

const getAllFinalEvolutions = (chain, finals = []) => {
  if (!chain.evolves_to || chain.evolves_to.length === 0) finals.push(chain.species.name);
  else chain.evolves_to.forEach(evo => getAllFinalEvolutions(evo, finals));
  return finals;
};

// (El generador de pool se eliminó a favor del buffer)

const generateItemPool = async (numPlayers) => {
  const poolSize = numPlayers * 4;
  let pool = [];
  console.log(`💎 Generando OBJETOS...`);
  const shuffled = MASTER_ITEM_LIST.sort(() => 0.5 - Math.random()).slice(0, poolSize);

  for (const itemName of shuffled) {
    try {
      const res = await axios.get(`https://pokeapi.co/api/v2/item/${itemName}`);
      const data = res.data;
      const nameEntry = data.names.find(n => n.language.name === 'es');
      const displayName = nameEntry ? nameEntry.name : data.name;
      const esEntries = data.flavor_text_entries.filter(f => f.language.name === 'es');
      let description = esEntries.length > 0 ? esEntries[esEntries.length - 1].text : "Sin descripción.";
      description = description.replace(/[\n\f]/g, ' ');
      const sprite = data.sprites.default || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
      let price = 500;
      if (['life-orb', 'choice-band', 'choice-specs', 'choice-scarf', 'leftovers'].includes(itemName)) price = 1000;

      pool.push({
        id: `item-${pool.length}-${itemName}`,
        type: 'item',
        name: data.name,
        displayName: displayName,
        sprite: sprite,
        description: description,
        basePrice: price,
        rarity: 'comun',
        isShiny: false
      });
    } catch (e) { }
  }
  return pool;
};

const startGame = async () => {
  const numPlayers = Object.keys(activeSockets).length;
  if (numPlayers === 0) return;
  io.emit('chat_message', { user: 'SISTEMA', text: '🏆 Generando Mercado...', type: 'system' });
  try {
    // 🔥 USAMOS BUFFER EN LUGAR DE POOL GIGANTE
    // Aseguramos que haya algo en el buffer antes de empezar
    if (pokemonBuffer.length === 0) await fillPokemonBuffer();

    // Items siguen igual (son rápidos)
    const items = await generateItemPool(numPlayers);
    gameState.itemPool = items;
    gameState.phase = 'pokemon';

    io.emit('chat_message', { user: 'SISTEMA', text: '¡Comienza la Fase de Selección!', type: 'system' });
    io.emit('game_starting');

    // Ya no esperamos 3s, el cliente maneja transiciones. Pero un pequeño delay ayuda.
    setTimeout(startRound, 1000);
  } catch (e) { console.error(e); stopGameFull(); }
};

const startRound = async () => {
  // Si no hay jugadores, pausamos
  const activePlayerIds = Object.keys(activeSockets);
  const playerCount = activePlayerIds.length;
  if (playerCount === 0) return;

  // LÍMITE DE RONDAS: 8 por cada jugador conectado
  const MAX_ROUNDS = playerCount * 8;

  let nextThing = null;

  // =================================================
  // 🐾 FASE 1: SUBASTA DE POKÉMON
  // =================================================
  if (gameState.phase === 'pokemon') {
    // Verificar condiciones de fin de fase:
    // A) Todos tienen 6 pokémon (Inventario lleno)
    const allFull = activePlayerIds.every(id =>
      persistentData[activeSockets[id]].inventory.length >= 6
    );
    // B) Se alcanzó el límite de rondas (8 * Jugadores)
    const limitReached = gameState.roundsPlayed >= MAX_ROUNDS;

    // SI SE CUMPLE CUALQUIERA -> CAMBIO DE FASE
    if (allFull || limitReached) {
      console.log(`--- CAMBIO DE FASE (Rondas: ${gameState.roundsPlayed}/${MAX_ROUNDS} | Full: ${allFull}) ---`);

      gameState.phase = 'items';
      gameState.roundsPlayed = 0; // RESETEAR CONTADOR PARA LA SIGUIENTE FASE
      pokemonBuffer = [];

      io.emit('phase_transition', { phaseName: "OBJETOS EQUIPABLES" });
      setTimeout(startRound, 5000);
      return;
    }

    // Obtener siguiente Pokémon
    if (pokemonBuffer.length > 0) {
      nextThing = pokemonBuffer.shift();
      fillPokemonBuffer();
    } else {
      nextThing = await fetchPokemonData(gameSettings.mode, gameSettings.region);
    }
  }
  // =================================================
  // 💎 FASE 2: SUBASTA DE OBJETOS (ITEMS)
  // =================================================
  else if (gameState.phase === 'items') {
    const limitReached = gameState.roundsPlayed >= MAX_ROUNDS;
    const poolEmpty = gameState.itemPool.length === 0;

    if (limitReached || poolEmpty) {
      console.log("--- FIN DE ITEMS -> MESA DE TRABAJO ---");

      // 1. CAMBIO DE ESTADO (CRUCIAL para quitar la pantalla de subasta)
      gameState.phase = 'management';   // <--- Esto obliga a React a cambiar de vista
      gameState.status = 'management';
      gameState.currentAuction = null;

      // 2. EVENTO ORIGINAL (El que ya funcionaba visualmente)
      // Esto cierra la subasta y muestra el mensaje final
      io.emit('round_ended', { message: "MERCADO CERRADO - FINALIZADO" });

      // 3. ACTUALIZACIÓN GLOBAL
      // Aseguramos que todos reciban el nuevo 'gameState.phase'
      io.emit('update_game', gameState);

      return; // Fin del bucle
    }

    nextThing = gameState.itemPool.shift();
  }

  // =================================================
  // 🚀 EMITIR LA RONDA (Común)
  // =================================================
  if (nextThing) {
    // INCREMENTAMOS CONTADOR DE RONDAS
    gameState.roundsPlayed++;

    console.log(`Iniciando Ronda ${gameState.roundsPlayed} / ${MAX_ROUNDS} (Fase: ${gameState.phase})`);

    let time = 15;
    if (['legendario', 'singular', 'ultraente'].includes(nextThing.rarity)) time = 20;

    gameState.status = 'playing';
    gameState.currentAuction = nextThing;
    gameState.highestBid = nextThing.basePrice;
    gameState.highestBidder = null;
    gameState.timer = time;

    io.emit('new_pokemon', {
      pokemon: nextThing,
      timer: time,
      currentBid: nextThing.basePrice,
      roundInfo: `${gameState.roundsPlayed}/${MAX_ROUNDS}` // Info útil para el frontend
    });

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      gameState.timer--;
      io.emit('update_timer', gameState.timer);
      if (gameState.timer <= 0) endRound();
    }, 1000);
  } else {
    console.log("⚠️ Error: No se pudo obtener subasta. Reintentando...");
    setTimeout(startRound, 2000);
  }
};

// 🔥 GENERAR MEGAPÍEDRA (Helper)
const createMegaStoneItem = async (stoneId) => {
  try {
    const res = await axios.get(`https://pokeapi.co/api/v2/item/${stoneId}`);
    const data = res.data;
    const nameEntry = data.names.find(n => n.language.name === 'es');
    return {
      id: `item-mega-${Date.now()}`,
      type: 'item',
      name: data.name,
      displayName: nameEntry ? nameEntry.name : data.name, // "Megapiedra X"
      sprite: data.sprites.default,
      description: "Permite la Mega Evolución de un Pokémon específico durante el combate.",
      basePrice: 2000,
      rarity: 'legendario', // Para que brille
      isShiny: true // Para que destaque
    };
  } catch (e) {
    console.error("Error creating Mega Stone:", stoneId);
    return null;
  }
};

const endRound = async () => {
  clearInterval(timerInterval);
  if (Object.keys(activeSockets).length === 0) return;
  let msg = "Nadie ofertó.";
  let winner = null;

  if (gameState.highestBidder) {
    const key = gameState.highestBidder.toLowerCase();
    if (persistentData[key]) {
      persistentData[key].money -= gameState.highestBid;
      if (gameState.currentAuction.type === 'pokemon') {
        const wonPokemon = gameState.currentAuction;
        persistentData[key].inventory.push(wonPokemon);
        msg = `¡${persistentData[key].originalName} ganó a ${wonPokemon.displayName}!`;

        // 🔥 CHECK DE MEGAPÍEDRA
        // Si el Pokémon ganado tiene Mega, inyectamos la piedra al POOL DE ITEMS
        if (MEGA_STONES[wonPokemon.name]) {
          const possibleStones = MEGA_STONES[wonPokemon.name];
          const selectedStone = possibleStones[Math.floor(Math.random() * possibleStones.length)];

          console.log(`💎 Detectado Mega-Pokémon (${wonPokemon.name}). Inyectando ${selectedStone}...`);
          const megaItem = await createMegaStoneItem(selectedStone);
          if (megaItem) {
            // Lo ponemos en una posición aleatoria asegurada dentro del pool
            const randomIndex = Math.floor(Math.random() * gameState.itemPool.length);
            gameState.itemPool.splice(randomIndex, 0, megaItem);

            // Opcional: Avisar al chat
            io.emit('chat_message', { user: 'SISTEMA', text: `✨ ¡La presencia de ${wonPokemon.displayName} ha invocado una Megapiedra en algún lugar del mercado!`, type: 'system' });
          }
        }

      } else {
        persistentData[key].items.push(gameState.currentAuction);
        msg = `¡${persistentData[key].originalName} ganó: ${gameState.currentAuction.displayName}!`;
      }
      winner = persistentData[key].originalName;
    }
  }
  io.emit('round_ended', { message: msg, winner: winner });
  io.emit('chat_message', { user: 'SISTEMA', text: msg, type: 'system' });
  broadcastPlayerList();
  nextRoundTimeout = setTimeout(() => { if (Object.keys(activeSockets).length > 0) startRound(); }, 4000);
};

const broadcastPlayerList = () => {
  const list = Object.keys(activeSockets).map(id => {
    const k = activeSockets[id];
    return { ...persistentData[k], id, isReady: playersState[k]?.isReady, nickname: persistentData[k].originalName };
  });
  io.emit('update_players', list);
};

io.on('connection', (socket) => {
  // --- EVENTOS DEL LOBBY ---

  socket.on('join_lobby', (nickname) => {
    // 1. Crear jugador
    const newPlayer = {
      id: socket.id,
      nickname: nickname || `Jugador ${Object.keys(playersState).length + 1}`,
      money: 20000,
      originalName: nickname, // Mantener compatibilidad
      inventory: [],
      items: []
    };

    // Guardamos en estructuras existentes para no romper lógica actual
    const key = nickname.toLowerCase();
    persistentData[key] = { ...newPlayer, score: 0 };
    activeSockets[socket.id] = key;
    if (!playersState[key]) playersState[key] = { isReady: false };

    // 2. Asignar Host (Si es el primero o no hay host)
    const allSockets = Object.keys(activeSockets);
    if (allSockets.length === 1 || !hostId) {
      // Si es el primer jugador, aseguramos que el status sea 'lobby'
      if (allSockets.length === 1) {
        gameStatus = 'lobby';
      }
      hostId = socket.id;
    }

    // 3. Enviar estado actual
    broadcastPlayerList();
    // Al que entró: Quién es el host y configuración actual
    socket.emit('lobby_info', { hostId, gameSettings, gameStatus });
    socket.emit('chat_message', { user: 'SISTEMA', text: `Entrenador ${nickname} unido al Lobby.`, type: 'system' });

    // 🔥 INICIAR PRE-CARGA
    fillPokemonBuffer();

    if (gameStatus === 'playing') {
      socket.emit('new_pokemon', { pokemon: gameState.currentAuction, timer: gameState.timer, currentBid: gameState.highestBid });
    }
  });

  socket.on('update_settings', (newSettings) => {
    // Solo el host puede cambiar configuraciones
    if (socket.id !== hostId) return;
    gameSettings = { ...gameSettings, ...newSettings };

    // 🔥 SI CAMBIAN MODOS, LIMPIAMOS EL BUFFER VIEJO Y RECARGAMOS
    pokemonBuffer = [];
    fillPokemonBuffer();

    io.emit('settings_updated', gameSettings);
  });

  socket.on('start_game', () => {
    // Solo el host puede iniciar
    if (socket.id !== hostId) return;

    gameStatus = 'playing';
    // Resetear estado de ready para todos si se usa
    io.emit('game_started');

    // 🔥 AQUÍ INICIA EL BUCLE DEL JUEGO
    startGame();
  });

  // Reemplazamos join_game por compatibilidad si alguien lo usa, redirigimos a join_lobby
  socket.on('join_game', (nick) => {
    socket.emit('error_message', "Cliente desactualizado. Usa join_lobby.");
    // O podrías llamar a la lógica de join_lobby aquí
  });

  socket.on('user_ready', () => {
    const key = activeSockets[socket.id]; if (!key) return;
    playersState[key].isReady = !playersState[key].isReady; broadcastPlayerList();
    const all = Object.keys(activeSockets);
    if (all.length > 0 && all.every(id => playersState[activeSockets[id]].isReady) && gameState.status === 'lobby') startGame();
  });

  socket.on('place_bid', (amt) => {
    if (gameState.status !== 'playing') return;
    const key = activeSockets[socket.id];
    const p = persistentData[key];
    if (gameState.currentAuction.type === 'pokemon' && p.inventory.length >= 6) return socket.emit('error_message', "Equipo Lleno");
    if (p.money < amt) return socket.emit('error_message', "Sin Fondos");
    if (amt > gameState.highestBid) {
      gameState.highestBid = amt; gameState.highestBidder = p.originalName;
      if (gameState.timer < 5) gameState.timer = 10;
      io.emit('bid_update', { amount: amt, bidder: p.originalName, timer: gameState.timer });
    }
  });

  socket.on('equip_item', ({ itemIndex, pokemonIndex }) => {
    const key = activeSockets[socket.id]; if (!key) return;
    const player = persistentData[key];
    const item = player.items[itemIndex];
    const pokemon = player.inventory[pokemonIndex];
    if (item && pokemon) {
      if (pokemon.heldItem) player.items.push(pokemon.heldItem);
      pokemon.heldItem = item;
      player.items.splice(itemIndex, 1);
      broadcastPlayerList();
      socket.emit('chat_message', { user: 'SISTEMA', text: `Has equipado ${item.displayName} a ${pokemon.displayName}`, type: 'system' });
    }
  });


  // 1. Comprar Objeto (CON LÍMITES REALES: MOCHILA + EQUIPADOS)
  socket.on('buy_shop_item', (itemId) => {
    const key = activeSockets[socket.id]; if (!key) return;
    const player = persistentData[key];

    const price = SHOP_PRICES[itemId];
    if (!price) return;

    // Asegurar arrays
    if (!player.items) player.items = [];
    if (!player.inventory) player.inventory = [];

    // --- VALIDACIÓN DE LÍMITE MEJORADA ---
    // 1. Contamos cuántos tiene en la mochila
    const inBagCount = player.items.filter(i => i.id === itemId).length;

    // 2. Contamos cuántos tiene EQUIPADOS en sus Pokémon
    const equippedCount = player.inventory.filter(p => p.heldItem && p.heldItem.id === itemId).length;

    // 3. Suma total
    const totalCount = inBagCount + equippedCount;

    // Definimos el límite
    const limit = itemId.includes('berry') ? 3 : 1;

    if (totalCount >= limit) {
      // Si intenta comprar por trampa o lag, mandamos error
      socket.emit('error_message', `¡Ya tienes el máximo (${limit}) de este objeto (Mochila + Equipado)!`);
      return;
    }
    // -------------------------------------

    if (player.money >= price) {
      player.money -= price;

      player.items.push({
        id: itemId,
        name: SHOP_NAMES_EN[itemId],    // 🔥 INGLÉS: Para exportar a Showdown
        displayName: SHOP_NAMES_ES[itemId], // 🔥 ESPAÑOL: Para mostrar en la mochila
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${itemId}.png`
      });

      // CORRECCIÓN: El código original usaba broadcastPlayerList(). 'players' venía del prompt del usuario pero aquí usamos broadcastPlayerList()
      broadcastPlayerList();

      socket.emit('item_bought_success'); // Confirmación para sonido
    } else {
      socket.emit('error_message', 'No tienes suficiente dinero.');
    }
  });

  socket.on('send_message', (msg) => {
    const k = activeSockets[socket.id]; if (k) io.emit('chat_message', { user: persistentData[k].originalName, text: msg, type: 'player' });
  });

  socket.on('disconnect', () => handleDisconnect(socket.id));
  socket.on('leave_game', () => handleDisconnect(socket.id));
});

// 🔥 CAMBIO CRÍTICO: Render nos da el puerto en process.env.PORT
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});