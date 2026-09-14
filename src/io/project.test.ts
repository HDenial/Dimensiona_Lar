import { describe, expect, it } from "vitest";
import { createExample } from "../domain/example";
import { exportProject, importProject } from "./project";

describe("Arquivos de projeto", () => {
  it("recalcula resultados importados a partir das entradas na versão 2", () => {
    const project = createExample();
    const expected = structuredClone(project);
    project.circuits[0].name = "Circuito personalizado";
    project.circuits[0].p = 999;
    expect(importProject(exportProject(project))).toEqual(expected);
  });
  it("aceita o formato legado sem schemaVersion", () => {
    const { schemaVersion: _version, ...legacy } = createExample();
    expect(importProject(JSON.stringify(legacy))).toEqual({
      ...legacy,
      schemaVersion: 1,
    });
  });
  it.each(["null", "{}", "{", '{"schemaVersion":999}'])(
    "recusa JSON inválido: %s",
    (input) => {
      expect(() => importProject(input)).toThrow();
    },
  );
  it("recusa tensão zero, IDs duplicados e fator de potência fora da faixa", () => {
    const project = createExample();
    project.installation.vf = 0;
    expect(() => importProject(JSON.stringify(project))).toThrow();
    project.installation.vf = 127;
    project.loads[0].fp = 2;
    expect(() => importProject(JSON.stringify(project))).toThrow();
    project.loads[0].fp = 1;
    project.rooms.push(project.rooms[0]);
    expect(() => importProject(JSON.stringify(project))).toThrow();
  });
});
