// O mapa inteiro dos nove estados, com as divisas à mostra.
// Geometria real (src/data/ne-map.json, do design system; base @svg-maps/brazil, CC BY 4.0).

import mapa from '../../data/ne-map.json';

interface Estado {
  uf: string;
  name: string;
  d: string;
  cx: number;
  cy: number;
}

const dados = mapa as { w: number; h: number; states: Estado[] };

export function MapaNE({ className, titulo }: { className?: string; titulo?: string }) {
  return (
    <svg
      viewBox={`-10 -10 ${dados.w + 20} ${dados.h + 20}`}
      className={className}
      role={titulo ? 'img' : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
      focusable="false"
    >
      {dados.states.map((e) => (
        <path
          key={e.uf}
          d={e.d}
          style={{
            fill: 'var(--mapa-preenchimento, var(--papel))',
            stroke: 'var(--mapa-divisa, var(--nanquim))',
            strokeWidth: 'var(--traco-mapa)',
            vectorEffect: 'non-scaling-stroke',
            strokeLinejoin: 'round',
          }}
        />
      ))}
    </svg>
  );
}
