import { File, FileKind } from "@/types/file";

export type SuccessedResponse = File;

type FailedResponse = {
  message: string;
};

type Response = {
  status: number;
  failedResponse?: FailedResponse;
  successedResponse?: SuccessedResponse;
};

export const registrationFile = async (
  url: string,
  name: string,
  kind: FileKind,
  parent_directory_id?: string
): Promise<Response> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files`, {
    method: "POST",
    body: JSON.stringify({ name, kind, url, parent_directory_id }),
    mode: "same-origin",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const json = await res.json();

  if (res.ok) {
    return {
      status: res.status,
      successedResponse: json,
    };
  }

  return {
    status: res.status,
    failedResponse: json,
  };
};
