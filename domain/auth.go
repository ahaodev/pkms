package domain

import (
	"context"
)

// LoginRequest 登录请求
type LoginRequest struct {
	UserName string `form:"username" binding:"required"`
	Password string `form:"password" binding:"required"`
}

// LoginResponse 登录响应
type LoginResponse struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
}

// RefreshTokenRequest 刷新令牌请求
type RefreshTokenRequest struct {
	RefreshToken string `form:"refreshToken" binding:"required"`
}

// RefreshTokenResponse 刷新令牌响应
type RefreshTokenResponse struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
}

// ProfileUpdate 个人资料更新请求
type ProfileUpdate struct {
	Name   string `json:"name"`
	Avatar string `json:"avatar"`
}

// PasswordUpdate 密码更新请求
type PasswordUpdate struct {
	CurrentPassword string `json:"current_password"`
	NewPassword     string `json:"new_password"`
}

type LoginUsecase interface {
	GetUserByUserName(c context.Context, name string) (*User, error)
}
