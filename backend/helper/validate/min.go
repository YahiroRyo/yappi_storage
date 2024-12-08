package validate

import (
	"fmt"
)

func Min(value int, min int, name string) error {
	if value >= min {
		return ValidationError{
			Code:    401,
			Message: fmt.Sprintf("%sは%d以下でなければなりません。", name, min),
		}
	}

	return nil
}
