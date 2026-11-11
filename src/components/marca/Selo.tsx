// Cartaz-selo: a base principal do design system.
// Campo azul, moldura dupla, raios amarelos atrás do disco de barro e o mapa dos nove com as divisas à mostra.

import mapa from '../../data/ne-map.json';

const dados = mapa as { w: number; h: number; states: { uf: string; d: string }[] };

const CX = 200;
const CY = 252;
const N_RAIOS = 32;

const raios = Array.from({ length: N_RAIOS }, (_, i) => {
  const a = (i * 2 * Math.PI) / N_RAIOS;
  const p = (ang: number, r: number) => `${(CX + r * Math.cos(ang)).toFixed(1)} ${(CY + r * Math.sin(ang)).toFixed(1)}`;
  return `M${p(a - 0.012, 128)}L${p(a - 0.045, 330)}L${p(a + 0.045, 330)}L${p(a + 0.012, 128)}Z`;
}).join('');

interface Props {
  topo: string;
  base: string;
  esquerda?: string;
  direita?: string;
  className?: string;
  gira?: boolean;
}

export function Selo({ topo, base, esquerda, direita, className, gira = true }: Props) {
  const escala = 0.158;
  const letras = {
    fontFamily: 'var(--fonte-titulo)',
    fontWeight: 800,
    letterSpacing: '0.22em',
    fill: 'var(--papel)',
  } as const;
  return (
    <svg viewBox="0 0 400 500" className={className} aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="selo-janela">
          <rect x="22" y="22" width="356" height="456" />
        </clipPath>
      </defs>
      <rect width="400" height="500" style={{ fill: 'var(--anil)' }} />
      <g clipPath="url(#selo-janela)">
        <path d={raios} className={gira ? 'giro-selo' : undefined} style={{ fill: 'var(--raios)', transformOrigin: `${CX}px ${CY}px` }} />
      </g>
      <rect x="12" y="12" width="376" height="476" style={{ fill: 'none', stroke: 'var(--papel)', strokeWidth: 2.5 }} />
      <rect x="19" y="19" width="362" height="462" style={{ fill: 'none', stroke: 'var(--papel)', strokeWidth: 1 }} />
      {/* Tarjas de texto sobre o campo azul */}
      <rect x="22" y="22" width="356" height="46" style={{ fill: 'var(--anil)' }} />
      <rect x="22" y="432" width="356" height="46" style={{ fill: 'var(--anil)' }} />
      <rect x="22" y="68" width="40" height="364" style={{ fill: 'var(--anil)' }} />
      <rect x="338" y="68" width="40" height="364" style={{ fill: 'var(--anil)' }} />
      <circle cx={CX} cy={CY} r="124" style={{ fill: 'none', stroke: 'var(--papel)', strokeWidth: 1.2 }} />
      <circle cx={CX} cy={CY} r="114" style={{ fill: 'var(--barro)' }} />
      <g transform={`translate(${CX - (dados.w * escala) / 2} ${CY - (dados.h * escala) / 2}) scale(${escala})`}>
        {dados.states.map((e) => (
          <path
            key={e.uf}
            d={e.d}
            style={{ fill: 'var(--papel)', stroke: 'var(--barro)', strokeWidth: 'var(--traco-mapa)', vectorEffect: 'non-scaling-stroke', strokeLinejoin: 'round' }}
          />
        ))}
      </g>
      <text x={CX} y="54" textAnchor="middle" style={{ ...letras, fontSize: 19 }}>{topo.toUpperCase()}</text>
      <text x={CX} y="462" textAnchor="middle" textLength={base.length > 22 ? 330 : undefined} lengthAdjust="spacing" style={{ ...letras, fontSize: base.length > 22 ? 13 : 17, letterSpacing: base.length > 22 ? undefined : '0.22em' }}>
        {base.toUpperCase()}
      </text>
      {esquerda && (
        <text transform={`translate(48 ${CY}) rotate(-90)`} textAnchor="middle" style={{ ...letras, fontSize: 13 }}>{esquerda.toUpperCase()}</text>
      )}
      {direita && (
        <text transform={`translate(352 ${CY}) rotate(90)`} textAnchor="middle" style={{ ...letras, fontSize: 13 }}>{direita.toUpperCase()}</text>
      )}
    </svg>
  );
}
