import { FileKind } from "@/types/file";

type FileKindExtensions = {
  [key in FileKind]: string[];
};

const fileKindExtensions: FileKindExtensions = {
  Word: ["doc", "docx"],
  Excel: ["xls", "xlsx"],
  PowerPoint: ["ppt", "pptx"],
  PDF: ["pdf"],
  Video: ["mp4", "avi", "mkv"],
  Image: ["jpg", "jpeg", "png", "gif"],
  Zip: ["zip", "rar", "7z"],
  Unknown: [],
  Directory: [],
};

export const fileToFileKind = (file: File): FileKind => {
  for (const [fileKind, extensions] of Object.entries(fileKindExtensions)) {
    const fileExtention = file.name!.split(".").pop();

    if (fileExtention && extensions.includes(fileExtention)) {
      return fileKind as FileKind;
    }
  }
  return "Unknown";
};
