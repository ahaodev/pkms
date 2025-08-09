package controller

import (
	"fmt"
	"net/http"

	"golang.org/x/crypto/bcrypt"

	"github.com/gin-gonic/gin"
	"pkms/bootstrap"
	"pkms/domain"
	"pkms/internal"
)

type LoginController struct {
	LoginUsecase    domain.LoginUsecase
	Env             *bootstrap.Env
	SecurityManager *internal.LoginSecurityManager
}

// Login godoc
// @Summary      User login
// @Description  Authenticate user and return JWT tokens with brute force protection
// @Tags         Authentication
// @Accept       json
// @Produce      json
// @Param        request  body      domain.LoginRequest  true  "Login credentials"
// @Success      200  {object}  domain.Response{data=domain.LoginResponse}  "Login successful"
// @Failure      400  {object}  domain.Response  "Invalid request format"
// @Failure      401  {object}  domain.Response  "Invalid credentials"
// @Failure      423  {object}  domain.Response  "Account temporarily locked due to too many failed attempts"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /login [post]
func (lc *LoginController) Login(c *gin.Context) {
	var request domain.LoginRequest

	err := c.ShouldBind(&request)
	if err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError("Invalid request format"))
		return
	}

	// 检查SecurityManager是否初始化
	if lc.SecurityManager == nil {
		fmt.Println("SecurityManager is nil!")
		c.JSON(http.StatusInternalServerError, domain.RespError("Security manager not initialized"))
		return
	}

	// 检查账号是否被锁定
	fmt.Printf("Checking if user %s is locked...\n", request.UserName)
	if lc.SecurityManager.IsLocked(request.UserName) {
		remainingTime := lc.SecurityManager.GetRemainingLockTime(request.UserName)
		lockMessage := fmt.Sprintf("账户已被锁定，请在 %d 秒后重试", int(remainingTime.Seconds()))
		fmt.Printf("User %s is locked for %d seconds\n", request.UserName, int(remainingTime.Seconds()))
		c.JSON(http.StatusLocked, domain.RespError(lockMessage))
		return
	}

	user, err := lc.LoginUsecase.GetUserByUserName(c, request.UserName)
	if err != nil {
		// 记录失败尝试（用户不存在也算失败尝试）
		fmt.Printf("User %s not found, recording failed attempt\n", request.UserName)
		lc.SecurityManager.RecordFailedAttempt(request.UserName)
		c.JSON(http.StatusUnauthorized, domain.RespError("用户名或密码错误"))
		return
	}

	// 验证密码
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(request.Password))
	if err != nil {
		// 记录失败尝试
		fmt.Printf("Password incorrect for user %s, recording failed attempt\n", request.UserName)
		lc.SecurityManager.RecordFailedAttempt(request.UserName)

		// 检查是否刚被锁定
		fmt.Printf("Checking if user %s is now locked after failed attempt\n", request.UserName)
		if lc.SecurityManager.IsLocked(request.UserName) {
			remainingTime := lc.SecurityManager.GetRemainingLockTime(request.UserName)
			lockMessage := fmt.Sprintf("密码错误次数过多，账户已被锁定 %d 秒", int(remainingTime.Seconds()))
			fmt.Printf("User %s is now locked for %d seconds\n", request.UserName, int(remainingTime.Seconds()))
			c.JSON(http.StatusLocked, domain.RespError(lockMessage))
			return
		}

		// 显示剩余尝试次数
		failedAttempts := lc.SecurityManager.GetFailedAttempts(request.UserName)
		remainingAttempts := lc.SecurityManager.MaxFailures - failedAttempts
		fmt.Printf("User %s has %d failed attempts, %d remaining\n", request.UserName, failedAttempts, remainingAttempts)
		if remainingAttempts > 0 {
			errorMessage := fmt.Sprintf("用户名或密码错误，还可尝试 %d 次", remainingAttempts)
			c.JSON(http.StatusUnauthorized, domain.RespError(errorMessage))
		} else {
			c.JSON(http.StatusUnauthorized, domain.RespError("用户名或密码错误"))
		}
		return
	}

	// 登录成功，清除失败记录
	lc.SecurityManager.RecordSuccessfulLogin(request.UserName)

	accessToken, err := lc.LoginUsecase.CreateAccessToken(&user, lc.Env.AccessTokenSecret, lc.Env.AccessTokenExpiryHour)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	refreshToken, err := lc.LoginUsecase.CreateRefreshToken(&user, lc.Env.RefreshTokenSecret, lc.Env.RefreshTokenExpiryHour)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	loginResponse := domain.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}

	c.JSON(http.StatusOK, domain.RespSuccess(loginResponse))
}
