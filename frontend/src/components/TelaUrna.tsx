import React from "react";
import type { CandidatoInfo } from "../hooks/useUrna";

interface TelaUrnaProps {
  digitos: string[];
  candidato: CandidatoInfo | null;
  isBranco: boolean;
  etapaFim: boolean;
  carregando: boolean;
  jaVotou: boolean;
  erro: string | null;
}

export const TelaUrna: React.FC<TelaUrnaProps> = ({
  digitos,
  candidato,
  isBranco,
  etapaFim,
  carregando,
  jaVotou,
  erro,
}) => {
  // Tela de "FIM" após a mineração da transação
  if (etapaFim) {
    return (
      <div className="tela-urna tela-fim">
        <div className="texto-fim">FIM</div>
        <div className="subtexto-fim">VOTO COMPUTADO NA BLOCKCHAIN</div>
      </div>
    );
  }

  // Alerta de que a carteira conectada já votou
  if (jaVotou) {
    return (
      <div className="tela-urna tela-aviso">
        <div className="aviso-titulo">ELEITOR JÁ VOTOU</div>
        <div className="aviso-descricao">
          Esta carteira já registrou seu voto nesta eleição. O smart contract impede voto duplo por endereço.
        </div>
      </div>
    );
  }

  // Estado de espera pela mineração da transação na EVM
  if (carregando) {
    return (
      <div className="tela-urna tela-processando">
        <div className="spinner"></div>
        <div className="processando-texto">GRAVANDO VOTO NA BLOCKCHAIN...</div>
        <div className="processando-sub">Aguardando confirmação do bloco</div>
      </div>
    );
  }

  const doisDigitosPreenchidos = digitos.length === 2;
  const isNulo = doisDigitosPreenchidos && !candidato?.cadastrado && !isBranco;

  return (
    <div className="tela-urna">
      <div className="cabecalho-tela">
        <span className="seu-voto">SEU VOTO PARA</span>
        <span className="cargo">PRESIDENTE</span>
      </div>

      {erro && <div className="alerta-erro">{erro}</div>}

      {isBranco ? (
        <div className="voto-branco-aviso">VOTO EM BRANCO</div>
      ) : (
        <div className="corpo-votacao">
          <div className="linha-numero">
            <span className="rotulo-numero">Número:</span>
            <div className="caixas-digitos">
              <div className={`caixa-digito ${digitos.length === 0 ? "pisca" : ""}`}>
                {digitos[0] || ""}
              </div>
              <div className={`caixa-digito ${digitos.length === 1 ? "pisca" : ""}`}>
                {digitos || ""}
              </div>
            </div>
          </div>

          {candidato?.cadastrado && (
            <div className="dados-candidato">
              <div className="info-linha">
                <span className="info-rotulo">Nome:</span>
                <span className="info-valor">{candidato.nome}</span>
              </div>
              <div className="info-linha">
                <span className="info-rotulo">Partido:</span>
                <span className="info-valor">{candidato.partido}</span>
              </div>
            </div>
          )}

          {isNulo && (
            <div className="dados-candidato nulo">
              <div className="numero-errado">NÚMERO ERRADO</div>
              <div className="voto-nulo-texto">VOTO NULO</div>
            </div>
          )}
        </div>
      )}

      <div className="rodape-tela">
        <div className="rodape-linha">Aperte a tecla:</div>
        <div className="rodape-linha">
          <strong>VERDE</strong> para <strong>CONFIRMAR</strong> este voto
        </div>
        <div className="rodape-linha">
          <strong>LARANJA</strong> para <strong>REINICIAR</strong> este voto
        </div>
      </div>
    </div>
  );
};