import {
  ChecksumPolicy,
  ExportByteOrder,
  SraSaveFile,
  SrmSaveFile,
} from "../models/savefile.ts";
import { DiagnosticCategory, DiagnosticConfidence } from "./diagnostics.ts";
import type { DiagnosticFinding } from "./diagnostics.ts";
import { UnresolvedByteOrderError } from "./inputdiagnostics.ts";
import { Metric, Span } from "./telemetry.ts";

/**
 * Supported file formats for save files
 * SRA is the core format used by the cartridge
 * SRM is the Mupen64Plus-Next container layout on little-endian hosts.
 */
export enum FileFormat {
  SRA,
  SRM,
}

export interface SourceFileInfo {
  format: FileFormat;
  filename?: string;
  suggestedFilename?: string;
  findings: DiagnosticFinding[];
}

/**
 * Detects the {@link FileFormat} of save file (SRA or SRM) based on file size
 * and returns the appropriate SaveFile instance.
 */
export class FileUtil {
  /** Suggest an export path without touching the source file. */
  static suggestExportFilename(filename: string, format: FileFormat): string {
    if (format !== FileFormat.SRA && format !== FileFormat.SRM) {
      throw new Error(`Unsupported save format for filename: ${format}.`);
    }
    const separator = Math.max(
      filename.lastIndexOf("/"),
      filename.lastIndexOf("\\"),
    );
    const dot = filename.lastIndexOf(".");
    const stem = dot > separator + 1 ? filename.slice(0, dot) : filename;
    return `${stem}.${FileFormat[format].toLowerCase()}`;
  }

  private static describeSourceFile(
    format: FileFormat,
    filename?: string,
  ): SourceFileInfo {
    const info: SourceFileInfo = { format, findings: [] };
    if (filename === undefined) return info;
    info.filename = filename;
    info.suggestedFilename = this.suggestExportFilename(filename, format);
    const separator = Math.max(
      filename.lastIndexOf("/"),
      filename.lastIndexOf("\\"),
    );
    const dot = filename.lastIndexOf(".");
    const extension = dot > separator + 1
      ? filename.slice(dot + 1).toLowerCase()
      : "";
    if (
      (extension === "sra" || extension === "srm") &&
      extension !== FileFormat[format].toLowerCase()
    ) {
      info.findings.push({
        id: "file.extension-mismatch:file:filename",
        ruleId: "file.extension-mismatch",
        category: DiagnosticCategory.Structural,
        scope: { kind: "file", field: "filename" },
        explanation:
          `Filename extension .${extension} disagrees with the recognized ${
            FileFormat[format]
          } layout. Suggested export filename: ${info.suggestedFilename}.`,
        confidence: DiagnosticConfidence.Evidenced,
        evidence: [{
          source: "FileUtil",
          reference: "Recognized container size and source filename extension",
          applicability: "Recognized SRA and SRM layouts",
          limitations:
            "Filename and size do not establish byte order, game version, or platform compatibility.",
        }],
        context: {
          layout: "sra",
          container: format === FileFormat.SRA ? "sra" : "srm",
          gameVersion: null,
          platformCompatibility: "unverified",
        },
      });
    }
    return info;
  }

  private static readSave(
    source: Deno.FsFile | Uint8Array,
    info: SourceFileInfo,
    sourceOrder: ExportByteOrder,
  ): SraSaveFile {
    try {
      const container = info.format === FileFormat.SRA
        ? new SraSaveFile()
        : new SrmSaveFile();
      container.read(source, sourceOrder);
      const save = container instanceof SrmSaveFile
        ? container.saveFile
        : container;
      save.sourceFile = info;
      return save;
    } catch (error) {
      if (error instanceof UnresolvedByteOrderError) error.sourceFile = info;
      throw error;
    }
  }
  /**
   * Detect the {@link FileFormat} based on size
   * SRA: 0x8000 bytes (32KB)
   * SRM: 0x48800 (contains EEPROM, MemPak, SRAM, FlashRAM sections)
   */
  static detectFileFormatByFileSize(file: Deno.FsFile): FileFormat {
    const stat = file.statSync();
    file.seekSync(0, Deno.SeekMode.Start);

    if (stat.size === SraSaveFile.acceptedSize) {
      return FileFormat.SRA;
    } else if (stat.size === SrmSaveFile.acceptedSize) {
      return FileFormat.SRM;
    } else {
      throw new Error(
        `Cannot detect file type by size. Unknown file size: ${stat.size}.`,
      );
    }
  }

  static detectFileFormatByBufferSize(buffer: Uint8Array): FileFormat {
    if (buffer.byteLength === SraSaveFile.acceptedSize) {
      return FileFormat.SRA;
    } else if (buffer.byteLength === SrmSaveFile.acceptedSize) {
      return FileFormat.SRM;
    } else {
      throw new Error(
        `Cannot detect file type by size. Unknown buffer size: ${buffer.byteLength}.`,
      );
    }
  }

