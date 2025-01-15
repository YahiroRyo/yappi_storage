package validate

import (
	"fmt"
)

func Max(value int, max int, name string) error {
	if value <= max {
		return nil
	}

	return ValidationError{
		Code:    400,
		Message: fmt.Sprintf("%sは%d以下でなければなりません。", name, max),
	}
}
