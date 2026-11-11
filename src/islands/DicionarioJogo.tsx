// Dicionário da Barruada em modo jogo: aparece a palavra, quatro significados, uma só resposta certa.

import { useEffect, useRef, useState } from 'react';
import { montarRodada, vereditoDicionario, type Pergunta } from '../lib/dicionario.ts';
import type { Termo } from '../lib/types.ts';
import Compartilhar from './Compartilhar.tsx';
import Festa from './Festa.tsx';

const LETRAS = ['A', 'B', 'C', 'D'];

export default function DicionarioJogo({ termos }: { termos: Termo[] }) {
  const [rodada, setRodada] = useState<Pergunta[]>([]);
  const [n, setN] = useState(0);
  const [escolha, setEscolha] = useState<number | null>(null);
  const [acertos, setAcertos] = useState(0);
  const [sequencia, setSequencia] = useState(0);
  const [festa, setFesta] = useState(0);
  const retorno = useRef<HTMLDivElement>(null);
  const titulo = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const fixa = new URLSearchParams(window.location.search).get('ordem') === 'fixa';
    setRodada(montarRodada(termos, 8, fixa ? () => 0.999999 : Math.random));
  }, [termos]);

  useEffect(() => {
    if (escolha !== null) retorno.current?.focus();
    else if (n > 0) titulo.current?.focus();
  }, [escolha, n]);

  if (rodada.length === 0) return <p>Abrindo o dicionário.</p>;

  if (n >= rodada.length) {
    return (
      <div className="faixa faixa--sol grao sobre-claro p-5 md:p-8" data-tela="resultado">
        <p className="rotulo m-0">Resultado</p>
        <h2 ref={titulo} tabIndex={-1} className="mt-2 text-5xl md:text-7xl" data-placar>
          {acertos} de {rodada.length}
        </h2>
        <p className="caneta m-0 mt-3 -rotate-1 text-4xl text-barro-escuro">{vereditoDicionario(acertos, rodada.length)}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className="botao botao-tinta"
            onClick={() => {
              setRodada(montarRodada(termos, 8));
              setN(0);
              setAcertos(0);
              setSequencia(0);
              setEscolha(null);
            }}
          >
            Jogar de novo
          </button>
        </div>
        <Compartilhar
          claro
          arquivo="barruada-dicionario"
          descricao={`Cartão do Dicionário da Barruada: ${acertos} de ${rodada.length} palavras certas.`}
          cartao={{
            fundo: 'sol',
            rotulo: 'Dicionário da Barruada',
            titulo: `Acertei ${acertos} de ${rodada.length} palavras`,
            linhas: rodada.map((p) => `${p.termo}: ${p.opcoes[p.certa]}`),
            caneta: vereditoDicionario(acertos, rodada.length),
          }}
        />
      </div>
    );
  }

  const p = rodada[n];
  const respondeu = escolha !== null;
  const certo = escolha === p.certa;

  function responder(i: number) {
    if (respondeu) return;
    setEscolha(i);
    if (i === p.certa) {
      setAcertos((a) => a + 1);
      setSequencia((s) => s + 1);
      setFesta((f) => f + 1);
    } else setSequencia(0);
  }

  return (
    <div className="relative border border-linha bg-fundo-alto p-5 md:p-8" data-tela="pergunta">
      <Festa vez={festa} />
      <div className="flex items-baseline justify-between gap-3">
        <p className="rotulo m-0 cor-destaque">Palavra {n + 1} de {rodada.length}</p>
        <p className="rotulo m-0" aria-live="polite">{sequencia >= 2 ? `${sequencia} seguidas` : ''}</p>
      </div>
      <h2 ref={titulo} tabIndex={-1} className="mt-4 text-5xl text-sol md:text-7xl" data-termo>
        {p.termo}
      </h2>
      <p className="m-0 mt-2 text-texto-suave">O que quer dizer?</p>

      <ol className="m-0 mt-5 grid list-none gap-2 p-0">
        {p.opcoes.map((op, i) => {
          const eCerta = respondeu && i === p.certa;
          const eErrada = respondeu && i === escolha && !certo;
          return (
            <li key={op}>
              <button
                type="button"
                onClick={() => responder(i)}
                aria-disabled={respondeu}
                data-opcao={i}
                data-certa={i === p.certa ? 'sim' : 'nao'}
                className={`sobre-claro flex min-h-14 w-full items-center gap-3 border p-3 text-left font-bold ${
                  eCerta
                    ? 'border-papel bg-anil text-papel'
                    : eErrada
                      ? 'border-papel bg-barro text-papel'
                      : 'border-nanquim bg-papel text-nanquim'
                }`}
              >
                <span className="font-titulo text-xl font-extrabold">{LETRAS[i]}</span>
                <span>
                  {op}
                  {eCerta && <span className="so-leitor"> (resposta certa)</span>}
                  {eErrada && <span className="so-leitor"> (sua resposta, errada)</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {respondeu && (
        <div ref={retorno} tabIndex={-1} role="status" className="mt-5 border-t border-linha pt-4" data-retorno={certo ? 'certo' : 'errado'}>
          <p className={`rotulo m-0 inline-block px-2 py-1 text-papel ${certo ? 'bg-anil' : 'bg-barro'}`}>{certo ? 'Acertou' : 'Errou'}</p>
          {p.exemplo && <p className="m-0 mt-2 text-lg italic">{p.exemplo}</p>}
          {p.onde && <p className="m-0 mt-1 text-sm text-texto-suave">Onde se ouve: {p.onde}</p>}
          <button
            type="button"
            className="botao botao-sol sobre-claro mt-4"
            onClick={() => {
              setEscolha(null);
              setN((x) => x + 1);
            }}
            data-proxima
          >
            {n + 1 === rodada.length ? 'Ver resultado' : 'Próxima palavra'}
          </button>
        </div>
      )}
    </div>
  );
}
