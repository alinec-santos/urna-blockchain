import React, { useEffect, useState } from "react";
import type { ApuracaoGeral } from "../hooks/useUrna";

interface PainelApuracaoProps {
  aberto: boolean;
  onFechar: () => void;
  carregarApuracao: () => Promise<ApuracaoGeral | null>;
}

export const PainelApuracao: React.FC<PainelApuracaoProps> = ({
  aberto,
  onFechar,
  carregarApuracao,
}) => {
  const [dados, setDados] = useState<ApuracaoGeral | null>(null);
  const [atualizando, setAtualizando] = useState<boolean>(false);

  const atualizar = async () => {
    setAtualizando(true);
    const resultado = await carregarApuracao();
    if (resultado) setDados(resultado);
    setAtualizando(false);
  };

  useEffect(() => {
    if (aberto) {
      atualizar();
    }
  }, [aberto]);

  if (!aberto) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Boletim de Urna (Apuração Instantânea)</h2>
          <button className="btn-fechar" onClick={onFechar}>&times;</button>
        </div>

        <div className="modal-body">
          <p className="modal-destaque">
            Os votos são apurados em tempo real no estado da blockchain. Não há intervenção ou contagem manual.
          </p>

          <div className="resumo-cards">
            <div className="card-metrica">
              <span className="card-rotulo">Total de Votos</span>
              <span className="card-valor">{dados?.totalGeral ?? 0}</span>
            </div>
            <div className="card-metrica">
              <span className="card-rotulo">Votos Válidos</span>
              <span className="card-valor">{dados?.validos ?? 0}</span>
            </div>
            <div className="card-metrica">
              <span className="card-rotulo">Brancos</span>
              <span className="card-valor">{dados?.brancos ?? 0}</span>
            </div>
            <div className="card-metrica">
              <span className="card-rotulo">Nulos</span>
              <span className="card-valor">{dados?.nulos ?? 0}</span>
            </div>
          </div>

          <h3>Votação dos Candidatos</h3>
          <div className="lista-apuracao">
            {dados?.candidatos.map((cand) => {
              const totalValidos = dados.validos || 1;
              const percentual = dados.validos > 0
                ? (((cand.votos ?? 0) / totalValidos) * 100).toFixed(1)
                : "0.0";

              return (
                <div key={cand.numero} className="item-candidato">
                  <div className="candidato-detalhe">
                    <span className="candidato-num">{cand.numero}</span>
                    <div>
                      <strong>{cand.nome}</strong>
                      <div className="partido-texto">{cand.partido}</div>
                    </div>
                  </div>
                  <div className="candidato-votos">
                    <strong>{cand.votos ?? 0} votos</strong>
                    <span className="porcentagem">({percentual}% dos válidos)</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="modal-acoes">
            <button className="btn-atualizar" onClick={atualizar} disabled={atualizando}>
              {atualizando ? "Consultando EVM..." : "Atualizar Contadores"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};