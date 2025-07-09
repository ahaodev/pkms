package bootstrap

import "pkms/ent"

type Application struct {
	Env *Env
	DB  *ent.Client
}

func App() Application {
	app := &Application{}
	app.Env = NewEnv()
	app.DB = NewEntDatabase(app.Env)
	return *app
}

func (app *Application) CloseDBConnection() {
	CloseEntConnection(app.DB)
}
