package domain

const (
	SuccessCode = 0
	FailCode    = 1
	NotFondCode = 404
)

type Response struct {
	Code int         `json:"code"`
	Msg  string      `json:"msg"`
	Data interface{} `json:"data,omitempty"`
}

func RespError(msg interface{}) Response {
	var errMsg string
	switch v := msg.(type) {
	case string:
		errMsg = v // 如果是 string，直接赋值
	case error:
		errMsg = v.Error() // 如果是 error 类型，调用其 Error() 方法
	default:
		errMsg = "Unknown error" // 如果是其他类型，返回默认错误信息
	}
	return Response{Code: FailCode, Msg: errMsg, Data: nil}
}

func RespSuccess(data interface{}) Response {
	return Response{Code: SuccessCode, Msg: "OK", Data: data}
}

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
	if params.PageSize > 1000 {
		params.PageSize = 1000
	}
}
