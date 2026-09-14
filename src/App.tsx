import { useState } from "react";
import { createProject, uid, type Project } from "./domain/project";
import { createExample } from "./domain/example";
import { suggestCircuits } from "./calculations/engine";
import { InstallationForm } from "./features/InstallationForm";
import { Rooms } from "./features/Rooms";
import { Loads } from "./features/Loads";
import { Circuits } from "./features/Circuits";
import { Results } from "./components/Results";
import { download, exportProject, importProject } from "./io/project";

const steps = [
  "Instalação",
  "Cômodos",
  "Iluminação",
  "Tomadas",
  "Equipamentos",
  "Circuitos",
  "Dimensionamento",
  "QDC e relatório",
];
const titles = [
  "Dados da instalação",
  "Cômodos",
  "Iluminação",
  "Tomadas de uso geral",
  "Equipamentos / TUE",
  "Circuitos",
  "Dimensionamento preliminar",
  "Quadro de distribuição e relatório",
];
export default function App() {
  const [project, setProject] = useState(createProject);
  const [error, setError] = useState("");
  const step = project.step;
  function changeInputs(transform: (current: Project) => Project) {
    setProject((current) => {
      const next = transform(current);
      return { ...next, schemaVersion: 2, circuits: suggestCircuits(next) };
    });
  }
  function showStep(next: number) {
    setProject((current) => ({
      ...current,
      step: Math.max(1, Math.min(8, next)),
    }));
  }
  async function report() {
    const popup = window.open("", "_blank");
    if (popup) popup.opener = null;
    try {
      const { createReport } = await import("./io/report");
      const html = createReport(project);
      if (popup && !popup.closed) {
        popup.document.write(html);
        popup.document.close();
        popup.focus();
        popup.print();
      } else download(html, "relatorio-dimensionalar.html", "text/html");
    } catch {
      popup?.close();
      setError("Não foi possível gerar o relatório. Tente novamente.");
    }
  }
  return (
    <>
      <header className="topbar">
        <div>
          <span className="eyebrow">
            ENGENHARIA ELÉTRICA • FERRAMENTA ACADÊMICA
          </span>
          <h1>DimensionaLar</h1>
          <p>
            Apoio ao dimensionamento preliminar de instalações elétricas
            residenciais.
          </p>
        </div>
        <div className="top-actions">
          <button
            className="secondary"
            onClick={() => {
              setProject(createExample());
              setError("");
            }}
          >
            Carregar exemplo
          </button>
          <button
            className="primary"
            onClick={() =>
              download(
                exportProject(project),
                "projeto-dimensionamento.json",
                "application/json",
              )
            }
          >
            Exportar JSON
          </button>
          <label className="file-btn secondary">
            Importar JSON
            <input
              type="file"
              accept=".json,application/json"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (!file) return;
                try {
                  if (file.size > 5_000_000)
                    throw new Error("O arquivo deve ter até 5 MB.");
                  const imported = importProject(await file.text());
                  setProject({ ...imported, step: 1 });
                  setError(
                    imported.schemaVersion === 1
                      ? "Arquivo legado: dados preservados. Recalcule a proposta para atualizar unidades e ligações; os circuitos antigos não são aprovados."
                      : "",
                  );
                } catch (reason) {
                  setError(
                    reason instanceof Error ? reason.message : "JSON inválido.",
                  );
                }
              }}
            />
          </label>
        </div>
      </header>
      <div className="layout">
        <aside className="sidebar">
          <nav aria-label="Etapas do projeto">
            {steps.map((label, index) => (
              <button
                key={label}
                className={`step ${step === index + 1 ? "active" : ""}`}
                aria-current={step === index + 1 ? "step" : undefined}
                onClick={() => showStep(index + 1)}
              >
                <b>{index + 1}</b>
                {label}
              </button>
            ))}
          </nav>
          <div className="side-note">
            <strong>Importante</strong>
            <p>
              O resultado é preliminar e educacional. Os valores normativos e
              tabelas devem ser validados pelo responsável técnico e pela edição
              vigente da ABNT NBR 5410.
            </p>
          </div>
        </aside>
        <main className="content">
          {error && (
            <div className="info-box bad" role="alert">
              {error}
            </div>
          )}
          <section className="panel active" aria-labelledby="panel-title">
            <div className="panel-head">
              <h2 id="panel-title">{titles[step - 1]}</h2>
              {step === 2 && (
                <button
                  className="primary"
                  onClick={() =>
                    changeInputs((current) => ({
                      ...current,
                      rooms: [
                        ...current.rooms,
                        {
                          id: uid(),
                          name: `Cômodo ${current.rooms.length + 1}`,
                          type: "Quarto",
                          l: 3,
                          w: 3,
                          lamp: 0,
                        },
                      ],
                    }))
                  }
                >
                  + Adicionar cômodo
                </button>
              )}
              {step === 5 && (
                <button
                  className="primary"
                  onClick={() =>
                    changeInputs((current) => ({
                      ...current,
                      loads: [
                        ...current.loads,
                        {
                          id: uid(),
                          type: "Chuveiro",
                          name: "",
                          room: "",
                          p: 5500,
                          v: current.installation.vf,
                          fp: 1,
                          q: 1,
                          d: 10,
                        },
                      ],
                    }))
                  }
                >
                  + Adicionar equipamento
                </button>
              )}
              {step === 6 && (
                <button
                  className="primary"
                  onClick={() =>
                    setProject((current) => ({
                      ...current,
                      schemaVersion: 2,
                      circuits: suggestCircuits(current),
                    }))
                  }
                >
                  Recalcular sugestões
                </button>
              )}
            </div>
            {step === 1 && (
              <InstallationForm
                value={project.installation}
                onChange={(installation) =>
                  changeInputs((current) => ({ ...current, installation }))
                }
              />
            )}
            {step >= 2 && step <= 4 && (
              <Rooms
                step={step}
                rooms={project.rooms}
                onChange={(room) =>
                  changeInputs((current) => ({
                    ...current,
                    rooms: current.rooms.map((item) =>
                      item.id === room.id ? room : item,
                    ),
                  }))
                }
                onRemove={(id) =>
                  changeInputs((current) => ({
                    ...current,
                    rooms: current.rooms.filter((room) => room.id !== id),
                  }))
                }
              />
            )}
            {step === 5 && (
              <Loads
                rooms={project.rooms}
                loads={project.loads}
                onChange={(load) =>
                  changeInputs((current) => ({
                    ...current,
                    loads: current.loads.map((item) =>
                      item.id === load.id ? load : item,
                    ),
                  }))
                }
                onRemove={(id) =>
                  changeInputs((current) => ({
                    ...current,
                    loads: current.loads.filter((load) => load.id !== id),
                  }))
                }
              />
            )}
            {step === 6 && (
              <>
                <p className="muted">
                  Os circuitos são propostos automaticamente a partir das
                  entradas. A divisão definitiva e o balanceamento ainda estão
                  pendentes.
                </p>
                <Circuits
                  circuits={project.circuits}
                  installation={project.installation}
                />
              </>
            )}
            {step >= 7 && <Results project={project} qdc={step === 8} />}
            {step === 8 && (
              <div className="report-actions">
                <button className="primary" onClick={report}>
                  Gerar relatório HTML
                </button>
                <button
                  className="secondary"
                  onClick={() => {
                    if (confirm("Limpar todo o projeto?")) {
                      setProject(createProject());
                      setError("");
                    }
                  }}
                >
                  Limpar projeto
                </button>
              </div>
            )}
          </section>
          <div className="pager">
            <button
              className="secondary"
              disabled={step === 1}
              onClick={() => showStep(step - 1)}
            >
              ← Anterior
            </button>
            <span aria-live="polite">Etapa {step} de 8</span>
            <button
              className="primary"
              disabled={step === 8}
              onClick={() => showStep(step + 1)}
            >
              {step === 8 ? "Finalizado" : "Próxima →"}
            </button>
          </div>
        </main>
      </div>
    </>
  );
}
