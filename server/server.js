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
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

const TEST_MODE = false;
const TEST_SPAWN_CYCLE = ['comun', 'pseudolegendario', 'legendario'];
const BUFFER_SIZE = 2;

const CONSTANTS = require('./constants');
const { FORCED_SPAWNS, PSEUDO_LEGENDARIES, ULTRA_BEASTS, TYPE_TRANSLATIONS, MASTER_ITEM_LIST, MEGA_STONES, MANUAL_TRANSLATIONS, SHOP_PRICES, SHOP_NAMES_EN, SHOP_NAMES_ES } = CONSTANTS;

// 🔥 STATE MANAGEMENT MULTI-ROOM 🔥
const activeRooms = {}; // roomId -> Room state
const socketRoomMap = {}; // socketId -> roomId

class Room {
  constructor(id, name, password, hostId) {
    this.id = id;
    this.name = name;
    this.password = password;
    this.hostId = hostId;
    
    this.seenPokemonNames = new Set();
    this.persistentData = {};
    this.activeSockets = {};
    this.playersState = {};
    this.activeBidders = new Set();
    
    this.gameState = {
      status: 'lobby', phase: 'pokemon', currentAuction: null,
      pokemonPool: [], itemPool: [], timer: 0, highestBid: 0, highestBidder: null, roundsPlayed: 0, extensions: 0
    };
    
    this.pokemonBuffer = [];
    this.isFetching = false;
    this.gameStatus = 'lobby';
    this.gameSettings = { mode: 'competitivo', region: 'all' };
    
    this.timerInterval = null;
    this.nextRoundTimeout = null;
    this.testSpawnIndex = 0;
  }
}

// ----------------------------------------------------
// 🔥 ROOM HELPERS
// ----------------------------------------------------
const stopGameFull = (room) => {
  console.log(`💀 RESETEANDO SALA ${room.id}...`);
  clearInterval(room.timerInterval);
  clearTimeout(room.nextRoundTimeout);
  room.gameState = {
    status: 'lobby', phase: 'pokemon', currentAuction: null,
    pokemonPool: [], itemPool: [], timer: 0, highestBid: 0, highestBidder: null, roundsPlayed: 0, extensions: 0
  };
  room.persistentData = {};
  room.seenPokemonNames.clear();
  Object.keys(room.playersState).forEach(nick => { room.playersState[nick].isReady = false; });
  room.activeSockets = {};
  io.to(room.id).emit('game_reset');
};

const broadcastPlayerList = (room) => {
  const list = Object.keys(room.activeSockets).map(id => {
    const k = room.activeSockets[id];
    return { ...room.persistentData[k], id, isReady: room.playersState[k]?.isReady, nickname: room.persistentData[k].originalName };
  });
  io.to(room.id).emit('update_players', list);
};

// ... copy the rest of the generation functions but passing room as context ...

