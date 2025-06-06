"use client";

import {
  getFile,
  SuccessedResponse as GetFileSuccessedResponse,
} from "@/api/files/getFile";
import {
  getFiles,
  SuccessedResponse as GetFilesSuccessedResponse,
} from "@/api/files/getFiles";
import { Button } from "@/components/ui/button";
import { GridVerticalRow } from "@/components/ui/grid/gridVerticalRow";
import { Loading } from "@/components/ui/loading";
import { Select } from "@/components/ui/select";
import { SelectableTable } from "@/components/ui/table";
import { Text } from "@/components/ui/text";
import { uiConfig } from "@/components/ui/uiConfig";
import { useMousePosition } from "@/hooks/useMousePosition";
import { redirect, useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Border } from "@/components/ui/border";
import { FileIconKind } from "@/components/fileIconKind";
import { Container } from "@/components/ui/container";
import { CreateDirectoryModal } from "@/components/fileControl/createDirectoryModal";
import { File } from "@/types/file";
import { DeleteFileModal } from "@/components/fileControl/deleteFileModal";
import { UploadFileModal } from "@/components/fileControl/uploadFileModal";
import { RenameFileModal } from "@/components/fileControl/renameFileModal";
import { FilePreview } from "@/components/fileControl/filePreview";
import { MoveFileModal } from "@/components/fileControl/moveFileModal";
import { ReloadIcon } from "@/components/icons/reloadIcon";
import { GridHorizonRow } from "@/components/ui/grid/gridHorizonRow";
import { deleteCache } from "@/api/files/deleteCache";
import { downloadMultipleFiles } from "@/helpers/fileDownload";

const ITEMS_PER_PAGE = 30;

