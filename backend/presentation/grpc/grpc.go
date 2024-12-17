package grpc

import pb "github.com/YahiroRyo/yappi_storage/backend/grpc"

type GrpcServer struct {
	pb.UnimplementedFileServiceServer
}
