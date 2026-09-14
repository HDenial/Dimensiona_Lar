import { Field } from "../components/Field";
import { format } from "../components/Results";
import {
  areaCargaIluminacao,
  tugCount,
  tugPower,
} from "../calculations/engine";
import { roomSchema, roomTypes, type Room } from "../domain/project";

type Props = {
  rooms: Room[];
  step: number;
  onChange: (room: Room) => void;
  onRemove: (id: string) => void;
};
export function Rooms({ rooms, step, onChange, onRemove }: Props) {
  if (!rooms.length)
    return <div className="info-box">Cadastre os cômodos primeiro.</div>;
  return (
    <>
      {step === 3 && (
        <div className="info-box">
          Critério do protótipo: 100 VA até 6 m²; acima disso, mais 60 VA para
          cada 4 m² inteiros adicionais. A carga de dimensionamento é separada
          da potência nominal das lâmpadas.
        </div>
      )}
      {rooms.map((room) => {
        function update(key: keyof Room, value: string) {
          const result = roomSchema.safeParse({
            ...room,
            [key]: ["l", "w", "lamp", "tugs", "tugVA"].includes(key)
              ? Number(value)
              : value,
          });
          if (result.success) onChange(result.data);
        }
        return (
          <div className="room-card" key={room.id}>
            <div className="panel-head">
              <h3>{room.name || "Cômodo"}</h3>
              {step === 2 && (
                <button className="danger" onClick={() => onRemove(room.id)}>
                  Remover
                </button>
              )}
            </div>
            <div className="form-grid">
              {step === 2 ? (
                <>
                  <Field
                    label="Nome"
                    value={room.name}
                    onChange={(value) => update("name", value)}
                  />
                  <Field
                    label="Tipo"
                    value={room.type}
                    options={roomTypes}
                    onChange={(value) => update("type", value)}
                  />
                  <Field
                    label="Comprimento (m)"
                    type="number"
                    min={0.01}
                    value={room.l}
                    onChange={(value) => update("l", value)}
                  />
                  <Field
                    label="Largura (m)"
                    type="number"
                    min={0.01}
                    value={room.w}
                    onChange={(value) => update("w", value)}
                  />
                </>
              ) : step === 3 ? (
                <>
                  <p>Área: {format(room.l * room.w)} m²</p>
                  <p>
                    Carga de dimensionamento:{" "}
                    <b>{areaCargaIluminacao(room.l * room.w)} VA</b>
                  </p>
                  <Field
                    label="Potência das lâmpadas (W, apenas registro)"
                    type="number"
                    min={0}
                    value={room.lamp ?? 0}
                    onChange={(value) => update("lamp", value)}
                  />
                </>
              ) : (
                <>
                  <p>
                    Previsão básica: <b>{tugCount(room)} pontos</b>
                  </p>
                  <p>
                    Carga prevista: <b>{format(tugPower(room))} VA</b>
                  </p>
                  <p>
                    Posicionamento, bancada e condições especiais ainda precisam
                    ser verificados. Valores adicionais do arquivo importado são
                    preservados quando superiores à previsão básica.
                  </p>
                </>
              )}
            </div>
            {step === 2 && (
              <p>
                <b>Área:</b> {format(room.l * room.w)} m² &nbsp;{" "}
                <b>Perímetro:</b> {format(2 * (room.l + room.w))} m
              </p>
            )}
          </div>
        );
      })}
    </>
  );
}
