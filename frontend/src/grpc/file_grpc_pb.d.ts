// package: file
// file: file.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "grpc";
import * as file_pb from "./file_pb";

interface IFileServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    uploadFile: IFileServiceService_IUploadFile;
}

interface IFileServiceService_IUploadFile extends grpc.MethodDefinition<file_pb.UploadFileRequest, file_pb.UploadFileResponse> {
    path: "/file.FileService/UploadFile";
    requestStream: true;
    responseStream: false;
    requestSerialize: grpc.serialize<file_pb.UploadFileRequest>;
    requestDeserialize: grpc.deserialize<file_pb.UploadFileRequest>;
    responseSerialize: grpc.serialize<file_pb.UploadFileResponse>;
    responseDeserialize: grpc.deserialize<file_pb.UploadFileResponse>;
}

export const FileServiceService: IFileServiceService;

export interface IFileServiceServer {
    uploadFile: grpc.handleClientStreamingCall<file_pb.UploadFileRequest, file_pb.UploadFileResponse>;
}

export interface IFileServiceClient {
    uploadFile(callback: (error: grpc.ServiceError | null, response: file_pb.UploadFileResponse) => void): grpc.ClientWritableStream<file_pb.UploadFileRequest>;
    uploadFile(metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: file_pb.UploadFileResponse) => void): grpc.ClientWritableStream<file_pb.UploadFileRequest>;
    uploadFile(options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: file_pb.UploadFileResponse) => void): grpc.ClientWritableStream<file_pb.UploadFileRequest>;
    uploadFile(metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: file_pb.UploadFileResponse) => void): grpc.ClientWritableStream<file_pb.UploadFileRequest>;
}

export class FileServiceClient extends grpc.Client implements IFileServiceClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
    public uploadFile(callback: (error: grpc.ServiceError | null, response: file_pb.UploadFileResponse) => void): grpc.ClientWritableStream<file_pb.UploadFileRequest>;
    public uploadFile(metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: file_pb.UploadFileResponse) => void): grpc.ClientWritableStream<file_pb.UploadFileRequest>;
    public uploadFile(options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: file_pb.UploadFileResponse) => void): grpc.ClientWritableStream<file_pb.UploadFileRequest>;
    public uploadFile(metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: file_pb.UploadFileResponse) => void): grpc.ClientWritableStream<file_pb.UploadFileRequest>;
}
