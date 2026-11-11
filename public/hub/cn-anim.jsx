// Hub de Animações · Animação 1: "Nordeste (não) é uma ficção. Nordeste sempre houve."
// Uma composição só (animations-v3), desenhada a partir de T. Serve em 16:9, 9:16, 1:1 e 4:5.
// Estilos: chapada (ilustração), xilo (xilogravura), colagem, linha (traço), corte (papel cortado), pb (preto e branco). Cor e estilo são independentes.
const AK = '#1D1A16', AP = '#FBF5E8', AR = '#C63A22', AB = '#2A4BA0', AY = '#F2B441';
const AN_PAL = {
  nanquim: { bg: AK, fg: AP, disc: AB, acc: AY, on: AK, acc2: AR, cols: [AR, AY, AP] },
  anil: { bg: AB, fg: AP, disc: AK, acc: AY, on: AK, acc2: AR, cols: [AR, AY, AP] },
  barro: { bg: AR, fg: AP, disc: AK, acc: AY, on: AK, acc2: AB, cols: [AY, AP, AR] },
  papel: { bg: AP, fg: AK, disc: AB, acc: AR, on: AP, acc2: AY, cols: [AR, AY, AP] },
};
const AN_T = { a: 'Nordeste', nao: 'não', b: 'é uma ficção.', c: 'Nordeste', d: 'sempre', e: 'houve.', assina: 'Barruada · coletivo nordestino' };
const AN_SPIN = ['sol', 'estrela', 'azulejo'], AN_SEQ = [0, 1, 2, 1, 0, 2, 0, 1, 2], AN_ROT = [-1.4, 1.1, -.8, 1.5, -1.2, .9, 1.3, -1, .7];
const ANM = {
  enter: (T, s, d = .5) => animate({ start: s, end: s + d, ease: Easing.easeOutCubic })(T),
  pop: (T, s, d = .45) => animate({ start: s, end: s + d, ease: Easing.easeOutBack })(T),
  draw: (T, s, d = .5) => animate({ start: s, end: s + d, ease: Easing.easeInOutCubic })(T),
};
const anL = (a, b, k) => a + (b - a) * k;
const anHex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const anMix = (a, b, k) => { const x = anHex(a), y = anHex(b); return 'rgb(' + x.map((v, i) => Math.round(anL(v, y[i], k))).join(',') + ')'; };
const anA = (h, a) => 'rgba(' + anHex(h).join(',') + ',' + a + ')';
const anLum = h => { const [r, g, b] = anHex(h); return (.299 * r + .587 * g + .114 * b) / 255; };
// P&B: cada cor vira um tom entre nanquim e papel, pela luminância
const anGray = h => { const v = Math.max(0, Math.min(1, (anLum(h) - .1) / .86)), a = anHex(AK), b = anHex(AP); return '#' + a.map((x, i) => Math.round(anL(x, b[i], v)).toString(16).padStart(2, '0')).join(''); };
const anPB = c => ({ bg: anGray(c.bg), fg: anGray(c.fg), disc: anGray(c.disc), acc: anGray(c.acc), on: anGray(c.on), acc2: anGray(c.acc2), cols: c.cols.map(anGray) });
const anFit = (s, max, w, k) => Math.max(20, Math.min(max, w / (Math.max(1, (s || '').length) * k)));
const AN_NZ = {};
// Ruído em SVG embutido (grão, salpico, fibra do Lab), tingido pela tinta da paleta
function anNoise(f, o, seed, size, hex, mul, offs) {
  const key = [f, o, seed, size, hex, mul, offs].join();
  if (AN_NZ[key]) return AN_NZ[key];
  const [r, g, b] = anHex(hex).map(v => (v / 255).toFixed(2));
  const svg = "<svg xmlns='http://www.w3.org/2000/svg' width='" + size + "' height='" + size + "'><filter id='n' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='" + f + "' numOctaves='" + o + "' seed='" + seed + "' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 " + r + " 0 0 0 0 " + g + " 0 0 0 0 " + b + " " + mul + " 0 0 0 " + offs + "'/></filter><rect width='" + size + "' height='" + size + "' filter='url(#n)'/></svg>";
  return AN_NZ[key] = 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
}
const AN_ST = {};
function anStars(n) {
  if (AN_ST[n]) return AN_ST[n];
  let s = 7; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  return AN_ST[n] = Array.from({ length: n }, () => { const z = r() * r(); return { x: r(), y: r(), z, r: .9 + z * 3.4, p: r() * 6.28, k: 1 + Math.floor(r() * 4), c: r() > .8 }; });
}

