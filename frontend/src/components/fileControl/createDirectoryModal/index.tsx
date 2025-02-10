import { createDirectory } from "@/api/files/createDirectory";
import { Button } from "@/components/ui/button";
import { GridVerticalRow } from "@/components/ui/grid/gridVerticalRow";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { uiConfig } from "@/components/ui/uiConfig";
import { FormEventHandler, useState } from "react";

type Props = {
  parentDirectoryId?: string;
  isOpended: boolean;
  setIsOpended: (value: boolean) => void;
  setRefreshFiles: (func: (value: boolean) => boolean) => void;
};

export const CreateDirectoryModal = ({
  parentDirectoryId,
  isOpended,
  setIsOpended,
  setRefreshFiles,
}: Props) => {
  const [createDirectoryFormData, setCreateDirectoryFormData] = useState({
    name: "",
    disabled: false,
  });

  const onCreateDirectory: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setCreateDirectoryFormData((value) => ({ ...value, disabled: true }));

    const res = await createDirectory(
      createDirectoryFormData.name,
      parentDirectoryId
    );

    if (res.status === 200) {
      setIsOpended(false);
      setCreateDirectoryFormData({ name: "", disabled: false });
      setRefreshFiles((value) => !value);
      return;
    }
  };

  if (isOpended) {
    return (
      <Modal width="20rem" onClose={() => setIsOpended(false)}>
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
    );
  }

  return <></>;
};
