import {
  ChecksumPolicy,
  ExportByteOrder,
  SraSaveFile,
  SrmSaveFile,
} from "../models/savefile.ts";
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

/**
 * Detects the {@link FileFormat} of save file (SRA or SRM) based on file size
 * and returns the appropriate SaveFile instance.
 */
export class FileUtil {
  /**
   * Detect the {@link FileFormat} based on size
   * SRA: < 0x8000 bytes (32KB)
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
   * @param path to load the save file data from, is also used for automatic
   * format detection
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
      const fileTypeByExtension = this.detectFileFormatByExtension(path);
      if (fileType !== fileTypeByExtension) {
        throw new Error(
          `File format mismatch: detected ${FileFormat[fileType]}, expected ${
            FileFormat[fileTypeByExtension]
          } - try renaming the file.`,
        );
      }

      file.seekSync(0, Deno.SeekMode.Start);
      let save: SraSaveFile | SrmSaveFile;

      switch (fileType) {
        case FileFormat.SRA:
          save = new SraSaveFile();
          break;
        case FileFormat.SRM:
          save = new SrmSaveFile();
          break;
        default:
          throw new Error(`Unknown or unsupported save file format: ${path}`);
      }

      save.read(file, sourceOrder);
      if (save instanceof SrmSaveFile) {
        return save.saveFile;
      }
      return save as SraSaveFile;
    } finally {
      file.close();

      const endTime = new Date().getTime();
      span.setAttributes({ "file.readDuration": endTime - startTime });
      Metric.loadFileDuration.record(endTime - startTime);
      span.end();
    }
  }

  static loadFileFromBuffer(
    buffer: Uint8Array,
    sourceOrder = ExportByteOrder.Automatic,
  ): SraSaveFile {
    const span = Span.loadFile("buffer");
    const startTime = new Date().getTime();

    try {
      const fileType = this.detectFileFormatByBufferSize(buffer);
      let save: SraSaveFile | SrmSaveFile;

      switch (fileType) {
        case FileFormat.SRA:
          save = new SraSaveFile();
          break;
        case FileFormat.SRM:
          save = new SrmSaveFile();
          break;
        default:
          throw new Error(`Unknown or unsupported save file format`);
      }

      save.read(buffer, sourceOrder);
      if (save instanceof SrmSaveFile) {
        return save.saveFile;
      }
      return save as SraSaveFile;
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
