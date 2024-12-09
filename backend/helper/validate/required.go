package validate

import (
	"errors"
	"fmt"
	"reflect"
)

func Required(value reflect.Value, name string) error {
	switch value.Kind() {
	case reflect.Ptr, reflect.Interface, reflect.Slice, reflect.Map, reflect.Chan:
		if value.IsNil() {
			return ValidationError{
				Code:    401,
				Message: fmt.Sprintf("%sは必須項目です。", name),
			}
		}
	case reflect.String:
		if value.String() == "" {
			return ValidationError{
				Code:    401,
				Message: fmt.Sprintf("%sは必須項目です。", name),
			}
		}
	default:
		return errors.New("unsupported type for Required validation")
	}

	return nil
}
