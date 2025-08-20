package controller

import (
	"net/http"
	"strconv"

	"pkms/bootstrap"
	"pkms/domain"
	"pkms/internal/constants"

	"github.com/gin-gonic/gin"
)

// UpgradeController 升级相关接口
type UpgradeController struct {
	UpgradeUsecase domain.UpgradeUsecase
	Env            *bootstrap.Env
}

// CreateUpgradeTarget 创建升级目标
// @Summary      Create upgrade target
// @Description  Create a new upgrade target
// @Tags         Upgrades
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        data  body     domain.CreateUpgradeTargetRequest  true  "Upgrade target information"
// @Success      201   {object} domain.Response  "Successfully created upgrade target"
// @Failure      400   {object} domain.Response  "Bad request - invalid parameters"
// @Failure      500   {object} domain.Response  "Internal server error"
// @Router       /upgrade/target [post]
func (uc *UpgradeController) CreateUpgradeTarget(c *gin.Context) {
	userID := c.GetString(constants.UserID)
	tenantID := c.GetHeader(constants.TenantID)

	var request domain.CreateUpgradeTargetRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	target, err := uc.UpgradeUsecase.CreateUpgradeTarget(c, &request, userID, tenantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusCreated, domain.RespSuccess(target))
}

// GetUpgradeTargets 获取升级目标列表
// @Summary      Get upgrade targets
// @Description  Get all upgrade targets with optional filtering and pagination
// @Tags         Upgrades
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        project_id  query  string  false  "Project ID"
// @Param        package_id  query  string  false  "Package ID"
// @Param        is_active   query  bool    false  "Is active"
// @Param        page        query  int     false  "Page number (default: 1)"
// @Param        page_size    query  int     false  "Page size (default: 20)"
// @Success      200         {object} domain.Response  "Successfully retrieved upgrade targets"
// @Failure      500         {object} domain.Response      "Internal server error"
// @Router       /upgrade/targets [get]
func (uc *UpgradeController) GetUpgradeTargets(c *gin.Context) {
	tenantID := c.GetHeader(constants.TenantID)

	// 解析分页参数
	var params domain.QueryParams
	if p := c.Query("page"); p != "" {
		if v, err := strconv.Atoi(p); err == nil {
			params.Page = v
		}
	}
	if ps := c.Query("page_size"); ps != "" {
		if v, err := strconv.Atoi(ps); err == nil {
			params.PageSize = v
		}
	}

	// 验证和设置默认参数
	domain.ValidateQueryParams(&params)

	// 构建过滤条件
	filters := make(map[string]interface{})
	if projectID := c.Query("project_id"); projectID != "" {
		filters["project_id"] = projectID
	}
	if packageID := c.Query("package_id"); packageID != "" {
		filters["package_id"] = packageID
	}
	if isActiveStr := c.Query("is_active"); isActiveStr != "" {
		if isActive, err := strconv.ParseBool(isActiveStr); err == nil {
			filters["is_active"] = isActive
		}
	}

	// 使用分页查询
	result, err := uc.UpgradeUsecase.GetUpgradeTargetsPaged(c, tenantID, filters, params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(result))
}

// GetUpgradeTarget 获取特定升级目标
// @Summary      Get specific upgrade target
// @Description  Get a specific upgrade target by ID
// @Tags         Upgrades
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path     string  true  "Upgrade target ID"
// @Success      200  {object} domain.Response  "Successfully retrieved upgrade target"
// @Failure      404  {object} domain.Response  "Upgrade target not found"
// @Router       /upgrade/target/{id} [get]
func (uc *UpgradeController) GetUpgradeTarget(c *gin.Context) {
	id := c.Param("id")

	target, err := uc.UpgradeUsecase.GetUpgradeTargetByID(c, id)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.RespError("升级目标不存在"))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(target))
}

// UpdateUpgradeTarget 更新升级目标
// @Summary      Update upgrade target
// @Description  Update a specific upgrade target by ID
// @Tags         Upgrades
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id    path     string                              true  "Upgrade target ID"
// @Param        data  body     domain.UpdateUpgradeTargetRequest  true  "Upgrade target information"
// @Success      200   {object} domain.Response                    "Successfully updated upgrade target"
// @Failure      400   {object} domain.Response                    "Bad request - invalid parameters"
// @Failure      500   {object} domain.Response                    "Internal server error"
// @Router       /upgrade/target/{id} [put]
func (uc *UpgradeController) UpdateUpgradeTarget(c *gin.Context) {
	id := c.Param("id")

	var request domain.UpdateUpgradeTargetRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	if err := uc.UpgradeUsecase.UpdateUpgradeTarget(c, id, &request); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("升级目标更新成功"))
}

// DeleteUpgradeTarget 删除升级目标
// @Summary      Delete upgrade target
// @Description  Delete a specific upgrade target by ID
// @Tags         Upgrades
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path     string  true  "Upgrade target ID"
// @Success      200  {object} domain.Response  "Successfully deleted upgrade target"
// @Failure      500  {object} domain.Response  "Internal server error"
// @Router       /upgrade/target/{id} [delete]
func (uc *UpgradeController) DeleteUpgradeTarget(c *gin.Context) {
	id := c.Param("id")

	if err := uc.UpgradeUsecase.DeleteUpgradeTarget(c, id); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("升级目标删除成功"))
}

// GetProjectUpgradeTargets 获取项目的所有升级目标
// @Summary      Get project upgrade targets
// @Description  Get all upgrade targets for a specific project
// @Tags         Upgrades
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        projectId  path     string  true  "Project ID"
// @Success      200        {object} domain.Response  "Successfully retrieved project upgrade targets"
// @Failure      500        {object} domain.Response  "Internal server error"
// @Router       /upgrade/project/{projectId}/targets [get]
func (uc *UpgradeController) GetProjectUpgradeTargets(c *gin.Context) {
	projectID := c.Param("projectId")

	targets, err := uc.UpgradeUsecase.GetProjectUpgradeTargets(c, projectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(targets))
}
