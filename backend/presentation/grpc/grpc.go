package grpc

import (
	pb "github.com/YahiroRyo/yappi_storage/backend/grpc"
	"github.com/YahiroRyo/yappi_storage/backend/service"
)

type GrpcController struct {
	pb.UnimplementedFileServiceServer
	UploadFileChunkService service.UploadFileChunkService
	GetLoggedInUserService service.GetLoggedInUserService
}
