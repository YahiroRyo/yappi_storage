package validate

import (
	"errors"
	"reflect"
	"slices"
	"strconv"
	"strings"
)

type ValidationError struct {
	Code    int
	Message string
}

func (e ValidationError) Error() string {
	return e.Message
}

func Validate(s interface{}) error {
	var result error

	val := reflect.ValueOf(s).Elem()

	for i := 0; i < val.NumField(); i++ {
		valueField := val.Field(i)
		typeField := val.Type().Field(i)

		validate := typeField.Tag.Get("validate")
		validateName := typeField.Tag.Get("validate_name")

		validates := strings.Split(strings.ReplaceAll(validate, " ", ""), ",")

		if err := Required(valueField, validateName); err != nil && !slices.Contains(validates, "required") {
			continue
		}

		for j := 0; j < len(validates); j++ {
			var equaledValue int

			if strings.Contains(validates[j], "=") {
				splitedValidates := strings.Split(validates[j], "=")
				validates[j] = splitedValidates[0]

				val, err := strconv.Atoi(splitedValidates[1])
				if err != nil {
					result = errors.Join(result, errors.New("stringからintへの変換に失敗しました。"))
				}
				equaledValue = val
			}

			switch validates[j] {
			case "required":
				result = errors.Join(result, Required(valueField, validateName))
			case "min_len":
				result = errors.Join(result, MinLength(valueField.String(), equaledValue, validateName))
			case "max_len":
				result = errors.Join(result, MaxLength(valueField.String(), equaledValue, validateName))
			case "min":
				result = errors.Join(result, Min(int(valueField.Int()), equaledValue, validateName))
			case "max":
				result = errors.Join(result, Max(int(valueField.Int()), equaledValue, validateName))
			case "id":
				result = errors.Join(result, Id(valueField.String(), validateName))
			case "email":
				result = errors.Join(result, Email(valueField.String(), validateName))
			case "password":
				result = errors.Join(result, Password(valueField.String(), validateName))
			case "url":
				result = errors.Join(result, Url(valueField.String(), validateName))
			default:
			}
		}
	}

	return result
}
