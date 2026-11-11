// Capa tipográfica: gerada a partir do título, sem imagem de terceiros.
// Cor chapada, grão, moldura fina, Archivo apertado e uma ilustração do acervo da marca.
// Serve em página Astro (estática) e dentro das ilhas React.

import { semente } from '../../lib/texto.ts';
import { ACERVO, Ilustra } from './Ilustra.tsx';

export type Esquema = 'barro' | 'anil' | 'sol' | 'papel' | 'areia' | 'nanquim';

const NEUTROS: Esquema[] = ['papel', 'sol', 'areia', 'nanquim'];

// Vermelho corrige (Resposta), azul afirma (Afirmação). O resto varia pelo título.
export function esquemaDe(titulo: string, pilar?: string): Esquema {
  if (pilar === 'Resposta') return 'barro';
  if (pilar === 'Afirmação') return 'anil';
  return NEUTROS[semente(titulo) % NEUTROS.length];
}

export function arteDe(titulo: string): string {
  return ACERVO[semente(`${titulo}/arte`) % ACERVO.length];
}

function tamanho(titulo: string, larga: boolean): string {
  const total = titulo.length;
  const maiorPalavra = Math.max(...titulo.split(/\s+/).map((p) => p.length));
  if (larga) {
    const porTotal = total <= 20 ? 9 : total <= 40 ? 7.5 : 6;
    return `${Math.min(porTotal, 60 / (maiorPalavra * 0.56)).toFixed(1)}cqw`;
  }
  const porTotal = total <= 12 ? 19 : total <= 24 ? 15.5 : total <= 40 ? 12.5 : total <= 60 ? 10.5 : 9;
  return `${Math.min(porTotal, 76 / (maiorPalavra * 0.56)).toFixed(1)}cqw`;
}

interface Props {
  titulo: string;
  rotulo?: string;
  esquema?: Esquema;
  pilar?: string;
  larga?: boolean;
  arte?: string;
}

export function Capa({ titulo, rotulo, esquema, pilar, larga = false, arte }: Props) {
  const cor = esquema ?? esquemaDe(titulo, pilar);
  const desenho = arte ?? arteDe(titulo);
  return (
    <div className={`capa grao capa--${cor}${larga ? ' capa-larga' : ''}`}>
      <span className="capa-moldura" aria-hidden="true" />
      {/* Raios amarelos só sobre azul */}
      {cor === 'anil' && <Ilustra nome="raios" className="capa-raios" />}
      <Ilustra nome={desenho} className="capa-arte" />
      <span className="capa-rotulo">{rotulo}</span>
      <span className="capa-titulo" lang="pt-BR" style={{ fontSize: tamanho(titulo, larga) }}>
        {titulo}
      </span>
    </div>
  );
}
