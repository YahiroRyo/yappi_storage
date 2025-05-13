import { File, } from "@/types/file";

export type SuccessedResponse = File;

type FailedResponse = {
  message: string;
};

type Response = {
  status: number;
  failedResponse?: FailedResponse;
  successedResponse?: SuccessedResponse;
};

export const deleteFiles = async (fileIds: string[]): Promise<Response> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files`, {
    method: "DELETE",
    body: JSON.stringify({ file_ids: fileIds }),
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

// 後方互換性のために残す
export const deleteFile = async (fileId: string): Promise<Response> => {
  return deleteFiles([fileId]);
};
