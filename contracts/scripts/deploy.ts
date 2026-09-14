import { network } from "hardhat";

async function main() {
  console.log("----------------------------------------------------");
  console.log("🚀 Iniciando o deploy da Urna Eletronica Descentralizada...");

  // Conecta à rede (local simulation ou nó localhost)
  const { viem, networkName } = await network.create();
  console.log(`🌐 Rede conectada: ${networkName}`);

  const walletClients = await viem.getWalletClients();
  const admin = walletClients.at(0);
  console.log(`👤 Autoridade Eleitoral (Deployer): ${admin.account.address}`);

  // 1. Deploy do Smart Contract
  const urna = await viem.deployContract("UrnaEletronica", [], {
    client: { wallet: admin },
  });

  console.log(`✅ Contrato UrnaEletronica implantado em: ${urna.address}`);

  // 2. Cadastro de Candidatos Iniciais (Simulação Presidencial)
  console.log("\n🗳️ Cadastrando candidatos iniciais...");

  const candidatosIniciais = [
    { numero: 13n, nome: "Candidata Ana Silva", partido: "Partido da Tecnologia (PTec)" },
    { numero: 22n, nome: "Candidato Bruno Costa", partido: "Partido da Inovacao (PI)" },
    { numero: 30n, nome: "Candidata Carla Dias", partido: "Partido do Futuro (PF)" },
  ];

  for (const c of candidatosIniciais) {
    await urna.write.cadastrarCandidato([c.numero, c.nome, c.partido], {
      account: admin.account,
    });
    console.log(`  -> Cadastrado: [${c.numero}] ${c.nome} - ${c.partido}`);
  }

  // 3. Abertura Oficial da Eleição
  console.log("\n🟢 Abrindo a eleição para recebimento de votos...");
  await urna.write.iniciarEleicao([], { account: admin.account });

  const estado = await urna.read.estadoAtual();
  console.log(`📢 Status da eleição: ${estado === 1 ? "Em Andamento (Aberta)" : estado}`);

  console.log("\n📋 Resumo para o Frontend:");
  console.log(`   VITE_CONTRACT_ADDRESS="${urna.address}"`);
  console.log("----------------------------------------------------");
}

main().catch((error) => {
  console.error("❌ Erro durante o deploy:", error);
  process.exitCode = 1;
});