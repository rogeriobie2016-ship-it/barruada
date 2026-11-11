// Botão que gera o cartão 1080x1350 em PNG, com a marca, para compartilhar ou baixar.

import { useEffect, useState } from 'react';
import { ALTURA, desenharCartao, LARGURA, type Cartao } from '../lib/cartao.ts';

export type DadosCartao = Omit<Cartao, 'marca' | 'assinatura'>;

interface Props {
  cartao: DadosCartao;
  arquivo: string; // nome do PNG, sem extensão
  descricao: string; // texto alternativo da imagem
  claro?: boolean; // true quando o botão fica sobre fundo amarelo
}

const MARCA = { marca: 'Barruada', assinatura: 'O Nordeste que a novela não mostra' };

export default function Compartilhar({ cartao, arquivo, descricao, claro = false }: Props) {
  const [url, setUrl] = useState('');
  const [blob, setBlob] = useState<Blob | null>(null);
  const [estado, setEstado] = useState<'parado' | 'gerando' | 'erro'>('parado');
  const [podeEnviar, setPodeEnviar] = useState(false);

  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);

  async function gerar() {
    setEstado('gerando');
    try {
      const png = await desenharCartao({ ...cartao, ...MARCA });
      setBlob(png);
      setUrl(URL.createObjectURL(png));
      const teste = new File([png], `${arquivo}.png`, { type: 'image/png' });
      setPodeEnviar(typeof navigator.canShare === 'function' && navigator.canShare({ files: [teste] }));
      setEstado('parado');
    } catch {
      setEstado('erro');
    }
  }

  async function enviar() {
    if (!blob) return;
    try {
      await navigator.share({ files: [new File([blob], `${arquivo}.png`, { type: 'image/png' })], title: MARCA.marca });
    } catch {
      // A pessoa fechou a janela de compartilhar: nada a fazer.
    }
  }

  return (
    <div className="mt-6" data-compartilhar>
      {!url && (
        <button
          type="button"
          className={`botao ${claro ? 'botao-tinta' : 'botao-sol sobre-claro'}`}
          onClick={gerar}
          disabled={estado === 'gerando'}
          data-gerar-cartao
        >
          {estado === 'gerando' ? 'Desenhando o cartão' : 'Gerar cartão para compartilhar'}
        </button>
      )}
      <p className="m-0 mt-2 text-sm font-bold" role="status" aria-live="polite">
        {estado === 'erro' ? 'Não deu para gerar o cartão neste navegador.' : url ? 'Cartão pronto.' : ''}
      </p>
      {url && (
        <div className="mt-2 grid gap-3 md:grid-cols-[14rem_1fr] md:items-end">
          <img
            src={url}
            width={LARGURA}
            height={ALTURA}
            alt={descricao}
            className="h-auto w-full max-w-56 border border-nanquim"
            data-cartao
          />
          <div className="flex flex-wrap gap-3">
            {podeEnviar && (
              <button type="button" className={`botao ${claro ? 'botao-tinta' : 'botao-sol sobre-claro'}`} onClick={enviar}>
                Compartilhar
              </button>
            )}
            <a href={url} download={`${arquivo}.png`} className={`botao ${claro ? 'border-nanquim' : 'botao-linha'}`} data-baixar>
              Baixar PNG
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
