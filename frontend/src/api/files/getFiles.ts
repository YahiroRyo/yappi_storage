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

export const getFiles = async (
  page_size: number,
  current_page_count: number,
  query?: string,
  parent_directory_id?: number
): Promise<Response> => {
  const params = {
    page_size: page_size.toString(),
    current_page_count: current_page_count.toString(),
    query: query ?? "",
    parent_directory_id: parent_directory_id?.toString() ?? "",
  };

  const urlQuery = new URLSearchParams(params);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/files?${urlQuery}`,
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
