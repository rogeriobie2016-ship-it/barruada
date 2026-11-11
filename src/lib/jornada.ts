// Jornada narrativa: a pessoa escreve a própria história escolhendo, em cada etapa da jornada do herói,
// entre dois caminhos. Um é o clichê da TV, o outro é o Nordeste de hoje. Ela não sabe qual é qual.

import { embaralhar } from './quiz.ts';
import type { EtapaJornada } from './types.ts';

export type Tipo = 'cliche' | 'troca';

export interface Passo {
  etapa: string;
  opcoes: { texto: string; tipo: Tipo }[];
}

export function montarPassos(etapas: readonly EtapaJornada[], sorteio: () => number = Math.random): Passo[] {
  return etapas.map((e) => ({
    etapa: e.etapa,
    opcoes: embaralhar(
      [
        { texto: e.cliche, tipo: 'cliche' as const },
        { texto: e.troca, tipo: 'troca' as const },
      ],
      sorteio,
    ),
  }));
}

export interface Veredito {
  cliches: number;
  total: number;
  lado: 'tv' | 'meio' | 'verdade';
  titulo: string;
  texto: string;
}

export function veredito(escolhas: Tipo[]): Veredito {
  const total = escolhas.length;
  const cliches = escolhas.filter((t) => t === 'cliche').length;
  const fatia = total === 0 ? 0 : cliches / total;
  if (fatia >= 0.6) {
    return {
      cliches, total, lado: 'tv',
      titulo: 'Você caiu no estereótipo da TV',
      texto: 'Sua história ficou com cara de novela das seis. A caneta corrigiu cada clichê aí embaixo.',
    };
  }
  if (fatia > 0.25) {
    return {
      cliches, total, lado: 'meio',
      titulo: 'Meio novela, meio Nordeste de verdade',
      texto: 'Você escapou de uma parte dos clichês. Veja onde o roteiro da televisão ainda puxou.',
    };
  }
  return {
    cliches, total, lado: 'verdade',
    titulo: 'Você contou o Nordeste de verdade',
    texto: cliches === 0 ? 'Nenhum clichê. Essa história a televisão ainda não fez.' : 'Quase sem clichê. Essa história a televisão ainda não fez.',
  };
}
