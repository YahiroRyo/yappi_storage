package request

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email" validate_name:"メールアドレス"`
	Password string `json:"password" validate:"required,password" validate_name:"パスワード"`
}

type RegistrationRequest struct {
	Email    string `json:"email" validate:"required,email" validate_name:"メールアドレス"`
	Password string `json:"password" validate:"required,password" validate_name:"パスワード"`
	Icon     string `json:"icon" validate:"required,url" validate_name:"アイコン"`
}
