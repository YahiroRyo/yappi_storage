export type FileKind =
  | "Unknown"
  | "Directory"
  | "Word"
  | "Excel"
  | "PowerPoint"
  | "PDF"
  | "Video"
  | "Image"
  | "Zip";

export type File = {
  id: string;
  user_id: string;
  parent_directory_id?: string;
  embedding?: number[];
  kind: FileKind;
  url?: string;
  name: string;
  created_at: DateTime;
  updated_at: DateTime;
};
