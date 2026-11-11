// Vídeos da biblioteca: referências que já existem (YouTube, Instagram) e produções do coletivo.
// O site nunca hospeda o vídeo: só incorpora o tocador oficial da plataforma, e só depois do toque.

export interface Video {
  titulo: string;
  autoria: string;
  url: string; // link do YouTube ou do Instagram
  origem: 'referencia' | 'coletivo';
  uf: string;
  por_que: string;
  checagem: 'ok' | 'conferir';
}

export interface Tocador {
  plataforma: 'youtube' | 'instagram';
  id: string;
  embed: string;
  vertical: boolean;
}

// Aceita os formatos comuns de link e devolve o endereço de incorporação. null se não reconhecer.
export function tocadorDe(url: string): Tocador | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\.|^m\./, '');
  const partes = u.pathname.split('/').filter(Boolean);
  const valido = (id: string | null | undefined): id is string => typeof id === 'string' && /^[A-Za-z0-9_-]{5,20}$/.test(id);

  if (host === 'youtu.be' && valido(partes[0])) return youtube(partes[0], false);
  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (partes[0] === 'watch' && valido(u.searchParams.get('v'))) return youtube(u.searchParams.get('v')!, false);
    if ((partes[0] === 'shorts' || partes[0] === 'embed' || partes[0] === 'live') && valido(partes[1])) return youtube(partes[1], partes[0] === 'shorts');
  }
  if (host === 'instagram.com' && ['p', 'reel', 'reels', 'tv'].includes(partes[0]) && valido(partes[1])) {
    const tipo = partes[0] === 'reels' ? 'reel' : partes[0];
    return { plataforma: 'instagram', id: partes[1], embed: `https://www.instagram.com/${tipo}/${partes[1]}/embed/`, vertical: true };
  }
  return null;
}

function youtube(id: string, vertical: boolean): Tocador {
  return { plataforma: 'youtube', id, embed: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`, vertical };
}

export function videosPublicos(videos: Video[]): Video[] {
  return videos.filter((v) => v.checagem === 'ok' && tocadorDe(v.url) !== null);
}

export function validarVideos(dado: unknown): string[] {
  if (!Array.isArray(dado)) return ['videos.json: raiz: precisa ser uma lista'];
  const erros: string[] = [];
  dado.forEach((v, i) => {
    const onde = `videos.json: vídeo ${i + 1}`;
    if (typeof v !== 'object' || v === null) {
      erros.push(`${onde}: precisa ser um objeto`);
      return;
    }
    const o = v as Record<string, unknown>;
    if (typeof o.titulo !== 'string' || o.titulo.trim() === '') erros.push(`${onde}: o campo obrigatório "titulo" está vazio`);
    for (const campo of ['autoria', 'uf', 'por_que']) {
      if (typeof o[campo] !== 'string') erros.push(`${onde}: o campo "${campo}" precisa ser texto`);
    }
    if (typeof o.url !== 'string' || tocadorDe(o.url) === null) erros.push(`${onde}: o campo "url" precisa ser um link de vídeo do YouTube ou do Instagram`);
    if (o.origem !== 'referencia' && o.origem !== 'coletivo') erros.push(`${onde}: o campo "origem" precisa ser "referencia" ou "coletivo"`);
    if (o.checagem !== 'ok' && o.checagem !== 'conferir') erros.push(`${onde}: o campo "checagem" precisa ser "ok" ou "conferir"`);
  });
  return erros;
}
