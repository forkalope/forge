package httpapi

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/forkalope/forge/internal/fabric"
	"github.com/forkalope/forge/internal/storage"
)

type Server struct {
	blobs      *storage.LocalBlobStore
	fabric     *fabric.Registry
	staticRoot string
}

func NewServer(blobs *storage.LocalBlobStore, registry *fabric.Registry, staticRoot string) *Server {
	return &Server{blobs: blobs, fabric: registry, staticRoot: staticRoot}
}

func (s *Server) Handler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", s.healthz)
	mux.HandleFunc("GET /api/v1/health", s.apiHealth)
	mux.HandleFunc("GET /api/v1/meta", s.meta)
	mux.HandleFunc("GET /api/v1/fabric/nodes", s.fabricNodes)
	mux.HandleFunc("GET /api/v1/fabric/gossip", s.fabricNodes)
	mux.HandleFunc("GET /", s.frontend)
	return withHeaders(withLogging(mux))
}

func (s *Server) fabricNodes(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, s.fabric.Snapshot())
}

func (s *Server) healthz(w http.ResponseWriter, _ *http.Request) {
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) apiHealth(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"status":      "ok",
		"storage":     "local",
		"blob_store":  "ready",
		"blob_root":   s.blobs.Root(),
		"replication": "planned",
	})
}

func (s *Server) meta(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"name":         "Forkalope",
		"version":      "0.1.0-dev",
		"architecture": "go-monolith",
		"frontend":     "react-typescript",
		"vcs":          "git",
	})
}

func (s *Server) frontend(w http.ResponseWriter, r *http.Request) {
	if !isFrontendAvailable(s.staticRoot) {
		writeJSON(w, http.StatusNotFound, map[string]string{
			"error": "frontend is not built; run `cd web && npm install && npm run build`",
		})
		return
	}

	requested := filepath.Clean(strings.TrimPrefix(r.URL.Path, "/"))
	if requested == "." || requested == "" {
		requested = "index.html"
	}
	file := filepath.Join(s.staticRoot, requested)
	if info, err := os.Stat(file); err != nil || info.IsDir() {
		file = filepath.Join(s.staticRoot, "index.html")
	}
	http.ServeFile(w, r, file)
}

func isFrontendAvailable(root string) bool {
	info, err := os.Stat(filepath.Join(root, "index.html"))
	return err == nil && !info.IsDir()
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func withHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		next.ServeHTTP(w, r)
	})
}

func withLogging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Printf("%s %s\n", r.Method, r.URL.Path)
		next.ServeHTTP(w, r)
	})
}
