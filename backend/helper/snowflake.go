package helper

func GenerateSnowflake() (*string, error) {
	generatedID := snowflakeNode.Generate()
	result := generatedID.String()

	return &result, nil
}
