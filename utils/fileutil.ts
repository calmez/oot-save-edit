import { SaveFile } from "../models/savefile.ts";
import { SrmFile } from "../models/srmfile.ts";

export enum FileFormat {
  SRA,
  SRM,
}

/**
 * Detects the type of save file (SRA or SRM) based on file size
 * and returns the appropriate SaveFile instance.
 */
export class FileUtil {
  /**
   * Detect file type based on size
   * SRA: < 0x8000 bytes (32KB)
   * SRM: 0x48800 (contains EEPROM, MemPak, SRAM, FlashRAM sections)
   */
  static detectFileFormatBySize(file: Deno.FsFile): FileFormat {
    const stat = file.statSync();
    file.seekSync(0, Deno.SeekMode.Start);
    
    if (stat.size === SaveFile.acceptedSize) {
      return FileFormat.SRA;
    } else if (stat.size === SrmFile.acceptedSize) {
      return FileFormat.SRM;
    } else {
      throw new Error(`Cannot detect file type by size. Unknown file size: ${stat.size}.`);
    }
  }

  static detectFileFormatByExtension(path: string): FileFormat {
    const ext = path.toLowerCase().split('.').pop();
    
    switch (ext) {
      case "sra":
        return FileFormat.SRA;
      case "srm":
        return FileFormat.SRM;
      default:
        throw new Error(`Cannot detect file type by extension. Unknown extension: ${ext}.`);
    }
  }
  
  /**
   * Load save file and return appropriate instance based on detected type
   */
  static loadFile(path: string): SaveFile {
    const file = Deno.openSync(path, { read: true });
    
    try {
      const fileType = this.detectFileFormatBySize(file);
      const fileTypeByExtension = this.detectFileFormatByExtension(path);
      if (fileType !== fileTypeByExtension) {
        throw new Error(`File format mismatch: detected ${fileType}, expected ${fileTypeByExtension}`);
      }
      
      file.seekSync(0, Deno.SeekMode.Start);
      
      switch (fileType) {
        case FileFormat.SRA:
          return new SaveFile(file);
        
        case FileFormat.SRM:
          return new SrmFile(file).saveFile;
        
        default:
          throw new Error(`Unknown or unsupported save file format: ${path}`);
      }
    } finally {
      file.close();
    }
  }

  static saveFile(path: string, format: FileFormat, save: SaveFile, forceSwap: boolean = false): void {
    const file = Deno.openSync(path, { write: true, create: true });
    
    switch (format) {
      case FileFormat.SRA:
        save.write(file, forceSwap);
        break;
      case FileFormat.SRM: {
        const srm = SrmFile.fromSaveFile(save);
        srm.write(file, forceSwap);
        break;
      }
      default:
        throw new Error(`Unsupported save format for writing: ${format}`);
    }

    file.close();
  }
}