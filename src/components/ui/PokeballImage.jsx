import React, { useState } from 'react';

// DICCIONARIO DE ARCHIVOS LOCALES
// Ubicación física: client/public/balls/
const BALL_FILES = {
    'poke-ball': 'pokeball.png',
    'ultra-ball': 'ultraball.png',
    'master-ball': 'masterball.png',
    'lujo-ball': 'lujoball.png',  // Mapeo directo a tu archivo
    'ente-ball': 'enteball.png',  // Mapeo directo a tu archivo

    // Fallback por defecto
    'default': 'pokeball.png'
};

const PokeballImage = ({ type, size = "w-12 h-12", className = "" }) => {
    const [error, setError] = useState(false);

    // 1. Normalización del nombre (DB -> Key)
    // Ej: "Lujo Ball" -> "lujo-ball"
    const normalizedKey = type
        ? type.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Sin tildes
            .trim()
            .replace(/\s+/g, '-') // Espacios a guiones
        : 'default';

    // 2. Obtener nombre de archivo
    const fileName = BALL_FILES[normalizedKey] || BALL_FILES['default'];

    // 3. Construir ruta (En Vite, 'public' es la raíz '/')
    const imagePath = `/balls/${fileName}`;

    // Renderizado de Error (Si el archivo no está en la carpeta)
    if (error) {
        return (
            <div
                className={`${size} ${className} rounded-full bg-gray-800 border-2 border-red-500 flex items-center justify-center shadow-lg`}
                title={`Falta archivo: ${fileName}`}
            >
                <span className="text-white font-bold text-xs">?</span>
            </div>
        );
    }

    return (
        <img
            src={imagePath}
            alt={type}
            className={`${size} ${className} object-contain drop-shadow-md hover:scale-110 transition-transform duration-200`}
            onError={() => {
                console.error(`❌ ERROR: No se encuentra la imagen en ${imagePath}`);
                setError(true);
            }}
            loading="lazy"
        />
    );
};

export default PokeballImage;
