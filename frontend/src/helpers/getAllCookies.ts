import { cookies } from "next/headers";

export const getAllCookies = async (): Promise<string> => {
  const cookieStore = cookies();
  const cookie = (await cookieStore)
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join(";");

  return cookie;
};
