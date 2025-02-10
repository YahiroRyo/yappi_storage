"use client";

import { generateToken } from "@/api/users/generateToken";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { GridHorizonRow } from "@/components/ui/grid/gridHorizonRow";
import { GridVerticalRow } from "@/components/ui/grid/gridVerticalRow";
import { Text } from "@/components/ui/text";
import { uiConfig } from "@/components/ui/uiConfig";
import { useState } from "react";

export default function Page() {
  const [generatedToken, setGeneratedToken] = useState<string>();
  const [disabled, setDisabled] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDisabled(true);

    const res = await generateToken();
    if (res.status === 200) {
      setGeneratedToken(res.successedResponse!.token);
      setDisabled(false);
      return;
    }

    setError(res.failedResponse!.message);
    setDisabled(false);
  };

  return (
    <Container margin="1rem">
      <GridVerticalRow gap="1rem">
        <Text size="pixcel" pixcel="2rem" fontWeight={400}>
          トークン生成
        </Text>
        <Alert alertType="error">{error}</Alert>

        {generatedToken && (
          <GridHorizonRow gap=".5rem" gridTemplateColumns="15rem">
            <Button
              color={{
                backgroundColor: uiConfig.color.surface.main,
                hoverBackgroundColor: uiConfig.color.bg.secondary.container,
                textColor: uiConfig.color.text.main,
              }}
              border={`1px solid ${uiConfig.color.on.main}`}
              padding=".5rem 1rem"
              radius="32px"
              onClick={() => {
                navigator.clipboard.writeText(generatedToken);
              }}
              textAlign="center"
            >
              <Text
                size="small"
                fontWeight={700}
                color={uiConfig.color.text.secondary.container}
              >
                生成されたトークンをコピー
              </Text>
            </Button>
          </GridHorizonRow>
        )}

        <form onSubmit={onSubmit}>
          <GridVerticalRow gap="1rem">
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
              <Text size="small" fontWeight={600}>
                トークン生成
              </Text>
            </Button>
          </GridVerticalRow>
        </form>
      </GridVerticalRow>
    </Container>
  );
}
