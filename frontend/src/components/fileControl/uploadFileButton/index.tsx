import { Button } from "@/components/ui/button";
import { GridHorizonRow } from "@/components/ui/grid/gridHorizonRow";
import { Text } from "@/components/ui/text";
import { Upload } from "lucide-react";
import { ChangeEvent, useRef } from "react";

interface UploadFileButtonProps {
  onFileSelect: (files: FileList) => void;
  multiple?: boolean;
  accept?: string;
}

export const UploadFileButton = ({
  onFileSelect,
  multiple = true,
  accept,
}: UploadFileButtonProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div style={{ position: "relative" }}>
      <input
        type="file"
        hidden
        onChange={handleFileChange}
        multiple={multiple}
        accept={accept}
        id="file-upload"
        ref={inputRef}
      />
      <label htmlFor="file-upload">
        <Button
          type="button"
          color={{
            backgroundColor: "transparent",
            textColor: "#000",
          }}
          border="1px solid #e5e7eb"
          radius="32px"
          padding="0.5rem 1rem"
          textAlign="center"
          onClick={handleClick}
        >
          <GridHorizonRow gap="0.5rem" gridTemplateColumns="1rem 1fr">
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Upload style={{ width: "1rem", height: "1rem" }} />
            </span>
            <Text size="small">ファイルを選択</Text>
          </GridHorizonRow>
        </Button>
      </label>
    </div>
  );
}; 