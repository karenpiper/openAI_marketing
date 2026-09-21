import { useId } from "react";
import { statuses, type Status } from "../lib/workshop";
export function Field({
  label,
  value,
  onChange,
  multiline = false,
  placeholder = "",
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="capture-field">
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
      ) : (
        <input
          id={id}
          type={type}
          min={type === "number" ? "0" : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
    </div>
  );
}
export function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  const id = useId();
  return (
    <div className="capture-field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((v) => (
          <option key={v} value={v}>
            {v || "Choose…"}
          </option>
        ))}
      </select>
    </div>
  );
}
export function StatusField({
  value,
  onChange,
  canConfirm = true,
}: {
  value: Status;
  onChange: (v: Status) => void;
  canConfirm?: boolean;
}) {
  const id = useId();
  return (
    <div className="capture-field">
      <label htmlFor={id}>Room agreement</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as Status)}
      >
        {statuses.map((v) => (
          <option key={v} value={v} disabled={v === "Confirmed" && !canConfirm}>
            {v}
          </option>
        ))}
      </select>
      {!canConfirm && (
        <small className="muted">
          Capture the answer and its owner before confirming.
        </small>
      )}
    </div>
  );
}
export function Badge({ value }: { value: string }) {
  return (
    <span
      className={`agreement-badge status-${value.toLowerCase().replaceAll(" ", "-")}`}
    >
      {value}
    </span>
  );
}
