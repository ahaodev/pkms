package domain

// QueryParams 通用查询参数，包含分页信息
type QueryParams struct {
	Page     int `json:"page" form:"page"`
	PageSize int `json:"page_size" form:"page_size"`
}

// PagedResult 通用分页结果
type PagedResult[T any] struct {
	List       []T `json:"list"`
	Total      int `json:"total"`
	Page       int `json:"page"`
	PageSize   int `json:"page_size"`
	TotalPages int `json:"total_pages"`
}

// NewPagedResult 创建分页结果
func NewPagedResult[T any](data []T, total, page, pageSize int) *PagedResult[T] {
	totalPages := (total + pageSize - 1) / pageSize
	return &PagedResult[T]{
		List:       data,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}
}

// ValidateQueryParams 验证和设置默认分页参数
func ValidateQueryParams(params *QueryParams) {
	if params.Page <= 0 {
		params.Page = 1
	}
	if params.PageSize <= 0 {
		params.PageSize = 20
	}
	if params.PageSize > 100 {
		params.PageSize = 100
	}
}
