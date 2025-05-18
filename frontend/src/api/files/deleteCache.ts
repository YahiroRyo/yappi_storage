export type SuccessedResponse = {
  message: string;
};

type FailedResponse = {
  message: string;
};

type Response = {
  status: number;
  failedResponse?: FailedResponse;
  successedResponse?: SuccessedResponse;
};

export const deleteCache = async (): Promise<Response> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/files/delete-cache`,
    {
      method: "DELETE",
      mode: "same-origin",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (res.status === 401) {
    return {
      status: 401,
      failedResponse: {
        message: "Unauthorized",
      },
    };
  }
  
  return {
    status: res.status,
    successedResponse: {
      message: "Cache deleted",
    },
  };
}