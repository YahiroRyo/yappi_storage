import { deleteFiles } from "@/api/files/deleteFile";
import { Button } from "@/components/ui/button";
import { GridHorizonRow } from "@/components/ui/grid/gridHorizonRow";
import { GridVerticalRow } from "@/components/ui/grid/gridVerticalRow";
import { Modal } from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { uiConfig } from "@/components/ui/uiConfig";
import { File } from "@/types/file";
import { useState } from "react";

type Props = {
  isOpended: boolean;
  selectingFile?: File;
  selectingFiles?: File[];
  setIsOpended: (value: boolean) => void;
  setRefreshFiles: (func: (value: boolean) => boolean) => void;
};

export const DeleteFileModal = ({
  isOpended,
  selectingFile,
  selectingFiles = [],
  setIsOpended,
  setRefreshFiles,
}: Props) => {
  const [deleteFileFormData, setDeleteFileFormData] = useState({
    disabled: false,
  });

  // 選択されたファイル一覧を取得
  const files = selectingFiles.length > 0 ? selectingFiles : selectingFile ? [selectingFile] : [];

  const onDeleteFile = async () => {
    if (files.length === 0) {
      return;
    }

    setDeleteFileFormData((value) => ({ ...value, disabled: true }));

    // ファイルIDの一覧を取得
    const fileIds = files.map(file => file.id);

    const res = await deleteFiles(fileIds);
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
      <Modal width="30rem" onClose={() => setIsOpended(false)}>
        <GridVerticalRow gap="1rem">
          <Text size="pixcel" pixcel="1.5rem" fontWeight={400}>
            {files.length > 1 
              ? `${files.length}件のファイルを削除しますか？`
              : "このファイルを削除しますか？"}
          </Text>

          {files.length > 1 && (
            <div style={{ maxHeight: "200px", overflow: "auto", border: `1px solid ${uiConfig.color.surface.high}`, padding: "0.5rem", borderRadius: "4px" }}>
              <ul style={{ margin: 0, padding: "0 0 0 1rem" }}>
                {files.map((file, index) => (
                  <li key={index}>
                    <Text size="small">{file.name}</Text>
                  </li>
                ))}
              </ul>
            </div>
          )}

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
