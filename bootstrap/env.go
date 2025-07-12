package bootstrap

import (
	"github.com/spf13/viper"
	"log"
	"os"
	"pkms/pkg"
)

type Env struct {
	AppEnv         string `mapstructure:"APP_ENV"`
	ContextTimeout int    `mapstructure:"CONTEXT_TIMEOUT"`
	DBPath         string `mapstructure:"DB_PATH"`
	// 令牌配置
	AccessTokenExpiryHour  int    `mapstructure:"ACCESS_TOKEN_EXPIRY_HOUR"`
	RefreshTokenExpiryHour int    `mapstructure:"REFRESH_TOKEN_EXPIRY_HOUR"`
	AccessTokenSecret      string `mapstructure:"ACCESS_TOKEN_SECRET"`
	RefreshTokenSecret     string `mapstructure:"REFRESH_TOKEN_SECRET"`

	// 管理员配置
	AdminUsername string `mapstructure:"ADMIN_USERNAME"`
	AdminPassword string `mapstructure:"ADMIN_PASSWORD"`
	// S3 配置
	S3Address   string `mapstructure:"S3_ADDRESS"`
	S3AccessKey string `mapstructure:"S3_ACCESS_KEY"`
	S3SecretKey string `mapstructure:"S3_SECRET_KEY"`
	S3Bucket    string `mapstructure:"S3_BUCKET"`
	S3Token     string `mapstructure:"S3_TOKEN"`
}

func setDefaults() {
	viper.SetDefault("APP_ENV", "development")
	viper.SetDefault("CONTEXT_TIMEOUT", 30)
	viper.SetDefault("DB_PATH", "./data.db")

	viper.SetDefault("ACCESS_TOKEN_EXPIRY_HOUR", 3)
	viper.SetDefault("REFRESH_TOKEN_EXPIRY_HOUR", 24) // 7 days
	viper.SetDefault("ACCESS_TOKEN_SECRET", "default-access-secret")
	viper.SetDefault("REFRESH_TOKEN_SECRET", "default-refresh-secret")

	// 管理员默认配置
	viper.SetDefault("ADMIN_USERNAME", "admin")
	viper.SetDefault("ADMIN_PASSWORD", "admin")

	// S3 默认配置
	viper.SetDefault("S3_ADDRESS", "192.168.8.6:9000")
	viper.SetDefault("S3_ACCESS_KEY", "IjJm2N3ZZTYjt8C9WkJf")
	viper.SetDefault("S3_SECRET_KEY", "eIuV0i4ChbLqx54g9rhsZDRTC2LE1xEcnIAnAw1C")
	viper.SetDefault("S3_BUCKET", "pkms")
	viper.SetDefault("S3_TOKEN", "")
}

func NewEnv() *Env {
	env := Env{}

	// 设置默认值
	setDefaults()

	// 从环境变量读取配置
	viper.AutomaticEnv()

	if _, err := os.Stat(".env"); err == nil {
		viper.SetConfigFile(".env")
		err := viper.ReadInConfig()
		if err != nil {
			pkg.Log.Error(err.Error())
		}
	} else {
		pkg.Log.Println("没有找到 .env 文件，使用默认配置")
	}

	// 无论是否有 .env 文件，都需要 Unmarshal 来应用配置
	err := viper.Unmarshal(&env)
	if err != nil {
		pkg.Log.Error(err.Error())
	}

	if env.AppEnv == "development" {
		log.Println("The App is running in development env")
	}

	return &env
}
