import { renderToStaticMarkup } from "react-dom/server";
import { Results } from "../components/Results";
import type { Project } from "../domain/project";
import { reference } from "../calculations/reference";

export function createReport(project: Project) {
  return (
    "<!doctype html>" +
    renderToStaticMarkup(
      <html lang="pt-BR">
        <head>
          <meta charSet="utf-8" />
          <title>Relatório — DimensionaLar</title>
          <style>
            {
              "body{font:14px Arial;max-width:1100px;margin:30px auto;color:#111;padding:16px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:8px;text-align:left}th{background:#eee}.info-box{padding:12px;background:#eef6ff;margin:18px 0}.cards{display:flex;gap:20px;margin:20px 0}.metric strong{display:block}.warn{color:#92400e}@media print{body{margin:0;padding:0}table{font-size:11px}}"
            }
          </style>
        </head>
        <body>
          <h1>Relatório preliminar — DimensionaLar</h1>
          <p>
            Ferramenta acadêmica de apoio ao dimensionamento de instalação
            residencial.
          </p>
          <h2>Dados da instalação</h2>
          <p>
            Sistema: {project.installation.sistema} | {project.installation.vf}{" "}
            V FN | {project.installation.vff} V FF | {project.installation.freq}{" "}
            Hz
          </p>
          <p>
            Material: {project.installation.material} | Isolação:{" "}
            {project.installation.isolacao} | Temperatura:{" "}
            {project.installation.temp} °C | Queda limite:{" "}
            {project.installation.quedaLimite}%
          </p>
          <h2>Circuitos</h2>
          <Results project={project} />
          <p>
            Critérios: {reference.version}. A seleção definitiva exige
            verificação das condições reais da instalação e das referências
            normativas aplicáveis. Este relatório não substitui projeto
            elétrico.
          </p>
          <h2>Referências consultadas</h2>
          <ul>
            {reference.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url}>{source.title}</a>: {source.scope}
              </li>
            ))}
          </ul>
          <p>{reference.normativeValidation}</p>
        </body>
      </html>,
    )
  );
}
