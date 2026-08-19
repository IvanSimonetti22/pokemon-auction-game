import os

newIoLogic = """
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
"""

with open('refactor.js', 'a', encoding='utf-8') as f:
    f.write(newIoLogic)
