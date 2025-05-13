import styles from "./index.module.scss";
import MuxPlayer from "@mux/mux-player-react/lazy";
import { SuccessedResponse as GetFileSuccessedResponse } from "@/api/files/getFile";
import { GridVerticalRow } from "@/components/ui/grid/gridVerticalRow";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { uiConfig } from "@/components/ui/uiConfig";
import { GridHorizonRow } from "@/components/ui/grid/gridHorizonRow";

type FilePreviewProps = {
  file?: GetFileSuccessedResponse;
  onClose?: () => void;
};

export const FilePreview = ({ file, onClose }: FilePreviewProps) => {
  if (!file) {
    return <></>;
  }

  if (file.kind === "Image") {
    return (
      <div onClick={onClose} className={styles.filePreviewWrapper}>
        <div className={styles.filePreview}>
          <GridVerticalRow
            onClick={(e) => e.stopPropagation()}
            height="80%"
            gap="1rem"
          >
            <Button>
              <GridHorizonRow gap="0.5rem">
                <Text color={uiConfig.color.text.high} size="medium">
                  {file.name}
                </Text>
              </GridHorizonRow>
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
      <div onClick={onClose} className={styles.filePreviewWrapper}>
        <div className={styles.filePreview}>
          <GridVerticalRow
            onClick={(e) => e.stopPropagation()}
            height="80%"
            gap="1rem"
          >
            <GridHorizonRow gap="0.5rem">
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
            <MuxPlayer  src={file.url!} className={styles.filePreview__video} />
          </GridVerticalRow>
        </div>
      </div>
    );
  }

  return (
    <div onClick={onClose} className={styles.filePreviewWrapper}>
      <div className={styles.filePreview}>
        <GridVerticalRow
          onClick={(e) => e.stopPropagation()}
          height="80%"
          gap="1rem"
        >
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
