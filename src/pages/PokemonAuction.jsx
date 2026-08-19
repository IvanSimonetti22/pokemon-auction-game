// 📂 client/src/pages/PokemonAuction.jsx
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './PokemonAuction.css';
import PokeballImage from '../components/ui/PokeballImage';

// 1. Define la URL del Backend (¡Pega tu link de Render aquí!)
// 🛑 IMPORTANTE: Sin barra "/" al final.
const SOCKET_URL = process.env.NODE_ENV === 'production'
    ? 'https://pokemon-auction-server.onrender.com'
    : 'http://localhost:3001';

// 2. Conectar Socket
const socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'], // Mejora la compatibilidad
    reconnectionAttempts: 5 // Intenta reconectar si Render se duerme
});

const CURRENCY_SYMBOL = '₽';

// 🔮 IMÁGENES DE BALLS (Mapeo de Rareza)
// 🔮 IMÁGENES DE BALLS (Mapeo de Rareza) - DEPRECATED (Ahora usa PokeballImage.jsx)
// const BALL_ICONS = { ... };
// const SHINY_BALL_URL = ...;



const TYPE_ICONS = {
    bug: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/bug.svg',
    dark: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/dark.svg',
    dragon: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/dragon.svg',
    electric: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/electric.svg',
    fairy: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/fairy.svg',
    fighting: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/fighting.svg',
    fire: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/fire.svg',
    flying: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/flying.svg',
    ghost: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/ghost.svg',
    grass: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/grass.svg',
    ground: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/ground.svg',
    ice: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/ice.svg',
    normal: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/normal.svg',
    poison: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/poison.svg',
    psychic: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/psychic.svg',
    rock: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/rock.svg',
    steel: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/steel.svg',
    water: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/water.svg'
};

const GAME_SFX = {
    click: '/sounds/Boton_A.mp3',
    flee: '/sounds/Escapar.mp3',
    catch: '/sounds/pokemon_captura.mp3',
    bid: '/sounds/coins.mp3',
    shiny: '/sounds/shiny.mp3',
    marketClosed: '/sounds/Mercado_Cerrado.mp3',
    itemGet: '/sounds/Item_Obtenido.mp3',
    teleport: '/sounds/teleport.mp3',
    itemSpawn: '/sounds/Item_Aparicion.mp3',
    noFunds: '/sounds/Sin_fondos.mp3',
    itemFlee: '/sounds/Item_Escapa.mp3',
    wonderTrade: '/sounds/Intercambio_Prodigioso.mp3'
};

const SPECIAL_CAPTURE_SOUNDS = {
    regice: '/sounds/regice.mp3',
    regirock: '/sounds/regirock.mp3',
    registeel: '/sounds/registeel.mp3',
    regigigas: '/sounds/regigigas.mp3'
};

// 🎨 COLORES DE TIPOS (Extraídos de tu CSS para consistencia)
const TYPE_COLORS = {
    bug: '#A6B91A', dark: '#705746', dragon: '#6F35FC', electric: '#F7D02C',
    fairy: '#D685AD', fighting: '#C22E28', fire: '#EE8130', flying: '#A98FF3',
    ghost: '#735797', grass: '#7AC74C', ground: '#E2BF65', ice: '#96D9D6',
    normal: '#A8A77A', poison: '#A33EA1', psychic: '#F95587', rock: '#B6A136',
    steel: '#B7B7CE', water: '#6390F0'
};

// 🔥 FUNCIÓN DE ESTILOS (Inyéctala antes del 'export const PokemonAuction')
const getPokemonGlowStyle = (types, isShiny) => {
    if (!types || types.length === 0) return {};

    const c1 = TYPE_COLORS[types[0].original] || '#777';

    // CASO 1: UN SOLO TIPO (Estático)
    if (types.length === 1) {
        return {
            borderColor: c1,
            boxShadow: `0 0 45px ${c1}, inset 0 0 20px ${c1}`
        };
    }

    // CASO 2: DOBLE TIPO (Variables para animación CSS)
    const c2 = TYPE_COLORS[types[1].original] || '#777';
    return {
        '--c1': c1,
        '--c2': c2
    };
};

const playSound = (relativePath, volume = 0.5) => {
    try {
        const audioUrl = window.location.origin + relativePath;
        const audio = new Audio(audioUrl);
        audio.volume = volume;
        audio.currentTime = 0;
        audio.play().catch(e => console.warn("Audio ignorado"));
        return audio;
    } catch (e) { console.error(e); }
};

// Función para cortar audio (solo para teleport ahora)
const playTimedSound = (relativePath, volume = 0.5, duration = 1000) => {
    try {
        const audioUrl = window.location.origin + relativePath;
        const audio = new Audio(audioUrl);
        audio.volume = volume;
        audio.currentTime = 0;
        audio.play().catch(e => console.warn("Audio ignorado"));
        setTimeout(() => { try { audio.pause(); audio.currentTime = 0; } catch (e) { } }, duration);
    } catch (e) { console.error(e); }
};

const STAT_TRANSLATIONS = {
    'hp': 'HP',
    'attack': 'Ataque',
    'ataque': 'Ataque',
    'defense': 'Defensa',
    'defensa': 'Defensa',
    'special-attack': 'Ataque Especial',
    'special-ataque': 'Ataque Especial',
    'special-defense': 'Defensa Especial',
    'special-defensa': 'Defensa Especial',
    'speed': 'Velocidad',
    'velocidad': 'Velocidad',
    'accuracy': 'Precisión',
    'evasion': 'Evasión'
};

