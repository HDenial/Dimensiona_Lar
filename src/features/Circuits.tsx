import type { Circuit, Installation } from "../domain/project";
import { calcCircuit } from "../calculations/engine";
import { format } from "../components/Results";
export function Circuits({
  circuits,
  installation,
}: {
  circuits: Circuit[];
  installation: Installation;
}) {
  if (!circuits.length)
    return (
      <div className="info-box">
        Adicione cômodos ou equipamentos para gerar a proposta.
      </div>
    );
  return (
    <>
      {circuits.map((circuit) => {
        const result = calcCircuit(circuit, installation);
        return (
          <div className="circuit-card" key={circuit.id}>
            <h3>{circuit.name}</h3>
            <p>
              {circuit.type} · {circuit.connection ?? "Ligação pendente"} ·
              fases {circuit.phase} · {format(result.v)} V
            </p>
            <p>
              Carga: {format(circuit.p)}{" "}
              {circuit.powerUnit ?? "(unidade pendente)"} · Corrente:{" "}
              {format(result.I)} A
            </p>
            <p>{result.formula}</p>
            <span className="tag warn">{result.status}</span>
          </div>
        );
      })}
    </>
  );
}
