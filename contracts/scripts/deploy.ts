import { network } from "hardhat";

async function main() {
  console.log("----------------------------------------------------");
  console.log("🚀 Iniciando o deploy da Urna Eletronica Descentralizada...");

  const { viem, networkName } = await network.create();
  console.log(`🌐 Rede conectada: ${networkName}`);

  const publicClient = await viem.getPublicClient();
  const walletClients = await viem.getWalletClients();
  const admin = walletClients.at(0);
  console.log(`👤 Autoridade Eleitoral (Deployer): ${admin.account.address}`);

  // 1. Deploy do Smart Contract
  const urna = await viem.deployContract("UrnaEletronica", [], {
    client: { wallet: admin },
  });
  console.log(`✅ Contrato UrnaEletronica implantado em: ${urna.address}`);

  // 2. Cadastro de Candidatos Iniciais (Simulação Presidencial)
  console.log("\n🗳️ Cadastrando candidatos iniciais na Sepolia...");

  const candidatosIniciais = [
    { numero: 13n, nome: "Candidata Ana Silva", partido: "Partido da Tecnologia (PTec)" },
    { numero: 22n, nome: "Candidato Bruno Costa", partido: "Partido da Inovacao (PI)" },
    { numero: 30n, nome: "Candidata Carla Dias", partido: "Partido do Futuro (PF)" },
  ];

  for (const c of candidatosIniciais) {
    console.log(`  -> Enviando transação do candidato [${c.numero}]...`);
    const hash = await urna.write.cadastrarCandidato([c.numero, c.nome, c.partido], {
      account: admin.account,
    });
    // Aguarda a confirmação no bloco da Sepolia
    await publicClient.waitForTransactionReceipt({ hash });
    console.log(`  -> Confirmado na rede: [${c.numero}] ${c.nome} - ${c.partido}`);
  }

  // 3. Abertura Oficial da Eleição
  console.log("\n🟢 Abrindo a eleição para recebimento de votos...");
  const txIniciar = await urna.write.iniciarEleicao([], { account: admin.account });
  await publicClient.waitForTransactionReceipt({ hash: txIniciar });

  const estado = await urna.read.estadoAtual();
  console.log(`📢 Status da eleição: ${estado === 1 ? "Em Andamento (Aberta)" : estado}`);

  console.log("\n📋 Endereço para usar no Frontend:");
  console.log(`   ${urna.address}`);
  console.log("----------------------------------------------------");
}

main().catch((error) => {
  console.error("❌ Erro durante o deploy:", error);
  process.exitCode = 1;
});