package controller

import (
	"net/http"
	"pkms/bootstrap"
	"pkms/domain"
	"pkms/internal/constants"
	"strconv"

	"github.com/gin-gonic/gin"
)

// AccessManagerController 管理通过access token 接入该系统的凭证管理
type AccessManagerController struct {
	ClientAccessUsecase domain.ClientAccessUsecase
	UpgradeUsecase      domain.UpgradeUsecase
	Env                 *bootstrap.Env
}

// CreateClientAccess godoc
// @Summary      Create client access credentials
// @Description  Create new client access credentials for API access (admin only)
// @Tags         Access Manager
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        x-tenant-id  header    string                          true  "Tenant ID"
// @Param        request      body      domain.CreateClientAccessRequest true  "Client access request"
// @Success      201  {object}  domain.Response{data=domain.ClientAccess}  "Client access created successfully"
// @Failure      400  {object}  domain.Response  "Invalid request data"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /access-manager [post]
func (cac *AccessManagerController) CreateClientAccess(c *gin.Context) {
	userID := c.GetString(constants.UserID)
	tenantID := c.GetHeader(constants.TenantID)

	var request domain.CreateClientAccessRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	access, err := cac.ClientAccessUsecase.Create(c, &request, userID, tenantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusCreated, domain.RespSuccess(access))
}

// GetClientAccessList godoc
// @Summary      Get client access credentials list
// @Description  Retrieve list of client access credentials with optional filters (admin only)
// @Tags         Access Manager
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        x-tenant-id  header    string  true   "Tenant ID"
// @Param        project_id   query     string  false  "Filter by project ID"
// @Param        package_id   query     string  false  "Filter by package ID"
// @Param        is_active    query     bool    false  "Filter by active status"
// @Success      200  {object}  domain.Response{data=[]domain.ClientAccess}  "Client access list retrieved successfully"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /access-manager [get]
func (cac *AccessManagerController) GetClientAccessList(c *gin.Context) {
	tenantID := c.GetHeader(constants.TenantID)

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

	accessList, err := cac.ClientAccessUsecase.GetList(c, tenantID, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(accessList))
}

// GetClientAccess godoc
// @Summary      Get specific client access credentials
// @Description  Retrieve specific client access credentials by ID (admin only)
// @Tags         Access Manager
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id  path      string  true  "Client access ID"
// @Success      200  {object}  domain.Response{data=domain.ClientAccess}  "Client access retrieved successfully"
// @Failure      404  {object}  domain.Response  "Client access not found"
// @Router       /access-manager/{id} [get]
func (cac *AccessManagerController) GetClientAccess(c *gin.Context) {
	id := c.Param("id")

	access, err := cac.ClientAccessUsecase.GetByID(c, id)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.RespError("客户端接入凭证不存在"))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(access))
}

// UpdateClientAccess godoc
// @Summary      Update client access credentials
// @Description  Update existing client access credentials (admin only)
// @Tags         Access Manager
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id       path  string                          true  "Client access ID"
// @Param        request  body  domain.UpdateClientAccessRequest true  "Update request"
// @Success      200  {object}  domain.Response  "Client access updated successfully"
// @Failure      400  {object}  domain.Response  "Invalid request data"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /access-manager/{id} [put]
func (cac *AccessManagerController) UpdateClientAccess(c *gin.Context) {
	id := c.Param("id")

	var request domain.UpdateClientAccessRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, domain.RespError(err.Error()))
		return
	}

	if err := cac.ClientAccessUsecase.Update(c, id, &request); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("客户端接入凭证更新成功"))
}

// DeleteClientAccess godoc
// @Summary      Delete client access credentials
// @Description  Delete client access credentials by ID (admin only)
// @Tags         Access Manager
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id  path  string  true  "Client access ID"
// @Success      200  {object}  domain.Response  "Client access deleted successfully"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /access-manager/{id} [delete]
func (cac *AccessManagerController) DeleteClientAccess(c *gin.Context) {
	id := c.Param("id")

	if err := cac.ClientAccessUsecase.Delete(c, id); err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess("客户端接入凭证删除成功"))
}

// RegenerateToken godoc
// @Summary      Regenerate access token
// @Description  Regenerate access token for client access credentials (admin only)
// @Tags         Access Manager
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id  path  string  true  "Client access ID"
// @Success      200  {object}  domain.Response{data=object}  "New access token generated successfully"
// @Failure      500  {object}  domain.Response  "Internal server error"
// @Router       /access-manager/{id}/regenerate-token [post]
func (cac *AccessManagerController) RegenerateToken(c *gin.Context) {
	id := c.Param("id")

	newToken, err := cac.ClientAccessUsecase.RegenerateToken(c, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, domain.RespSuccess(gin.H{
		"access_token": newToken,
	}))
}
