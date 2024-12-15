package middleware

type NotLoggedInError struct {
	Code    int
	Message string
}

func (e NotLoggedInError) Error() string {
	return e.Message
}
