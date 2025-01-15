"use client";

import { useEffect } from "react";

type Props = {
  children?: React.ReactNode;
};

export const RejectContextMenu = ({ children }: Props) => {
  useEffect(() => {
    document.oncontextmenu = () => false;
  });

  return <div>{children}</div>;
};
