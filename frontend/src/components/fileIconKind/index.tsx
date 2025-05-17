import { FileKind } from "@/types/file";
import { DirectoryIcon } from "../icons/directoryIcon";
import { ImageIcon } from "../icons/imageIcon";
import { VideoIcon } from "../icons/videoIcon";
import { FileIcon } from "../icons/fileIcon";
import { CSSProperties } from "react";
import { PdfIcon } from "../icons/pdfIcon";
import { WordIcon } from "../icons/wordIcon";
import { ExcelIcon } from "../icons/excelIcon";
import { PowerPointIcon } from "../icons/powerpointIcon";

type Props = {
  kind: FileKind;
  style?: CSSProperties;
};

export const FileIconKind = ({ kind, style }: Props) => {
  if (kind === "Directory") {
    return <DirectoryIcon style={style} />;
  }

  if (kind === "Image") {
    return <ImageIcon style={style} />;
  }

  if (kind === "Video") {
    return <VideoIcon style={style} />;
  }

  if (kind === "PDF") {
    return <PdfIcon style={style} />;
  }

  if (kind === "Word") {
    return <WordIcon style={style} />;
  }
  
  if (kind === "Excel") {
    return <ExcelIcon style={style} />;
  }
  
  if (kind === "PowerPoint") {
    return <PowerPointIcon style={style} />;
  }

  return <FileIcon style={style} />;
};
