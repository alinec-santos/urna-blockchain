export const CONTRACT_ADDRESS = "0x94e811c951dbf0c8d4f008d6aac9713cea488125";

export const CONTRACT_ABI = [
  "function estadoAtual() view returns (uint8)",
  "function autoridadeEleitoral() view returns (address)",
  "function totalVotosValidos() view returns (uint256)",
  "function totalVotosBrancos() view returns (uint256)",
  "function totalVotosNulos() view returns (uint256)",
  "function totalGeralVotos() view returns (uint256)",
  "function jaVotou(address) view returns (bool)",
  "function candidatos(uint256) view returns (uint256 numero, string nome, string partido, uint256 votos, bool cadastrado)",
  "function listarCandidatos() view returns (uint256[])",
  "function votar(uint256 _numero) external",
  "function votarEmBranco() external",
  "function iniciarEleicao() external",
  "function encerrarEleicao() external"
];