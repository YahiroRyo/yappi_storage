package service

type AlreadyUsedEmailAddressError struct {
	Code    int
	Message string
}

func (e AlreadyUsedEmailAddressError) Error() string {
	return e.Message
}
