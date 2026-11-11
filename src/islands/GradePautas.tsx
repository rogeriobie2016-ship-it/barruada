// Grade das peças publicadas, com filtro por série, pilar e formato.

import { useMemo, useState } from 'react';
import { Capa } from '../components/marca/Capa.tsx';
import { slug } from '../lib/texto.ts';
import type { Pauta } from '../lib/types.ts';

function unicos(valores: string[]): string[] {
  return [...new Set(valores.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

export default function GradePautas({ pautas, base }: { pautas: Pauta[]; base: string }) {
  const [serie, setSerie] = useState('');
  const [pilar, setPilar] = useState('');
  const [formato, setFormato] = useState('');

  const visiveis = useMemo(
    () => pautas.filter((p) => (!serie || p.serie === serie) && (!pilar || p.pilar === pilar) && (!formato || p.formato === formato)),
    [pautas, serie, pilar, formato],
  );

  const filtros = [
    { nome: 'Série', valor: serie, muda: setSerie, opcoes: unicos(pautas.map((p) => p.serie)), todas: 'Todas' },
    { nome: 'Pilar', valor: pilar, muda: setPilar, opcoes: unicos(pautas.map((p) => p.pilar)), todas: 'Todos' },
    { nome: 'Formato', valor: formato, muda: setFormato, opcoes: unicos(pautas.map((p) => p.formato)), todas: 'Todos' },
  ];

  return (
    <div>
      <form className="grid gap-3 md:grid-cols-3" onSubmit={(e) => e.preventDefault()} aria-label="Filtros">
        {filtros.map((f) => (
          <label key={f.nome} className="grid gap-1">
            <span className="rotulo">{f.nome}</span>
            <select className="campo" value={f.valor} onChange={(e) => f.muda(e.target.value)}>
              <option value="">{f.todas}</option>
              {f.opcoes.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
        ))}
      </form>
      <p className="m-0 mt-2 text-sm text-texto-suave" role="status" aria-live="polite">
        {visiveis.length === 1 ? '1 peça' : `${visiveis.length} peças`}
      </p>
      <ul className="m-0 mt-4 grid list-none grid-cols-2 gap-4 p-0 md:grid-cols-4">
        {visiveis.map((p) => (
          <li key={p.id}>
            <a href={`${base}/em-cartaz/${slug(p.id)}/`} className="cartao-link">
              <Capa titulo={p.titulo} rotulo={p.serie} pilar={p.pilar} />
              <span className="mt-2 block text-sm text-texto-suave">{p.formato}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
