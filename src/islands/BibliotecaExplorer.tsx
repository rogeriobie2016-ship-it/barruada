// Biblioteca com busca e filtros. Recebe as seções por props:
// a página pública manda só itens "ok"; /bastidores manda tudo e liga "interna".

import { useEffect, useMemo, useState } from 'react';
import { Capa, esquemaDe, type Esquema } from '../components/marca/Capa.tsx';
import { ESTADOS, nomeDoLugar, ufsDoItem } from '../lib/biblioteca.ts';
import { contem, dominio, slug } from '../lib/texto.ts';
import type { ItemBiblioteca, SecaoBiblioteca } from '../lib/types.ts';

interface Props {
  secoes: SecaoBiblioteca[];
  interna?: boolean;
}

const ESQUEMA_DA_SECAO: Record<string, Esquema> = {
  'Dossiê da novela': 'barro',
  'Dados para o pilar Afirmação': 'anil',
};

function bate(item: ItemBiblioteca, busca: string): boolean {
  if (!busca.trim()) return true;
  return [item.titulo, item.autoria, item.por_que, item.uso].some((campo) => contem(campo, busca));
}

export default function BibliotecaExplorer({ secoes, interna = false }: Props) {
  const [busca, setBusca] = useState('');
  const [secao, setSecao] = useState('');
  const [estado, setEstado] = useState('');
  const [checagem, setChecagem] = useState('');
  const [aberto, setAberto] = useState('');

  // Link direto para um item (vindo dos trilhos da página inicial).
  useEffect(() => {
    const alvo = decodeURIComponent(window.location.hash.slice(1));
    if (!alvo) return;
    setAberto(alvo);
    document.getElementById(alvo)?.scrollIntoView({ block: 'center' });
  }, []);

  const visiveis = useMemo(
    () =>
      secoes
        .filter((s) => !secao || s.secao === secao)
        .map((s) => ({
          ...s,
          itens: s.itens.filter(
            (i) =>
              bate(i, busca) &&
              (!estado || ufsDoItem(i).includes(estado)) &&
              (!checagem || i.checagem === checagem),
          ),
        }))
        .filter((s) => s.itens.length > 0),
    [secoes, busca, secao, estado, checagem],
  );
  const total = visiveis.reduce((n, s) => n + s.itens.length, 0);
  const prefixo = interna ? 'bib-int' : 'bib';

  return (
    <div>
      <form
        className="grid gap-3 border border-linha bg-fundo-alto p-4 md:grid-cols-4"
        onSubmit={(e) => e.preventDefault()}
        role="search"
        aria-label="Buscar na biblioteca"
      >
        <label className="grid gap-1 md:col-span-4">
          <span className="rotulo">Buscar</span>
          <input
            type="search"
            className="campo"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Título, autoria ou assunto"
          />
        </label>
        <label className="grid gap-1">
          <span className="rotulo">Seção</span>
          <select className="campo" value={secao} onChange={(e) => setSecao(e.target.value)}>
            <option value="">Todas</option>
            {secoes.map((s) => (
              <option key={s.secao} value={s.secao}>{s.secao}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          <span className="rotulo">Estado</span>
          <select className="campo" value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="">Todos</option>
            {ESTADOS.map((e) => (
              <option key={e.uf} value={e.uf}>{e.nome}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          <span className="rotulo">Checagem</span>
          <select className="campo" value={checagem} onChange={(e) => setChecagem(e.target.value)}>
            <option value="">{interna ? 'Todas' : 'Só itens checados'}</option>
            <option value="ok">Checado</option>
            {interna && <option value="conferir">A conferir</option>}
          </select>
        </label>
        <p className="m-0 self-end text-sm text-texto-suave" role="status" aria-live="polite">
          {total === 1 ? '1 referência' : `${total} referências`}
        </p>
      </form>

      {total === 0 && <p className="mt-8 text-lg">Nada por aqui com esse filtro. Tente outra palavra.</p>}

      {visiveis.map((s) => (
        <section key={s.secao} className="mt-10" aria-labelledby={`${prefixo}-${slug(s.secao)}`}>
          <h2 id={`${prefixo}-${slug(s.secao)}`} className="text-2xl md:text-3xl">{s.secao}</h2>
          {s.intro && <p className="mt-2 max-w-2xl text-texto-suave">{s.intro}</p>}
          <ul className="m-0 mt-4 grid list-none gap-4 p-0 md:grid-cols-2">
            {s.itens.map((i) => {
              const id = slug(i.titulo);
              const conferir = i.checagem === 'conferir';
              return (
                <li
                  key={id}
                  id={id}
                  data-checagem={i.checagem}
                  className={`grid grid-cols-[6.5rem_1fr] gap-4 border p-3 ${
                    conferir ? 'border-dashed border-sol' : 'border-linha'
                  }`}
                >
                  <Capa
                    titulo={i.titulo}
                    rotulo={nomeDoLugar(i.uf)}
                    esquema={ESQUEMA_DA_SECAO[s.secao] ?? esquemaDe(i.titulo)}
                  />
                  <div className="min-w-0">
                    {conferir && <p className="rotulo m-0 mb-2 inline-block bg-sol px-2 py-1 text-nanquim">A conferir</p>}
                    <h3 className="text-xl">{i.titulo}</h3>
                    <p className="m-0 mt-1 text-sm text-texto-suave">
                      {[i.autoria, nomeDoLugar(i.uf), i.ano].filter(Boolean).join(' · ')}
                    </p>
                    {i.por_que && (
                      <p className="m-0 mt-2 text-sm">
                        <span className="rotulo block text-sol">Por que entra</span>
                        {i.por_que}
                      </p>
                    )}
                    <details
                      className="mt-2"
                      open={aberto === id}
                      onToggle={(e) => {
                        const abriu = (e.currentTarget as HTMLDetailsElement).open;
                        setAberto((atual) => (abriu ? id : atual === id ? '' : atual));
                      }}
                    >
                      <summary className="inline-flex min-h-11 items-center font-titulo font-bold underline">
                        Como virar conteúdo e fontes
                      </summary>
                      {i.uso && <p className="m-0 mt-1 text-sm">{i.uso}</p>}
                      {i.fontes.length > 0 && (
                        <ul className="m-0 mt-2 grid list-none gap-1 p-0 text-sm">
                          {i.fontes.map((f) => (
                            <li key={f}>
                              <a href={f} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-8 items-center break-all text-sol">
                                Fonte: {dominio(f)}
                                <span className="so-leitor"> (abre em nova aba)</span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </details>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
