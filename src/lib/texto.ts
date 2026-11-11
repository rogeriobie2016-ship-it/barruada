// Utilidades de texto usadas em busca, filtros e jogos.

export function semAcento(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function contem(alvo: string, busca: string): boolean {
  return semAcento(alvo).includes(semAcento(busca.trim()));
}

export function maiuscula(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function slug(s: string): string {
  return semAcento(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Número estável a partir de um texto, para variar capas sem sorteio.
export function semente(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function dominio(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