export default function Directory() {
  const { ids } = useParams();
  const router = useRouter();
  const pathname = usePathname();
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
  const [isOpendedMoveFileModal, setIsOpendedMoveFileModal] = useState(false);
  const [selectingFile, setSelectingFile] = useState<File>();
  const [selectingFiles, setSelectingFiles] = useState<File[]>([]);
  const [isLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fileId = useMemo(() => {
    if (ids && ids.length > 1) {
      return ids[1];
    }
    return undefined;
  }, [ids]);

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

  const exceptFileIdPathname = useMemo(() => {
    let result = pathname;
    if (fileId) {
      result = result.replace("/" + fileId, "");
    }
    return result;
  }, [fileId]);

  useEffect(() => {
    (async () => {
      const res = await getFiles(ITEMS_PER_PAGE, currentPage - 1, undefined, processedParentDirectoryId);

      if (res.status === 401) {
        redirect("/login");
      }

      setGetFilesRes(res.successedResponse!);
      setTotalPages(Math.max(1, Math.ceil(res.successedResponse!.total / ITEMS_PER_PAGE)));
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
  }, [refreshFiles, processedParentDirectoryId, fileId, currentPage]);

  return (
    <Container margin="1rem">
      <GridVerticalRow gap=".5rem">
        <GridHorizonRow gap="1rem" gridTemplateColumns="1.5rem 1fr">
          <span 
            onClick={() => {
              (async () => {
                const res = await deleteCache();
                if (res.status === 401) {
                  redirect("/login");
                }
                setRefreshFiles(prev => !prev);
              })();
            }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", cursor :'pointer'}}>
              <ReloadIcon width="1.5rem" height="1.5rem" />
          </span>
          <Text size="pixcel" pixcel="3rem">
            マイドライブ
          </Text>
        </GridHorizonRow>

        <div style={{ display: "flex", gap: "1rem" }}>
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
          
          {selectingFiles.length > 1 && (
            <>
              <Button
                color={{
                  backgroundColor: uiConfig.color.surface.main,
                  hoverBackgroundColor: uiConfig.color.bg.secondary.container,
                  textColor: uiConfig.color.text.main,
                }}
                border={`1px solid ${uiConfig.color.on.main}`}
                padding=".5rem 1rem"
                radius="32px"
                onClick={async () => {
                  await downloadMultipleFiles(selectingFiles);
                }}
                textAlign="center"
              >
                <Text
                  size="small"
                  fontWeight={700}
                  color={uiConfig.color.text.secondary.container}
                >
                  {selectingFiles.length}件のファイルをダウンロード
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
                  setIsOpendedMoveFileModal(true);
                }}
                textAlign="center"
              >
                <Text
                  size="small"
                  fontWeight={700}
                  color={uiConfig.color.text.secondary.container}
                >
                  {selectingFiles.length}件のファイルを移動
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
                  setIsOpendedDeleteFileModal(true);
                }}
                textAlign="center"
              >
                <Text
                  size="small"
                  fontWeight={700}
                  color={uiConfig.color.text.secondary.container}
                >
                  {selectingFiles.length}件のファイルを削除
                </Text>
              </Button>
            </>
          )}
        </div>

        {getFilesRes ? (
          <>
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
              showColumn={(row, key) => {
                if (key === "kind") {
                  return (
                    <FileIconKind
                      style={{ margin: "auto 0", display: "block" }}
                      kind={row[key]}
                    />
                  );
                }
                return (row as any)[key];
              }}
              isFixedHead={false}
              selectedRowBackgroundColor={uiConfig.color.bg.secondary.container}
              onSelected={(file) => {
                setSelectingFile(file);
              }}
              onMultipleSelected={(files) => {
                setSelectingFiles(files);
                if (files.length === 1) {
                  setSelectingFile(files[0]);
                }
              }}
              multipleSelectable={true}
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
                      setIsOpendedMoveFileModal(true);
                    }}
                  >
                    移動
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
                  parentDirectoryId = processedParentDirectoryId;
                }
                return `/drive/${parentDirectoryId}/${file.id}`;
              }}
              onDoubleClick={(file) => {
                if (file.kind === "Directory") {
                  router.push(`/drive/${file.id}`);
                  return;
                }

                let parentDirectoryId = "root";
                if (processedParentDirectoryId) {
                  parentDirectoryId = processedParentDirectoryId;
                }
                router.push(`/drive/${parentDirectoryId}/${file.id}`);
              }}
            />
            <Container margin="1rem 0">
              <GridHorizonRow gap="1rem" gridTemplateColumns="1fr 1fr 1fr">
                <Button
                  color={{
                    backgroundColor: uiConfig.color.surface.main,
                    hoverBackgroundColor: uiConfig.color.bg.secondary.container,
                    textColor: uiConfig.color.text.main,
                  }}
                  border={`1px solid ${uiConfig.color.on.main}`}
                  padding=".5rem 1rem"
                  radius="32px"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <Text size="small" fontWeight={700}>
                    前へ
                  </Text>
                </Button>
                <Text align="center" size="small">
                  {currentPage} / {totalPages}
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
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <Text size="small" fontWeight={700}>
                    次へ
                  </Text>
                </Button>
              </GridHorizonRow>
            </Container>
          </>
        ) : (
          <></>
        )}

        <CreateDirectoryModal
          parentDirectoryId={processedParentDirectoryId}
          isOpended={isOpendedCreateDirectoryModal}
          setIsOpended={setIsOpendedCreateDirectoryModal}
          setRefreshFiles={setRefreshFiles}
        />

        <DeleteFileModal
          selectingFile={selectingFile}
          selectingFiles={selectingFiles.length > 0 ? selectingFiles : selectingFile ? [selectingFile] : []}
          isOpended={isOpendedDeleteFileModal}
          setIsOpended={setIsOpendedDeleteFileModal}
          setRefreshFiles={setRefreshFiles}
        />

        <UploadFileModal
          parentDirectoryId={processedParentDirectoryId}
          isOpended={isOpendedUploadFileModal}
          setIsOpended={setIsOpendedUploadFileModal}
          setRefreshFiles={setRefreshFiles}
        />

        <RenameFileModal
          selectingFile={selectingFile}
          isOpended={isOpendedRenameModal}
          setIsOpended={setIsOpendedRenameModal}
          setRefreshFiles={setRefreshFiles}
        />

        <MoveFileModal
          selectingFiles={selectingFiles.length > 0 ? selectingFiles : selectingFile ? [selectingFile] : []}
          isOpened={isOpendedMoveFileModal}
          setIsOpened={setIsOpendedMoveFileModal}
          setRefreshFiles={setRefreshFiles}
        />

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

        <FilePreview
          onClose={() => router.push(exceptFileIdPathname)}
          file={getFileRes}
        />

        <Loading isLoading={isLoading} />
      </GridVerticalRow>
    </Container>
  );
}
