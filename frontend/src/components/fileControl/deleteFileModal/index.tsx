import { deleteFile } from "@/api/files/deleteFile";
import { Button } from "@/components/ui/button";
import { GridHorizonRow } from "@/components/ui/grid/gridHorizonRow";
import { GridVerticalRow } from "@/components/ui/grid/gridVerticalRow";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { uiConfig } from "@/components/ui/uiConfig";
import { File } from "@/types/file";
import { FormEventHandler, useState } from "react";

type Props = {
  isOpended: boolean;
  selectingFile?: File;
  setIsOpended: (value: boolean) => void;
  setRefreshFiles: (func: (value: boolean) => boolean) => void;
};

export const DeleteFileModal = ({
  isOpended,
  selectingFile,
  setIsOpended,
  setRefreshFiles,
}: Props) => {
  const [deleteFileFormData, setDeleteFileFormData] = useState({
    disabled: false,
  });

  const onDeleteFile = async () => {
    if (!selectingFile) {
      return;
    }

    setDeleteFileFormData((value) => ({ ...value, disabled: true }));

    const res = await deleteFile(selectingFile.id);
    if (res.status === 200) {
      setRefreshFiles((value) => !value);
      setDeleteFileFormData({
        disabled: false,
      });
      setIsOpended(false);
    }
  };

  if (isOpended) {
    return (
      <Modal width="20rem" onClose={() => setIsOpended(false)}>
        <GridVerticalRow gap="1rem">
          <Text size="pixcel" pixcel="1.5rem" fontWeight={400}>
            本当にファイルを削除しますか？
          </Text>
          <GridHorizonRow gridTemplateColumns="1fr 1fr" gap="1rem">
            <Button
              color={{
                textColor: uiConfig.color.text.high,
              }}
              textAlign="center"
              border={`1px solid ${uiConfig.color.on.secondary.container}`}
              radius="32px"
              padding="0.5rem 1rem"
              type="submit"
              disabled={deleteFileFormData.disabled}
              onClick={onDeleteFile}
            >
              <Text
                color={"#ff0000"}
                size="pixcel"
                pixcel="1rem"
                fontWeight={600}
              >
                削除
              </Text>
            </Button>
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
              disabled={deleteFileFormData.disabled}
              onClick={() => setIsOpended(false)}
            >
              <Text size="pixcel" pixcel="1rem" fontWeight={600}>
                キャンセル
              </Text>
            </Button>
          </GridHorizonRow>
        </GridVerticalRow>
      </Modal>
    );
  }

  return <></>;
};
