package controller

import (
	"net/http"

	"pkms/bootstrap"
	"pkms/domain"

	"github.com/gin-gonic/gin"
)

type UpgradeController struct {
	UpgradeUsecase domain.UpgradeUsecase
	Env            *bootstrap.Env
}

// CheckUpgrade 检查升级
func (uc *UpgradeController) CheckUpgrade(c *gin.Context) {
	packageID := c.Param("packageId")
	upgradeInfo, err := uc.UpgradeUsecase.CheckUpgrade(c, packageID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess(upgradeInfo))
}

// PerformUpgrade 执行升级
func (uc *UpgradeController) PerformUpgrade(c *gin.Context) {
	packageID := c.Param("packageId")

	// 获取当前用户ID
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, domain.RespError("User not authenticated"))
		return
	}

	if err := uc.UpgradeUsecase.PerformUpgrade(c, packageID, userID.(string)); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	response := map[string]interface{}{
		"package_id": packageID,
		"user_id":    userID,
		"message":    "Upgrade initiated successfully",
	}
	c.JSON(http.StatusOK, domain.RespSuccess(response))
}

// GetUpgradeHistory 获取升级历史
func (uc *UpgradeController) GetUpgradeHistory(c *gin.Context) {
	packageID := c.Param("packageId")
	history, err := uc.UpgradeUsecase.GetUpgradeHistory(c, packageID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess(history))
}

// GetAvailableUpgrades 获取可用升级
func (uc *UpgradeController) GetAvailableUpgrades(c *gin.Context) {
	projectID := c.Param("projectId")
	upgrades, err := uc.UpgradeUsecase.GetAvailableUpgrades(c, projectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}
	c.JSON(http.StatusOK, domain.RespSuccess(upgrades))
}

// GetUpgradeStatus 获取升级状态
func (uc *UpgradeController) GetUpgradeStatus(c *gin.Context) {
	upgradeID := c.Param("upgradeId")

	// 这里需要实现获取升级状态的逻辑
	// 暂时返回模拟数据
	status := map[string]interface{}{
		"upgrade_id": upgradeID,
		"status":     "in_progress",
		"progress":   65,
		"message":    "Upgrading package components...",
	}

	c.JSON(http.StatusOK, domain.RespSuccess(status))
}

// CancelUpgrade 取消升级
func (uc *UpgradeController) CancelUpgrade(c *gin.Context) {
	upgradeID := c.Param("upgradeId")

	// 这里需要实现取消升级的逻辑
	response := map[string]interface{}{
		"upgrade_id": upgradeID,
		"status":     "cancelled",
		"message":    "Upgrade cancelled successfully",
	}

	c.JSON(http.StatusOK, domain.RespSuccess(response))
}
