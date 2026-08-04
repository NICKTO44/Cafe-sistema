const POINTS_REQUIRED = 30;

export default function CoffeeCupProgress({ points }) {
    // La taza se llena hasta 30 puntos y se queda LLENA con cualquier cantidad igual
    // o mayor (39, 45, 100...) — solo vuelve a ser parcial despues de canjear de verdad.
    const isFull = points >= POINTS_REQUIRED;
    const displayPoints = Math.min(points, POINTS_REQUIRED);
    const fillPercent = displayPoints / POINTS_REQUIRED;

    // Área interior de la taza: de y=118 (borde) a y=192 (fondo)
    const topY = 118;
    const bottomY = 192;
    const liquidHeight = (bottomY - topY) * fillPercent;
    const liquidY = bottomY - liquidHeight;

    // Líneas de rayado cruzado sobre la superficie del café (estilo boceto a tinta)
    const hatchLines = [];
    if (fillPercent > 0.08) {
        const count = 6;
        for (let i = 0; i < count; i++) {
            const x = 92 + i * 22;
            hatchLines.push(
                <line key={i} x1={x} y1={liquidY + 4} x2={x + 10} y2={liquidY + 12} className="cup-hatch-line" />
            );
        }
    }

    return (
        <div className={`coffee-cup-progress ${isFull ? 'full' : ''}`}>
            <svg viewBox="0 0 300 250" className="coffee-cup-svg">
                <defs>
                    <clipPath id="cupInterior">
                        <path d="M80,116 L220,116 L214,178 C210,190 197,197 182,197 L118,197 C103,197 90,190 86,178 Z" />
                    </clipPath>
                </defs>

                {/* Listón de vapor único, tipo cinta ondulada */}
                <path
                    className="cup-steam-ribbon"
                    style={{ opacity: 0.35 + fillPercent * 0.5 }}
                    d="M148,100 C136,82 172,70 152,50 C138,36 168,22 150,2 C140,-8 158,-16 150,-26"
                />

                {/* Café — se llena progresivamente */}
                <g clipPath="url(#cupInterior)">
                    <rect x="75" y={liquidY} width="150" height={liquidHeight + 25} className="cup-liquid" />
                    {fillPercent > 0.04 && (
                        <path
                            d={`M80,${liquidY} C112,${liquidY - 5} 188,${liquidY + 5} 220,${liquidY}`}
                            className="cup-liquid-wave"
                        />
                    )}
                    {hatchLines}
                </g>

                {/* Corazoncito cuando la taza está llena */}
                {isFull && (
                    <path
                        d="M138,140 C132,132 118,134 118,145 C118,155 138,168 146,174 C154,168 174,155 174,145 C174,134 160,132 154,140 C152,143 148,146 146,148 C144,146 140,143 138,140 Z"
                        className="cup-heart"
                    />
                )}

                {/* Cuerpo de la taza — trazo fino uniforme */}
                <path
                    className="cup-outline"
                    d="M72,118 C70,148 78,178 98,190 C112,198 188,198 202,190 C222,178 230,148 228,118"
                />

                {/* Borde superior */}
                <ellipse cx="150" cy="116" rx="78" ry="18" className="cup-outline" />
                <ellipse cx="150" cy="118" rx="70" ry="14" className="cup-outline cup-rim-inner" />

                {/* Asa */}
                <path className="cup-outline cup-handle" d="M226,138 C266,128 270,175 226,170" />

                {/* Platito */}
                <ellipse cx="150" cy="222" rx="112" ry="15" className="cup-outline" />
                <ellipse cx="150" cy="220" rx="90" ry="10" className="cup-outline cup-saucer-inner" />
            </svg>

            <div className="coffee-cup-caption">
                {isFull ? (
                    <span className="ready-label">¡Postre gratis disponible! 🎉</span>
                ) : (
                    <span>
                        {displayPoints}/{POINTS_REQUIRED} puntos — te faltan {POINTS_REQUIRED - displayPoints} para tu
                        próximo postre gratis
                    </span>
                )}
            </div>
        </div>
    );
}