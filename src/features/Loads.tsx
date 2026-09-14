import { Field } from "../components/Field";
import { loadSchema, loadTypes, type Load, type Room } from "../domain/project";

export function Loads({
  loads,
  rooms,
  onChange,
  onRemove,
}: {
  loads: Load[];
  rooms: Room[];
  onChange: (load: Load) => void;
  onRemove: (id: string) => void;
}) {
  if (!loads.length)
    return (
      <div className="info-box">
        Cadastre os equipamentos específicos da residência.
      </div>
    );
  return (
    <>
      {loads.map((load) => {
        function update(key: keyof Load, value: string) {
          const result = loadSchema.safeParse({
            ...load,
            [key]: ["p", "v", "fp", "q", "d"].includes(key)
              ? Number(value)
              : value,
          });
          if (result.success) onChange(result.data);
        }
        return (
          <div className="load-card" key={load.id}>
            <div className="panel-head">
              <h3>{load.name || load.type}</h3>
              <button className="danger" onClick={() => onRemove(load.id)}>
                Remover
              </button>
            </div>
            <div className="form-grid">
              <Field
                label="Ligação do equipamento"
                value={load.connection ?? "single"}
                options={["single", "three"]}
                optionLabels={{
                  single: "Monofásico (FN ou FF)",
                  three: "Trifásico equilibrado",
                }}
                onChange={(value) => update("connection", value)}
              />
              <Field
                label="Tipo"
                value={load.type}
                options={loadTypes}
                onChange={(value) => update("type", value)}
              />
              <Field
                label="Ambiente"
                value={load.room}
                options={[
                  ...new Set([
                    "",
                    ...rooms.map((room) => room.name),
                    load.room,
                  ]),
                ]}
                onChange={(value) => update("room", value)}
              />
              <Field
                label="Potência elétrica de entrada (W)"
                type="number"
                min={0}
                value={load.p}
                onChange={(value) => update("p", value)}
              />
              <Field
                label="Tensão (V)"
                type="number"
                min={0.01}
                value={load.v}
                onChange={(value) => update("v", value)}
              />
              <Field
                label="Fator de potência"
                type="number"
                min={0.01}
                max={1}
                value={load.fp}
                onChange={(value) => update("fp", value)}
              />
              <Field
                label="Quantidade"
                type="number"
                min={1}
                step={1}
                value={load.q}
                onChange={(value) => update("q", value)}
              />
              <Field
                label="Distância (m)"
                type="number"
                min={0}
                value={load.d}
                onChange={(value) => update("d", value)}
              />
              <Field
                label="Nome personalizado"
                value={load.name}
                onChange={(value) => update("name", value)}
              />
            </div>
          </div>
        );
      })}
    </>
  );
}
