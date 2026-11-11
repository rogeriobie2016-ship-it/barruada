// Mapa vivo dos nove estados: toque, mouse ou teclado.
// modo "abertura": cena da página inicial, com raios e disco, e um cartão que leva a Quem somos.
// modo "completo": mapa com painel de pessoas, dados e referências de cada estado.

import { useEffect, useRef, useState } from 'react';
import { Ilustra } from '../components/marca/Ilustra.tsx';
import mapa from '../data/ne-map.json';
import { slug } from '../lib/texto.ts';
import type { ItemBiblioteca, Membro } from '../lib/types.ts';

export interface EstadoDoMapa {
  uf: string;
  nome: string;
  membros: Membro[];
  dados: ItemBiblioteca[];
  referencias: (ItemBiblioteca & { secao: string })[];
}

interface Props {
  estados: EstadoDoMapa[];
  modo: 'abertura' | 'completo';
  base: string; // prefixo de rota (BASE_PATH)
}

const geo = mapa as { w: number; h: number; states: { uf: string; name: string; d: string; cx: number; cy: number }[] };

function contagem(e: EstadoDoMapa): string {
  const pessoas = e.membros.length === 0 ? 'ninguém cadastrado ainda' : e.membros.length === 1 ? '1 pessoa do coletivo' : `${e.membros.length} pessoas do coletivo`;
  const refs = e.dados.length + e.referencias.length;
  return `${pessoas}, ${refs === 1 ? '1 referência checada' : `${refs} referências checadas`}`;
}

