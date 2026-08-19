import os
import re

with open('server.js', 'r', encoding='utf-8') as f:
    code = f.read()

# We will just rewrite server.js cleanly.
# I'll output the new server.js content.

new_code = """// 📂 server/server.js
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
"""

# Instead of fully parsing in python, I'll use regex to replace global access in the functions
def process_functions(code):
    functions_code = code.split('// --- FUNCIÓN DE GENERACIÓN')[1]
    functions_code = functions_code.split('io.on(\'connection\'')[0]
    
    # Prefix functions with room
    # We need to change const func = (...) => { to const func = (room, ...) => {
    functions_code = re.sub(r'const fetchPokemonData = async \((.*?)\) => {', r'const fetchPokemonData = async (room, \1) => {', functions_code)
    functions_code = re.sub(r'const fetchPokemonByRarity = async \((.*?)\) => {', r'const fetchPokemonByRarity = async (room, \1) => {', functions_code)
    functions_code = re.sub(r'async function fillPokemonBuffer\(\) {', r'const fillPokemonBuffer = async (room) => {', functions_code)
    functions_code = re.sub(r'const generateQuickShop = async \(\) => {', r'const generateQuickShop = async () => {', functions_code) # Doesn't use room
    functions_code = re.sub(r'const generateItemPool = async \((.*?)\) => {', r'const generateItemPool = async (room, \1) => {', functions_code)
    functions_code = re.sub(r'const startGame = async \(\) => {', r'const startGame = async (room) => {', functions_code)
    functions_code = re.sub(r'const startRound = async \(\) => {', r'const startRound = async (room) => {', functions_code)
    functions_code = re.sub(r'const endRound = async \(\) => {', r'const endRound = async (room) => {', functions_code)
    functions_code = re.sub(r'const handleDisconnect = \((.*?)\) => {', r'const handleDisconnect = (room, \1) => {', functions_code)
    
    # Now replace global state variables with room.*
    globals_list = ['seenPokemonNames', 'persistentData', 'activeSockets', 'playersState', 
                    'activeBidders', 'gameState', 'pokemonBuffer', 'isFetching', 
                    'gameStatus', 'hostId', 'gameSettings', 'timerInterval', 'nextRoundTimeout', 'testSpawnIndex']
    
    for g in globals_list:
        functions_code = re.sub(r'(?<!\.)\b' + g + r'\b', 'room.' + g, functions_code)
        
    # Replace recursive calls or calls to other funcs
    functions_code = re.sub(r'fetchPokemonData\(', 'fetchPokemonData(room, ', functions_code)
    functions_code = re.sub(r'fetchPokemonByRarity\(', 'fetchPokemonByRarity(room, ', functions_code)
    functions_code = re.sub(r'fillPokemonBuffer\(\)', 'fillPokemonBuffer(room)', functions_code)
    functions_code = re.sub(r'startRound\(\)', 'startRound(room)', functions_code)
    functions_code = re.sub(r'endRound\(\)', 'endRound(room)', functions_code)
    functions_code = re.sub(r'stopGameFull\(\)', 'stopGameFull(room)', functions_code)
    functions_code = re.sub(r'broadcastPlayerList\(\)', 'broadcastPlayerList(room)', functions_code)
    
    # Replace io.emit with io.to(room.id).emit
    functions_code = re.sub(r'io\.emit\(', 'io.to(room.id).emit(', functions_code)
    
    return functions_code

part2 = process_functions(code)

with open('refactor.js', 'w', encoding='utf-8') as f:
    f.write(new_code + part2)
