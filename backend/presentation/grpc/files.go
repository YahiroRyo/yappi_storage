package grpc

import (
	"fmt"
	"io"
	"path/filepath"

	pb "github.com/YahiroRyo/yappi_storage/backend/grpc"
	"github.com/YahiroRyo/yappi_storage/backend/helper"
	"google.golang.org/grpc"
)

func (pd *GrpcController) UploadFile(stream grpc.ClientStreamingServer[pb.UploadFileRequest, pb.UploadFileResponse]) error {
	var (
		filename string
		url      *string
	)

	for {
		res, err := stream.Recv()

		if filename == "" && res.FileName != "" {
			id, err := helper.GenerateSnowflake()
			if err != nil {
				return err
			}

			filename = fmt.Sprintf("%s.%s", *id, filepath.Ext(res.FileName))
		}

		if err == io.EOF {
			break
		}

		if err != nil {
			return err
		}

		if res.File != nil {
			url, err = pd.UploadFileChunkService.Execute(res.File, filename)
			if err != nil {
				return err
			}
		}
	}

	return stream.SendAndClose(&pb.UploadFileResponse{
		Url: *url,
	})
}