function ANArt({ k, col, id, gray }) {
  const e = (window.CN_ART || {})[k]; if (!e) return null;
  const C = r => { const v = ({ m: col.m, a: col.a, p: col.p, k: AK })[r] || r; return gray && v[0] === '#' ? anGray(v) : v; };
  return <svg viewBox={e.vb || '0 0 100 100'} style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}>
    {e.clip && <clipPath id={id}><path d={e.clip} /></clipPath>}
    {e.L.map((l, i) => {
      const q = l[2] || {}, cp = q.clip ? `url(#${id})` : undefined;
      return q.line
        ? <path key={i} d={l[0]} fill="none" stroke={C(q.line)} strokeWidth={q.sw} strokeLinecap="round" strokeLinejoin="round" opacity={q.o} clipPath={cp} />
        : <path key={i} d={l[0]} fill={C(l[1])} fillRule="evenodd" transform={q.t} opacity={q.o} clipPath={cp} />;
    })}
  </svg>;
}

function ANSky({ W, H, n, T, total, par, u, est, c }) {
  const mix = [c.fg, c.acc, c.fg, c.acc2, c.fg];
  return <svg viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
    {anStars(n).map((s, i) => {
      const x = s.x * W, y = (s.y * 1.3 - .15) * H + par * (30 + 150 * s.z) * u, r = s.r * u;
      const o = .25 + .75 * (.5 + .5 * Math.sin(6.2832 * s.k * T / total + s.p));
      if (est === 'xilo') return <path key={i} d="M0-4L1-1L4 0L1 1L0 4L-1 1L-4 0L-1-1Z" transform={`translate(${x} ${y}) scale(${r * .7})`} fill={c.fg} opacity={o} />;
      if (est === 'colagem') return <rect key={i} x={-r * 1.6} y={-r * 1.6} width={r * 3.2} height={r * 3.2} transform={`translate(${x} ${y}) rotate(${s.p * 57.3})`} fill={mix[i % 5]} opacity={.5 + .5 * o} />;
      if (est === 'corte') return <path key={i} d="M0-4L3.6 2.6L-3.6 2.6Z" transform={`translate(${x} ${y}) rotate(${s.p * 57.3}) scale(${r * .9})`} fill={mix[i % 5]} opacity={.45 + .55 * o} />;
      if (est === 'linha') return <circle key={i} cx={x} cy={y} r={r * 1.3} fill="none" stroke={c.fg} strokeWidth={u} opacity={o} />;
      return <circle key={i} cx={x} cy={y} r={r} fill={s.c ? c.acc : c.fg} opacity={o} />;
    })}
  </svg>;
}

