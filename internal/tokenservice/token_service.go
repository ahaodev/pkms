package tokenservice

import (
	"pkms/domain"
	"pkms/internal/tokenutil"
)

// TokenService 认证令牌服务
type TokenService struct{}

// NewTokenService 创建新的令牌服务实例
func NewTokenService() *TokenService {
	return &TokenService{}
}

// CreateAccessToken 创建访问令牌
func (ts *TokenService) CreateAccessToken(user *domain.User, secret string, expiry int) (string, error) {
	return tokenutil.CreateAccessToken(user, secret, expiry)
}

// CreateRefreshToken 创建刷新令牌
func (ts *TokenService) CreateRefreshToken(user *domain.User, secret string, expiry int) (string, error) {
	return tokenutil.CreateRefreshToken(user, secret, expiry)
}

// ExtractIDFromToken 从令牌中提取用户ID
func (ts *TokenService) ExtractIDFromToken(requestToken string, secret string) (string, error) {
	return tokenutil.ExtractIDFromToken(requestToken, secret)
}
