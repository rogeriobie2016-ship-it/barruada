// Jogo Novela ou Nordeste? Uma afirmação por vez, dois botões, explicação e fonte.
// Funciona com uma mão no celular e só com teclado (Tab e Enter).

import { useEffect, useRef, useState } from 'react';
import { acertou, embaralhar, placar, veredito, type Escolha } from '../lib/quiz.ts';
import { dominio } from '../lib/texto.ts';
import type { QuizItem } from '../lib/types.ts';
import Compartilhar from './Compartilhar.tsx';
import Festa from './Festa.tsx';

export default function Quiz({ itens }: { itens: QuizItem[] }) {
  const [ordem, setOrdem] = useState(itens);
  const [escolhas, setEscolhas] = useState<Escolha[]>([]);
  const [pronto, setPronto] = useState(false);
  const retorno = useRef<HTMLDivElement>(null);
  const pergunta = useRef<HTMLHeadingElement>(null);
  const fim = useRef<HTMLHeadingElement>(null);

  // Embaralha só no navegador. Com ?ordem=fixa a ordem do arquivo é mantida (usado nos testes).
  useEffect(() => {
    const fixa = new URLSearchParams(window.location.search).get('ordem') === 'fixa';
    if (!fixa) setOrdem(embaralhar(itens));
    setPronto(true);
  }, [itens]);

  const [vendoResposta, setVendoResposta] = useState(false);
  const atual = vendoResposta ? escolhas.length - 1 : escolhas.length;
  const acabou = !vendoResposta && escolhas.length === ordem.length;
  const item = ordem[atual];

  useEffect(() => {
    if (!pronto) return;
    if (vendoResposta) retorno.current?.focus();
    else if (acabou) fim.current?.focus();
    else if (escolhas.length > 0) pergunta.current?.focus();
  }, [vendoResposta, acabou, escolhas.length, pronto]);

  function responder(escolha: Escolha) {
    setEscolhas((e) => [...e, escolha]);
    setVendoResposta(true);
  }

  function recomecar() {
    setOrdem(embaralhar(itens));
    setEscolhas([]);
    setVendoResposta(false);
  }

  if (acabou) {
    const { acertos, total } = placar(ordem, escolhas);
    return (
      <div className="border border-linha bg-fundo-alto p-5 md:p-8" data-tela="resultado">
        <p className="rotulo m-0 text-sol">Resultado</p>
        <h2 ref={fim} tabIndex={-1} className="mt-2 text-5xl md:text-7xl" data-placar>
          {acertos} de {total}
        </h2>
        <p className="caneta m-0 mt-3 -rotate-1 text-3xl text-sol md:text-4xl">{veredito(acertos, total)}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" className="botao botao-sol sobre-claro" onClick={recomecar}>
            Jogar de novo
          </button>
        </div>
        <Compartilhar
          arquivo="barruada-novela-ou-nordeste"
          descricao={`Cartão do jogo Novela ou Nordeste?: ${acertos} de ${total} acertos.`}
          cartao={{
            fundo: 'anil',
            rotulo: 'Novela ou Nordeste?',
            titulo: `Fiz ${acertos} de ${total}`,
            linhas: ['Sei separar o Nordeste de verdade da coisa de novela.', 'E você?'],
            caneta: veredito(acertos, total),
          }}
        />
        <h3 className="mt-8 text-xl">O que era o quê</h3>
        <ol className="m-0 mt-3 grid list-none gap-3 p-0">
          {ordem.map((q, i) => (
            <li key={q.afirmacao} className="border-t border-linha pt-3 text-sm">
              <p className="m-0 font-bold">
                <span className={`rotulo mr-2 px-2 py-1 ${acertou(q, escolhas[i]) ? 'bg-anil text-papel' : 'bg-barro text-papel'}`}>
                  {acertou(q, escolhas[i]) ? 'Acertou' : 'Errou'}
                </span>
                {q.afirmacao}
              </p>
              <p className="m-0 mt-1">{q.explicacao}</p>
              {q.fonte && (
                <a href={q.fonte} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-8 items-center text-sol">
                  Fonte: {dominio(q.fonte)}
                  <span className="so-leitor"> (abre em nova aba)</span>
                </a>
              )}
            </li>
          ))}
        </ol>
      </div>
    );
  }

  const certo = vendoResposta && acertou(item, escolhas[atual]);

  return (
    <div className="relative border border-linha bg-fundo-alto p-5 md:p-8" data-tela="pergunta" data-pronto={pronto}>
      <Festa vez={certo ? escolhas.length : 0} />
      <p className="rotulo m-0 text-sol" aria-live="polite">
        Afirmação {atual + 1} de {ordem.length}
      </p>
      <div className="mt-2 h-1 bg-linha" aria-hidden="true">
        <div className="h-1 bg-sol" style={{ width: `${((atual + (vendoResposta ? 1 : 0)) / ordem.length) * 100}%` }} />
      </div>
      <h2 ref={pergunta} tabIndex={-1} className="mt-6 min-h-[5.5rem] text-3xl md:text-5xl" data-afirmacao>
        {item.afirmacao}
      </h2>

      {!vendoResposta && (
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          <button type="button" className="botao botao-anil min-h-16 text-lg" onClick={() => responder('nordeste')} data-resposta="nordeste">
            Nordeste de verdade
          </button>
          <button type="button" className="botao botao-barro min-h-16 text-lg" onClick={() => responder('novela')} data-resposta="novela">
            Coisa de novela
          </button>
        </div>
      )}

      {vendoResposta && (
        <div ref={retorno} tabIndex={-1} className="mt-8 border-t border-linha pt-5" role="status" data-retorno={certo ? 'certo' : 'errado'}>
          <p className={`rotulo m-0 inline-block px-2 py-1 ${certo ? 'bg-anil text-papel' : 'bg-barro text-papel'}`}>
            {certo ? 'Acertou' : 'Errou'}
          </p>
          <p className="m-0 mt-3 text-xl">{item.explicacao}</p>
          {item.fonte && (
            <a href={item.fonte} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center text-sol">
              Fonte: {dominio(item.fonte)}
              <span className="so-leitor"> (abre em nova aba)</span>
            </a>
          )}
          <div className="mt-4">
            <button type="button" className="botao botao-sol sobre-claro" onClick={() => setVendoResposta(false)} data-proxima>
              {escolhas.length === ordem.length ? 'Ver resultado' : 'Próxima'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
