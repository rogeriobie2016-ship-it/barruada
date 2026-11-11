// A jornada desmontada em modo história: doze cenas, duas escolhas por cena.
// No fim: caiu no estereótipo da TV ou contou o Nordeste de verdade?
// Tem trilha de navegação (dá para voltar e trocar uma escolha) e funciona só com teclado.

import { useEffect, useRef, useState } from 'react';
import { Ilustra } from '../components/marca/Ilustra.tsx';
import { montarPassos, veredito, type Passo, type Tipo } from '../lib/jornada.ts';
import type { EtapaJornada } from '../lib/types.ts';
import Compartilhar from './Compartilhar.tsx';
import Festa from './Festa.tsx';
import Jornada from './Jornada.tsx';

// Uma ilustração e um tom por cena, para a história andar de cor em cor.
const CENARIO = [
  { arte: 'casa', tom: 'papel' }, { arte: 'sol', tom: 'sol' }, { arte: 'cadeira', tom: 'areia' }, { arte: 'livro', tom: 'anil' },
  { arte: 'jangada', tom: 'barro' }, { arte: 'predio', tom: 'nanquim' }, { arte: 'lua', tom: 'anil' }, { arte: 'filtro', tom: 'barro' },
  { arte: 'estrela', tom: 'sol' }, { arte: 'coqueiro', tom: 'papel' }, { arte: 'catavento', tom: 'areia' }, { arte: 'garrafa', tom: 'anil' },
] as const;
const CLARO = ['papel', 'areia', 'sol'];

