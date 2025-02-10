import { createDirectory } from "@/api/files/createDirectory";
import { renameFile } from "@/api/files/renameFile";
import { Button } from "@/components/ui/button";
import { GridVerticalRow } from "@/components/ui/grid/gridVerticalRow";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { uiConfig } from "@/components/ui/uiConfig";
import { File } from "@/types/file";
import { FormEventHandler, useEffect, useState } from "react";

type Props = {
  selectingFile?: File;
  isOpended: boolean;
  setIsOpended: (value: boolean) => void;
  setRefreshFiles: (func: (value: boolean) => boolean) => void;
};

export const RenameFileModal = ({
  selectingFile,
  isOpended,
  setIsOpended,
  setRefreshFiles,
}: Props) => {
  const [renameFileFormData, setRenameFileFormData] = useState({
    name: "",
    disabled: false,
  });

  const onRenameFile: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (!selectingFile) {
      return;
    }

    setRenameFileFormData((value) => ({ ...value, disabled: true }));

    const res = await renameFile(selectingFile.id, renameFileFormData.name);
    if (res.status === 200) {
      setRefreshFiles((value) => !value);
      setRenameFileFormData({
        name: "",
        disabled: false,
      });
      setIsOpended(false);
    }
  };

  useEffect(() => {
    if (selectingFile) {
      setRenameFileFormData((value) => ({
        ...value,
        name: selectingFile.name,
      }));
    }
  }, [selectingFile]);

  if (isOpended) {
    return (
      <Modal width="20rem" onClose={() => setIsOpended(false)}>
        <GridVerticalRow gap="1rem">
          <Text size="pixcel" pixcel="1.5rem" fontWeight={400}>
            ファイル名変更
          </Text>
          <form onSubmit={onRenameFile}>
            <GridVerticalRow gap="1rem">
              <Input
                type="text"
                radius="4px"
                focusBoxShadow={`0 0 0 2px ${uiConfig.color.surface.tint}`}
                border={`1px solid ${uiConfig.color.on.secondary.container}`}
                placeholder="ファイル名を入力"
                padding="1rem"
                focusBorder={`1px solid transparent`}
                value={renameFileFormData.name}
                onChange={(value) =>
                  setRenameFileFormData((renameFileFormData) => ({
                    ...renameFileFormData,
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
                disabled={renameFileFormData.disabled}
              >
                <Text size="pixcel" pixcel="1rem" fontWeight={600}>
                  変更
                </Text>
              </Button>
            </GridVerticalRow>
          </form>
        </GridVerticalRow>
      </Modal>
    );
  }

  return <></>;
};
