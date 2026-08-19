exports.FORCED_SPAWNS = ['charizard', 'gengar', 'lucario', 'salamence', 'metagross'];

exports.PSEUDO_LEGENDARIES = [
  'dragonite', 'tyranitar', 'salamence', 'metagross', 'garchomp',
  'hydreigon', 'goodra', 'kommo-o', 'dragapult', 'baxcalibur'
];

exports.ULTRA_BEASTS = [
  'nihilego', 'buzzwole', 'pheromosa', 'xurkitree', 'celesteela',
  'kartana', 'guzzlord', 'poipole', 'naganadel', 'stakataka', 'blacephalon'
];

exports.TYPE_TRANSLATIONS = {
  normal: 'Normal', fighting: 'Pelea', flying: 'Volador', poison: 'Veneno',
  ground: 'Tierra', rock: 'Roca', bug: 'Insecto', ghost: 'Fantasma',
  steel: 'Acero', fire: 'Fuego', water: 'Agua', grass: 'Planta',
  electric: 'Eléctrico', psychic: 'Psíquico', ice: 'Hielo', dragon: 'Dragón',
  dark: 'Siniestro', fairy: 'Hada'
};

// 💎 MASTER LIST DE OBJETOS (SIN COVERT CLOAK)
exports.MASTER_ITEM_LIST = [
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
exports.seenPokemonNames = new Set();
exports.MEGA_STONES = {
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
let activeBidders = new Set(); // 🔥 TAREA 3: Tracking de pujadores

let gameState = {
  status: 'lobby',
  phase: 'pokemon',
  currentAuction: null,
  pokemonPool: [],
  itemPool: [],
  timer: 0,
  highestBid: 0,
  highestBidder: null,
  highestBid: 0,
  highestBidder: null,
  roundsPlayed: 0,
  extensions: 0 // 🔥 Timer Logic: Contador de extensiones
};

// --- BUFFER DE POKÉMON ---
let pokemonBuffer = []; // Cola de Pokémon listos para salir
exports.BUFFER_SIZE = 2;  // Cuántos Pokémon queremos tener adelantados
let isFetching = false; // Semáforo para no saturar la API
// --------------------------

let gameStatus = 'lobby'; // 'lobby', 'playing', 'management'
let hostId = null;        // ID del socket del líder de la sala
let gameSettings = {      // Configuración por defecto
  mode: 'competitivo',  // 'iniciales', 'competitivo', 'random', etc.
  region: 'all'
};

// 🔥 GENERADOR DE TIENDA RÁPIDA (Ponderada)
exports.generateQuickShop = async () => {
  exports.shopItems = [];
  // Copia local para evitar duplicados en la misma tira
  exports.localPool = [...MASTER_ITEM_LIST];

  for (let i = 0; i < 5; i++) {
    if (localPool.length === 0) break;

    // Lógica de Ponderación: 40% Baya, 60% Otro
    // Filtramos las bayas disponibles
    exports.berries = localPool.filter(i => i.includes('berry'));
    exports.others = localPool.filter(i => !i.includes('berry'));

    let selectedName;
    // Si hay bayas y sale el chance (o no hay otros), sacamos baya
    if (berries.length > 0 && (Math.random() < 0.4 || others.length === 0)) {
      exports.idx = Math.floor(Math.random() * berries.length);
      selectedName = berries[idx];
    } else {
      // Si no es baya (o no hay bayas), sacamos otro
      exports.idx = Math.floor(Math.random() * others.length);
      selectedName = others[idx];
    }

    // Lo sacamos del pool local para no repetir en esta tienda
    exports.removeIdx = localPool.indexOf(selectedName);
    if (removeIdx > -1) localPool.splice(removeIdx, 1);

    // FETCH DATA
    try {
      exports.res = await axios.get(`https://pokeapi.co/api/v2/item/${selectedName}`);
      exports.data = res.data;
      exports.nameEntry = data.names.find(n => n.language.name === 'es');
      exports.manualData = MANUAL_TRANSLATIONS[selectedName];
      exports.displayName = manualData?.name || (nameEntry ? nameEntry.name : data.name);

      exports.esEntries = data.flavor_text_entries.filter(f => f.language.name === 'es');
      exports.enEntries = data.flavor_text_entries.filter(f => f.language.name === 'en');

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

// 🔥 DICCIONARIO DE TRADUCCIÓN MANUAL (Para cosas que la API devuelve en Inglés/Vacío)
exports.MANUAL_TRANSLATIONS = {
  // Items Gen 9 & Nuevos
  'mirror-herb': { name: 'Hierba Copia', desc: 'Copia los aumentos de estadísticas del rival una vez.' },
  'loaded-dice': { name: 'Dado Trucado', desc: 'Aumenta la probabilidad de acertar golpes múltiples.' },
  'covert-cloak': { name: 'Capa Furtiva', desc: 'Protege de los efectos secundarios de los movimientos.' },
  'booster-energy': { name: 'Energía Potenciadora', desc: 'Activa la habilidad de las paradojas del pasado/futuro.' },
  'clear-amulet': { name: 'Amuleto Puro', desc: 'Evita que bajen las estadísticas por movimientos rivales.' },
  'punching-glove': { name: 'Guante de Boxeo', desc: 'Potencia los movimientos de puños y protege del contacto.' },
  'ability-shield': { name: 'Escudo Habilidad', desc: 'Evita que la habilidad del portador sea anulada.' },
  'fairy-feather': { name: 'Pluma Feérica', desc: 'Potencia los movimientos de tipo Hada.' },
  // Habilidades Especiales / Gen 9
  'full-metal-body': { name: 'Guardia Metálica', desc: 'Evita que bajen sus características a causa de movimientos o habilidades de otros Pokémon.' },
  'neuroforce': { name: 'Fuerza Cerebral', desc: 'Potencia los ataques supereficaces.' },
  'prism-armor': { name: 'Armadura Prisma', desc: 'Reduce el daño de ataques supereficaces.' },
  'shadow-shield': { name: 'Guardia Espectro', desc: 'Reduce el daño recibido si los PS están al máximo.' },
  'beast-boost': { name: 'Ultraimpulso', desc: 'Sube la estadística más alta al debilitar a un rival.' },
  'quark-drive': { name: 'Carga Cuark', desc: 'Sube la estadística más alta en Campo Eléctrico o con Energía Potenciadora.' },
  'protosynthesis': { name: 'Protosíntesis', desc: 'Sube la estadística más alta en Sol o con Energía Potenciadora.' },
  'orichalcum-pulse': { name: 'Latido Oricalco', desc: 'Invoca el sol al entrar y potencia el Ataque.' },
  'hadron-engine': { name: 'Motor Hadrónico', desc: 'Invoca un Campo Eléctrico al entrar y potencia el Ataque Especial.' },
  'supreme-overlord': { name: 'General Supremo', desc: 'Aumenta el ataque por cada aliado debilitado.' },
  'cud-chew': { name: 'Rumia', desc: 'El Pokémon vuelve a comer una baya tras usarla.' },
  'sharpness': { name: 'Cortante', desc: 'Potencia los movimientos de corte.' },
  'good-as-gold': { name: 'Cuerpo Áureo', desc: 'Inmune a los movimientos de estado.' },
  'purifying-salt': { name: 'Sal Purificadora', desc: 'Inmune a problemas de estado y resiste Fantasma.' },
  'well-baked-body': { name: 'Cuerpo Horneado', desc: 'Inmune a Fuego y sube Defensa drásticamente si le golpean.' },
  'wind-rider': { name: 'Surcavientos', desc: 'Inmune a Viento y sube Ataque si le golpean o hay viento.' },
  'mycelium-might': { name: 'Poder Fúngico', desc: 'Los movimientos de estado actúan lento pero ignoran habilidades.' }
};

// LISTA DE PRECIOS DE TIENDA (Debe coincidir con el frontend)
exports.SHOP_PRICES = {
  'leftovers': 2000,
  'life-orb': 1500,
  'choice-scarf': 1000,
  'focus-sash': 1000,
  'sitrus-berry': 500
};

// Nombres para SHOWDOWN (Inglés)
exports.SHOP_NAMES_EN = {
  'leftovers': 'Leftovers',
  'life-orb': 'Life Orb',
  'choice-scarf': 'Choice Scarf',
  'focus-sash': 'Focus Sash',
  'sitrus-berry': 'Sitrus Berry'
};

// Nombres para la INTERFAZ (Español)
exports.SHOP_NAMES_ES = {
  'leftovers': 'Restos',
  'life-orb': 'Vidasfera',
  'choice-scarf': 'Pañuelo Elección',
  'focus-sash': 'Banda Focus',
  'sitrus-berry': 'Baya Zidra'
};

