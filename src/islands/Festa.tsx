// Estouro de estrelas da marca para comemorar acerto. Some sozinho e respeita prefers-reduced-motion (via CSS).

import { Ilustra } from '../components/marca/Ilustra.tsx';

const PONTAS = Array.from({ length: 10 }, (_, i) => {
  const a = (i / 10) * Math.PI * 2;
  return { dx: `${Math.round(Math.cos(a) * 9)}rem`, dy: `${Math.round(Math.sin(a) * 7)}rem` };
});

// "vez" muda a cada comemoração para a animação recomeçar.
export default function Festa({ vez }: { vez: number }) {
  if (vez === 0) return null;
  return (
    <div className="festa" aria-hidden="true" key={vez}>
      {PONTAS.map((p, i) => (
        <span key={i} style={{ ['--dx' as string]: p.dx, ['--dy' as string]: p.dy }}>
          <Ilustra nome={i % 3 === 0 ? 'sol' : 'estrela'} />
        </span>
      ))}
    </div>
  );
}
