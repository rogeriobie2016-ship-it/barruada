// Feed de vídeos: um por tela, rolando na vertical, com curtir.
// O tocador da plataforma só carrega depois do toque (mais leve e sem rastreio antes da hora).
// As curtidas ficam salvas só neste aparelho.

import { useEffect, useRef, useState } from 'react';
import { Capa } from '../components/marca/Capa.tsx';
import { nomeDoLugar } from '../lib/biblioteca.ts';
import { slug } from '../lib/texto.ts';
import { tocadorDe, type Video } from '../lib/videos.ts';

const CHAVE = 'barruada-videos-curtidos';
const CORES = ['anil', 'barro', 'nanquim', 'sol'] as const;

export default function FeedVideos({ videos }: { videos: Video[] }) {
  const [tocando, setTocando] = useState('');
  const [curtidos, setCurtidos] = useState<string[]>([]);
  const [filtro, setFiltro] = useState<'todos' | 'coletivo' | 'referencia' | 'curtidos'>('todos');
  const [aviso, setAviso] = useState('');
  const feed = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setCurtidos(JSON.parse(window.localStorage.getItem(CHAVE) ?? '[]'));
    } catch {
      setCurtidos([]);
    }
  }, []);

  function curtir(id: string, titulo: string) {
    setCurtidos((antes) => {
      const depois = antes.includes(id) ? antes.filter((x) => x !== id) : [...antes, id];
      try {
        window.localStorage.setItem(CHAVE, JSON.stringify(depois));
      } catch {
        // Sem armazenamento local: a curtida vale só até fechar a página.
      }
      setAviso(depois.includes(id) ? `Curtiu: ${titulo}.` : `Tirou a curtida de: ${titulo}.`);
      return depois;
    });
  }

  function rolar(passo: number) {
    const el = feed.current;
    if (!el) return;
    el.scrollBy({ top: passo * el.clientHeight, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  const visiveis = videos.filter((v) => {
    if (filtro === 'curtidos') return curtidos.includes(slug(v.url));
    if (filtro === 'todos') return true;
    return v.origem === filtro;
  });

  const filtros = [
    ['todos', 'Tudo'],
    ['coletivo', 'Do coletivo'],
    ['referencia', 'Referências'],
    ['curtidos', `Curtidos (${curtidos.length})`],
  ] as const;

  return (
    <div data-feed>
      <div role="group" aria-label="Filtrar vídeos" className="flex flex-wrap gap-1">
        {filtros.map(([id, nome]) => (
          <button
            key={id}
            type="button"
            aria-pressed={filtro === id}
            onClick={() => setFiltro(id)}
            data-filtro={id}
            className={`min-h-11 border px-3 font-titulo font-bold ${filtro === id ? 'sobre-claro border-sol bg-sol text-nanquim' : 'border-linha bg-transparent text-texto'}`}
          >
            {nome}
          </button>
        ))}
      </div>
      <p className="so-leitor" role="status" aria-live="polite">{aviso}</p>

      {visiveis.length === 0 ? (
        <p className="mt-6 text-lg" data-feed-vazio>
          {filtro === 'curtidos' ? 'Você ainda não curtiu nenhum vídeo.' : 'Nenhum vídeo por aqui ainda.'}
        </p>
      ) : (
        <div className="relative mt-4">
          <div
            ref={feed}
            tabIndex={0}
            aria-label="Feed de vídeos: role para ver o próximo"
            className="feed-videos"
          >
            {visiveis.map((v, n) => {
              const id = slug(v.url);
              const tocador = tocadorDe(v.url)!;
              const curtido = curtidos.includes(id);
              return (
                <article key={id} className="feed-video faixa faixa--nanquim grao" aria-label={v.titulo} data-video={id}>
                  <div className={`feed-tela ${tocador.vertical ? 'feed-tela-vertical' : ''}`}>
                    {tocando === id ? (
                      <iframe
                        src={tocador.embed}
                        title={v.titulo}
                        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="strict-origin-when-cross-origin"
                        className="h-full w-full border-0"
                      />
                    ) : (
                      <button type="button" className="feed-capa" onClick={() => setTocando(id)} data-tocar>
                        <Capa titulo={v.titulo} rotulo={v.origem === 'coletivo' ? 'Do coletivo' : 'Referência'} esquema={CORES[n % 4]} arte="predio" larga={!tocador.vertical} />
                        <span className="etiqueta etiqueta-sol feed-tocar">Tocar no {tocador.plataforma === 'youtube' ? 'YouTube' : 'Instagram'}</span>
                      </button>
                    )}
                  </div>
                  <div className="feed-texto">
                    <h3 className="text-2xl md:text-3xl">{v.titulo}</h3>
                    <p className="m-0 mt-1 text-sm text-texto-suave">{[v.autoria, v.uf ? nomeDoLugar(v.uf) : ''].filter(Boolean).join(' · ')}</p>
                    {v.por_que && <p className="m-0 mt-2">{v.por_que}</p>}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        aria-pressed={curtido}
                        onClick={() => curtir(id, v.titulo)}
                        data-curtir
                        className={`botao min-h-11 py-2 ${curtido ? 'botao-barro' : 'botao-linha'}`}
                      >
                        {curtido ? 'Curtido' : 'Curtir'}
                      </button>
                      <a href={v.url} target="_blank" rel="noopener noreferrer" className="botao botao-linha min-h-11 py-2">
                        Abrir no {tocador.plataforma === 'youtube' ? 'YouTube' : 'Instagram'}<span className="so-leitor"> (abre em nova aba)</span>
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="mt-3 flex gap-2">
            <button type="button" className="botao botao-linha" onClick={() => rolar(-1)} data-anterior>Vídeo anterior</button>
            <button type="button" className="botao botao-sol sobre-claro" onClick={() => rolar(1)} data-proximo>Próximo vídeo</button>
          </div>
        </div>
      )}
    </div>
  );
}
