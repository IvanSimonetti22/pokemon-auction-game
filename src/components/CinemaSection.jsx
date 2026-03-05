import React, { useState, useEffect } from 'react';
import '../styles/Cinema.css';
import { movies, isThursday } from '../data/moviesData';

export const CinemaSection = ({ onBack }) => {
    // Estado inicial: Mes actual
    const [now, setNow] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [isTimeSynced, setIsTimeSynced] = useState(false);

    // Sincronizar con servidor de tiempo real (Argentina)
    useEffect(() => {
        const fetchRealTime = async () => {
            try {
                const response = await fetch('https://worldtimeapi.org/api/timezone/America/Argentina/Buenos_Aires');
                if (!response.ok) throw new Error("Fallback a local");
                const data = await response.json();
                setNow(new Date(data.datetime));
                setIsTimeSynced(true);
            } catch (error) {
                console.warn("No se pudo obtener la hora del servidor, usando hora local como respaldo.", error);
                setNow(new Date()); // Fallback
                setIsTimeSynced(true);
            }
        };

        fetchRealTime();
    }, []);

    const [secretClicks, setSecretClicks] = useState(0);
    const [secretlyUnlockedIds, setSecretlyUnlockedIds] = useState([]);

    // Actualizar reloj cada segundo
    useEffect(() => {
        if (!isTimeSynced) return;
        const interval = setInterval(() => {
            setNow(prev => new Date(prev.getTime() + 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [isTimeSynced]);

    // 🗓️ CALENDAR LOGIC HELPERS
    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        return (day + 6) % 7;
    };

    const handlePrevMonth = () => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
            if (newDate.getFullYear() === 2026 && newDate.getMonth() < 1) return prev;
            return newDate;
        });
    };

    const handleNextMonth = () => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const formatMonthYear = (date) => {
        return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    };

    // 🔍 FILTER MOVIES FOR CURRENT MONTH
    const currentMonthMovies = movies.filter(movie => {
        const movieDate = new Date(movie.date + 'T12:00:00');
        return movieDate.getMonth() === currentMonth.getMonth() &&
            movieDate.getFullYear() === currentMonth.getFullYear();
    });

    const startDayIndex = getFirstDayOfMonth(currentMonth);
    const emptySlots = Array(startDayIndex).fill(null);

    // 🔐 MOVIE STATUS LOGIC
    const getBaseMovieStatus = (movieToEval) => {
        if (secretlyUnlockedIds.includes(movieToEval.id)) return 'revealed';
        if (movieToEval.theme === 'redacted') return 'redacted';
        if (movieToEval.isMaintenance) return 'thursday_lock';
        if (movieToEval.isThemeStart) return 'revealed';

        const movieDate = new Date(movieToEval.date + 'T12:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const targetDate = new Date(movieDate);
        targetDate.setHours(0, 0, 0, 0);

        if (targetDate < today) return 'revealed';
        if (targetDate > today) return 'locked';

        const currentHour = now.getHours();
        if (currentHour >= 21) return 'revealed';

        return 'locked_today';
    };

    const getMovieStatus = (movie) => {
        const baseStatus = getBaseMovieStatus(movie);
        if (baseStatus === 'revealed') return 'revealed';

        if (movie.isSequel) {
            const movieIndex = movies.findIndex(m => m.id === movie.id);
            if (movieIndex > 0) {
                let prevMovie = null;
                for (let i = movieIndex - 1; i >= 0; i--) {
                    if (movies[i].theme !== 'system' && movies[i].theme !== 'redacted') {
                        prevMovie = movies[i];
                        break;
                    }
                }
                if (prevMovie && getMovieStatus(prevMovie) === 'revealed') {
                    return 'revealed';
                }
            }
        }
        return baseStatus;
    };

    const handleClockClick = () => {
        setSecretClicks(prev => {
            const next = prev + 1;
            if (next >= 5) {
                const nextLocked = movies.find(m => {
                    const status = getMovieStatus(m);
                    return (status === 'locked' || status === 'locked_today') && !secretlyUnlockedIds.includes(m.id);
                });
                if (nextLocked) {
                    setSecretlyUnlockedIds(curr => [...curr, nextLocked.id]);
                }
                return 0; // reset
            }
            return next;
        });
    };

    const getCountdown = () => {
        const nextLocked = movies.find(m => {
            const status = getMovieStatus(m);
            return status === 'locked' || status === 'locked_today';
        });

        if (!nextLocked) return "SISTEMA DESBLOQUEADO";

        const targetTime = new Date(nextLocked.date + 'T21:00:00');
        const diff = targetTime - now;

        if (diff <= 0) return "SISTEMA DESBLOQUEADO";

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        return `-${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

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

    const handleCardClick = (movie, status) => {
        if (status === 'revealed') {
            playClickSound();
            setSelectedMovie(movie);
        } else if (status === 'locked' || status === 'locked_today') {
            playErrorSound();
        } else if (status === 'thursday_lock') {
            playThursdaySound();
        } else if (status === 'redacted') {
            playRedactedSound();
        }
    };

    const handleCloseModal = () => {
        playCloseSound();
        setSelectedMovie(null);
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
                    <div className="current-month-display">{formatMonthYear(currentMonth)}</div>
                    <button
                        className="nav-btn"
                        onClick={() => { playNavSound(); handleNextMonth(); }}
                        disabled={currentMonth.getFullYear() === 2026 && currentMonth.getMonth() === 11}
                        style={{ opacity: (currentMonth.getFullYear() === 2026 && currentMonth.getMonth() === 11) ? 0.3 : 1 }}
                    >
                        &gt;
                    </button>
                </div>

                <div
                    className="cinema-clock"
                    onClick={handleClockClick}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    title="Time to next unlock"
                >
                    {getCountdown()}
                </div>
            </div>

            <div className="calendar-grid-wrapper">
                {/* WEEK HEADER */}
                <div className="week-header">
                    {['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'].map(day => (
                        <div key={day} className="day-name">{day}</div>
                    ))}
                </div>

                {/* CALENDAR GRID */}
                <div className="calendar-grid">
                    {/* Empty Slots (Padding) */}
                    {emptySlots.map((_, index) => (
                        <div key={`empty-${index}`} className="empty-slot"></div>
                    ))}

                    {/* Movie Days */}
                    {currentMonthMovies.map((movie, index) => {
                        const status = getMovieStatus(movie);
                        const isInteractive = status === 'revealed';

                        // Generic Theme Logic globally
                        const isSystemOrRedacted = movie.theme === 'system' || movie.theme === 'redacted';
                        const globalIndex = movies.findIndex(m => m.id === movie.id);

                        let prevTheme = null;
                        for (let i = globalIndex - 1; i >= 0; i--) {
                            const curTheme = movies[i].theme;
                            if (curTheme !== 'system' && curTheme !== 'redacted') {
                                prevTheme = curTheme;
                                break;
                            }
                        }

                        let nextTheme = null;
                        for (let i = globalIndex + 1; i < movies.length; i++) {
                            const curTheme = movies[i].theme;
                            if (curTheme !== 'system' && curTheme !== 'redacted') {
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
                            "prologue": "PRÓLOGO: SUEÑOS Y SAN VALENTÍN",
                            "cyberpunk": "SEMANA 1: CYBERPUNK",
                            "psychological": "SEMANA 2: DRAMA/PSICOLÓGICO",
                            "action": "SEMANA 3: ACCIÓN Y PELEAS",
                            "fantasy-east": "SEMANA 4: LEYENDAS DE ORIENTE",
                            "romance": "SEMANA 5: RETRATOS DE JUVENTUD",
                            "magic": "SEMANA 6: MAGIA Y DESTINO",
                            "cult": "SEMANA 7: REALISMO CRÍTICO",
                            "comedy": "SEMANA 8: RISAS Y MASCOTAS",
                            "scifi": "SEMANA 9: SCI-FI MODERNO",
                            "gems": "SEMANA 10: TESOROS OCULTOS",
                            "fantasy-modern": "SEMANA 10: FANTASÍA MODERNA",
                            "retro-future": "SEMANA 11: RETRO-FUTURISMO",
                            "action-glitch": "SEMANA 12: ADRENALINA Y ESTILO",
                            "classic-comedy": "SEMANA 13: CLASSIC VIBES",
                            "china-3d": "SEMANA 14: CHINA",
                            "vfx-art": "SEMANA 15: VFX & EXPERIMENTAL ART"
                        };

                        if (isInsideTheme && themeTitles[activeTheme]) {
                            themeClasses = `in-theme-week border-${activeTheme}`;
                            if (isGlobalFirstOfTheme || isMonday || isMonthStart) themeClasses += " theme-edge-left";
                            if (isGlobalLastOfTheme || isSunday || isMonthEnd) themeClasses += " theme-edge-right";
                        }

                        return (
                            <div
                                key={movie.id}
                                className={`movie-card theme-${movie.theme} ${themeClasses}`}
                                onClick={() => handleCardClick(movie, status)}
                                onMouseEnter={playHoverSound}
                                style={{
                                    cursor: isInteractive ? 'pointer' : 'default',
                                    opacity: status === 'locked' ? 0.7 : 1
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
                                    <div className="maintenance-overlay">
                                        <div className="maintenance-x">X</div>
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
                                        {/* Fallback si se reveló pero no tiene poster (raro con los datos actuales, pero seguro) */}
                                        {!movie.poster && (
                                            <div className="movie-poster-container">
                                                <div className="locked-overlay">
                                                    <div className="lock-msg">NO DATA</div>
                                                </div>
                                            </div>
                                        )}
                                        <div style={{ padding: '10px', background: '#000', zIndex: 2, position: 'relative' }}>
                                            <div style={{ fontSize: '0.8rem', color: '#fff' }}>{movie.title}</div>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* MODAL */}
            {selectedMovie && (
                <div className="cinema-modal-overlay" onClick={handleCloseModal}>
                    <div className="cinema-modal" onClick={(e) => e.stopPropagation()}>
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
