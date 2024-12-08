package validate

import (
	"fmt"
	"reflect"
)

func Required(value reflect.Value, name string) error {
	if value.IsNil() {
		return ValidationError{
			Code:    401,
			Message: fmt.Sprintf("%sは必須項目です。", name),
		}
	}

	return nil
}
