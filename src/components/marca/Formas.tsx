// Formas da marca, tiradas do design system (cn-art.js no projeto do Claude Design).
// Todas em caixa 100x100. A cor vem de quem usa, por CSS.

const raios = Array.from({ length: 20 }, (_, i) => {
  const a = (i * Math.PI) / 10;
  const p = (n: number) => `${(50 + 50 * Math.cos(n)).toFixed(1)} ${(50 + 50 * Math.sin(n)).toFixed(1)}`;
  return `M50 50L${p(a - 0.075)}L${p(a + 0.075)}Z`;
}).join('');

export const FORMAS = {
  sol: 'M50 22l20 8 8 20-8 20-20 8-20-8-8-20 8-20zM50 2l6 12H44zM50 98l-6-12h12zM2 50l12-6v12zM98 50l-12 6V44zM16 16l13 5-8 8zM84 16l-5 13-8-8zM16 84l5-13 8 8zM84 84l-13-5 8-8z',
  estrela: 'M50 4L61 36L96 34L68 55L80 92L50 70L18 94L31 56L4 38L39 37Z',
  disco: 'M50 2a48 48 0 1 0 .01 0Z',
  anel: 'M50 2a48 48 0 1 0 .01 0ZM50 14a36 36 0 1 1-.01 0Z',
  duna: 'M0 100C12 62 30 44 50 44S88 62 100 100Z',
  raios,
} as const;

export type NomeForma = keyof typeof FORMAS;

export function Forma({ nome, className }: { nome: NomeForma; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
      <path d={FORMAS[nome]} fillRule="evenodd" />
    </svg>
  );
}
