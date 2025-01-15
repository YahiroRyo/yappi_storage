package validate

import (
	"fmt"
)

func Min(value int, min int, name string) error {
	if value >= min {
		return nil
	}

	return ValidationError{
		Code:    400,
		Message: fmt.Sprintf("%sは%d以上でなければなりません。", name, min),
	}
}
