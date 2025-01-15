package validate

import (
	"regexp"
)

func Email(value string, name string) error {
	re := regexp.MustCompile(`^[a-zA-Z0-9._%+-]{2,}@[a-zA-Z0-9.-]{2,}\.[a-zA-Z]{2,}$`)

	if isMatched := re.MatchString(value); !isMatched {
		return ValidationError{
			Code:    400,
			Message: "正常なメールアドレスではありません。",
		}
	}

	return nil
}
