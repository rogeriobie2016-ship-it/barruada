// Capa tipográfica: gerada a partir do título, sem imagem de terceiros.
// Serve em página Astro (estática) e dentro das ilhas React.

import { semente } from '../../lib/texto.ts';
import { Forma, type NomeForma } from './Formas.tsx';

export type Esquema = 'barro' | 'anil' | 'sol' | 'papel' | 'areia' | 'nanquim';

const NEUTROS: Esquema[] = ['papel', 'sol', 'areia', 'nanquim'];
const FORMAS_LIVRES: NomeForma[] = ['sol', 'disco', 'anel', 'estrela', 'duna'];

// Vermelho corrige (Resposta), azul afirma (Afirmação). O resto varia pelo título.
export function esquemaDe(titulo: string, pilar?: string): Esquema {
  if (pilar === 'Resposta') return 'barro';
  if (pilar === 'Afirmação') return 'anil';
  return NEUTROS[semente(titulo) % NEUTROS.length];
}

function tamanho(titulo: string, larga: boolean): string {
  const total = titulo.length;
  const maiorPalavra = Math.max(...titulo.split(/\s+/).map((p) => p.length));
  if (larga) {
    const porTotal = total <= 20 ? 9 : total <= 40 ? 7.5 : 6;
    return `${Math.min(porTotal, 88 / (maiorPalavra * 0.56)).toFixed(1)}cqw`;
  }
  const porTotal = total <= 12 ? 20 : total <= 24 ? 16 : total <= 40 ? 13 : total <= 60 ? 11 : 9.5;
  return `${Math.min(porTotal, 80 / (maiorPalavra * 0.56)).toFixed(1)}cqw`;
}

interface Props {
  titulo: string;
  rotulo?: string;
  esquema?: Esquema;
  pilar?: string;
  larga?: boolean;
  forma?: NomeForma;
}

export function Capa({ titulo, rotulo, esquema, pilar, larga = false, forma }: Props) {
  const cor = esquema ?? esquemaDe(titulo, pilar);
  // Raios amarelos só sobre azul.
  const desenho = forma ?? (cor === 'anil' ? 'raios' : FORMAS_LIVRES[semente(titulo + 'f') % FORMAS_LIVRES.length]);
  return (
    <div className={`capa capa--${cor}${larga ? ' capa-larga' : ''}`}>
      <Forma nome={desenho} className="capa-forma" />
      <span className="capa-rotulo">{rotulo}</span>
      <span className="capa-titulo" lang="pt-BR" style={{ fontSize: tamanho(titulo, larga) }}>
        {titulo}
      </span>
    </div>
  );
}
