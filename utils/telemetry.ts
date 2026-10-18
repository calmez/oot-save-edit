import { metrics, trace, ValueType } from "@opentelemetry/api";

const appName = "oot-save-edit";

const tracer = trace.getTracer(appName, "dev");
const meter = metrics.getMeter(appName, "dev");

export const Span = {
  loadFile: (path: string, cwd?: string) =>
    tracer.startSpan("load_file", {
      attributes: {
        "file.path": path,
        ...(cwd === undefined ? {} : { "file.cwd": cwd }),
      },
    }),
  saveFile: (
    path: string,
    format: number,
    forceSwap: boolean,
    cwd?: string,
  ) =>
    tracer.startSpan("save_file", {
      attributes: {
        "file.path": path,
        "file.format": format,
        "file.forceSwap": forceSwap,
        ...(cwd === undefined ? {} : { "file.cwd": cwd }),
      },
    }),
};

export const Metric = {
  loadFileDuration: meter.createGauge(
    `${appName}.load_file.duration`,
    {
      description: "Duration of loading a save file",
      unit: "milliseconds",
      valueType: ValueType.DOUBLE,
    },
  ),
  saveFileDuration: meter.createGauge(
    `${appName}.save_file.duration`,
    {
      description: "Duration of saving a save file",
      unit: "milliseconds",
      valueType: ValueType.DOUBLE,
    },
  ),
};