function ANPiece(p) {
  const { T, CUES, time, authoredTotal } = useComposition();
  const W = p.w, H = p.h, wide = W > H * 1.2, u = Math.min(W, H) / 1080, mx = wide ? W * .073 : 80 * u, hb = Math.min(H, W * 1.5);
  const t = Object.assign({}, AN_T, p.t), map = window.NE_MAP, off = p.off || {};
  const est = p.estilo || 'chapada', xilo = est === 'xilo', col = est === 'colagem', lin = est === 'linha', corte = est === 'corte', pb = est === 'pb', caps = !!p.caps;
  const cp = AN_PAL[p.ceu] || AN_PAL.nanquim, c = pb ? anPB(cp) : cp;
  const b0 = CUES['Não'], c0 = CUES['Báscula'], d0 = CUES['Sempre houve'], end = authoredTotal;
  const E = ANM.enter, Pp = ANM.pop, D = ANM.draw;
  const tilt0 = +p.tilt || 72, sw = +p.sw || 1.5, sh = 'rgba(29,26,22,.3)', ck = (caps ? 1.2 : 1) * (col ? 1.08 : 1);
  const abs = { position: 'absolute' }, fill = { position: 'absolute', inset: 0 };
  const H8 = { fontWeight: 800, lineHeight: 1, letterSpacing: caps ? '-.03em' : '-.05em', textTransform: caps ? 'uppercase' : 'none', whiteSpace: 'nowrap' };
  // chão = cor atrás dos estados; ln = linha que contrasta com ele
  const ground = (off.disco || lin) ? c.bg : xilo ? c.fg : c.disc, ln = anLum(ground) > .6 ? AK : AP;

  // Frase 2 é medida antes: o mapa de frente se encaixa no espaço que sobra abaixo dela
  const topTxt = (H > W * 1.4 ? .1 : .08) * H;
  const longo = [t.c, t.d, t.e].reduce((a, b) => (b || '').length > a.length ? b : a, '');
  const f2 = anFit(longo, wide ? 190 * u : Math.min(190 * u, H * (H > W * 1.1 ? .105 : .095)), wide ? W * .4 : W - 2 * mx, .56 * ck);
  const dTop = topTxt + f2 * (col ? 3.55 : 3.2) + (off.assina ? 40 : 116) * u, dBot = H - 50 * u;
  const dH = Math.min(.42 * hb, (dBot - dTop) / 2 * 1255 / 720 / 1.03), dcy = (dTop + dBot) / 2;
  // Pose do mapa: deitado (céu) -> de frente (báscula) -> deitado de novo, para o laço fechar
  const P = wide
    ? { a: [.5 * W, .565 * H, .555 * H], b: [.65 * W, .75 * H, .48 * H], c: [.5 * W, .5 * H, .7 * H], d: [.76 * W, .5 * H, .65 * H] }
    : { a: [.5 * W, .56 * H, .36 * hb], b: [.5 * W, .76 * H, .3 * hb], c: [.5 * W, .52 * H, .5 * hb], d: [.5 * W, dcy, dH] };
  const up = D(T, c0 + .3, 2.4), down = D(T, end - 1.3, 1.2), face = up - down, back = down > 0;
  const mb = back ? 0 : D(T, b0 - .4, 1.1), md = D(T, d0 - .1, 1), push = back ? 0 : D(T, 0, b0);
  const mix = i => anL(anL(P.a[i] * (i === 2 ? 1 + .07 * push : 1), P.b[i], mb), anL(P.c[i], P.d[i], md) * (i === 2 ? 1 + .03 * D(T, d0, 5) : 1), face);
  const cx = mix(0), cy = mix(1), Hm = mix(2), us = Hm / 1255;
  const cs = Math.cos(tilt0 * (1 - face) * Math.PI / 180);
  const spin = (back ? -20 : -20 + 5 * Math.min(T, c0)) * (1 - face);
  const R = [800, 960, 1120];

  // Estados: cada estilo pinta do seu jeito, sempre sobre a geometria real
  const fillOf = i => xilo ? [ln, 'url(#an-h1)', c.acc, 'url(#an-h2)'][i % 4] : lin ? [c.acc, 'url(#an-h1)', 'none'][i % 3] : c.cols[AN_SEQ[i]];
  const estados = map && map.states.map((s, i) => {
    const k = E(T, c0 + 1.5 + i * .13, .5) * (1 - down), f = fillOf(i);
    if (col) return <React.Fragment key={s.uf}>
      <path d={s.d} fill="none" stroke={ln} strokeWidth={sw} vectorEffect="non-scaling-stroke" strokeDasharray="7 6" strokeLinejoin="round" opacity={1 - k} />
      <g style={{ transformBox: 'fill-box', transformOrigin: 'center', transform: `rotate(${AN_ROT[i] * k}deg) scale(${1.14 - .14 * k})` }}>
        <path d={s.d} transform="translate(9 13)" fill={AK} opacity={.3 * k} />
        <path d={s.d} fill={AP} stroke={AP} strokeWidth="13" strokeLinejoin="round" opacity={k} />
        <path d={s.d} fill={f} opacity={k} />
      </g>
    </React.Fragment>;
    if (corte) return <React.Fragment key={s.uf}>
      <path d={s.d} fill="none" stroke={ln} strokeWidth={sw} vectorEffect="non-scaling-stroke" strokeLinejoin="round" opacity={1 - k} />
      <g transform={`translate(0 ${(k - 1) * 36})`}>
        <path d={s.d} transform="translate(8 12)" fill={AK} opacity={.28 * k} />
        <path d={s.d} fill={f} opacity={k} />
      </g>
    </React.Fragment>;
    return <path key={s.uf} d={s.d} fill={f} fillOpacity={k} stroke={(xilo || lin || off.disco) ? ln : anMix(ln, ground, k)} strokeWidth={xilo ? sw * 1.8 : lin ? sw + k : sw} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />;
  });

  // Astros em órbita: ilustração do acervo, ponto ou nada
  const A = p.astros || ['sol', 'ponto', 'ponto'], aCol = [c.acc, c.acc2, c.fg], aR = [R[1], R[2], R[0]], aPh = [215, 40, 120], aK = [1, -1, 2];
  const astro = i => {
    const k = A[i]; if (!k || k === 'nada') return null;
    const pt = k === 'ponto', stk = col && !pt, size = (pt ? [30, 22, 12][i] : [72, 60, 50][i]) * u * (stk ? 1.3 : 1);
    const a = (aPh[i] + 360 * aK[i] * T / end + spin) * Math.PI / 180, m = (xilo || lin) ? c.fg : aCol[i];
    return <div key={i} style={{ ...abs, left: cx + aR[i] * us * Math.cos(a) - size / 2, top: cy + aR[i] * us * Math.sin(a) * cs - size / 2, width: size, height: size, boxSizing: 'border-box', ...(stk ? { background: AP, borderRadius: '50%', padding: size * .17, boxShadow: `${5 * u}px ${6 * u}px 0 ${sh}` } : corte && !pt ? { filter: `drop-shadow(${4 * u}px ${5 * u}px 0 ${sh})` } : {}) }}>
      {pt
        ? <div style={{ width: '100%', height: '100%', boxSizing: 'border-box', borderRadius: corte ? 0 : '50%', transform: corte ? 'rotate(45deg) scale(.8)' : undefined, boxShadow: corte ? `${4 * u}px ${5 * u}px 0 ${sh}` : undefined, background: lin ? 'transparent' : m, border: lin ? `${sw}px solid ${c.fg}` : undefined }} />
        : <div style={{ width: '100%', height: '100%', transform: AN_SPIN.indexOf(k) >= 0 ? `rotate(${360 * T / end}deg)` : undefined }}><ANArt k={k} id={'an-a' + i} gray={pb} col={stk ? { m: [AR, AB, AK][i], a: AY, p: AP } : { m, a: (xilo || lin) ? c.acc : aCol[(i + 1) % 3], p: c.bg }} /></div>}
    </div>;
  };

  // Texto: a palavra muda de roupa conforme o estilo
  const wst = xilo ? { filter: 'url(#an-rt)' } : col ? { background: c.fg, color: c.bg, padding: '.05em .14em 0', marginBottom: '.08em', boxShadow: `${5 * u}px ${6 * u}px 0 ${sh}` } : lin ? { color: 'transparent', WebkitTextStroke: `${Math.max(1.5, 2.5 * u)}px ${c.fg}` } : corte ? { textShadow: `${4 * u}px ${5 * u}px 0 ${sh}` } : {};
  const word = (txt, at, i) => <span style={{ display: 'inline-block', opacity: E(T, at, .45), transform: `translateY(${(1 - E(T, at, .5)) * 46 * u}px)${col ? ` rotate(${[-1.5, 1.2, -1][i % 3]}deg)` : ''}`, ...wst }}>{txt}</span>;
  const accSt = col ? { background: c.acc, color: c.on, padding: '.05em .12em 0', margin: '0 .06em', boxShadow: `${5 * u}px ${6 * u}px 0 ${sh}` } : xilo ? { color: c.acc, filter: 'url(#an-rt)' } : pb ? { background: c.fg, color: c.bg, padding: '.02em .1em 0' } : corte ? { color: c.acc, textShadow: `${4 * u}px ${5 * u}px 0 ${sh}` } : { color: c.acc };

  // Frase 1: o parêntese chega vazio e o "não" bate dentro
  const tw1 = wide ? W * .6 : W - 2 * mx;
  const f1 = Math.min(anFit(t.a + ' (' + t.nao + ')', 156 * u, tw1, .5 * ck), anFit(t.b, 156 * u, tw1, .5 * ck));
  const o1 = 1 - D(T, c0 - .1, .6), hit = Pp(T, b0 + 2.2), hitE = E(T, b0 + 2.2, .45), pc = anMix(c.fg, c.acc, hitE);
  const frase1 = <div style={{ ...abs, ...H8, left: mx, top: wide ? H * .157 : topTxt, fontSize: f1, color: c.fg, opacity: o1, transform: `translate(${(hitE - hit) * 26 * u}px,${(o1 - 1) * 50 * u}px)` }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: f1 * .2 }}>
      {word(t.a, b0 + .5, 0)}
      <span style={{ display: 'inline-block', opacity: E(T, b0 + .8, .4) }}>
        <span style={{ color: pc, opacity: .5 + .5 * hitE }}>(</span>
        <span style={{ display: 'inline-block', transformOrigin: '50% 80%', transform: `scale(${hit})`, opacity: Math.min(1, hitE * 4), ...accSt }}>{t.nao}</span>
        <span style={{ color: pc, opacity: .5 + .5 * hitE }}>)</span>
      </span>
    </div>
    <div style={{ marginTop: f1 * (col ? .1 : .02) }}>{word(t.b, b0 + 1.1, 1)}</div>
  </div>;

  // Frase 2: ao lado (ou acima) do mapa de frente
  const o2 = 1 - D(T, end - 1.9, .5);
  const frase2 = <div style={{ ...abs, ...H8, left: mx, top: wide ? H / 2 - f2 * 1.53 - 30 * u : topTxt, fontSize: f2, color: c.fg, opacity: o2, transform: `translateX(${(o2 - 1) * 80 * u}px)`, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
    {word(t.c, d0 + .6, 0)}
    <span style={{ display: 'inline-block', background: c.acc, color: c.on, padding: `${f2 * .06}px ${f2 * .14}px ${f2 * .01}px`, margin: `${f2 * .05}px 0 ${f2 * .07}px ${-f2 * .06}px`, transformOrigin: 'left center', transform: `rotate(-2deg) scale(${Pp(T, d0 + 1)})`, ...(xilo ? { filter: 'url(#an-rt)' } : (col || corte) ? { boxShadow: `${5 * u}px ${6 * u}px 0 ${sh}` } : {}) }}>{t.d}</span>
    {word(t.e, d0 + 1.4, 2)}
    {!off.assina && <span style={{ fontWeight: 700, fontSize: 24 * u, letterSpacing: '.22em', textTransform: 'uppercase', boxSizing: 'border-box', background: lin ? 'transparent' : c.fg, color: lin ? c.fg : c.bg, border: lin ? `${1.5 * u}px solid ${c.fg}` : undefined, padding: `${12 * u}px ${18 * u}px ${10 * u}px`, marginTop: 30 * u, transformOrigin: 'left center', transform: `scale(${Pp(T, d0 + 2.4)})` }}>{t.assina}</span>}
  </div>;

  const g = a => anA(c.fg, a), txKey = p.textura === false ? 'limpo' : typeof p.textura === 'string' ? p.textura : 'auto';
  const nz = { grao: () => anNoise('.85', 2, 2, 300, c.fg, 3.2, -1.78), salpico: () => anNoise('.6', 2, 5, 260, c.fg, 7, -4.7), fibra: () => anNoise('.012 .03', 3, 9, 640, c.fg, .7, -.34) };
  const TX = {
    auto: () => corte ? [nz.fibra() + ',' + nz.grao(), '1280px,600px', .55] : pb ? [nz.grao() + ',' + nz.grao(), '600px,340px', .9] : xilo ? ['repeating-linear-gradient(1.5deg,transparent 0 ' + 9 * u + 'px,' + anA(c.bg, .4) + ' ' + 9 * u + 'px ' + 10.5 * u + 'px)', 'auto', .75]
      : col ? ['repeating-linear-gradient(115deg,rgba(251,245,232,.08) 0 2px,transparent 2px 7px),repeating-linear-gradient(25deg,rgba(29,26,22,.1) 0 1px,transparent 1px 9px)', 'auto', .75]
      : lin ? ['repeating-linear-gradient(0deg,' + g(.08) + ' 0 1px,transparent 1px 7px),repeating-linear-gradient(90deg,' + g(.08) + ' 0 1px,transparent 1px 7px)', 'auto', .75]
      : ['radial-gradient(circle,' + g(.12) + ' 1px,transparent 1.5px)', '9px 9px', .75],
    grao: () => [nz.grao() + ',' + nz.grao(), '600px,340px', .7],
    salpico: () => [nz.salpico() + ',' + nz.salpico(), '520px,300px', .7],
    fibra: () => [nz.fibra() + ',' + nz.fibra(), '1280px,760px', .7],
    papel: () => [nz.salpico() + ',' + nz.grao() + ',' + nz.fibra(), '520px,600px,1280px', .6],
    reticula: () => ['radial-gradient(circle,' + g(.6) + ' 1.2px,transparent 1.7px)', '9px 9px', .45],
    linho: () => ['repeating-linear-gradient(0deg,' + g(.3) + ' 0 1px,transparent 1px 5px),repeating-linear-gradient(90deg,' + anA(c.bg, .34) + ' 0 1px,transparent 1px 5px)', 'auto', .6],
    hachura: () => ['repeating-linear-gradient(58deg,' + g(.4) + ' 0 1.5px,transparent 1.5px 8px)', 'auto', .55],
    limpo: () => null,
  };
  const tx = (TX[txKey] || TX.auto)();
  const hw = xilo ? 26 : 20, hs = xilo ? 10 : 3;

  return <div data-screen-label={'t=' + Math.floor(time || 0) + 's'} style={{ ...fill, fontFamily: "'Archivo',sans-serif", background: c.bg, overflow: 'hidden' }}>
    {!off.estrelas && <ANSky W={W} H={H} n={Math.round((+p.stars || 160) * (est === 'chapada' || pb ? 1 : .55))} T={T} total={end} par={face} u={u} est={est} c={c} />}
    <svg viewBox="-1150 -1150 2300 2300" style={{ ...abs, left: cx - 1150 * us, top: cy - 1150 * us, width: 2300 * us, height: 2300 * us, overflow: 'visible' }}>
      <defs>
        <filter id="an-rm" x="-4%" y="-4%" width="108%" height="108%"><feTurbulence type="fractalNoise" baseFrequency=".02" numOctaves="1" seed="4" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="14" xChannelSelector="R" yChannelSelector="G" /></filter>
        <filter id="an-rt" x="-4%" y="-8%" width="108%" height="116%"><feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="1" seed="9" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale={6 * u} xChannelSelector="R" yChannelSelector="G" /></filter>
        <pattern id="an-h1" width={hw} height={hw} patternUnits="userSpaceOnUse" patternTransform="rotate(38)"><rect width={hs} height={hw} fill={ln} /></pattern>
        <pattern id="an-h2" width={hw * .7} height={hw * .7} patternUnits="userSpaceOnUse" patternTransform="rotate(-38)"><rect width={hs * .7} height={hw * .7} fill={ln} /></pattern>
        <pattern id="an-ht" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="12" cy="12" r="5.5" fill={ln} /></pattern>
      </defs>
      <g transform={`scale(1 ${cs})`}>
        {col && !off.disco && <circle cx="12" cy="16" r="720" fill={AK} opacity=".3" />}
        {corte && !off.disco && <React.Fragment><circle cx="10" cy="14" r="770" fill={AK} opacity=".25" /><circle r="770" fill={c.acc2} /><circle cx="10" cy="14" r="720" fill={AK} opacity=".3" /></React.Fragment>}
        <g transform={`rotate(${spin})`}>
          {!off.orbitas && R.map((r, i) => <circle key={r} r={r} fill="none" stroke={c.fg} strokeWidth={xilo ? sw * 1.6 : corte ? sw * 2.5 : sw} vectorEffect="non-scaling-stroke" strokeDasharray={col ? '16 12' : i === 2 ? '2 10' : undefined} opacity={[.9, .55, .45][i] * (1 - .55 * face)} />)}
          <g filter={xilo ? 'url(#an-rm)' : undefined}>
            {!off.disco && <circle r="720" fill={lin ? 'none' : ground} stroke={lin ? c.fg : 'none'} strokeWidth={sw} vectorEffect="non-scaling-stroke" />}
            <g transform="translate(-500 -627)">{estados}</g>
            {pb && !off.disco && <circle r="720" fill="url(#an-ht)" opacity=".2" />}
          </g>
        </g>
      </g>
    </svg>
    {[0, 1, 2].map(astro)}
    {frase1}{frase2}
    {pb && <div style={{ ...fill, pointerEvents: 'none', background: 'radial-gradient(ellipse at center,transparent 55%,rgba(29,26,22,.4) 100%)' }} />}
    {tx && <div style={{ ...fill, pointerEvents: 'none', backgroundImage: tx[0], backgroundSize: tx[1], opacity: Math.min(1, tx[2] * (+p.txk || 1)) }} />}
  </div>;
}

function CNAnim(p) {
  const w = +p.w || 1920, h = +p.h || 1080;
  return <CompositionStage key={w + 'x' + h} width={w} height={h} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg={p.estilo === 'pb' ? anPB(AN_PAL[p.ceu] || AN_PAL.nanquim).bg : (AN_PAL[p.ceu] || AN_PAL.nanquim).bg}><ANPiece {...p} w={w} h={h} /></CompositionStage>;
}
window.CNAnim = CNAnim;
