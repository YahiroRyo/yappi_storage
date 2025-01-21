type SuccessedResponse = {
  token: string;
};

type FailedResponse = {
  message: string;
};

export type Response = {
  status: number;
  failedResponse?: FailedResponse;
  successedResponse?: SuccessedResponse;
};

export const generateToken = async (): Promise<Response> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/users/generate/token`,
    {
      mode: "same-origin",
      credentials: "include",
      method: "POST",
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
