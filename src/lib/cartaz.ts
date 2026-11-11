// Em cartaz: tudo o que o coletivo publicou, separado por tipo.
// O tipo sai do campo "formato" da pauta (planilha) ou do fato de ser um texto hospedado no site.

import { semAcento, slug } from './texto.ts';
import type { Pauta } from './types.ts';

export const GRUPOS = [
  { id: 'video', nome: 'Vídeos', vazio: 'Nenhum vídeo publicado ainda.', arte: 'predio', tom: 'anil', acao: 'Ver o vídeo' },
  { id: 'carrossel', nome: 'Carrosséis', vazio: 'Nenhum carrossel publicado ainda.', arte: 'azulejo', tom: 'barro', acao: 'Ver o post original' },
  { id: 'podcast', nome: 'Podcast', vazio: 'Nenhum episódio publicado ainda.', arte: 'mic', tom: 'nanquim', acao: 'Ouvir o episódio' },
  { id: 'texto', nome: 'Blog e textos', vazio: 'Nenhum texto publicado ainda.', arte: 'livro', tom: 'papel', acao: 'Ler o texto' },
] as const;

export type IdGrupo = (typeof GRUPOS)[number]['id'];

// "Podcast", "Áudio", "Episódio" viram podcast. "Blog", "Texto", "Artigo", "Newsletter" viram texto.
// "Carrossel" e "Post" viram carrossel. O resto (vídeo, story, reels) fica em vídeos.
export function grupoDoFormato(formato: string): IdGrupo {
  const f = semAcento(formato);
  if (/podcast|audio|episodio/.test(f)) return 'podcast';
  if (/blog|texto|artigo|newsletter|coluna|ensaio/.test(f)) return 'texto';
  if (/carrossel|post|estatico/.test(f)) return 'carrossel';
  return 'video';
}

export interface ItemCartaz {
  id: string;
  titulo: string;
  serie: string;
  pilar: string;
  formato: string;
  grupo: IdGrupo;
  resumo: string;
  href: string; // rota interna, sem o prefixo de BASE_PATH
}

export interface TextoDoSite {
  slug: string;
  titulo: string;
  resumo: string;
  autoria: string;
  data: string; // AAAA-MM-DD
  serie: string;
  pilar: string;
}

export function itensEmCartaz(pautas: Pauta[], textos: TextoDoSite[]): ItemCartaz[] {
  const dePautas = pautas
    .filter((p) => p.status === 'Postado')
    .map((p) => ({
      id: p.id,
      titulo: p.titulo,
      serie: p.serie,
      pilar: p.pilar,
      formato: p.formato,
      grupo: grupoDoFormato(p.formato),
      resumo: p.gancho,
      href: `/em-cartaz/${slug(p.id)}/`,
    }));
  const deTextos = [...textos]
    .sort((a, b) => b.data.localeCompare(a.data))
    .map((t) => ({
      id: `texto-${t.slug}`,
      titulo: t.titulo,
      serie: t.serie || 'Blog',
      pilar: t.pilar,
      formato: 'Texto',
      grupo: 'texto' as const,
      resumo: t.resumo,
      href: `/em-cartaz/textos/${t.slug}/`,
    }));
  return [...dePautas, ...deTextos];
}

// Confere o cabeçalho de um texto em Markdown. Devolve a lista de erros.
export function validarTexto(arquivo: string, dados: Record<string, unknown>): string[] {
  const erros: string[] = [];
  if (typeof dados.titulo !== 'string' || dados.titulo.trim() === '') erros.push(`${arquivo}: falta o campo obrigatório "titulo" no cabeçalho`);
  if (typeof dados.data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dados.data)) erros.push(`${arquivo}: o campo "data" precisa estar no formato AAAA-MM-DD, entre aspas`);
  for (const campo of ['resumo', 'autoria', 'serie', 'pilar']) {
    if (dados[campo] !== undefined && typeof dados[campo] !== 'string') erros.push(`${arquivo}: o campo "${campo}" precisa ser texto`);
  }
  if (typeof dados.pilar === 'string' && dados.pilar !== '' && !['Resposta', 'Afirmação'].includes(dados.pilar)) {
    erros.push(`${arquivo}: o campo "pilar" precisa ser Resposta ou Afirmação`);
  }
  return erros;
}
