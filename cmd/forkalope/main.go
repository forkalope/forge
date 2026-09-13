package main

import (
	"flag"
	"log/slog"
	"net/http"
	"os"

	"github.com/forkalope/forge/internal/httpapi"
	"github.com/forkalope/forge/internal/storage"
)

func main() {
	addr := flag.String("addr", ":8080", "HTTP listen address")
	dataDir := flag.String("data-dir", ".forkalope", "directory for node data")
	flag.Parse()

	blobStore, err := storage.NewLocalBlobStore(*dataDir)
	if err != nil {
		slog.Error("initialize storage", "error", err)
		os.Exit(1)
	}

	server := httpapi.NewServer(blobStore, "web/dist")
	slog.Info("starting Forkalope", "addr", *addr, "data_dir", *dataDir)
	if err := http.ListenAndServe(*addr, server.Handler()); err != nil {
		slog.Error("server stopped", "error", err)
		os.Exit(1)
	}
}
