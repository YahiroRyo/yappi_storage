import { File } from "@/types/file";

export type SuccessedResponse = {
  page_size: number;
  current_page_count: number;
  files: File[];
};

type FailedResponse = {
  message: string;
};

type Response = {
  status: number;
  failedResponse?: FailedResponse;
  successedResponse?: SuccessedResponse;
};

export const createDirectory = async (
  name: string,
  parent_directory_id?: string
): Promise<Response> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/files/directory`,
    {
      method: "POST",
      body: JSON.stringify({ name, parent_directory_id }),
      mode: "same-origin",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
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
