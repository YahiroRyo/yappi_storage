package validate

import (
	"fmt"

	"github.com/bwmarrin/snowflake"
)

func Id(value string, name string) error {
	if _, err := snowflake.ParseString(value); err != nil {
		return ValidationError{
			Code:    400,
			Message: fmt.Sprintf("%sは正常なIDではありません。", name),
		}
	}

	return nil
}
