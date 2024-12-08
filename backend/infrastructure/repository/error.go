package repository

type NotFoundError struct {
	Code    int
	Message string
}

func (e NotFoundError) Error() string {
	return e.Message
}

type FieldSQLError struct {
	Code    int
	Message string
}

func (e FieldSQLError) Error() string {
	return e.Message
}

type FieldFetchAPIError struct {
	Code    int
	Message string
}

func (e FieldFetchAPIError) Error() string {
	return e.Message
}
