import {
  circuitSchema,
  installationSchema,
  type Circuit,
  type Installation,
  type Project,
  type Room,
} from "../domain/project";

export function areaCargaIluminacao(area: number) {
  if (!Number.isFinite(area) || area <= 0)
    throw new Error("Área deve ser positiva e finita.");
  return area <= 6 ? 100 : 100 + Math.floor((area - 6) / 4) * 60;
}
// Guia residencial Prysmian, pp. 16–19. Previsão básica, não verificação de posicionamento.
export function suggestedTug(room: Room) {
  const perimeter = room.perimeter ?? 2 * (room.l + room.w);
  if (["Banheiro", "Varanda"].includes(room.type)) return 1;
  if (["Cozinha", "Área de serviço"].includes(room.type))
    return Math.max(1, Math.ceil(perimeter / 3.5));
  if (["Sala", "Quarto"].includes(room.type) || room.l * room.w > 6)
    return Math.max(1, Math.ceil(perimeter / 5));
  return 1;
}
export function tugCount(room: Room) {
  return Math.max(suggestedTug(room), room.tugs ?? 0);
}
export function tugPower(room: Room) {
  const count = tugCount(room);
  const minimum = ["Banheiro", "Cozinha", "Área de serviço"].includes(room.type)
    ? Math.min(count, 3) * 600 + Math.max(0, count - 3) * 100
    : count * 100;
  // Um valor legado informado nunca reduz a previsão básica.
  return Math.max(minimum, count * (room.tugVA ?? 0));
}
export function availablePhases(
  installation: Installation,
): ("A" | "B" | "C")[] {
  return installation.sistema === "mono"
    ? ["A"]
    : installation.sistema === "bi"
      ? ["A", "B"]
      : ["A", "B", "C"];
}
export function apparentPower(circuit: Circuit): number | null {
  if (!Number.isFinite(circuit.p) || circuit.p < 0) return null;
  if (circuit.powerUnit === "VA") return circuit.p;
  if (
    circuit.powerUnit === "W" &&
    Number.isFinite(circuit.fp) &&
    circuit.fp > 0 &&
    circuit.fp <= 1
  ) {
    const result = circuit.p / circuit.fp;
    return Number.isFinite(result) ? result : null;
  }
  return null;
}
export function suggestCircuits(project: Project): Circuit[] {
  const { installation, rooms, loads } = project;
  const phases = availablePhases(installation);
  const circuits: Circuit[] = [];
  function add(circuit: Omit<Circuit, "name"> & { name: string }) {
    circuits.push({
      ...circuit,
      name: `C${circuits.length + 1} - ${circuit.name}`,
    });
  }
  if (rooms.length)
    add({
      id: "lighting",
      name: "Iluminação",
      type: "Iluminação",
      p: rooms.reduce(
        (sum, room) => sum + areaCargaIluminacao(room.l * room.w),
        0,
      ),
      powerUnit: "VA",
      fp: 1,
      d: 0,
      distanceKnown: false,
      phase: "A",
      connection: "FN",
      voltage: installation.vf,
    });
  for (const [index, room] of rooms.entries())
    add({
      id: `tug-${room.id}`,
      name: `TUG ${room.name}`,
      type: "TUG",
      p: tugPower(room),
      powerUnit: "VA",
      fp: 1,
      d: 0,
      distanceKnown: false,
      phase: phases[(index + 1) % phases.length],
      connection: "FN",
      voltage: installation.vf,
    });
  for (const load of loads) {
    const connection =
      load.connection === "three"
        ? "3F"
        : load.v === installation.vf
          ? "FN"
          : "FF";
    // Uma carga entre fases continua monofásica. ABC somente para equipamento trifásico explícito.
    const phase =
      connection === "3F"
        ? "ABC"
        : connection === "FF"
          ? "AB"
          : phases[circuits.length % phases.length];
    add({
      id: `load-${load.id}`,
      name: load.name || load.type,
      type: "TUE",
      p: load.p * load.q,
      powerUnit: "W",
      fp: load.fp,
      d: load.d,
      distanceKnown: true,
      phase,
      connection,
      voltage: load.v,
      loadId: load.id,
    });
  }
  return circuits;
}
export function calcCircuit(circuit: Circuit, installation: Installation) {
  const errors: string[] = [];
  if (
    !circuitSchema.safeParse(circuit).success ||
    !installationSchema.safeParse(installation).success
  )
    errors.push(
      "Dados inválidos: confira potência, fator de potência, tensão e distância.",
    );
  if (!circuit.powerUnit || !circuit.connection || !circuit.voltage)
    errors.push(
      "Circuito legado sem unidade ou ligação explícita. Recalcule a proposta a partir das entradas.",
    );
  const phases = availablePhases(installation);
  if (
    circuit.connection === "FN" &&
    (!phases.includes(circuit.phase as "A" | "B" | "C") ||
      circuit.voltage !== installation.vf)
  )
    errors.push(
      "Ligação fase-neutro incompatível com a fase ou tensão do fornecimento.",
    );
  if (
    circuit.connection === "FF" &&
    (installation.sistema === "mono" ||
      !["AB", ...(installation.sistema === "tri" ? ["BC", "CA"] : [])].includes(
        circuit.phase,
      ) ||
      circuit.voltage !== installation.vff)
  )
    errors.push(
      "Equipamento entre fases incompatível com o fornecimento informado.",
    );
  if (
    circuit.connection === "3F" &&
    (installation.sistema !== "tri" ||
      circuit.phase !== "ABC" ||
      circuit.voltage !== installation.vff)
  )
    errors.push(
      "Carga trifásica exige fornecimento trifásico e tensão entre fases compatível.",
    );
  const S = apparentPower(circuit);
  const v = circuit.voltage ?? null;
  let I: number | null =
    errors.length || S === null || v === null
      ? null
      : S / ((circuit.connection === "3F" ? Math.sqrt(3) : 1) * v);
  if (I !== null && !Number.isFinite(I)) {
    errors.push("Valores excedem a faixa de cálculo.");
    I = null;
  }
  const pending = [
    "Condutor pendente: faltam método de instalação, condutores carregados, agrupamento e catálogo validado para material, isolação e temperatura.",
    "Proteção pendente: faltam coordenação, curto-circuito, capacidade de interrupção e condições de seccionamento.",
    "Queda de tensão pendente: faltam seção e impedância dos condutores, percurso e queda no alimentador.",
  ];
  if (!circuit.distanceKnown || circuit.d <= 0)
    pending.push(
      "Informe o comprimento real do trajeto; distância zero ou desconhecida não comprova queda de tensão nula.",
    );
  if (circuit.connection === "3F")
    pending.push(
      "Corrente calculada sob hipótese de carga trifásica equilibrada; confirme essa condição no equipamento.",
    );
  return {
    S,
    v,
    I,
    sec: null,
    breaker: null,
    dropPct: null,
    status: errors.length ? "DADOS INCOMPATÍVEIS" : "DIMENSIONAMENTO PENDENTE",
    issues: [...errors, ...pending],
    formula:
      circuit.powerUnit === "W"
        ? circuit.connection === "3F"
          ? "I = P / (√3 × VFF × fp)"
          : "I = P / (V × fp)"
        : circuit.powerUnit === "VA"
          ? circuit.connection === "3F"
            ? "I = S / (√3 × VFF)"
            : "I = S / V"
          : "Unidade não definida",
  };
}
