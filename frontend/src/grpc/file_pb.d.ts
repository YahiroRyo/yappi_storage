// package: file
// file: file.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";

export class UploadFileRequest extends jspb.Message { 
    getFile(): Uint8Array | string;
    getFile_asU8(): Uint8Array;
    getFile_asB64(): string;
    setFile(value: Uint8Array | string): UploadFileRequest;
    getFileName(): string;
    setFileName(value: string): UploadFileRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UploadFileRequest.AsObject;
    static toObject(includeInstance: boolean, msg: UploadFileRequest): UploadFileRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UploadFileRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UploadFileRequest;
    static deserializeBinaryFromReader(message: UploadFileRequest, reader: jspb.BinaryReader): UploadFileRequest;
}

export namespace UploadFileRequest {
    export type AsObject = {
        file: Uint8Array | string,
        fileName: string,
    }
}

export class UploadFileResponse extends jspb.Message { 
    getUrl(): string;
    setUrl(value: string): UploadFileResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UploadFileResponse.AsObject;
    static toObject(includeInstance: boolean, msg: UploadFileResponse): UploadFileResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UploadFileResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UploadFileResponse;
    static deserializeBinaryFromReader(message: UploadFileResponse, reader: jspb.BinaryReader): UploadFileResponse;
}

export namespace UploadFileResponse {
    export type AsObject = {
        url: string,
    }
}
