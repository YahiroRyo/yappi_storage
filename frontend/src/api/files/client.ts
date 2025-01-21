import { useMemo } from "react";

export const useWsClient = () => {
  return useMemo(
    () => new WebSocket(`${process.env.NEXT_PUBLIC_API_URL}/ws/uploadfile`),
    []
  );
};
