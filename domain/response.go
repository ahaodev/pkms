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

type PageResponse struct {
	Code       int         `json:"code"`
	Msg        string      `json:"msg"`
	Data       interface{} `json:"data"`
	Total      int         `json:"total"`
	Page       int         `json:"page"`
	PageSize   int         `json:"pageSize"`
	TotalPages int         `json:"totalPages"`
}

// RespPageSuccess 构造分页成功响应

func RespPageSuccess(data interface{}, total, page, pageSize int) PageResponse {
	totalPages := 0
	if pageSize > 0 {
		totalPages = (total + pageSize - 1) / pageSize
	}
	return PageResponse{
		Code:       SuccessCode,
		Msg:        "OK",
		Data:       data,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}
}
