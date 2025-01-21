import "./globals.scss";
import { Button } from "@/components/ui/button";
import { uiConfig } from "@/components/ui/uiConfig";
import { GridHorizonRow } from "@/components/ui/grid/gridHorizonRow";
import { GridVerticalRow } from "@/components/ui/grid/gridVerticalRow";
import { Text } from "@/components/ui/text";
import { getLoggedInUser, Response } from "@/api/users/getLoggedInUser";
import { Suspense, use } from "react";

export default function RootTemplate({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const res = use<Response>(getLoggedInUser());

  return (
    <Suspense
      fallback={
        <GridHorizonRow gap="2rem" gridTemplateColumns="15rem 1fr">
          <GridVerticalRow
            backgroundColor={uiConfig.color.surface.high}
            height="100vh"
            gap="0"
          >
            <Text size="medium">Loading...</Text>
          </GridVerticalRow>
        </GridHorizonRow>
      }
    >
      <GridHorizonRow gap="2rem" gridTemplateColumns="10rem 1fr">
        <GridVerticalRow
          backgroundColor={uiConfig.color.surface.high}
          height="100vh"
          gap="0"
        >
          {res.successedResponse ? (
            <>
              <Button
                color={{
                  backgroundColor: uiConfig.color.surface.high,
                  textColor: uiConfig.color.text.secondary.container,
                  sameHrefBackgroundColor:
                    uiConfig.color.bg.secondary.container,
                  includeOtherLinkBackgroundColor:
                    uiConfig.color.bg.secondary.container,
                  hoverBackgroundColor: uiConfig.color.on.high,
                }}
                padding="0.5rem 1rem"
                radius="0 32px 32px 0"
                textAlign="left"
                href="/drive/root"
                otherLink="/drive"
              >
                <Text fontWeight={700} size="medium">
                  ファイル一覧
                </Text>
              </Button>
              <Button
                color={{
                  backgroundColor: uiConfig.color.surface.high,
                  textColor: uiConfig.color.text.secondary.container,
                  sameHrefBackgroundColor:
                    uiConfig.color.bg.secondary.container,
                  hoverBackgroundColor: uiConfig.color.on.high,
                }}
                padding="0.5rem 1rem"
                radius="0 32px 32px 0"
                textAlign="left"
                href="/generateToken"
              >
                <Text fontWeight={700} size="medium">
                  トークン生成
                </Text>
              </Button>
              <Button
                color={{
                  backgroundColor: uiConfig.color.surface.high,
                  textColor: uiConfig.color.text.secondary.container,
                  sameHrefBackgroundColor:
                    uiConfig.color.bg.secondary.container,
                  hoverBackgroundColor: uiConfig.color.on.high,
                }}
                padding="0.5rem 1rem"
                radius="0 32px 32px 0"
                textAlign="left"
                href="/logout"
              >
                <Text fontWeight={700} size="medium">
                  ログアウト
                </Text>
              </Button>
            </>
          ) : (
            <>
              <Button
                color={{
                  backgroundColor: uiConfig.color.surface.high,
                  textColor: uiConfig.color.text.secondary.container,
                  sameHrefBackgroundColor:
                    uiConfig.color.bg.secondary.container,
                  hoverBackgroundColor: uiConfig.color.on.high,
                }}
                padding="0.5rem 1rem"
                radius="0 32px 32px 0"
                textAlign="left"
                href="/login"
              >
                <Text fontWeight={700} size="medium">
                  ログイン
                </Text>
              </Button>
              <Button
                color={{
                  backgroundColor: uiConfig.color.surface.high,
                  textColor: uiConfig.color.text.secondary.container,
                  sameHrefBackgroundColor:
                    uiConfig.color.bg.secondary.container,
                  hoverBackgroundColor: uiConfig.color.on.high,
                }}
                padding="0.5rem 1rem"
                radius="0 32px 32px 0"
                textAlign="left"
                href="/registration"
              >
                <Text fontWeight={700} size="medium">
                  登録
                </Text>
              </Button>
            </>
          )}
        </GridVerticalRow>
        {children}
      </GridHorizonRow>
    </Suspense>
  );
}
