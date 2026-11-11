// Bingo do estereótipo: cartela 5x5 sorteada, centro livre, marca com toque ou teclado.
// Setas andam pela cartela. Enter ou espaço marca. Avisa quando fecha linha.

import { useEffect, useRef, useState } from 'react';
import { alternar, cartelaVazia, CENTRO, LADO, linhasFechadas, sortearCartela } from '../lib/bingo.ts';
import Compartilhar from './Compartilhar.tsx';
import Festa from './Festa.tsx';

export default function Bingo({ itens }: { itens: string[] }) {
  const [cartela, setCartela] = useState<string[]>([]);
  const [marcadas, setMarcadas] = useState(cartelaVazia);
  const [aviso, setAviso] = useState('');
  const [festa, setFesta] = useState(0);
  const casas = useRef<(HTMLButtonElement | null)[]>([]);

  // Sorteia só no navegador. Com ?ordem=fixa usa a ordem do arquivo (testes).
  useEffect(() => {
    const fixa = new URLSearchParams(window.location.search).get('ordem') === 'fixa';
    setCartela(sortearCartela(itens, fixa ? () => 0.999999 : Math.random));
  }, [itens]);

  const fechadas = linhasFechadas(marcadas);
  const naLinha = new Set(fechadas.flat());
  const total = marcadas.filter(Boolean).length - 1;

  function marcar(i: number) {
    const depois = alternar(marcadas, i);
    const antes = linhasFechadas(marcadas).length;
    const agora = linhasFechadas(depois).length;
    setMarcadas(depois);
    if (agora > antes) {
      setAviso(agora === 1 ? 'Bingo! Fechou uma linha.' : `Bingo de novo! ${agora} linhas fechadas.`);
      setFesta((n) => n + 1);
    } else if (agora < antes) setAviso('Linha desfeita.');
  }

  function tecla(e: React.KeyboardEvent, i: number) {
    const passos: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: LADO, ArrowUp: -LADO };
    const passo = passos[e.key];
    if (!passo) return;
    const alvo = i + passo;
    const mesmaLinha = Math.abs(passo) !== 1 || Math.floor(alvo / LADO) === Math.floor(i / LADO);
    if (alvo < 0 || alvo >= LADO * LADO || !mesmaLinha) return;
    e.preventDefault();
    casas.current[alvo]?.focus();
  }

  function novaCartela() {
    setCartela(sortearCartela(itens));
    setMarcadas(cartelaVazia());
    setAviso('Cartela nova sorteada.');
  }

  if (cartela.length === 0) return <p>Sorteando a cartela.</p>;

  return (
    <div className="relative" data-jogo="bingo" data-linhas={fechadas.length}>
      <Festa vez={festa} />
      <p className="m-0 text-sm text-texto-suave" id="bingo-ajuda">
        Toque para marcar o que aparecer na tela. No teclado: setas andam, Enter marca.
      </p>
      <div
        className="mt-3 grid grid-cols-5 gap-1"
        role="group"
        aria-label="Cartela do bingo"
        aria-describedby="bingo-ajuda"
      >
        {cartela.map((texto, i) => {
          const marcada = marcadas[i];
          const livre = i === CENTRO;
          return (
            <button
              key={`${i}-${texto}`}
              ref={(el) => {
                casas.current[i] = el;
              }}
              type="button"
              aria-pressed={marcada}
              aria-disabled={livre}
              onClick={() => marcar(i)}
              onKeyDown={(e) => tecla(e, i)}
              data-casa={i}
              lang="pt-BR"
              className={`sobre-claro flex aspect-square items-center justify-center border p-1 text-center font-titulo text-[0.56rem] font-bold leading-[1.05] hyphens-auto transition-transform md:text-sm ${
                marcada
                  ? naLinha.has(i)
                    ? 'scale-95 border-nanquim bg-sol text-nanquim'
                    : 'border-papel bg-barro text-papel'
                  : 'border-nanquim bg-papel text-nanquim'
              }`}
            >
              <span>
                {texto}
                <span className="so-leitor">{livre ? ' (casa livre)' : marcada ? ' (marcado)' : ''}</span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="caneta m-0 mt-3 min-h-10 -rotate-1 text-3xl text-sol" role="status" aria-live="assertive" data-aviso>
        {aviso}
      </p>
      <p className="m-0 text-lg font-bold" data-contagem>
        {total} de 24 marcados · {fechadas.length} {fechadas.length === 1 ? 'linha' : 'linhas'}
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className="botao botao-linha" onClick={novaCartela} data-nova>
          Sortear outra cartela
        </button>
      </div>

      <Compartilhar
        arquivo="barruada-bingo"
        descricao={`Cartela do Bingo do estereótipo com ${total} casas marcadas e ${fechadas.length} linhas fechadas.`}
        cartao={{
          fundo: 'barro',
          rotulo: 'Bingo do estereótipo',
          titulo: fechadas.length > 0 ? `Bingo! ${total} de 24 clichês` : `${total} de 24 clichês`,
          grade: cartela.map((texto, i) => ({ texto, marcada: marcadas[i] })),
        }}
      />
    </div>
  );
}
