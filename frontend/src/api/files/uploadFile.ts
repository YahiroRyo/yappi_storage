const MessageType = {
  File: 0,
  InitializeFileName: 1,
  FinishedUpload: 2,
} as const;

export const uploadFile = async (
  client: WebSocket,
  file: File
): Promise<string> => {
  client.send(`${MessageType.InitializeFileName.toString()},${file.name}`);

  const chunkSize = 1024 * 1024 * 50;
  let start = 0;

  while (start < file.size) {
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);

    start += chunkSize;
    client.send(await chunk.arrayBuffer());
  }
  client.send(`${MessageType.FinishedUpload.toString()},finished`);

  return new Promise((resolve) => {
    client.onmessage = (e) => {
      resolve(e.data);
    };
  });
};
