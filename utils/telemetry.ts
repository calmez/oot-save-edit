import { metrics, trace, ValueType } from "@opentelemetry/api";

const appName = "oot-save-edit";

const tracer = trace.getTracer(appName, "dev");
const meter = metrics.getMeter(appName, "dev");

export const Span = {
  loadFile: (path: string) => {
    return tracer.startSpan("load_file", {
      attributes: {
        "file.cwd": Deno.cwd(),
        "file.path": path,
      },
    });
  },
  saveFile: (path: string, format: number, forceSwap: boolean) =>
    tracer.startSpan("save_file", {
      attributes: {
        "file.cwd": Deno.cwd(),
        "file.path": path,
        "file.format": format,
        "file.forceSwap": forceSwap,
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
