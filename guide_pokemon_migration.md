# Optimización de Rendimiento y Fondo Animado (Pokémon Mode)

Esta documentación explica paso a paso la solución técnica aplicada para lograr una animación de fondo suave (60 FPS) y mejorar el rendimiento general en dispositivos modestos, eliminando el lag causado por repintados del navegador.

## 1. Implementación del Fondo Animado (GPU-First)

El problema original era que animar `background-position` fuerza al navegador a recalcular el diseño ("paint") en cada frame, lo que usa mucha CPU.

**Solución aplicada:** Usamos la técnica de **Composite-Only Animation**. En lugar de mover el fondo, movemos una capa entera usando `transform: translate3d`. Esto delega todo el trabajo a la GPU.

### Código clave en `client/src/styles/index.css`:

```css
/* Contenedor principal del modo */
.pokemon-mode-wrapper {
    width: 100%;
    min-height: 100vh;
    background-color: #f4f4f9;
    position: relative;
    overflow: hidden; /* Vital para que el 'padre' recorte al 'hijo' gigante */
    /* ... */
}

/* EL TRUCO: Pseudo-elemento gigante */
.pokemon-mode-wrapper::before {
    content: "";
    position: absolute;
    top: -50%;     /* Lo posicionamos con margen de sobra */
    left: -50%;
    width: 200%;   /* Mucho más grande que la pantalla */
    height: 200%;
    z-index: 0;    /* Al fondo */
    
    /* Patrón SVG optimizado (Data URI para evitar peticiones HTTP extra) */
    background-image: url("data:image/svg+xml,..."); 
    background-size: 120px 120px; /* Tamaño exacto del tile */
    
    /* ANIMACIÓN PURA DE GPU */
    /* Mover 120px en 2s = 60px/s (Velocidad constante) */
    animation: background-scroll 2s linear infinite;
    
    /* Pista al navegador para promover esto a una capa de GPU separada */
    will-change: transform;
    /* Forzar aceleración de hardware */
    transform: translate3d(0, 0, 0); 
}

/* Animación que solo altera la posición compuesta, NO el layout */
@keyframes background-scroll {
    0% {
        transform: translate3d(0, 0, 0);
    }
    100% {
        /* Movemos EXACTAMENTE el tamaño de un tile (120px) para crear el loop infinito invisible */
        transform: translate3d(120px, 120px, 0);
    }
}
```

### Uso en React (`App.jsx`):
Simplemente envolvemos el componente:

```jsx
// client/src/App.jsx
if (activeSection === 'pokemon_auction') {
  return (
    <div className="pokemon-mode-wrapper">
      <PokemonAuction onBack={() => setActiveSection('landing')} />
    </div>
  );
}
```

## 2. Mejoras Críticas de Rendimiento

Detectamos que ciertos efectos visuales estaban colapsando el hilo principal ("Main Thread") cuando había muchas actualizaciones de estado (subasta rápida).

### Cambios realizados en `client/src/pages/PokemonAuction.css`:

1.  **Eliminación de Blur en tiempo real:** El efecto `backdrop-filter: blur(...)` es extremadamente costoso porque obliga al navegador a leer los píxeles detrás del elemento frame por frame.

    ```css
    .game-board {
        /* ANTES: backdrop-filter: blur(10px); */
        /* AHORA: Se usa una opacidad sólida o un color semitransparente simple */
        background: rgba(15, 15, 20, 0.7); 
        /* 🔥 OPTIMIZACIÓN: Eliminado blur costoso */
    }
    ```

2.  **Simplificación de Sombras:** Las sombras complejas (box-shadow con radios de desenfoque grandes) también son costosas. Se redujo su complejidad y se usó `filter: drop-shadow` solo donde estrictamente necesario (en imágenes con transparencia).

    ```css
    .pokemon-card-circle {
        /* 🔥 Sombra más simple para evitar recalculos pesados */
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
    }
    ```

3.  **Fondos Transparentes en Contenedores Hijos:** Para que el patrón geométrico animado se viera a través de la UI, forzamos la transparencia en contenedores que antes tenían fondo negro sólido:

    ```css
    .auction-container, 
    .management-container {
        background: transparent; /* Deja ver el .pokemon-mode-wrapper::before */
    }
    ```

## Resumen para el Dev

*   **Fondo:** NO uses `background-position`. Usa un `div` o `::before` separado con `will-change: transform` y anima `translate3d`.
*   **Loop:** Asegúrate de que la distancia del translate coincida exactamente con el `background-size` de tu patrón.
*   **Blur:** Evita `backdrop-filter` en elementos grandes que cubren casi toda la pantalla si buscas 60fps estables.
