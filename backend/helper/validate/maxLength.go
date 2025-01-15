package validate

import (
	"fmt"
)

func MaxLength(value string, max int, name string) error {
	if len(value) <= max {
		return ValidationError{
			Code:    400,
			Message: fmt.Sprintf("%sは%d文字以下でなければなりません。", name, max),
		}
	}

	return nil
}
