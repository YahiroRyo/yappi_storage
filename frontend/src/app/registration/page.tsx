"use client";

import { registration } from "@/api/users/registration";
import { Button } from "@/components/ui/button";
import { GridVerticalRow } from "@/components/ui/grid/gridVerticalRow";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { uiConfig } from "@/components/ui/uiConfig";
import { redirect } from "next/navigation";
import { useState } from "react";

export default function Page() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rePassword: "",
  });
  const [disabled, setDisabled] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDisabled(true);

    const res = await registration(formData.email, formData.password);
    if (res.status === 200) {
      redirect("/");
    }

    console.log(res.failedResponse);
    setDisabled(false);
  };

  return (
    <GridVerticalRow gap="1rem">
      <Text size="pixcel" pixcel="2rem" fontWeight={400}>
        登録
      </Text>
      <form onSubmit={onSubmit}>
        <GridVerticalRow gap="1rem">
          <Input
            radius="4px"
            focusBoxShadow={`0 0 0 2px ${uiConfig.color.surface.tint}`}
            border={`1px solid ${uiConfig.color.on.secondary.container}`}
            type="email"
            placeholder="メールアドレスを入力"
            padding="1rem"
            focusBorder={`1px solid transparent`}
            value={formData.email}
            onChange={(value) =>
              setFormData((formData) => ({ ...formData, email: value }))
            }
          />
          <Input
            radius="4px"
            focusBoxShadow={`0 0 0 2px ${uiConfig.color.surface.tint}`}
            border={`1px solid ${uiConfig.color.on.secondary.container}`}
            type="password"
            placeholder="パスワードを入力"
            padding="1rem"
            focusBorder={`1px solid transparent`}
            value={formData.password}
            onChange={(value) =>
              setFormData((formData) => ({ ...formData, password: value }))
            }
          />
          <Input
            radius="4px"
            focusBoxShadow={`0 0 0 2px ${uiConfig.color.surface.tint}`}
            border={`1px solid ${uiConfig.color.on.secondary.container}`}
            type="password"
            placeholder="もう一度パスワードを入力"
            padding="1rem"
            focusBorder={`1px solid transparent`}
            value={formData.rePassword}
            onChange={(value) =>
              setFormData((formData) => ({ ...formData, rePassword: value }))
            }
          />
          <Button
            color={{
              backgroundColor: uiConfig.color.bg.secondary.dark,
              textColor: uiConfig.color.text.high,
            }}
            textAlign="center"
            border={`1px solid ${uiConfig.color.on.secondary.container}`}
            radius="32px"
            padding="0.5rem 1rem"
            type="submit"
            disabled={disabled}
          >
            <Text size="medium" fontWeight={600}>
              登録
            </Text>
          </Button>
        </GridVerticalRow>
      </form>
    </GridVerticalRow>
  );
}