export default function JornadaNarrativa({ etapas }: { etapas: EtapaJornada[] }) {
  const [modo, setModo] = useState<'historia' | 'cartas'>('historia');
  const [passos, setPassos] = useState<Passo[]>([]);
  const [escolhas, setEscolhas] = useState<(Tipo | null)[]>([]);
  const [cena, setCena] = useState(0);
  const [festa, setFesta] = useState(0);
  const titulo = useRef<HTMLHeadingElement>(null);
  const mexeu = useRef(false);

  function comecar(sorteio: () => number) {
    setPassos(montarPassos(etapas, sorteio));
    setEscolhas(etapas.map(() => null));
    setCena(0);
  }

  useEffect(() => {
    const busca = new URLSearchParams(window.location.search);
    if (busca.get('modo') === 'cartas') setModo('cartas');
    comecar(busca.get('ordem') === 'fixa' ? () => 0.999999 : Math.random);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etapas]);

  useEffect(() => {
    if (mexeu.current) titulo.current?.focus();
  }, [cena]);

  const fim = cena >= passos.length && passos.length > 0;
  const feitas = escolhas.filter((e) => e !== null).length;
  const resultado = fim ? veredito(escolhas as Tipo[]) : null;

  useEffect(() => {
    if (resultado && resultado.lado === 'verdade') setFesta((f) => f + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fim]);

  function escolher(tipo: Tipo) {
    mexeu.current = true;
    setEscolhas((antes) => antes.map((x, i) => (i === cena ? tipo : x)));
    setCena((c) => c + 1);
  }

  function irPara(i: number) {
    mexeu.current = true;
    setCena(i);
  }

  const abas = (
    <div role="group" aria-label="Jeito de jogar" className="mb-5 flex flex-wrap gap-1">
      {([['historia', 'Jogar a história'], ['cartas', 'Ver as doze cartas']] as const).map(([id, nome]) => (
        <button
          key={id}
          type="button"
          aria-pressed={modo === id}
          onClick={() => setModo(id)}
          data-modo={id}
          className={`min-h-11 border px-3 font-titulo font-bold ${modo === id ? 'sobre-claro border-sol bg-sol text-nanquim' : 'border-linha bg-transparent text-texto'}`}
        >
          {nome}
        </button>
      ))}
    </div>
  );

  if (modo === 'cartas') {
    return (
      <div>
        {abas}
        <Jornada etapas={etapas} />
      </div>
    );
  }

  if (passos.length === 0) return <p>Abrindo o roteiro.</p>;

  const trilha = (
    <nav aria-label="Cenas da história" className="mt-4">
      <ol className="m-0 flex list-none flex-wrap gap-1 p-0">
        {passos.map((p, i) => {
          const feita = escolhas[i] !== null;
          const aqui = i === cena;
          return (
            <li key={p.etapa}>
              <button
                type="button"
                onClick={() => irPara(i)}
                disabled={!feita && !aqui}
                aria-current={aqui ? 'step' : undefined}
                aria-label={`Cena ${i + 1}: ${p.etapa}${feita ? ', já escolhida' : ''}`}
                data-cena-atalho={i}
                className={`h-9 w-9 border font-titulo text-sm font-extrabold ${
                  aqui ? 'sobre-claro border-sol bg-sol text-nanquim' : feita ? 'sobre-claro border-papel bg-papel text-nanquim' : 'border-linha bg-transparent text-texto opacity-60'
                }`}
              >
                {i + 1}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );

  if (resultado) {
    const tom = resultado.lado === 'tv' ? 'barro' : resultado.lado === 'verdade' ? 'anil' : 'sol';
    return (
      <div>
        {abas}
        <section className={`faixa grao relative overflow-hidden p-5 md:p-8 faixa--${tom}${tom === 'sol' ? ' sobre-claro' : ''}`} data-tela="veredito" data-lado={resultado.lado}>
          <Festa vez={festa} />
          <Ilustra nome={resultado.lado === 'tv' ? 'filtro' : 'sol'} className="solta right-[-1rem] top-4 w-28 rotate-6 md:w-44" />
          <p className="etiqueta m-0 text-sm">Resultado</p>
          <h2 ref={titulo} tabIndex={-1} className="relative mt-4 max-w-[14ch] text-4xl md:text-6xl" data-veredito>
            {resultado.titulo}
          </h2>
          <p className="relative mt-3 max-w-xl text-lg">{resultado.texto}</p>
          <p className="relative m-0 mt-2 text-2xl font-extrabold" data-contagem>
            {resultado.cliches} de {resultado.total} cenas com clichê de televisão
          </p>
          <div className="relative mt-5 flex flex-wrap gap-3">
            <button type="button" className={`botao ${tom === 'sol' ? 'botao-tinta' : 'botao-sol sobre-claro'}`} onClick={() => comecar(Math.random)} data-de-novo>
              Escrever outra história
            </button>
            <button type="button" className={`botao ${tom === 'sol' ? 'border-nanquim' : 'botao-linha'}`} onClick={() => irPara(0)}>
              Rever as escolhas
            </button>
          </div>
          <div className="relative">
            <Compartilhar
              claro={tom === 'sol'}
              arquivo="barruada-minha-jornada"
              descricao={`Cartão da jornada: ${resultado.titulo}, com ${resultado.cliches} de ${resultado.total} cenas com clichê.`}
              cartao={{
                fundo: tom,
                rotulo: 'A jornada desmontada',
                titulo: resultado.titulo,
                linhas: [`${resultado.cliches} de ${resultado.total} cenas com clichê de televisão.`, 'Escreva a sua e veja de que lado você cai.'],
              }}
            />
          </div>
        </section>

        <section className="faixa faixa--papel grao sobre-claro mt-6 p-5 md:p-8" aria-labelledby="titulo-historia" data-tela="historia-escrita">
          <h3 id="titulo-historia" className="text-3xl">A história que você escreveu</h3>
          <ol className="m-0 mt-4 grid list-none gap-3 p-0">
            {passos.map((p, i) => {
              const escolha = escolhas[i];
              const cliche = p.opcoes.find((o) => o.tipo === 'cliche')!.texto;
              const troca = p.opcoes.find((o) => o.tipo === 'troca')!.texto;
              return (
                <li key={p.etapa} className="border-t border-nanquim pt-3" data-cena-final={escolha}>
                  <span className="rotulo block cor-destaque">{i + 1}. {p.etapa}</span>
                  {escolha === 'cliche' ? (
                    <>
                      <span className="riscado text-lg">{cliche}</span>
                      <span className="caneta block text-2xl text-barro">{troca.split(/\s+/).length <= 12 ? troca : 'a caneta trocou:'}</span>
                      {troca.split(/\s+/).length > 12 && <span className="block text-lg font-bold">{troca}</span>}
                    </>
                  ) : (
                    <span className="text-lg font-bold">{troca}</span>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    );
  }

  const passo = passos[cena];
  const cenario = CENARIO[cena % CENARIO.length];
  const claro = CLARO.includes(cenario.tom);

  return (
    <div data-jogo="jornada-narrativa" data-cena={cena}>
      {abas}
      <section className={`faixa grao relative overflow-hidden p-5 md:p-8 faixa--${cenario.tom}${claro ? ' sobre-claro' : ''}`} data-tela="cena">
        <Ilustra nome={cenario.arte} className="solta right-[-1.5rem] top-3 w-32 rotate-6 md:right-6 md:w-52" />
        <p className="relative m-0 text-sm font-bold" aria-live="polite">
          Cena {cena + 1} de {passos.length} · {feitas} escolhidas
        </p>
        <div className="relative mt-2 h-2 max-w-md border border-current" aria-hidden="true">
          <div className="h-full bg-current transition-[width]" style={{ width: `${(cena / passos.length) * 100}%` }} />
        </div>
        <h2 ref={titulo} tabIndex={-1} className="relative mt-6 max-w-[12ch] text-4xl md:text-6xl" data-etapa>
          {passo.etapa}
        </h2>
        <p className="relative mt-3 max-w-md text-lg">O que acontece na sua história?</p>

        <div className="relative mt-6 grid gap-3 md:grid-cols-2">
          {passo.opcoes.map((o, i) => (
            <button
              key={o.texto}
              type="button"
              onClick={() => escolher(o.tipo)}
              data-opcao={i}
              aria-pressed={escolhas[cena] === o.tipo}
              className={`sobre-claro min-h-28 border-2 p-4 text-left font-titulo text-xl font-extrabold leading-tight tracking-[-0.03em] transition-transform hover:-translate-y-1 ${
                escolhas[cena] === o.tipo ? 'border-nanquim bg-sol text-nanquim' : 'border-nanquim bg-papel text-nanquim'
              }`}
            >
              <span className="rotulo mb-2 block">Caminho {i === 0 ? 'A' : 'B'}</span>
              {o.texto}
            </button>
          ))}
        </div>

        <div className="relative mt-5 flex flex-wrap gap-3">
          <button type="button" className={`botao ${claro ? 'border-nanquim' : 'botao-linha'}`} onClick={() => irPara(cena - 1)} disabled={cena === 0} data-voltar>
            Cena anterior
          </button>
          {feitas === passos.length && (
            <button type="button" className={`botao ${claro ? 'botao-tinta' : 'botao-sol sobre-claro'}`} onClick={() => irPara(passos.length)} data-ver-resultado>
              Ver o resultado
            </button>
          )}
        </div>
      </section>
      {trilha}
    </div>
  );
}
