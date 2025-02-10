import { useWsClient } from "@/api/files/client";
import { registrationFile } from "@/api/files/registrationFile";
import { uploadFile } from "@/api/files/uploadFile";
import { Button } from "@/components/ui/button";
import { GridVerticalRow } from "@/components/ui/grid/gridVerticalRow";
import { Loading } from "@/components/ui/loading";
import { Modal } from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { uiConfig } from "@/components/ui/uiConfig";
import { fileToFileKind } from "@/helpers/fileToFileKind";
import { FormEventHandler, useState } from "react";

type Props = {
  parentDirectoryId?: string;
  isOpended: boolean;
  setIsOpended: (value: boolean) => void;
  setRefreshFiles: (func: (value: boolean) => boolean) => void;
};

export const UploadFileModal = ({
  parentDirectoryId,
  isOpended,
  setIsOpended,
  setRefreshFiles,
}: Props) => {
  const [uploadFileFormData, setUploadFileFormData] = useState<{
    file?: File;
    disabled: boolean;
  }>({
    file: undefined,
    disabled: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const wsClient = useWsClient();

  const onUploadFile: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setUploadFileFormData((value) => ({ ...value, disabled: true }));

    const url = await uploadFile(wsClient, uploadFileFormData.file!);
    const res = await registrationFile(
      url,
      uploadFileFormData.file!.name,
      fileToFileKind(uploadFileFormData.file!),
      parentDirectoryId
    );
    setIsLoading(false);
    setUploadFileFormData((value) => ({ ...value, disabled: false }));
    setIsOpended(false);
    setRefreshFiles((value) => !value);

    if (res.status === 200) {
      console.log("uploaded");
    }
  };

  if (isOpended) {
    return (
      <Modal width="20rem" onClose={() => setIsOpended(false)}>
        <GridVerticalRow gap="1rem">
          <Text size="pixcel" pixcel="1.5rem" fontWeight={400}>
            ファイルアップロード
          </Text>
          <form onSubmit={onUploadFile}>
            <GridVerticalRow gap="1rem">
              <input
                type="file"
                onChange={(e) => {
                  const files = e.currentTarget.files;

                  if (!files || files?.length === 0) {
                    return;
                  }

                  const file = files[0];

                  setUploadFileFormData((value) => ({
                    ...value,
                    file,
                  }));
                }}
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
                disabled={uploadFileFormData.disabled}
              >
                <Text size="pixcel" pixcel="1rem" fontWeight={600}>
                  アップロード
                </Text>
              </Button>
            </GridVerticalRow>
          </form>
        </GridVerticalRow>

        <Loading isLoading={isLoading} />
      </Modal>
    );
  }

  return <></>;
};
