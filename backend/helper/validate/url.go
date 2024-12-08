package validate

import (
	"fmt"
	"regexp"
)

func Url(value string, name string) error {
	re := regexp.MustCompile(`^https?://(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:/[^\s]*)?$`)

	if isMatched := re.MatchString(value); !isMatched {
		return ValidationError{
			Code:    401,
			Message: fmt.Sprintf("%sはURLではありません。", name),
		}
	}

	return nil
}