// Ilustração chapada do acervo da marca (arte.ts). As cores vêm de três papéis em CSS:
// --il-m (principal), --il-a (destaque) e --il-p (fundo).

import { ARTE } from './arte.ts';

export type NomeArte = keyof typeof ARTE;

// Acervo usado para variar capas. Fica de fora o que é só forma geométrica.
export const ACERVO: string[] = [
  'sol', 'estrela', 'lua', 'jangada', 'catavento', 'coqueiro', 'caju', 'garrafa',
  'azulejo', 'casa', 'cadeira', 'filtro', 'predio', 'mic', 'livro',
];

function cor(c: string): string {
  return c === 'm' || c === 'a' || c === 'p' ? `var(--il-${c}, currentColor)` : c;
}

export function Ilustra({ nome, className }: { nome: string; className?: string }) {
  const arte = ARTE[nome] ?? ARTE.sol;
  const recorte = arte.clip ? `recorte-${nome}` : undefined;
  return (
    <svg viewBox={arte.vb} className={className} aria-hidden="true" focusable="false">
      {arte.clip && (
        <clipPath id={recorte}>
          <path d={arte.clip} />
        </clipPath>
      )}
      {arte.L.map((camada, i) => (
        <path
          key={i}
          d={camada.d}
          transform={camada.t}
          clipPath={camada.clip ? `url(#${recorte})` : undefined}
          opacity={camada.o}
          fillRule="evenodd"
          style={
            camada.line
              ? { fill: 'none', stroke: cor(camada.line), strokeWidth: camada.sw }
              : { fill: cor(camada.c) }
          }
        />
      ))}
    </svg>
  );
}
