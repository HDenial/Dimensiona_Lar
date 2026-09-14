import { describe, expect, it } from "vitest";
import { createProject, type Circuit, type Room } from "../domain/project";
import { createExample } from "../domain/example";
import {
  apparentPower,
  areaCargaIluminacao,
  availablePhases,
  calcCircuit,
  suggestedTug,
  suggestCircuits,
  tugPower,
} from "./engine";
const installation = createProject().installation;
const circuit: Circuit = {
  id: "test",
  name: "Teste",
  type: "TUE",
  p: 1270,
  powerUnit: "W",
  voltage: 127,
  connection: "FN",
  d: 10,
  distanceKnown: true,
  fp: 1,
  phase: "A",
};
const room: Room = { id: "room", name: "Sala", type: "Sala", l: 4, w: 3 };
describe("Cálculos analíticos de corrente — sem seleção normativa", () => {
  it("calcula 10 A para 1270 W em 127 V e fp 1", () =>
    expect(calcCircuit(circuit, installation).I).toBe(10));
  it("usa a tensão do chuveiro entre fases: 5500 / 220 = 25 A", () => {
    const project = createExample();
    const shower = project.circuits.find(
      (item) => item.loadId === project.loads[0].id,
    )!;
    const result = calcCircuit(shower, project.installation);
    expect(shower.connection).toBe("FF");
    expect(shower.phase).toBe("AB");
    expect(result.v).toBe(220);
    expect(result.I).toBe(25);
  });
  it("converte W para VA com fp sem limitar artificialmente a 0,1", () => {
    expect(
      calcCircuit(
        {
          ...circuit,
          p: 100,
          fp: 0.05,
          voltage: 220,
          connection: "FF",
          phase: "AB",
        },
        { ...installation, sistema: "bi" },
      ).I,
    ).toBeCloseTo(100 / (220 * 0.05));
    expect(apparentPower({ ...circuit, p: 800, fp: 0.8 })).toBe(1000);
  });
  it("VA não é dividido novamente por fp", () =>
    expect(
      calcCircuit({ ...circuit, powerUnit: "VA", fp: 0.8 }, installation).I,
    ).toBe(10));
  it("não transforma carga FN ou FF em trifásica por causa do fornecimento", () => {
    expect(calcCircuit(circuit, { ...installation, sistema: "tri" }).I).toBe(
      10,
    );
    expect(
      calcCircuit(
        { ...circuit, p: 2200, voltage: 220, connection: "FF", phase: "AB" },
        { ...installation, sistema: "tri" },
      ).I,
    ).toBe(10);
  });
  it("aplica raiz de três somente na carga trifásica equilibrada", () => {
    const result = calcCircuit(
      {
        ...circuit,
        p: Math.sqrt(3) * 220 * 10 * 0.8,
        fp: 0.8,
        voltage: 220,
        connection: "3F",
        phase: "ABC",
      },
      { ...installation, sistema: "tri" },
    );
    expect(result.I).toBeCloseTo(10);
    expect(result.issues.join()).toContain("equilibrada");
  });
  it.each([
    { ...circuit, phase: "B" as const },
    {
      ...circuit,
      phase: "AB" as const,
      connection: "FF" as const,
      voltage: 220,
    },
    {
      ...circuit,
      phase: "ABC" as const,
      connection: "3F" as const,
      voltage: 220,
    },
    { ...circuit, voltage: 220 },
    { ...circuit, fp: 0 },
    { ...circuit, voltage: 0 },
    { ...circuit, p: -1 },
    { ...circuit, p: Infinity },
  ])("bloqueia dados incompatíveis: %j", (input) => {
    const result = calcCircuit(input, installation);
    expect(result.I).toBeNull();
    expect(result.status).toBe("DADOS INCOMPATÍVEIS");
  });
  it("não adivinha unidade ou tensão de circuitos legados", () => {
    const {
      powerUnit: _unit,
      voltage: _voltage,
      connection: _connection,
      ...legacy
    } = circuit;
    expect(calcCircuit(legacy, installation).I).toBeNull();
  });
  it.each([
    installation,
    { ...installation, temp: 80 },
    { ...installation, material: "Al" as const },
    { ...installation, isolacao: "XLPE/EPR 90 °C" as const },
  ])("não seleciona cabos ou proteção sem base validada", (input) => {
    const result = calcCircuit(circuit, input);
    expect(result.sec).toBeNull();
    expect(result.breaker).toBeNull();
    expect(result.dropPct).toBeNull();
    expect(result.status).toBe("DIMENSIONAMENTO PENDENTE");
  });
  it("não declara queda zero quando a distância é zero", () =>
    expect(
      calcCircuit({ ...circuit, d: 0 }, installation).issues.join(),
    ).toContain("comprimento real"));
});
describe("Previsões básicas — guia residencial Prysmian pp. 16–19", () => {
  it.each([
    [6, 100],
    [9.99, 100],
    [10, 160],
    [14, 220],
    [28, 400],
  ])("iluminação: %s m² → %s VA", (area, expected) =>
    expect(areaCargaIluminacao(area)).toBe(expected),
  );
  it.each([0, -1, NaN, Infinity])("recusa área inválida %s", (area) =>
    expect(() => areaCargaIluminacao(area)).toThrow(),
  );
  it("prevê 3 pontos na sala 4 × 3, mesmo se arquivo antigo informar 1", () => {
    expect(suggestedTug(room)).toBe(3);
    expect(tugPower({ ...room, tugs: 1 })).toBe(300);
  });
  it("cozinha 3 × 2,5: perímetro 11 / 3,5 → 4 pontos e 1900 VA", () => {
    const kitchen: Room = {
      ...room,
      type: "Cozinha",
      l: 3,
      w: 2.5,
      tugs: 4,
      tugVA: 100,
    };
    expect(suggestedTug(kitchen)).toBe(4);
    expect(tugPower(kitchen)).toBe(1900);
  });
  it("serviço usa 3,5 m de perímetro; banheiro e varanda têm previsões próprias", () => {
    expect(suggestedTug({ ...room, type: "Área de serviço" })).toBe(4);
    expect(tugPower({ ...room, type: "Banheiro", l: 2, w: 2 })).toBe(600);
    expect(tugPower({ ...room, type: "Varanda" })).toBe(100);
  });
  it("mantém entradas adicionais maiores que a previsão básica", () =>
    expect(tugPower({ ...room, tugs: 5, tugVA: 200 })).toBe(1000));
});
describe("Geração automática", () => {
  it("é determinística, não altera entradas e separa TUG por ambiente", () => {
    const project = createExample();
    const before = JSON.stringify(project);
    expect(suggestCircuits(project)).toEqual(project.circuits);
    expect(project.circuits.filter((item) => item.type === "TUG")).toHaveLength(
      4,
    );
    expect(JSON.stringify(project)).toBe(before);
    // 520 iluminação + 3100 tomadas + 5500 + 3000/.95 + 1200/.9.
    expect(
      project.circuits.reduce((sum, item) => sum + apparentPower(item)!, 0),
    ).toBeCloseTo(13611.228070175439);
  });
  it("não atribui fase B ou C a cargas FN de uma instalação monofásica", () => {
    const project = createExample();
    project.installation.sistema = "mono";
    expect(availablePhases(project.installation)).toEqual(["A"]);
    expect(
      suggestCircuits(project)
        .filter((item) => item.connection === "FN")
        .every((item) => item.phase === "A"),
    ).toBe(true);
    expect(
      calcCircuit(
        suggestCircuits(project).find((item) => item.connection === "FF")!,
        project.installation,
      ).I,
    ).toBeNull();
  });
  it("equipamento trifásico exige entrada explícita", () => {
    const project = createExample();
    project.installation.sistema = "tri";
    project.loads[0].connection = "three";
    expect(
      suggestCircuits(project).find(
        (item) => item.loadId === project.loads[0].id,
      )?.connection,
    ).toBe("3F");
  });
});
