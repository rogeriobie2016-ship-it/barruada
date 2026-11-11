// Kit de vídeo do Coletivo Nordeste: stings, vinhetas e GCs numa composição só (animations-v3).
// Tudo é desenhado a partir de T; as seções vêm de window.OM_SCENES no documento principal.
const CNK = '#1D1A16', CNP = '#FBF5E8';
const CN_PAL = { bg: '#2A4BA0', fg: CNP, acc: '#F2B441', acc2: '#C63A22', on1: CNK };
const CN_T = { titulo: 'O Nordeste', apoio: 'por conta própria', assina: '[nome do coletivo]', nome: '[Nome de quem fala]', funcao: '[o que faz] · [cidade, UF]', quadro: '[nome do quadro]', tema: '[assunto do vídeo]', lugar: '[cidade, UF]', data: '[data]' };
const CNM = {
  enter: (T, s, d = .5) => animate({ start: s, end: s + d, ease: Easing.easeOutCubic })(T),
  pop: (T, s, d = .45) => animate({ start: s, end: s + d, ease: Easing.easeOutBack })(T),
  draw: (T, s, d = .5) => animate({ start: s, end: s + d, ease: Easing.easeInOutCubic })(T),
};
const cnFit = (s, max, w, k) => Math.max(12, Math.min(max, w / (Math.max(1, (s || '').length) * k)));
const cnOn = x => ['#1D1A16', '#2A4BA0', '#C63A22'].indexOf(x) >= 0 ? CNP : CNK;

function CNArt({ k, col }) {
  const E = window.CN_ART || {}, map = window.NE_MAP;
  const S = { width: '100%', height: '100%', display: 'block', overflow: 'visible' };
  if (k === 'mapa') {
    if (!map) return null;
    return <svg viewBox="0 0 1000 1255" style={S}>{map.states.map(s => <path key={s.uf} d={s.d} fill={col.m} stroke={col.p} strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />)}</svg>;
  }
  const e = E[k]; if (!e) return null;
  const C = r => ({ m: col.m, a: col.a, p: col.p, k: CNK })[r] || r, id = 'cnv-' + k;
  return <svg viewBox={e.vb || '0 0 100 100'} style={S}>
    {e.clip && <clipPath id={id}><path d={e.clip} /></clipPath>}
    {e.L.map((l, i) => {
      const q = l[2] || {}, cp = q.clip ? `url(#${id})` : undefined;
      return q.line
        ? <path key={i} d={l[0]} fill="none" stroke={C(q.line)} strokeWidth={q.sw} strokeLinecap="round" strokeLinejoin="round" opacity={q.o} clipPath={cp} />
        : <path key={i} d={l[0]} fill={C(l[1])} fillRule="evenodd" transform={q.t} opacity={q.o} clipPath={cp} />;
    })}
  </svg>;
}

function CNRays({ col, rot, op }) {
  return <div style={{ position: 'absolute', inset: '-30%', opacity: op, background: `repeating-conic-gradient(from ${rot}deg at 50% 50%, ${col} 0 2.4deg, transparent 2.4deg 9deg)` }} />;
}

