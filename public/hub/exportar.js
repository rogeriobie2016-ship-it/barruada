// Exportação das peças dos hubs em PNG, direto no navegador.
// Os hubs vieram do Claude Design sem botão de baixar: este arquivo acrescenta um.
// Uma "peça" é qualquer bloco de tamanho fixo, com fundo e recorte (largura e altura em px no estilo).
// Depende de html-to-image.js (carregado antes deste arquivo).

(function () {
  var COR = { tinta: '#1D1A16', papel: '#FBF5E8', sol: '#F2B441', barro: '#C63A22' };
  var selecionada = null;
  var barra, lista, tamanho, botao, aviso;

  function ehPeca(el) {
    var s = el.getAttribute('style') || '';
    if (!/width:\s*\d+(\.\d+)?px/.test(s) || !/height:\s*\d+(\.\d+)?px/.test(s)) return false;
    if (!/overflow:\s*hidden/.test(s) || !/background/.test(s)) return false;
    var r = el.getBoundingClientRect();
    return r.width >= 150 && r.height >= 100 && !el.closest('#exportar-barra');
  }

  function pecas() {
    var todas = Array.prototype.filter.call(document.querySelectorAll('div[style]'), ehPeca);
    // Fica só com a peça de fora quando uma está dentro da outra.
    return todas.filter(function (el) {
      return !todas.some(function (outra) { return outra !== el && outra.contains(el); });
    });
  }

  function medida(el) {
    return Math.round(el.offsetWidth) + ' x ' + Math.round(el.offsetHeight);
  }

  function marcar(el) {
    if (selecionada) selecionada.style.outline = '';
    selecionada = el;
    if (el) {
      el.style.outline = '3px solid ' + COR.sol;
      el.style.outlineOffset = '3px';
    }
  }

  function atualizarLista() {
    var achadas = pecas();
    var antes = lista.options.length;
    if (achadas.length === antes && achadas.indexOf(selecionada) >= 0) return;
    lista.innerHTML = '';
    achadas.forEach(function (el, i) {
      var op = document.createElement('option');
      op.value = String(i);
      op.textContent = 'Peça ' + (i + 1) + ' (' + medida(el) + ')';
      lista.appendChild(op);
    });
    if (achadas.indexOf(selecionada) < 0) marcar(achadas[0] || null);
    lista.value = String(Math.max(0, achadas.indexOf(selecionada)));
    botao.disabled = achadas.length === 0;
    aviso.textContent = achadas.length === 0 ? 'Nenhuma peça nesta tela.' : 'Clique numa peça para escolher.';
  }

  // A textura das peças usa filtros SVG definidos fora delas. Para a exportação, entram junto.
  function levarFiltros(el) {
    var ids = {};
    var com = el.querySelectorAll('[style*="url(#"], [filter], [clip-path], [mask], [fill^="url("]');
    Array.prototype.forEach.call(com, function (n) {
      var texto = (n.getAttribute('style') || '') + ' ' + (n.getAttribute('filter') || '') + ' ' + (n.getAttribute('clip-path') || '') + ' ' + (n.getAttribute('mask') || '') + ' ' + (n.getAttribute('fill') || '');
      var re = /url\(["']?#([^"')]+)["']?\)/g;
      var m;
      while ((m = re.exec(texto))) ids[m[1]] = true;
    });
    var caixa = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    caixa.setAttribute('width', '0');
    caixa.setAttribute('height', '0');
    caixa.setAttribute('data-exportar-filtros', '');
    caixa.style.position = 'absolute';
    var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    caixa.appendChild(defs);
    Object.keys(ids).forEach(function (id) {
      var alvo = document.getElementById(id);
      if (alvo && !el.contains(alvo)) defs.appendChild(alvo.cloneNode(true));
    });
    if (defs.childNodes.length === 0) return null;
    el.appendChild(caixa);
    return caixa;
  }

  // As texturas são SVG com ruído dentro de imagem de fundo. Na exportação elas saem pretas,
  // então cada uma vira PNG antes (na página o ruído funciona) e volta ao normal depois.
  function svgParaPng(url) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () {
        var tela = document.createElement('canvas');
        tela.width = (img.naturalWidth || 200) * 2;
        tela.height = (img.naturalHeight || 200) * 2;
        tela.getContext('2d').drawImage(img, 0, 0, tela.width, tela.height);
        try { resolve(tela.toDataURL('image/png')); } catch (e) { resolve(null); }
      };
      img.onerror = function () { resolve(null); };
      img.src = url;
    });
  }

  function prepararTexturas(el) {
    var desfazer = [];
    var nos = [el].concat(Array.prototype.slice.call(el.querySelectorAll('*')));
    var tarefas = nos.map(function (n) {
      var fundo = getComputedStyle(n).backgroundImage;
      if (!fundo || fundo.indexOf('data:image/svg+xml') < 0) return null;
      var urls = [];
      fundo.replace(/url\("(data:image\/svg\+xml[^"]*)"\)/g, function (_, u) { urls.push(u); return _; });
      return Promise.all(urls.map(svgParaPng)).then(function (pngs) {
        var novo = fundo;
        urls.forEach(function (u, i) { if (pngs[i]) novo = novo.split('url("' + u + '")').join('url("' + pngs[i] + '")'); });
        var tamanho = getComputedStyle(n).backgroundSize;
        desfazer.push([n, n.style.backgroundImage, n.style.backgroundSize]);
        n.style.backgroundImage = novo;
        if (tamanho === 'auto') {
          n.style.backgroundSize = urls.map(function () { return 'auto'; }).join(',');
        }
      });
    }).filter(Boolean);
    return Promise.all(tarefas).then(function () {
      return function () { desfazer.forEach(function (d) { d[0].style.backgroundImage = d[1]; d[0].style.backgroundSize = d[2]; }); };
    });
  }

  function nomeDoArquivo(el) {
    var pagina = (document.title || 'peca').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return 'barruada-' + pagina + '-' + Math.round(el.offsetWidth) + 'x' + Math.round(el.offsetHeight) + '.png';
  }

  // A moldura de foto (image-slot) é um componente fechado que trava a exportação.
  // Se a pessoa já pôs uma foto, entra uma cópia simples da imagem no lugar. A moldura em si fica de fora.
  function trocarMolduras(el) {
    var copias = [];
    Array.prototype.forEach.call(el.querySelectorAll('image-slot'), function (moldura) {
      var foto = moldura.shadowRoot && moldura.shadowRoot.querySelector('img');
      if (!foto || !foto.src || !foto.naturalWidth) return;
      var base = moldura.offsetParent || el;
      var a = moldura.getBoundingClientRect();
      var b = base.getBoundingClientRect();
      var escalaTela = b.width / base.offsetWidth || 1;
      var copia = document.createElement('img');
      copia.src = foto.src;
      var estilo = getComputedStyle(foto);
      copia.style.cssText = 'position:absolute;left:' + (a.left - b.left) / escalaTela + 'px;top:' + (a.top - b.top) / escalaTela + 'px;width:' + a.width / escalaTela + 'px;height:' + a.height / escalaTela + 'px;object-fit:' + estilo.objectFit + ';object-position:' + estilo.objectPosition + ';filter:' + estilo.filter;
      moldura.parentNode.insertBefore(copia, moldura);
      copias.push(copia);
    });
    return function () { copias.forEach(function (c) { c.remove(); }); };
  }

  function semMoldura(no) {
    return !(no.tagName && no.tagName.toLowerCase() === 'image-slot');
  }

  function baixar() {
    var el = selecionada;
    if (!el || !window.htmlToImage) return;
    var escala = tamanho.value === 'rede' ? 1080 / el.offsetWidth : Number(tamanho.value);
    var contorno = el.style.outline;
    el.style.outline = '';
    var filtros = levarFiltros(el);
    var tirarCopias = trocarMolduras(el);
    botao.disabled = true;
    aviso.textContent = 'Gerando o PNG.';
    var restaurar = function () {};
    prepararTexturas(el)
      .then(function (volta) {
        restaurar = volta;
        return window.htmlToImage.toPng(el, { pixelRatio: escala, cacheBust: true, filter: semMoldura, style: { transform: 'none', margin: '0' } });
      })
      .then(function (url) {
        var a = document.createElement('a');
        a.href = url;
        a.download = nomeDoArquivo(el);
        document.body.appendChild(a);
        a.click();
        a.remove();
        aviso.textContent = 'PNG baixado: ' + Math.round(el.offsetWidth * escala) + ' x ' + Math.round(el.offsetHeight * escala) + ' px.';
      })
      .catch(function (erro) {
        console.error('exportar:', erro && (erro.message || erro.type || erro));
        aviso.textContent = 'Não deu para gerar o PNG neste navegador.';
      })
      .then(function () {
        restaurar();
        tirarCopias();
        if (filtros) filtros.remove();
        el.style.outline = contorno;
        botao.disabled = false;
      });
  }

  function montarBarra() {
    barra = document.createElement('div');
    barra.id = 'exportar-barra';
    barra.setAttribute('role', 'region');
    barra.setAttribute('aria-label', 'Exportar peça');
    barra.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:99999;display:flex;flex-wrap:wrap;gap:8px;align-items:center;max-width:calc(100vw - 24px);padding:10px 12px;background:' + COR.tinta + ';color:' + COR.papel + ';font:600 13px/1.2 Archivo,system-ui,sans-serif;box-shadow:4px 4px 0 ' + COR.sol;
    var campo = 'font:inherit;padding:8px;border:1px solid ' + COR.papel + ';background:' + COR.papel + ';color:' + COR.tinta + ';border-radius:0';

    lista = document.createElement('select');
    lista.setAttribute('aria-label', 'Peça para exportar');
    lista.style.cssText = campo;
    lista.addEventListener('change', function () { marcar(pecas()[Number(lista.value)] || null); });

    tamanho = document.createElement('select');
    tamanho.setAttribute('aria-label', 'Tamanho do PNG');
    tamanho.style.cssText = campo;
    [['rede', '1080 px de largura'], ['2', 'Dobro do tamanho'], ['1', 'Tamanho da tela'], ['4', 'Quatro vezes (impressão)']].forEach(function (o) {
      var op = document.createElement('option');
      op.value = o[0];
      op.textContent = o[1];
      tamanho.appendChild(op);
    });

    botao = document.createElement('button');
    botao.type = 'button';
    botao.textContent = 'Baixar PNG';
    botao.setAttribute('data-exportar', '');
    botao.style.cssText = 'font:800 14px/1 Archivo,system-ui,sans-serif;padding:11px 14px;border:0;background:' + COR.sol + ';color:' + COR.tinta + ';cursor:pointer;border-radius:0';
    botao.addEventListener('click', baixar);

    aviso = document.createElement('span');
    aviso.setAttribute('role', 'status');
    aviso.setAttribute('aria-live', 'polite');
    aviso.style.cssText = 'flex-basis:100%;font-weight:500';

    barra.appendChild(lista);
    barra.appendChild(tamanho);
    barra.appendChild(botao);
    barra.appendChild(aviso);
    document.body.appendChild(barra);
  }

  function iniciar() {
    montarBarra();
    atualizarLista();
    // Os hubs redesenham a tela a cada troca: confere a lista de tempos em tempos.
    setInterval(atualizarLista, 1200);
    document.addEventListener('click', function (e) {
      if (barra.contains(e.target)) return;
      var achadas = pecas();
      var alvo = achadas.filter(function (el) { return el.contains(e.target); })[0];
      if (alvo && alvo !== selecionada) {
        marcar(alvo);
        lista.value = String(achadas.indexOf(alvo));
      }
    }, true);
  }

  if (document.readyState === 'complete') setTimeout(iniciar, 1500);
  else window.addEventListener('load', function () { setTimeout(iniciar, 1500); });
})();
