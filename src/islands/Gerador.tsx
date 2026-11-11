// Jogo Monte sua novela: escolhe ou sorteia lugar, protagonista e conflito.
// O medidor de clichê sobe se o campo livre tiver termos da lista "cliche".

import { useEffect, useRef, useState } from 'react';
import { medirCliche, montarSinopse, sortear, type Escolhas, type Sinopse } from '../lib/gerador.ts';
import { maiuscula } from '../lib/texto.ts';
import type { Gerador as DadosGerador } from '../lib/types.ts';
import Compartilhar from './Compartilhar.tsx';

const CAMPOS = [
  { chave: 'lugar', nome: 'Lugar' },
  { chave: 'protagonista', nome: 'Protagonista' },
  { chave: 'conflito', nome: 'Conflito' },
] as const;

export default function Gerador({ dados }: { dados: DadosGerador }) {
  const [escolhas, setEscolhas] = useState<Escolhas>({ lugar: '', protagonista: '', conflito: '' });
  const [livre, setLivre] = useState('');
  const [sinopse, setSinopse] = useState<Sinopse | null>(null);
  const [copiado, setCopiado] = useState(false);
  const resultado = useRef<HTMLHeadingElement>(null);

  const medida = medirCliche(livre, dados.cliche);
  const completo = Boolean(escolhas.lugar && escolhas.protagonista && escolhas.conflito);

  useEffect(() => {
    if (sinopse) resultado.current?.focus();
  }, [sinopse]);

  function montar() {
    if (!completo) return;
    setCopiado(false);
    setSinopse(montarSinopse(escolhas));
  }

  async function copiar() {
    if (!sinopse) return;
    const texto = [`Ei, Globo. Toma essa sinopse.`, sinopse.titulo, ...sinopse.frases].join('\n');
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  }

  if (sinopse) {
    return (
      <div className="faixa faixa--sol grao sobre-claro p-5 md:p-8" data-tela="sinopse">
        <p className="rotulo m-0">Ei, Globo. Toma essa sinopse.</p>
        <h2 ref={resultado} tabIndex={-1} className="mt-3 text-4xl md:text-6xl" data-titulo>
          {sinopse.titulo}
        </h2>
        <div className="mt-5 grid max-w-2xl gap-2 text-xl">
          {sinopse.frases.map((f) => (
            <p key={f} className="m-0">{f}</p>
          ))}
        </div>
        {livre.trim() && (
          <p className="m-0 mt-4 max-w-2xl border-t border-nanquim pt-3">
            <span className="rotulo block">Seu tempero</span>
            {livre.trim()}
          </p>
        )}
        {medida.comentario && <p className="caneta m-0 mt-4 -rotate-1 text-3xl text-barro-escuro">{medida.comentario}</p>}
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" className="botao botao-tinta" onClick={copiar}>
            Copiar sinopse
          </button>
          <button
            type="button"
            className="botao border-nanquim"
            onClick={() => setSinopse(null)}
            data-outra
          >
            Montar outra
          </button>
        </div>
        <Compartilhar
          claro
          arquivo="barruada-minha-novela"
          descricao={`Cartão com a sinopse da novela ${sinopse.titulo}.`}
          cartao={{
            fundo: 'sol',
            rotulo: 'Ei, Globo. Toma essa sinopse.',
            titulo: sinopse.titulo,
            linhas: sinopse.frases,
            caneta: medida.comentario || undefined,
          }}
        />
        <p className="m-0 mt-2 min-h-6 text-sm font-bold" role="status" aria-live="polite">
          {copiado ? 'Sinopse copiada. Agora é só colar.' : ''}
        </p>
      </div>
    );
  }

  return (
    <form
      className="border border-linha bg-fundo-alto p-5 md:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        montar();
      }}
      data-tela="montagem"
    >
      <div className="grid gap-4 md:grid-cols-3">
        {CAMPOS.map((c) => (
          <label key={c.chave} className="grid gap-1">
            <span className="rotulo">{c.nome}</span>
            <select
              className="campo"
              value={escolhas[c.chave]}
              onChange={(e) => setEscolhas((atual) => ({ ...atual, [c.chave]: e.target.value }))}
              data-campo={c.chave}
              required
            >
              <option value="">Escolha</option>
              {dados[c.chave].map((op) => (
                <option key={op} value={op}>{maiuscula(op)}</option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <label className="mt-5 grid gap-1">
        <span className="rotulo">Seu tempero (opcional)</span>
        <textarea
          className="campo"
          rows={3}
          value={livre}
          onChange={(e) => setLivre(e.target.value)}
          placeholder="Quer acrescentar um detalhe à trama? Escreva aqui."
          aria-describedby="medidor-ajuda"
          data-livre
        />
      </label>

      <div className="mt-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="rotulo" id="medidor-rotulo">Medidor de clichê</span>
          <span className="text-sm text-texto-suave" id="medidor-ajuda">
            {medida.achados.length === 0 ? 'Limpo até agora.' : `Achei: ${medida.achados.join(', ')}.`}
          </span>
        </div>
        <div
          className="mt-2 h-4 border border-papel"
          role="meter"
          aria-labelledby="medidor-rotulo"
          aria-valuemin={0}
          aria-valuemax={3}
          aria-valuenow={Math.min(3, medida.achados.length)}
          aria-valuetext={`${medida.achados.length} clichê(s)`}
          data-medidor={medida.achados.length}
        >
          <div className="h-full bg-barro transition-[width]" style={{ width: `${medida.nivel * 100}%` }} />
        </div>
        <p className="caneta m-0 mt-2 min-h-9 -rotate-1 text-3xl text-sol" role="status" aria-live="polite" data-caneta>
          {medida.comentario}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="submit" className="botao botao-sol sobre-claro" disabled={!completo} data-montar>
          Montar sinopse
        </button>
        <button type="button" className="botao botao-linha" onClick={() => setEscolhas(sortear(dados))} data-sortear>
          Sortear
        </button>
      </div>
    </form>
  );
}
