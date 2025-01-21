package validate

import (
	"fmt"
	"reflect"

	"github.com/bwmarrin/snowflake"
)

func Id(value string, name string) error {
	fmt.Println(reflect.TypeOf(value))
	if _, err := snowflake.ParseString(value); err != nil {
		println(err.Error())
		return ValidationError{
			Code:    400,
			Message: fmt.Sprintf("%sは正常なIDではありません。", name),
		}
	}

	return nil
}
