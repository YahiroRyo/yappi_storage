"use client";

import { logout } from "@/api/users/logout";
import { GridVerticalRow } from "@/components/ui/grid/gridVerticalRow";
import { Text } from "@/components/ui/text";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    (async () => {
      await logout();
      redirect("/login");
    })();
  }, []);

  return (
    <GridVerticalRow gap="1rem">
      <Text size="medium">
        ログアウトしています。リダイレクトをしない場合は、
        <Link href="/login">こちらのボタン</Link>をクリックしてください。
      </Text>
    </GridVerticalRow>
  );
}
