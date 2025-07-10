export interface ApiResponse<T> {
    code: number;    // 响应码，例如 0 表示成功
    msg: string;     // 响应消息，例如 "ok"
    data: T;         // 泛型数据，可以是任意类型
}

export const HTTP_OK: number = 200
export const SUCCESS: number = 0; // 成功的状态码
export const ERROR: number = 1;   // 通用错误状态码
export const NOT_FOUND: number = 404;
export const UNAUTHORIZED: number = 401;