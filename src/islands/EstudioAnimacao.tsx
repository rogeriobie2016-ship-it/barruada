// Estúdio de animação: monta uma peça animada do zero ou a partir de uma base.
// Mesmas escolhas do Hub de Design (base, palavras, cor, ilustração, camadas, traço), mais movimento e formato.
// Exporta o quadro em PNG e a animação em vídeo, gravado no próprio navegador.

import { useEffect, useRef, useState } from 'react';
import { ARTE } from '../components/marca/arte.ts';
import { ACERVO } from '../components/marca/Ilustra.tsx';
import mapa from '../data/ne-map.json';
import {
  BASES, CAMADAS, DO_ZERO, ESQUEMAS, FORMATOS, MOVIMENTOS, PADRAO, desenhar,
  type Camada, type Config, type Formato, type Recursos,
} from '../lib/animacao.ts';
import { ESTADOS } from '../lib/biblioteca.ts';

// Frases que já estão no design system (Hub de Design, seção Palavras).
const FRASES = [
  ['O Nordeste', 'por conta própria'],
  ['Sotaque', 'não é figurino'],
  ['Quem cresceu lá', 'conta melhor'],
  ['Nós somos', 'assunto e autoria'],
  ['Capital', 'também é Nordeste'],
  ['Juntos', 'e cada um do seu jeito'],
];

const NOMES_ESQUEMA: Record<string, string> = { anil: 'Anil', barro: 'Barro', sol: 'Sol', papel: 'Papel', nanquim: 'Nanquim', areia: 'Areia' };

function fazerGrao(): HTMLCanvasElement {
  const tela = document.createElement('canvas');
  tela.width = 256;
  tela.height = 256;
  const ctx = tela.getContext('2d')!;
  const dados = ctx.createImageData(256, 256);
  for (let i = 0; i < dados.data.length; i += 4) {
    const v = 150 + Math.random() * 105;
    dados.data[i] = dados.data[i + 1] = dados.data[i + 2] = v;
    dados.data[i + 3] = 255;
  }
  ctx.putImageData(dados, 0, 0);
  return tela;
}

function melhorVideo(): { mime: string; ext: string } | null {
  if (typeof MediaRecorder === 'undefined') return null;
  const opcoes = [
    ['video/mp4;codecs=avc1.42E01E', 'mp4'],
    ['video/webm;codecs=vp9', 'webm'],
    ['video/webm;codecs=vp8', 'webm'],
    ['video/webm', 'webm'],
  ];
  for (const [mime, ext] of opcoes) if (MediaRecorder.isTypeSupported(mime)) return { mime, ext };
  return null;
}

