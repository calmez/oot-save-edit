import type { ComponentChildren } from "preact";

interface FieldProps {
  label: string;
  children: ComponentChildren;
  className?: string;
}
export function Field(props: FieldProps) {
  return (
    <div 
      className={`rounded-lg border border-slate-200 bg-white/80 p-3 ${props.className ?? ""}`}
    >
      <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {props.label}
      </span>
      <div className="mt-1 tabular-nums break-words text-slate-900">
        {props.children}
      </div>
    </div>
  );
}
