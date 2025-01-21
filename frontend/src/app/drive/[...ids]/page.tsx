"use client";

import { useWsClient } from "@/api/files/client";
import { createDirectory } from "@/api/files/createDirectory";
import {
  getFile,
  SuccessedResponse as GetFileSuccessedResponse,
} from "@/api/files/getFile";
import styles from "./index.module.scss";
import {
  getFiles,
  SuccessedResponse as GetFilesSuccessedResponse,
} from "@/api/files/getFiles";
import { registrationFile } from "@/api/files/registrationFile";
import { uploadFile } from "@/api/files/uploadFile";
import { Button } from "@/components/ui/button";
import { GridVerticalRow } from "@/components/ui/grid/gridVerticalRow";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { SelectableTable } from "@/components/ui/table";
import { Text } from "@/components/ui/text";
import { uiConfig } from "@/components/ui/uiConfig";
import { fileToFileKind } from "@/helpers/fileToFileKind";
import { useMousePosition } from "@/hooks/useMousePosition";
import { redirect, useParams } from "next/navigation";
import { FormEventHandler, useEffect, useMemo, useRef, useState } from "react";
import MuxPlayer from "@mux/mux-player-react/lazy";
import { GridHorizonRow } from "@/components/ui/grid/gridHorizonRow";
import { Border } from "@/components/ui/border";
import { renameFile } from "@/api/files/renameFile";
import { deleteFile } from "@/api/files/deleteFile";

