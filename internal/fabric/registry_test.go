package fabric

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestRegistryLearnsTransitivePeers(t *testing.T) {
	now := time.Now().UTC()
	var secondURL string
	second := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		_ = json.NewEncoder(w).Encode(Snapshot{
			ClusterID: "lab",
			Nodes: []Node{
				{ID: "node-002", Name: "node-002", APIAddress: secondURL, LastSeen: now},
				{ID: "node-003", Name: "node-003", APIAddress: "http://node-003:8080", LastSeen: now},
			},
		})
	}))
	defer second.Close()
	secondURL = second.URL

	registry, err := NewRegistry(Config{
		ClusterID: "lab",
		Self:      Node{ID: "node-001", APIAddress: "http://node-001:8080"},
		Peers:     []string{second.URL},
	})
	if err != nil {
		t.Fatal(err)
	}
	registry.Sync(context.Background())

	snapshot := registry.Snapshot()
	if len(snapshot.Nodes) != 3 {
		t.Fatalf("got %d nodes, want 3", len(snapshot.Nodes))
	}
	if snapshot.LocalNodeID != "node-001" {
		t.Fatalf("got local node %q", snapshot.LocalNodeID)
	}
}

func TestRegistryRejectsAnotherCluster(t *testing.T) {
	peer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		_ = json.NewEncoder(w).Encode(Snapshot{
			ClusterID: "other",
			Nodes:     []Node{{ID: "intruder", LastSeen: time.Now().UTC()}},
		})
	}))
	defer peer.Close()

	registry, err := NewRegistry(Config{ClusterID: "lab", Self: Node{ID: "node-001"}, Peers: []string{peer.URL}})
	if err != nil {
		t.Fatal(err)
	}
	registry.Sync(context.Background())
	if got := len(registry.Snapshot().Nodes); got != 1 {
		t.Fatalf("got %d nodes, want only the local node", got)
	}
}

func TestRegistryMarksStaleNodeUnavailable(t *testing.T) {
	old := time.Now().UTC().Add(-time.Minute)
	peer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		_ = json.NewEncoder(w).Encode(Snapshot{
			ClusterID: "lab",
			Nodes:     []Node{{ID: "node-002", Name: "node-002", LastSeen: old}},
		})
	}))
	defer peer.Close()

	registry, err := NewRegistry(Config{
		ClusterID:  "lab",
		Self:       Node{ID: "node-001"},
		Peers:      []string{peer.URL},
		StaleAfter: 10 * time.Second,
	})
	if err != nil {
		t.Fatal(err)
	}
	registry.Sync(context.Background())

	snapshot := registry.Snapshot()
	if len(snapshot.Nodes) != 2 || snapshot.Nodes[1].State != "unavailable" {
		t.Fatalf("got nodes %#v, want stale node unavailable", snapshot.Nodes)
	}
}
