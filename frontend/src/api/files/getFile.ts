import { File } from "@/types/file";

export type SuccessedResponse = File;

type FailedResponse = {
  message: string;
};

type Response = {
  status: number;
  failedResponse?: FailedResponse;
  successedResponse?: SuccessedResponse;
};

export const getFile = async (fileId: string): Promise<Response> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/files/file/${fileId}`,
    {
      mode: "same-origin",
      credentials: "include",
    }
  );
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
