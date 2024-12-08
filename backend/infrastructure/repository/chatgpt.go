package repository

import (
	"context"
	"errors"
	"os"

	"github.com/YahiroRyo/yappi_storage/backend/domain/vector"

	openai "github.com/sashabaranov/go-openai"
)

type ChatGPTRepositoryInterface interface {
	GetEmbedding(contents string) (*vector.Vector, error)
}

type ChatGPTRepository struct {
}

func (chatGPTRepo *ChatGPTRepository) GetEmbedding(contents string) (*vector.Vector, error) {
	client := chatGPTRepo.getClient()

	queryReq := openai.EmbeddingRequest{
		Input: []string{contents},
		Model: "text-embedding-3-small",
	}

	res, err := client.CreateEmbeddings(context.Background(), queryReq)

	if err != nil {
		return nil, errors.Join(FieldFetchAPIError{Code: 500, Message: "エラーが発生しました。"}, err)
	}

	var vector vector.Vector
	copy(vector[:], res.Data[0].Embedding)

	return &vector, nil
}

func (chatGPTRepo *ChatGPTRepository) getClient() *openai.Client {
	return openai.NewClient(os.Getenv("OPENAI_TOKEN"))
}
