// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract UrnaEletronica {
    // Estados possíveis do pleito
    enum EstadoEleicao { NaoIniciada, EmAndamento, Encerrada }

    // Dados de cada candidato
    struct Candidato {
        uint256 numero;
        string nome;
        string partido;
        uint256 votos;
        bool cadastrado;
    }

    // Administrador que controla abertura/fechamento da eleição
    address public immutable autoridadeEleitoral;
    EstadoEleicao public estadoAtual;

    // Lista de números para permitir iteração na leitura
    uint256[] public numerosCandidatos;

    // Mapeamentos de estado
    mapping(uint256 => Candidato) public candidatos;
    mapping(address => bool) public jaVotou; // Voto secreto: apenas registra se a carteira já participou

    // Contadores gerais para apuração automática e instantânea
    uint256 public totalVotosValidos;
    uint256 public totalVotosBrancos;
    uint256 public totalVotosNulos;

    // Eventos para auditoria externa
    event EleicaoIniciada();
    event EleicaoEncerrada();
    event CandidatoCadastrado(uint256 indexed numero, string nome, string partido);
    event VotoComputado(address indexed eleitor);

    // Modificadores de controle de acesso e fluxo
    modifier apenasAutoridade() {
        require(msg.sender == autoridadeEleitoral, "Apenas o administrador pode executar");
        _;
    }

    modifier emAndamento() {
        require(estadoAtual == EstadoEleicao.EmAndamento, "Eleicao nao esta em andamento");
        _;
    }

    constructor() {
        autoridadeEleitoral = msg.sender;
        estadoAtual = EstadoEleicao.NaoIniciada;
    }

    // 1. Cadastro prévio de candidatos (apenas antes do início)
    function cadastrarCandidato(
        uint256 _numero,
        string memory _nome,
        string memory _partido
    ) external apenasAutoridade {
        require(estadoAtual == EstadoEleicao.NaoIniciada, "Candidatos so podem ser inseridos antes do inicio");
        require(_numero > 0, "Numero de candidato invalido");
        require(!candidatos[_numero].cadastrado, "Numero ja cadastrado");

        candidatos[_numero] = Candidato({
            numero: _numero,
            nome: _nome,
            partido: _partido,
            votos: 0,
            cadastrado: true
        });

        numerosCandidatos.push(_numero);
        emit CandidatoCadastrado(_numero, _nome, _partido);
    }

    // 2. Abertura da eleição
    function iniciarEleicao() external apenasAutoridade {
        require(estadoAtual == EstadoEleicao.NaoIniciada, "Eleicao ja foi iniciada ou encerrada");
        require(numerosCandidatos.length > 0, "Necessario ao menos um candidato cadastrado");
        estadoAtual = EstadoEleicao.EmAndamento;
        emit EleicaoIniciada();
    }

    // 3. Encerramento da eleição
    function encerrarEleicao() external apenasAutoridade {
        require(estadoAtual == EstadoEleicao.EmAndamento, "Eleicao precisa estar em andamento");
        estadoAtual = EstadoEleicao.Encerrada;
        emit EleicaoEncerrada();
    }

    // 4. Voto nominal ou nulo (modelo brasileiro)
    function votar(uint256 _numero) external emAndamento {
        require(!jaVotou[msg.sender], "Eleitor ja votou");
        jaVotou[msg.sender] = true;

        if (candidatos[_numero].cadastrado) {
            // Voto nominal válido
            candidatos[_numero].votos++;
            totalVotosValidos++;
        } else {
            // Número digitado não existe: computa voto nulo
            totalVotosNulos++;
        }

        emit VotoComputado(msg.sender);
    }

    // 5. Voto em branco (tecla Branco da urna)
    function votarEmBranco() external emAndamento {
        require(!jaVotou[msg.sender], "Eleitor ja votou");
        jaVotou[msg.sender] = true;

        totalVotosBrancos++;
        emit VotoComputado(msg.sender);
    }

    // 6. Funções auxiliares de consulta (auditabilidade)
    function listarCandidatos() external view returns (uint256[] memory) {
        return numerosCandidatos;
    }

    function totalGeralVotos() external view returns (uint256) {
        return totalVotosValidos + totalVotosBrancos + totalVotosNulos;
    }
}