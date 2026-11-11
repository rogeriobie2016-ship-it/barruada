// A jornada desmontada: as doze etapas da jornada do herói.
// Cada carta mostra o clichê do "herói sertanejo". Ao tocar, vira e mostra a versão do Nordeste de hoje.

import { useEffect, useRef, useState } from 'react';
import type { EtapaJornada } from '../lib/types.ts';
import Compartilhar from './Compartilhar.tsx';
import Festa from './Festa.tsx';

export default function Jornada({ etapas }: { etapas: EtapaJornada[] }) {
  const [viradas, setViradas] = useState<boolean[]>(() => etapas.map(() => false));
  const [festa, setFesta] = useState(0);
  const fim = useRef<HTMLHeadingElement>(null);
  const quantas = viradas.filter(Boolean).length;
  const completa = quantas === etapas.length;

  useEffect(() => {
    if (completa) {
      setFesta((f) => f + 1);
      fim.current?.focus();
    }
  }, [completa]);

  function virar(i: number) {
    setViradas((v) => v.map((x, n) => (n === i ? !x : x)));
  }

  return (
    <div className="relative" data-jogo="jornada" data-viradas={quantas}>
      <Festa vez={festa} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="m-0 text-lg font-bold" role="status" aria-live="polite">
          {quantas} de {etapas.length} etapas reescritas
        </p>
        <button type="button" className="botao botao-linha" onClick={() => setViradas(etapas.map(() => true))} data-virar-todas>
          Virar todas
        </button>
      </div>
      <div className="mt-2 h-2 border border-papel" aria-hidden="true">
        <div className="h-full bg-sol transition-[width]" style={{ width: `${(quantas / etapas.length) * 100}%` }} />
      </div>

      <ol className="m-0 mt-5 grid list-none gap-3 p-0 md:grid-cols-3">
        {etapas.map((e, i) => (
          <li key={e.etapa}>
            <button type="button" className="carta" aria-pressed={viradas[i]} onClick={() => virar(i)} data-carta={i}>
              <span className="carta-miolo">
                <span className="carta-face grao faixa faixa--barro" aria-hidden={viradas[i]}>
                  <span className="rotulo">{i + 1}. {e.etapa}</span>
                  <span className="font-titulo text-xl font-extrabold tracking-[-0.04em]">{e.cliche}</span>
                  <span className="rotulo">Na novela · toque para virar</span>
                </span>
                <span className="carta-face carta-verso grao faixa faixa--anil" aria-hidden={!viradas[i]}>
                  <span className="rotulo">{i + 1}. {e.etapa}</span>
                  <span className="font-titulo text-xl font-extrabold tracking-[-0.04em]">{e.troca}</span>
                  <span className="rotulo text-sol">No Nordeste de hoje</span>
                </span>
              </span>
            </button>
          </li>
        ))}
      </ol>

      {completa && (
        <section className="faixa faixa--papel grao sobre-claro mt-8 p-5 md:p-8" data-tela="historia">
          <p className="rotulo m-0 cor-destaque">A história inteira, reescrita</p>
          <h2 ref={fim} tabIndex={-1} className="mt-2 text-4xl md:text-5xl">A jornada de quem vive aqui</h2>
          <ol className="m-0 mt-5 grid list-none gap-2 p-0 md:grid-cols-2 md:gap-x-8">
            {etapas.map((e, i) => (
              <li key={e.etapa} className="border-t border-nanquim pt-2">
                <span className="rotulo block cor-destaque">{i + 1}. {e.etapa}</span>
                {e.troca}
              </li>
            ))}
          </ol>
          <div className="mt-4">
            <button type="button" className="botao border-nanquim" onClick={() => setViradas(etapas.map(() => false))}>
              Desvirar e recomeçar
            </button>
          </div>
          <Compartilhar
            claro
            arquivo="barruada-jornada"
            descricao="Cartão com as doze etapas da jornada do herói reescritas para o Nordeste de hoje."
            cartao={{
              fundo: 'anil',
              rotulo: 'A jornada desmontada',
              titulo: 'A jornada de quem vive aqui',
              linhas: etapas.map((e, i) => `${i + 1}. ${e.troca}`),
            }}
          />
        </section>
      )}
    </div>
  );
}
