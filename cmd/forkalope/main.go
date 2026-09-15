package main

import (
	"context"
	"flag"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"

	"github.com/forkalope/forge/internal/fabric"
	"github.com/forkalope/forge/internal/httpapi"
	"github.com/forkalope/forge/internal/storage"
)

func main() {
	addr := flag.String("addr", ":8080", "HTTP listen address")
	dataDir := flag.String("data-dir", ".forkalope", "directory for node data")
	nodeID := flag.String("node-id", hostname(), "stable identity for this node")
	nodeName := flag.String("node-name", "", "display name for this node (defaults to node ID)")
	clusterID := flag.String("cluster-id", "local", "fabric cluster identity")
	role := flag.String("role", "forge", "node role")
	region := flag.String("region", "local", "node region or failure domain")
	advertiseURL := flag.String("advertise-url", "http://localhost:8080", "API URL other fabric nodes can reach")
	fabricAddresses := flag.String("fabric-addresses", "", "comma-separated private fabric addresses")
	peerURLs := flag.String("peers", "", "comma-separated bootstrap peer API URLs")
	flag.Parse()

	blobStore, err := storage.NewLocalBlobStore(*dataDir)
	if err != nil {
		slog.Error("initialize storage", "error", err)
		os.Exit(1)
	}

	registry, err := fabric.NewRegistry(fabric.Config{
		ClusterID: *clusterID,
		Self: fabric.Node{
			ID:              *nodeID,
			Name:            *nodeName,
			Role:            *role,
			Region:          *region,
			Version:         "0.1.0-dev",
			APIAddress:      *advertiseURL,
			FabricAddresses: splitList(*fabricAddresses),
		},
		Peers: splitList(*peerURLs),
	})
	if err != nil {
		slog.Error("initialize fabric", "error", err)
		os.Exit(1)
	}
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	go registry.Run(ctx)

	server := httpapi.NewServer(blobStore, registry, "web/dist")
	slog.Info("starting Forkalope", "addr", *addr, "data_dir", *dataDir, "node_id", *nodeID, "cluster_id", *clusterID)
	if err := http.ListenAndServe(*addr, server.Handler()); err != nil {
		slog.Error("server stopped", "error", err)
		os.Exit(1)
	}
}

func hostname() string {
	value, err := os.Hostname()
	if err != nil || strings.TrimSpace(value) == "" {
		return "forkalope-node"
	}
	return value
}

func splitList(value string) []string {
	parts := strings.Split(value, ",")
	result := make([]string, 0, len(parts))
	for _, part := range parts {
		if part = strings.TrimSpace(part); part != "" {
			result = append(result, part)
		}
	}
	return result
}
