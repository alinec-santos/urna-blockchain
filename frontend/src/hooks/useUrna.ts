import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../constants/contract";

// Declaração para o TypeScript reconhecer a MetaMask no window
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Interfaces exportadas para os componentes
export interface CandidatoInfo {
  numero: number;
  nome: string;
  partido: string;
  votos?: number;
  cadastrado: boolean;
}

export interface ApuracaoGeral {
  validos: number;
  brancos: number;
  nulos: number;
  totalGeral: number;
  candidatos: CandidatoInfo[];
}

export function useUrna() {
  const [account, setAccount] = useState<string | null>(null);
  const [jaVotou, setJaVotou] = useState<boolean>(false);
  const [carregando, setCarregando] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);

  // Obtém o contrato conectado com Provider ou Signer
  const getContract = useCallback(async (withSigner = false) => {
    if (typeof window.ethereum === "undefined") {
      throw new Error("MetaMask ou carteira Web3 não encontrada.");
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    if (withSigner) {
      const signer = await provider.getSigner();
      return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    }
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  }, []);

  // Conectar a carteira do eleitor
  const conectar = async () => {
    try {
      setErro(null);
      if (typeof window.ethereum === "undefined") {
        setErro("Instale uma extensão como MetaMask para interagir com a urna.");
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }
    } catch (err: unknown) {
      const e = err as Error;
      setErro(e.message || "Erro ao conectar carteira.");
    }
  };

  // Verifica se o endereço conectado já votou
  const verificarSeJaVotou = useCallback(async (addr: string) => {
    try {
      const contract = await getContract(false);
      const votou = await contract.jaVotou(addr);
      setJaVotou(votou);
    } catch {
      // Falha silenciosa ao checar status
    }
  }, [getContract]);

  useEffect(() => {
    if (account) {
      verificarSeJaVotou(account);
    }
  }, [account, verificarSeJaVotou]);

  // Consulta dados de um candidato pelo número digitado
  const buscarCandidato = async (numero: number): Promise<CandidatoInfo | null> => {
    try {
      const contract = await getContract(false);
      const c = await contract.candidatos(numero);
      return {
        numero: Number(c.numero),
        nome: c.nome,
        partido: c.partido,
        cadastrado: c.cadastrado,
      };
    } catch {
      return null;
    }
  };

  // Executa o voto nominal (ou nulo, se o número não existir)
  const votar = async (numero: number): Promise<boolean> => {
    setCarregando(true);
    setErro(null);
    try {
      const contract = await getContract(true);
      const tx = await contract.votar(numero);
      await tx.wait(); // Aguarda a mineração na EVM local
      if (account) await verificarSeJaVotou(account);
      setCarregando(false);
      return true;
    } catch (err: unknown) {
      const e = err as Error;
      setErro(e.message || "Erro ao computar o voto.");
      setCarregando(false);
      return false;
    }
  };

  // Executa o voto em branco
  const votarBranco = async (): Promise<boolean> => {
    setCarregando(true);
    setErro(null);
    try {
      const contract = await getContract(true);
      const tx = await contract.votarEmBranco();
      await tx.wait();
      if (account) await verificarSeJaVotou(account);
      setCarregando(false);
      return true;
    } catch (err: unknown) {
      const e = err as Error;
      setErro(e.message || "Erro ao computar o voto em branco.");
      setCarregando(false);
      return false;
    }
  };

  // Apuração instantânea (leitura em tempo real do estado)
  const obterApuracao = async (): Promise<ApuracaoGeral | null> => {
    try {
      const contract = await getContract(false);
      const [validos, brancos, nulos, total, listaNums] = await Promise.all([
        contract.totalVotosValidos(),
        contract.totalVotosBrancos(),
        contract.totalVotosNulos(),
        contract.totalGeralVotos(),
        contract.listarCandidatos(),
      ]);

      const candidatos: CandidatoInfo[] = [];
      for (const num of listaNums) {
        const c = await contract.candidatos(num);
        candidatos.push({
          numero: Number(c.numero),
          nome: c.nome,
          partido: c.partido,
          votos: Number(c.votos),
          cadastrado: c.cadastrado,
        });
      }

      return {
        validos: Number(validos),
        brancos: Number(brancos),
        nulos: Number(nulos),
        totalGeral: Number(total),
        candidatos,
      };
    } catch (err: unknown) {
      const e = err as Error;
      setErro(e.message || "Erro ao consultar apuração.");
      return null;
    }
  };

  return {
    account,
    jaVotou,
    carregando,
    erro,
    conectar,
    buscarCandidato,
    votar,
    votarBranco,
    obterApuracao,
  };
}