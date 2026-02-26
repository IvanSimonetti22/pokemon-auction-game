import React, { useState, useEffect } from 'react';
import '../App.css';
const ZZZCalculator = () => {
    // --- STATE DE CARGA (INTRO ANIMATION) ---
    const [isLoading, setIsLoading] = useState(true);
    const [showContent, setShowContent] = useState(false);
    useEffect(() => {
        // Secuencia de intro: 2.5s de carga -> mostrar contenido
        const timer = setTimeout(() => {
            setIsLoading(false);
            setTimeout(() => setShowContent(true), 100); // Breve delay para la transición
        }, 2500);
        return () => clearTimeout(timer);
    }, []);
    // --- CONSTANTES DE INGRESOS (Estimados Mensuales) ---
    const INCOME_F2P = 7500;
    const INCOME_MONTHLY_PASS = 3000; // Membresía Inter-nudo
    const INCOME_BATTLE_PASS = 1800;  // Fondo Eridu (Cintas + Polis convertidos)
    const INITIAL_STATE = {
        polychromes: 0,
        tapes: 0,
        signals: 0, // NUEVO: Señales Residuales
        currentCinema: 0,
        targetCinema: 1,
        currentEngine: 0,
        targetEngine: 1,
        pityCharRemaining: 90,
        guaranteedChar: false,
        pityEngineRemaining: 80,
        guaranteedEngine: false,
        hasPass: false,      // Membresía Inter-nudo
        hasBattlePass: false // NUEVO: Pase de Batalla
    };
    // Cargar estado inicial desde LocalStorage si existe
    const [inputs, setInputs] = useState(() => {
        const saved = localStorage.getItem('zzz-calc-v1');
        return saved ? JSON.parse(saved) : INITIAL_STATE;
    });
    const [results, setResults] = useState(null);
    const [potential, setPotential] = useState(null);
    // Guardar en LocalStorage cada vez que inputs cambie
    useEffect(() => {
        localStorage.setItem('zzz-calc-v1', JSON.stringify(inputs));
    }, [inputs]);
    const formatNumber = (num) => new Intl.NumberFormat('es-AR').format(num);
    // Función para formatear fechas (ej: 24 de Octubre)
    const formatDate = (days) => {
        if (days <= 0) return "HOY";
        const date = new Date();
        date.setDate(date.getDate() + days);
        return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
    };
    const handleClamp = (e, min, max) => {
        let val = parseInt(e.target.value);
        if (isNaN(val)) val = 0;
        if (val > max) val = max;
        if (val < min) val = min;
        setInputs({ ...inputs, [e.target.name]: val });
    };
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked : parseInt(value) || 0;
        setInputs(prev => ({ ...prev, [name]: finalValue }));
    };
    const handleReset = () => {
        if (window.confirm("¿Borrar todos los datos y reiniciar?")) {
            setInputs(INITIAL_STATE);
            setResults(null);
            setPotential(null);
            localStorage.removeItem('zzz-calc-v1');
        }
    };
    // --- LÓGICA DE SIMULACIÓN DE COSTO ---
    const simulateCost = (targetC, targetE, mode) => {
        const PITY_CHAR = mode === 'lucky' ? 76 : mode === 'average' ? 80 : 90;
        const PITY_WEAPON = mode === 'lucky' ? 66 : mode === 'average' ? 70 : 80;
        // AGENTE
        let costChar = 0;
        let neededChar = Math.max(0, targetC - inputs.currentCinema);
        let tempRemaining = inputs.pityCharRemaining;
        let tempGuaranteed = inputs.guaranteedChar;
        for (let i = 0; i < neededChar; i++) {
            let currentPityCost = (i === 0) ? Math.min(tempRemaining, PITY_CHAR) : PITY_CHAR;
            let pulls = 0;
            if (tempGuaranteed) {
                pulls = currentPityCost;
                tempGuaranteed = false;
            } else {
                if (mode === 'lucky') pulls = currentPityCost;
                else if (mode === 'average') pulls = Math.floor(currentPityCost * 1.5);
                else pulls = currentPityCost + 90;
                tempGuaranteed = false;
            }
            costChar += pulls;
        }
        // MOTOR
        let costEngine = 0;
        let neededEngine = Math.max(0, targetE - inputs.currentEngine);
        let tempRemainingW = inputs.pityEngineRemaining;
        let tempGuaranteedW = inputs.guaranteedEngine;
        for (let i = 0; i < neededEngine; i++) {
            let currentPityCost = (i === 0) ? Math.min(tempRemainingW, PITY_WEAPON) : PITY_WEAPON;
            if (tempGuaranteedW) {
                costEngine += currentPityCost;
                tempGuaranteedW = false;
            } else {
                if (mode === 'lucky') costEngine += currentPityCost;
                else if (mode === 'average') costEngine += Math.floor(currentPityCost * 1.25);
                else costEngine += currentPityCost + 80;
                tempGuaranteedW = false;
            }
        }
        return Math.ceil((costChar + costEngine) * 0.9); // Cashback 10%
    };
    // --- CÁLCULO PRINCIPAL ---
    const calculate = () => {
        const lucky = simulateCost(inputs.targetCinema, inputs.targetEngine, 'lucky');
        const average = simulateCost(inputs.targetCinema, inputs.targetEngine, 'average');
        const worst = simulateCost(inputs.targetCinema, inputs.targetEngine, 'worst');
        // NUEVO: Sumar conversión de Señales (20 señales = 1 Cinta)
        const extraPullsFromSignals = Math.floor(inputs.signals / 20);
        const totalOwned = Math.floor(inputs.tapes + (inputs.polychromes / 160) + extraPullsFromSignals);
        setResults({
            lucky: { cost: lucky },
            average: { cost: average },
            worst: { cost: worst },
            owned: totalOwned,
            extraFromSignals: extraPullsFromSignals // Para mostrarlo en la UI
        });
        calculatePotentialReach(totalOwned);
    };
    const calculatePotentialReach = (ownedPulls) => {
        let maxAgent = inputs.currentCinema;
        for (let m = inputs.currentCinema + 1; m <= 7; m++) {
            if (simulateCost(m, inputs.currentEngine, 'average') <= ownedPulls) maxAgent = m;
            else break;
        }
        let maxEngine = inputs.currentEngine;
        for (let r = inputs.currentEngine + 1; r <= 5; r++) {
            if (simulateCost(inputs.currentCinema, r, 'average') <= ownedPulls) maxEngine = r;
            else break;
        }
        setPotential({ agentReach: maxAgent, engineReach: maxEngine });
    };
    // --- RENDERS AUXILIARES ---
    const renderAgentOptions = (isTarget) => (
        <>
            <option value={0}>{isTarget ? "❌ Saltar (No buscar)" : "❌ No lo tengo"}</option>
            <option value={1}>M0 (Base)</option>
            <option value={2}>M1 (Cine 1)</option>
            <option value={3}>M2 (Cine 2)</option>
            <option value={4}>M3 (Cine 3)</option>
            <option value={5}>M4 (Cine 4)</option>
            <option value={6}>M5 (Cine 5)</option>
            <option value={7}>M6 (MAX)</option>
        </>
    );
    const renderEngineOptions = (isTarget) => (
        <>
            <option value={0}>{isTarget ? "❌ Saltar (No buscar)" : "❌ No lo tengo"}</option>
            <option value={1}>R1 (Base)</option>
            <option value={2}>R2</option>
            <option value={3}>R3</option>
            <option value={4}>R4</option>
            <option value={5}>R5 (MAX)</option>
        </>
    );
    const getRankName = (val, type) => {
        if (val === 0) return "Nada";
        if (type === 'agent') return val === 1 ? "M0" : `M${val - 1}`;
        if (type === 'engine') return `R${val}`;
    };
    const getVerdict = (type, needed, owned) => {
        const diff = owned - needed;
        if (diff >= 0) {
            if (type === 'worst') return "🛡️ 100% GARANTIZADO. Te alcanza aunque pierdas todo.";
            if (type === 'average') return "✅ MUY SEGURO. Te alcanza incluso perdiendo algún 50/50.";
            if (type === 'lucky') return "⚠️ POSIBLE. Te alcanza si ganas los 50/50.";
        }
        if (type === 'lucky') return "❌ IMPOSIBLE HOY. Necesitas un milagro.";
        if (type === 'average') return "🎲 RIESGOSO. Necesitas ganar todos los 50/50.";
        if (type === 'worst') return "☠️ NO GARANTIZADO. Si pierdes el 50/50, no llegas.";
        return "";
    };
    // --- RESULT CARD ---
    const ResultCard = ({ title, data, icon, type }) => {
        const needed = data.cost;
        const deficitPulls = Math.max(0, needed - results.owned);
        const deficitPoly = deficitPulls * 160;
        const isSafe = results.owned >= needed;
        // Cálculo de Ingresos Totales
        const monthlyIncome = INCOME_F2P
            + (inputs.hasPass ? INCOME_MONTHLY_PASS : 0)
            + (inputs.hasBattlePass ? INCOME_BATTLE_PASS : 0);
        const monthsToFarm = deficitPoly / monthlyIncome;
        const daysToFarm = Math.ceil(monthsToFarm * 30);
        const targetDate = formatDate(daysToFarm);
        const verdictText = getVerdict(type, needed, results.owned);
        return (
            <div className={`result-scenario ${type}`}>
                <div className="scenario-header">
                    <span className="sc-icon">{icon}</span>
                    <h4>{title}</h4>
                </div>
                <div className="scenario-body">
                    <div className="row-stat main">
                        <span>Costo:</span>
                        <strong>{needed} Tiradas</strong>
                    </div>
                    <div className={`verdict-box ${isSafe ? 'v-safe' : 'v-risk'}`}>
                        {verdictText}
                    </div>
                    <div className="divider"></div>
                    {!isSafe ? (
                        <div className="status-missing">
                            <div className="missing-row">
                                <span>Faltan:</span>
                                <strong>{deficitPulls} Cintas</strong>
                            </div>
                            {/* FECHA ESTIMADA CON DISCLAIMER */}
                            <div className="date-est-box">
                                <small className="date-label">📅 Meta estimada para el:</small>
                                <div className="target-date">{targetDate}</div>
                                <small className="sub-date">({monthsToFarm.toFixed(1)} Meses)</small>
                                <div className="date-disclaimer">
                                    ⚠️ Fecha aproximada basada en ingresos fijos. <br />
                                    Úsala para calcular si llegas al banner actual o futuro.
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="status-ok">
                            <small>¡Te sobran {results.owned - needed} tiradas!</small>
                        </div>
                    )}
                </div>
            </div>
        );
    };
    // --- RENDER ---
    return (
        <div className="zzz-calculator-container animate-in">
            <div className="header-decoration">
                <div className="deco-line"></div>
                <h2>CALCULADORA DE TIRADAS PROXY</h2>
            </div>
            {/* INPUTS */}
            <div className="calc-grid">
                <div className="calc-section">
                    <h3>🎒 Tus Ahorros</h3>
                    <label>Policromos: <input type="number" name="polychromes" value={inputs.polychromes} onChange={(e) => handleClamp(e, 0, 999999)} /></label>
                    <label>Cintas (Pulls): <input type="number" name="tapes" value={inputs.tapes} onChange={(e) => handleClamp(e, 0, 1000)} /></label>
                    {/* NUEVO INPUT: SEÑALES */}
                    <label className="input-extra">
                        Señales Residuales:
                        <input type="number" name="signals" value={inputs.signals} onChange={(e) => handleClamp(e, 0, 9999)} placeholder="Tienda" />
                        <small className="helper-text">Se convierten automáticamente (20 = 1 Cinta)</small>
                    </label>
                    <div className="toggles-wrapper">
                        <label className="pass-toggle-label">
                            <input type="checkbox" name="hasPass" checked={inputs.hasPass} onChange={handleChange} />
                            <span className="toggle-slider"></span>
                            <span className="toggle-text">💳 Membresía</span>
                        </label>
                        {/* NUEVO TOGGLE: PASE DE BATALLA */}
                        <label className="pass-toggle-label">
                            <input type="checkbox" name="hasBattlePass" checked={inputs.hasBattlePass} onChange={handleChange} />
                            <span className="toggle-slider battle-pass"></span>
                            <span className="toggle-text">⚔️ Pase Batalla</span>
                        </label>
                    </div>
                </div>
                <div className="calc-section">
                    <h3>👤 Agente (Rank S)</h3>
                    <label>Estado Actual: <select name="currentCinema" value={inputs.currentCinema} onChange={handleChange} className="tech-select">{renderAgentOptions(false)}</select></label>
                    <label>Meta Deseada: <select name="targetCinema" value={inputs.targetCinema} onChange={handleChange} className="tech-select">{renderAgentOptions(true)}</select></label>
                    <label className="highlight-input">Faltan para S: <input type="number" name="pityCharRemaining" value={inputs.pityCharRemaining} onChange={(e) => handleClamp(e, 1, 90)} /></label>
                    <label className="checkbox-label"><input type="checkbox" name="guaranteedChar" checked={inputs.guaranteedChar} onChange={handleChange} /> ¿Garantizado?</label>
                </div>
                <div className="calc-section">
                    <h3>⚙️ Motor-W (Arma)</h3>
                    <label>Estado Actual: <select name="currentEngine" value={inputs.currentEngine} onChange={handleChange} className="tech-select">{renderEngineOptions(false)}</select></label>
                    <label>Meta Deseada: <select name="targetEngine" value={inputs.targetEngine} onChange={handleChange} className="tech-select">{renderEngineOptions(true)}</select></label>
                    <label className="highlight-input">Faltan para S: <input type="number" name="pityEngineRemaining" value={inputs.pityEngineRemaining} onChange={(e) => handleClamp(e, 1, 80)} /></label>
                    <label className="checkbox-label"><input type="checkbox" name="guaranteedEngine" checked={inputs.guaranteedEngine} onChange={handleChange} /> ¿Garantizado?</label>
                </div>
            </div>
            <div className="button-group">
                <button className="calc-btn reset" onClick={handleReset}>🗑️ RESET</button>
                <button className="calc-btn primary" onClick={calculate}>CALCULAR</button>
            </div>
            {results && (
                <div className="results-panel">
                    <div className="potential-box">
                        <h4>🔮 ¿Para qué me alcanza HOY? (Suerte Promedio)</h4>
                        {(() => {
                            const canUpgradeAgent = potential.agentReach > inputs.currentCinema;
                            const canUpgradeEngine = potential.engineReach > inputs.currentEngine;
                            const hasUpgrade = canUpgradeAgent || canUpgradeEngine;
                            return hasUpgrade ? (
                                <p>
                                    Con tus <strong>{results.owned}</strong> tiradas
                                    {results.extraFromSignals > 0 && <small> (incluye +{results.extraFromSignals} de tienda)</small>}: <br />
                                    {canUpgradeAgent && <span className="highlight-reach">👤 Agente {getRankName(potential.agentReach, 'agent')}</span>}
                                    {canUpgradeAgent && canUpgradeEngine && " ó "}
                                    {canUpgradeEngine && <span className="highlight-reach">⚙️ Motor {getRankName(potential.engineReach, 'engine')}</span>}
                                </p>
                            ) : (
                                <p>
                                    Con tus <strong>{results.owned}</strong> tiradas: <br />
                                    <span className="highlight-reach risk">❌ Aún no te alcanza para asegurar el siguiente rango.</span>
                                </p>
                            );
                        })()}
                    </div>
                    <h3 className="results-title">📊 Probabilidades para tu Meta</h3>
                    <div className="scenarios-grid">
                        <ResultCard title="CON SUERTE" data={results.lucky} icon="🍀" type="lucky" />
                        <ResultCard title="PROMEDIO" data={results.average} icon="⚖️" type="average" />
                        <ResultCard title="PEOR CASO" data={results.worst} icon="💀" type="worst" />
                    </div>
                    <p className="disclaimer-large">
                        Ingresos estimados con tu configuración: {formatNumber(INCOME_F2P + (inputs.hasPass ? INCOME_MONTHLY_PASS : 0) + (inputs.hasBattlePass ? INCOME_BATTLE_PASS : 0))} pol/mes.
                    </p>
                </div>
            )}
        </div>
    );
};
export default ZZZCalculator;