  /**
   * Detect {@link FileFormat} based on file extension used
   */
  static detectFileFormatByExtension(path: string): FileFormat {
    const ext = path.toLowerCase().split(".").pop();

    switch (ext) {
      case "sra":
        return FileFormat.SRA;
      case "srm":
        return FileFormat.SRM;
      default:
        throw new Error(
          `Cannot detect file type by extension. Unknown extension: ${ext}.`,
        );
    }
  }

  /**
   * Reverses each four-byte word: [a, b, c, d] becomes [d, c, b, a].
   * A final partial word is reversed within its available bytes.
   * @param input Uint8Array to swap bytes in
   * @param inPlace Determine if the input array should be modified in place
   * (default: false, returns a new Uint8Array)
   * @returns Swapped bytes Uint8Array
   */
  static byteSwap(input: Uint8Array, inPlace = false): Uint8Array {
    const bytes = inPlace ? input : new Uint8Array(input);
    return this.byteSwapInPlace(bytes);
  }

  private static byteSwapInPlace(bytes: Uint8Array): Uint8Array {
    for (let i = 0; i < bytes.length; i += 4) {
      const temp = bytes.slice(i, i + 4);
      temp.reverse();
      bytes.set(temp, i);
    }
    return bytes;
  }

  /**
   * Load a save file from either format and always return the core SRA save
   * @param path to load; its extension is diagnostic metadata, not parser input
   */
  static loadFile(
    path: string,
    sourceOrder = ExportByteOrder.Automatic,
  ): SraSaveFile {
    const span = Span.loadFile(path, Deno.cwd());
    const startTime = new Date().getTime();

    const file = Deno.openSync(path, { read: true });

    try {
      const fileType = this.detectFileFormatByFileSize(file);
      file.seekSync(0, Deno.SeekMode.Start);
      return this.readSave(
        file,
        this.describeSourceFile(fileType, path),
        sourceOrder,
      );
    } finally {
      file.close();

      const endTime = new Date().getTime();
      span.setAttributes({ "file.readDuration": endTime - startTime });
      Metric.loadFileDuration.record(endTime - startTime);
      span.end();
    }
  }

  /** Load by layout size; an optional source filename enables naming diagnostics. */
  static loadFileFromBuffer(
    buffer: Uint8Array,
    sourceOrder = ExportByteOrder.Automatic,
    filename?: string,
  ): SraSaveFile {
    const span = Span.loadFile("buffer");
    const startTime = new Date().getTime();

    try {
      const fileType = this.detectFileFormatByBufferSize(buffer);
      return this.readSave(
        buffer,
        this.describeSourceFile(fileType, filename),
        sourceOrder,
      );
    } finally {
      const endTime = new Date().getTime();
      span.setAttributes({ "file.readDuration": endTime - startTime });
      Metric.loadFileDuration.record(endTime - startTime);
      span.end();
    }
  }

  /**
   * Writes the savefile to disk in the desired file format
   * @param path to write the file to
   * @param format save file format to write
   * @param save savefile data to write
   * @param order desired SRAM byte order; automatic preserves same-format source
   * order and uses target-layout defaults for new files and conversions
   * @param checksumPolicy maintain edited-slot checksums by default, or preserve
   * stored checksum bytes even when content was edited
   */
  static saveFile(
    path: string,
    format: FileFormat,
    save: SraSaveFile,
    order = ExportByteOrder.Automatic,
    checksumPolicy = ChecksumPolicy.MaintainEdited,
  ): void {
    const span = Span.saveFile(path, format, order, Deno.cwd());
    const startTime = new Date().getTime();

    const data = this.getFileData(save, format, order, checksumPolicy);
    const file = Deno.openSync(path, {
      write: true,
      create: true,
      truncate: true,
    });

    try {
      let offset = 0;
      while (offset < data.length) {
        const written = file.writeSync(data.subarray(offset));
        if (written === 0) {
          throw new Error(`Could not finish writing save file: ${path}.`);
        }
        offset += written;
      }
    } finally {
      file.close();

      const endTime = new Date().getTime();
      span.setAttributes({ "file.writeDuration": endTime - startTime });
      Metric.saveFileDuration.record(endTime - startTime);
      span.end();
    }
  }

  /** Export a copy without changing the working save or repairing untouched slots. */
  static getFileData(
    save: SraSaveFile,
    format: FileFormat,
    order = ExportByteOrder.Automatic,
    checksumPolicy = ChecksumPolicy.MaintainEdited,
  ): Uint8Array {
    if (format !== FileFormat.SRA && format !== FileFormat.SRM) {
      throw new Error(`Unsupported save format for writing: ${format}`);
    }
    return format === FileFormat.SRA
      ? save.getDataForWrite(order, checksumPolicy)
      : SrmSaveFile.fromSaveFile(save, order, checksumPolicy).getData();
  }
}