export const PokemonAuction = ({ onBack }) => {
    const [screen, setScreen] = useState('room_browser'); // Iniciamos en 'room_browser'
    const [nickname, setNickname] = useState('');
    const [players, setPlayers] = useState([]);

    // Estados de Lobby
    const [isJoined, setIsJoined] = useState(false); // ¿Ya puso nombre?
    const [hostId, setHostId] = useState(null);
    const [gameSettings, setGameSettings] = useState({ mode: 'competitivo', region: 'all' });

    const [currentAuction, setCurrentAuction] = useState(null);

    const [timer, setTimer] = useState(0);
    const [isConnected, setIsConnected] = useState(socket.connected);

    const [currentBid, setCurrentBid] = useState(0);
    const [lastBidder, setLastBidder] = useState('');
    const [customBid, setCustomBid] = useState('');
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const chatEndRef = useRef(null);
    const [message, setMessage] = useState('');

    const [viewBackpackOf, setViewBackpackOf] = useState(null);
    const [selectedItemIdx, setSelectedItemIdx] = useState(null); // Índice del objeto seleccionado en la mochila

    const [floatingError, setFloatingError] = useState(null);
    const [phaseTransitionMsg, setPhaseTransitionMsg] = useState(null);
    // Nuevos estados para la transición genérica
    const [showTransition, setShowTransition] = useState(false);
    const [transitionText, setTransitionText] = useState('');

    const [isChatMinimized, setIsChatMinimized] = useState(false); // Estado para el chat
    const [winnerAnim, setWinnerAnim] = useState(null); // { winner: 'Nick', sprite: 'url' }

    // 🔥 ESTADOS TIENDA DINÁMICA
    const [shopItems, setShopItems] = useState([]);
    const [rerollCost, setRerollCost] = useState(1500);

    // 🔥 ESTADOS PARA MODAL DE DETALLES 🔥
    const [viewingPokemon, setViewingPokemon] = useState(null);
    const [viewingIndex, setViewingIndex] = useState(null); // Para saber qué pokemon del inventario es
    const [selectedAbility, setSelectedAbility] = useState('');
    const [abilityPreferences, setAbilityPreferences] = useState({}); // { [index]: 'Nombre Habilidad' }

    // 🔥 ESTADOS PARA ROOM BROWSER 🔥
    const [roomsList, setRoomsList] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newRoomName, setNewRoomName] = useState('');
    const [newRoomPassword, setNewRoomPassword] = useState('');

    const handleCreateRoom = () => {
        if (!newRoomName.trim()) return alert("El nombre de la sala no puede estar vacío");
        socket.emit('create_room', { name: newRoomName, password: newRoomPassword, nickname });
        setShowCreateModal(false);
        playSound(GAME_SFX.click, 0.5);
    };

    const handleJoinRoom = (room) => {
        let password = '';
        if (room.hasPassword) {
            password = prompt("Esta sala tiene contraseña. Ingrésala:");
            if (password === null) return; // Canceló
        }
        socket.emit('join_room', { roomId: room.id, password, nickname });
        playSound(GAME_SFX.click, 0.5);
    };

    const openPokemonDetails = (pokemon, index) => {
        setViewingPokemon(pokemon);
        setViewingIndex(index);

        // Si ya elegimos una habilidad antes, la cargamos
        if (abilityPreferences[index]) {
            setSelectedAbility(abilityPreferences[index]);
            return;
        }

        // Si no, lógica por defecto
        // Si no, lógica por defecto
        if (pokemon.abilities && pokemon.abilities.length > 0) {
            // Preferimos la habilidad oculta si está desbloqueada, o la primera
            const hidden = pokemon.abilities.find(a => a.isHidden);
            // 🔥 SIEMPRE guardamos el nombre en INGLÉS (engName) para Showdown
            const defaultAb = hidden || pokemon.abilities[0];
            setSelectedAbility(defaultAb.engName || defaultAb.name);
        } else {
            setSelectedAbility('Unknown');
        }
    };

    const closePokemonDetails = () => {
        setViewingPokemon(null);
        setViewingIndex(null);
        setSelectedAbility('');
    };

    // 💾 GUARDAR HABILIDAD (EN VEZ DE COPIAR)
    const handleSaveAbility = () => {
        if (viewingIndex === null) return;
        setAbilityPreferences(prev => ({
            ...prev,
            [viewingIndex]: selectedAbility
        }));
        // Feedback visual o cerrar
        // alert(`Habilidad "${selectedAbility}" guardada para ${viewingPokemon.name}.`); 
        closePokemonDetails();
    };



    useEffect(() => {
        if (!socket.connected) socket.connect();

        socket.on('connect', () => {
            setIsConnected(true);
            socket.emit('get_rooms');
        });
        
        socket.on('rooms_list', (list) => {
            setRoomsList(list);
        });

        socket.on('disconnect', () => setIsConnected(false));

        socket.on('update_players', (data) => {
            const rawList = Array.isArray(data) ? data : [];
            const fixedList = rawList.map(p => ({
                ...p,
                nickname: p.originalName || p.nickname || 'Jugador',
                items: p.items || []
            }));
            setPlayers(fixedList);
            if (viewBackpackOf) {
                const updatedMe = fixedList.find(p => p.nickname === viewBackpackOf.nickname);
                if (updatedMe) setViewBackpackOf(updatedMe);
            }
        });

        socket.on('lobby_info', (data) => {
            setHostId(data.hostId);
            setGameSettings(data.gameSettings);
            if (data.gameStatus === 'playing') {
                setScreen('game'); // Si entra tarde y ya juegan
            } else {
                setScreen('lobby');
            }
        });

        socket.on('settings_updated', (settings) => setGameSettings(settings));

        socket.on('host_changed', (newHostId) => setHostId(newHostId));

        socket.on('game_started', () => {
            // 1. Sonido y Telón abajo
            playSound(GAME_SFX.roundStart, 0.7);
            setTransitionText("GENERANDO MERCADO POKÉMON...");
            setShowTransition(true); // Ponemos la pantalla negra

            // 2. Cambiamos a la pantalla de juego detrás del telón
            // Le damos 1 segundo para asegurar que el componente se monte
            setTimeout(() => {
                setScreen('game');
            }, 1000);

            // 🛑 BORRAMOS EL TIMEOUT QUE HACÍA setShowTransition(false)
            // Ya no adivinamos el tiempo. Esperamos a los datos.
            // 🛡️ ACTUALIZACIÓN: Agregamos failsafe por si el servidor tarda mucho
            setTimeout(() => {
                setShowTransition(false);
            }, 5000);
        });

        socket.on('game_starting', () => setMessage('🎲 Generando Pool Competitiva...'));

        socket.on('game_reset', () => {
            setScreen('lobby');
            setMessage('');
            setCurrentAuction(null);
            setMessages([]);
            setPhaseTransitionMsg(null);
        });

        socket.on('new_pokemon', (data) => {
            if (!data || !data.pokemon) return;

            setPhaseTransitionMsg(null);
            setCurrentAuction(data.pokemon);
            setTimer(data.timer);
            setCurrentBid(data.currentBid);
            setLastBidder('Nadie');
            setMessage('');
            setScreen('game');

            // 🔥 LA SOLUCIÓN: ¡LLEGARON LOS DATOS! LEVANTAMOS EL TELÓN 🔥
            setShowTransition(false);

            if (data.pokemon.type === 'pokemon') {
                if (data.pokemon.cry) {
                    const audio = new Audio(data.pokemon.cry);
                    audio.volume = 0.4;
                    audio.play().catch(() => { });
                }
                if (data.pokemon.isShiny) setTimeout(() => playSound(GAME_SFX.shiny, 0.7), 500);
            } else {
                playSound(GAME_SFX.itemSpawn, 0.6);
            }
        });

        socket.on('update_timer', setTimer);

        socket.on('bid_update', (data) => {
            setCurrentBid(data.amount);
            setLastBidder(data.bidder);
            setTimer(data.timer);
            const isMyBid = data.bidder === nickname;
            const volume = isMyBid ? 0.5 : 0.15;
            playSound(GAME_SFX.bid, volume);
        });

        socket.on('round_ended', (data) => {
            // Ya NO mostramos el mensaje de texto abajo
            // setMessage(data.message); <--- COMENTADO O BORRADO
            setTimer(0);

            if (data.message.includes("CERRADO") || data.message.includes("FINALIZADO")) {

                // 1. Feedback auditivo y visual
                playSound(GAME_SFX.marketClosed, 0.6); // Sonido de cierre
                setMessage(data.message);

                // 2. BAJAMOS EL TELÓN (Pantalla Negra)
                setTransitionText("ACCEDIENDO A MESA DE TRABAJO...");
                setShowTransition(true);

                // 3. CAMBIO DE ESCENA MANUAL (Con Temporizador)
                // Como aquí NO vamos a recibir un "round_started", debemos quitar
                // la pantalla negra nosotros mismos después de unos segundos.
                setTimeout(() => {
                    setScreen('management');  // Cambiamos lo de atrás
                }, 1000); // 1 segundo para tapar el cambio

                setTimeout(() => {
                    setShowTransition(false); // 🛑 LEVANTAMOS EL TELÓN (Fin de la transición)
                }, 3500); // 3.5 segundos total para dar sensación de viaje/carga

            } else if (data.winner) {
                // ALGUIEN GANÓ: ACTIVAR ANIMACIÓN VISUAL
                if (currentAuction) {
                    // 1. Guardamos datos para la animación
                    setWinnerAnim({
                        winner: data.winner,
                        sprite: currentAuction.sprite
                    });

                    // 2. Quitamos la animación después de 3.5 segundos
                    setTimeout(() => setWinnerAnim(null), 3500);
                }

                if (currentAuction && currentAuction.type === 'pokemon') {
                    const pokeName = currentAuction.name.toLowerCase();
                    if (SPECIAL_CAPTURE_SOUNDS[pokeName]) {
                        // 🔥 Regigigas suena completo (playSound normal)
                        playSound(SPECIAL_CAPTURE_SOUNDS[pokeName], 0.6);
                    } else {
                        playSound(GAME_SFX.catch, 0.3);
                    }
                } else {
                    playSound(GAME_SFX.itemGet, 0.5);
                }
            } else {
                if (currentAuction && currentAuction.type === 'item') playSound(GAME_SFX.itemFlee, 0.5);
                else playSound(GAME_SFX.flee, 0.5);
            }
        });

        socket.on('phase_transition', (data) => {
            setPhaseTransitionMsg(data.phaseName);
            playTimedSound(GAME_SFX.teleport, 0.6, 2000);

            // 🔥 FIXED: Auto-ocultar transición si se queda pegada (especialmente para Test Mode -> Management)
            // Normalmente 'new_pokemon' lo limpia, pero si vamos a Mesa de Trabajo, no hay 'new_pokemon'.
            if (data.phaseName.includes("MESA") || data.phaseName.includes("TRABAJO")) {
                setTimeout(() => setPhaseTransitionMsg(null), 4000);
            }
        });

        // 🔥 CRITICAL: Si el juego se actualiza y estamos en management, quitar overlays
        socket.on('update_game', (gameState) => {
            if (gameState.phase === 'management') {
                setPhaseTransitionMsg(null);
                setShowTransition(false); // Por si acaso
                // 🔥 Asegurar que tengamos datos de tienda
                // Si la tienda está vacía, pedimos al server que nos actualice
                if (shopItems.length === 0) {
                    socket.emit('request_shop_state');
                }
            }
        });

        socket.on('chat_message', (msg) => {
            setMessages(prev => [...prev, msg]);
            setTimeout(() => {
                const chatDiv = document.querySelector('.chat-messages');
                if (chatDiv) chatDiv.scrollTop = chatDiv.scrollHeight;
            }, 100);
        });

        socket.on('error_message', (err) => {
            setFloatingError(err);
            playSound(GAME_SFX.noFunds, 0.6);
            setTimeout(() => setFloatingError(null), 3000);
        });

        socket.on('item_bought_success', () => {
            playSound(GAME_SFX.bid, 0.5); // Sonido de compra exitosa
        });

        // 🔥 ESCUCHAR TIENDA DINÁMICA
        socket.on('shop_updated', (data) => {
            setShopItems(data.items);
            setRerollCost(data.rerollCost);
        });

        // 🔥 HOTKEY DEV: Ctrl+S para saltar de fase
        const handleKeyDown = (e) => {
            if (e.code === 'KeyS' && e.ctrlKey) {
                e.preventDefault();
                socket.emit('force_skip');
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            socket.removeAllListeners();
        };
    }, [currentAuction, nickname, viewBackpackOf]);

    const handleManualExit = () => {
        playSound(GAME_SFX.click, 0.5);
        socket.emit('leave_game');
        socket.disconnect();
        if (onBack) onBack();
    };

    const handleLeaveRoom = () => {
        socket.emit('leave_game');
        setScreen('room_browser');
        setIsJoined(true); // actually, isJoined means "logged in with nickname", so keep it true
        setHostId(null);
        socket.emit('get_rooms');
        playSound(GAME_SFX.click, 0.5);
    };

    const handleStartGame = () => {
        socket.emit('start_game');
    };

    const handleSettingChange = (key, value) => {
        const newSettings = { ...gameSettings, [key]: value };
        // Optimista local
        setGameSettings(newSettings);
        // Enviar al server
        socket.emit('update_settings', newSettings);
    };

    const handleReady = () => { socket.emit('user_ready'); playSound(GAME_SFX.click, 0.5); };
    const handleBid = (amount) => { socket.emit('place_bid', currentBid + amount); };
    const handleCustomBid = () => {
        const val = parseInt(customBid);
        if (!val || val <= 100 || val % 100 !== 0) return alert("Múltiplo de 100.");
        if (val <= currentBid) return alert("Debes superar oferta.");
        socket.emit('place_bid', val);
        setCustomBid('');
    };
    const sendChat = (e) => {
        e.preventDefault();
        if (chatInput.trim()) { socket.emit('send_message', chatInput); setChatInput(''); }
    };

    // Seleccionar/Deseleccionar un objeto de la mochila
    const handleSelectItem = (index) => {
        if (selectedItemIdx === index) {
            setSelectedItemIdx(null);
        } else {
            setSelectedItemIdx(index);
            playSound(GAME_SFX.click, 0.4); // <--- CAMBIO: Sonido de selección suave (User asked for select but click is available)
        }
    };

    // Equipar el objeto seleccionado al Pokémon clickeado
    const handleEquipToPokemon = (pokeIndex) => {
        // 1. Validar que haya un objeto seleccionado
        if (selectedItemIdx === null) {
            // Opcional: Podrías mostrar un mensaje tipo "Primero selecciona un objeto"
            return;
        }

        // 2. Emitir evento al servidor
        // Enviamos: Qué objeto (índice mochila) y a Quién (índice equipo)
        socket.emit('equip_item', {
            itemIndex: selectedItemIdx,
            pokemonIndex: pokeIndex
        });

        // 3. Feedback inmediato
        playSound(GAME_SFX.click, 0.6); // 🔥 CAMBIO: Sonido de Botón A
        setSelectedItemIdx(null); // Limpiamos la selección
    };

    // Función para comprar (Simulada o Emitida)
    const handleBuyItem = (item) => {
        // Validacion local rapida de dinero
        if (!myData || myData.money < item.price) return playSound(GAME_SFX.noFunds);

        // Emitimos y esperamos. NO reproducimos sonido aquí.
        // 🔥 IMPORTANTE: Con la tienda dinámica usamos buy_shop_item exactamente igual
        socket.emit('buy_shop_item', item.id);
    };

    // Función de Reroll
    const handleReroll = () => {
        if (!myData || myData.money < rerollCost) return playSound(GAME_SFX.noFunds);
        playSound(GAME_SFX.bid, 0.6); // Usamos sonido de bid/coin como feedback
        socket.emit('reroll_shop');
    };

    // Función para Exportar a Showdown
    const handleExportTeam = () => {
        if (!myData || !myData.inventory) return;

        let showdownText = '';
        myData.inventory.forEach((p, i) => { // Adding index 'i'
            // 🔥 Lógica de Habilidad Actualizada: 1. Preferencia local 2. Oculta 3. Default
            let ability = 'Unknown';
            if (abilityPreferences[i]) {
                ability = abilityPreferences[i];
            } else if (p.abilities && p.abilities.length > 0) {
                const hidden = p.abilities.find(a => a.isHidden);
                ability = hidden ? (hidden.engName || hidden.name) : (p.abilities[0].engName || p.abilities[0].name);
            }

            // Usamos p.originalName (nombre en inglés de la API) si existe, sino p.name
            const pokeName = p.originalName || p.name;
            const itemText = p.heldItem ? ` @ ${p.heldItem.name}` : '';

            showdownText += `${pokeName}${itemText}\n`;
            showdownText += `Ability: ${ability}\n`;

            // ✂️ REMOVIDO: EVs, Nature, Moves, Tera (Solicitud del usuario)

            showdownText += `\n`;
        });
        navigator.clipboard.writeText(showdownText).then(() => {
            // 1. Notificación discreta
            // alert("¡Equipo copiado! Abriendo Showdown...");

            // 2. Abrir Showdown directamente en la sección de Teambuilder
            const win = window.open('https://play.pokemonshowdown.com/teambuilder', '_blank');

            // UX: Enfocar la nueva ventana si el navegador lo permite
            if (win) {
                win.focus();
            } else {
                alert("¡Copiado! Permite pop-ups para abrir Showdown automáticamente.");
            }
        });
    };

    const renderSlots = (inventory) => {
        const inv = Array.isArray(inventory) ? inventory : [];
        const slots = [0, 1, 2, 3, 4, 5];
        return slots.map(i => {
            const poke = inv[i];
            const shinyStyle = poke?.isShiny ? { border: '2px solid cyan', boxShadow: '0 0 10px cyan' } : {};
            return (
                <div key={i} className={`poke-slot ${poke ? 'filled' : ''}`} style={shinyStyle}>
                    {poke && <img src={poke.miniSprite || poke.sprite} alt="slot" />}
                    {poke && poke.heldItem && (
                        <div className="mini-held-item">
                            <img src={poke.heldItem.sprite} alt="item" />
                        </div>
                    )}
                </div>
            );
        });
    };

    const myData = players.find(p => p?.nickname === nickname);
    const isMyBid = lastBidder === nickname;
    const isPokemonAuction = currentAuction?.type === 'pokemon';
    const isFullTeam = myData?.inventory?.length >= 6;
    const disableBidding = isMyBid || (isPokemonAuction && isFullTeam);

    return (
        <div className="auction-container fade-in">

            {floatingError && <div className="error-toast"><span>⚠️</span> {floatingError}</div>}
            {phaseTransitionMsg && <div className="phase-transition-overlay"><h1>⚠️ CAMBIO DE FASE ⚠️</h1><p>Iniciando subasta de: <strong>{phaseTransitionMsg}</strong></p></div>}
            {/* 🔥 NUEVA TRANSICIÓN GENÉRICA 🔥 */}
            {showTransition && (
                <div className="phase-transition-overlay" style={{ zIndex: 9999 }}>
                    <h1>🔄 CARGANDO...</h1>
                    <p>{transitionText}</p>
                </div>
            )}

            <button className="exit-btn-fixed" onClick={handleManualExit}>⬅ SALIR</button>

            <button className="exit-btn-fixed" onClick={handleManualExit}>⬅ SALIR</button>

            {screen === 'room_browser' && (
                <div className="lobby-container fade-in">
                    <h1 className="lobby-title">SUBASTA <span style={{ color: 'gold' }}>POKÉMON</span></h1>
                    
                    {!isJoined ? (
                        <div className="login-card">
                            <h3>¿Cómo te llamarás, Entrenador?</h3>
                            <input
                                type="text"
                                placeholder="Tu Nickname..."
                                value={nickname}
                                onChange={e => setNickname(e.target.value)}
                                maxLength={12}
                            />
                            <button onClick={() => {
                                if (!nickname.trim()) return alert("¡Ponte un nombre!");
                                setIsJoined(true);
                                socket.emit('get_rooms');
                                playSound(GAME_SFX.click, 0.5);
                            }}>CONTINUAR</button>
                        </div>
                    ) : (
                        <div className="room-browser">
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                                <h2>Salas Disponibles</h2>
                                <button onClick={() => setShowCreateModal(true)} style={{padding: '10px 20px', background: '#ffd700', color: 'black', fontWeight: 'bold', borderRadius: '5px', border: 'none', cursor: 'pointer'}}>+ Crear Sala</button>
                            </div>
                            
                            <div className="rooms-grid" style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                                {roomsList.length === 0 ? <p style={{textAlign: 'center', color: '#ccc'}}>No hay salas disponibles. ¡Crea una!</p> : null}
                                {roomsList.map(r => (
                                    <div key={r.id} style={{background: '#2d3436', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #555'}}>
                                        <div>
                                            <h3 style={{margin: '0 0 5px 0', color: '#fff'}}>{r.name} {r.hasPassword && '🔒'}</h3>
                                            <p style={{margin: 0, fontSize: '0.9rem', color: '#aaa'}}>Jugadores: {r.playersCount}</p>
                                        </div>
                                        <button onClick={() => handleJoinRoom(r)} style={{padding: '8px 15px', background: '#4CAF50', color: 'white', borderRadius: '5px', border: 'none', cursor: 'pointer'}}>
                                            Unirse
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {showCreateModal && (
                        <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999}}>
                            <div className="login-card" style={{position: 'relative'}}>
                                <button onClick={() => setShowCreateModal(false)} style={{position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer'}}>✖</button>
                                <h3>Crear Nueva Sala</h3>
                                <input type="text" placeholder="Nombre de la sala..." value={newRoomName} onChange={e => setNewRoomName(e.target.value)} maxLength={20} style={{marginBottom: '10px'}} />
                                <input type="password" placeholder="Contraseña (Opcional)..." value={newRoomPassword} onChange={e => setNewRoomPassword(e.target.value)} maxLength={20} />
                                <button onClick={handleCreateRoom} style={{marginTop: '15px'}}>CREAR Y ENTRAR</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {screen === 'lobby' && (
                <div className="lobby-container fade-in">
                    <h1 className="lobby-title">SALA <span style={{ color: 'gold' }}>DE ESPERA</span></h1>

                        {/* --- PASO 2: SALA DE ESPERA --- */}
                        <div className="waiting-room">
                            <div className="players-list-lobby">
                                <h3>Jugadores ({players.filter(p => p).length})</h3>
                                <div className="lobby-avatars">
                                    {players.map(p => (
                                        <div key={p.id || Math.random()} className="lobby-player-card">
                                            <div className="avatar-circle">
                                                {/* Avatar temporal random o inicial de nombre */}
                                                {(p.nickname || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <span>{p.nickname} {p.id === hostId && '👑'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* PANEL DE CONFIGURACIÓN (Visible para todos, editable solo por Host) */}
                            <div className="game-settings-panel">
                                <h3>Configuración de Partida</h3>

                                <div className="setting-row">
                                    <label>Modo de Juego:</label>
                                    {socket.id === hostId ? (
                                        <select value={gameSettings.mode} onChange={(e) => handleSettingChange('mode', e.target.value)}>
                                            <option value="iniciales_base">Solo Iniciales (Base)</option>
                                            <option value="iniciales_final">Solo Iniciales (Final)</option>
                                            <option value="competitivo">Competitivo (Finales)</option>
                                            <option value="randomlocke">Randomlocke (Base + Evos)</option>
                                            <option value="full_random">Caos Total (Random)</option>
                                            <option value="biomas">Modo Biomas (Dinámico)</option>
                                        </select>
                                    ) : (
                                        <span className="locked-setting">{gameSettings.mode.toUpperCase().replace('_', ' ')}</span>
                                    )}
                                </div>

                                <div className="setting-row">
                                    <label>Región:</label>
                                    {socket.id === hostId ? (
                                        <select value={gameSettings.region} onChange={(e) => handleSettingChange('region', e.target.value)}>
                                            <option value="all">Todas las Regiones</option>
                                            <option value="kanto">Kanto (Gen 1)</option>
                                            <option value="johto">Johto (Gen 2)</option>
                                            <option value="hoenn">Hoenn (Gen 3)</option>
                                        </select>
                                    ) : (
                                        <span className="locked-setting">{gameSettings.region.toUpperCase()}</span>
                                    )}
                                </div>
                            </div>

                            <div className="lobby-footer" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <button onClick={handleLeaveRoom} style={{padding: '10px 20px', background: '#e74c3c', color: 'white', borderRadius: '5px', border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>SALIR DE LA SALA</button>
                                {socket.id === hostId ? (
                                    <button className="start-game-btn" onClick={handleStartGame}>
                                        ¡INICIAR PARTIDA!
                                    </button>
                                ) : (
                                    <p className="waiting-msg" style={{margin: 0}}>Esperando al líder de la sala...</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {screen !== 'login' && screen !== 'lobby' && screen !== 'management' && (
                <>
                    <div className="players-top-section">
                        {players.map(p => {
                            if (!p) return null;
                            const pName = p.nickname || 'Desconocido';
                            const isMe = pName.toLowerCase() === nickname.toLowerCase();
                            const cardStyle = isMe ? { border: '3px solid #ffd700', boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)', transform: 'scale(1.05)', zIndex: 100, backgroundColor: '#2d3436', color: 'white' } : { backgroundColor: '#2f3640', color: '#cccccc' };

                            // 🔥 VERIFICAR SI ESTE JUGADOR ES EL GANADOR ACTUAL
                            const isWinner = winnerAnim && winnerAnim.winner === pName;

                            return (
                                <div key={p.id || Math.random()} className="player-header-card" style={cardStyle}>

                                    {/* 🔥 ANIMACIÓN DE VICTORIA SUPERPUESTA */}
                                    {isWinner && (
                                        <div className="winner-overlay">
                                            <img src={winnerAnim.sprite} alt="Win" className="winner-sprite-anim" />
                                        </div>
                                    )}

                                    <div className="p-name" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: '5px' }}>
                                        <span style={{ color: isMe ? '#ffd700' : '#ffffff', fontWeight: '900', fontSize: '1.1rem', textShadow: '1px 1px 2px black', zIndex: 20 }}>{pName}</span>
                                        {isMe && <span style={{ backgroundColor: '#ffd700', color: '#000', fontSize: '0.6rem', padding: '1px 4px', borderRadius: '4px', marginLeft: '6px', fontWeight: '900', zIndex: 20 }}>TÚ</span>}
                                        {p.isReady && screen === 'lobby' && ' ✅'}
                                    </div>
                                    <div className="p-money">{CURRENCY_SYMBOL} {(p.money || 0).toLocaleString()}</div>
                                    <div className="slots-container">{renderSlots(p.inventory)}</div>
                                    <div className="p-backpack-container" onClick={() => setViewBackpackOf(p)}><span>🎒</span><span style={{ textDecoration: 'underline' }}>Ver Mochila</span></div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Old Lobby Block Removed */}

                    {screen === 'game' && !currentAuction && (
                        <div className="waiting-for-data" style={{ padding: '50px', textAlign: 'center' }}>
                            <h2>⏳ Sincronizando Mercado...</h2>
                        </div>
                    )}

                    {screen === 'game' && currentAuction && !phaseTransitionMsg && (
                        <div className="game-layout-wrapper">
                            <div className="game-board">
                                <div style={{ position: 'absolute', top: '10px', right: '20px', fontSize: '2rem', fontWeight: 'bold', color: timer < 5 ? 'red' : 'white' }}>⏱ {timer}s</div>
                                <div className="pokemon-display-container">
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        {/* 🔥 LÓGICA DE RENDERIZADO AJUSTADA PARA MOSTRAR POKÉ BALL Y ESTRELLA 🔥 */}
                                        {currentAuction.type === 'pokemon' ? (
                                            <div
                                                className={`pokemon-card-circle rarity-${currentAuction.rarity} ${currentAuction.types.length > 1 ? 'dual-ring' : ''}`}
                                                style={getPokemonGlowStyle(currentAuction.types, currentAuction.isShiny)}
                                            >

                                                <img src={currentAuction.sprite} alt={currentAuction.name} style={{ zIndex: 2, position: 'relative' }} />

                                                {/* Badge Poké Ball */}
                                                <div className="rarity-badge-img" title={currentAuction.rarity}>
                                                    <PokeballImage
                                                        type={(() => {
                                                            if (currentAuction.isShiny) return "Lujo Ball";
                                                            switch (currentAuction.rarity) {
                                                                case 'ultraente': return "Ente Ball";
                                                                case 'legendario':
                                                                case 'singular': return "Master Ball";
                                                                case 'pseudolegendario': return "Ultra Ball";
                                                                default: return "Poke Ball";
                                                            }
                                                        })()}
                                                        size="w-8 h-8"
                                                    />
                                                    {currentAuction.isShiny && <span className="shiny-star">✨</span>}
                                                </div>

                                            </div>
                                        ) : (
                                            <div className="item-card-circle"><img src={currentAuction.sprite} alt={currentAuction.displayName} /></div>
                                        )}

                                        {currentAuction.type === 'pokemon' && (
                                            <div className="types-row">
                                                {currentAuction.types && currentAuction.types.map((t, idx) => (
                                                    <span key={idx} className={`type-badge type-${t.original}`}><div className="type-icon-wrapper"><img src={TYPE_ICONS[t.original]} alt={t.original} /></div>{t.translated}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="info-panel-right">
                                        <h2 style={currentAuction.isShiny ? { color: 'cyan', textShadow: '0 0 10px cyan' } : {}}>{currentAuction.displayName || currentAuction.name} {currentAuction.isShiny && '✨'}</h2>
                                        {currentAuction.type === 'pokemon' ? (
                                            <>
                                                <div className="stats-grid">
                                                    {currentAuction.stats && currentAuction.stats.map(s => {
                                                        const rawName = s.name.toLowerCase();
                                                        return (
                                                            <div key={s.name} className="stat-item">
                                                                <span className="stat-name">{STAT_TRANSLATIONS[rawName] || s.name}</span>
                                                                <span className={`stat-value ${s.value >= 100 ? 'high-stat' : ''}`}>{s.value}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div className="abilities-box">
                                                    {currentAuction.abilities && currentAuction.abilities.map((ab, idx) => (<div key={idx} className="ability-row"><div className="ability-name">{ab.name} {ab.isHidden && <span className="hidden-tag">Oculta</span>}</div><span className="ability-desc">{ab.description}</span></div>))}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="item-description-box"><p>📌 <strong>Efecto:</strong></p><p>{currentAuction.description}</p></div>
                                        )}
                                    </div>
                                </div>
                                <div className="auction-controls">
                                    <p className="last-bidder">Líder actual: <strong>{lastBidder || 'Nadie'}</strong></p>
                                    <div className="current-price">{CURRENCY_SYMBOL} {currentBid.toLocaleString()}</div>
                                    {isPokemonAuction && isFullTeam && <div className="status-floating-msg team-full">🚫 EQUIPO COMPLETO</div>}
                                    {!isFullTeam && isMyBid && <div className="status-floating-msg winning">👑 VAS GANANDO</div>}
                                    <div className={`bid-buttons-row ${disableBidding ? 'disabled-row' : ''}`}>
                                        <button className="bid-btn bid-btn-green" onClick={() => handleBid(100)} disabled={disableBidding}>+ {CURRENCY_SYMBOL} 100</button>
                                        <button className="bid-btn bid-btn-green" onClick={() => handleBid(500)} disabled={disableBidding}>+ {CURRENCY_SYMBOL} 500</button>
                                        <button className="bid-btn bid-btn-high" onClick={() => handleBid(1000)} disabled={disableBidding}>+ {CURRENCY_SYMBOL} 1000</button>
                                        <div className="custom-bid-group">
                                            <span style={{ fontSize: '0.8rem', color: '#aaa' }}>{CURRENCY_SYMBOL}</span>
                                            <input className="custom-input" type="number" placeholder="3400" value={customBid} onChange={e => setCustomBid(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCustomBid()} disabled={disableBidding} />
                                            <button className="custom-confirm-btn" onClick={handleCustomBid} disabled={disableBidding}>OK</button>
                                        </div>
                                    </div>
                                </div>
                                {message && <div style={{ marginTop: '15px', color: 'gold', fontWeight: 'bold', fontSize: '1.2rem', background: 'rgba(0,0,0,0.5)', padding: '5px', borderRadius: '5px' }}>{message}</div>}
                            </div>

                            <div className={`chat-container ${isChatMinimized ? 'minimized' : ''}`}>
                                <div className="chat-header" onClick={() => isChatMinimized && setIsChatMinimized(false)}>
                                    💬 Chat de Sala
                                    {/* Botón Toggle */}
                                    <button className="chat-toggle-btn" onClick={(e) => { e.stopPropagation(); setIsChatMinimized(!isChatMinimized); }}>
                                        {isChatMinimized ? '+' : '-'}
                                    </button>
                                </div>

                                {/* El contenido del chat solo se renderiza/ve si no está minimizado o usando CSS overflow */}
                                <div className="chat-messages">
                                    {messages.map((m, i) => (
                                        <div key={i} className={`chat-msg ${m.type}`}>
                                            {m.type === 'player' && <span className="user">{m.user}: </span>}
                                            {m.text}
                                        </div>
                                    ))}
                                    <div ref={chatEndRef} />
                                </div>
                                <form className="chat-input-area" onSubmit={sendChat}>
                                    <input className="chat-input" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="..." disabled={isChatMinimized} />
                                    <button className="chat-send" type="submit">➤</button>
                                </form>
                            </div>
                        </div>
                    )}
                </>
            )}



            {/* --- PANTALLA DE GESTIÓN DE EQUIPO --- */}
            {screen === 'management' && myData && (
                <div className="management-container fade-in">
                    <h2 style={{ color: 'gold', textAlign: 'center', marginBottom: '20px' }}>🛠️ MESA DE TRABAJO 🛠️</h2>

                    <div className="management-grid">

                        {/* COLUMNA 1: TIENDA DINÁMICA */}
                        <div className="mgmt-panel shop-panel">
                            <h3>🏪 Tienda Rápida</h3>
                            <div style={{ color: '#4CAF50', marginBottom: '10px', textAlign: 'center', fontWeight: 'bold' }}>
                                Tu Dinero: ${myData.money.toLocaleString()}
                            </div>

                            {/* 🔥 BOTÓN DE REROLL */}
                            <div className="reroll-section" style={{ textAlign: 'center', marginBottom: '15px' }}>
                                <button
                                    className={`reroll-btn ${myData.money < rerollCost ? 'disabled' : ''}`}
                                    onClick={handleReroll}
                                    disabled={myData.money < rerollCost}
                                    style={{
                                        backgroundColor: '#e17055', color: 'white', border: 'none',
                                        padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold',
                                        opacity: myData.money < rerollCost ? 0.5 : 1
                                    }}
                                >
                                    🔄 Reroll (${rerollCost})
                                </button>
                            </div>

                            <div className="shop-list">
                                {/* 🔥 USAMOS EL STATE shopItems OBTENIDO DEL SERVER */}
                                {shopItems.map(item => {
                                    // --- CALCULAR SI ESTÁ AGOTADO ---
                                    // 1. Cantidad en mochila
                                    const inBag = myData.items ? myData.items.filter(i => i.originalId === item.id || i.id === item.id).length : 0;
                                    // 2. Cantidad equipada
                                    const equipped = myData.inventory ? myData.inventory.filter(p => p.heldItem && (p.heldItem.originalId === item.id || p.heldItem.id === item.id)).length : 0;
                                    // 3. Límite
                                    const limit = item.id.includes('berry') ? 3 : 1;
                                    const isMaxed = (inBag + equipped) >= limit;
                                    // --------------------------------

                                    return (
                                        <div key={item.id} className="shop-item">
                                            <img src={item.sprite} alt={item.name} style={{ width: '30px' }} />
                                            <div style={{ flex: 1, textAlign: 'left', marginLeft: '10px' }}>
                                                <div style={{ fontSize: '0.9rem' }}>{item.displayName || item.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'gold' }}>${item.price} - {item.id.includes('berry') ? '🍒' : '📦'}</div>
                                            </div>

                                            <button
                                                className={`buy-btn ${isMaxed ? 'disabled' : ''}`}
                                                onClick={() => !isMaxed && handleBuyItem(item)}
                                                disabled={isMaxed} // Desactiva el click real
                                            >
                                                {isMaxed ? 'Lleno' : 'Comprar'}
                                            </button>
                                        </div>
                                    );
                                })}
                                {shopItems.length === 0 && <p style={{ textAlign: 'center', color: '#777' }}>Cargando ofertas...</p>}
                            </div>
                        </div>

                        {/* COLUMNA 2: TU EQUIPO (Centro) */}
                        <div className="mgmt-panel team-panel">
                            <h3>🐉 Tu Equipo Final (Click para equipar)</h3>
                            <div className="team-grid-mgmt">
                                {myData.inventory.map((p, idx) => (
                                    <div key={idx}
                                        className={`mgmt-poke-card ${selectedItemIdx !== null ? 'waiting-item' : ''}`}
                                        onClick={() => {
                                            if (selectedItemIdx !== null) handleEquipToPokemon(idx);
                                            else openPokemonDetails(p, idx); // Pasamos índice
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <img src={p.sprite} alt={p.name} />
                                        <div style={{ fontWeight: 'bold' }}>{p.displayName}</div>

                                        {/* Slot de objeto */}
                                        <div className="mgmt-item-slot">
                                            {p.heldItem ? (
                                                <img src={p.heldItem.sprite} alt="item" title={p.heldItem.name} />
                                            ) : (
                                                <span style={{ fontSize: '0.7rem', color: '#555' }}>Sin Objeto</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {myData.inventory.length === 0 && <p>No ganaste ningún Pokémon :(</p>}
                            </div>

                            <div className="export-bar">
                                <button className="export-btn" onClick={handleExportTeam}>📋 EXPORTAR A SHOWDOWN</button>
                            </div>
                        </div>

                        {/* COLUMNA 3: TU MOCHILA */}
                        <div className="mgmt-panel backpack-panel">
                            <h3>🎒 Tu Mochila</h3>
                            <p style={{ fontSize: '0.8rem', color: '#aaa' }}>Selecciona un objeto para equiparlo.</p>
                            <div className="items-grid">
                                {myData.items && myData.items.map((item, idx) => (
                                    <div key={idx}
                                        className={`item-slot ${selectedItemIdx === idx ? 'selected' : ''}`}
                                        onClick={() => handleSelectItem(idx)} // Reutilizamos función de seleccionar
                                    >
                                        <img src={item.sprite} alt={item.displayName} />
                                        <div className="item-tooltip">{item.displayName}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {viewBackpackOf && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>🎒 Mochila de {viewBackpackOf.nickname}</h2>
                        <div className="backpack-split">
                            <div className="backpack-section">
                                <h3>
                                    {/* 1. TÍTULO DE OBJETOS */}
                                    {viewBackpackOf.nickname === nickname
                                        ? "Mochila (Click para equipar)"
                                        : `Mochila de ${viewBackpackOf.nickname}`}
                                </h3>
                                <div className="items-grid">
                                    {viewBackpackOf.items && viewBackpackOf.items.map((item, idx) => (
                                        <div key={idx} className={`item-slot ${selectedItemIdx === idx ? 'selected' : ''}`} onClick={() => handleSelectItem(idx)}>
                                            <img src={item.sprite} alt={item.displayName} />
                                            <div className="item-tooltip">{item.displayName}</div>
                                        </div>
                                    ))}
                                    {(!viewBackpackOf.items || viewBackpackOf.items.length === 0) && <span style={{ color: '#666', fontStyle: 'italic' }}>Sin objetos...</span>}
                                </div>
                            </div>
                            <div className="backpack-section">
                                <h3>
                                    {/* 2. TÍTULO DE EQUIPO */}
                                    {viewBackpackOf.nickname === nickname
                                        ? "Tu Equipo (Click para equipar)"
                                        : `Equipo de ${viewBackpackOf.nickname}`}
                                </h3>
                                <div className="inventory-grid">
                                    {viewBackpackOf.inventory && viewBackpackOf.inventory.map((poke, index) => (
                                        <div key={index} className="inventory-item" style={{ cursor: selectedItemIdx !== null ? 'pointer' : 'default', border: selectedItemIdx !== null ? '2px dashed #a29bfe' : '1px solid #444' }} onClick={() => handleEquipToPokemon(index)}>
                                            <img src={poke.sprite} alt={poke.name} />
                                            <div>{poke.displayName}</div>
                                            {poke.heldItem && <div style={{ marginTop: '5px', borderTop: '1px solid #444', paddingTop: '2px', fontSize: '0.8rem', color: '#a29bfe' }}>🛡️ {poke.heldItem.displayName}</div>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button className="close-modal-btn" onClick={() => { setViewBackpackOf(null); setSelectedItemIdx(null); }}>Cerrar</button>
                    </div>
                </div>
            )}
            {/* 🔥 MODAL DE DETALLES Y EXPORTACIÓN 🔥 */}
            {viewingPokemon && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    backdropFilter: 'blur(5px)',
                    zIndex: 1000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }} onClick={closePokemonDetails}>

                    <div className="modal-content tech-border" style={{
                        background: '#111', padding: '30px', borderRadius: '15px',
                        maxWidth: '700px', width: '90%', border: '1px solid #0ff',
                        boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
                        position: 'relative', display: 'flex', flexDirection: 'column', gap: '20px'
                    }} onClick={e => e.stopPropagation()}>

                        <div className="modal-header" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <img src={viewingPokemon.sprite} alt={viewingPokemon.name} style={{ width: '80px' }} />
                            <div>
                                <h2 className="neon-text" style={{ margin: 0, fontSize: '2rem', color: 'white' }}>{viewingPokemon.name}</h2>
                                <span style={{ color: '#aaa' }}>Export Manager</span>
                            </div>
                        </div>

                        <div className="ability-section">
                            <label style={{ color: '#0ff', display: 'block', marginBottom: '10px' }}>Habilidad Activa:</label>
                            {viewingPokemon.abilities && viewingPokemon.abilities.length > 1 ? (
                                <select
                                    value={selectedAbility}
                                    onChange={(e) => setSelectedAbility(e.target.value)}
                                    style={{
                                        width: '100%', padding: '10px', background: '#000',
                                        color: '#fff', border: '1px solid #333', borderRadius: '5px',
                                        fontSize: '1rem'
                                    }}
                                >
                                    {viewingPokemon.abilities.map(ab => (
                                        <option key={ab.name} value={ab.engName || ab.name}>{ab.name} {ab.isHidden ? '(Oculta)' : ''}</option>
                                    ))}
                                </select>
                            ) : (
                                <div style={{
                                    padding: '10px', background: 'rgba(0,255,255,0.1)',
                                    border: '1px dashed #0ff', color: '#fff'
                                }}>
                                    {viewingPokemon.abilities && viewingPokemon.abilities[0] ? (viewingPokemon.abilities[0].engName || viewingPokemon.abilities[0].name) : 'Unknown'}
                                </div>
                            )}

                            {/* 🔥 DESCRIPCIÓN DE HABILIDAD 🔥 */}
                            <div style={{
                                marginTop: '15px', padding: '15px',
                                background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px',
                                borderLeft: '4px solid #0ff', fontStyle: 'italic', color: '#ddd'
                            }}>
                                {(() => {
                                    // Buscar la habilidad seleccionada para mostrar su descripción
                                    if (!viewingPokemon.abilities) return "Sin descripción.";
                                    const currentAb = viewingPokemon.abilities.find(ab => (ab.engName || ab.name) === selectedAbility) || viewingPokemon.abilities[0];
                                    return currentAb ? (currentAb.description || "Sin descripción disponible.") : "Selecciona una habilidad.";
                                })()}
                            </div>
                        </div>

                        <div className="mini-stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            {viewingPokemon.stats && viewingPokemon.stats.map(s => {
                                const raw = s.name.toLowerCase();
                                return (
                                    <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#ddd' }}>
                                        <span>{STAT_TRANSLATIONS[raw] || s.name}:</span>
                                        <span style={{ color: '#0ff' }}>{s.value}</span>
                                    </div>
                                )
                            })}
                        </div>

                        {/* 🔥 ZONA DE LABORATORIO (REROLL) 🔥 */}
                        {screen === 'management' && (
                            <div className="reroll-section" style={{
                                marginTop: '15px', padding: '15px',
                                border: '1px solid #e74c3c', borderRadius: '8px',
                                background: 'rgba(231, 76, 60, 0.1)', textAlign: 'center'
                            }}>
                                <h4 style={{ color: '#e74c3c', margin: '0 0 10px 0' }}>🧬 RECOMBINADOR GENÉTICO</h4>

                                {viewingPokemon.wasRerolled ? (
                                    <div style={{ color: '#ff6b6b', fontStyle: 'italic', fontWeight: 'bold' }}>
                                        ⚠️ Genoma inestable. No admite más cambios.
                                    </div>
                                ) : (
                                    <>
                                        {(() => {
                                            // 🔥 CÁLCULO DINÁMICO DE COSTO (Frontend)
                                            // Debe coincidir con server.js
                                            const myPlayer = players.find(p => p.id === socket.id) || {};
                                            const myRerollCount = myPlayer.rerollCount || 0;
                                            const isLegend = ['legendario', 'singular', 'ultraente'].includes(viewingPokemon.rarity);
                                            const basePrice = isLegend ? 5000 : 2000;
                                            const finalPrice = basePrice + (myRerollCount * 1000);

                                            return (
                                                <>
                                                    <p style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '10px' }}>
                                                        Coste actual: <span style={{ color: '#ffdd57', fontWeight: 'bold' }}>${finalPrice}</span> <br />
                                                        <span style={{ fontSize: '0.7em' }}>(Base: ${basePrice} + Uso #{myRerollCount}: ${myRerollCount * 1000})</span>
                                                    </p>
                                                    <button
                                                        className="reroll-btn"
                                                        onClick={() => {
                                                            if (window.confirm(`¿Gastar $${finalPrice} para recombinar a ${viewingPokemon.name}? (Irreversible)`)) {
                                                                playSound(GAME_SFX.wonderTrade, 0.7); // 🔥 SONIDO NUEVO
                                                                if (socket) socket.emit('reroll_pokemon', { pokemonIndex: viewingIndex });
                                                                closePokemonDetails();
                                                            }
                                                        }}
                                                        style={{
                                                            background: '#c0392b', color: 'white', border: 'none',
                                                            padding: '10px 20px', borderRadius: '5px',
                                                            cursor: 'pointer', fontWeight: 'bold',
                                                            boxShadow: '0 0 10px #c0392b'
                                                        }}
                                                    >
                                                        ♻️ RECOMBINAR (${finalPrice})
                                                    </button>
                                                </>
                                            );
                                        })()}
                                    </>
                                )}
                            </div>
                        )}

                        <div className="modal-actions" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button
                                onClick={handleSaveAbility}
                                className="action-card-btn"
                                style={{ flex: 1, background: 'rgba(0, 255, 0, 0.2)', border: '1px solid #0f0', color: '#0f0', padding: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                💾 GUARDAR SELECCIÓN
                            </button>
                            <button
                                onClick={closePokemonDetails}
                                style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #666', color: '#666', cursor: 'pointer' }}
                            >
                                CERRAR
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};