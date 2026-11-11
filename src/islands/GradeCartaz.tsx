// Em cartaz: peças publicadas separadas por tipo (vídeos, carrosséis, podcast, blog e textos),
// com atalho por tipo e filtro por série e pilar.

import { useMemo, useState } from 'react';
import { Capa } from '../components/marca/Capa.tsx';
import { GRUPOS, type IdGrupo, type ItemCartaz } from '../lib/cartaz.ts';

function unicos(valores: string[]): string[] {
  return [...new Set(valores.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

const CLARO = ['papel', 'areia', 'sol'];

export default function GradeCartaz({ itens, base }: { itens: ItemCartaz[]; base: string }) {
  const [tipo, setTipo] = useState<IdGrupo | ''>('');
  const [serie, setSerie] = useState('');
  const [pilar, setPilar] = useState('');

  const filtrados = useMemo(
    () => itens.filter((i) => (!serie || i.serie === serie) && (!pilar || i.pilar === pilar)),
    [itens, serie, pilar],
  );
  const contagem = (id: IdGrupo) => filtrados.filter((i) => i.grupo === id).length;
  const grupos = GRUPOS.filter((g) => !tipo || g.id === tipo);
  const comFiltro = Boolean(serie || pilar);

  return (
    <div data-cartaz>
      <div className="mx-auto max-w-6xl px-4 pt-8 md:px-8">
        <div role="group" aria-label="Tipo de conteúdo" className="flex flex-wrap gap-1">
          <button
            type="button"
            aria-pressed={tipo === ''}
            onClick={() => setTipo('')}
            data-tipo="todos"
            className={`min-h-11 border px-3 font-titulo font-bold ${tipo === '' ? 'sobre-claro border-sol bg-sol text-nanquim' : 'border-linha bg-transparent text-texto'}`}
          >
            Tudo ({filtrados.length})
          </button>
          {GRUPOS.map((g) => (
            <button
              key={g.id}
              type="button"
              aria-pressed={tipo === g.id}
              onClick={() => setTipo(g.id)}
              data-tipo={g.id}
              className={`min-h-11 border px-3 font-titulo font-bold ${tipo === g.id ? 'sobre-claro border-sol bg-sol text-nanquim' : 'border-linha bg-transparent text-texto'}`}
            >
              {g.nome} ({contagem(g.id)})
            </button>
          ))}
        </div>

        {itens.length > 0 && (
          <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={(e) => e.preventDefault()} aria-label="Filtros">
            <label className="grid gap-1">
              <span className="rotulo">Série</span>
              <select className="campo" value={serie} onChange={(e) => setSerie(e.target.value)}>
                <option value="">Todas</option>
                {unicos(itens.map((i) => i.serie)).map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="rotulo">Pilar</span>
              <select className="campo" value={pilar} onChange={(e) => setPilar(e.target.value)}>
                <option value="">Todos</option>
                {unicos(itens.map((i) => i.pilar)).map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
          </form>
        )}
        <p className="so-leitor" role="status" aria-live="polite">
          {filtrados.length === 1 ? '1 peça' : `${filtrados.length} peças`}
        </p>
      </div>

      <div className="mt-8">
        {grupos.map((g) => {
          const doGrupo = filtrados.filter((i) => i.grupo === g.id);
          return (
            <section
              key={g.id}
              id={g.id}
              aria-labelledby={`cartaz-${g.id}`}
              className={`faixa grao rasgo relative faixa--${g.tom}${CLARO.includes(g.tom) ? ' sobre-claro' : ''}`}
              data-grupo={g.id}
            >
              <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
                <h2 id={`cartaz-${g.id}`} className="text-3xl md:text-5xl">{g.nome}</h2>
                {doGrupo.length === 0 ? (
                  <p className="m-0 mt-3 text-lg text-texto-suave" data-grupo-vazio>
                    {comFiltro ? 'Nada com esse filtro.' : g.vazio}
                  </p>
                ) : (
                  <ul className={`m-0 mt-6 grid list-none gap-4 p-0 ${g.id === 'texto' ? 'md:grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
                    {doGrupo.map((i) =>
                      g.id === 'texto' ? (
                        <li key={i.id} className="border border-linha p-4" data-item={i.id}>
                          <p className="rotulo m-0 cor-destaque">{i.serie}</p>
                          <h3 className="mt-2 text-2xl">
                            <a href={`${base}${i.href}`}>{i.titulo}</a>
                          </h3>
                          {i.resumo && <p className="m-0 mt-2">{i.resumo}</p>}
                        </li>
                      ) : (
                        <li key={i.id} data-item={i.id}>
                          <a href={`${base}${i.href}`} className="cartao-link">
                            <Capa titulo={i.titulo} rotulo={i.serie} pilar={i.pilar} arte={g.arte} />
                            <span className="mt-2 block text-sm text-texto-suave">{i.formato}</span>
                          </a>
                        </li>
                      ),
                    )}
                  </ul>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
