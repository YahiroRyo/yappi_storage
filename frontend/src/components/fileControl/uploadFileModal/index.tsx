import { useWsClient } from "@/api/files/client";
import { registrationFiles } from "@/api/files/registrationFiles";
import { uploadFiles } from "@/api/files/uploadFile";
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
    files: File[];
    disabled: boolean;
  }>({
    files: [],
    disabled: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const wsClient = useWsClient();

  const onUploadFile: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (uploadFileFormData.files.length === 0) {
      return;
    }

    setIsLoading(true);
    setUploadFileFormData((value) => ({ ...value, disabled: true }));
    setUploadProgress(0);

    try {
      // すべてのファイルをアップロード
      const urls = await uploadFiles(wsClient, uploadFileFormData.files);
      
      // ファイルの登録情報を作成
      const registrationFilesData = uploadFileFormData.files.map((file, index) => ({
        url: urls[index],
        name: file.name,
        kind: fileToFileKind(file),
        parent_directory_id: parentDirectoryId
      }));

      // すべてのファイルを登録
      const res = await registrationFiles(registrationFilesData);
      
      setIsLoading(false);
      setUploadFileFormData({
        files: [],
        disabled: false,
      });
      setIsOpended(false);
      setRefreshFiles((value) => !value);

      if (res.status === 200) {
        console.log("uploaded all files");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setIsLoading(false);
      setUploadFileFormData((value) => ({ ...value, disabled: false }));
    }
  };

  // 選択したファイルの削除
  const removeFile = (index: number) => {
    setUploadFileFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  if (isOpended) {
    return (
      <Modal width="30rem" onClose={() => setIsOpended(false)}>
        <GridVerticalRow gap="1rem">
          <Text size="pixcel" pixcel="1.5rem" fontWeight={400}>
            ファイルアップロード
          </Text>
          <form onSubmit={onUploadFile}>
            <GridVerticalRow gap="1rem">
              <input
                type="file"
                multiple
                onChange={(e) => {
                  const fileList = e.currentTarget.files;

                  if (!fileList || fileList?.length === 0) {
                    return;
                  }

                  const filesArray = Array.from(fileList);

                  setUploadFileFormData((value) => ({
                    ...value,
                    files: [...value.files, ...filesArray],
                  }));
                }}
              />
              
              {uploadFileFormData.files.length > 0 && (
                <div style={{ maxHeight: "200px", overflow: "auto", margin: "1rem 0" }}>
                  <Text size="small" fontWeight={600}>選択されたファイル ({uploadFileFormData.files.length}件):</Text>
                  <ul style={{ listStyle: "none", padding: 0 }}>
                    {uploadFileFormData.files.map((file, index) => (
                      <li key={index} style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center",
                        padding: "0.5rem",
                        borderBottom: `1px solid ${uiConfig.color.surface.high}`
                      }}>
                        <Text size="small">
                          {file.name} ({(file.size / 1024).toFixed(2)} KB)
                        </Text>
                        <Button
                          padding="0.25rem 0.5rem"
                          color={{
                            backgroundColor: uiConfig.color.on.secondary.main,
                            textColor: uiConfig.color.text.high,
                          }}
                          onClick={() => removeFile(index)}
                        >
                          <Text size="small">削除</Text>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
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
                disabled={uploadFileFormData.disabled || uploadFileFormData.files.length === 0}
              >
                <Text size="pixcel" pixcel="1rem" fontWeight={600}>
                  {uploadFileFormData.files.length > 1 ? `${uploadFileFormData.files.length}件のファイルをアップロード` : "アップロード"}
                </Text>
              </Button>
              
              {isLoading && (
                <div style={{ width: "100%", height: "10px", backgroundColor: uiConfig.color.surface.high, borderRadius: "5px", overflow: "hidden" }}>
                  <div 
                    style={{ 
                      width: `${uploadProgress}%`, 
                      height: "100%", 
                      backgroundColor: uiConfig.color.bg.secondary.tint, 
                      transition: "width 0.3s ease-in-out" 
                    }} 
                  />
                </div>
              )}
            </GridVerticalRow>
          </form>
        </GridVerticalRow>

        <Loading isLoading={isLoading} />
      </Modal>
    );
  }

  return <></>;
};
