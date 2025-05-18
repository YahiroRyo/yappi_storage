import { SuccessedResponse as GetFileSuccessedResponse } from "@/api/files/getFile";

export const downloadFile = (file: GetFileSuccessedResponse) => {
  const link = document.createElement("a");
  link.href = file.url!;
  link.download = file.name;
  link.click();
};

export const downloadMultipleFiles = async (files: GetFileSuccessedResponse[]) => {
  console.log(files);
  for (const file of files) {
    if (!file.url) {
      continue;
    }

    await new Promise<void>((resolve) => {
      const link = document.createElement("a");
      link.href = file.url!;
      link.download = file.name;
      link.onload = () => resolve();
      link.onerror = () => resolve();
      link.click();
      resolve();
    });
  }
}; 