import { useState } from "react";
import { useUrna, type CandidatoInfo } from "./hooks/useUrna";
import { TelaUrna } from "./components/TelaUrna";
import { TecladoUrna } from "./components/TecladoUrna";
import { PainelApuracao } from "./components/PainelApuracao";
import { sonsUrna } from "./utils/audio";
import "./App.css";

export function App() {
  const {
    account,
    jaVotou,
    carregando,
    erro,
    conectar,
    buscarCandidato,
    votar,
    votarBranco,
    obterApuracao,
  } = useUrna();

  const [digitos, setDigitos] = useState<string[]>([]);
  const [candidato, setCandidato] = useState<CandidatoInfo | null>(null);
  const [isBranco, setIsBranco] = useState<boolean>(false);
  const [etapaFim, setEtapaFim] = useState<boolean>(false);
  const [modalApuracao, setModalApuracao] = useState<boolean>(false);

  const handleDigito = async (digito: string) => {
    if (etapaFim || carregando || jaVotou || isBranco) return;
    if (digitos.length >= 2) return;

    sonsUrna.tocarTecla();
    const novosDigitos = [...digitos, digito];
    setDigitos(novosDigitos);

    if (novosDigitos.length === 2) {
      const numero = Number(novosDigitos.join(""));
      const cand = await buscarCandidato(numero);
      setCandidato(cand);
    }
  };

  const handleBranco = () => {
    if (etapaFim || carregando || jaVotou) return;
    if (digitos.length === 0) {
      sonsUrna.tocarTecla();
      setIsBranco(true);
      setCandidato(null);
    }
  };

  const handleCorrige = () => {
    if (etapaFim || carregando) return;
    sonsUrna.tocarTecla();
    setDigitos([]);
    setIsBranco(false);
    setCandidato(null);
  };

  const handleConfirma = async () => {
    if (etapaFim || carregando || jaVotou) return;
    if (!account) {
      alert("Por favor, conecte a sua carteira MetaMask antes de votar.");
      return;
    }

    if (isBranco) {
      const sucesso = await votarBranco();
      if (sucesso) {
        sonsUrna.tocarFim();
        setEtapaFim(true);
      }
      return;
    }

    if (digitos.length === 2) {
      const numero = Number(digitos.join(""));
      const sucesso = await votar(numero);
      if (sucesso) {
        sonsUrna.tocarFim();
        setEtapaFim(true);
      }
    }
  };

  return (
    <div className="container-aplicacao">
      <header className="cabecalho-app">
        <div className="titulo-bloco">
          <h1>Urna Eletrônica Descentralizada</h1>
          <span className="badge-rede">Ethereum Sepolia</span>
        </div>

        <div className="acoes-cabecalho">
          {account ? (
            <div className="eleitor-info">
              <span className="status-ponto"></span>
              <span className="endereco-carteira">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            </div>
          ) : (
            <button className="btn-conectar" onClick={conectar}>
              Conectar Carteira
            </button>
          )}

          <button
            className="btn-apuracao"
            onClick={() => setModalApuracao(true)}
          >
            Boletim de Urna
          </button>
        </div>
      </header>

      <main className="area-urna">
        <div className="gabinete-urna">
          <div className="secao-tela">
            <TelaUrna
              digitos={digitos}
              candidato={candidato}
              isBranco={isBranco}
              etapaFim={etapaFim}
              carregando={carregando}
              jaVotou={jaVotou}
              erro={erro}
            />
          </div>

          <div className="secao-teclado">
            <TecladoUrna
              onDigito={handleDigito}
              onBranco={handleBranco}
              onCorrige={handleCorrige}
              onConfirma={handleConfirma}
            />
          </div>
        </div>
      </main>

      <PainelApuracao
        aberto={modalApuracao}
        onFechar={() => setModalApuracao(false)}
        carregarApuracao={obterApuracao}
      />
    </div>
  );
}

export default App;