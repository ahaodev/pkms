package bootstrap

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/amitshekhariitbhu/go-backend-clean-architecture/ent"
	_ "github.com/mattn/go-sqlite3"
)

func NewEntDatabase(env *Env) *ent.Client {
	dbPath := env.DBPath
	if dbPath == "" {
		dbPath = "./database.db"
	}

	// Ensure the directory exists
	dir := filepath.Dir(dbPath)
	if dir != "" && dir != "." {
		if err := os.MkdirAll(dir, 0755); err != nil {
			log.Fatalf("Failed to create DB directory %s: %v", dir, err)
		}
		log.Printf("✅ Database directory ensured: %s", dir)
	}

	// Enable SQLite foreign keys via connection string
	dsn := fmt.Sprintf("file:%s?_fk=1", dbPath)
	client, err := ent.Open("sqlite3", dsn)
	if err != nil {
		log.Fatal("❌ Failed to connect to database:", err)
	}

	// Auto migrate schema
	ctx := context.Background()
	if err := client.Schema.Create(ctx); err != nil {
		log.Fatal("❌ Failed to create schema resources:", err)
	}

	log.Println("✅ Connected to SQLite database successfully with Ent")
	return client
}

func CloseEntConnection(client *ent.Client) {
	if client == nil {
		return
	}

	err := client.Close()
	if err != nil {
		log.Fatal("Failed to close database connection:", err)
	}

	log.Println("Database connection closed.")
}
