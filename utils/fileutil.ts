import { SaveFile } from "../models/savefile.ts";
import { SraSaveFile } from "../models/srasavefile.ts";
import { SrmSaveFile } from "../models/srmsavefile.ts";

/**
 * Supported file formats for save files
 * SRA is the core format used by the cartridge
 * SRM is used by emulators such as through libretro
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
  static detectFileFormatBySize(file: Deno.FsFile): FileFormat {
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
   * Swaps bytes in a Uint8Array.
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
  static loadFile(path: string): SraSaveFile {
    const file = Deno.openSync(path, { read: true });

    try {
      const fileType = this.detectFileFormatBySize(file);
      const fileTypeByExtension = this.detectFileFormatByExtension(path);
      if (fileType !== fileTypeByExtension) {
        throw new Error(
          `File format mismatch: detected ${FileFormat[fileType]}, expected ${
            FileFormat[fileTypeByExtension]
          } - try renaming the file.`,
        );
      }

      file.seekSync(0, Deno.SeekMode.Start);
      let save: SaveFile;

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

      save.read(file);
      if (save instanceof SrmSaveFile) {
        return save.saveFile;
      }
      return save as SraSaveFile;
    } finally {
      file.close();
    }
  }

  /**
   * Writes the savefile to disk in the desired file format
   * @param path to write the file to
   * @param format save file format to write
   * @param save savefile data to write
   * @param forceSwap force a byte swap before writing (when converting from SRA
   * to SRM the swap will be done automatically, force swapping will reverse the
   * effect in that case)
   */
  static saveFile(
    path: string,
    format: FileFormat,
    save: SraSaveFile,
    forceSwap: boolean = false,
  ): void {
    const file = Deno.openSync(path, { write: true, create: true });

    switch (format) {
      case FileFormat.SRA:
        save.write(file, forceSwap);
        break;
      case FileFormat.SRM: {
        const srm = SrmSaveFile.fromSaveFile(save);
        srm.write(file, forceSwap);
        break;
      }
      default:
        throw new Error(`Unsupported save format for writing: ${format}`);
    }

    file.close();
  }
}
