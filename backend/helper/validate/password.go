package validate

import (
	"fmt"
	"regexp"
)

func Password(value string, name string) error {
	allowedChars := regexp.MustCompile(`^[a-zA-Z0-9.\*%!\-]{8,}$`)

	hasLower := regexp.MustCompile(`[a-z]`)
	hasUpper := regexp.MustCompile(`[A-Z]`)
	hasDigit := regexp.MustCompile(`[0-9]`)
	hasSymbol := regexp.MustCompile(`[.\*%!\-]`)

	if allowedChars.MatchString(value) &&
		hasLower.MatchString(value) &&
		hasUpper.MatchString(value) &&
		hasDigit.MatchString(value) &&
		hasSymbol.MatchString(value) {
		return nil
	}

	return ValidationError{
		Code:    400,
		Message: fmt.Sprintf("%sには8文字以上で英字の小文字と大文字、数字、記号(._*-%%!)を含めてください。", name),
	}
}
