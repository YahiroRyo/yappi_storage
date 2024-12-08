package helper

import (
	"github.com/bwmarrin/snowflake"
)

func GenerateSnowflake() (*string, error) {
	node, err := snowflake.NewNode(1)
	if err != nil {
		return nil, err
	}

	generatedID := node.Generate()
	result := generatedID.String()

	return &result, nil
}