function baixar(blob: Blob, nome: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export default function EstudioAnimacao() {
  const [cfg, setCfg] = useState<Config>(PADRAO);
  const [tocando, setTocando] = useState(false);
  const [tempo, setTempo] = useState(0);
  const [aviso, setAviso] = useState('');
  const [gravando, setGravando] = useState(false);
  const [pronto, setPronto] = useState(false);
  const tela = useRef<HTMLCanvasElement>(null);
  const recursos = useRef<Recursos | null>(null);
  const relogio = useRef({ t: 0, antes: 0 });
  const cfgAtual = useRef(cfg);
  cfgAtual.current = cfg;

  const muda = <K extends keyof Config>(chave: K, valor: Config[K]) => setCfg((c) => ({ ...c, [chave]: valor }));
  const camada = (id: Camada) => setCfg((c) => ({ ...c, camadas: { ...c.camadas, [id]: !c.camadas[id] } }));

  function pintar(t: number) {
    const ctx = tela.current?.getContext('2d');
    if (ctx && recursos.current) desenhar(ctx, cfgAtual.current, t, recursos.current);
  }

  // Prepara cores, fontes e textura uma vez.
  useEffect(() => {
    const estilo = getComputedStyle(document.documentElement);
    const fonteTitulo = estilo.getPropertyValue('--fonte-titulo').trim();
    recursos.current = {
      mapa: mapa as Recursos['mapa'],
      arte: ARTE as Recursos['arte'],
      cor: (token) => estilo.getPropertyValue(`--${token}`).trim(),
      fonteTitulo,
      grao: fazerGrao(),
    };
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.fonts.load(`800 80px ${fonteTitulo}`).catch(() => undefined).then(() => {
      // Começa num quadro já assentado. Quem pediu menos movimento não recebe animação sozinha.
      relogio.current.t = PADRAO.duracao * 0.7;
      setTempo(relogio.current.t);
      setPronto(true);
      setTocando(!quieto && new URLSearchParams(window.location.search).get('parado') === null);
    });
  }, []);

  // Laço de animação.
  useEffect(() => {
    if (!pronto) return;
    if (!tocando) {
      pintar(relogio.current.t);
      return;
    }
    let quadro = 0;
    relogio.current.antes = performance.now();
    const passo = (agora: number) => {
      const r = relogio.current;
      r.t += (agora - r.antes) / 1000;
      r.antes = agora;
      if (r.t >= cfgAtual.current.duracao) r.t = 0;
      pintar(r.t);
      setTempo(r.t);
      quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tocando, pronto]);

  // Parado: qualquer mudança redesenha o quadro atual.
  useEffect(() => {
    if (pronto && !tocando) pintar(Math.min(relogio.current.t, cfg.duracao));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg, pronto]);

  function irPara(t: number) {
    relogio.current.t = t;
    setTempo(t);
    if (!tocando) pintar(t);
  }

  function quadroPng() {
    const { l, a } = FORMATOS[cfg.formato];
    tela.current?.toBlob((blob) => {
      if (!blob) return setAviso('Não deu para gerar o PNG neste navegador.');
      baixar(blob, `barruada-animacao-${l}x${a}.png`);
      setAviso(`Quadro baixado em PNG: ${l} x ${a} px.`);
    }, 'image/png');
  }

  function gravarVideo() {
    const formato = melhorVideo();
    const el = tela.current;
    if (!formato || !el || typeof el.captureStream !== 'function') {
      setAviso('Este navegador não grava vídeo. Use o Chrome, o Edge ou o Firefox no computador.');
      return;
    }
    const fluxo = el.captureStream(30);
    const gravador = new MediaRecorder(fluxo, { mimeType: formato.mime, videoBitsPerSecond: 8_000_000 });
    const pedacos: Blob[] = [];
    gravador.ondataavailable = (e) => e.data.size > 0 && pedacos.push(e.data);
    gravador.onstop = () => {
      const { l, a } = FORMATOS[cfgAtual.current.formato];
      const blob = new Blob(pedacos, { type: formato.mime.split(';')[0] });
      baixar(blob, `barruada-animacao-${l}x${a}.${formato.ext}`);
      setGravando(false);
      setAviso(`Vídeo baixado: ${cfgAtual.current.duracao} segundos, ${l} x ${a} px, formato ${formato.ext.toUpperCase()}.`);
    };
    // Grava uma volta inteira, do zero.
    relogio.current.t = 0;
    setGravando(true);
    setTocando(true);
    setAviso('Gravando uma volta da animação. Não troque de aba.');
    gravador.start();
    window.setTimeout(() => gravador.stop(), cfg.duracao * 1000 + 150);
  }

  const { l: larg, a: alt } = FORMATOS[cfg.formato];
  const botaoChip = (ativo: boolean) =>
    `min-h-11 border px-3 font-titulo text-sm font-bold ${ativo ? 'sobre-claro border-sol bg-sol text-nanquim' : 'border-linha bg-transparent text-texto'}`;
  const secao = (n: string, titulo: string) => (
    <h3 className="flex items-baseline gap-2 text-xl">
      <span className="rotulo cor-destaque">{n}</span>
      {titulo}
    </h3>
  );

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,22rem)_1fr]" data-estudio data-pronto={pronto}>
      <div className="order-2 grid content-start gap-6 md:order-1">
        <div className="flex flex-wrap gap-2">
          <button type="button" className="botao botao-linha" onClick={() => { setCfg(DO_ZERO); setAviso('Tela em branco. Monte do zero.'); }} data-do-zero>
            Começar do zero
          </button>
          <button type="button" className="botao botao-linha" onClick={() => { setCfg(PADRAO); setAviso('Base do cartaz-selo restaurada.'); }} data-restaurar>
            Restaurar o selo
          </button>
        </div>

        <section aria-label="Base">
          {secao('01', 'Base')}
          <div role="group" aria-label="Base" className="mt-2 grid grid-cols-2 gap-1">
            {BASES.map((b) => (
              <button key={b.id} type="button" aria-pressed={cfg.base === b.id} onClick={() => muda('base', b.id)} data-base={b.id} className={botaoChip(cfg.base === b.id)}>
                {b.nome}
              </button>
            ))}
          </div>
        </section>

        <section aria-label="Palavras">
          {secao('02', 'Palavras')}
          <div className="mt-2 flex flex-wrap gap-1">
            {FRASES.map(([a, b]) => (
              <button key={a} type="button" onClick={() => setCfg((c) => ({ ...c, titulo: a, apoio: b }))} className="min-h-9 border border-linha bg-transparent px-2 text-sm">
                {a} {b}
              </button>
            ))}
          </div>
          <div className="mt-3 grid gap-2">
            {([['titulo', 'Título'], ['apoio', 'Apoio'], ['esquerda', 'Lateral esquerda'], ['direita', 'Lateral direita'], ['assinatura', 'Assinatura']] as const).map(([chave, nome]) => (
              <label key={chave} className="grid gap-1">
                <span className="rotulo">{nome}</span>
                <input type="text" className="campo" value={cfg[chave]} maxLength={60} onChange={(e) => muda(chave, e.target.value)} data-palavra={chave} />
              </label>
            ))}
            <label className="flex min-h-11 items-center gap-2">
              <input type="checkbox" checked={cfg.caixaAlta} onChange={(e) => muda('caixaAlta', e.target.checked)} className="h-5 w-5" />
              Caixa alta
            </label>
          </div>
        </section>

        <section aria-label="Cor">
          {secao('03', 'Cor')}
          <div role="group" aria-label="Cor" className="mt-2 grid grid-cols-3 gap-1">
            {ESQUEMAS.map((e) => (
              <button key={e} type="button" aria-pressed={cfg.esquema === e} onClick={() => muda('esquema', e)} data-esquema={e} className={botaoChip(cfg.esquema === e)}>
                <span className="mr-1 inline-block h-3 w-3 border border-nanquim align-middle" style={{ background: `var(--${e})` }} aria-hidden="true" />
                {NOMES_ESQUEMA[e]}
              </button>
            ))}
          </div>
        </section>

        <section aria-label="Ilustração">
          {secao('04', 'Ilustração')}
          <label className="mt-2 grid gap-1">
            <span className="rotulo">No centro</span>
            <select className="campo" value={cfg.arte} onChange={(e) => muda('arte', e.target.value)} data-arte>
              <option value="nove">Nove estados</option>
              <option value="estado">Um estado em destaque</option>
              {ACERVO.map((nome) => (
                <option key={nome} value={nome}>{ARTE[nome].n}</option>
              ))}
              <option value="nada">Sem ilustração</option>
            </select>
          </label>
          {cfg.arte === 'estado' && (
            <label className="mt-2 grid gap-1">
              <span className="rotulo">Estado</span>
              <select className="campo" value={cfg.uf} onChange={(e) => muda('uf', e.target.value)} data-uf-arte>
                {ESTADOS.filter((e) => e.uf !== 'NE' && e.uf !== 'BR').map((e) => (
                  <option key={e.uf} value={e.uf}>{e.nome}</option>
                ))}
              </select>
            </label>
          )}
        </section>

        <section aria-label="Camadas da base">
          {secao('05', 'Camadas da base')}
          <div className="mt-2 grid grid-cols-2 gap-x-3">
            {CAMADAS.map((c) => (
              <label key={c.id} className="flex min-h-11 items-center gap-2">
                <input type="checkbox" checked={cfg.camadas[c.id]} onChange={() => camada(c.id)} className="h-5 w-5" data-camada={c.id} />
                {c.nome}
              </label>
            ))}
          </div>
        </section>

        <section aria-label="Traço">
          {secao('06', 'Traço')}
          <label className="mt-2 flex min-h-11 items-center gap-2">
            <input type="checkbox" checked={cfg.divisas} onChange={(e) => muda('divisas', e.target.checked)} className="h-5 w-5" />
            Divisas dos estados à mostra
          </label>
          <label className="grid gap-1">
            <span className="rotulo">Espessura: {cfg.traco.toFixed(1)} px</span>
            <input type="range" min={0.5} max={5} step={0.5} value={cfg.traco} onChange={(e) => muda('traco', Number(e.target.value))} className="min-h-11 w-full" data-traco />
          </label>
        </section>

        <section aria-label="Movimento">
          {secao('07', 'Movimento')}
          <div role="group" aria-label="Movimento" className="mt-2 grid gap-1">
            {MOVIMENTOS.map((m) => (
              <button key={m.id} type="button" aria-pressed={cfg.movimento === m.id} onClick={() => { muda('movimento', m.id); irPara(0); }} data-movimento={m.id} className={`${botaoChip(cfg.movimento === m.id)} text-left`}>
                {m.nome}
              </button>
            ))}
          </div>
          <label className="mt-3 grid gap-1">
            <span className="rotulo">Duração: {cfg.duracao} segundos</span>
            <input type="range" min={2} max={15} step={1} value={cfg.duracao} onChange={(e) => muda('duracao', Number(e.target.value))} className="min-h-11 w-full" data-duracao />
          </label>
        </section>
      </div>

      <div className="order-1 md:sticky md:top-4 md:order-2 md:self-start">
        <section aria-label="Formato">
          <div role="group" aria-label="Formato" className="grid grid-cols-2 gap-1 md:grid-cols-4">
            {(Object.keys(FORMATOS) as Formato[]).map((f) => (
              <button key={f} type="button" aria-pressed={cfg.formato === f} onClick={() => muda('formato', f)} data-formato={f} className={botaoChip(cfg.formato === f)}>
                {FORMATOS[f].nome}
                <span className="block text-xs font-medium">{FORMATOS[f].razao} · {FORMATOS[f].l}x{FORMATOS[f].a}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="mt-3 grid place-items-center border border-linha bg-nanquim p-2">
          <canvas
            ref={tela}
            width={larg}
            height={alt}
            role="img"
            aria-label={`Prévia da animação: ${cfg.titulo} ${cfg.apoio}. Formato ${FORMATOS[cfg.formato].razao}.`}
            className="h-auto max-h-[70vh] w-auto max-w-full"
            data-tela-animacao
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" className="botao botao-sol sobre-claro" onClick={() => setTocando((x) => !x)} disabled={gravando} data-tocar-animacao>
            {tocando ? 'Pausar' : 'Tocar'}
          </button>
          <button type="button" className="botao botao-linha" onClick={() => irPara(0)} disabled={gravando}>
            Do começo
          </button>
          <label className="grid min-w-40 flex-1 gap-1">
            <span className="rotulo">Tempo: {tempo.toFixed(1)} s</span>
            <input type="range" min={0} max={cfg.duracao} step={0.05} value={Math.min(tempo, cfg.duracao)} onChange={(e) => { setTocando(false); irPara(Number(e.target.value)); }} className="min-h-11 w-full" disabled={gravando} data-tempo />
          </label>
        </div>

        <section aria-label="Exportar" className="mt-4 border border-linha bg-fundo-alto p-4">
          {secao('08', 'Exportar')}
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" className="botao botao-sol sobre-claro" onClick={gravarVideo} disabled={gravando || !pronto} data-exportar-video>
              {gravando ? 'Gravando' : 'Baixar vídeo'}
            </button>
            <button type="button" className="botao botao-linha" onClick={quadroPng} disabled={gravando || !pronto} data-exportar-png>
              Baixar quadro em PNG
            </button>
          </div>
          <p className="m-0 mt-2 text-sm text-texto-suave">
            O vídeo sai no formato escolhido acima e dura uma volta da animação. O quadro é o instante parado na prévia.
          </p>
          <p className="m-0 mt-2 min-h-6 font-bold" role="status" aria-live="polite" data-aviso-estudio>{aviso}</p>
        </section>
      </div>
    </div>
  );
}