export default function MapaVivo({ estados, modo, base }: Props) {
  const [uf, setUf] = useState('');
  const cena = useRef<HTMLDivElement>(null);
  const painel = useRef<HTMLDivElement>(null);
  const porUf = new Map(estados.map((e) => [e.uf, e]));
  const atual = porUf.get(uf);

  // Link direto: /quem-somos/#CE abre o Ceará.
  useEffect(() => {
    if (modo !== 'completo') return;
    const alvo = window.location.hash.slice(1).toUpperCase();
    if (porUf.has(alvo)) setUf(alvo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Os raios acompanham o ponteiro, de leve. Sem movimento para quem pediu menos movimento.
  function mexer(e: React.PointerEvent) {
    const el = cena.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--px', `${(((e.clientX - r.left) / r.width - 0.5) * 22).toFixed(1)}px`);
    el.style.setProperty('--py', `${(((e.clientY - r.top) / r.height - 0.5) * 22).toFixed(1)}px`);
  }

  function escolher(sigla: string) {
    setUf((antes) => (antes === sigla && modo === 'abertura' ? '' : sigla));
    if (modo === 'completo') window.setTimeout(() => painel.current?.focus(), 30);
  }

  function tecla(e: React.KeyboardEvent, sigla: string) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      escolher(sigla);
    }
  }

  const desenho = (
    <div ref={cena} className="cena-mapa" onPointerMove={mexer} data-mapa={modo}>
      <Ilustra nome="raios" className="cena-raios giro" />
      <span className="cena-disco grao" aria-hidden="true" />
      <svg
        viewBox={`-20 -20 ${geo.w + 40} ${geo.h + 40}`}
        className="mapa-vivo cena-desenho"
        role="group"
        aria-label="Mapa do Nordeste. Escolha um estado."
      >
        {geo.states.map((s) => (
          <path
            key={s.uf}
            d={s.d}
            className="estado"
            role="button"
            tabIndex={0}
            aria-pressed={uf === s.uf}
            aria-label={`${s.name}: ${porUf.get(s.uf) ? contagem(porUf.get(s.uf)!) : ''}`}
            onClick={() => escolher(s.uf)}
            onKeyDown={(e) => tecla(e, s.uf)}
            data-uf={s.uf}
          />
        ))}
        {geo.states.map((s) => (
          <text key={s.uf} x={s.cx} y={s.cy + 14} fontSize={['AL', 'SE', 'RN', 'PB'].includes(s.uf) ? 30 : 44} aria-hidden="true">
            {s.uf}
          </text>
        ))}
      </svg>
    </div>
  );

  if (modo === 'abertura') {
    return (
      <div className="relative">
        {desenho}
        <div className="cena-cartao" role="status" aria-live="polite">
          {atual ? (
            <div className="etiqueta etiqueta-sol sobre-claro !block max-w-[17rem] p-3" data-cartao-estado={atual.uf}>
              <span className="block text-2xl">{atual.nome}</span>
              <span className="block text-sm font-semibold tracking-normal">{contagem(atual)}</span>
              <a href={`${base}/quem-somos/#${atual.uf}`} className="mt-1 inline-flex min-h-11 items-center text-sm underline">
                Ver quem é de lá
              </a>
            </div>
          ) : (
            <span className="etiqueta !block text-sm">Toque num estado</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1.1fr] md:items-start">
      <div>
        {desenho}
        <ul className="m-0 mt-4 flex list-none flex-wrap justify-center gap-1 p-0" aria-label="Estados">
          {estados.map((e) => (
            <li key={e.uf}>
              <button
                type="button"
                aria-pressed={uf === e.uf}
                onClick={() => escolher(e.uf)}
                data-chip={e.uf}
                className={`min-h-11 min-w-11 border px-2 font-titulo font-extrabold ${
                  uf === e.uf ? 'sobre-claro border-sol bg-sol text-nanquim' : 'border-linha bg-transparent text-texto'
                }`}
              >
                {e.uf}
                {e.membros.length > 0 && <span className="ml-1 text-xs">({e.membros.length})</span>}
                <span className="so-leitor">: {e.nome}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div ref={painel} tabIndex={-1} className="faixa faixa--papel grao sobre-claro min-h-[22rem] p-5 md:p-7" data-painel={uf || 'vazio'}>
        {!atual && (
          <>
            <p className="rotulo m-0 cor-destaque">Os nove</p>
            <h2 className="mt-2 text-4xl">Escolha um estado no mapa</h2>
            <p className="mt-3">Cada estado mostra quem é do coletivo por lá, os dados checados e o que a biblioteca tem daquele lugar.</p>
            <p className="caneta m-0 mt-4 -rotate-1 text-3xl text-barro">nove estados, nenhum igual</p>
          </>
        )}
        {atual && (
          <>
            <p className="rotulo m-0 cor-destaque">{atual.uf}</p>
            <h2 className="mt-2 text-5xl md:text-6xl" data-nome-estado>{atual.nome}</h2>

            <h3 className="mt-6 text-xl">Gente do coletivo</h3>
            {atual.membros.length === 0 ? (
              <p className="m-0 mt-1 text-cinza-quente">Ninguém cadastrado aqui ainda.</p>
            ) : (
              <ul className="m-0 mt-2 grid list-none gap-2 p-0">
                {atual.membros.map((m) => (
                  <li key={m.nome} className="border border-nanquim p-3" data-membro>
                    <p className="m-0 font-titulo text-xl font-extrabold tracking-[-0.04em]">{m.nome}</p>
                    {m.area && <p className="m-0 text-sm">{m.area}</p>}
                    {m.topa.length > 0 && (
                      <p className="m-0 mt-1 flex flex-wrap gap-1">
                        {m.topa.map((t) => (
                          <span key={t} className="rotulo bg-anil px-1.5 py-0.5 text-papel">{t}</span>
                        ))}
                      </p>
                    )}
                    {m.link && (
                      <a href={m.link} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-sm font-bold text-anil">
                        Ver o perfil<span className="so-leitor"> de {m.nome} (abre em nova aba)</span>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {atual.dados.length > 0 && (
              <>
                <h3 className="mt-6 text-xl">Dados para afirmar</h3>
                <ul className="m-0 mt-2 grid list-none gap-2 p-0">
                  {atual.dados.map((d) => (
                    <li key={d.titulo} className="border-l-4 border-anil pl-3">
                      <a href={`${base}/biblioteca/#${slug(d.titulo)}`} className="font-bold">{d.titulo}</a>
                      {d.por_que && <p className="m-0 text-sm">{d.por_que}</p>}
                    </li>
                  ))}
                </ul>
              </>
            )}

            <h3 className="mt-6 text-xl">Na biblioteca</h3>
            {atual.referencias.length === 0 ? (
              <p className="m-0 mt-1 text-cinza-quente">Ainda não tem item checado deste estado.</p>
            ) : (
              <ul className="m-0 mt-2 grid list-none gap-1 p-0">
                {atual.referencias.map((r) => (
                  <li key={r.titulo}>
                    <a href={`${base}/biblioteca/#${slug(r.titulo)}`} className="inline-flex min-h-9 items-center font-bold">{r.titulo}</a>
                    <span className="text-sm text-cinza-quente"> · {r.secao}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
