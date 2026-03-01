// client/src/data/moviesData.js

// 1. FUNCIONES HELPER
export const isThursday = (dateString) => {
    // getDay(): 0=Dom, 1=Lun, 2=Mar, 3=Mie, 4=Jue, 5=Vie, 6=Sab
    // Usamos 'T00:00:00' para evitar desfases de zona horaria
    return new Date(dateString + "T00:00:00").getDay() === 4;
};

// 2. LA LISTA MAESTRA DE PELÍCULAS (Sin fechas, solo orden y temas)
const rawMoviesList = [
    // --- SEMANA 0: Prólogo (San Valentín & Sueños) ---
    {
        title: "Paprika",
        theme: "prologue",
        vibes: ["🎭", "🧠", "🎪"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/j9QZkFkaR9LmvRumn88te0d6qsC.jpg",
        description: "Una terapeuta utiliza un dispositivo experimental para entrar en los sueños de sus pacientes, pero el aparato es robado, lo que desencadena el caos cuando los mundos de los sueños y la realidad colisionan.",
        techSpec: "Una obra maestra visual que inspiró a múltiples cineastas, fusionando de manera surrealista el mundo real y el onírico."
    },
    {
        title: "Scott Pilgrim vs. the World",
        theme: "prologue",
        vibes: ["🎸", "🕹️", "💥"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/fgrVbga0oZQNeljO6dyoWknjOzJ.jpg",
        description: "El bajista Scott Pilgrim debe enfrentarse y derrotar a los siete ex novios malvados de su nueva novia, Ramona Flowers.",
        techSpec: "Estética visual innovadora que integra lenguajes de videojuegos de 8-bits y onomatopeyas y grafismos propios de cómics directamente en la pantalla."
    },


    // --- SEMANA 1: Neón y Silicio (Cyberpunk) ---
    {
        title: "Blade Runner",
        theme: "cyberpunk",
        vibes: ["🤖", "🌧️", "👁️"],
        poster: "https://image.tmdb.org/t/p/w500/63N9uy8nd9j7Eog2axPQ8lbr3Wj.jpg",
        description: "En un Los Ángeles distópico, un ex policía es llamado para cazar y retirar a cuatro 'replicantes' (androides) rebeldes que buscan a su creador.",
        techSpec: "Pionera en el uso de miniaturas hiperdetalladas, 'motion control' y humo/lluvia constante para ocultar las imperfecciones de los sets físicos."
    },
    {
        title: "Blade Runner 2049",
        theme: "cyberpunk",
        vibes: ["🕵️‍♂️", "🤖", "🔥"],
        poster: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
        description: "El descubrimiento de un secreto largamente oculto lleva a un nuevo 'blade runner' a buscar a Rick Deckard, desaparecido hace 30 años.",
        techSpec: "Uso magistral de iluminación práctica, paletas de neón por Roger Deakins y miniaturas a gran escala (bigatures) ganadoras del Oscar a Mejores VFX."
    },
    {
        title: "Mars Express",
        theme: "cyberpunk",
        vibes: ["🚀", "🕵️‍♀️", "🤖"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/aEC0dFieUjpkveilI9GQdTfUFc9.jpg",
        description: "En el siglo XXIII, una detective privada y su compañero androide viajan a Marte para resolver un caso de asesinato cibernético y conspiración.",
        techSpec: "Mezcla de animación 2D tradicional con modelos 3D usando la estética de 'línea clara' europea (estilo Moebius)."
    },
    {
        title: "Alita: Battle Angel",
        theme: "cyberpunk",
        vibes: ["⚔️", "⚙️", "🍫"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/gn2OqceeLGLrPy5Abz2dceB0po8.jpg",
        description: "Una cyborg desactivada es revivida por un compasivo doctor. Al despertar sin recuerdos, descubre que posee habilidades de combate legendarias.",
        techSpec: "Weta Digital llevó la captura de movimiento al límite, rindiendo la textura de los ojos de Alita con millones de polígonos individuales para el iris."
    },
    {
        title: "Ghost in the Shell",
        theme: "cyberpunk",
        vibes: ["🧠", "💻", "🦾"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/3o4zz9I9BT2oHSFXl7bmD3Sl5vy.jpg",
        description: "En el año 2029, la Mayor Motoko Kusanagi, una cyborg de la Sección 9, persigue a un misterioso hacker conocido como el Titiritero.",
        techSpec: "Revolucionó la industria al integrar de manera impecable fondos y efectos CGI con celdas de animación tradicional dibujadas a mano."
    },
    {
        title: "Ghost in the Shell 2: Innocence",
        theme: "cyberpunk",
        vibes: ["🦾", "🐕", "🧩"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/1ZJRbLDVr90KLtKdmTT4WZhT26E.jpg",
        description: "Batou, un cyborg detective, investiga una serie de asesinatos cometidos por 'gynoids' (muñecas sexuales androides) que han adquirido consciencia.",
        techSpec: "Primer y único largometraje de anime en la historia en competir oficialmente por la Palma de Oro en el Festival de Cannes."
    },

    // --- SEMANA 2: Drama/Psicológico ---
    {
        title: "Millennium Actress",
        theme: "psychological",
        vibes: ["🎬", "⏳", "🎭"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/zE9dDm7ImMKazPDKXiWElOqki0m.jpg",
        description: "Un documentalista entrevista a una legendaria actriz retirada, desdibujando las líneas temporales entre su vida real, sus películas y los recuerdos espectrales del Japón del siglo XX.",
        techSpec: "Satoshi Kon utiliza la 'edición match-cut' para hacer transiciones fluidas de eras históricas entre una escena y la siguiente en un solo pestañeo."
    },
    {
        title: "Solaris",
        theme: "psychological",
        vibes: ["🌌", "🧠", "🌊"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/pgqj7QoBPWFLLKtLEpPmFYFRMgB.jpg",
        description: "Un psicólogo viaja a una estación espacial orbitando un extraño planeta oceánico, solo para descubrir que la tripulación está siendo atormentada por manifestaciones físicas de sus propios recuerdos.",
        techSpec: "Uso innovador de efectos visuales análogos y largas tomas contemplativas por Andrei Tarkovsky para materializar el impacto del subconsciente."
    },
    {
        title: "Mind Game (2004)",
        theme: "psychological",
        vibes: ["🐋", "🏃‍♂️", "🎨"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/e5mV1iVcjg7nkpJrskQOnFCR4H9.jpg",
        description: "Tras un fatídico y violento encuentro con la yakuza, un aspirante a mangaka experimenta un viaje psicodélico de muerte, limbo temporal y resurrección dentro del vientre de una ballena.",
        techSpec: "Estilo híbrido revolucionario de Masaaki Yuasa que mezcla animación 2D distorsionada, 3D primitivo y recortes fotográficos de rostros reales."
    },
    {
        title: "Perfect Blue",
        theme: "psychological",
        vibes: ["🎤", "🔪", "🪞"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/79vujbsWEbX4dzffBV541QXN6sf.jpg",
        description: "Una estrella pop retirada intenta convertirse en actriz profesional, perdiendo lentamente la cordura cuando se da cuenta de que está siendo acosada por un fan obsesionado y un fantasma de su propio pasado.",
        techSpec: "El color rojo y los reflejos se utilizan como motivos visuales constantes a nivel estructural para señalar las fracturas del trauma."
    },
    {
        title: "Tetsuo: The Iron Man",
        theme: "psychological",
        vibes: ["⚙️", "🔩", "😱"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/zEzJP8F9EawE1FQySR6ppCyAEX.jpg",
        description: "Un oficinista promedio comienza a mutar horriblemente hasta convertirse en una monstruosidad mecánica después de atropellar accidentalmente a un fetichista del metal.",
        techSpec: "Stop-motion crudo y vertiginoso en blanco y negro, grabado en cinta de 16mm para potenciar una estética cyberpunk de pesadilla industrial."
    },
    {
        title: "Tokyo Godfathers",
        theme: "psychological",
        vibes: ["❄️", "👶", "🏃‍♂️"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/ukhvxpVcBsb1MpRRwiqEIwyKdUX.jpg",
        description: "Tres entrañables personas sin hogar en Tokio encuentran un bebé abandonado en Nochebuena y se embarcan en una peculiar búsqueda llena de milagros cósmicos para encontrar a sus padres.",
        techSpec: "Expresiones faciales sumamente detalladas y fondos de Tokio dibujados y pintados a mano con precisión casi fotográfica."
    },

    // --- SEMANA 3: Acción y Peleas ---
    { title: "Redline", theme: "action", vibes: ["🏎️", "🔥", "🏁"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/1n8x00g5IPUnImkVdaiUpgvyj2f.jpg" },
    { title: "Promare", theme: "action", vibes: ["🚒", "🔥", "🔺"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/cCVRivpiVUJ4Wn6gHm8pLXppXla.jpg" },
    { title: "Fatal Fury: The Motion Picture", theme: "action", vibes: ["👊", "🧢", "🔥"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/x11aIGqbAsKLbxAVooDagVVhEIG.jpg" },
    { title: "Mezzo Forte", theme: "action", vibes: ["🔫", "💥", "🕶️"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/3cIbMjZIUfs147XfVIzRLwJOG2B.jpg" },
    { title: "Ready Player One", theme: "action", vibes: ["🕹️", "🥽", "🚙"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/2iuVrtC5IpwLtSFSgkIIIKLs0Zq.jpg" },
    { title: "Dragon Quest: Your Story", theme: "action", vibes: ["🗡️", "🐉", "🎮"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/5R70ehKGh5V0ZYOdikxwSfoLGMt.jpg" },
    { title: "Sonic la película", theme: "action", vibes: ["🦔", "⚡", "💍"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/qHkpvJ7fjtxJNuDCyGZBHqYG05w.jpg" },

    // --- SEMANA 4: Leyendas de Oriente (Fantasía) ---
    { title: "Princesa Mononoke", theme: "fantasy-east", vibes: ["🐺", "🌲", "🗡️"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/mVdz3vlmioKWZaHTGfu99zIuayZ.jpg" },
    { title: "Ne Zha", theme: "fantasy-east", vibes: ["🔥", "🐉", "👦"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/zb8xejiaNR0snSJgDepwFQUIi2e.jpg" },
    { title: "Ne Zha 2", theme: "fantasy-east", vibes: ["🔥", "⚡", "🌊"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/bTMf8M7rZ21fChGdtsZtJj4Dfqh.jpg" },
    { title: "The Legend of HEI", theme: "fantasy-east", vibes: ["🐈‍⬛", "🌳", "✨"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/c5eKWGghWGPBNOtuTQNKEqLHaVB.jpg" },
    { title: "The Legend of HEI 2", theme: "fantasy-east", vibes: ["🐈‍⬛", "🏙️", "⚔️"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/l1Q7YzanazjJescEkSfcRuIj1hR.jpg" },
    { title: "Tekkonkinkreet (2006)", theme: "fantasy-east", vibes: ["🏙️", "👦", "🦅"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/fUBeTJ0ju4Pgrt1ifnAGMUYdAjb.jpg" },
    { title: "King of Thorn", theme: "fantasy-east", vibes: ["🏰", "🌿", "🛌"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/tQwPYLbUm5NcREQ4QWX0mdBoKYb.jpg" },

    // --- SEMANA 5: Retratos de Juventud (Coming of Age & Romance Anime) ---
    { title: "Puedo escuchar el mar", theme: "romance", vibes: ["🌊", "🏫", "✈️"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/fSR1LLMIJZ6WcQEkM82yKy4F9vQ.jpg" },
    { title: "El Jardín de las Palabras", theme: "romance", vibes: ["🌧️", "👞", "🍃"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/j5PIVKmpxgo6MFb1sLF4qSJSpLD.jpg" },
    { title: "Palabras que burbujean como un refresco", theme: "romance", vibes: ["🎧", "📝", "☀️"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/m0IjeN2jZg64Ff1H5e4Ba59CKW8.jpg" },
    { title: "Tamako Love Story", theme: "romance", vibes: ["🍡", "🗣️", "🌸"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/m59jfWqV6h3GAud7tSPShTXW6ZH.jpg" },
    { title: "To Every You I’ve Loved Before", theme: "romance", vibes: ["🌌", "💞", "🔄"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/yl4WOrXTVFihtd6wcxpwkKD7xoP.jpg" },
    { title: "To Me, the One Who Loved You", theme: "romance", vibes: ["🌌", "💔", "🔄"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/gt7kD8MjObtgQYH130pZiLTN0qx.jpg" },

    // --- SEMANA 6: Magia y Destino (Fantasía Occidental & Animación Clásica) ---
    { title: "El laberinto del fauno", theme: "magic", vibes: ["🧚‍♀️", "👁️", "⏳"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/953ZprqPxXSfhHvjBVRiIv7fSP6.jpg" },
    { title: "Kubo y las dos cuerdas mágicas", theme: "magic", vibes: ["🎸", "🪲", "🐒"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/1fsLdTtaGC7wVGpwdhOPSxUA3pH.jpg" },
    { title: "Anastasia", theme: "magic", vibes: ["❄️", "👑", "🚂"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/bppGWGA8zq1sRvTdDJnUzVW9GcH.jpg" },
    { title: "Enredados", theme: "magic", vibes: ["💇‍♀️", "🍳", "🏮"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/z5kvXWek4smCyeWBDJQkT5sLc9T.jpg" },
    { title: "Raya y el Último Dragón", theme: "magic", vibes: ["🐉", "🗡️", "💧"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/hbjOtofNpvFvhzBUUoZGAjkjjsl.jpg" },
    { title: "El recuerdo de Marnie", theme: "magic", vibes: ["👱‍♀️", "🚣‍♀️", "🌊"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/bzFVWaoSMcwpWu1r2wpbkImAiqf.jpg" },

    // --- SEMANA 7: Realismo Crítico y Culto (Cine de Personajes) ---
    { title: "Ikiru", theme: "cult", vibes: ["❄️", " swings", "📝"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/dgNTS4EQDDVfkzJI5msKuHu2Ei3.jpg" },
    { title: "Jin-Roh: The Wolf Brigade", theme: "cult", vibes: ["🐺", "🛡️", "💣"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/nC1PUOAWUirtCdnBJ0W34arU18d.jpg" },
    { title: "Heathers / Musical", theme: "cult", vibes: ["🏏", "❤️", "💣"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/dGbVfM4WlM7uvIbyRehfPZUIgp2.jpg" },
    { title: "Oldboy", theme: "cult", vibes: ["🐙", "🔨", "⏳"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/45kRW1xgTq3QrZltL9mY9e9iYkH.jpg" },
    { title: "Vexille", theme: "cult", vibes: ["🦾", "🏜️", "💥"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/uNMimh2Crv4rZ0AgcjGzuYEoZrW.jpg" },
    { title: "Wuthering Heights (1939)", theme: "cult", vibes: ["⛈️", "👻", "💔"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/rnTneXb0oGh6yatXgPcn7ApYAge.jpg" },

    // --- SEMANA 8: Risas y Mascotas (Comedia & Confort) ---
    { title: "Monty Python and the Holy Grail", theme: "comedy", vibes: ["🥥", "🐇", "🏰"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/7nTkHjETdGMYK1phHwDbPsrzbYl.jpg" },
    { title: "A Goofy Movie", theme: "comedy", vibes: ["🎣", "🚗", "🎤"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/bycmMhO3iIoEDzP768sUjq2RV4T.jpg" },
    { title: "An Extremely Goofy Movie", theme: "comedy", vibes: ["🛹", "🕺", "🎓"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/bRQbaTkzxuHcsNy1NK1aRuueFLs.jpg" },
    { title: "The Adventure of Buratino", theme: "comedy", vibes: ["🤥", "🗝️", "🎭"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/wnfBuPp7w1yEIJGX0LuHM4qGlud.jpg" },
    { title: "The Bad Guys", theme: "comedy", vibes: ["🐺", "🐍", "💰"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/czxHSOXyKd6zEvIOvUTxAwqOjcK.jpg" },
    { title: "The Bad Guys 2", theme: "comedy", vibes: ["🦊", "🦈", "🚗"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/mZmnKDhIS2yNmtfzde5vtdCYzBF.jpg" },

    // --- SEMANA 9: Sci-Fi Moderno ---
    { title: "Superman (2025)", theme: "scifi", vibes: ["🦸‍♂️", "🏙️", "✨"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/fvUJb08yatV2b3NUSwuYdQKYoFd.jpg" },
    { title: "Transformers One", theme: "scifi", vibes: ["🤖", "🚗", "💥"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/1jzVCZxBmgvpGILuEU8icfX77Io.jpg" },
    { title: "In Your Dreams (2025)", theme: "scifi", vibes: ["💭", "🌙", "✨"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/z2v3lNAA2ymrZuKof4J2vqFIBdw.jpg" },
    { title: "Elio", theme: "scifi", vibes: ["👽", "👦", "🌌"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/fqF7z5A8kFIrNtSdpEfjE539fna.jpg" },
    { title: "Elemental (Disney)", theme: "scifi", vibes: ["🔥", "💧", "🏙️"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/d79DeKDCgFOM23O8Dr6MELZVooY.jpg" },
    { title: "Alien: Romulus (2024)", theme: "scifi", vibes: ["👽", "🚀", "🩸"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/8PYqGSd8MOm5ce8io4qNSAiSExW.jpg" },

    // --- SEMANA 10: Fantasia moderna ---
    { title: "Belle", theme: "fantasy-modern", vibes: ["🎧", "🐉", "🌸"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/2WDFB4i7CgQAs9oMAFf0Et8Uwuv.jpg" },
    { title: "El Castillo a través del Espejo", theme: "fantasy-modern", vibes: ["🏰", "🪞", "🐺"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/rinnHex54R0MdkFnSTVQvP7noLH.jpg" },
    { title: "Bubble (2022)", theme: "fantasy-modern", vibes: ["🫧", "🏃‍♂️", "🎧"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/kM1NG2m3nn1e0PBYGhvRV1FSLX6.jpg" },
    { title: "Amor de Gatos (A Whisker Away)", theme: "fantasy-modern", vibes: ["🐈", "🎭", "✨"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/3QJ4yVmSxuLQX8vHW4elcqUa1T8.jpg" },
    { title: "The Stranger by the Shore", theme: "fantasy-modern", vibes: ["🌊", "🐈", "💞"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/wt9syGS5BQQY2gC1Pk8E22XQRBo.jpg" },
    { title: "El niño, el topo, el zorro y el caballo", theme: "fantasy-modern", vibes: ["👦", "🦊", "❄️"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/jfkVV2RrD5tXAy8P0JLl90ELS0S.jpg" },

    // --- SEMANA 11: Retro-Futurismo & Motores ---
    { title: "Sky Captain and the World of Tomorrow", theme: "retro-future", vibes: ["✈️", "🤖", "☁️"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/iqQE2JoC2BroYOJev5i7jiHeQl6.jpg" },
    { title: "Robots", theme: "retro-future", vibes: ["🤖", "🔧", "🏙️"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/e5GTdGwZAvaPgO8kOEsGltzgIUX.jpg" },
    { title: "9 (2009)", theme: "retro-future", vibes: ["🧵", "🤖", "🔥"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/mu1zDw4qxlUzrBizasO24unC766.jpg" },
    { title: "Memories (1995)", theme: "retro-future", vibes: ["🚀", "🌹", "🔫"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/3CEv467aWJ9btMFkKAxd74PBxwX.jpg" },
    { title: "The Sky Crawlers", theme: "retro-future", vibes: ["✈️", "☁️", "🔫"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/b5Mox8aaTOECp1PqBbvFlSnZ5ST.jpg" },
    { title: "Soy Frankelda (2025)", theme: "retro-future", vibes: ["📖", "👻", "🖋️"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/bp7TxHXrUlTfCIiA0z2pdkX9X56.jpg" },

    // --- SEMANA 12: Adrenalina y Estilo (Guns & Glitch) ---
    { title: "Hardcore Henry", theme: "action-glitch", vibes: ["🩸", "🔫", "🕶️"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/wqu4G6sghlca1CGBIa5TXKVtGLP.jpg" },
    { title: "Kick-Ass", theme: "action-glitch", vibes: ["🦸‍♂️", "🩸", "👊"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/iHMbrTHJwocsNvo5murCBw0CwTo.jpg" },
    { title: "Kick-Ass 2", theme: "action-glitch", vibes: ["🦸‍♂️", "🦹‍♂️", "⚔️"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/yMOb8MwEzOfjZf1QDU6l9eHfmbs.jpg" },
    { title: "Mutafukaz", theme: "action-glitch", vibes: ["💀", "🔫", "🔥"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/oSMIKsznGYzGfdl611kgEJF889.jpg" },
    { title: "As the Gods Will", theme: "action-glitch", vibes: ["🩸", "🎎", "🎲"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/3Obn9IR47fjhbtYtNrO7CBSrZ2w.jpg" },
    { title: "Fight Club", theme: "action-glitch", vibes: ["🧼", "👊", "🤯"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/sgTAWJFaB2kBvdQxRGabYFiQqEK.jpg" },

    // --- SEMANA 13: Classic Vibes & Hollywood ---
    { title: "Los Locos Addams", theme: "classic-comedy", vibes: ["🕸️", "🥀", "🦇"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/ro7bdsSGp1jtvMxSWEfLLCK33PO.jpg" },
    { title: "Austin Powers", theme: "classic-comedy", vibes: ["🕺", "👓", "☮️"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/6vUjqYh8hDh7pVIcdQySw3SN3SH.jpg" },
    { title: "The Naked Gun", theme: "classic-comedy", vibes: ["👮‍♂️", "🤦‍♂️", "😂"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/zT0mhZqZQJE1gSY5Eg9qcGP4NYo.jpg" },
    { title: "Fiebre de Sábado por la Noche", theme: "classic-comedy", vibes: ["🕺", "🪩", "✨"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/qgwWjfpgGvUPoWXdq5kPLii6AOr.jpg" },
    { title: "Barbie", theme: "classic-comedy", vibes: ["🎀", "👱‍♀️", "💖"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/fNtqD4BTFj0Bgo9lyoAtmNFzxHN.jpg" },
    { title: "Wonka", theme: "classic-comedy", vibes: ["🎩", "🍫", "✨"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/6eHcR7zwvNSvkOl9jbctU0lvZQ1.jpg" },

    // --- SEMANA 14: China ---
    { title: "White Snake", theme: "china-3d", vibes: ["🐍", "🤍", "✨"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/fSzoOexVd4sUp5WQJpeyugQXyMW.jpg" },
    { title: "Green Snake", theme: "china-3d", vibes: ["🐍", "💚", "⚡"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/g1d3uFf3eGvVJQ5Coh793Zi1ASq.jpg" },
    { title: "Deep Sea (2023)", theme: "china-3d", vibes: ["🌊", "👁️", "🎨"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/e3S0nN9jhxWBuWdRXQupZJchJiX.jpg" },
    { title: "La guerra de los dioses", theme: "china-3d", vibes: ["🗡️", "🐉", "🎮"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/zsqL12ptbF89vMWHgf3kxuacJso.jpg" },
    { title: "Me and My Magnet and My Dead Friend", theme: "china-3d", vibes: ["🍓", "📼", "💭"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/nv4yMVf1dbFFwpZsovGlt0yScQH.jpg" },
    { title: "SYSTEM MAINTENANCE", theme: "system", vibes: ["⚠️", "🔧", "🚫"], isMaintenance: true, techSpec: "SERVER OFFLINE", description: "Mantenimiento de servidores.", poster: null },

    // --- SEMANA 15: VFX & Experimental Art ---
    { title: "The Triplets of Belleville", theme: "vfx-art", vibes: ["🚴‍♂️", "👵", "🎨"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/jcoNbS5nJsoKRdR8BpfAC8II8P6.jpg" },
    { title: "Genius Party Beyond", theme: "vfx-art", vibes: ["🤯", "🔥", "🌀"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/uGZbRSafiU6A2Ek5idLWS7yGR4U.jpg" },
    { title: "Cat Soup", theme: "vfx-art", vibes: ["🐈", "🥣", "💀"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/5V6o4IO3APP0I4DLMLuv0glMf7.jpg" },
    { title: "The Spine of Night", theme: "vfx-art", vibes: ["⚔️", "🌌", "🩸"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/dM6R6LSe0LHYNnizWjPHI404DBK.jpg" },
    { title: "Psiconautas, los niños olvidados", theme: "vfx-art", vibes: ["🐦", "💊", "🔥"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/uBAUnHPkhu4aYSBU1iWHtLaiUI0.jpg" },
    { title: "Wolfwalkers", theme: "vfx-art", vibes: ["🐺", "👧", "🌲"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/4AbbGAiz1t5Hxa9c35avWeyB3dA.jpg" }
];

// 3. GENERADOR AUTOMÁTICO DE FECHAS
const generatePlannedMovies = () => {
    let movies = {};

    // Seteamos la fecha de inicio: Viernes 13 de Febrero de 2026 (Local time real)
    let currentDate = new Date(2026, 1, 13); // Año 2026, Mes 1 (Febrero), Día 13
    let currentTheme = null;

    rawMoviesList.forEach((movie) => {
        // Si el día actual es Jueves (4), o 22, 24 o 28 de Febrero de 2026, lo saltamos sumando 1 día
        while (currentDate.getDay() === 4 || ((currentDate.getDate() === 22 || currentDate.getDate() === 24 || currentDate.getDate() === 28) && currentDate.getMonth() === 1 && currentDate.getFullYear() === 2026)) {
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        let isThemeStart = false;
        if (movie.theme !== 'system' && movie.theme !== 'redacted' && movie.theme !== currentTheme) {
            isThemeStart = true;
            currentTheme = movie.theme;
        }

        // Guardamos la película con la fecha ya calculada
        movies[dateStr] = {
            ...movie,
            date: dateStr, // Genera "YYYY-MM-DD" en Local Time
            isThemeStart: isThemeStart,
            // Datos por defecto por si aún no tenés el póster o la info:
            poster: movie.poster || "https://via.placeholder.com/300x450/1a1a1a/ccff00?text=AWAITING+POSTER",
            description: movie.description || "Iniciando escaneo de base de datos... Sinopsis aún no disponible.",
            techSpec: movie.techSpec || "Datos clasificados por el sistema Nodo."
        };

        // Avanzamos al siguiente día para la próxima película
        currentDate.setDate(currentDate.getDate() + 1);
    });

    return movies;
};

const plannedMovies = generatePlannedMovies();

// 🏭 BASE CALENDAR GENERATOR (Structure & Maintenance)
const generateBaseCalendar = (startDateString, totalDays) => {
    const calendar = [];
    const startDate = new Date(startDateString);

    for (let i = 0; i < totalDays; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);

        // Format YYYY-MM-DD manually
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        // Check if Thursday
        const dayOfWeek = currentDate.getDay(); // 4 = Jueves
        const isThursday = dayOfWeek === 4;
        const isCancelled = currentDate.getFullYear() === 2026 && currentDate.getMonth() === 1 && (currentDate.getDate() === 22 || currentDate.getDate() === 24 || currentDate.getDate() === 28);

        // Base structure
        let dayObj = {
            id: `date-${dateStr}`,
            date: dateStr,
            fullDate: currentDate,
            dayNumber: day,
            isThursday: isThursday,
            isMaintenance: isThursday || isCancelled,
            // Defaults for empty/maintenance
            title: (isThursday || isCancelled) ? 'SYSTEM MAINTENANCE' : '[ DATOS BORRADOS ]',
            theme: (isThursday || isCancelled) ? 'system' : 'redacted', // New 'redacted' theme
            vibes: (isThursday || isCancelled) ? ['⚠️', '🔧', '🚫'] : ['🔒', 'NULL', '👁️'],
            techSpec: (isThursday || isCancelled) ? 'SERVER OFFLINE' : 'ENCRYPTED',
            description: (isThursday || isCancelled) ? 'Mantenimiento de servidores.' : '[ DATOS BORRADOS ]',
            poster: null
        };

        calendar.push(dayObj);
    }
    return calendar;
};

// 💧 HYDRATION SYSTEM
const hydrateCalendar = (baseCalendar, plannedData) => {
    return baseCalendar.map(day => {
        // If we have planned data for this date, merge it
        if (plannedData[day.date]) {
            return {
                ...day,
                ...plannedData[day.date],
                isMaintenance: plannedData[day.date].isMaintenance || false // Override maintenance if manually planned or explicitly set
            };
        }
        return day;
    });
};

// Generate base from Feb 1st, 2026 for 334 days (until Jan 1st 2027)
const baseCalendar = generateBaseCalendar('2026-02-01', 334);

// Export hydrated calendar
export const movies = hydrateCalendar(baseCalendar, plannedMovies);