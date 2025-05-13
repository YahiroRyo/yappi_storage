import { moveFiles } from "@/api/files/moveFile";
import { getFiles } from "@/api/files/getFiles";
import { Button } from "@/components/ui/button";
import { GridVerticalRow } from "@/components/ui/grid/gridVerticalRow";
import { Modal } from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { uiConfig } from "@/components/ui/uiConfig";
import { File, FileKind } from "@/types/file";
import { useEffect, useState } from "react";
import { SelectableTable } from "@/components/ui/table";
import { FileIconKind } from "@/components/fileIconKind";

type Props = {
  selectingFiles: File[];
  isOpened: boolean;
  setIsOpened: (value: boolean) => void;
  setRefreshFiles: (func: (value: boolean) => boolean) => void;
};

export const MoveFileModal = ({
  selectingFiles,
  isOpened,
  setIsOpened,
  setRefreshFiles,
}: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [directories, setDirectories] = useState<File[]>([]);
  const [selectedDirectory, setSelectedDirectory] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentParentDirectoryId, setCurrentParentDirectoryId] = useState<string | undefined>(undefined);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{id: string | undefined, name: string}>>([
    { id: undefined, name: "ルート" }
  ]);

  // ディレクトリ一覧を取得
  const fetchDirectories = async (parentDirectoryId?: string) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await getFiles(50, 0, undefined, parentDirectoryId);
      if (res.status === 200 && res.successedResponse) {
        // ディレクトリのみをフィルタリング
        const directoriesOnly = res.successedResponse.files.filter(
          (file) => file.kind === "Directory"
        );
        
        // 選択中のファイルとディレクトリを除外
        const fileIds = selectingFiles.map(file => file.id);
        const filteredDirectories = directoriesOnly.filter(
          (dir) => !fileIds.includes(dir.id)
        );
        
        setDirectories(filteredDirectories);
        setCurrentParentDirectoryId(parentDirectoryId);
      } else {
        setErrorMessage("ディレクトリの取得に失敗しました");
      }
    } catch (error) {
      setErrorMessage("エラーが発生しました");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // ディレクトリ内に移動
  const navigateToDirectory = async (directory: File) => {
    setSelectedDirectory(null);
    await fetchDirectories(directory.id);
    
    // パンくずリストに追加
    setBreadcrumbs((prevBreadcrumbs) => [
      ...prevBreadcrumbs,
      { id: directory.id, name: directory.name }
    ]);
  };

  // パンくずリストでの移動
  const navigateToBreadcrumb = async (breadcrumbIndex: number) => {
    const breadcrumb = breadcrumbs[breadcrumbIndex];
    await fetchDirectories(breadcrumb.id);
    
    // パンくずリストを更新
    setBreadcrumbs((prevBreadcrumbs) => 
      prevBreadcrumbs.slice(0, breadcrumbIndex + 1)
    );
  };

  // 移動処理
  const handleMoveFile = async () => {
    if (selectingFiles.length === 0) {
      setErrorMessage("移動するファイルが選択されていません");
      return;
    }

    // 移動先のディレクトリを選択しているか、現在のディレクトリに移動
    const targetDirectoryId = selectedDirectory?.id || currentParentDirectoryId;
    
    if (!targetDirectoryId) {
      setErrorMessage("移動先ディレクトリを選択してください");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      // 選択中のすべてのファイルのIDを取得
      const fileIds = selectingFiles.map(file => file.id);
      
      const res = await moveFiles(fileIds, targetDirectoryId);
      if (res.status === 200) {
        setRefreshFiles((value) => !value);
        setIsOpened(false);
      } else {
        setErrorMessage("ファイルの移動に失敗しました");
      }
    } catch (error) {
      setErrorMessage("エラーが発生しました");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // モーダルが開かれたときにディレクトリ一覧を取得
  useEffect(() => {
    if (isOpened) {
      fetchDirectories(undefined);
      setBreadcrumbs([{ id: undefined, name: "ルート" }]);
      setSelectedDirectory(null);
    }
  }, [isOpened]);

  if (!isOpened) {
    return null;
  }

  return (
    <Modal width="40rem" onClose={() => setIsOpened(false)}>
      <GridVerticalRow gap="1rem">
        <Text size="pixcel" pixcel="1.5rem" fontWeight={400}>
          ファイル移動
        </Text>
        
        {errorMessage && (
          <Text size="small" color={uiConfig.color.on.secondary.main}>
            {errorMessage}
          </Text>
        )}
        
        <Text size="small">
          {selectingFiles.length}件のファイルを移動先ディレクトリに移動します
        </Text>

        {/* 選択中のファイル一覧 */}
        <div style={{ marginBottom: "1rem" }}>
          <Text size="small" fontWeight={600}>選択されたファイル:</Text>
          <div style={{ maxHeight: "100px", overflow: "auto", border: `1px solid ${uiConfig.color.surface.high}`, padding: "0.5rem", borderRadius: "4px" }}>
            <ul style={{ margin: 0, padding: "0 0 0 1rem" }}>
              {selectingFiles.map((file, index) => (
                <li key={index}>
                  <Text size="small">{file.name}</Text>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* パンくずリスト */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
          {breadcrumbs.map((breadcrumb, index) => (
            <div key={index} style={{ display: "flex", alignItems: "center" }}>
              {index > 0 && (
                <span style={{ margin: "0 0.25rem" }}>
                  <Text size="small">/</Text>
                </span>
              )}
              <Button
                padding="0.25rem 0.5rem"
                onClick={() => navigateToBreadcrumb(index)}
                color={{
                  backgroundColor: "transparent",
                  textColor: uiConfig.color.text.secondary.container,
                  hoverBackgroundColor: index < breadcrumbs.length - 1 ? uiConfig.color.surface.high : "transparent"
                }}
              >
                <Text size="small">{breadcrumb.name}</Text>
              </Button>
            </div>
          ))}
        </div>
        
        <div style={{ maxHeight: "300px", overflow: "auto" }}>
          {isLoading ? (
            <Text size="small">読み込み中...</Text>
          ) : directories.length === 0 ? (
            <Text size="small">このディレクトリには移動先ディレクトリがありません</Text>
          ) : (
            <SelectableTable
              headers={{
                id: "ID",
                user_id: "ユーザーID",
                parent_directory_id: "親ディレクトリID",
                embedding: "ベクトル",
                kind: "種類",
                url: "URL",
                name: "ディレクトリ名",
                created_at: "作成日時",
                updated_at: "更新日時"
              }}
              hiddenHeaders={[
                "id",
                "user_id",
                "parent_directory_id",
                "embedding",
                "url",
                "created_at",
                "updated_at"
              ]}
              data={directories}
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
              onSelected={(directory) => {
                setSelectedDirectory(directory);
              }}
              onDoubleClick={(directory) => {
                navigateToDirectory(directory);
              }}
              selectedChildren={
                <Button
                  padding="0.5rem 1rem"
                  color={{ hoverBackgroundColor: uiConfig.color.surface.high }}
                  onClick={() => {
                    if (selectedDirectory) {
                      handleMoveFile();
                    }
                  }}
                  disabled={isLoading}
                >
                  この場所に移動
                </Button>
              }
            />
          )}
        </div>
        
        <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between" }}>
          <Button
            color={{
              backgroundColor: uiConfig.color.surface.main,
              textColor: uiConfig.color.text.main,
            }}
            textAlign="center"
            border={`1px solid ${uiConfig.color.on.secondary.container}`}
            radius="32px"
            padding="0.5rem 1rem"
            onClick={() => setIsOpened(false)}
          >
            <Text size="pixcel" pixcel="1rem" fontWeight={600}>
              キャンセル
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
            onClick={handleMoveFile}
            disabled={isLoading}
          >
            <Text size="pixcel" pixcel="1rem" fontWeight={600}>
              現在のディレクトリに移動
            </Text>
          </Button>
        </div>
      </GridVerticalRow>
    </Modal>
  );
}; 