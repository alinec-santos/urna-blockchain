import React from "react";

interface TecladoUrnaProps {
  onDigito: (digito: string) => void;
  onBranco: () => void;
  onCorrige: () => void;
  onConfirma: () => void;
}

export const TecladoUrna: React.FC<TecladoUrnaProps> = ({
  onDigito,
  onBranco,
  onCorrige,
  onConfirma,
}) => {
  const numeros = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

  return (
    <div className="teclado-urna">
      <div className="topo-teclado">
        <div className="brasao-urna">JUSTIÇA ELEITORAL</div>
      </div>

      <div className="grade-numerica">
        {numeros.map((n) => (
          <button
            key={n}
            type="button"
            className={`btn-teclado btn-num btn-${n}`}
            onClick={() => onDigito(n)}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="acoes-teclado">
        <button type="button" className="btn-teclado btn-branco" onClick={onBranco}>
          BRANCO
        </button>
        <button type="button" className="btn-teclado btn-corrige" onClick={onCorrige}>
          CORRIGE
        </button>
        <button type="button" className="btn-teclado btn-confirma" onClick={onConfirma}>
          CONFIRMA
        </button>
      </div>
    </div>
  );
};

export default TecladoUrna;