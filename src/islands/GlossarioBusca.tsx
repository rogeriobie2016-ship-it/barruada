// Dicionário da Barruada em modo consulta: busca por termo, significado ou lugar.

import { useMemo, useState } from 'react';
import { contem, slug } from '../lib/texto.ts';
import type { Termo } from '../lib/types.ts';

function curta(frase: string): boolean {
  return frase.trim().split(/\s+/).length <= 12;
}

export default function GlossarioBusca({ termos }: { termos: Termo[] }) {
  const [busca, setBusca] = useState('');
  const visiveis = useMemo(
    () =>
      termos.filter(
        (t) => !busca.trim() || [t.termo, t.significado, t.onde].some((campo) => contem(campo, busca)),
      ),
    [termos, busca],
  );

  return (
    <div>
      <form role="search" aria-label="Buscar no dicionário" onSubmit={(e) => e.preventDefault()} className="max-w-xl">
        <label className="grid gap-1">
          <span className="rotulo">Buscar palavra</span>
          <input
            type="search"
            className="campo"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Palavra, significado ou estado"
          />
        </label>
        <p className="m-0 mt-2 text-sm text-texto-suave" role="status" aria-live="polite">
          {visiveis.length === 1 ? '1 palavra' : `${visiveis.length} palavras`}
        </p>
      </form>

      {visiveis.length === 0 && <p className="mt-8 text-lg">Essa a gente ainda não anotou.</p>}

      <dl className="m-0 mt-6 grid gap-x-8 md:grid-cols-2">
        {visiveis.map((t) => (
          <div key={t.termo} id={slug(t.termo)} className="border-t border-linha py-5">
            <dt className="font-titulo text-3xl font-extrabold tracking-[-0.05em] text-sol">{t.termo}</dt>
            <dd className="m-0 mt-1">
              <p className="m-0 text-lg">{t.significado}</p>
              {t.exemplo &&
                (curta(t.exemplo) ? (
                  <p className="caneta m-0 mt-2 text-2xl text-papel">{t.exemplo}</p>
                ) : (
                  <p className="m-0 mt-2 italic">{t.exemplo}</p>
                ))}
              {t.onde && (
                <p className="m-0 mt-2 text-sm text-texto-suave">
                  <span className="rotulo">Onde se ouve: </span>
                  {t.onde}
                </p>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
