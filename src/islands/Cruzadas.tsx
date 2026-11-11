// Palavras cruzadas. A grade é montada no navegador a partir das respostas e dicas.
// Teclado: letras escrevem e avançam, setas andam, Backspace apaga e volta, Espaço troca a direção.

import { useEffect, useMemo, useRef, useState } from 'react';
import { casasDa, conferir, montarGrade, type Colocada, type Entrada, type Grade } from '../lib/cruzadas.ts';
import Compartilhar from './Compartilhar.tsx';
import Festa from './Festa.tsx';

interface Props {
  entradas: Entrada[];
  lado: number;
  quantas: number;
  nome: string; // nome do jogo, para o cartão
  arquivo: string;
}

// Sorteio com semente, para os testes terem sempre a mesma grade.
function comSemente(semente: number) {
  let s = semente;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export default function Cruzadas({ entradas, lado, quantas, nome, arquivo }: Props) {
  const [grade, setGrade] = useState<Grade | null>(null);
  const [escrito, setEscrito] = useState<string[][]>([]);
  const [ativa, setAtiva] = useState<Colocada | null>(null);
  const [erradas, setErradas] = useState<Set<string>>(new Set());
  const [aviso, setAviso] = useState('');
  const [festa, setFesta] = useState(0);
  const [pronta, setPronta] = useState(false);
  const casas = useRef(new Map<string, HTMLInputElement>());
  // Palavra escolhida pela dica: vale mais que a escolha automática ao entrar na casa.
  const pedida = useRef<Colocada | null>(null);

  function nova(sorteio: () => number) {
    const g = montarGrade(entradas, lado, quantas, sorteio);
    setGrade(g);
    setEscrito(g.letras.map((linha) => linha.map(() => '')));
    setAtiva(g.palavras[0] ?? null);
    setErradas(new Set());
    setAviso('');
    setPronta(false);
  }

  useEffect(() => {
    const fixa = new URLSearchParams(window.location.search).get('ordem') === 'fixa';
    nova(fixa ? comSemente(7) : Math.random);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entradas, lado, quantas]);

  const numeros = useMemo(() => {
    const m = new Map<string, number>();
    grade?.palavras.forEach((p) => m.set(`${p.linha},${p.coluna}`, p.numero));
    return m;
  }, [grade]);

  if (!grade) return <p>Montando a grade.</p>;

  const naAtiva = new Set(ativa ? casasDa(ativa).map(([l, c]) => `${l},${c}`) : []);
  const palavrasDa = (l: number, c: number) => grade.palavras.filter((p) => casasDa(p).some(([pl, pc]) => pl === l && pc === c));
  const focar = (l: number, c: number) => casas.current.get(`${l},${c}`)?.focus();

  function entrar(l: number, c: number) {
    const opcoes = palavrasDa(l, c);
    if (pedida.current && opcoes.includes(pedida.current)) {
      setAtiva(pedida.current);
      pedida.current = null;
      return;
    }
    pedida.current = null;
    if (!ativa || !opcoes.includes(ativa)) setAtiva(opcoes[0] ?? null);
  }

  function andar(l: number, c: number, dl: number, dc: number) {
    let nl = l + dl;
    let nc = c + dc;
    while (nl >= 0 && nl < grade!.linhas && nc >= 0 && nc < grade!.colunas) {
      if (grade!.letras[nl][nc] !== null) {
        focar(nl, nc);
        return;
      }
      nl += dl;
      nc += dc;
    }
  }

  function escrever(l: number, c: number, valor: string) {
    const letra = valor.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z]/g, '').slice(-1);
    setEscrito((antes) => antes.map((linha, i) => (i === l ? linha.map((x, j) => (j === c ? letra : x)) : linha)));
    setErradas((antes) => {
      const depois = new Set(antes);
      depois.delete(`${l},${c}`);
      return depois;
    });
    if (letra && ativa) {
      const trilha = casasDa(ativa);
      const pos = trilha.findIndex(([pl, pc]) => pl === l && pc === c);
      if (pos >= 0 && pos < trilha.length - 1) focar(trilha[pos + 1][0], trilha[pos + 1][1]);
    }
  }

  function tecla(e: React.KeyboardEvent<HTMLInputElement>, l: number, c: number) {
    const setas: Record<string, [number, number]> = { ArrowRight: [0, 1], ArrowLeft: [0, -1], ArrowDown: [1, 0], ArrowUp: [-1, 0] };
    if (setas[e.key]) {
      e.preventDefault();
      andar(l, c, setas[e.key][0], setas[e.key][1]);
    } else if (e.key === ' ') {
      e.preventDefault();
      const opcoes = palavrasDa(l, c);
      if (opcoes.length > 1) setAtiva(opcoes.find((p) => p !== ativa) ?? opcoes[0]);
    } else if (e.key === 'Backspace' && escrito[l][c] === '' && ativa) {
      const trilha = casasDa(ativa);
      const pos = trilha.findIndex(([pl, pc]) => pl === l && pc === c);
      if (pos > 0) {
        e.preventDefault();
        escrever(trilha[pos - 1][0], trilha[pos - 1][1], '');
        focar(trilha[pos - 1][0], trilha[pos - 1][1]);
      }
    }
  }

  function verificar() {
    const r = conferir(grade!, escrito);
    const novas = new Set<string>();
    grade!.letras.forEach((linha, l) => linha.forEach((letra, c) => {
      if (letra !== null && escrito[l][c] !== '' && escrito[l][c] !== letra) novas.add(`${l},${c}`);
    }));
    setErradas(novas);
    if (r.completa) {
      setPronta(true);
      setFesta((f) => f + 1);
      setAviso('Fechou a grade inteira!');
    } else if (novas.size > 0) setAviso(`${novas.size === 1 ? '1 letra errada' : `${novas.size} letras erradas`}, marcada em vermelho.`);
    else setAviso(`Até aqui tudo certo: ${r.certas} de ${r.total} letras.`);
  }

  function revelar() {
    if (!ativa) return;
    const trilha = casasDa(ativa);
    setEscrito((antes) => antes.map((linha, l) => linha.map((x, c) => {
      const pos = trilha.findIndex(([pl, pc]) => pl === l && pc === c);
      return pos >= 0 ? ativa.resposta[pos] : x;
    })));
    setAviso(`Revelada: ${ativa.resposta}.`);
  }

  const lista = (dir: 'h' | 'v', titulo: string) => (
    <div>
      <h3 className="text-xl">{titulo}</h3>
      <ol className="m-0 mt-2 grid list-none gap-1 p-0">
        {grade.palavras.filter((p) => p.dir === dir).map((p) => (
          <li key={`${p.numero}${p.dir}`}>
            <button
              type="button"
              onClick={() => {
                pedida.current = p;
                setAtiva(p);
                focar(p.linha, p.coluna);
              }}
              aria-pressed={ativa === p}
              data-dica={`${p.numero}${p.dir}`}
              className={`w-full border-0 p-2 text-left ${ativa === p ? 'sobre-claro bg-sol text-nanquim' : 'bg-transparent text-texto'}`}
            >
              <strong>{p.numero}.</strong> {p.dica} <span className="text-sm opacity-80">({p.resposta.length} letras)</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );

  return (
    <div className="relative" data-jogo="cruzadas" data-palavras={grade.palavras.length} data-completa={pronta}>
      <Festa vez={festa} />
      <p className="m-0 text-sm text-texto-suave" id="cruzadas-ajuda">
        Toque numa casa ou numa dica e escreva. No teclado: setas andam, Espaço troca entre horizontal e vertical.
      </p>

      <p className="sobre-claro m-0 mt-3 min-h-14 bg-papel p-3 font-bold text-nanquim" role="status" aria-live="polite" data-dica-ativa>
        {ativa ? `${ativa.numero} ${ativa.dir === 'h' ? 'horizontal' : 'vertical'}: ${ativa.dica}` : 'Escolha uma casa.'}
      </p>

      <div className="mt-3 overflow-x-auto">
        <div
          role="group"
          aria-label={`Grade de palavras cruzadas, ${grade.linhas} linhas por ${grade.colunas} colunas`}
          aria-describedby="cruzadas-ajuda"
          className="mx-auto grid w-full gap-px"
          style={{ gridTemplateColumns: `repeat(${grade.colunas}, minmax(0, 1fr))`, maxWidth: `${grade.colunas * 2.75}rem` }}
        >
          {grade.letras.flatMap((linha, l) =>
            linha.map((letra, c) => {
              const k = `${l},${c}`;
              if (letra === null) return <span key={k} className="aspect-square" aria-hidden="true" />;
              const donas = palavrasDa(l, c);
              return (
                <span key={k} className="relative aspect-square">
                  {numeros.has(k) && (
                    <span className="pointer-events-none absolute left-0.5 top-0 z-10 text-[0.55rem] font-bold leading-tight text-nanquim" aria-hidden="true">
                      {numeros.get(k)}
                    </span>
                  )}
                  <input
                    ref={(el) => {
                      if (el) casas.current.set(k, el);
                      else casas.current.delete(k);
                    }}
                    type="text"
                    inputMode="text"
                    autoCapitalize="characters"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    maxLength={2}
                    value={escrito[l]?.[c] ?? ''}
                    onChange={(e) => escrever(l, c, e.target.value)}
                    onFocus={() => entrar(l, c)}
                    onKeyDown={(e) => tecla(e, l, c)}
                    aria-label={`Linha ${l + 1}, coluna ${c + 1}. ${donas.map((p) => `${p.numero} ${p.dir === 'h' ? 'horizontal' : 'vertical'}: ${p.dica}`).join(' ')}`}
                    aria-invalid={erradas.has(k)}
                    data-casa={k}
                    className={`sobre-claro h-full w-full border p-0 text-center font-titulo text-base font-extrabold uppercase md:text-xl ${
                      erradas.has(k)
                        ? 'border-papel bg-barro text-papel'
                        : naAtiva.has(k)
                          ? 'border-nanquim bg-sol text-nanquim'
                          : 'border-nanquim bg-papel text-nanquim'
                    }`}
                  />
                </span>
              );
            }),
          )}
        </div>
      </div>

      <p className="caneta m-0 mt-3 min-h-9 -rotate-1 text-3xl text-sol" role="status" aria-live="polite" data-aviso>
        {aviso}
      </p>

      <div className="mt-2 flex flex-wrap gap-3">
        <button type="button" className="botao botao-sol sobre-claro" onClick={verificar} data-conferir>
          Conferir
        </button>
        <button type="button" className="botao botao-linha" onClick={revelar} data-revelar>
          Revelar a palavra
        </button>
        <button type="button" className="botao botao-linha" onClick={() => nova(Math.random)} data-nova>
          Outra grade
        </button>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {lista('h', 'Horizontais')}
        {lista('v', 'Verticais')}
      </div>

      {pronta && (
        <Compartilhar
          arquivo={arquivo}
          descricao={`Cartão do jogo ${nome}: grade completa com ${grade.palavras.length} palavras.`}
          cartao={{
            fundo: 'anil',
            rotulo: nome,
            titulo: `Fechei a grade: ${grade.palavras.length} palavras`,
            linhas: grade.palavras.map((p) => p.resposta),
            caneta: 'Sem olhar a resposta. Quase.',
          }}
        />
      )}
    </div>
  );
}
