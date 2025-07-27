package controller

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"pkms/bootstrap"
	"pkms/domain"
	"time"
)

// ClientAccessController 管理通过access token 接入该系统的凭证管理
type ClientAccessController struct {
	ClientAccessUsecase domain.ClientAccessUsecase
	UpgradeUsecase      domain.UpgradeUsecase
	Env                 *bootstrap.Env
}

// CheckUpdate 检查更新（客户端调用，无需JWT认证，使用access_token）
func (cac *ClientAccessController) CheckUpdate(c *gin.Context) {
	clientIP := c.ClientIP()

	var request domain.CheckUpdateRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	// 验证 access_token
	clientAccess, err := cac.ClientAccessUsecase.ValidateAccessToken(c, request.AccessToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, domain.RespError("无效的访问令牌"))
		return
	}

	// 检查凭证是否激活
	if !clientAccess.IsActive {
		c.JSON(http.StatusForbidden, domain.RespError("客户端接入凭证已被禁用"))
		return
	}

	// 检查是否过期
	if clientAccess.ExpiresAt != nil && clientAccess.ExpiresAt.Before(time.Now()) {
		c.JSON(http.StatusForbidden, domain.RespError("客户端接入凭证已过期"))
		return
	}

	// 调用升级检查业务逻辑
	response, err := cac.UpgradeUsecase.CheckUpdateByToken(c, &request, clientIP)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}
