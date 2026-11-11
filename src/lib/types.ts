// Tipos de cada arquivo de src/data. A validação em tempo de build fica em validate.ts.

export const STATUS = ['Ideia', 'Roteiro pré-pronto', 'Em revisão', 'Em produção', 'Pronto', 'Postado'] as const;
export type Status = (typeof STATUS)[number];

export const PILARES = ['Resposta', 'Afirmação'] as const;
export type Pilar = (typeof PILARES)[number];

export interface Pauta {
  id: string;
  titulo: string;
  serie_id: string;
  serie: string;
  pilar: Pilar;
  formato: string;
  gancho: string;
  esforco: string;
  status: Status;
  responsavel: string;
  quem_faz_sugestao: string;
  roteiro_id: string;
  roteiro_url: string;
  post_url: string;
  data_alvo: string;
}

export const CHAVES_PAUTA = [
  'id', 'titulo', 'serie_id', 'serie', 'pilar', 'formato', 'gancho', 'esforco', 'status',
  'responsavel', 'quem_faz_sugestao', 'roteiro_id', 'roteiro_url', 'post_url', 'data_alvo',
] as const satisfies readonly (keyof Pauta)[];

export interface Serie {
  id: string;
  nome: string;
  pilar: Pilar;
  esforco: string;
  premissa: string;
  quem_faz: string;
  episodios: string[];
}

export type Checagem = 'ok' | 'conferir';

export interface ItemBiblioteca {
  titulo: string;
  autoria: string;
  uf: string;
  ano: string;
  por_que: string;
  uso: string;
  checagem: Checagem;
  fontes: string[];
}

export interface SecaoBiblioteca {
  secao: string;
  intro: string;
  itens: ItemBiblioteca[];
}

export interface Termo {
  termo: string;
  significado: string;
  exemplo: string;
  onde: string;
}

export interface QuizItem {
  afirmacao: string;
  resposta: 'nordeste' | 'novela';
  explicacao: string;
  fonte: string;
}

export interface Gerador {
  lugar: string[];
  protagonista: string[];
  conflito: string[];
  cliche: string[];
}

export interface EtapaJornada {
  etapa: string;
  cliche: string;
  troca: string;
}

export interface Jogos {
  quiz: QuizItem[];
  bingo: string[];
  gerador: Gerador;
  jornada: EtapaJornada[];
}

export interface Membro {
  nome: string;
  estado: string;
  area: string;
  topa: string[];
  link: string;
}

export interface Site {
  nome: string;
  assinatura: string;
  significado: string;
  manifesto: string[];
  tokens: Record<string, string>;
  design_system_v1: string;
  mapa_credito: string;
  novela: {
    titulo: string;
    emissora: string;
    faixa: string;
    estreia: string;
    autor_citado: string;
    fontes: string[];
  };
  status: string[];
  drive: Record<string, string>;
  redes: Record<string, string>;
}
