import { getAllCookies } from "@/helpers/getAllCookies";
import { User } from "@/types/user";

type SuccessedResponse = User;

type FailedResponse = {
  message: string;
};

export type Response = {
  status: number;
  failedResponse?: FailedResponse;
  successedResponse?: SuccessedResponse;
};

export const getLoggedInUser = async (): Promise<Response> => {
  const requestInit: RequestInit = {
    mode: "same-origin",
    credentials: "include",
  };

  if (typeof window === "undefined") {
    requestInit["headers"] = {
      Cookie: await getAllCookies(),
    };
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/users`,
    requestInit
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
