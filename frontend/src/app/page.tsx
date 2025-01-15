"use client";

import { createDirectory } from "@/api/files/createDirectory";
import { getFiles, SuccessedResponse } from "@/api/files/getFiles";
import { Button } from "@/components/ui/button";
import { GridVerticalRow } from "@/components/ui/grid/gridVerticalRow";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { SelectableTable } from "@/components/ui/table";
import { Text } from "@/components/ui/text";
import { uiConfig } from "@/components/ui/uiConfig";
import { useMousePosition } from "@/hooks/useMousePosition";
import { redirect } from "next/navigation";
import { FormEventHandler, useEffect, useState } from "react";

export default function Home() {
  const [res, setRes] = useState<SuccessedResponse>();
  const [refreshFiles, setRefreshFiles] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<
    {
      種類: string;
      ファイル名: string;
      作成日時: string;
    }[]
  >([]);
  const mousePosition = useMousePosition();
  const [isOpendedCreateSomethingMenu, setIsOpendedCreateSomethingMenu] =
    useState(false);
  const [isOpendedCreateDirectoryModal, setIsOpendedCreateDirectoryModal] =
    useState(false);
  const [createDirectoryFormData, setCreateDirectoryFormData] = useState({
    name: "",
    disabled: false,
  });

  useEffect(() => {
    (async () => {
      const res = await getFiles(30, 0);

      if (res.status === 401) {
        redirect("/login");
      }
      if (res.status !== 200) {
        redirect("/login");
      }

      setRes(res.successedResponse!);

      setProcessedFiles(
        res.successedResponse!.files.map((file) => {
          return {
            種類: file.kind.toString(),
            ファイル名: file.name,
            作成日時: new Date(file.created_at).toString(),
          };
        })
      );
    })();
  }, [refreshFiles]);

  const onCreateDirectory: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setCreateDirectoryFormData((value) => ({ ...value, disabled: true }));

    const res = await createDirectory(createDirectoryFormData.name, undefined);

    if (res.status === 200) {
      setIsOpendedCreateDirectoryModal(false);
      setCreateDirectoryFormData({ name: "", disabled: false });
      setRefreshFiles((value) => !value);
      return;
    }
  };

  return (
    <GridVerticalRow gap=".5rem">
      <Text size="pixcel" pixcel="3rem">
        マイドライブ
      </Text>
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
          setIsOpendedCreateSomethingMenu(true);
        }}
        textAlign="center"
      >
        <Text
          size="small"
          fontWeight={700}
          color={uiConfig.color.text.secondary.container}
        >
          作成
        </Text>
      </Button>
      {res ? (
        <SelectableTable
          headers={["種類", "ファイル名", "作成日時"]}
          data={processedFiles}
          isFixedHead={false}
          selectedRowBackgroundColor={uiConfig.color.bg.secondary.container}
          selectedChildren={<></>}
        />
      ) : (
        <></>
      )}

      {isOpendedCreateSomethingMenu ? (
        <Select
          x={mousePosition.x}
          y={mousePosition.y}
          onClose={() => setIsOpendedCreateSomethingMenu(false)}
        >
          <GridVerticalRow gap=".5rem">
            <Button
              padding="0.5rem 1rem"
              color={{ hoverBackgroundColor: uiConfig.color.surface.high }}
              onClick={() => {
                setIsOpendedCreateDirectoryModal(true);
                setIsOpendedCreateSomethingMenu(false);
              }}
            >
              ディレクトリ作成
            </Button>
          </GridVerticalRow>
        </Select>
      ) : (
        <></>
      )}

      {isOpendedCreateDirectoryModal ? (
        <Modal
          width="20rem"
          onClose={() => setIsOpendedCreateDirectoryModal(false)}
        >
          <GridVerticalRow gap="1rem">
            <Text size="pixcel" pixcel="1.5rem" fontWeight={400}>
              ディレクトリ作成
            </Text>
            <form onSubmit={onCreateDirectory}>
              <GridVerticalRow gap="1rem">
                <Input
                  type="text"
                  radius="4px"
                  focusBoxShadow={`0 0 0 2px ${uiConfig.color.surface.tint}`}
                  border={`1px solid ${uiConfig.color.on.secondary.container}`}
                  placeholder="ディレクトリ名を入力"
                  padding="1rem"
                  focusBorder={`1px solid transparent`}
                  value={createDirectoryFormData.name}
                  onChange={(value) =>
                    setCreateDirectoryFormData((createDirectoryFormData) => ({
                      ...createDirectoryFormData,
                      name: value,
                    }))
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
                  disabled={createDirectoryFormData.disabled}
                >
                  <Text size="pixcel" pixcel="1rem" fontWeight={600}>
                    作成
                  </Text>
                </Button>
              </GridVerticalRow>
            </form>
          </GridVerticalRow>
        </Modal>
      ) : (
        <></>
      )}
    </GridVerticalRow>
  );
}
