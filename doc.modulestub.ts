export function assert(_condition: boolean, _msg?: string): void {}

export const metrics = {
  getMeter: (_name: string, _version?: string) => ({
    createGauge: (_name: string, _options?: unknown) => ({
      record: (_value: number) => {
      },
    }),
  }),
};
export const trace = {
  getTracer: (_name: string, _version?: string) => ({
    startSpan: (_name: string, _options?: unknown) => ({
      end: () => {
      },
      setAttributes: (_attributes: Record<string, unknown>) => {
      },
    }),
  }),
};
export enum ValueType {
  INT,
  DOUBLE,
}
