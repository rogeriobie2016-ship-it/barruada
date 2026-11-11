// Novela ou Nordeste? para projetar em sala: tela cheia, uma afirmação por vez, sem placar individual.
// A turma responde levantando cartão azul ou vermelho. A professora revela a resposta.
// Teclado: seta para a direita avança, seta para a esquerda volta, espaço revela.

import { useEffect, useRef, useState } from 'react';
import { dominio } from '../lib/texto.ts';
import type { QuizItem } from '../lib/types.ts';

export default function Projetor({ itens }: { itens: QuizItem[] }) {
  const [n, setN] = useState(0);
  const [revelado, setRevelado] = useState(false);
  const [cheia, setCheia] = useState(false);
  const palco = useRef<HTMLDivElement>(null);
  const fim = n >= itens.length;
  const item = itens[n];

  useEffect(() => {
    const ouvir = () => setCheia(document.fullscreenElement !== null);
    document.addEventListener('fullscreenchange', ouvir);
    return () => document.removeEventListener('fullscreenchange', ouvir);
  }, []);

  function avancar() {
    if (fim) return;
    if (!revelado) setRevelado(true);
    else {
      setRevelado(false);
      setN((x) => x + 1);
    }
  }

  function voltar() {
    setRevelado(false);
    setN((x) => Math.max(0, x - 1));
  }

  function tecla(e: React.KeyboardEvent) {
    if ((e.target as HTMLElement).tagName === 'BUTTON' && (e.key === ' ' || e.key === 'Enter')) return;
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      avancar();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      voltar();
    }
  }

  async function telaCheia() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await palco.current?.requestFullscreen();
    } catch {
      // Navegador sem tela cheia: o jogo segue na página.
    }
  }

  const verdade = item?.resposta === 'nordeste';

  return (
    <div
      ref={palco}
      onKeyDown={tecla}
      className={`grao flex min-h-[70vh] flex-col justify-between p-5 md:p-10 ${
        fim ? 'faixa faixa--sol sobre-claro' : revelado ? (verdade ? 'faixa faixa--anil' : 'faixa faixa--barro') : 'faixa faixa--noite border border-linha'
      }`}
      data-projetor
      data-revelado={revelado}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="rotulo m-0" aria-live="polite">
          {fim ? 'Fim' : `Afirmação ${n + 1} de ${itens.length}`}
        </p>
        <button type="button" className="botao botao-linha min-h-11 py-1" onClick={telaCheia}>
          {cheia ? 'Sair da tela cheia' : 'Tela cheia'}
        </button>
      </div>

      {fim ? (
        <div className="py-8">
          <h2 className="text-5xl md:text-8xl">Agora é com a turma.</h2>
          <p className="mt-4 max-w-3xl text-2xl md:text-4xl">Cada dupla cria uma afirmação nova sobre a própria cidade e indica onde conferir.</p>
        </div>
      ) : (
        <div className="py-8">
          <h2 className="text-4xl md:text-7xl" data-afirmacao>{item.afirmacao}</h2>
          {!revelado && (
            <p className="mt-6 text-xl md:text-3xl">
              Cartão <span className="bg-anil px-2 text-papel">azul</span>: Nordeste de verdade. Cartão <span className="bg-barro px-2 text-papel">vermelho</span>: coisa de novela.
            </p>
          )}
          {revelado && (
            <div className="mt-6" role="status" data-resposta={item.resposta}>
              <p className="etiqueta etiqueta-sol text-3xl md:text-5xl">{verdade ? 'Nordeste de verdade' : 'Coisa de novela'}</p>
              <p className="mt-5 text-2xl md:text-4xl">{item.explicacao}</p>
              {item.fonte && <p className="mt-3 text-lg md:text-2xl">Fonte: {dominio(item.fonte)}</p>}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="button" className="botao botao-linha" onClick={voltar} disabled={n === 0 && !revelado}>
          Voltar
        </button>
        {!fim && (
          <button type="button" className="botao botao-sol sobre-claro" onClick={avancar} data-avancar>
            {revelado ? (n + 1 === itens.length ? 'Encerrar' : 'Próxima afirmação') : 'Mostrar a resposta'}
          </button>
        )}
        {fim && (
          <button type="button" className="botao botao-tinta" onClick={() => setN(0)}>
            Começar de novo
          </button>
        )}
      </div>
    </div>
  );
}
