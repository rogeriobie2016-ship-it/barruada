// Área de trabalho do coletivo: quadro de pautas, séries e biblioteca completa.
// AVISO: isto não é segurança de verdade. A página só fica fora do menu, do sitemap e dos buscadores.
// Os roteiros ficam no Drive, com permissão própria: quem não tem acesso lá não abre o link.

import { useMemo, useState } from 'react';
import { STATUS, type Pauta, type SecaoBiblioteca, type Serie } from '../lib/types.ts';
import BibliotecaExplorer from './BibliotecaExplorer.tsx';

interface Props {
  pautas: Pauta[];
  series: Serie[];
  biblioteca: SecaoBiblioteca[];
  drive: Record<string, string>;
}

const ABAS = [
  { id: 'quadro', nome: 'Quadro de pautas' },
  { id: 'series', nome: 'Séries' },
  { id: 'biblioteca', nome: 'Biblioteca completa' },
] as const;
type Aba = (typeof ABAS)[number]['id'];

const LIMITE_RESPOSTA = 0.6;

function unicos(valores: string[]): string[] {
  return [...new Set(valores.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

export default function Bastidores({ pautas, series, biblioteca, drive }: Props) {
  const [aba, setAba] = useState<Aba>('quadro');
  const [serie, setSerie] = useState('');
  const [pilar, setPilar] = useState('');
  const [formato, setFormato] = useState('');
  const [responsavel, setResponsavel] = useState('');

  const filtradas = useMemo(
    () =>
      pautas.filter(
        (p) =>
          (!serie || p.serie_id === serie) &&
          (!pilar || p.pilar === pilar) &&
          (!formato || p.formato === formato) &&
          (!responsavel || (responsavel === '(sem responsável)' ? !p.responsavel : p.responsavel === responsavel)),
      ),
    [pautas, serie, pilar, formato, responsavel],
  );

  // Contador por pilar: olha o que está em produção, sem filtro.
  const emProducao = pautas.filter((p) => p.status === 'Em produção');
  const resposta = emProducao.filter((p) => p.pilar === 'Resposta').length;
  const afirmacao = emProducao.length - resposta;
  const fatia = emProducao.length === 0 ? 0 : resposta / emProducao.length;
  const alerta = fatia > LIMITE_RESPOSTA;

  function teclaNaAba(e: React.KeyboardEvent, i: number) {
    const passo = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!passo) return;
    e.preventDefault();
    const proxima = ABAS[(i + passo + ABAS.length) % ABAS.length];
    setAba(proxima.id);
    document.getElementById(`aba-${proxima.id}`)?.focus();
  }

  return (
    <div>
      <div role="tablist" aria-label="Áreas dos bastidores" className="flex flex-wrap gap-1 border-b border-linha">
        {ABAS.map((a, i) => (
          <button
            key={a.id}
            id={`aba-${a.id}`}
            type="button"
            role="tab"
            aria-selected={aba === a.id}
            aria-controls={`painel-${a.id}`}
            tabIndex={aba === a.id ? 0 : -1}
            onClick={() => setAba(a.id)}
            onKeyDown={(e) => teclaNaAba(e, i)}
            className={`min-h-11 border-0 px-4 font-titulo font-bold ${
              aba === a.id ? 'sobre-claro bg-sol text-nanquim' : 'bg-transparent text-texto hover:bg-fundo-alto'
            }`}
          >
            {a.nome}
          </button>
        ))}
      </div>

      {aba === 'quadro' && (
        <div id="painel-quadro" role="tabpanel" aria-labelledby="aba-quadro" className="pt-6">
          <div
            className={`border p-4 ${alerta ? 'border-sol bg-barro text-papel' : 'border-linha bg-fundo-alto'}`}
            data-alerta={alerta}
          >
            <p className="rotulo m-0">Equilíbrio dos pilares em produção</p>
            <p className="m-0 mt-2 text-lg font-bold">
              Resposta: {resposta} · Afirmação: {afirmacao}
            </p>
            <p className="m-0 mt-1 text-sm" role="status">
              {emProducao.length === 0
                ? 'Nada em produção agora.'
                : alerta
                  ? `Atenção: Resposta passou de 60% do que está em produção (${Math.round(fatia * 100)}%). Puxe uma pauta de Afirmação.`
                  : `Resposta está em ${Math.round(fatia * 100)}% do que está em produção. Dentro da meta.`}
            </p>
          </div>

          <form className="mt-4 grid gap-3 md:grid-cols-4" onSubmit={(e) => e.preventDefault()} aria-label="Filtros do quadro">
            <label className="grid gap-1">
              <span className="rotulo">Série</span>
              <select className="campo" value={serie} onChange={(e) => setSerie(e.target.value)}>
                <option value="">Todas</option>
                {series.map((s) => (
                  <option key={s.id} value={s.id}>{s.id}: {s.nome}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="rotulo">Pilar</span>
              <select className="campo" value={pilar} onChange={(e) => setPilar(e.target.value)}>
                <option value="">Todos</option>
                {unicos(pautas.map((p) => p.pilar)).map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="rotulo">Formato</span>
              <select className="campo" value={formato} onChange={(e) => setFormato(e.target.value)}>
                <option value="">Todos</option>
                {unicos(pautas.map((p) => p.formato)).map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="rotulo">Responsável</span>
              <select className="campo" value={responsavel} onChange={(e) => setResponsavel(e.target.value)}>
                <option value="">Todos</option>
                <option>(sem responsável)</option>
                {unicos(pautas.map((p) => p.responsavel)).map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
          </form>
          <p className="m-0 mt-2 text-sm text-texto-suave" role="status" aria-live="polite">
            {filtradas.length} de {pautas.length} pautas
          </p>

          <div className="-mx-4 mt-4 overflow-x-auto px-4" tabIndex={0} aria-label="Quadro de pautas por status: role para o lado">
            <div className="flex gap-3">
              {STATUS.map((st) => {
                const coluna = filtradas.filter((p) => p.status === st);
                return (
                  <section key={st} className="w-72 flex-none" aria-label={`${st}: ${coluna.length}`} data-coluna={st}>
                    <h2 className="flex items-baseline justify-between border-b-2 border-sol pb-2 text-lg">
                      {st}
                      <span className="text-sm text-texto-suave">{coluna.length}</span>
                    </h2>
                    <ul className="m-0 mt-3 grid list-none gap-3 p-0">
                      {coluna.map((p) => (
                        <li key={p.id} className="sobre-claro bg-papel p-3 text-nanquim" data-pauta={p.id}>
                          <p className="rotulo m-0 flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 text-papel ${p.pilar === 'Resposta' ? 'bg-barro' : 'bg-anil'}`}>{p.pilar}</span>
                            {p.id} · {p.formato}
                          </p>
                          <h3 className="mt-2 text-lg">{p.titulo}</h3>
                          {p.gancho && <p className="m-0 mt-1 text-sm">{p.gancho}</p>}
                          <p className="m-0 mt-2 text-xs text-cinza-quente">
                            {p.serie}
                            {p.esforco && ` · Esforço: ${p.esforco}`}
                            <br />
                            Responsável: {p.responsavel || 'ninguém ainda'}
                            {p.data_alvo && ` · Data: ${p.data_alvo}`}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-x-4">
                            {p.roteiro_url && (
                              <a href={p.roteiro_url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-sm font-bold text-anil">
                                Abrir roteiro no Drive
                              </a>
                            )}
                            {p.status === 'Postado' && p.post_url && (
                              <a href={p.post_url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-sm font-bold text-barro-escuro">
                                Ver o post
                              </a>
                            )}
                          </div>
                        </li>
                      ))}
                      {coluna.length === 0 && <li className="text-sm text-texto-suave">Vazio.</li>}
                    </ul>
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {aba === 'series' && (
        <div id="painel-series" role="tabpanel" aria-labelledby="aba-series" className="pt-6">
          <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-2">
            {series.map((s) => (
              <li key={s.id} className="border border-linha p-4" data-serie={s.id}>
                <p className="rotulo m-0 flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 text-papel ${s.pilar === 'Resposta' ? 'bg-barro' : 'bg-anil'}`}>{s.pilar}</span>
                  {s.id}
                  {s.esforco && ` · Esforço: ${s.esforco}`}
                </p>
                <h2 className="mt-2 text-2xl">{s.nome}</h2>
                <p className="m-0 mt-2">{s.premissa}</p>
                {s.quem_faz && <p className="m-0 mt-2 text-sm text-texto-suave">Quem faz: {s.quem_faz}</p>}
                <details className="mt-2">
                  <summary className="inline-flex min-h-11 items-center font-titulo font-bold underline">
                    Episódios ({s.episodios.length})
                  </summary>
                  <ul className="m-0 mt-1 grid list-none gap-1 p-0 text-sm">
                    {s.episodios.map((id) => {
                      const p = pautas.find((x) => x.id === id);
                      return (
                        <li key={id}>
                          <span className="font-bold">{id}</span>
                          {p ? `: ${p.titulo} (${p.formato}, ${p.status})` : ''}
                        </li>
                      );
                    })}
                  </ul>
                </details>
              </li>
            ))}
          </ul>
        </div>
      )}

      {aba === 'biblioteca' && (
        <div id="painel-biblioteca" role="tabpanel" aria-labelledby="aba-biblioteca" className="pt-6">
          <p className="m-0 mb-4 max-w-2xl text-texto-suave">
            Aqui aparece tudo, inclusive o que está marcado como a conferir (borda tracejada). No site público só entra item checado.
          </p>
          <BibliotecaExplorer secoes={biblioteca} interna />
        </div>
      )}

      <nav aria-label="Atalhos do Drive" className="mt-10 border-t border-linha pt-4">
        <p className="rotulo m-0">No Drive</p>
        <ul className="m-0 mt-2 flex list-none flex-wrap gap-x-5 p-0 text-sm">
          {Object.entries(drive).filter(([, url]) => url).map(([nome, url]) => (
            <li key={nome}>
              <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center capitalize text-sol">
                {nome}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
