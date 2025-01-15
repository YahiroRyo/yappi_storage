package validate

import (
	"fmt"
	"reflect"
)

func Required(value reflect.Value, name string) error {
	var validValue = value
	for {
		if validValue.Kind() != reflect.Ptr {
			break
		}
		validValue = value.Elem()
	}
	switch validValue.Kind() {
	case reflect.Ptr, reflect.Interface, reflect.Slice, reflect.Map, reflect.Chan:
		if validValue.IsNil() {
			return ValidationError{
				Code:    400,
				Message: fmt.Sprintf("%sは必須項目です。", name),
			}
		}
	case reflect.String:
		if validValue.String() == "" {
			return ValidationError{
				Code:    400,
				Message: fmt.Sprintf("%sは必須項目です。", name),
			}
		}
	case reflect.Int:
		return nil
	default:
		return fmt.Errorf("unsupported type for Required validation: %s", validValue.Kind().String())
	}

	return nil
}
