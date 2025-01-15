package validate

import (
	"fmt"
)

func MinLength(value string, min int, name string) error {
	if len(value) < min {
		return ValidationError{
			Code:    400,
			Message: fmt.Sprintf("%sは%d文字以上でなければなりません。", name, min),
		}
	}

	return nil
}
