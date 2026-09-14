import type { Project } from "../domain/project";
import {
  apparentPower,
  availablePhases,
  calcCircuit,
} from "../calculations/engine";
export const format = (value: number | null) =>
  value === null ? "Pendente" : value.toFixed(2).replace(".", ",");
export function Results({
  project,
  qdc = false,
}: {
  project: Project;
  qdc?: boolean;
}) {
  const powers = project.circuits.map(apparentPower);
  const total = powers.every((power) => power !== null)
    ? powers.reduce<number>((sum, power) => sum + (power ?? 0), 0)
    : null;
  return (
    <>
      <div className="cards">
        <div className="metric">
          <small>Soma das potências aparentes previstas</small>
          <strong>
            {total === null ? "Pendente" : `${format(total / 1000)} kVA`}
          </strong>
        </div>
        <div className="metric">
          <small>Fases disponíveis</small>
          <strong>{availablePhases(project.installation).join(" / ")}</strong>
        </div>
        <div className="metric">
          <small>Demanda e alimentador</small>
          <strong>Pendentes</strong>
        </div>
        <div className="metric">
          <small>Validação do dimensionamento</small>
          <strong>Pendente</strong>
        </div>
      </div>
      <div className="info-box">
        A soma das previsões em VA não é a demanda simultânea nem a potência
        ativa total. Expansão ({project.installation.expansao}%) e comprimento
        do alimentador ({project.installation.distAlim} m) estão registrados,
        mas seu dimensionamento ainda está pendente.{" "}
        {qdc &&
          "O balanceamento elétrico das fases não foi verificado; não há indicador de desequilíbrio calculado."}
      </div>
      {!project.circuits.length ? (
        <div className="info-box">Crie os circuitos primeiro.</div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  {[
                    "Circuito",
                    "Ligação / fases",
                    "Tensão",
                    "Carga informada",
                    "Previsão aparente",
                    "Corrente calculada",
                    "Seção",
                    "Disjuntor",
                    "ΔV",
                    "Status",
                  ].map((title) => (
                    <th key={title}>{title}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {project.circuits.map((circuit) => {
                  const result = calcCircuit(circuit, project.installation);
                  return (
                    <tr key={circuit.id}>
                      <td>{circuit.name}</td>
                      <td>
                        {circuit.connection ?? "Pendente"} / {circuit.phase}
                      </td>
                      <td>
                        {result.v === null ? "Pendente" : `${result.v} V`}
                      </td>
                      <td>
                        {format(circuit.p)}{" "}
                        {circuit.powerUnit ?? "(unidade desconhecida)"}
                      </td>
                      <td>
                        {result.S === null
                          ? "Pendente"
                          : `${format(result.S)} VA`}
                      </td>
                      <td>
                        {result.I === null
                          ? "Pendente"
                          : `${format(result.I)} A`}
                      </td>
                      <td>Pendente</td>
                      <td>Pendente</td>
                      <td>Pendente</td>
                      <td>
                        <span className="tag warn">{result.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <h3>Memória de cálculo e pendências</h3>
          {project.circuits.map((circuit) => {
            const result = calcCircuit(circuit, project.installation);
            return (
              <div className="result-card" key={circuit.id}>
                <h4>{circuit.name}</h4>
                <p>
                  {result.formula}; carga = {format(circuit.p)}{" "}
                  {circuit.powerUnit ?? "?"}; tensão = {format(result.v)} V; fp
                  = {circuit.fp}; corrente = {format(result.I)} A.
                </p>
                <ul>
                  {result.issues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </>
      )}
      <div className="info-box">
        Proposta preliminar. Posicionamento de tomadas, divisão definitiva de
        circuitos, PE, neutro, DR, DPS e proteção contra choques ainda exigem
        verificação. Nenhum circuito é declarado aprovado.
      </div>
    </>
  );
}
