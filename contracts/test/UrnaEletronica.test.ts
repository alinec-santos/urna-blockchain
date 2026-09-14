import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import { network } from "hardhat";

describe("UrnaEletronica", () => {
  let viem: any;
  let urna: any;
  let admin: any;
  let eleitor1: any;
  let eleitor2: any;
  let eleitor3: any;

  beforeEach(async () => {
    const connection = await network.create();
    viem = connection.viem;

    const walletClients = await viem.getWalletClients();

    admin = walletClients.at(0);
    eleitor1 = walletClients.at(1);
    eleitor2 = walletClients.at(2);
    eleitor3 = walletClients.at(3);

    // Deploy do contrato
    urna = await viem.deployContract("UrnaEletronica", [], {
      client: { wallet: admin },
    });

    // Cadastro prévio dos candidatos
    await urna.write.cadastrarCandidato([13n, "Candidato A", "Partido X"], {
      account: admin.account,
    });
    await urna.write.cadastrarCandidato([22n, "Candidato B", "Partido Y"], {
      account: admin.account,
    });
  });

  it("Nao deve permitir votacao antes da abertura da eleicao", async () => {
    await assert.rejects(
      async () => {
        await urna.write.votar([13n], { account: eleitor1.account });
      },
      /Eleicao nao esta em andamento/
    );
  });

  it("Deve computar votos nominais, brancos e nulos com apuracao instantanea", async () => {
    // 1. Iniciar eleição
    await urna.write.iniciarEleicao([], { account: admin.account });

    // 2. Votos de eleitores distintos
    await urna.write.votar([13n], { account: eleitor1.account }); // Eleitor 1 vota nominal (13)
    await urna.write.votarEmBranco([], { account: eleitor2.account }); // Eleitor 2 vota branco
    await urna.write.votar([999n], { account: eleitor3.account }); // Eleitor 3 vota nulo

    // 3. Verificação instantânea do resultado no estado
    const candA = await urna.read.candidatos([13n]);
    const votosCandidatoA = candA.at(3);
    assert.equal(votosCandidatoA, 1n, "Candidato A deveria ter 1 voto");

    const totalValidos = await urna.read.totalVotosValidos();
    const totalBrancos = await urna.read.totalVotosBrancos();
    const totalNulos = await urna.read.totalVotosNulos();
    const totalGeral = await urna.read.totalGeralVotos();

    assert.equal(totalValidos, 1n, "Total de validos incorreto");
    assert.equal(totalBrancos, 1n, "Total de brancos incorreto");
    assert.equal(totalNulos, 1n, "Total de nulos incorreto");
    assert.equal(totalGeral, 3n, "Total geral incorreto");
  });

  it("Deve impedir que o mesmo eleitor vote duas vezes", async () => {
    await urna.write.iniciarEleicao([], { account: admin.account });
    await urna.write.votar([13n], { account: eleitor1.account });

    await assert.rejects(
      async () => {
        await urna.write.votar([22n], { account: eleitor1.account });
      },
      /Eleitor ja votou/
    );
  });

  it("Nao deve permitir votos apos o encerramento da eleicao", async () => {
    await urna.write.iniciarEleicao([], { account: admin.account });
    await urna.write.encerrarEleicao([], { account: admin.account });

    await assert.rejects(
      async () => {
        await urna.write.votar([13n], { account: eleitor1.account });
      },
      /Eleicao nao esta em andamento/
    );
  });
});