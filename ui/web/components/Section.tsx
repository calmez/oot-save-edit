import type { ComponentChildren } from "preact";

interface SectionProps {
  title: string;
  children: ComponentChildren;
  cols?: string;
}
export function Section(props: SectionProps) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold tracking-wide text-slate-700">
        {props.title}
      </h3>
      <div className={props.cols ?? "grid grid-cols-1 gap-3 md:grid-cols-3"}>
        {props.children}
      </div>
    </section>
  );
}
