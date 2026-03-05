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
        duration: "90 min",
        year: "2006",
        genres: "Ciencia Ficción y Thriller",
        vibes: ["🎭", "🧠", "🎪"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/j9QZkFkaR9LmvRumn88te0d6qsC.jpg",
        description: "Una terapeuta utiliza un dispositivo experimental para entrar en los sueños de sus pacientes, pero el aparato es robado, lo que desencadena el caos cuando los mundos de los sueños y la realidad colisionan.",
        techSpec: "Una obra maestra visual que inspiró a múltiples cineastas, fusionando de manera surrealista el mundo real y el onírico."
    },
    {
        title: "Scott Pilgrim vs. the World",
        theme: "prologue",
        duration: "112 min",
        year: "2010",
        genres: "Acción y Comedia",
        vibes: ["🎸", "🕹️", "💥"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/fgrVbga0oZQNeljO6dyoWknjOzJ.jpg",
        description: "El bajista Scott Pilgrim debe enfrentarse y derrotar a los siete ex novios malvados de su nueva novia, Ramona Flowers.",
        techSpec: "Estética visual innovadora que integra lenguajes de videojuegos de 8-bits y onomatopeyas y grafismos propios de cómics directamente en la pantalla."
    },


    // --- SEMANA 1: Neón y Silicio (Cyberpunk) ---
    {
        title: "Blade Runner",
        theme: "cyberpunk",
        duration: "117 min",
        year: "1982",
        genres: "Ciencia Ficción y Thriller",
        vibes: ["🤖", "🌧️", "👁️"],
        poster: "https://image.tmdb.org/t/p/w500/63N9uy8nd9j7Eog2axPQ8lbr3Wj.jpg",
        description: "En un Los Ángeles distópico, un ex policía es llamado para cazar y retirar a cuatro 'replicantes' (androides) rebeldes que buscan a su creador.",
        techSpec: "Pionera en el uso de miniaturas hiperdetalladas, 'motion control' y humo/lluvia constante para ocultar las imperfecciones de los sets físicos."
    },
    {
        title: "Blade Runner 2049",
        theme: "cyberpunk",
        isSequel: true,
        duration: "164 min",
        year: "2017",
        genres: "Ciencia Ficción y Thriller",
        vibes: ["🕵️‍♂️", "🤖", "🔥"],
        poster: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
        description: "El descubrimiento de un secreto largamente oculto lleva a un nuevo 'blade runner' a buscar a Rick Deckard, desaparecido hace 30 años.",
        techSpec: "Uso magistral de iluminación práctica, paletas de neón por Roger Deakins y miniaturas a gran escala (bigatures) ganadoras del Oscar a Mejores VFX."
    },
    {
        title: "Mars Express",
        theme: "cyberpunk",
        duration: "85 min",
        year: "2023",
        genres: "Acción y Ciencia Ficción",
        vibes: ["🚀", "🕵️‍♀️", "🤖"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/aEC0dFieUjpkveilI9GQdTfUFc9.jpg",
        description: "En el siglo XXIII, una detective privada y su compañero androide viajan a Marte para resolver un caso de asesinato cibernético y conspiración.",
        techSpec: "Mezcla de animación 2D tradicional con modelos 3D usando la estética de 'línea clara' europea (estilo Moebius)."
    },
    {
        title: "Alita: Battle Angel",
        theme: "cyberpunk",
        duration: "122 min",
        year: "2019",
        genres: "Acción y Ciencia Ficción",
        vibes: ["⚔️", "⚙️", "🍫"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/gn2OqceeLGLrPy5Abz2dceB0po8.jpg",
        description: "Una cyborg desactivada es revivida por un compasivo doctor. Al despertar sin recuerdos, descubre que posee habilidades de combate legendarias.",
        techSpec: "Weta Digital llevó la captura de movimiento al límite, rindiendo la textura de los ojos de Alita con millones de polígonos individuales para el iris."
    },
    {
        title: "Ghost in the Shell",
        theme: "cyberpunk",
        duration: "82 min",
        year: "1995",
        genres: "Acción y Ciencia Ficción",
        vibes: ["🧠", "💻", "🦾"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/3o4zz9I9BT2oHSFXl7bmD3Sl5vy.jpg",
        description: "En el año 2029, la Mayor Motoko Kusanagi, una cyborg de la Sección 9, persigue a un misterioso hacker conocido como el Titiritero.",
        techSpec: "Revolucionó la industria al integrar de manera impecable fondos y efectos CGI con celdas de animación tradicional dibujadas a mano."
    },
    {
        title: "Ghost in the Shell 2: Innocence",
        theme: "cyberpunk",
        isSequel: true,
        duration: "100 min",
        year: "2004",
        genres: "Ciencia Ficción y Misterio",
        vibes: ["🦾", "🐕", "🧩"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/1ZJRbLDVr90KLtKdmTT4WZhT26E.jpg",
        description: "Batou, un cyborg detective, investiga una serie de asesinatos cometidos por 'gynoids' (muñecas sexuales androides) que han adquirido consciencia.",
        techSpec: "Primer y único largometraje de anime en la historia en competir oficialmente por la Palma de Oro en el Festival de Cannes."
    },

    // --- SEMANA 2: Drama/Psicológico ---
    {
        title: "Millennium Actress",
        theme: "psychological",
        duration: "87 min",
        year: "2001",
        genres: "Drama y Romance",
        vibes: ["🎬", "⏳", "🎭"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/zE9dDm7ImMKazPDKXiWElOqki0m.jpg",
        description: "Un documentalista entrevista a una legendaria actriz retirada, desdibujando las líneas temporales entre su vida real, sus películas y los recuerdos espectrales del Japón del siglo XX.",
        techSpec: "Satoshi Kon utiliza la 'edición match-cut' para hacer transiciones fluidas de eras históricas entre una escena y la siguiente en un solo pestañeo."
    },
    {
        title: "Solaris",
        theme: "psychological",
        duration: "167 min",
        year: "1972",
        genres: "Drama y Ciencia Ficción",
        vibes: ["🌌", "🧠", "🌊"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/pgqj7QoBPWFLLKtLEpPmFYFRMgB.jpg",
        description: "Un psicólogo viaja a una estación espacial orbitando un extraño planeta oceánico, solo para descubrir que la tripulación está siendo atormentada por manifestaciones físicas de sus propios recuerdos.",
        techSpec: "Uso innovador de efectos visuales análogos y largas tomas contemplativas por Andrei Tarkovsky para materializar el impacto del subconsciente."
    },
    {
        title: "Mind Game (2004)",
        theme: "psychological",
        duration: "103 min",
        year: "2004",
        genres: "Comedia y Aventuras",
        vibes: ["🐋", "🏃‍♂️", "🎨"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/e5mV1iVcjg7nkpJrskQOnFCR4H9.jpg",
        description: "Tras un fatídico y violento encuentro con la yakuza, un aspirante a mangaka experimenta un viaje psicodélico de muerte, limbo temporal y resurrección dentro del vientre de una ballena.",
        techSpec: "Estilo híbrido revolucionario de Masaaki Yuasa que mezcla animación 2D distorsionada, 3D primitivo y recortes fotográficos de rostros reales."
    },
    {
        title: "Perfect Blue",
        theme: "psychological",
        duration: "81 min",
        year: "1997",
        genres: "Thriller y Misterio",
        vibes: ["🎤", "🔪", "🪞"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/79vujbsWEbX4dzffBV541QXN6sf.jpg",
        description: "Una estrella pop retirada intenta convertirse en actriz profesional, perdiendo lentamente la cordura cuando se da cuenta de que está siendo acosada por un fan obsesionado y un fantasma de su propio pasado.",
        techSpec: "El color rojo y los reflejos se utilizan como motivos visuales constantes a nivel estructural para señalar las fracturas del trauma."
    },
    {
        title: "Tetsuo: The Iron Man",
        theme: "psychological",
        duration: "67 min",
        year: "1989",
        genres: "Terror y Ciencia Ficción",
        vibes: ["⚙️", "🔩", "😱"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/zEzJP8F9EawE1FQySR6ppCyAEX.jpg",
        description: "Un oficinista promedio comienza a mutar horriblemente hasta convertirse en una monstruosidad mecánica después de atropellar accidentalmente a un fetichista del metal.",
        techSpec: "Stop-motion crudo y vertiginoso en blanco y negro, grabado en cinta de 16mm para potenciar una estética cyberpunk de pesadilla industrial."
    },
    {
        title: "Tokyo Godfathers",
        theme: "psychological",
        duration: "92 min",
        year: "2003",
        genres: "Comedia y Drama",
        vibes: ["❄️", "👶", "🏃‍♂️"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/ukhvxpVcBsb1MpRRwiqEIwyKdUX.jpg",
        description: "Tres entrañables personas sin hogar en Tokio encuentran un bebé abandonado en Nochebuena y se embarcan en una peculiar búsqueda llena de milagros cósmicos para encontrar a sus padres.",
        techSpec: "Expresiones faciales sumamente detalladas y fondos de Tokio dibujados y pintados a mano con precisión casi fotográfica."
    },

    // --- SEMANA 3: Acción y Peleas ---
    {
        title: "Redline",
        theme: "action",
        duration: "102 min",
        year: "2009",
        genres: "Acción y Ciencia Ficción",
        vibes: ["🏎️", "🔥", "🏁"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/1n8x00g5IPUnImkVdaiUpgvyj2f.jpg",
        description: "En un futuro lejano, la carrera más peligrosa e ilegal del universo, la 'Redline', está a punto de comenzar. JP, un temerario piloto de carreras, está decidido a ganarla a pesar de las mafias intergalácticas y la resistencia militar.",
        techSpec: "Animada a mano durante 7 años, requirió más de 100,000 dibujos manuales, convirtiéndola en una obra maestra visual sin apenas CGI."
    },
    {
        title: "Promare",
        theme: "action",
        duration: "111 min",
        year: "2019",
        genres: "Acción y Ciencia Ficción",
        vibes: ["🚒", "🔥", "🔺"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/cCVRivpiVUJ4Wn6gHm8pLXppXla.jpg",
        description: "Una feroz batalla estalla entre Galo Thymos, un bombero de élite, y Lio Fotia, el líder de un grupo terrorista de mutantes capaces de controlar el fuego conocidos como Burnish.",
        techSpec: "Combina un estilo 3D cel shading increíblemente fluido con formas geométricas y colores neón puros (estilo característico de Studio Trigger)."
    },
    {
        title: "Fatal Fury: The Motion Picture",
        theme: "action",
        duration: "100 min",
        year: "1994",
        genres: "Acción y Aventura",
        vibes: ["👊", "🧢", "🔥"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/x11aIGqbAsKLbxAVooDagVVhEIG.jpg",
        description: "Terry Bogard y sus amigos luchan para detener a Laocorn Gaudeamus, quien busca reunir la legendaria Armadura de Marte que le otorgaría un poder divino.",
        techSpec: "Basada en la famosa franquicia de videojuegos de lucha de SNK, manteniendo el estilo clásico del anime de aventuras de los años 90."
    },
    {
        title: "Mezzo Forte",
        theme: "action",
        duration: "59 min",
        year: "2000",
        genres: "Acción y Crimen",
        vibes: ["🔫", "💥", "🕶️"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/3cIbMjZIUfs147XfVIzRLwJOG2B.jpg",
        description: "Sigue a los DSA (Danger Service Agency), un trío de mercenarios contratado para secuestrar a un peligroso magnate del deporte, lo que desencadena tiroteos y persecuciones brutales.",
        techSpec: "Conocida por combinar acción hiper-cinética de tiroteos con un estilo visual detallado característico de Yasuomi Umetsu."
    },
    {
        title: "Ready Player One",
        theme: "action",
        duration: "140 min",
        year: "2018",
        genres: "Acción y Ciencia Ficción",
        vibes: ["🕹️", "🥽", "🚙"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/2iuVrtC5IpwLtSFSgkIIIKLs0Zq.jpg",
        description: "En un 2045 caótico, los habitantes del mundo encuentran salvación en el OASIS, un inmersivo universo de realidad virtual. El joven Wade Watts emprende una peligrosa búsqueda por un tesoro oculto en este mundo digital.",
        techSpec: "Dirigida por Steven Spielberg, la película es una clase magistral de captura de movimiento e incluye innumerables referencias a la cultura pop de los 80."
    },
    {
        title: "Dragon Quest: Your Story",
        theme: "action",
        duration: "103 min",
        year: "2019",
        genres: "Acción y Fantasía",
        vibes: ["🗡️", "🐉", "🎮"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/5R70ehKGh5V0ZYOdikxwSfoLGMt.jpg",
        description: "Basada en el clásico videojuego, un joven héroe, Luca, parte en una misión épica para rescatar a su madre de las garras de Ladja, encontrando magia, monstruos y aliados en el camino.",
        techSpec: "Animación 3D CGI que reinventa el arte clásico de Akira Toriyama con personajes mucho más expresivos y estilizados."
    },
    {
        title: "Sonic la película",
        theme: "action",
        duration: "99 min",
        year: "2020",
        genres: "Acción y Comedia",
        vibes: ["🦔", "⚡", "💍"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/qHkpvJ7fjtxJNuDCyGZBHqYG05w.jpg",
        description: "El erizo más rápido del mundo intenta adaptarse a su nueva vida en la Tierra. Pero debe unir fuerzas con el shérif Tom para evitar que el malvado Dr. Robotnik use sus poderes para dominar el mundo.",
        techSpec: "Famosa por su rediseño completo del personaje principal tras las quejas masivas de los fans sobre el primer tráiler, marcando un hito de escucha al público de la comunidad."
    },

    // --- SEMANA 4: Leyendas de Oriente (Fantasía) ---
    {
        title: "Princesa Mononoke",
        theme: "fantasy-east",
        duration: "134 min",
        year: "1997",
        genres: "Fantasía y Aventura",
        vibes: ["🐺", "🌲", "🗡️"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/mVdz3vlmioKWZaHTGfu99zIuayZ.jpg",
        description: "Un príncipe afectado por una maldición letal viaja para buscar la cura, quedando atrapado en medio de una guerra entre los dioses del bosque, liderados por la princesa loba San, y los humanos de la Ciudad del Hierro.",
        techSpec: "Primera película del Studio Ghibli en usar gráficos por computadora (CGI) pero manteniendo el estilo 100% dibujado de Hayao Miyazaki."
    },
    {
        title: "Ne Zha",
        theme: "fantasy-east",
        duration: "110 min",
        year: "2019",
        genres: "Fantasía y Acción",
        vibes: ["🔥", "🐉", "👦"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/zb8xejiaNR0snSJgDepwFQUIi2e.jpg",
        description: "Nacido de una perla demoníaca maldita, un niño con poderes rebeldes debe aprender a dominar su furia y desafiar el destino que le fue impuesto, mientras enfrenta la hostilidad de su aldea y la amenaza de un demonio dragón.",
        techSpec: "La película de animación china más taquillera de la historia, destacada por sus increíbles escenas de combate hipercinético animadas en 3D."
    },
    {
        title: "Ne Zha 2",
        theme: "fantasy-east",
        isSequel: true,
        duration: "142 min",
        year: "2025",
        genres: "Fantasía y Acción",
        vibes: ["🔥", "⚡", "🌊"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/bTMf8M7rZ21fChGdtsZtJj4Dfqh.jpg",
        description: "Retoma la historia del mítico héroe niño, enfrentando nuevas amenazas cósmicas y dioses ancestrales en batallas cargadas de adrenalina para proteger su hogar nuevamente.",
        techSpec: "Secuela directa producida con un enorme motor de físicas que llevó a las peleas de la primera película a un nivel ridículamente destructivo."
    },
    {
        title: "The Legend of HEI",
        theme: "fantasy-east",
        duration: "101 min",
        year: "2019",
        genres: "Fantasía y Aventura",
        vibes: ["🐈‍⬛", "🌳", "✨"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/c5eKWGghWGPBNOtuTQNKEqLHaVB.jpg",
        description: "Cuando su hogar en el bosque es destruido por los humanos, un espíritu en forma de gato negro llamado Xiao Hei se ve obligado a huir. Pronto deberá elegir entre unirse a espíritus rebeldes o aprender a convivir con la humanidad.",
        techSpec: "Comenzó siendo una web-serie flash con estilo chibi y evolucionó a una enorme superproducción con animación 2D súper dinámica en escenas de acción."
    },
    {
        title: "The Legend of HEI 2",
        theme: "fantasy-east",
        isSequel: true,
        duration: "100 min",
        year: "2025",
        genres: "Fantasía y Acción",
        vibes: ["🐈‍⬛", "🏙️", "⚔️"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/l1Q7YzanazjJescEkSfcRuIj1hR.jpg",
        description: "La esperada secuela ahonda en el lore de los Ejecutores y en la frágil convivencia entre los espíritus mágicos ocultos en la sociedad moderna humana.",
        techSpec: "Continúa el legado de combates que parecen sacados del mejor anime shonen, pero con la suavidad de un proyecto en 2D en pleno auge del 3D."
    },
    {
        title: "Tekkonkinkreet (2006)",
        theme: "fantasy-east",
        duration: "111 min",
        year: "2006",
        genres: "Fantasía y Drama",
        vibes: ["🏙️", "👦", "🦅"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/fUBeTJ0ju4Pgrt1ifnAGMUYdAjb.jpg",
        description: "En la corrupta Ciudad del Tesoro, dos hermanos huérfanos con mentes muy distintas (Blanco y Negro) deben luchar contra la mafia yakuza para proteger su territorio y su propia cordura.",
        techSpec: "Fondos abrumadores hiperdetallados creados pintando la compleja arquitectura japonesa sobre modelados 3D deformados para causar una sensación surrealista de perspectiva."
    },
    {
        title: "King of Thorn",
        theme: "fantasy-east",
        duration: "109 min",
        year: "2009",
        genres: "Fantasía y Ciencia Ficción",
        vibes: ["🏰", "🌿", "🛌"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/tQwPYLbUm5NcREQ4QWX0mdBoKYb.jpg",
        description: "Afectados por una enfermedad terminal incurable, cientos de personas son puestas en un sueño criogénico dentro de un misterioso castillo. Al despertar muchos años después, el mundo ha sido reclamado por plantas monstruosas y enredaderas letales.",
        techSpec: "Adaptación del manga homónimo que integra animación tradicional con modelados cel shell muy tempranos para recrear entornos alienígenas opresivos."
    },

    // --- SEMANA 5: Retratos de Juventud (Coming of Age & Romance Anime) ---
    {
        title: "Puedo escuchar el mar",
        theme: "romance",
        duration: "72 min",
        year: "1993",
        genres: "Drama y Romance",
        vibes: ["🌊", "🏫", "✈️"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/fSR1LLMIJZ6WcQEkM82yKy4F9vQ.jpg",
        description: "Un drama sobre un triángulo amoroso adolescente que se forma meses después de la llegada de una atractiva estudiante transferida de Tokio en la secundaria de una pequeña ciudad en Kochi.",
        techSpec: "La primera película de Ghibli que fue dirigida exclusivamente por miembros juveniles del personal del estudio (los 'nuevos talentos')."
    },
    {
        title: "El Jardín de las Palabras",
        theme: "romance",
        duration: "46 min",
        year: "2013",
        genres: "Drama y Romance",
        vibes: ["🌧️", "👞", "🍃"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/j5PIVKmpxgo6MFb1sLF4qSJSpLD.jpg",
        description: "Un colegial de 15 años que falta a clases en días lluviosos para diseñar zapatos encuentra a una misteriosa mujer en un parque. Su extraña conexión silenciosa es guiada por la lluvia diaria.",
        techSpec: "Posiblemente la animación del agua, las gotas, reflejos de charcos de la ciudad y ambiente lluvioso más exquisita y fotorealista hecha nunca por Makoto Shinkai."
    },
    {
        title: "Palabras que burbujean como un refresco",
        theme: "romance",
        duration: "87 min",
        year: "2020",
        genres: "Comedia y Romance",
        vibes: ["🎧", "📝", "☀️"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/m0IjeN2jZg64Ff1H5e4Ba59CKW8.jpg",
        description: "Un fanático torpe de los haikus llamado Cereza conoce a una influencer súper tímida por sus dientes llamada Sonrisa en el verano soleado de Japón, sanando juntos mientras intentan encontrar un disco vinilo antiguo.",
        techSpec: "Emplea colores neón súper ruidosos y una paleta pop saturada sin sombras oscuras para potenciar la sensación constante del verano brillante y pop-art."
    },
    {
        title: "Tamako Love Story",
        theme: "romance",
        duration: "83 min",
        year: "2014",
        genres: "Comedia y Romance",
        vibes: ["🍡", "🗣️", "🌸"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/m59jfWqV6h3GAud7tSPShTXW6ZH.jpg",
        description: "Mientras los estudiantes de último año comienzan a mirar al futuro tras la graduación, Mochizo finalmente acopia el valor para confesarle sus sentimientos a Tamako, cambiando el ritmo inocente del distrito comercial para siempre.",
        techSpec: "Kyoto Animation se especializó en las sutilezas micro-expresivas de su protagonista (como gestos con las manos en estado de puro estrés al recibir la confesión)."
    },
    {
        title: "To Every You I’ve Loved Before",
        theme: "romance",
        duration: "102 min",
        year: "2022",
        genres: "Ciencia Ficción y Romance",
        vibes: ["🌌", "💞", "🔄"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/yl4WOrXTVFihtd6wcxpwkKD7xoP.jpg",
        description: "En un mundo donde cambiar entre infinitos universos paralelos es posible, vemos la vida de Koyomi, quien se enamora de Kazune. Según su decisión esta será una historia dulce o desgarradora.",
        techSpec: "La película es la mitad de un experimento cinematográfico en 2 partes: El orden en el que veas ambas películas cambiará todo el significado del final (¿final feliz o trágico?)."
    },
    {
        title: "To Me, the One Who Loved You",
        theme: "romance",
        isSequel: true,
        duration: "98 min",
        year: "2022",
        genres: "Ciencia Ficción y Romance",
        vibes: ["🌌", "💔", "🔄"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/gt7kD8MjObtgQYH130pZiLTN0qx.jpg",
        description: "La segunda perspectiva donde el protagonista persigue la promesa de salvar a su verdadero amor a través de las infinitas dimensiones paralelas, dispuesto a sacrificar su felicidad en el mundo actual.",
        techSpec: "Completa el bucle argumental multidimensional demostrando el efecto mariposa de las pequeñas y vitales elecciones humanas."
    },

    // --- SEMANA 6: Magia y Destino (Fantasía Occidental & Animación Clásica) ---
    { title: "El laberinto del fauno", theme: "magic", duration: "118 min", year: "2006", genres: "Fantasía y Drama", vibes: ["🧚‍♀️", "👁️", "⏳"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/953ZprqPxXSfhHvjBVRiIv7fSP6.jpg" },
    { title: "Kubo y las dos cuerdas mágicas", theme: "magic", duration: "101 min", year: "2016", genres: "Fantasía y Aventura", vibes: ["🎸", "🪲", "🐒"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/1fsLdTtaGC7wVGpwdhOPSxUA3pH.jpg" },
    { title: "Anastasia", theme: "magic", duration: "94 min", year: "1997", genres: "Fantasía y Musical", vibes: ["❄️", "👑", "🚂"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/bppGWGA8zq1sRvTdDJnUzVW9GcH.jpg" },
    { title: "Enredados", theme: "magic", duration: "100 min", year: "2010", genres: "Fantasía y Comedia", vibes: ["💇‍♀️", "🍳", "🏮"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/z5kvXWek4smCyeWBDJQkT5sLc9T.jpg" },
    { title: "Raya y el Último Dragón", theme: "magic", duration: "107 min", year: "2021", genres: "Fantasía y Aventura", vibes: ["🐉", "🗡️", "💧"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/hbjOtofNpvFvhzBUUoZGAjkjjsl.jpg" },
    { title: "El recuerdo de Marnie", theme: "magic", duration: "103 min", year: "2014", genres: "Drama y Misterio", vibes: ["👱‍♀️", "🚣‍♀️", "🌊"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/bzFVWaoSMcwpWu1r2wpbkImAiqf.jpg" },

    // --- SEMANA 7: Realismo Crítico y Culto (Cine de Personajes) ---
    { title: "Ikiru", theme: "cult", duration: "143 min", year: "1952", genres: "Drama y Clásico", vibes: ["❄️", " swings", "📝"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/dgNTS4EQDDVfkzJI5msKuHu2Ei3.jpg" },
    { title: "Jin-Roh: The Wolf Brigade", theme: "cult", duration: "102 min", year: "1999", genres: "Acción y Drama", vibes: ["🐺", "🛡️", "💣"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/nC1PUOAWUirtCdnBJ0W34arU18d.jpg" },
    { title: "Vexille", theme: "cult", duration: "109 min", year: "2007", genres: "Acción y Ciencia Ficción", vibes: ["🦾", "🏜️", "💥"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/uNMimh2Crv4rZ0AgcjGzuYEoZrW.jpg" },
    { title: "Oldboy", theme: "cult", duration: "120 min", year: "2003", genres: "Acción y Thriller", vibes: ["🐙", "🔨", "⏳"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/45kRW1xgTq3QrZltL9mY9e9iYkH.jpg" },
    { title: "Heathers", theme: "cult", duration: "103 min", year: "1989", genres: "Comedia y Crimen", vibes: ["🏏", "❤️", "💣"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/dGbVfM4WlM7uvIbyRehfPZUIgp2.jpg" },
    { title: "Heathers / Musical", theme: "cult", isOptional: true, duration: "135 min", year: "2022", genres: "Comedia y Musical", vibes: ["🎤", "❤️", "💣"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/9uasBuYPfmVy6gFNtWUM3EOLtFM.jpg" },
    { title: "Wuthering Heights (1939)", theme: "cult", duration: "104 min", year: "1939", genres: "Drama y Romance", vibes: ["⛈️", "👻", "💔"], poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/rnTneXb0oGh6yatXgPcn7ApYAge.jpg" },

    // --- SEMANA 8: Risas y Mascotas (Comedia & Confort) ---
    {
        title: "Monty Python and the Holy Grail",
        theme: "comedy",
        duration: "91 min",
        year: "1975",
        genres: "Comedia y Fantasía",
        vibes: ["🥥", "🐇", "🏰"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/7nTkHjETdGMYK1phHwDbPsrzbYl.jpg",
        description: "El Rey Arturo y sus caballeros de la Mesa Redonda se embarcan en una búsqueda surrealista y de bajo presupuesto para encontrar el Santo Grial, enfrentándose a franceses burlones y conejos asesinos.",
        techSpec: "La falta de presupuesto los obligó a usar mitades de cocos para simular el sonido de los caballos que no podían pagar."
    },
    {
        title: "A Goofy Movie",
        theme: "comedy",
        duration: "78 min",
        year: "1995",
        genres: "Comedia y Musical",
        vibes: ["🎣", "🚗", "🎤"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/bycmMhO3iIoEDzP768sUjq2RV4T.jpg",
        description: "En un intento desesperado por conectarse con su hijo adolescente Max, Goofy lo arrastra en un viaje por carretera en el verano, amenazando los planes de Max para conquistar a la chica de sus sueños.",
        techSpec: "Considerada retroactivamente como la película animada que mejor capturó la estética e inquietudes de los adolescentes de los 90."
    },
    {
        title: "An Extremely Goofy Movie",
        theme: "comedy",
        isSequel: true,
        duration: "79 min",
        year: "2000",
        genres: "Comedia y Deportes",
        vibes: ["🛹", "🕺", "🎓"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/bRQbaTkzxuHcsNy1NK1aRuueFLs.jpg",
        description: "Max finalmente se va a la universidad para ser independiente y competir en los juegos extremos X-Games, pero su pesadilla se hace realidad cuando Goofy pierde su trabajo y debe inscribirse en su misma universidad.",
        techSpec: "Se destaca por capitalizar el boom de los deportes extremos (Tony Hawk, X-Games) de finales de los 90 de manera sorprendentemente autoconsciente."
    },
    {
        title: "The Adventure of Buratino",
        theme: "comedy",
        duration: "143 min",
        year: "1976",
        genres: "Comedia y Fantasía",
        vibes: ["🤥", "🗝️", "🎭"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/wnfBuPp7w1yEIJGX0LuHM4qGlud.jpg",
        description: "La extravagante y bizarra adaptación musical y en imagen real rusa del cuento de Pinocho. Sigue a Buratino, un niño de madera que busca el secreto de la Llave de Oro.",
        techSpec: "Es una película de la era soviética que se volvió un clásico de culto mundial por su tono caótico, maquillaje perturbador y canciones pegadizas."
    },
    {
        title: "The Bad Guys",
        theme: "comedy",
        duration: "100 min",
        year: "2022",
        genres: "Comedia y Crimen",
        vibes: ["🐺", "🐍", "💰"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/czxHSOXyKd6zEvIOvUTxAwqOjcK.jpg",
        description: "Una célebre pandilla de animales criminales atrapados bajo amenaza de prisión fingen rehabilitarse para convertirse en 'chicos buenos', hasta que el líder comienza a cuestionar si realmente quiere cambiar.",
        techSpec: "Marcó un antes y un después para DreamWorks al mezclar CGI limpio con texturas pictóricas estilo cómic (inspirado en Spider-Verse) y un aire de película de robos tipo Ocean's 11."
    },
    {
        title: "The Bad Guys 2",
        theme: "comedy",
        isSequel: true,
        duration: "100 min",
        year: "2025",
        genres: "Comedia y Crimen",
        vibes: ["🦊", "🦈", "🚗"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/mZmnKDhIS2yNmtfzde5vtdCYzBF.jpg",
        description: "Los Chicos Malos regresan como equipo, intentando equilibrar sus nuevas y aburridas vidas como ciudadanos honrados antes de ser arrastrados a un último gran robo por un escuadrón de criminales femeninas.",
        techSpec: "Impulsa aún más la fusión de 2D/3D añadiendo secuencias de acción coreografiadas al ritmo de una banda sonora funk/jazz mejorada."
    },

    // --- SEMANA 9: Sci-Fi Moderno ---
    {
        title: "Superman (2025)",
        theme: "scifi",
        duration: "135 min",
        year: "2025",
        vibes: ["🦸‍♂️", "🏙️", "✨"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/fvUJb08yatV2b3NUSwuYdQKYoFd.jpg",
        description: "El icónico Hombre de Acero debe reconciliar su herencia kryptoniana con su crianza humana como Clark Kent en Smallville, enfrentándose a dilemas éticos y a nuevas amenazas galácticas.",
        techSpec: "La primera película pura del reinicio del universo DC a manos de James Gunn (DCU), usando trajes prácticos que rinden homenaje tanto a los cómics modernos como clásicos."
    },
    {
        title: "Transformers One",
        theme: "scifi",
        duration: "104 min",
        year: "2024",
        vibes: ["🤖", "🚗", "💥"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/1jzVCZxBmgvpGILuEU8icfX77Io.jpg",
        description: "La historia del origen no contada ambientada en un joven planeta Cybertron, que explica cómo Orion Pax y D-16 pasaron de ser hermanos de armas a convertirse en los eternos archienemigos Optimus Prime y Megatron.",
        techSpec: "La primera película puramente animada por computadora en la franquicia en décadas, elogiada masivamente por la crítica por el desarrollo de su villano."
    },
    {
        title: "In Your Dreams (2025)",
        theme: "scifi",
        duration: "108 min",
        year: "2025",
        vibes: ["💭", "🌙", "✨"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/z2v3lNAA2ymrZuKof4J2vqFIBdw.jpg",
        description: "Dos hermanos navegan el extraño y divertido mundo del Subconsciente Colectivo en la mente humana compartida para intentar de forma desesperada dominar sus propios miedos de la infancia y madurar juntos.",
        techSpec: "Una apuesta surrealista de Netflix que empuja los límites creativos conceptualizando los sueños no solo como escenarios sino como seres vivos con físicas erráticas."
    },
    {
        title: "Elio",
        theme: "scifi",
        duration: "100 min",
        year: "2025",
        vibes: ["👽", "👦", "🌌"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/fqF7z5A8kFIrNtSdpEfjE539fna.jpg",
        description: "Elio, un niño solitario con una imaginación activa, es abducido por accidente al Comuniverso, una organización interplanetaria, donde es confundido por el embajador líder del Planeta Tierra.",
        techSpec: "Pixar aprovechó las leyes sin sentido del espacio profundo para diseñar las criaturas alienígenas más asimétricas, abstractas y coloridas de su historia."
    },
    {
        title: "Elemental (Disney)",
        theme: "scifi",
        duration: "101 min",
        year: "2023",
        vibes: ["🔥", "💧", "🏙️"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/d79DeKDCgFOM23O8Dr6MELZVooY.jpg",
        description: "En la bulliciosa Ciudad Elementos, donde conviven el fuego, agua, tierra y aire, una dura y pasional chica de fuego llamada Ember forja una relación con Wade, un chico de agua tranquilo, desafiando las creencias del mundo de que 'los elementos no se mezclan'.",
        techSpec: "No existen esqueletos ni riggins físicos en toda la película: ambos protagonistas son fluidos generados constantemente por millones de partículas volumétricas renderizadas por GPU."
    },
    {
        title: "Alien: Romulus (2024)",
        theme: "scifi",
        duration: "119 min",
        year: "2024",
        vibes: ["👽", "🚀", "🩸"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/8PYqGSd8MOm5ce8io4qNSAiSExW.jpg",
        description: "Mientran hurgan en las profundidades de una estación espacial en ruinas abandonada, un grupo de jóvenes colonos espaciales se encuentra cara a cara con la forma de vida más aterradora y despiadada de todo el universo.",
        techSpec: "Dirigida por Fede Álvarez, recuperó por completo el terror claustrofóbico de 1979 al crear todos los Xenomorfos con animatrónicos en tamaño real y efectos prácticos, usando CGI solo para retoques menores."
    },

    // --- SEMANA 10: Fantasia moderna ---
    {
        title: "Belle",
        theme: "fantasy-modern",
        duration: "122 min",
        year: "2021",
        vibes: ["🎧", "🐉", "🌸"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/2WDFB4i7CgQAs9oMAFf0Et8Uwuv.jpg",
        description: "Suzu es una tímida estudiante de secundaria en un pueblo rural oscuro. Durante años solo ha sido la sombra de sí misma, hasta que ingresa a 'U', un mundo virtual gigante donde se convierte en Belle, una superestrella de la música idolatrada en todo el planeta.",
        techSpec: "La película entrelazó diseñadores de moda reales para vestir a los avatares virtuales de la red 'U' con un modelado 3D impresionante para las canciones."
    },
    {
        title: "El Castillo a través del Espejo",
        theme: "fantasy-modern",
        duration: "116 min",
        year: "2022",
        vibes: ["🏰", "🪞", "🐺"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/rinnHex54R0MdkFnSTVQvP7noLH.jpg",
        description: "Siete adolescentes solitarios, que evitan ir a la escuela por miedo al acoso y la ansiedad, son transportados metafísicamente a un misterioso castillo de cuento de hadas mediante los espejos de sus dormitorios. Deben encontrar una llave antes de fin de año o serán devorados.",
        techSpec: "Destaca por ser una alegoría cruda sobre los 'hikikomori' (adolescentes aislados socialmente de Japón) abordado con tacto en forma de misterio contrarreloj."
    },
    {
        title: "Bubble (2022)",
        theme: "fantasy-modern",
        duration: "100 min",
        year: "2022",
        vibes: ["🫧", "🏃‍♂️", "🎧"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/kM1NG2m3nn1e0PBYGhvRV1FSLX6.jpg",
        description: "Tokio está aislada del mundo y su gravedad paralizada tras llover extrañas burbujas del cielo. Ahora es un patio de recreo para jóvenes audaces de parkour. Cuando un as pierde el control, una misteriosa chica, Uta, lo salva de flotar para siempre.",
        techSpec: "Studio WIT usó trazos sumamente gruesos, cámara dinámica rotatoria e hiperiluminación de partículas para hacer del parkour una danza etérea y violenta al mismo tiempo."
    },
    {
        title: "Amor de Gatos (A Whisker Away)",
        theme: "fantasy-modern",
        duration: "104 min",
        year: "2020",
        vibes: ["🐈", "🎭", "✨"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/3QJ4yVmSxuLQX8vHW4elcqUa1T8.jpg",
        description: "Muge, una peculiar adolescente de secundaria enamorada en secreto de su compañero Hinode, descubre que la única forma de acercarse a él es usando una curiosa máscara mágica que la convierte, literalmente, en una pequeña gata blanca.",
        techSpec: "Una película enfocada de manera íntima a desdibujar la fina línea psicológica de lo que representa perder el yo humano a cambio del abrazo de la inocencia animal."
    },
    {
        title: "The Stranger by the Shore",
        theme: "fantasy-modern",
        duration: "59 min",
        year: "2020",
        vibes: ["🌊", "🐈", "💞"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/wt9syGS5BQQY2gC1Pk8E22XQRBo.jpg",
        description: "En una apartada y tranquila isla de Okinawa, un joven novelista gay exiliado por su familia cruza su destino con Shun, un melancólico estudiante de secundaria huérfano que pasa los días mirando el mar. Una historia bella de aceptación.",
        techSpec: "Resalta por su uso hipervívido de atmósferas marítimas para emular el verano constante, el sonido de fondo de los insectos y los intensos atardeceres como narradores emocionales silenciosos."
    },
    {
        title: "El niño, el topo, el zorro y el caballo",
        theme: "fantasy-modern",
        duration: "34 min",
        year: "2022",
        vibes: ["👦", "🦊", "❄️"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/jfkVV2RrD5tXAy8P0JLl90ELS0S.jpg",
        description: "Un chico perdido en medio de un frío monte invernal explora el vasto sentido de la vida apoyándose de forma enternecedora en la dulce amistad de sus tres animales acompañantes, intentando de a poco, encontrar el camino a casa.",
        techSpec: "Obra ganadora del Oscar elaborada al imitar acuarelas sobre papel blanco que dan la ilusión de ser un cuento infantil que cobra vida en estado bocetado continuo."
    },

    // --- SEMANA 11: Retro-Futurismo & Motores ---
    {
        title: "Sky Captain and the World of Tomorrow",
        theme: "retro-future",
        duration: "106 min",
        year: "2004",
        genres: "Acción y Ciencia Ficción",
        vibes: ["✈️", "🤖", "☁️"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/iqQE2JoC2BroYOJev5i7jiHeQl6.jpg",
        description: "En una línea temporal paralela de 1939, un piloto as y una intrépida periodista deben impedir que un científico megalómano y sus ejércitos de máquinas destructoras dominen el frágil mundo.",
        techSpec: "Uno de los primeros largometrajes en la historia en grabar a todos sus actores completamente sobre pantallas azules para procesar todos los fondos por computadora de forma intencionalmente antigua."
    },
    {
        title: "Robots",
        theme: "retro-future",
        duration: "91 min",
        year: "2005",
        genres: "Comedia y Ciencia Ficción",
        vibes: ["🤖", "🔧", "🏙️"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/e5GTdGwZAvaPgO8kOEsGltzgIUX.jpg",
        description: "Enfoque sobre Rodney Hojalata, un joven inventor idealista que viaja a Ciudad Robot para conocer al famoso Gran Soldador, y se cruza con una corporación malvada obsesionada con dejar obsoletos los repuestos para obligar a los pobres a comprar actualizaciones ridículamente caras.",
        techSpec: "El diseño de producción tomó inspiración cruda de elementos domésticos e industriales (máquinas de escribir, bujías y cafeteras clásicas de los años 50)."
    },
    {
        title: "9 (2009)",
        theme: "retro-future",
        duration: "79 min",
        year: "2009",
        genres: "Acción y Ciencia Ficción",
        vibes: ["🧵", "🤖", "🔥"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/mu1zDw4qxlUzrBizasO24unC766.jpg",
        description: "Luego de que las máquinas apagaran la luz de la raza humana por completo tras una cruel guerra mundial, un frágil muñeco de trapo con el número 9 despierta buscando proteger los vestigios del espíritu humano con sus iguales.",
        techSpec: "Famosa por su aspecto de animación desolador y lúgubre conocido popularmente como Stitch-punk (estilo derivado directamente del steampunk o ciberpunk pero con tela y resortes oxidados). Producida por Tim Burton."
    },
    {
        title: "Memories (1995)",
        theme: "retro-future",
        duration: "113 min",
        year: "1995",
        genres: "Ciencia Ficción y Thriller",
        vibes: ["🚀", "🌹", "🔫"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/3CEv467aWJ9btMFkKAxd74PBxwX.jpg",
        description: "Una antología legendaria de tres perturbadoras obras de arte: una nave espacial a la deriva controlada por IA de luto perpetuo, una guerra política biológica provocada por un oficinista sin suerte, y una distopía militar obsesionada con lanzar cañones gigantes a un enemigo invisible.",
        techSpec: "Katsuhiro Otomo, legendario de por vida por Akira, reclutó personalmente a las mentes más brillantes (Morimoto, Okamura) de la floreciente era dorada del anime de los 90 para esta obra experimental e inclasificable."
    },
    {
        title: "The Sky Crawlers",
        theme: "retro-future",
        duration: "122 min",
        year: "2008",
        genres: "Drama y Ciencia Ficción",
        vibes: ["✈️", "☁️", "🔫"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/b5Mox8aaTOECp1PqBbvFlSnZ5ST.jpg",
        description: "En una era donde existe paz global definitiva, enormes corporaciones contratan ejércitos de Kildren (jóvenes inmortalmente estancados en la adolescencia diseñados genéticamente) para luchar brutales guerras aéreas televisadas solo para saciar la sed humana de conflicto.",
        techSpec: "De Mamoru Oshii (director de Ghost in the Shell), usa combates aéreos súper rápidos en 3D sobre fondos y personajes pesadamente nostálgicos en clásico anime 2d para provocar letargo y futilidad al espectador."
    },
    {
        title: "Soy Frankelda (2025)",
        theme: "retro-future",
        duration: "72 min",
        year: "2024",
        genres: "Fantasía y Terror",
        vibes: ["📖", "👻", "🖋️"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/bp7TxHXrUlTfCIiA0z2pdkX9X56.jpg",
        description: "Frankelda es una antigua escritora macabra. Sus cuentos nunca fracasan en asustar. A través del libro en una habitación lúgubre en un castillo del inframundo, descubres la aterradora vida y decisiones que la condujeron hasta ser un fantasma.",
        techSpec: "Cinta fenomenal desarrollada 100% en Latinoamérica en stop motion crudo para Warner Channel imitando visualmente clásicos del folklore mexicano junto a cuentos decimonónicos e historias de Hans Christian Andersen."
    },

    // --- SEMANA 12: Adrenalina y Estilo (Guns & Glitch) ---
    {
        title: "Hardcore Henry",
        theme: "action-glitch",
        duration: "96 min",
        year: "2015",
        genres: "Acción y Ciencia Ficción",
        vibes: ["🩸", "🔫", "🕶️"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/wqu4G6sghlca1CGBIa5TXKVtGLP.jpg",
        description: "Alguien se despierta en un laboratorio sin memoria, su esposa es secuestrada de inmediato, le implanta prótesis cibernéticas. Escapa a Moscú y lo que resta son 90 minutos de pura venganza caótica intentando salvarla.",
        techSpec: "La película completa está literalmente grabada en POV ultra dinámico de GoPro atadas a la cabeza del protagonista emulando al 100% mecánicas locas de cualquier FPS moderno."
    },
    {
        title: "Kick-Ass",
        theme: "action-glitch",
        duration: "117 min",
        year: "2010",
        genres: "Acción y Comedia",
        vibes: ["🦸‍♂️", "🩸", "👊"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/iHMbrTHJwocsNvo5murCBw0CwTo.jpg",
        description: "Dave Lizewski, un estudiante invisible para todos y fanático absoluto del cómic, un día se confecciona un traje por internet para ser superhéroe en la vida real. Obviamente, comienza recibiendo palizas dolorosas. Y termina de peor forma.",
        techSpec: "Dirigida por Matthew Vaughn, cambió y deconstruyó la seriedad limpia de las películas de Marvel antes del 'boom' introduciendo masacres ridículamente violentas."
    },
    {
        title: "Kick-Ass 2",
        theme: "action-glitch",
        isSequel: true,
        duration: "103 min",
        year: "2013",
        genres: "Acción y Comedia",
        vibes: ["🦸‍♂️", "🦹‍♂️", "⚔️"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/yMOb8MwEzOfjZf1QDU6l9eHfmbs.jpg",
        description: "La locura de Kick-Ass inspira a más superhéroes aficionados a patrullar disfrazados las calles liderados por el ex-mafioso Coronel Stars. Mientras, su viejo enemigo The Mother Fucker prepara una armada de súper villanos.",
        techSpec: "Ahonda mucho más en las severas presiones psicológicas y emocionales del aislamiento social, subiendo la apuesta letal de la primera entrega."
    },
    {
        title: "Mutafukaz",
        theme: "action-glitch",
        duration: "90 min",
        year: "2017",
        genres: "Acción y Ciencia Ficción",
        vibes: ["💀", "🔫", "🔥"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/oSMIKsznGYzGfdl611kgEJF889.jpg",
        description: "Angelino es solo otro joven que intenta sobrevivir en Dark Meat City. Hasta que termina sufriendo visiones de invasiones de entidades sombrías secretas operando a través de las cabezas corruptas del mafioso escuadrón local. Ahora le persiguen, y es la guerra.",
        techSpec: "Producto de talento global absurdo. Nacida de un cómic francés callejero, animada por Studio4C japonés y envuelta en hiperestilización al estilo hip hop gótico latino con armas."
    },
    {
        title: "As the Gods Will",
        theme: "action-glitch",
        duration: "117 min",
        year: "2014",
        genres: "Terror y Suspenso",
        vibes: ["🩸", "🎎", "🎲"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/3Obn9IR47fjhbtYtNrO7CBSrZ2w.jpg",
        description: "Durante el turno regular, la pacífica pero aburrida clase del preparatoria japonés experimenta el caos más asquerosamente brutal, al despertar atados a una serie extrema y a muerte obligatoria de juegos infantiles antiguos controlados por monstruosos dioses de madera y hojalata.",
        techSpec: "La obra infame que se cuenta pudo haber influenciado inmensamente a shows virales y mega millones como El Juego del Calamar. Puro terror alucinógeno de Takashi Miike."
    },
    {
        title: "Fight Club",
        theme: "action-glitch",
        duration: "139 min",
        year: "1999",
        genres: "Drama y Thriller",
        vibes: ["🧼", "👊", "🤯"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/sgTAWJFaB2kBvdQxRGabYFiQqEK.jpg",
        description: "La insatisfacción sofocante y consumista cruda de un perito oficinista y la mentalidad peligrosa, astuta y revolucionaria de su nuevo y demente amigo, el carismático creador de jabones, desemboca en un grupo varonil de resistencia visceral y terapia callejera llamado: El Club de la Pelea.",
        techSpec: "David Fincher dirigió una de las películas pilares y fundamentales de finales de los noventa. Su asquerosa colorimetría amarilla de neón sucio generó debates culturales universales."
    },

    // --- SEMANA 13: Classic Vibes & Hollywood ---
    {
        title: "Los Locos Addams",
        theme: "classic-comedy",
        duration: "99 min",
        year: "1991",
        genres: "Comedia y Fantasía",
        vibes: ["🕸️", "🥀", "🦇"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/ro7bdsSGp1jtvMxSWEfLLCK33PO.jpg",
        description: "El hermano mayor por mucho tiempo perdido, el Tío Lucas reaparece provocando intriga y extásis oscuro en la grotesca y extrañamente enamorada familia Addams. Pero Morticia y Homero descubren en el fondo un lado algo diferente en él de lo que recordaban.",
        techSpec: "Fue la película que rescató el humor retorcido y estéticamente macabro noventero cimentando el arquetipo de la familia gótica en la cultura global."
    },
    {
        title: "Austin Powers",
        theme: "classic-comedy",
        duration: "89 min",
        year: "1997",
        genres: "Comedia y Acción",
        vibes: ["🕺", "👓", "☮️"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/6vUjqYh8hDh7pVIcdQySw3SN3SH.jpg",
        description: "Austin Powers, un fotógrafo súper espía ridículamente extravagante empedernido de los años 60 despierta descongelado 30 años después en el aburrido 90, forzado a evitar la destrucción mundial a manos de su peor archienemigo, el temible Dr. Evil.",
        techSpec: "Mike Myers interpretó en forma de mofa irónica la totalidad de los cliches espías clásicos a lo James Bond logrando el icónico villano calvo del dedo pequeño a la boca."
    },
    {
        title: "The Naked Gun",
        theme: "classic-comedy",
        duration: "85 min",
        year: "1988",
        genres: "Comedia y Crimen",
        vibes: ["👮‍♂️", "🤦‍♂️", "😂"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/zT0mhZqZQJE1gSY5Eg9qcGP4NYo.jpg",
        description: "El inepto, incauto e inmortalmente despistado detective teniente Frank Drebin tiene la muy delicada misión de investigar el inminente posible asesinato mundial de la mismísima Reina Isabel de Inglaterra.",
        techSpec: "La obra maestra pionera del humor absurdo, introduciendo secuencias gags ininterrumpidas (y sin explicación ninguna) en cámara continua con maestría total cortesía de Leslie Nielsen."
    },
    {
        title: "Fiebre de Sábado por la Noche",
        theme: "classic-comedy",
        duration: "118 min",
        year: "1977",
        genres: "Drama y Musical",
        vibes: ["🕺", "🪩", "✨"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/qgwWjfpgGvUPoWXdq5kPLii6AOr.jpg",
        description: "Para Tony Manero a sus 19 años de edad sumido en vidas precarias, el paraíso único existencial se resume en ser adorado con sus zapatos brillantes al llegar la noche de los sábados por todas las mujeres al dominar implacablemente la deslumbrante pista de baile de un club en Brooklyn.",
        techSpec: "Revivió y marcó universalmente a la época cultural disco mundial por los impecables pasos del legendario John Travolta y la fantástica lista de sonido de los Bee Gees."
    },
    {
        title: "Barbie",
        theme: "classic-comedy",
        duration: "114 min",
        year: "2023",
        genres: "Comedia y Fantasía",
        vibes: ["🎀", "👱‍♀️", "💖"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/fNtqD4BTFj0Bgo9lyoAtmNFzxHN.jpg",
        description: "Atravesando un ataque de angustia e imperfección, la rubia estereotípica número 1 viaja buscando su dueña a las crudas calles de nuestra dolorosa humanidad de vida real abandonando el paradisíaco y plástico Barbiland, y atrayendo por fatal accidente a Ken y la oscura sombra del ego patriarcal con ella al plano perfecto de atrás.",
        techSpec: "Un gigante éxito en taquillas al destilar crítica mordaz y feminista por manos de Greta Gerwig en la piel y plástico de un producto publicitario en pantallas color magenta."
    },
    {
        title: "Wonka",
        theme: "classic-comedy",
        duration: "116 min",
        year: "2023",
        genres: "Comedia y Fantasía",
        vibes: ["🎩", "🍫", "✨"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/6eHcR7zwvNSvkOl9jbctU0lvZQ1.jpg",
        description: "Basada en el extraño y legendario joven visionario excéntrico persiguiendo los raros, deliciosos dulces imposibles hasta formar con ingenio absoluto su propia amada y perturbadora pero hermosa fábrica de magia acaramelada.",
        techSpec: "Una precuela mágica colorida y musical protagonizada por Thimothee Chalamet reviviendo los cuentos mágicos con una calidez genuina."
    },

    // --- SEMANA 14: China ---
    {
        title: "White Snake",
        theme: "china-3d",
        duration: "99 min",
        year: "2019",
        genres: "Fantasía y Romance",
        vibes: ["🐍", "🤍", "✨"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/fSzoOexVd4sUp5WQJpeyugQXyMW.jpg",
        description: "En los tiempos oscuros de antaño en el Oriente mítico la amnésica deidad de una Blanca serpiente celestial, Blanca, cruza su caótico misterio envuelta a Xuan, un recolector, naciendo devoción a medida que intentan frenar magia mortal, asesinos fantasma y la amenaza corrupta eterna.",
        techSpec: "Exhibición dorada visual nacida a los lamentos perdidos del cine chino impulsado fuertemente por tecnología pura 3D animada por la talentosísima casa de Light Chaser Animation."
    },
    {
        title: "Green Snake",
        theme: "china-3d",
        isSequel: true,
        duration: "131 min",
        year: "2021",
        genres: "Fantasía y Acción",
        vibes: ["🐍", "💚", "⚡"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/g1d3uFf3eGvVJQ5Coh793Zi1ASq.jpg",
        description: "Buscando desenfrenadamente y tras cientos de eones y pesadillas incesantes la reencarnación de su noble y gentil hermana la Serpiente Verde atraviesa castigos al plano del apocalíptico Asuraville con extraños motociclistas fantasmales para retar cruentas deidades corruptas.",
        techSpec: "La continuación subió de nivel la espectacularidad empujando al límite absurdo a todo Light Chaser combinando dioses gigantes feudales asiáticos con un contexto caótico y retorcido de motos distópicas post apocalíptico urbano en la guerra 3d visual."
    },
    {
        title: "Deep Sea (2023)",
        theme: "china-3d",
        duration: "112 min",
        year: "2023",
        genres: "Fantasía y Drama",
        vibes: ["🌊", "👁️", "🎨"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/e3S0nN9jhxWBuWdRXQupZJchJiX.jpg",
        description: "Shenxiu carga trágica profunda sensación asfixiante hasta extraviarse bajo una extrañísima furia tormentosa sobre altamar a internarse hundida e increíblemente profunda allí descubriendo aturdida todo ese mundo surreal lleno total de criaturas oníricas en un gigantesco submarino del Fondo de las almas mágicas.",
        techSpec: "Reconocida obra maestra y revolución mundial en la simulación CGI renderizando sus texturas al milímetro simulando pintura viva hipercolorida al oleo fluidificada densamente por el mar."
    },
    {
        title: "La guerra de los dioses",
        theme: "china-3d",
        duration: "116 min",
        year: "2021",
        genres: "Fantasía y Acción",
        vibes: ["🗡️", "🐉", "🎮"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/zsqL12ptbF89vMWHgf3kxuacJso.jpg",
        description: "El cielo entra bajo gran desorden, caótico cuando reaparece la magia destructiva que desestabilizará a toda la balanza terrenal entre las furias. Todo recae sobre dioses destituidos e inesperados héroes voladores batallando interminablemente.",
        techSpec: "Firme candidata entre muchísimas películas puramente 3D china de alta energía explotando el hipercinético sistema folclórico con exageradas escalas gigantes."
    },
    {
        title: "Me and My Magnet and My Dead Friend",
        theme: "china-3d",
        duration: "15 min",
        year: "2019",
        genres: "Fantasía y Drama",
        vibes: ["🍓", "📼", "💭"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/nv4yMVf1dbFFwpZsovGlt0yScQH.jpg",
        description: "Singular cortometraje asombroso de lo raro. Relaciones distantes y nostálgicas en extrañas memorias sobre imanes, el duelo solitario silencioso de la niñez rural o de juventud perdida en transiciones rápidas surrealistas a lo asiáticas modernas extrañísimas.",
        techSpec: "Pequeño y enigmático cortometraje galardonado por asirse profundamente y bruscamente a sensibilidades pesadilla infantil y stop motion bizarramente íntimo independiente."
    },
    { title: "SYSTEM MAINTENANCE", theme: "system", vibes: ["⚠️", "🔧", "🚫"], isMaintenance: true, techSpec: "SERVER OFFLINE", description: "Mantenimiento de servidores.", poster: null },

    // --- SEMANA 15: VFX & Experimental Art ---
    {
        title: "The Triplets of Belleville",
        theme: "vfx-art",
        duration: "80 min",
        year: "2003",
        genres: "Comedia y Aventura",
        vibes: ["🚴‍♂️", "👵", "🎨"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/jcoNbS5nJsoKRdR8BpfAC8II8P6.jpg",
        description: "Con excentricidad única francesa el Tour de France es asaltado. Campeones huyen apresados y una gruesa, enérgica y silenciosa abuelita enérgica de Madame Souza en compañía de su leal perrito inician un rarísimo absurdo e imparable rescate a bordo cruzando oscuros océanos para toparse con icónicas viejitas trillizas de Belleville.",
        techSpec: "Prácticamente el clásico definitivo francés sin apenas un rastro comprensible de diálogos en todo y sumamente cargado en diseño mudo de caracteres caricaturesco absurdo en 2D super realista bizarro."
    },
    {
        title: "Genius Party Beyond",
        theme: "vfx-art",
        duration: "85 min",
        year: "2008",
        genres: "Ciencia Ficción y Fantasía",
        vibes: ["🤯", "🔥", "🌀"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/uGZbRSafiU6A2Ek5idLWS7yGR4U.jpg",
        description: "Compendio ultra lisérgico de varios increíbles cortometrajes desconectados. Crecimiento adolescente, infancias trágicas espaciales y entidades geométricas coloridas o psicodélicas, desdibujando por completo barreras de género, el sueño y el límite asombroso del anime en sí.",
        techSpec: "Studio 4C cedió control hiper creativo a leyendas ocultas del diseño japonés (Shinya Ohira, Masaaki Yuasa). Es una explosión puramente de lo vanguardista visual experimental."
    },
    {
        title: "Cat Soup",
        theme: "vfx-art",
        duration: "34 min",
        year: "2001",
        genres: "Fantasía y Comedia Negra",
        vibes: ["🐈", "🥣", "💀"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/5V6o4IO3APP0I4DLMLuv0glMf7.jpg",
        description: "Dos gatos pequeños adorables intentan inútilmente navegar horrores grotescos para intentar recuperar trozos la mitad perdida de toda el alma mágica arrebatada de una muerte prematura de la hermanita del gato menor tras una fuerte fiebre infantil. Un desfile existencial crudo sombrío a través el vacío y locura bizarra terrenal.",
        techSpec: "Animación densamente surreal. Espectadora. No existen piedad narrativa pero fue venerado a un estado culto de nicho intocable y escalofriante a manos del genio críptico Tatsuo Sato."
    },
    {
        title: "The Spine of Night",
        theme: "vfx-art",
        duration: "93 min",
        year: "2021",
        genres: "Fantasía y Terror",
        vibes: ["⚔️", "🌌", "🩸"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/dM6R6LSe0LHYNnizWjPHI404DBK.jpg",
        description: "Una terrible y salvaje historia de magia cruel es diseminada en pantanos místicos. Guerreros despiadados sanguinarios luchan brutalmente en la búsqueda del poder en la mítica extrañísima floración cósmica mágica en cruda ultra violencia descarnada y horror macabro fantasía.",
        techSpec: "Retoma la asombrosa técnica de pura rotoscopia hiper analógica (redibujar cada fotograma sobre los actores de la vida real) inspirándose duramente en el filme crudo Fire and Ice en honor a la pura fantasía madura."
    },
    {
        title: "Psiconautas, los niños olvidados",
        theme: "vfx-art",
        duration: "76 min",
        year: "2015",
        genres: "Drama y Fantasía",
        vibes: ["🐦", "💊", "🔥"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/uBAUnHPkhu4aYSBU1iWHtLaiUI0.jpg",
        description: "Pequeños seres animalizados se ven hundidos en incesante drogadicción trágica desesperada a orillas en oscuras en islas españolas cubiertas pos apocalipsis. Un ratón niño gótico, Birdboy el atormentado adolescente demonio y sus patéticamente bellos amigos ansían volar dolorosamente hacia su supuesta trágica y utópica libertad final.",
        techSpec: "Filme animado ganador del ilustre premio Goya en base fuertemente dibujada y estética melancólicamente destructiva y perturbadora y sucia por las desmoralizadas infancias oscuras con pinceladas al oleo sombrio."
    },
    {
        title: "Wolfwalkers",
        theme: "vfx-art",
        duration: "103 min",
        year: "2020",
        genres: "Fantasía y Aventura",
        vibes: ["🐺", "👧", "🌲"],
        poster: "https://www.themoviedb.org/t/p/w600_and_h900_face/4AbbGAiz1t5Hxa9c35avWeyB3dA.jpg",
        description: "Leyenda irlandesa hermosa cuenta cómo la joven y pequeña inocente cazadora aprendiz bosque de nombre Robyn al hacerse increíblemente de una misteriosa niña bosque cambia incesantemente. Por la noche en sus oscuros instintos su alma puede transitar a cazar libre como un mágico y misterioso e indomable místico espíritu animal y convertirse su gran lobo furioso.",
        techSpec: "Considerada un colofón 2D inmenso del aclamado estudio irlandés (Cartoon Saloon). Animaron las líneas rudas de bosque manteniendo bocetos del lápiz inicial en pantalla deliberadamente para exudar folclore artesanal inusitado."
    }
];

// 3. GENERADOR AUTOMÁTICO DE FECHAS
const generatePlannedMovies = () => {
    let movies = {};

    // Seteamos la fecha de inicio: Viernes 13 de Febrero de 2026 (Local time real)
    let currentDate = new Date(2026, 1, 13); // Año 2026, Mes 1 (Febrero), Día 13
    let currentTheme = null;

    rawMoviesList.forEach((movie) => {
        // Si el día actual es Jueves (4) y la pelicula actual no es opcional, lo saltamos sumando 1 día,
        // igual si cae en los días de mantenimiento (22, 24, 28 Feb)
        while (!movie.isOptional && (currentDate.getDay() === 4 || ((currentDate.getDate() === 22 || currentDate.getDate() === 24 || currentDate.getDate() === 28) && currentDate.getMonth() === 1 && currentDate.getFullYear() === 2026))) {
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

        // Solo avanzamos al próximo día si NO es una película opcional;
        // Si es opcional (como Heathers / Musical el Jueves), la dejamos ahí y la siguiente (Oldboy)
        // se considerará para el Viernes.
        if (!movie.isOptional) {
            currentDate.setDate(currentDate.getDate() + 1);
        } else {
            // Avanzamos 1 dia desde la pelicula opcional para continuar con normalidad
            currentDate.setDate(currentDate.getDate() + 1);
        }
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