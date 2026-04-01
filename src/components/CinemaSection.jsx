import React, { useState, useEffect, useMemo, useCallback } from 'react';
import '../styles/Cinema.css';
import { movies, isThursday } from '../data/moviesData';

// ============================================================
// CINEMA CLOCK — componente separado para aislar el re-render
// cada segundo y no afectar el calendario completo.
// ============================================================
const CinemaClock = React.memo(({ onClockClick, isDevMode }) => {
    const [now, setNow] = useState(new Date());
    const [synced, setSynced] = useState(false);

    useEffect(() => {
        fetch('https://worldtimeapi.org/api/timezone/America/Argentina/Buenos_Aires')
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(d => { setNow(new Date(d.datetime)); setSynced(true); })
            .catch(() => { setNow(new Date()); setSynced(true); });
    }, []);

    useEffect(() => {
        if (!synced) return;
        const id = setInterval(() => setNow(p => new Date(p.getTime() + 1000)), 1000);
        return () => clearInterval(id);
    }, [synced]);

    const countdown = useMemo(() => {
        const nextLocked = movies.find(m => {
            if (m.theme === 'redacted' || m.isSkipped || m.isMaintenance) return false;
            const date = new Date(m.date + 'T00:00:00');
            const today = new Date(); today.setHours(0,0,0,0);
            date.setHours(0,0,0,0);
            if (date < today) return false;
            if (date > today) return true;
            return now.getHours() < 21;
        });
        if (!nextLocked) return 'SISTEMA ACTIVO';
        const diff = new Date(nextLocked.date + 'T21:00:00') - now;
        if (diff <= 0) return 'SISTEMA ACTIVO';
        const totalH = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        if (totalH >= 24) {
            const d = Math.floor(totalH / 24);
            return `${d}D ${String(totalH%24).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        }
        return `${String(totalH).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }, [now]);

    const isActive = countdown === 'SISTEMA ACTIVO';
    return (
        <div
            className={`cinema-clock${isActive ? ' active' : ''}`}
            onClick={onClockClick}
            style={{ cursor: isDevMode ? 'pointer' : 'default', userSelect: 'none' }}
            title={isDevMode ? 'Time to next unlock' : undefined}
        >
            {isActive && <span className="live-dot" title="EN VIVO" />}
            {countdown}
        </div>
    );
});

export const CinemaSection = ({ onBack }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [clickedCardRect, setClickedCardRect] = useState(null);
    const [isModalClosing, setIsModalClosing] = useState(false);
    const [hoveredTheme, setHoveredTheme] = useState(null);
    const [displayMonth, setDisplayMonth] = useState('');
    const [secretClicks, setSecretClicks] = useState(0);
    const [isAllUnlocked, setIsAllUnlocked] = useState(false);

    // 🗓️ CALENDAR LOGIC HELPERS
    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        return (day + 6) % 7;
    };

    const handlePrevMonth = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentMonth(prev => {
                const newDate = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
                if (newDate.getFullYear() === 2026 && newDate.getMonth() < 1) return prev;
                return newDate;
            });
            setIsTransitioning(false);
        }, 220);
    };

    const handleNextMonth = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
            setIsTransitioning(false);
        }, 220);
    };

    const formatMonthYear = (date) => {
        return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    };

    // Efecto scramble al cambiar de mes
    const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#%&';
    useEffect(() => {
        const target = formatMonthYear(currentMonth).toUpperCase();
        let iteration = 0;
        setDisplayMonth(target.split('').map(() => SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]).join(''));
        const interval = setInterval(() => {
            setDisplayMonth(
                target.split('').map((char, idx) => {
                    if (char === ' ') return ' ';
                    if (idx < iteration) return char;
                    return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
                }).join('')
            );
            iteration += 1.2;
            if (iteration >= target.length) {
                clearInterval(interval);
                setDisplayMonth(target);
            }
        }, 50); // 50ms — menos renders, igual de fluido
        return () => clearInterval(interval);
    }, [currentMonth]);

    // 🔍 FILTER MOVIES FOR CURRENT MONTH
    const currentMonthMovies = movies.filter(movie => {
        const movieDate = new Date(movie.date + 'T12:00:00');
        return movieDate.getMonth() === currentMonth.getMonth() &&
            movieDate.getFullYear() === currentMonth.getFullYear();
    });

    const startDayIndex = getFirstDayOfMonth(currentMonth);
    const emptySlots = Array(startDayIndex).fill(null);

    const getMovieStatus = useCallback((movie) => {
        if (import.meta.env.DEV && isAllUnlocked) return 'revealed';
        if (movie.theme === 'redacted') return 'redacted';
        if (movie.isSkipped) return 'thursday_lock';
        if (movie.isMaintenance) return 'thursday_lock';
        if (movie.isThemeStart) return 'revealed';

        const movieDate = new Date(movie.date + 'T12:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const targetDate = new Date(movieDate);
        targetDate.setHours(0, 0, 0, 0);

        if (targetDate < today) return 'revealed';
        if (targetDate > today) return 'locked';

        if (movie.isSequel) {
            const movieIndex = movies.findIndex(m => m.id === movie.id);
            if (movieIndex > 0) {
                for (let i = movieIndex - 1; i >= 0; i--) {
                    const prev = movies[i];
                    if (prev.theme !== 'system' && prev.theme !== 'redacted' && prev.theme !== 'skipped') {
                        const prevDate = new Date(prev.date + 'T00:00:00');
                        prevDate.setHours(0,0,0,0);
                        if (prevDate < today) return 'revealed';
                        break;
                    }
                }
            }
        }

        const localNow = new Date();
        if (localNow.getHours() >= 21) return 'revealed';
        return 'locked_today';
    }, [isAllUnlocked]);

    const handleClockClick = useCallback(() => {
        if (!import.meta.env.DEV) return;
        setSecretClicks(prev => {
            const next = prev + 1;
            if (next >= 5) { setIsAllUnlocked(true); return 0; }
            return next;
        });
    }, []);

    // 🎵 SOUND LOGIC (LOCAL OFFLINE SOUNDS - CYBERPUNK EDITION)

    const playNavSound = () => {
        const audio = new Audio("/sounds/nav.wav");
        audio.volume = 0.5;
        audio.play().catch(e => console.log("Audio play failed:", e));
    };

    const playHoverSound = () => {
        const audio = new Audio("/sounds/hover.wav");
        audio.volume = 0.5;
        audio.play().catch(e => console.log("Audio play failed:", e));
    };

    const playClickSound = () => {
        const audio = new Audio("/sounds/reveal.wav");
        audio.volume = 0.8;
        audio.play().catch(e => console.log("Audio play failed:", e));
    };

    const playErrorSound = () => {
        const errorAudio = new Audio("/sounds/error.wav");
        errorAudio.volume = 0.6;
        errorAudio.play().catch(e => console.log("Audio play failed:", e));
    };

    const playThursdaySound = () => {
        const mechAudio = new Audio("/sounds/mech.wav");
        mechAudio.volume = 0.7;
        mechAudio.play().catch(e => console.log("Audio play failed:", e));
    };

    const playRedactedSound = () => {
        const glitchAudio = new Audio("/sounds/glitch.wav");
        glitchAudio.volume = 0.25;
        glitchAudio.play().catch(e => console.log("Audio play failed:", e));
    };

    const playCloseSound = () => {
        const closeAudio = new Audio("/sounds/close.wav");
        closeAudio.volume = 0.7;
        closeAudio.play().catch(e => console.log("Audio play failed:", e));
    };

    const handleCardClick = useCallback((movie, status, event) => {
        if (status === 'revealed') {
            playClickSound();
            if (event?.currentTarget) {
                const rect = event.currentTarget.getBoundingClientRect();
                const modalW = Math.min(window.innerWidth * 0.9, 800);
                const modalH = window.innerHeight * 0.85;
                const cardCX = rect.left + rect.width / 2;
                const cardCY = rect.top + rect.height / 2;
                const vpCX = window.innerWidth / 2;
                const vpCY = window.innerHeight / 2;
                setClickedCardRect({
                    dx: `${(cardCX - vpCX).toFixed(1)}px`,
                    dy: `${(cardCY - vpCY).toFixed(1)}px`,
                    sx: (rect.width / modalW).toFixed(4),
                    sy: (rect.height / modalH).toFixed(4),
                });
            }
            setSelectedMovie(movie);
            setIsModalClosing(false);
        } else if (status === 'locked' || status === 'locked_today') {
            playErrorSound();
        } else if (status === 'thursday_lock') {
            playThursdaySound();
        } else if (status === 'redacted') {
            playRedactedSound();
        }
    }, [isAllUnlocked]);

    const handleCloseModal = () => {
        playCloseSound();
        setIsModalClosing(true);
        setTimeout(() => {
            setSelectedMovie(null);
            setIsModalClosing(false);
            setClickedCardRect(null);
        }, 380);
    };

    // Mapa de colores por tema para el ambiente de fondo
    const themeAmbientColors = {
        prologue: '0, 191, 255', cyberpunk: '255, 0, 255', psychological: '255, 20, 147',
        action: '255, 69, 0', 'fantasy-east': '0, 250, 154', romance: '255, 182, 193',
        magic: '255, 215, 0', cult: '139, 0, 0', comedy: '255, 165, 0',
        scifi: '0, 255, 255', gems: '147, 112, 219', 'fantasy-modern': '255, 209, 220',
        'retro-future': '222, 184, 135', 'action-glitch': '220, 20, 60',
        'classic-comedy': '255, 105, 180', 'china-3d': '0, 255, 127', 'vfx-art': '138, 43, 226',
    };


    return (
        <div className="cinema-wrapper">
            {/* AMBIENT BACKGROUND EFFECTS */}
            <div className="cinema-background-strips">
                <div className="film-strip strip-1"></div>
                <div className="film-strip strip-2"></div>
                <div className="film-strip strip-3"></div>
                <div className="film-strip strip-4"></div>
                <div className="film-strip strip-5"></div>
                <div className="film-strip strip-6"></div>
                <div className="film-strip strip-7"></div>
                <div className="film-strip strip-8"></div>
            </div>

            {/* AMBIENT THEME COLOR */}
            <div
                className="theme-ambient-glow"
                style={hoveredTheme && themeAmbientColors[hoveredTheme] ? {
                    background: `radial-gradient(ellipse 70% 60% at 50% 50%, rgba(${themeAmbientColors[hoveredTheme]}, 0.08) 0%, transparent 70%)`,
                    opacity: 1,
                } : { opacity: 0 }}
            />

            <div className="cinema-scanlines"></div>
            <div className="cinema-vignette"></div>

            {/* HEADER */}
            <div className="cinema-header">
                <button className="mc-back-btn" onClick={() => { playNavSound(); onBack(); }}>← SALIR</button>

                <div className="header-controls">
                    <button
                        className="nav-btn"
                        onClick={() => { playNavSound(); handlePrevMonth(); }}
                        disabled={currentMonth.getFullYear() === 2026 && currentMonth.getMonth() === 1}
                        style={{ opacity: (currentMonth.getFullYear() === 2026 && currentMonth.getMonth() === 1) ? 0.3 : 1 }}
                    >
                        &lt;
                    </button>
                    <div className="current-month-display">{displayMonth}</div>
                    <button
                        className="nav-btn"
                        onClick={() => { playNavSound(); handleNextMonth(); }}
                        disabled={currentMonth.getFullYear() === 2026 && currentMonth.getMonth() === 11}
                        style={{ opacity: (currentMonth.getFullYear() === 2026 && currentMonth.getMonth() === 11) ? 0.3 : 1 }}
                    >
                        &gt;
                    </button>
                </div>

                <CinemaClock
                    onClockClick={handleClockClick}
                    isDevMode={!!import.meta.env.DEV}
                />
            </div>

            <div className="calendar-grid-wrapper">
                {/* WEEK HEADER */}
                <div className="week-header">
                    {['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'].map(day => (
                        <div key={day} className="day-name">{day}</div>
                    ))}
                </div>

                {/* CALENDAR GRID */}
                <div className={`calendar-grid${isTransitioning ? ' grid-fading' : ''}`}>
                    {/* Empty Slots (Padding) */}
                    {emptySlots.map((_, index) => (
                        <div key={`empty-${index}`} className="empty-slot"></div>
                    ))}

                    {/* Movie Days */}
                    {currentMonthMovies.map((movie, index) => {
                        const status = getMovieStatus(movie);
                        const isInteractive = status === 'revealed';

                        // Is today? (use local date for precision)
                        const movieDateObj2 = new Date(movie.date + 'T12:00:00');
                        const localToday = new Date();
                        const isToday =
                            movieDateObj2.getFullYear() === localToday.getFullYear() &&
                            movieDateObj2.getMonth() === localToday.getMonth() &&
                            movieDateObj2.getDate() === localToday.getDate();

                        // Generic Theme Logic globally
                        const isSystemOrRedacted = movie.theme === 'system' || movie.theme === 'redacted' || movie.theme === 'skipped';
                        const globalIndex = movies.findIndex(m => m.id === movie.id);

                        let prevTheme = null;
                        for (let i = globalIndex - 1; i >= 0; i--) {
                            const curTheme = movies[i].theme;
                            if (curTheme !== 'system' && curTheme !== 'redacted' && curTheme !== 'skipped') {
                                prevTheme = curTheme;
                                break;
                            }
                        }

                        let nextTheme = null;
                        for (let i = globalIndex + 1; i < movies.length; i++) {
                            const curTheme = movies[i].theme;
                            if (curTheme !== 'system' && curTheme !== 'redacted' && curTheme !== 'skipped') {
                                nextTheme = curTheme;
                                break;
                            }
                        }

                        let activeTheme = movie.theme;
                        let isInsideTheme = !isSystemOrRedacted;
                        let isGlobalFirstOfTheme = false;
                        let isGlobalLastOfTheme = false;

                        if (isSystemOrRedacted) {
                            if (prevTheme && nextTheme && prevTheme === nextTheme) {
                                activeTheme = prevTheme;
                                isInsideTheme = true;
                            }
                        } else {
                            isGlobalFirstOfTheme = prevTheme !== movie.theme;
                            isGlobalLastOfTheme = nextTheme !== movie.theme;
                        }

                        // Local edges (cut borders at the edge of the current month grid)
                        const isMonthStart = index === 0;
                        const isMonthEnd = index === currentMonthMovies.length - 1;

                        const movieDateObj = new Date(movie.date + 'T12:00:00');
                        const isMonday = movieDateObj.getDay() === 1;
                        const isSunday = movieDateObj.getDay() === 0;

                        let themeClasses = "";
                        const themeTitles = {
                            "prologue": "SUEÑOS Y SAN VALENTÍN",
                            "cyberpunk": "CYBERPUNK",
                            "psychological": "DRAMA/PSICOLÓGICO",
                            "action": "ACCIÓN Y PELEAS",
                            "fantasy-east": "LEYENDAS DE ORIENTE",
                            "romance": "RETRATOS DE JUVENTUD",
                            "magic": "MAGIA Y DESTINO",
                            "cult": "REALISMO CRÍTICO",
                            "comedy": "RISAS Y MASCOTAS",
                            "scifi": "SCI-FI MODERNO",
                            "gems": "TESOROS OCULTOS",
                            "fantasy-modern": "FANTASÍA MODERNA",
                            "retro-future": "RETRO-FUTURISMO",
                            "action-glitch": "ADRENALINA Y ESTILO",
                            "classic-comedy": "CLASSIC VIBES",
                            "china-3d": "CHINA",
                            "vfx-art": "VFX EXPERIMENTAL"
                        };

                        if (isInsideTheme && themeTitles[activeTheme]) {
                            themeClasses = `in-theme-week border-${activeTheme}`;
                            if (isGlobalFirstOfTheme || isMonday || isMonthStart) themeClasses += " theme-edge-left";
                            if (isGlobalLastOfTheme || isSunday || isMonthEnd) themeClasses += " theme-edge-right";
                        }

                        return (
                            <div
                                key={movie.id}
                                className={`movie-card theme-${movie.theme} ${themeClasses}${isToday ? ' is-today' : ''}`}
                                onClick={(e) => handleCardClick(movie, status, e)}
                                onMouseEnter={() => {
                                    playHoverSound();
                                    if (movie.theme && movie.theme !== 'system' && movie.theme !== 'skipped') {
                                        setHoveredTheme(movie.theme);
                                    }
                                }}
                                onMouseLeave={() => setHoveredTheme(null)}
                                style={{
                                    cursor: isInteractive ? 'pointer' : 'default',
                                    opacity: status === 'locked' ? 0.7 : 1,
                                    '--fade-delay': `${Math.min(index * 0.025, 0.6)}s`,
                                    '--shimmer-delay': `${(index * 1.3) % 7}s`,
                                }}
                            >
                                {isGlobalFirstOfTheme && !isSystemOrRedacted && themeTitles[activeTheme] && (
                                    <div className={`theme-week-badge badge-${activeTheme}`}>
                                        {themeTitles[activeTheme]}
                                    </div>
                                )}
                                <div className="calendar-day-number">{movie.dayNumber}</div>

                                {movie.isOptional && (
                                    <div className="optional-badge" style={{ position: 'absolute', top: '5px', left: '5px', backgroundColor: '#ffae00', color: '#000', padding: '2px 6px', fontSize: '0.65rem', fontWeight: 'bold', zIndex: 5, borderRadius: '3px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        Opcional
                                    </div>
                                )}

                                {/* MOVIE POSTER (Visible if it has one and is NOT redacted/maintenance/locked) */}
                                {movie.poster && status !== 'redacted' && status !== 'thursday_lock' && status !== 'locked' && status !== 'locked_today' && (
                                    <div className="movie-poster-container">
                                        <img src={movie.poster} alt={movie.title} className="movie-poster" />
                                    </div>
                                )}

                                {/* 1. THURSDAY LOCK */}
                                {status === 'thursday_lock' && (
                                    <div className={`maintenance-overlay${movie.isSkipped ? ' skipped-overlay' : ''}`}>
                                        <div className={`maintenance-x${movie.isSkipped ? ' skipped-x' : ''}`}>X</div>
                                    </div>
                                )}

                                {/* 1.5 REDACTED / EMPTY */}
                                {status === 'redacted' && (
                                    <div className="redacted-slot-overlay">
                                        <div className="redacted-text">[ DATOS BORRADOS ]</div>
                                    </div>
                                )}

                                {/* 2. LOCKED */}
                                {(status === 'locked' || status === 'locked_today') && (
                                    <div className="locked-overlay">
                                        <div className="no-signal"></div>
                                        <div className="lock-msg">
                                            {status === 'locked' ? 'RECIBIENDO DATOS' : 'SE DESBLOQUEA PRONTO'}
                                        </div>
                                        {status === 'locked_today' && (
                                            <div style={{ color: 'var(--zzz-orange)', fontWeight: 'bold' }}>21:00 HS</div>
                                        )}
                                    </div>
                                )}

                                {/* 3. REVEALED */}
                                {status === 'revealed' && (
                                    <>
                                        {!movie.poster && (
                                            <div className="movie-poster-container">
                                                <div className="locked-overlay">
                                                    <div className="lock-msg">NO DATA</div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="revealed-title-bar">
                                            {movie.title}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* MODAL */}
            {(selectedMovie || isModalClosing) && (
                <div
                    className={`cinema-modal-overlay${isModalClosing ? ' closing' : ''}`}
                    onClick={handleCloseModal}
                >
                    <div
                        className={`cinema-modal${isModalClosing ? ' closing' : ''}`}
                        onClick={(e) => e.stopPropagation()}
                        style={clickedCardRect ? {
                            '--modal-dx': clickedCardRect.dx,
                            '--modal-dy': clickedCardRect.dy,
                            '--modal-sx': clickedCardRect.sx,
                            '--modal-sy': clickedCardRect.sy,
                        } : {}}
                    >
                        <button className="modal-close" onClick={handleCloseModal}>X</button>

                        <div className="modal-poster-wrapper">
                            <img src={selectedMovie.poster} alt={selectedMovie.title} className="modal-poster" />
                        </div>

                        <div className="modal-content">
                            <div className="modal-vibes">
                                {selectedMovie.vibes.map((v, i) => <span key={i} style={{ marginRight: '10px' }}>{v}</span>)}
                            </div>
                            <h2 className="modal-title">{selectedMovie.title}</h2>
                            <div className="modal-meta-info" style={{ display: 'flex', gap: '15px', marginBottom: '15px', fontSize: '0.9rem', color: 'var(--cyber-blue, #0df)' }}>
                                <span>⏱️ {(() => {
                                    if (!selectedMovie.duration) return '-- min';
                                    const m = parseInt(selectedMovie.duration);
                                    if (isNaN(m)) return selectedMovie.duration;
                                    if (m < 60) return `${m} min`;
                                    const h = Math.floor(m / 60);
                                    const rm = m % 60;
                                    return rm > 0 ? `${h}h ${rm}m` : `${h}h`;
                                })()}</span>
                                <span>📅 {selectedMovie.year || '----'}</span>
                                {selectedMovie.genres && <span>🎬 {selectedMovie.genres}</span>}
                            </div>
                            <p className="modal-desc">{selectedMovie.description}</p>

                            <div className="tech-spec-box">
                                TECH SPEC: {selectedMovie.techSpec}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