function CNPiece(p) {
  const { T, CUES, time, authoredTotal } = useComposition();
  const W = p.w, H = p.h, u = Math.min(W, H) / 1080, tall = H > W, cx = W / 2, cy = H / 2;
  const c = p.pal || CN_PAL, t = Object.assign({}, CN_T, p.t), el = p.el || 'mapa', on2 = { m: CNP, a: c.acc, p: c.acc2 };
  const s1 = CUES['Sting 1'], s2 = CUES['Sting 2'], v1 = CUES['Vinheta 1'], v2 = CUES['Vinheta 2'], g1 = CUES['GC nome'], g2 = CUES['GC tema'], g3 = CUES['GC lugar'], end = authoredTotal;
  const E = CNM.enter, Pp = CNM.pop, D = CNM.draw;
  const abs = { position: 'absolute' }, fill = { position: 'absolute', inset: 0 };
  const H8 = (sz, ls) => ({ fontWeight: 800, fontSize: sz, lineHeight: 1, letterSpacing: ls || '-.05em', whiteSpace: 'nowrap' });
  const caps = (sz, ls) => ({ fontWeight: 700, fontSize: sz, lineHeight: 1, letterSpacing: ls, textTransform: 'uppercase', whiteSpace: 'nowrap' });
  const tex = p.textura !== false ? <div style={{ ...fill, pointerEvents: 'none', opacity: .45, backgroundImage: 'radial-gradient(circle,rgba(29,26,22,.5) 1px,transparent 1.5px),repeating-linear-gradient(0deg,rgba(29,26,22,.16) 0 1px,transparent 1px 5px)', backgroundSize: '9px 9px,auto' }} /> : null;
  const clipR = r => `inset(0 ${(1 - r) * 100}% 0 0)`, clipL = r => `inset(0 0 0 ${(1 - r) * 100}%)`;

  // Sting 1: batida do selo
  const o1 = 1 - D(T, s1 + 1.45, .4), d1 = 560 * u, f1 = cnFit(t.titulo, 150 * u, W * .8, .62);
  const sting1 = <Shot from={s1} to={s2}><div style={{ ...fill, background: c.bg, overflow: 'hidden' }}>
    <CNRays col={c.acc} rot={(T - s1) * 40} op={E(T, s1 + .05, .3) * o1} />
    <div style={{ ...abs, left: cx - d1 / 2, top: cy - d1 / 2, width: d1, height: d1, borderRadius: '50%', background: c.acc2, transform: `scale(${Pp(T, s1 + .1) * o1})` }} />
    <div style={{ ...abs, left: cx - d1 / 2 - 22 * u, top: cy - d1 / 2 - 22 * u, width: d1 + 44 * u, height: d1 + 44 * u, borderRadius: '50%', border: `${3 * u}px solid ${c.fg}`, opacity: E(T, s1 + .22, .3) * o1, transform: `scale(${1.5 - .5 * E(T, s1 + .22, .4)})` }} />
    <div style={{ ...abs, left: cx - d1 * .29, top: cy - d1 * .36, width: d1 * .58, height: d1 * .6, transform: `scale(${Pp(T, s1 + .28) * o1}) rotate(${-10 + 10 * E(T, s1 + .28, .5)}deg)` }}><CNArt k={el} col={on2} /></div>
    <div style={{ ...abs, left: cx, top: cy + d1 * .2, transform: `translate(-50%,0) translateX(${(E(T, s1 + .5, .3) - 1 + D(T, s1 + 1.45, .4)) * W}px) rotate(-3deg)` }}><span style={{ ...H8(f1), display: 'block', textTransform: 'uppercase', background: c.fg, color: c.bg, padding: `${f1 * .14}px ${f1 * .3}px ${f1 * .08}px` }}>{t.titulo}</span></div>
    <div style={{ ...abs, left: cx, top: cy + d1 * .2 + f1 * 1.32, transform: `translate(-50%,0) scale(${Pp(T, s1 + .72) * o1}) rotate(2deg)` }}><span style={{ ...H8(f1 * .42, '-.03em'), display: 'block', background: c.acc, color: c.on1, padding: `${f1 * .09}px ${f1 * .16}px ${f1 * .06}px` }}>{t.apoio}</span></div>
    {tex}
  </div></Shot>;

  // Sting 2: três tarjas atravessam
  const f2 = cnFit(t.assina, H / 3 * .5, W * .8, .6);
  const sting2 = <Shot from={s2} to={v1}><div style={{ ...fill, background: c.bg, overflow: 'hidden' }}>
    {[c.acc, c.acc2, c.fg].map((col, i) => <div key={i} style={{ ...abs, left: 0, top: i * H / 3 - 1, width: W, height: H / 3 + 2, background: col, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateX(${(E(T, s2 + i * .08, .4) - 1 + D(T, s2 + .9 + i * .08, .4)) * 100 * (i % 2 ? -1 : 1)}%)` }}>{i === 1 && <span style={{ ...H8(f2), textTransform: 'uppercase', color: cnOn(col) }}>{t.assina}</span>}</div>)}
    {tex}
  </div></Shot>;

  // Vinheta 1: o selo se monta
  const o3 = 1 - D(T, v2 - .7, .55), d3 = (tall ? 640 : 520) * u, m3 = 40 * u, b3 = 150 * u;
  const fT = cnFit(t.titulo, 56 * u, W * .66, 1.05), fA = cnFit(t.apoio, 56 * u, W * .66, 1.05);
  const band = (txt, fs, top, at, dir) => <div style={{ ...abs, left: m3, width: W - 2 * m3, top, height: b3, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ ...caps(fs, '.3em'), fontWeight: 800, textIndent: '.3em', color: c.fg, opacity: E(T, v1 + at, .5) * o3, transform: `translateY(${(1 - E(T, v1 + at, .5)) * 40 * u * dir}px)` }}>{txt}</span></div>;
  const vin1 = <Shot from={v1} to={v2}><div style={{ ...fill, background: c.bg, overflow: 'hidden' }}>
    <div style={{ ...abs, left: m3, top: m3, width: W - 2 * m3, height: H - 2 * m3, overflow: 'hidden' }}><CNRays col={c.acc} rot={(T - v1) * 8} op={E(T, v1 + .25, .6) * o3} /></div>
    <div style={{ ...abs, left: cx - d3 / 2, top: cy - d3 / 2, width: d3, height: d3, borderRadius: '50%', background: c.acc2, transform: `scale(${Pp(T, v1 + .5) * (1 + .04 * D(T, v1 + 1, 3.2)) * o3})` }} />
    <div style={{ ...abs, left: cx - d3 / 2 - 20 * u, top: cy - d3 / 2 - 20 * u, width: d3 + 40 * u, height: d3 + 40 * u, borderRadius: '50%', border: `${2.5 * u}px solid ${c.fg}`, opacity: E(T, v1 + .7, .4) * o3, transform: `scale(${1.3 - .3 * E(T, v1 + .7, .5)})` }} />
    <div style={{ ...abs, left: cx - d3 * .29, top: cy - d3 * .34, width: d3 * .58, height: d3 * .66, transform: `scale(${Pp(T, v1 + .9) * (1 + .04 * D(T, v1 + 1, 3.2)) * o3})` }}><CNArt k={el} col={on2} /></div>
    {band(t.titulo, fT, m3, 1.2, -1)}
    {band(t.apoio, fA, H - m3 - b3, 1.5, 1)}
    <div style={{ ...abs, left: m3, top: m3, width: W - 2 * m3, height: H - 2 * m3, boxSizing: 'border-box', border: `${3 * u}px solid ${c.fg}`, opacity: E(T, v1 + .05, .4) * o3 }} />
    <div style={{ ...abs, left: m3 + 12 * u, top: m3 + 12 * u, width: W - 2 * m3 - 24 * u, height: H - 2 * m3 - 24 * u, boxSizing: 'border-box', border: `${1.2 * u}px solid ${c.fg}`, opacity: E(T, v1 + .15, .4) * o3 }} />
    {tex}
  </div></Shot>;

  // Vinheta 2: título e mapa estado por estado
  const o4 = 1 - D(T, g1 - .7, .5), tw = tall ? W - 160 * u : W * .46;
  const longo = (t.titulo || '').length > (t.apoio || '').length ? t.titulo : t.apoio;
  const f4 = cnFit(longo, 170 * u, tw, .56), mh = tall ? H * .5 : H * .8, mw = mh * 1000 / 1255;
  const map = window.NE_MAP, c3 = [c.acc2, c.acc, c.acc2, c.fg, c.acc, c.fg, c.acc, c.fg, c.acc2];
  const line = (txt, col, at) => <div style={{ ...H8(f4), lineHeight: .92, color: col, opacity: E(T, v2 + at, .4), transform: `translateY(${(1 - E(T, v2 + at, .5)) * 60 * u}px)` }}>{txt}</div>;
  const vin2 = <Shot from={v2} to={g1}><div style={{ ...fill, background: c.bg, overflow: 'hidden' }}>
    <div style={{ ...abs, left: (tall ? 80 : 120) * u, top: tall ? 150 * u : cy - f4 * 1.3, opacity: o4, transform: `translateX(${(o4 - 1) * 80 * u}px)` }}>
      {line(t.titulo, c.fg, .2)}{line(t.apoio, c.acc, .42)}
      <div style={{ ...caps(26 * u, '.24em'), display: 'inline-block', marginTop: 34 * u, background: c.fg, color: c.bg, padding: `${12 * u}px ${18 * u}px ${10 * u}px`, transformOrigin: 'left center', transform: `scale(${Pp(T, v2 + 2.9)})` }}>{t.assina}</div>
    </div>
    {map && <svg viewBox="0 0 1000 1255" style={{ ...abs, left: tall ? cx - mw / 2 : W - mw - 150 * u, top: tall ? H * .42 : cy - mh / 2, width: mw, height: mh, overflow: 'visible', opacity: o4, transform: `scale(${(1 + .03 * D(T, v2 + .5, 3.8)) * (.9 + .1 * o4)})` }}>
      {map.states.map((s, i) => { const k = Pp(T, v2 + .5 + i * .22, .5); return <path key={s.uf} d={s.d} fill={c3[i % 9]} stroke={c.bg} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" style={{ transformBox: 'fill-box', transformOrigin: 'center', transform: `scale(${k})`, opacity: Math.min(1, k * 3) }} />; })}
    </svg>}
    {tex}
  </div></Shot>;

  // GCs sobre o vídeo (referência cinza ou verde de recorte)
  const chroma = p.fundo === 'chroma', topGC = (tall ? 260 : 96) * u;
  const foot = <Shot from={g1} to={end + 1}><div style={{ ...fill, background: chroma ? '#00B140' : 'linear-gradient(160deg,#8F8A80,#2B2925)' }}>
    {!chroma && <span style={{ ...abs, left: cx, top: cy, transform: 'translate(-50%,-50%)', ...caps(22 * u, '.12em'), fontWeight: 600, background: CNK, color: CNP, padding: `${10 * u}px ${14 * u}px` }}>[vídeo de quem fala]</span>}
  </div></Shot>;

  const o5 = 1 - D(T, g2 - .8, .45), f5 = cnFit(t.nome, 76 * u, W * .6, .56), sq = f5 + 34 * u;
  const gc1 = <div style={{ ...abs, left: 96 * u, bottom: (tall ? 420 : 120) * u, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10 * u }}>
    <div style={{ display: 'flex' }}>
      <div style={{ width: sq, height: sq, background: c.acc2, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${Pp(T, g1 + .3) * o5})` }}><div style={{ width: sq * .6, height: sq * .6, transform: `rotate(${(T - g1) * 24}deg)` }}><CNArt k="estrela" col={{ m: cnOn(c.acc2), a: c.acc, p: c.acc2 }} /></div></div>
      <div style={{ height: sq, background: c.bg, color: c.fg, display: 'flex', alignItems: 'center', padding: `${4 * u}px ${30 * u}px 0`, overflow: 'hidden', clipPath: clipR(E(T, g1 + .4, .45) * o5) }}><span style={{ ...H8(f5, '-.04em'), display: 'block', transform: `translateY(${(1 - E(T, g1 + .55, .4)) * 100}%)` }}>{t.nome}</span></div>
    </div>
    <div style={{ ...caps(28 * u, '.12em'), marginLeft: sq, background: c.acc, color: c.on1, padding: `${12 * u}px ${20 * u}px ${10 * u}px`, clipPath: clipR(E(T, g1 + .7, .45) * o5) }}>{t.funcao}</div>
  </div>;

  const o6 = 1 - D(T, g3 - .8, .45), f6 = cnFit(t.tema, 84 * u, W * .72, .56);
  const gc2 = <div style={{ ...abs, left: 96 * u, top: topGC, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
    <div style={{ ...caps(24 * u, '.2em'), background: CNK, color: CNP, padding: `${12 * u}px ${18 * u}px ${10 * u}px`, clipPath: clipR(E(T, g2 + .3, .4) * o6) }}>{t.quadro}</div>
    <div style={{ ...H8(f6, '-.04em'), background: c.acc, color: c.on1, padding: `${f6 * .2}px ${f6 * .34}px ${f6 * .14}px`, transformOrigin: 'left top', transform: `rotate(-2deg) scale(${Pp(T, g2 + .5) * o6})` }}>{t.tema}</div>
  </div>;

  const o7 = 1 - D(T, end - .95, .4);
  const gc3 = <div style={{ ...abs, right: 96 * u, top: topGC, display: 'flex', alignItems: 'center', gap: 18 * u }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 * u }}>
      <div style={{ ...H8(46 * u, '-.04em'), background: c.bg, color: c.fg, padding: `${14 * u}px ${20 * u}px ${10 * u}px`, clipPath: clipL(E(T, g3 + .4, .45) * o7) }}>{t.lugar}</div>
      <div style={{ ...caps(22 * u, '.16em'), fontWeight: 600, background: CNK, color: CNP, padding: `${10 * u}px ${14 * u}px ${8 * u}px`, clipPath: clipL(E(T, g3 + .6, .45) * o7) }}>{t.data}</div>
    </div>
    <div style={{ width: 96 * u, height: 120 * u, transform: `scale(${Pp(T, g3 + .3) * o7})` }}><CNArt k="mapa" col={{ m: c.acc, a: c.acc, p: CNK }} /></div>
  </div>;

  return <div data-screen-label={'t=' + Math.floor(time || 0) + 's'} style={{ ...fill, fontFamily: "'Archivo',sans-serif", overflow: 'hidden' }}>
    {sting1}{sting2}{vin1}{vin2}{foot}
    <Shot from={g1} to={g2}>{gc1}</Shot>
    <Shot from={g2} to={g3}>{gc2}</Shot>
    <Shot from={g3} to={end + 1}>{gc3}<div style={{ ...fill, background: c.bg, opacity: D(T, end - .4, .35) }} /></Shot>
  </div>;
}

function CNVideo(p) {
  const w = +p.w || 1920, h = +p.h || 1080;
  return <CompositionStage key={w + 'x' + h} width={w} height={h} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg={(p.pal || CN_PAL).bg}><CNPiece {...p} w={w} h={h} /></CompositionStage>;
}
window.CNVideo = CNVideo;