export default function Directory() {
  const { ids } = useParams();
  const [getFilesRes, setGetFilesRes] = useState<GetFilesSuccessedResponse>();
  const [getFileRes, setGetFileRes] = useState<GetFileSuccessedResponse>();
  const [refreshFiles, setRefreshFiles] = useState(false);
  const mousePosition = useMousePosition();
  const [isOpendedCreateSomethingMenu, setIsOpendedCreateSomethingMenu] =
    useState(false);
  const [isOpendedCreateDirectoryModal, setIsOpendedCreateDirectoryModal] =
    useState(false);
  const [isOpendedUploadFileModal, setIsOpendedUploadFileModal] =
    useState(false);
  const [isOpendedRenameModal, setIsOpendedRenameModal] = useState(false);
  const [isOpendedDeleteFileModal, setIsOpendedDeleteFileModal] =
    useState(false);
  const [createDirectoryFormData, setCreateDirectoryFormData] = useState({
    name: "",
    disabled: false,
  });
  const [selectingFileId, setSelectingFileId] = useState<string>();
  const [renameFileFormData, setRenameFileFormData] = useState({
    name: "",
    disabled: false,
  });
  const [deleteFileFormData, setDeleteFileFormData] = useState({
    disabled: false,
  });
  const [uploadFileFormData, setUploadFileFormData] = useState<{
    file?: File;
    disabled: boolean;
  }>({
    file: undefined,
    disabled: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const wsClient = useWsClient();

  const processedParentDirectoryId = useMemo(() => {
    let parentDirectoryIdForFetch: string | undefined = undefined;
    if (ids && ids.length) {
      const parentDirectoryId = ids[0];
      if (parentDirectoryId !== "root") {
        parentDirectoryIdForFetch = parentDirectoryId;
      }
    }

    return parentDirectoryIdForFetch;
  }, [ids]);

  const fileId = useMemo(() => {
    let fileIdForFetch: string | undefined = undefined;
    if (ids && ids.length >= 1) {
      fileIdForFetch = ids[1];
    }

    return fileIdForFetch;
  }, [ids]);

  useEffect(() => {
    (async () => {
      const res = await getFiles(30, 0, undefined, processedParentDirectoryId);

      if (res.status === 401) {
        redirect("/login");
      }

      setGetFilesRes(res.successedResponse!);
    })();

    if (fileId) {
      (async () => {
        const res = await getFile(fileId);

        if (res.status === 401) {
          redirect("/login");
        }

        setGetFileRes(res.successedResponse);
      })();
    }
  }, [refreshFiles, processedParentDirectoryId, fileId]);

  const onCreateDirectory: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setCreateDirectoryFormData((value) => ({ ...value, disabled: true }));

    const res = await createDirectory(
      createDirectoryFormData.name,
      processedParentDirectoryId
    );

    if (res.status === 200) {
      setIsOpendedCreateDirectoryModal(false);
      setCreateDirectoryFormData({ name: "", disabled: false });
      setRefreshFiles((value) => !value);
      return;
    }
  };

  const onUploadFile: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setUploadFileFormData((value) => ({ ...value, disabled: true }));

    const url = await uploadFile(wsClient, uploadFileFormData.file!);
    const res = await registrationFile(
      url,
      uploadFileFormData.file!.name,
      fileToFileKind(uploadFileFormData.file!),
      processedParentDirectoryId
    );
    setIsLoading(false);
    setUploadFileFormData((value) => ({ ...value, disabled: false }));
    setIsOpendedUploadFileModal(false);
    setRefreshFiles((value) => !value);

    if (res.status === 200) {
      console.log("uploaded");
    }
  };

  const onRenameFile: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setRenameFileFormData((value) => ({ ...value, disabled: true }));

    const res = await renameFile(selectingFileId!, renameFileFormData.name);
    if (res.status === 200) {
      setRefreshFiles((value) => !value);
      setRenameFileFormData({
        name: "",
        disabled: false,
      });
      setIsOpendedRenameModal(false);
    }
  };

  const onDeleteFile = async () => {
    setDeleteFileFormData((value) => ({ ...value, disabled: true }));

    const res = await deleteFile(selectingFileId!);
    if (res.status === 200) {
      setRefreshFiles((value) => !value);
      setDeleteFileFormData({
        disabled: false,
      });
      setIsOpendedDeleteFileModal(false);
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
          新規
        </Text>
      </Button>

      {getFilesRes ? (
        <SelectableTable
          headers={{
            id: "ID",
            user_id: "ユーザー名",
            parent_directory_id: "親ディレクトリID",
            embedding: "ベクトル",
            kind: "種類",
            url: "URL",
            name: "名前",
            created_at: "作成日時",
            updated_at: "更新日時",
          }}
          hiddenHeaders={[
            "id",
            "user_id",
            "parent_directory_id",
            "embedding",
            "url",
            "updated_at",
          ]}
          data={getFilesRes.files}
          isFixedHead={false}
          selectedRowBackgroundColor={uiConfig.color.bg.secondary.container}
          onSelected={(file) => {
            console.log(file);
            setSelectingFileId(file.id);
          }}
          selectedChildren={
            <GridVerticalRow gap=".5rem">
              <Button
                padding="0.5rem 1rem"
                color={{ hoverBackgroundColor: uiConfig.color.surface.high }}
                onClick={() => {
                  setIsOpendedRenameModal(true);
                }}
              >
                名前変更
              </Button>
              <Border color={uiConfig.color.surface.high} />
              <Button
                padding="0.5rem 1rem"
                color={{ hoverBackgroundColor: uiConfig.color.surface.high }}
                onClick={() => {
                  setIsOpendedDeleteFileModal(true);
                }}
              >
                削除
              </Button>
            </GridVerticalRow>
          }
          href={(file) => {
            if (file.kind === "Directory") {
              return `/drive/${file.id}`;
            }

            let parentDirectoryId = "root";
            if (processedParentDirectoryId) {
              parentDirectoryId = processedParentDirectoryId.toString();
            }
            return `/drive/${parentDirectoryId}/${file.id}`;
          }}
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
            <Button
              padding="0.5rem 1rem"
              color={{ hoverBackgroundColor: uiConfig.color.surface.high }}
              onClick={() => {
                setIsOpendedUploadFileModal(true);
                setIsOpendedCreateSomethingMenu(false);
              }}
            >
              ファイルアップロード
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

      {isOpendedUploadFileModal ? (
        <Modal width="20rem" onClose={() => setIsOpendedUploadFileModal(false)}>
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
        </Modal>
      ) : (
        <></>
      )}

      {isOpendedRenameModal ? (
        <Modal width="20rem" onClose={() => setIsOpendedRenameModal(false)}>
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
      ) : (
        <></>
      )}

      {isOpendedDeleteFileModal ? (
        <Modal width="20rem" onClose={() => setIsOpendedDeleteFileModal(false)}>
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
                disabled={renameFileFormData.disabled}
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
                disabled={renameFileFormData.disabled}
                onClick={() => setIsOpendedDeleteFileModal(false)}
              >
                <Text size="pixcel" pixcel="1rem" fontWeight={600}>
                  キャンセル
                </Text>
              </Button>
            </GridHorizonRow>
          </GridVerticalRow>
        </Modal>
      ) : (
        <></>
      )}

      <FilePreview file={getFileRes} />

      <Loading isLoading={isLoading} />
    </GridVerticalRow>
  );
}

type FilePreviewProps = {
  file?: GetFileSuccessedResponse;
};

const FilePreview = ({ file }: FilePreviewProps) => {
  if (!file) {
    return <></>;
  }

  if (file.kind === "Image") {
    return (
      <div className={styles.filePreviewWrapper}>
        <div className={styles.filePreview}>
          <GridVerticalRow height="80%" gap="1rem">
            <Button>
              <Text color={uiConfig.color.text.high} size="medium">
                {file.name}
              </Text>
            </Button>
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
                const link = document.createElement("a");
                link.href = file.url!;
                link.download = file.name;
                link.click();
              }}
              textAlign="center"
            >
              <Text
                size="small"
                fontWeight={700}
                color={uiConfig.color.text.secondary.container}
              >
                ダウンロード
              </Text>
            </Button>
            <img className={styles.filePreview__image} src={file.url} />
          </GridVerticalRow>
        </div>
      </div>
    );
  }
  if (file.kind === "Video") {
    return (
      <div className={styles.filePreviewWrapper}>
        <div className={styles.filePreview}>
          <GridVerticalRow height="80%" gap="1rem">
            <GridHorizonRow gap="0.5rem">
              <Button>X</Button>
              <Text color={uiConfig.color.text.high} size="medium">
                {file.name}
              </Text>
            </GridHorizonRow>
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
                const link = document.createElement("a");
                link.href = file.url!;
                link.download = file.name;
                link.click();
              }}
              textAlign="center"
            >
              <Text
                size="small"
                fontWeight={700}
                color={uiConfig.color.text.secondary.container}
              >
                ダウンロード
              </Text>
            </Button>
            <MuxPlayer src={file.url!} className={styles.filePreview__video} />
          </GridVerticalRow>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.filePreviewWrapper}>
      <div className={styles.filePreview}>
        <GridVerticalRow height="100%" gap="1rem">
          <Text color={uiConfig.color.text.high} size="medium">
            {file.name}
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
              const link = document.createElement("a");
              link.href = file.url!;
              link.download = file.name;
              link.click();
            }}
            textAlign="center"
          >
            <Text
              size="small"
              fontWeight={700}
              color={uiConfig.color.text.secondary.container}
            >
              ダウンロード
            </Text>
          </Button>
        </GridVerticalRow>
      </div>
    </div>
  );
};
