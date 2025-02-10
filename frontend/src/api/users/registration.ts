import { User } from "@/types/user";

type SuccessedResponse = User;

type FailedResponse = {
  errors: Array<string>;
  message: string;
};

type Response = {
  status: number;
  failedResponse?: FailedResponse;
  successedResponse?: SuccessedResponse;
};

export const registration = async (
  email: string,
  password: string
): Promise<Response> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/users/registration`,
    {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        icon: "https://placehold.jp/150x150.png",
      }),
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
