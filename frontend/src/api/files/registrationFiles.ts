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

type RegistrationFile = {
  url: string;
  name: string;
  kind: FileKind;
  parent_directory_id?: string;
};

export const registrationFiles = async (
  registrationFiles: RegistrationFile[]
): Promise<Response> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files`, {
    method: "POST",
    body: JSON.stringify({ registration_files: registrationFiles }),
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
