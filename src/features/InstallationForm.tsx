import { Field } from "../components/Field";
import { installationSchema, type Installation } from "../domain/project";

const labels: Record<keyof Installation, string> = {
  tipo: "Tipo de instalação",
  sistema: "Sistema",
  vf: "Tensão fase-neutro (V)",
  vff: "Tensão entre fases (V)",
  freq: "Frequência (Hz)",
  material: "Material dos condutores",
  isolacao: "Isolação",
  temp: "Temperatura ambiente (°C)",
  quedaLimite: "Queda máxima adotada (%)",
  distAlim: "Comprimento de referência do alimentador (m)",
  expansao: "Margem para expansão (%)",
};
const choices: Partial<Record<keyof Installation, string[]>> = {
  tipo: ["residencial"],
  sistema: ["mono", "bi", "tri"],
  material: ["Cu", "Al"],
  isolacao: ["PVC 70 °C", "XLPE/EPR 90 °C"],
};
export function InstallationForm({
  value,
  onChange,
}: {
  value: Installation;
  onChange: (value: Installation) => void;
}) {
  return (
    <>
      <div className="grid">
        {(Object.keys(labels) as (keyof Installation)[]).map((key) => (
          <Field
            key={key}
            label={labels[key]}
            value={value[key]}
            options={choices[key]}
            optionLabels={{
              residencial: "Residencial",
              mono: "Monofásico",
              bi: "Bifásico",
              tri: "Trifásico",
              Cu: "Cobre",
              Al: "Alumínio",
            }}
            type={typeof value[key] === "number" ? "number" : "text"}
            min={
              key === "temp"
                ? undefined
                : ["vf", "vff", "freq", "quedaLimite"].includes(key)
                  ? 0.01
                  : 0
            }
            onChange={(next) => {
              const parsed = installationSchema.safeParse({
                ...value,
                [key]: typeof value[key] === "number" ? Number(next) : next,
              });
              if (parsed.success) onChange(parsed.data);
            }}
          />
        ))}
      </div>
      <div className="info-box">
        Os resultados são preliminares e as hipóteses devem ser conferidas no
        relatório.
      </div>
    </>
  );
}
