// Formas das ilustrações do Hub (papéis de cor: m principal, a destaque, p fundo). Gerado a partir do Hub de Design.
window.CN_ART = (function () {
    
    const SOL = 'M50 22l20 8 8 20-8 20-20 8-20-8-8-20 8-20zM50 2l6 12H44zM50 98l-6-12h12zM2 50l12-6v12zM98 50l-12 6V44zM16 16l13 5-8 8zM84 16l-5 13-8-8zM16 84l5-13 8 8zM84 84l-13-5 8-8z';
    const PA = 'M50 36C45.5 30 45 14 49.2 2C52.6 10 54 26 50 36Z';
    const FR = 'M58 42C46 30 30 27 15 35C30 35 44 39 55 47Z', MI = ' translate(116 0) scale(-1 1)';
    const PT = 'M50 50C39 40 39 24 50 15C61 24 61 40 50 50Z', PT2 = 'M50 50C45 43 45 34 50 28C55 34 55 43 50 50Z', CT = 'M13 13h15a15 15 0 0 1-15 15Z';
    const BOT = 'M40 12H60V32C60 42 82 46 82 62V122a8 8 0 0 1-8 8H26a8 8 0 0 1-8-8V62C18 46 40 42 40 32Z';
    const rot = (d, role, angs, cx, cy, extra) => angs.map(a => [d, role, { t: 'rotate(' + a + ' ' + cx + ' ' + cy + ')' + (extra || '') }]);
    const RA = Array.from({ length: 20 }, (_, i) => { const a = i * Math.PI / 10, f = n => (50 + 50 * Math.cos(n)).toFixed(1) + ' ' + (50 + 50 * Math.sin(n)).toFixed(1); return 'M50 50L' + f(a - .075) + 'L' + f(a + .075) + 'Z'; }).join('');
    const E = {
      sol: { n: 'Sol', L: [[SOL, 'm'], ['M50 35l10.5 4.5L65 50l-4.5 10.5L50 65l-10.5-4.5L35 50l4.5-10.5Z', 'a']] },
      estrela: { n: 'Estrela', L: [['M50 4L61 36L96 34L68 55L80 92L50 70L18 94L31 56L4 38L39 37Z', 'm']] },
      lua: { n: 'Lua', L: [['M60 6A45 45 0 1 0 94 66A37 37 0 1 1 60 6Z', 'm'], ['M76 18l3.4 9 9.6.2-7.6 5.8 2.8 9.2-8.2-5.4-8 5.4 2.8-9.2-7.6-5.8 9.6-.2Z', 'a']] },
      jangada: { n: 'Jangada', L: [['M2 90q6-5 12 0t12 0 12 0 12 0 12 0 12 0 12 0 12 0v10H2Z', 'a'], ['M10 76H90L84 86H16Z', 'm'], ['M46 8h3v68h-3Z', 'm'], ['M52 10C68 26 80 48 84 70H52Z', 'm'], ['M43 20C36 38 28 54 18 70H43Z', 'a'], ['M88 70l8 16-3 1-8-15Z', 'm']] },
      catavento: { n: 'Cata-vento', L: [['M48.4 41L51.6 41L54 96L46 96Z', 'm']].concat(rot(PA, 'm', [0, 120, 240], 50, 36), [['M50 31.6a4.4 4.4 0 1 0 .01 0Z', 'a'], ['M4 96C22 88 36 93 50 95C66 97 80 90 96 94V100H4Z', 'a']]) },
      coqueiro: { n: 'Coqueiro', L: [['M45 97C47 78 50 60 56 42l5 2C56 61 54 79 53 97Z', 'm']].concat(rot(FR, 'm', [-28, 8, 46], 58, 42), rot(FR, 'm', [28, -8, -46], 58, 42, MI), [['M53 44a3.4 3.4 0 1 0 .01 0ZM60 47a3.4 3.4 0 1 0 .01 0Z', 'a'], ['M30 97h44v3H30Z', 'm']]) },
      mandacaru: { n: 'Mandacaru', L: [['M44 92V18a6 6 0 0 1 12 0V92Z', 'm'], ['M44 62H32a6 6 0 0 1-6-6V38a6 6 0 0 1 12 0V50h6Z', 'm'], ['M56 74H70a6 6 0 0 0 6-6V46a6 6 0 0 0-12 0V62h-8Z', 'm'], ['M49.2 20h1.6v70h-1.6ZM31.2 38h1.6v14h-1.6ZM69.2 46h1.6v18h-1.6Z', 'p'], ['M50 4a5 5 0 1 0 .01 0ZM32 24a4 4 0 1 0 .01 0Z', 'a'], ['M18 92h64v4H18Z', 'm']] },
      caju: { n: 'Caju', L: [['M50 34C67 32 77 46 75 63C73 81 62 95 50 95C38 95 27 81 25 63C23 46 33 32 50 34Z', 'm'], ['M37 30C33 18 42 8 54 10C63 12 66 21 59 24C54 26 52 22 47 25C43 27 43 31 39 33Z', 'a'], ['M63 24C70 11 84 8 93 13C89 26 76 31 63 24Z', 'm'], ['M35 52c1-6 4-9 8-11l1 3c-3 2-5 5-6 9Z', 'p']] },
      garrafa: { n: 'Garrafa de areia', vb: '0 0 100 140', fixo: true, clip: BOT, L: [
        ['M10 0H90V60H10Z', '#FBF5E8', { clip: 1, o: .35 }], ['M10 50H90V140H10Z', '#2A4BA0', { clip: 1 }], ['M62 58a7 7 0 1 0 .01 0Z', '#F2B441', { clip: 1 }],
        ['M10 86Q32 70 52 83T90 78V140H10Z', '#F2B441', { clip: 1 }],
        ['M33 82C34.5 76 34.5 71 32.5 66l2-.6C37 71 37 77 35.8 82.6ZM33.5 66l-10-2 8-1.5-6-6.5 7.5 4.5 1-8.5 2 8.5 7-4-4.5 6.5 8.5.5-9.5 3Z', '#1D1A16', { clip: 1 }],
        ['M10 95Q30 89 50 96T90 93V140H10Z', '#C63A22', { clip: 1 }], ['M10 104Q30 109 50 103T90 105V140H10Z', '#FBF5E8', { clip: 1 }],
        ['M10 111Q30 107 50 112T90 110V140H10Z', '#2A4BA0', { clip: 1 }], ['M10 119Q30 123 50 118T90 120V140H10Z', '#F2B441', { clip: 1 }],
        ['M10 126Q30 123 50 127T90 125V140H10Z', '#C63A22', { clip: 1 }],
        ['M27 68v42', 'p', { line: '#FBF5E8', sw: 3, o: .6 }], [BOT, 'm', { line: 'm', sw: 3 }], ['M42 2h16v12H42Z', 'a']] },
      azulejo: { n: 'Azulejo', L: [['M6 6H94V94H6ZM13 13V87H87V13Z', 'm']].concat(rot(CT, 'a', [0, 90, 180, 270], 50, 50), rot(PT, 'm', [0, 90, 180, 270], 50, 50), rot(PT2, 'a', [45, 135, 225, 315], 50, 50), [['M50 44a6 6 0 1 0 .01 0Z', 'p']]) },
      casa: { n: 'Platibanda', L: [['M14 40H86V94H14Z', 'm'], ['M10 42V32H24V23H38V14H62V23H76V32H90V42Z', 'a'], ['M43 94V68a7 7 0 0 1 14 0V94Z', 'p'], ['M22 54h13v18H22ZM65 54h13v18H65Z', 'p'], ['M50 20l6 7-6 7-6-7Z', 'p'], ['M6 94h88v4H6Z', 'm']] },
      cadeira: { n: 'Cadeira', L: [['M28 10h44a6 6 0 0 1 6 6v38H22V16a6 6 0 0 1 6-6zM34 20h6v26h-6zM47 20h6v26h-6zM60 20h6v26h-6zM10 40h9v14h-9zM81 40h9v14h-9zM14 56h72v10H14zM18 66h9l-4 30h-7zM73 66h9l2 30h-7z', 'm']] },
      filtro: { n: 'Filtro', L: [['M44 2h12v8H44zM30 10h40l7 34H23zM21 48h58l-4 36H25zM78 62h10v8H78zM34 88h32v10H34z', 'm']] },
      predio: { n: 'Prédio', L: [['M8 30h36v68H8zM52 8h40v90H52zM16 40h8v8h-8zM28 40h8v8h-8zM16 56h8v8h-8zM28 56h8v8h-8zM16 72h8v8h-8zM28 72h8v8h-8zM60 18h8v8h-8zM76 18h8v8h-8zM60 34h8v8h-8zM76 34h8v8h-8zM60 50h8v8h-8zM76 50h8v8h-8zM60 66h8v8h-8zM76 66h8v8h-8z', 'm']] },
      mic: { n: 'Microfone', L: [['M38 4h24a8 8 0 0 1 8 8v32a8 8 0 0 1-8 8H38a8 8 0 0 1-8-8V12a8 8 0 0 1 8-8zM46 56h8v30h-8zM28 86h44v8H28z', 'm']] },
      disco: { n: 'Disco', L: [['M50 2a48 48 0 1 0 .01 0Z', 'm']] },
      anel: { n: 'Anel', L: [['M50 2a48 48 0 1 0 .01 0ZM50 7a43 43 0 1 1-.01 0Z', 'm']] },
      raios: { n: 'Raios', L: [[RA, 'm']] },
      faixa: { n: 'Faixa', L: [['M0 34H100V66H0Z', 'm']] },
      moldura: { n: 'Moldura', L: [['M2 2H98V98H2ZM7 7V93H93V7ZM10 10H90V90H10ZM11 11V89H89V11Z', 'm']] },
      duna: { n: 'Duna', L: [['M0 100C12 62 30 44 50 44S88 62 100 100Z', 'm']] },
      livro: { n: 'Livro', L: [['M4 18l42 8v62L4 80zM96 18l-42 8v62l42-8z', 'm']] }
    };
    return E;
})();
