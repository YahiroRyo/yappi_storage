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
import { UploadFileButton } from "../uploadFileButton";
import { X } from "lucide-react";

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
      const urls = await uploadFiles(wsClient, uploadFileFormData.files);
      
      const registrationFilesData = uploadFileFormData.files.map((file, index) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        url: urls[index],
        kind: fileToFileKind(file),
        parent_directory_id: parentDirectoryId,
      }));

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

  const handleFileSelect = (files: FileList) => {
    setUploadFileFormData((prev) => ({
      ...prev,
      files: Array.from(files),
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
              <UploadFileButton onFileSelect={handleFileSelect} />
              
              {uploadFileFormData.files.length > 0 && (
                <div style={{ maxHeight: "200px", overflow: "auto", margin: "1rem 0" }}>
                  <Text size="small" fontWeight={600}>選択されたファイル ({uploadFileFormData.files.length}件):</Text>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {uploadFileFormData.files.map((file, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "0.5rem",
                          background: "#f9fafb",
                          borderRadius: "0.5rem",
                          minHeight: "2.5rem",
                          gap: "0.5rem"
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            fontSize: "0.9rem"
                          }}>
                            <Text size="small">{file.name}</Text>
                          </div>
                          <Text size="small" color="gray" className="file-size-text">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </Text>
                        </div>
                        <div
                          style={{
                            width: "2rem",
                            height: "2rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#e5e7eb",
                            borderRadius: "50%",
                            minWidth: "2rem",
                            minHeight: "2rem"
                          }}
                        >
                          <Button
                            type="button"
                            color={{
                              backgroundColor: "transparent",
                              textColor: "#333",
                            }}
                            radius="50%"
                            padding="0"
                            justifyContent="center"
                            onClick={() => {
                              setUploadFileFormData((prev) => ({
                                ...prev,
                                files: prev.files.filter((_, i) => i !== index),
                              }));
                            }}
                          >
                            <X style={{ width: "1rem", height: "1rem" }} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
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