// We will fetch generation functions from original code, replace global vars with room.vars
// (Un solo Pokémon) ---
const fetchPokemonData = async (room, mode = 'competitivo', region = 'all', ignoreDuplicates = false, forceTarget = null) => {
  try {
    // Intentos para encontrar uno no repetido (1 si es forzado)
    const maxAttempts = forceTarget ? 1 : 5;
    for (let i = 0; i < maxAttempts; i++) {
      let targetNameOrId = forceTarget;

      // 🔥 TEST MODE: FORZAR RAREZA CÍCLICA
      let forcedRarity = null;

      if (!targetNameOrId) {
        if (TEST_MODE) {
          forcedRarity = TEST_SPAWN_CYCLE[room.testSpawnIndex % TEST_SPAWN_CYCLE.length];

          if (forcedRarity === 'pseudolegendario') {
            targetNameOrId = PSEUDO_LEGENDARIES[Math.floor(Math.random() * PSEUDO_LEGENDARIES.length)];
          } else if (forcedRarity === 'legendario') {
            const legends = [144, 145, 146, 150, 243, 244, 245, 249, 250, 382, 383, 384, 483, 484, 487];
            targetNameOrId = legends[Math.floor(Math.random() * legends.length)];
          } else {
            targetNameOrId = Math.floor(Math.random() * 500) + 1;
          }
        } else {
          targetNameOrId = Math.floor(Math.random() * 905) + 1;
        }
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

      // 🔥 VALIDAR DUPLICADOS (Salvo que forcemos ignorar, ej. para Reroll desesperado)
      if (!ignoreDuplicates && room.seenPokemonNames.has(finalName)) {
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
          const finalValues = MANUAL_TRANSLATIONS[a.ability.name] || {}; // 🔥 Check manual

          const displayName = finalValues.name || (spaEntry ? spaEntry.name : abilityData.name);
          const engEntry = abilityData.names.find(n => n.language.name === 'en');
          const engName = engEntry ? engEntry.name : abilityData.name;
          const flavor = abilityData.flavor_text_entries.find(f => f.language.name === 'es');

          const description = finalValues.desc || (flavor ? flavor.flavor_text : "...");

          return { name: displayName, engName: engName, isHidden: a.is_hidden, description: description };
        } catch {
          // Fallback en catch también
          const manual = MANUAL_TRANSLATIONS[a.ability.name];
          const name = manual ? manual.name : a.ability.name;
          const desc = manual ? manual.desc : "...";
          return { name: name, engName: a.ability.name, description: desc, isHidden: a.is_hidden };
        }
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

      // 🔥 TEST MODE: Asegurar que la rareza coincida con lo pedido si falló la selección por ID
      if (TEST_MODE && forcedRarity) {
        // Si pedimos legendario y no salió (por azar del ID), forzamos override de etiquetas para testing
        // OJO: Esto es solo visual/lógico para el test, el Pokémon sigue siendo el que es.
        // Para hacerlo bien, deberíamos re-rollear si no matchea, pero aceptemos el caos del test.
        // Mejor enfoque: Solo incrementar el índice de test si TUVIMOS ÉXITO en generar algo.
        room.testSpawnIndex++;
      }

      // 🔥 REGISTRAR COMO VISTO
      room.seenPokemonNames.add(finalName);

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

// 🔥 HELPER DE REROLL: Busca un Pokémon de la MISMA rareza (OPTIMIZADO)
const fetchPokemonByRarity = async (room, targetRarity, excludedName) => {
  // 1. INTENTO DIRECTO (Listas conocidas)
  if (targetRarity === 'ultraente' && ULTRA_BEASTS.length > 0) {
    const candidates = ULTRA_BEASTS.filter(n => n !== excludedName);
    if (candidates.length > 0) {
      const target = candidates[Math.floor(Math.random() * candidates.length)];
      console.log(`[REROLL] Smart Force: ${targetRarity} -> ${target}`);
      return await fetchPokemonData(room, room.gameSettings.mode, room.gameSettings.region, true, target);
    }
  }
  if (targetRarity === 'pseudolegendario' && PSEUDO_LEGENDARIES.length > 0) {
    const candidates = PSEUDO_LEGENDARIES.filter(n => n !== excludedName);
    if (candidates.length > 0) {
      const target = candidates[Math.floor(Math.random() * candidates.length)];
      console.log(`[REROLL] Smart Force: ${targetRarity} -> ${target}`);
      return await fetchPokemonData(room, room.gameSettings.mode, room.gameSettings.region, true, target);
    }
  }

  // 2. FALLBACK: BÚSQUEDA ALEATORIA (Para Comunes/Legendarios sin lista completa)
  let attempts = 0;
  while (attempts < 30) {
    const p = await fetchPokemonData(room, room.gameSettings.mode, room.gameSettings.region, true);
    if (p && p.rarity === targetRarity && p.name !== excludedName) {
      return p;
    }
    attempts++;
  }

  // Si falla, devolvemos NULL
  console.warn(`⚠️ Reroll: No se encontró MATCH exacto para ${targetRarity} tras 30 intentos.`);
  return null;
};

// 🔥 GENERADOR DE TIENDA RÁPIDA (Ponderada)
const generateQuickShop = async () => {
  const shopItems = [];
  // Copia local para evitar duplicados en la misma tira
  const localPool = [...MASTER_ITEM_LIST];

  for (let i = 0; i < 5; i++) {
    if (localPool.length === 0) break;

    // Lógica de Ponderación: 40% Baya, 60% Otro
    // Filtramos las bayas disponibles
    const berries = localPool.filter(i => i.includes('berry'));
    const others = localPool.filter(i => !i.includes('berry'));

    let selectedName;
    // Si hay bayas y sale el chance (o no hay otros), sacamos baya
    if (berries.length > 0 && (Math.random() < 0.4 || others.length === 0)) {
      const idx = Math.floor(Math.random() * berries.length);
      selectedName = berries[idx];
    } else {
      // Si no es baya (o no hay bayas), sacamos otro
      const idx = Math.floor(Math.random() * others.length);
      selectedName = others[idx];
    }

    // Lo sacamos del pool local para no repetir en esta tienda
    const removeIdx = localPool.indexOf(selectedName);
    if (removeIdx > -1) localPool.splice(removeIdx, 1);

    // FETCH DATA
    try {
      const res = await axios.get(`https://pokeapi.co/api/v2/item/${selectedName}`);
      const data = res.data;
      const nameEntry = data.names.find(n => n.language.name === 'es');
      const manualData = MANUAL_TRANSLATIONS[selectedName];
      const displayName = manualData?.name || (nameEntry ? nameEntry.name : data.name);

      const esEntries = data.flavor_text_entries.filter(f => f.language.name === 'es');
      const enEntries = data.flavor_text_entries.filter(f => f.language.name === 'en');

      let description = manualData?.desc || (esEntries.length > 0
        ? esEntries[esEntries.length - 1].text
        : (enEntries.length > 0 ? enEntries[enEntries.length - 1].text : "Sin descripción."));
      description = description.replace(/[\n\f]/g, ' ');

      let sprite = data.sprites.default;
      if (!sprite) sprite = `https://play.pokemonshowdown.com/sprites/itemicons/${selectedName}.png`;

      // 🔥 PRECIO DINÁMICO x1.5
      let basePrice = 500;
      if (['life-orb', 'choice-band', 'choice-specs', 'choice-scarf', 'leftovers', 'mirror-herb', 'assault-vest'].includes(selectedName)) basePrice = 1000;

      let finalPrice = Math.floor(basePrice * 1.5);

      shopItems.push({
        id: selectedName, // ID simple para la tienda
        name: data.name,
        displayName,
        sprite,
        description,
        price: finalPrice
      });
    } catch (e) { console.error("Error gen shop item:", selectedName); }
  }
  return shopItems;
};

// --- FUNCIÓN DE PRE-CARGA (BUFFER) ---
const fillPokemonBuffer = async (room) => {
  // 🛑 AGREGAR ESTO: Si ya no estamos en fase pokemon, no hacer nada.
  if (room.gameState.phase !== 'pokemon') return;

  if (room.isFetching) return;
  if (room.pokemonBuffer.length >= BUFFER_SIZE) return;

  room.isFetching = true;
  try {
    console.log(`[BUFFER] Rellenando... (Actual: ${room.pokemonBuffer.length})`);
    while (room.pokemonBuffer.length < BUFFER_SIZE) {
      const newPokemon = await fetchPokemonData(room, room.gameSettings.mode, room.gameSettings.region);
      if (newPokemon) {
        room.pokemonBuffer.push(newPokemon);
      } else {
        // Breve pausa si falló (para no saturar si hay error de red)
        await new Promise(r => setTimeout(r, 500));
      }
    }
    console.log(`[BUFFER] Listo. Pokémon en espera: ${room.pokemonBuffer.length}`);
  } catch (error) {
    console.error("Error rellenando buffer:", error);
  } finally {
    room.isFetching = false;
  }
}

const handleDisconnect = (room, socketId) => {
  const key = room.activeSockets[socketId];
  if (key) {
    delete room.activeSockets[socketId];

    const remainingIds = Object.keys(room.activeSockets);

    // CASO 1: SALA VACÍA (Reset Total)
    if (remainingIds.length === 0) {
      console.log("💀 Sala vacía. Reiniciando servidor...");
      stopGameFull(room); // Usamos la función existente que ya resetea todo
      room.gameStatus = 'lobby'; // Aseguramos estado
      room.hostId = null;
    }
    // CASO 2: QUEDAN JUGADORES (Reasignar Host)
    else {
      // Si el que se fue era el host, le pasamos la corona al siguiente
      if (socketId === room.hostId) {
        room.hostId = remainingIds[0];
        io.to(room.id).emit('host_changed', room.hostId);
      }
      broadcastPlayerList(room);
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
  const poolSize = numPlayers * 8;
  let pool = [];
  console.log(`💎 Generando OBJETOS...`);
  const shuffled = MASTER_ITEM_LIST.sort(() => 0.5 - Math.random()).slice(0, poolSize);

  for (const itemName of shuffled) {
    try {
      const res = await axios.get(`https://pokeapi.co/api/v2/item/${itemName}`);
      const data = res.data;
      const nameEntry = data.names.find(n => n.language.name === 'es');
      const manualData = MANUAL_TRANSLATIONS[itemName];
      const displayName = manualData?.name || (nameEntry ? nameEntry.name : data.name);
      const esEntries = data.flavor_text_entries.filter(f => f.language.name === 'es');
      const enEntries = data.flavor_text_entries.filter(f => f.language.name === 'en'); // Fallback EN

      let description = manualData?.desc || (esEntries.length > 0
        ? esEntries[esEntries.length - 1].text
        : (enEntries.length > 0 ? enEntries[enEntries.length - 1].text : "Sin descripción."));

      description = description.replace(/[\n\f]/g, ' ');

      // 🔥 FIX GEN 9 SPRITES: Si no hay default, usar Showdown
      let sprite = data.sprites.default;
      if (!sprite) {
        // Intento manual con Showdown para items nuevos (mirror-herb, loaded-dice, etc.)
        // Normalizamos el nombre: mirror-herb -> mirrorherb (Showdown suele usar nombres pegados o dash, probemos dash primero)
        // Showdown: https://play.pokemonshowdown.com/sprites/itemicons/mirror-herb.png
        sprite = `https://play.pokemonshowdown.com/sprites/itemicons/${itemName}.png`;
      }
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

const startGame = async (room) => {
  const numPlayers = Object.keys(room.activeSockets).length;
  if (numPlayers === 0) return;
  io.to(room.id).emit('chat_message', { user: 'SISTEMA', text: '🏆 Generando Mercado...', type: 'system' });
  try {
    // 🔥 USAMOS BUFFER EN LUGAR DE POOL GIGANTE
    // Aseguramos que haya algo en el buffer antes de empezar
    if (room.pokemonBuffer.length === 0) await fillPokemonBuffer(room);

    // 🔥 TAREA 1: Presupuesto Inicial Dinámico
    const baseMoney = 20000 + (numPlayers * 500);
    console.log(`💰 INICIO DINÁMICO: ${numPlayers} Jugadores -> $${baseMoney} c/u`);

    // Aplicar dinero inicial a todos
    Object.keys(room.persistentData).forEach(key => {
      room.persistentData[key].money = baseMoney;
    });
    // Notificar actualización de dinero
    broadcastPlayerList(room);

    // Items siguen igual (son rápidos)
    const items = await generateItemPool(numPlayers);
    room.gameState.itemPool = items;
    room.gameState.phase = 'pokemon';

    io.to(room.id).emit('chat_message', { user: 'SISTEMA', text: `¡Comienza la Fase de Selección! (Presupuesto Base: $${baseMoney})`, type: 'system' });
    io.to(room.id).emit('game_starting');

    // Ya no esperamos 3s, el cliente maneja transiciones. Pero un pequeño delay ayuda.
    setTimeout(() => startRound(room), 1000);
  } catch (e) { console.error(e); stopGameFull(room); }
};

const startRound = async (room) => {
  // Si no hay jugadores, pausamos
  const activePlayerIds = Object.keys(room.activeSockets);
  const playerCount = activePlayerIds.length;
  if (playerCount === 0) return;

  // LÍMITE DE RONDAS: 9 por cada jugador conectado (o 6 TOTAL en Test Mode)
  let MAX_ROUNDS = playerCount * 9;
  if (TEST_MODE) MAX_ROUNDS = 6;

  let nextThing = null;

  // =================================================
  // 🐾 FASE 1: SUBASTA DE POKÉMON
  // =================================================
  if (room.gameState.phase === 'pokemon') {
    // Verificar condiciones de fin de fase:
    // A) Todos tienen 6 pokémon (Inventario lleno)
    const allFull = activePlayerIds.every(id =>
      room.persistentData[room.activeSockets[id]].inventory.length >= 6
    );
    // B) Se alcanzó el límite de rondas
    const limitReached = room.gameState.roundsPlayed >= MAX_ROUNDS;

    // SI SE CUMPLE CUALQUIERA -> CAMBIO DE FASE
    if (allFull || limitReached) {
      console.log(`--- CAMBIO DE FASE (Rondas: ${room.gameState.roundsPlayed}/${MAX_ROUNDS} | Full: ${allFull}) ---`);

      // 🔥 TEST MODE: SALTAR ITEMS
      if (TEST_MODE) {
        console.log("⚡ MODO PRUEBA: Saltando Fase de Items -> Directo a Management");
        room.gameState.phase = 'management';
        room.gameState.status = 'management';
        room.gameState.currentAuction = null;
        // 🔥 GENERAR TIENDAS INDIVIDUALES (TEST MODE)
        console.log("🏪 (TEST) Generando tiendas para la Mesa de Trabajo...");
        const connectedSockets = Object.keys(room.activeSockets);
        for (const sId of connectedSockets) {
          const pKey = room.activeSockets[sId];
          if (room.persistentData[pKey]) {
            room.persistentData[pKey].shopItems = await generateQuickShop();
            room.persistentData[pKey].rerollCost = 1500;
            io.to(sId).emit('shop_updated', {
              items: room.persistentData[pKey].shopItems,
              rerollCost: 1500
            });
          }
        }
        io.to(room.id).emit('phase_transition', { phaseName: "MESA DE TRABAJO" });
        io.to(room.id).emit('round_ended', { message: "MERCADO CERRADO - FINALIZADO" });
        io.to(room.id).emit('update_game', room.gameState);
        return;
      }

      room.gameState.phase = 'items';
      room.gameState.roundsPlayed = 0; // RESETEAR CONTADOR PARA LA SIGUIENTE FASE
      room.pokemonBuffer = [];

      // 🔥 TAREA 2: Inyección de Capital
      Object.keys(room.persistentData).forEach(key => {
        room.persistentData[key].money += 3500;
      });
      console.log("💰 Stimulus Check: +$3500 para todos.");

      io.to(room.id).emit('chat_message', { user: 'SISTEMA', text: "💰 Suministros de Fase 2 recibidos: +$3.500 para todos.", type: 'system' });
      broadcastPlayerList(room); // Actualizar visualmente

      io.to(room.id).emit('phase_transition', { phaseName: "OBJETOS EQUIPABLES" });
      setTimeout(() => startRound(room), 5000);
      return;
    }

    // Obtener siguiente Pokémon
    if (room.pokemonBuffer.length > 0) {
      nextThing = room.pokemonBuffer.shift();
      fillPokemonBuffer(room);
    } else {
      nextThing = await fetchPokemonData(room, room.gameSettings.mode, room.gameSettings.region);
    }
  }
  // =================================================
  // 💎 FASE 2: SUBASTA DE OBJETOS (ITEMS)
  // =================================================
  else if (room.gameState.phase === 'items') {
    const limitReached = room.gameState.roundsPlayed >= MAX_ROUNDS;
    const poolEmpty = room.gameState.itemPool.length === 0;

    if (limitReached || poolEmpty) {
      console.log("--- FIN DE ITEMS -> MESA DE TRABAJO ---");

      // 1. CAMBIO DE ESTADO (CRUCIAL para quitar la pantalla de subasta)
      room.gameState.phase = 'management';   // <--- Esto obliga a React a cambiar de vista
      room.gameState.status = 'management';
      room.gameState.currentAuction = null;

      // 🔥 GENERAR TIENDAS INDIVIDUALES
      console.log("🏪 Generando tiendas para la Mesa de Trabajo...");
      const connectedSockets = Object.keys(room.activeSockets);
      for (const sId of connectedSockets) {
        const pKey = room.activeSockets[sId];
        if (room.persistentData[pKey]) {
          room.persistentData[pKey].shopItems = await generateQuickShop();
          room.persistentData[pKey].rerollCost = 1500; // Reset costo
          // Enviamos update personal
          io.to(sId).emit('shop_updated', {
            items: room.persistentData[pKey].shopItems,
            rerollCost: 1500
          });
        }
      }

      // 2. EVENTO ORIGINAL (El que ya funcionaba visualmente)
      // Esto cierra la subasta y muestra el mensaje final
      io.to(room.id).emit('round_ended', { message: "MERCADO CERRADO - FINALIZADO" });

      // 3. ACTUALIZACIÓN GLOBAL
      // Aseguramos que todos reciban el nuevo 'room.gameState.phase'
      io.to(room.id).emit('update_game', room.gameState);

      return; // Fin del bucle
    }

    nextThing = room.gameState.itemPool.shift();
  }

  // =================================================
  // 🚀 EMITIR LA RONDA (Común)
  // =================================================
  if (nextThing) {
    // INCREMENTAMOS CONTADOR DE RONDAS
    room.gameState.roundsPlayed++;
    room.gameState.extensions = 0; // Reset extensions for new round

    console.log(`Iniciando Ronda ${room.gameState.roundsPlayed} / ${MAX_ROUNDS} (Fase: ${room.gameState.phase})`);

    // 🔥 TAREA: TIEMPOS AJUSTADOS
    // Items: 8s
    // Pokemon Normal: 10s
    // Legendarios: 20s
    let time = 10;
    if (room.gameState.phase === 'items') {
      time = 8;
    } else if (['legendario', 'singular', 'ultraente'].includes(nextThing.rarity)) {
      time = 20;
    }

    room.gameState.status = 'playing';
    room.gameState.currentAuction = nextThing;
    room.gameState.highestBid = nextThing.basePrice;
    room.gameState.highestBidder = null;
    room.gameState.timer = time;

    // 🔥 TAREA 3: Resetear tracking de pujas
    room.activeBidders.clear();

    io.to(room.id).emit('new_pokemon', {
      pokemon: nextThing,
      timer: time,
      currentBid: nextThing.basePrice,
      roundInfo: `${room.gameState.roundsPlayed}/${MAX_ROUNDS}` // Info útil para el frontend
    });

    clearInterval(room.timerInterval);
    room.timerInterval = setInterval(() => {
      room.gameState.timer--;
      io.to(room.id).emit('update_timer', room.gameState.timer);
      if (room.gameState.timer <= 0) endRound(room);
    }, 1000);
  } else {
    console.log("⚠️ Error: No se pudo obtener subasta. Reintentando...");
    setTimeout(() => startRound(room), 2000);
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

const endRound = async (room) => {
  clearInterval(room.timerInterval);
  if (Object.keys(room.activeSockets).length === 0) return;
  let msg = "Nadie ofertó.";
  let winner = null;

  if (room.gameState.highestBidder) {
    const key = room.gameState.highestBidder.toLowerCase();
    if (room.persistentData[key]) {
      room.persistentData[key].money -= room.gameState.highestBid;
      if (room.gameState.currentAuction.type === 'pokemon') {
        const wonPokemon = room.gameState.currentAuction;

        // 🔥 OPTIMIZACIÓN REROLL: Pre-fetch del candidato
        // Lo hacemos sin await para no bloquear el flujo
        fetchPokemonByRarity(room, wonPokemon.rarity, wonPokemon.name).then(candidate => {
          if (candidate) {
            wonPokemon.rerollCandidate = candidate;
            console.log(`🧬 [Reroll Cache] Candidato listo para ${wonPokemon.name}: ${candidate.name}`);
          }
        });

        room.persistentData[key].inventory.push(wonPokemon);
        msg = `¡${room.persistentData[key].originalName} ganó a ${wonPokemon.displayName}!`;

        // 🔥 CHECK DE MEGAPÍEDRA
        // Si el Pokémon ganado tiene Mega, inyectamos la piedra al POOL DE ITEMS
        if (MEGA_STONES[wonPokemon.name]) {
          const possibleStones = MEGA_STONES[wonPokemon.name];
          const selectedStone = possibleStones[Math.floor(Math.random() * possibleStones.length)];

          console.log(`💎 Detectado Mega-Pokémon (${wonPokemon.name}). Inyectando ${selectedStone}...`);
          const megaItem = await createMegaStoneItem(selectedStone);
          if (megaItem) {
            // Lo ponemos en una posición aleatoria asegurada dentro del pool
            const randomIndex = Math.floor(Math.random() * room.gameState.itemPool.length);
            room.gameState.itemPool.splice(randomIndex, 0, megaItem);

            // Opcional: Avisar al chat
            io.to(room.id).emit('chat_message', { user: 'SISTEMA', text: `✨ ¡La presencia de ${wonPokemon.displayName} ha invocado una Megapiedra en algún lugar del mercado!`, type: 'system' });
          }
        }

      } else {
        room.persistentData[key].items.push(room.gameState.currentAuction);
        msg = `¡${room.persistentData[key].originalName} ganó: ${room.gameState.currentAuction.displayName}!`;
      }
      winner = room.persistentData[key].originalName;
    }
  }

  // 🔥 TAREA 3: SAVER'S BONUS (Ingreso Pasivo)
  // Recompensar a quienes NO pujaron (y no tienen demasiado dinero)
  const activeIds = Object.keys(room.activeSockets);
  activeIds.forEach(socketId => {
    // Revisamos si el ID del socket está en los pujadores
    // NOTA: room.activeBidders guarda el socket.id tal como lo implementé en place_bid (p.id, que es socket.id)
    if (!room.activeBidders.has(socketId)) {
      const key = room.activeSockets[socketId];
      if (key && room.persistentData[key]) {
        const player = room.persistentData[key];
        // Límite de $8000
        if (player.money <= 8000) {
          player.money += 500;
          // Notificación personal (o logro discreto)
          io.to(socketId).emit('chat_message', {
            user: 'SISTEMA',
            text: "Paciencia recompensada: +$500",
            type: 'system-subtle' // Un tipo nuevo o usar 'system'
          });
        }
      }
    }
  });

  io.to(room.id).emit('round_ended', { message: msg, winner: winner });
  io.to(room.id).emit('chat_message', { user: 'SISTEMA', text: msg, type: 'system' });
  broadcastPlayerList(room);
  room.nextRoundTimeout = setTimeout(() => { if (Object.keys(room.activeSockets).length > 0) startRound(room); }, 4000);
};




io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('get_rooms', () => {
    const list = Object.values(activeRooms).map(r => ({
      id: r.id,
      name: r.name,
      hasPassword: !!r.password,
      playersCount: Object.keys(r.activeSockets).length
    }));
    socket.emit('rooms_list', list);
  });

  socket.on('create_room', ({ name, password, nickname }) => {
    const roomId = 'SALA-' + Math.random().toString(36).substr(2, 4).toUpperCase();
    const room = new Room(roomId, name, password, socket.id);
    activeRooms[roomId] = room;
    
    socket.join(roomId);
    socketRoomMap[socket.id] = roomId;
    
    joinRoomLobby(socket, room, nickname);
  });

  socket.on('join_room', ({ roomId, password, nickname }) => {
    const room = activeRooms[roomId];
    if (!room) return socket.emit('error_message', 'La sala no existe.');
    if (room.password && room.password !== password) return socket.emit('error_message', 'Contraseña incorrecta.');
    
    socket.join(roomId);
    socketRoomMap[socket.id] = roomId;
    
    joinRoomLobby(socket, room, nickname);
  });

  const joinRoomLobby = (socket, room, nickname) => {
    const newPlayer = {
      id: socket.id,
      nickname: nickname || 'Jugador ' + (Object.keys(room.playersState).length + 1),
      money: 20000,
      originalName: nickname,
      inventory: [],
      items: [],
      rerollCount: 0,
      shopItems: [],
      rerollCost: 1500
    };

    const key = nickname.toLowerCase();
    
    // Si ya existe en persistentData y se está reconectando
    if (!room.persistentData[key]) {
        room.persistentData[key] = { ...newPlayer, score: 0 };
    } else {
        // Actualizamos id del socket
        room.persistentData[key].id = socket.id;
    }
    
    room.activeSockets[socket.id] = key;
    if (!room.playersState[key]) room.playersState[key] = { isReady: false };

    // Si es el primer jugador o el host original se fue
    if (Object.keys(room.activeSockets).length === 1 || !room.hostId) {
      if (Object.keys(room.activeSockets).length === 1) room.gameStatus = 'lobby';
      room.hostId = socket.id;
    }

    broadcastPlayerList(room);
    socket.emit('lobby_info', { hostId: room.hostId, gameSettings: room.gameSettings, gameStatus: room.gameStatus });
    io.to(room.id).emit('chat_message', { user: 'SISTEMA', text: 'Entrenador ' + nickname + ' unido a la sala.', type: 'system' });

    fillPokemonBuffer(room);

    if (room.gameStatus === 'playing') {
      socket.emit('new_pokemon', { pokemon: room.gameState.currentAuction, timer: room.gameState.timer, currentBid: room.gameState.highestBid });
    }
  };

  // The rest of events must check the room first
  socket.on('update_settings', (newSettings) => {
    const roomId = socketRoomMap[socket.id];
    if (!roomId) return;
    const room = activeRooms[roomId];
    if (socket.id !== room.hostId) return;

    room.gameSettings = { ...room.gameSettings, ...newSettings };
    room.pokemonBuffer = [];
    fillPokemonBuffer(room);
    io.to(room.id).emit('settings_updated', room.gameSettings);
  });

  socket.on('start_game', () => {
    const roomId = socketRoomMap[socket.id];
    if (!roomId) return;
    const room = activeRooms[roomId];
    if (socket.id !== room.hostId) return;

    room.gameStatus = 'playing';
    io.to(room.id).emit('game_started');
    startGame(room);
  });

  socket.on('user_ready', () => {
    const roomId = socketRoomMap[socket.id];
    if (!roomId) return;
    const room = activeRooms[roomId];
    const key = room.activeSockets[socket.id]; if (!key) return;
    
    room.playersState[key].isReady = !room.playersState[key].isReady; 
    broadcastPlayerList(room);
    
    const all = Object.keys(room.activeSockets);
    if (all.length > 0 && all.every(id => room.playersState[room.activeSockets[id]].isReady) && room.gameState.status === 'lobby') startGame(room);
  });

  socket.on('place_bid', (amt) => {
    const roomId = socketRoomMap[socket.id];
    if (!roomId) return;
    const room = activeRooms[roomId];
    if (room.gameState.status !== 'playing') return;
    
    const key = room.activeSockets[socket.id];
    const p = room.persistentData[key];
    
    if (room.gameState.currentAuction.type === 'pokemon' && p.inventory.length >= 6) return socket.emit('error_message', 'Equipo Lleno');
    if (p.money < amt) return socket.emit('error_message', 'Sin Fondos');
    if (amt > room.gameState.highestBid) {
      room.gameState.highestBid = amt;
      room.gameState.highestBidder = p.nickname;
      room.activeBidders.add(socket.id);
      
      const resetTarget = Math.max(5, 8 - room.gameState.extensions);
      if (room.gameState.timer < resetTarget) {
        room.gameState.timer = resetTarget;
        room.gameState.extensions++;
      }
      io.to(room.id).emit('bid_update', { amount: amt, bidder: p.nickname, timer: room.gameState.timer });
    }
  });

  socket.on('reroll_shop', async () => {
    const roomId = socketRoomMap[socket.id];
    if (!roomId) return;
    const room = activeRooms[roomId];
    const key = room.activeSockets[socket.id];
    if (!key || !room.persistentData[key]) return;
    const p = room.persistentData[key];

    if (p.money < p.rerollCost) return socket.emit('error_message', 'Sin fondos para Reroll');
    p.money -= p.rerollCost;
    p.shopItems = await generateQuickShop();
    p.rerollCost += 1500;
    
    socket.emit('shop_updated', { items: p.shopItems, rerollCost: p.rerollCost });
    broadcastPlayerList(room);
    socket.emit('chat_message', { user: 'TIENDA', text: '🔄 ¡Nuevos productos llegaron!', type: 'system-subtle' });
  });

  socket.on('buy_shop_item', (itemId) => {
    const roomId = socketRoomMap[socket.id];
    if (!roomId) return;
    const room = activeRooms[roomId];
    const key = room.activeSockets[socket.id];
    if (!key || !room.persistentData[key]) return;
    const p = room.persistentData[key];

    const item = p.shopItems.find(i => i.id === itemId);
    if (!item) return socket.emit('error_message', 'Item no disponible o expirado.');
    if (p.money < item.price) return socket.emit('error_message', 'Sin Fondos');

    const inBag = p.items.filter(i => i.id === item.id).length;
    const equipped = p.inventory.filter(poke => poke.heldItem && poke.heldItem.id === item.id).length;
    const limit = item.id.includes('berry') ? 3 : 1;
    if ((inBag + equipped) >= limit) return socket.emit('error_message', 'Límite alcanzado para este objeto.');

    p.money -= item.price;
    const newItem = { ...item, type: 'item', id: 'shop-' + Date.now() + '-' + item.id, originalId: item.id };
    p.items.push(newItem);

    socket.emit('item_bought_success');
    broadcastPlayerList(room);
  });

  socket.on('equip_item', ({ itemIndex, pokemonIndex }) => {
    const roomId = socketRoomMap[socket.id];
    if (!roomId) return;
    const room = activeRooms[roomId];
    const key = room.activeSockets[socket.id]; if (!key) return;
    const player = room.persistentData[key];
    const item = player.items[itemIndex];
    const pokemon = player.inventory[pokemonIndex];
    if (item && pokemon) {
      if (pokemon.heldItem) player.items.push(pokemon.heldItem);
      pokemon.heldItem = item;
      player.items.splice(itemIndex, 1);
      broadcastPlayerList(room);
      io.to(room.id).emit('chat_message', { user: 'SISTEMA', text: 'Has equipado ' + item.displayName + ' a ' + pokemon.displayName, type: 'system' });
    }
  });

  socket.on('reroll_pokemon', async ({ pokemonIndex }) => {
    const roomId = socketRoomMap[socket.id];
    if (!roomId) return;
    const room = activeRooms[roomId];
    const key = room.activeSockets[socket.id];
    if (!key) return;
    const player = room.persistentData[key];

    if (typeof player.rerollCount === 'undefined') player.rerollCount = 0;
    const idx = parseInt(pokemonIndex);
    if (isNaN(idx)) return socket.emit('error_message', 'Error interno: Índice inválido.');
    const oldPokemon = player.inventory[idx];
    if (!oldPokemon) return socket.emit('error_message', 'Pokémon no encontrado.');
    if (oldPokemon.wasRerolled) return socket.emit('error_message', '⚠️ Este Pokémon ya ha sido modificado genéticamente y no soporta otro cambio.');

    const isLegend = ['legendario', 'singular', 'ultraente'].includes(oldPokemon.rarity);
    const baseCost = isLegend ? 5000 : 2000;
    const dynamicCost = baseCost + (player.rerollCount * 1000);

    if (player.money < dynamicCost) return socket.emit('error_message', 'Necesitas $' + dynamicCost + ' para iniciar la recombinación (Uso #' + (player.rerollCount + 1) + ').');

    socket.emit('chat_message', { user: 'SISTEMA', text: '🧬 Secuenciando nuevo ADN...', type: 'system-subtle' });
    
    let newPokemon = oldPokemon.rerollCandidate;
    if (!newPokemon) {
      newPokemon = await fetchPokemonByRarity(room, oldPokemon.rarity, oldPokemon.name);
    }

    if (newPokemon) {
      player.money -= dynamicCost;
      player.rerollCount++;
      newPokemon.heldItem = oldPokemon.heldItem;
      newPokemon.wasRerolled = true;
      player.inventory[idx] = newPokemon;
      io.to(room.id).emit('chat_message', { user: 'RECOMBINADOR', text: '🧬 ' + player.originalName + ' recombinó a ' + oldPokemon.displayName + ' por un ' + newPokemon.displayName + '.', type: 'system' });
      broadcastPlayerList(room);
    } else {
      socket.emit('error_message', 'Error en la máquina (No se encontró reemplazo). Intenta de nuevo.');
    }
  });

  socket.on('send_message', (msg) => {
    const roomId = socketRoomMap[socket.id];
    if (!roomId) return;
    const room = activeRooms[roomId];
    const k = room.activeSockets[socket.id]; 
    if (k) io.to(room.id).emit('chat_message', { user: room.persistentData[k].originalName, text: msg, type: 'player' });
  });

  socket.on('force_skip', () => {
    const roomId = socketRoomMap[socket.id];
    if (!roomId) return;
    const room = activeRooms[roomId];
    if (socket.id !== room.hostId) return; // Sólo el host puede skipear
    // Si estamos en una ronda activa
    if (room.gameStatus === 'playing' && room.gameState.timer > 0) {
      endRound(room);
      io.to(room.id).emit('chat_message', { user: 'SISTEMA', text: '⏩ Ronda omitida por el Host.', type: 'system-subtle' });
    }
  });

  socket.on('request_shop_state', () => {
    const roomId = socketRoomMap[socket.id];
    if (!roomId) return;
    const room = activeRooms[roomId];
    const key = room.activeSockets[socket.id];
    if (!key || !room.persistentData[key]) return;
    const p = room.persistentData[key];

    if (!p.shopItems || p.shopItems.length === 0) {
      generateQuickShop().then(items => {
        p.shopItems = items;
        p.rerollCost = p.rerollCost || 1500;
        socket.emit('shop_updated', { items: p.shopItems, rerollCost: p.rerollCost });
      });
    } else {
      socket.emit('shop_updated', { items: p.shopItems, rerollCost: p.rerollCost || 1500 });
    }
  });

  socket.on('disconnect', () => handleGlobalDisconnect(socket.id));
  socket.on('leave_game', () => handleGlobalDisconnect(socket.id));
  
  const handleGlobalDisconnect = (socketId) => {
    const roomId = socketRoomMap[socketId];
    if (!roomId) return;
    const room = activeRooms[roomId];
    if (!room) return;
    
    // Dejamos la persistencia, pero lo quitamos de activeSockets
    const key = room.activeSockets[socketId];
    if (key) {
      delete room.activeSockets[socketId];
      delete socketRoomMap[socketId];
      
      const remainingIds = Object.keys(room.activeSockets);
      if (remainingIds.length === 0) {
        // Sala vacia, la eliminamos
        console.log('💀 Sala ' + roomId + ' vacía. Destruyendo...');
        clearInterval(room.timerInterval);
        clearTimeout(room.nextRoundTimeout);
        delete activeRooms[roomId];
      } else {
        if (socketId === room.hostId) {
          room.hostId = remainingIds[0];
          io.to(room.id).emit('host_changed', room.hostId);
        }
        broadcastPlayerList(room);
      }
    }
  };
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
