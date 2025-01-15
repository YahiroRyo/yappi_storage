export type FileKind = number;

export type File = {
  id: number;
  user_id: number;
  parent_directory_id?: number;
  embedding?: number[];
  kind: FileKind;
  url?: string;
  name: string;
  created_at: DateTime;
  updated_at: DateTime;
};
