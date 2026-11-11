// Aprendendo inglês com forró (protótipo): ligar a palavra em português com a tradução em inglês.
// Três baralhos: vocabulário do forró, títulos e dicionário. Dá para ouvir a pronúncia em inglês.
// Não há letra de música aqui: só palavras soltas e títulos.

import { useEffect, useMemo, useState } from 'react';
import { ehPar, montarPares, vereditoPares, type Par, type Rodada } from '../lib/pares.ts';
import Compartilhar from './Compartilhar.tsx';
import Festa from './Festa.tsx';

interface Props {
  dados: { aviso: string; vocabulario: Par[]; titulos: Par[]; dicionario: Par[] };
}

const BARALHOS = [
  { id: 'vocabulario', nome: 'Palavras do forró' },
  { id: 'titulos', nome: 'Títulos em inglês' },
  { id: 'dicionario', nome: 'Dicionário em inglês' },
] as const;
type Baralho = (typeof BARALHOS)[number]['id'];

function falar(texto: string) {
  if (!('speechSynthesis' in window)) return;
  const fala = new SpeechSynthesisUtterance(texto);
  fala.lang = 'en-US';
  fala.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(fala);
}

export default function ParesIngles({ dados }: Props) {
  const [baralho, setBaralho] = useState<Baralho>('vocabulario');
  const [rodada, setRodada] = useState<Rodada | null>(null);
  const [pt, setPt] = useState('');
  const [feitos, setFeitos] = useState<string[]>([]);
  const [erros, setErros] = useState(0);
  const [errado, setErrado] = useState('');
  const [aviso, setAviso] = useState('');
  const [festa, setFesta] = useState(0);
  const [temVoz, setTemVoz] = useState(false);

  const lista = dados[baralho];

  useEffect(() => {
    const fixa = new URLSearchParams(window.location.search).get('ordem') === 'fixa';
    setRodada(montarPares(lista, 6, fixa ? () => 0.999999 : Math.random));
    setPt('');
    setFeitos([]);
    setErros(0);
    setAviso('');
    setTemVoz('speechSynthesis' in window);
  }, [lista]);

  const acabou = rodada !== null && feitos.length === rodada.pares.length;
  const traducao = useMemo(() => new Map(rodada?.pares.map((p) => [p.pt, p.en]) ?? []), [rodada]);

  if (!rodada) return <p>Afinando a sanfona.</p>;

  function escolherEn(en: string) {
    if (!rodada || !pt) {
      setAviso('Escolha primeiro a palavra em português.');
      return;
    }
    if (ehPar(rodada.pares, pt, en)) {
      setFeitos((f) => [...f, pt]);
      setAviso(`Isso: ${pt} é ${en}.`);
      setPt('');
      setFesta((f) => f + 1);
      falar(en);
    } else {
      setErros((e) => e + 1);
      setErrado(en);
      setAviso(`Ainda não: ${pt} não é ${en}.`);
      window.setTimeout(() => setErrado(''), 500);
    }
  }

  const feitoEn = new Set(feitos.map((p) => traducao.get(p)));

  return (
    <div className="relative" data-jogo="pares" data-feitos={feitos.length}>
      <Festa vez={festa} />
      <p className="m-0 border border-dashed border-sol p-3 text-sm" data-aviso-prototipo>
        <span className="rotulo mr-2 bg-sol px-2 py-1 text-nanquim">Protótipo</span>
        {dados.aviso}
      </p>

      <div role="group" aria-label="Escolha o baralho" className="mt-4 flex flex-wrap gap-1">
        {BARALHOS.map((b) => (
          <button
            key={b.id}
            type="button"
            aria-pressed={baralho === b.id}
            onClick={() => setBaralho(b.id)}
            data-baralho={b.id}
            className={`min-h-11 border px-3 font-titulo font-bold ${
              baralho === b.id ? 'sobre-claro border-sol bg-sol text-nanquim' : 'border-linha bg-transparent text-texto'
            }`}
          >
            {b.nome}
          </button>
        ))}
      </div>

      {!acabou && (
        <>
          <p className="m-0 mt-4 text-texto-suave">Toque numa palavra em português e depois na tradução em inglês.</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <ul className="m-0 grid list-none gap-2 p-0" aria-label="Português">
              {rodada.esquerda.map((palavra) => {
                const feito = feitos.includes(palavra);
                return (
                  <li key={palavra}>
                    <button
                      type="button"
                      aria-pressed={pt === palavra}
                      aria-disabled={feito}
                      onClick={() => !feito && setPt(palavra)}
                      data-pt={palavra}
                      className={`sobre-claro min-h-14 w-full border p-2 text-left font-titulo font-extrabold tracking-[-0.03em] ${
                        feito
                          ? 'border-papel bg-anil text-papel opacity-70'
                          : pt === palavra
                            ? 'border-nanquim bg-sol text-nanquim'
                            : 'border-nanquim bg-papel text-nanquim'
                      }`}
                    >
                      {palavra}
                    </button>
                  </li>
                );
              })}
            </ul>
            <ul className="m-0 grid list-none gap-2 p-0" aria-label="Inglês" lang="en">
              {rodada.direita.map((palavra) => {
                const feito = feitoEn.has(palavra);
                return (
                  <li key={palavra}>
                    <button
                      type="button"
                      aria-disabled={feito}
                      onClick={() => !feito && escolherEn(palavra)}
                      data-en={palavra}
                      className={`sobre-claro min-h-14 w-full border p-2 text-left font-titulo font-extrabold tracking-[-0.03em] ${
                        feito
                          ? 'border-papel bg-anil text-papel opacity-70'
                          : errado === palavra
                            ? 'border-papel bg-barro text-papel'
                            : 'border-nanquim bg-areia text-nanquim'
                      }`}
                    >
                      {palavra}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}

      <p className="caneta m-0 mt-3 min-h-9 -rotate-1 text-3xl text-sol" role="status" aria-live="polite" data-aviso>
        {aviso}
      </p>

      {acabou && (
        <section className="faixa faixa--sol grao sobre-claro mt-2 p-5 md:p-8" data-tela="resultado">
          <p className="rotulo m-0">Rodada completa</p>
          <h2 className="mt-2 text-4xl md:text-6xl">{vereditoPares(erros)}</h2>
          <p className="m-0 mt-2 font-bold">{erros === 1 ? '1 erro' : `${erros} erros`} no caminho.</p>
          <ul className="m-0 mt-4 grid list-none gap-1 p-0 md:grid-cols-2">
            {rodada.pares.map((p) => (
              <li key={p.pt} className="flex items-center justify-between gap-2 border-t border-nanquim py-1">
                <span>
                  <strong>{p.pt}</strong> = <span lang="en">{p.en}</span>
                </span>
                {temVoz && (
                  <button type="button" className="min-h-11 border border-nanquim bg-transparent px-2 text-sm font-bold" onClick={() => falar(p.en)}>
                    Ouvir<span className="so-leitor"> {p.en}</span>
                  </button>
                )}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="botao botao-tinta mt-4"
            onClick={() => {
              setRodada(montarPares(lista, 6));
              setFeitos([]);
              setErros(0);
              setAviso('');
            }}
            data-de-novo
          >
            Outra rodada
          </button>
          <Compartilhar
            claro
            arquivo="barruada-ingles-com-forro"
            descricao="Cartão com seis pares de palavras em português e inglês."
            cartao={{
              fundo: 'sol',
              rotulo: 'Aprendendo inglês com forró',
              titulo: vereditoPares(erros),
              linhas: rodada.pares.map((p) => `${p.pt} = ${p.en}`),
            }}
          />
        </section>
      )}
    </div>
  );
}
