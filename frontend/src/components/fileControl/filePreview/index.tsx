'use client'

import styles from "./index.module.scss";
import MuxPlayer from "@mux/mux-player-react/lazy";
import { SuccessedResponse as GetFileSuccessedResponse } from "@/api/files/getFile";
import { GridVerticalRow } from "@/components/ui/grid/gridVerticalRow";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { uiConfig } from "@/components/ui/uiConfig";
import { GridHorizonRow } from "@/components/ui/grid/gridHorizonRow";
import { Document, Page } from 'react-pdf';
import { useState } from "react";
import Image from 'next/image';
import 'react-pdf/dist/esm/Page/TextLayer.css'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'

type FilePreviewProps = {
  file?: GetFileSuccessedResponse;
  onClose?: () => void;
};

export const FilePreview = ({ file, onClose }: FilePreviewProps) => {
  const [numPages, setNumPages] = useState(0);


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
            <div className={styles.filePreview__image}>
              {file.url && (
                <Image
                  src={file.url}
                  alt={file.name}
                  fill
                  style={{ objectFit: 'contain' }}
                />
              )}
            </div>
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
  if (file.kind === "PDF") {
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
                <Document file={file.url!} onLoadSuccess={({ numPages }) => {
                  console.log(numPages);
                  setNumPages(numPages);
                }}>
                {
                  numPages > 0 && (
                    <div className={styles.filePreview__pdf}>
                      {Array.from(new Array(numPages), (el, index) => (
                        <Page className={styles.filePreview__pdf__page} key={`page_${index + 1}`} pageNumber={index + 1} />
                      ))}
                    </div>
                  )
                }
            </Document>
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
