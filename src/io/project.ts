import { suggestCircuits } from "../calculations/engine";
import { projectSchema, type Project } from "../domain/project";

export function importProject(json: string): Project {
  const result = projectSchema.safeParse(JSON.parse(json));
  if (!result.success)
    throw new Error(
      "Projeto inválido: confira os campos, valores numéricos e a versão do arquivo.",
    );
  const project = result.data;
  return project.schemaVersion === 2
    ? { ...project, circuits: suggestCircuits(project) }
    : project;
}
export function exportProject(project: Project) {
  return JSON.stringify(projectSchema.parse(project), null, 2);
}
export function download(content: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
