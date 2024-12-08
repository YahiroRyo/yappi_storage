package validate

import (
	"fmt"
)

func Max(value int, max int, name string) error {
	if value <= max {
		return ValidationError{
			Code:    401,
			Message: fmt.Sprintf("%sは%d以下でなければなりません。", name, max),
		}
	}

	return nil
}
