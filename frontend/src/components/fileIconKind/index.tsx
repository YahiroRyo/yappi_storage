import { FileKind } from "@/types/file";
import { DirectoryIcon } from "../icons/directoryIcon";
import { ImageIcon } from "../icons/imageIcon";
import { VideoIcon } from "../icons/videoIcon";
import { FileIcon } from "../icons/fileIcon";
import { CSSProperties } from "react";

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

  return <FileIcon style={style} />;
};
