package helper

import (
	"log"
	"net"
	"os"
	"os/signal"

	"google.golang.org/grpc"
)

type GrpcServer struct {
	Server grpc.Server
}

func NewGrpcServer() *GrpcServer {
	grpcServer := GrpcServer{}
	grpcServer.Server = *grpc.NewServer()

	return &grpcServer
}

func (s *GrpcServer) Listen(port string) {
	listener, err := net.Listen("tcp", port)
	if err != nil {
		panic(err)
	}

	go func() {
		log.Printf("start gRPC server port: %v", port)
		s.Server.Serve(listener)
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit
	log.Println("stopping gRPC server...")
	s.Server.GracefulStop()
}
