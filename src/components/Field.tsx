import { useEffect, useState } from "react";
import styles from "./Field.module.css";

type Props = {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "number";
  min?: number;
  max?: number;
  step?: number | "any";
  options?: readonly string[];
  optionLabels?: Record<string, string>;
  disabled?: boolean;
};
export function Field({
  label,
  value,
  onChange,
  options,
  optionLabels,
  type = "text",
  min,
  max,
  step = "any",
  disabled,
}: Props) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  return (
    <label className={styles.field}>
      {label}
      {options ? (
        <select
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {optionLabels?.[option] ?? (option || "—")}
            </option>
          ))}
        </select>
      ) : (
        <input
          value={draft}
          type={type}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={(event) => {
            const next = event.target.value;
            setDraft(next);
            if (type === "text" || (next !== "" && event.target.validity.valid))
              onChange(next);
          }}
          onBlur={() => setDraft(String(value))}
        />
      )}
    </label>
  );
}
