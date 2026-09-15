package fabric

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"sort"
	"strings"
	"sync"
	"time"
)

const gossipPath = "/api/v1/fabric/gossip"

type Node struct {
	ID              string    `json:"id"`
	Name            string    `json:"name"`
	Role            string    `json:"role"`
	Region          string    `json:"region"`
	Version         string    `json:"version"`
	APIAddress      string    `json:"api_address"`
	FabricAddresses []string  `json:"fabric_addresses"`
	StartedAt       time.Time `json:"started_at"`
	LastSeen        time.Time `json:"last_seen"`
	State           string    `json:"state"`
}

type Snapshot struct {
	ClusterID   string    `json:"cluster_id"`
	LocalNodeID string    `json:"local_node_id"`
	ObservedAt  time.Time `json:"observed_at"`
	Nodes       []Node    `json:"nodes"`
}

type Config struct {
	ClusterID      string
	Self           Node
	Peers          []string
	GossipInterval time.Duration
	StaleAfter     time.Duration
	RequestTimeout time.Duration
}

type Registry struct {
	mu         sync.RWMutex
	clusterID  string
	self       Node
	peers      map[string]struct{}
	nodes      map[string]Node
	interval   time.Duration
	staleAfter time.Duration
	client     *http.Client
}

func NewRegistry(config Config) (*Registry, error) {
	if strings.TrimSpace(config.ClusterID) == "" {
		return nil, errors.New("cluster ID is required")
	}
	if strings.TrimSpace(config.Self.ID) == "" {
		return nil, errors.New("node ID is required")
	}
	if config.GossipInterval <= 0 {
		config.GossipInterval = 2 * time.Second
	}
	if config.StaleAfter <= 0 {
		config.StaleAfter = 15 * time.Second
	}
	if config.RequestTimeout <= 0 {
		config.RequestTimeout = 1200 * time.Millisecond
	}

	now := time.Now().UTC()
	config.Self.Name = firstNonEmpty(config.Self.Name, config.Self.ID)
	config.Self.Role = firstNonEmpty(config.Self.Role, "forge")
	config.Self.Region = firstNonEmpty(config.Self.Region, "local")
	config.Self.StartedAt = now
	config.Self.LastSeen = now
	config.Self.State = "online"

	r := &Registry{
		clusterID:  config.ClusterID,
		self:       config.Self,
		peers:      make(map[string]struct{}),
		nodes:      map[string]Node{config.Self.ID: config.Self},
		interval:   config.GossipInterval,
		staleAfter: config.StaleAfter,
		client:     &http.Client{Timeout: config.RequestTimeout},
	}
	for _, peer := range config.Peers {
		if normalized := normalizePeer(peer); normalized != "" && normalized != normalizePeer(config.Self.APIAddress) {
			r.peers[normalized] = struct{}{}
		}
	}
	return r, nil
}

func (r *Registry) Run(ctx context.Context) {
	r.Sync(ctx)
	ticker := time.NewTicker(r.interval)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			r.Sync(ctx)
		}
	}
}

func (r *Registry) Sync(ctx context.Context) {
	r.mu.RLock()
	peers := make([]string, 0, len(r.peers))
	for peer := range r.peers {
		peers = append(peers, peer)
	}
	r.mu.RUnlock()

	var wg sync.WaitGroup
	for _, peer := range peers {
		peer := peer
		wg.Add(1)
		go func() {
			defer wg.Done()
			r.pull(ctx, peer)
		}()
	}
	wg.Wait()
}

func (r *Registry) Snapshot() Snapshot {
	now := time.Now().UTC()
	r.mu.Lock()
	self := r.self
	self.LastSeen = now
	self.State = "online"
	r.self = self
	r.nodes[self.ID] = self

	nodes := make([]Node, 0, len(r.nodes))
	for _, node := range r.nodes {
		if node.ID == self.ID || now.Sub(node.LastSeen) <= r.staleAfter {
			node.State = "online"
		} else {
			node.State = "unavailable"
		}
		nodes = append(nodes, node)
	}
	r.mu.Unlock()

	sort.Slice(nodes, func(i, j int) bool { return nodes[i].Name < nodes[j].Name })
	return Snapshot{ClusterID: r.clusterID, LocalNodeID: self.ID, ObservedAt: now, Nodes: nodes}
}

func (r *Registry) pull(ctx context.Context, peer string) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, peer+gossipPath, nil)
	if err != nil {
		return
	}
	response, err := r.client.Do(req)
	if err != nil {
		return
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return
	}

	var snapshot Snapshot
	if err := json.NewDecoder(response.Body).Decode(&snapshot); err != nil || snapshot.ClusterID != r.clusterID {
		return
	}

	r.mu.Lock()
	defer r.mu.Unlock()
	for _, candidate := range snapshot.Nodes {
		if candidate.ID == "" || candidate.ID == r.self.ID || candidate.LastSeen.IsZero() {
			continue
		}
		current, exists := r.nodes[candidate.ID]
		if !exists || candidate.LastSeen.After(current.LastSeen) {
			candidate.State = ""
			r.nodes[candidate.ID] = candidate
		}
		if discovered := normalizePeer(candidate.APIAddress); discovered != "" && discovered != normalizePeer(r.self.APIAddress) {
			r.peers[discovered] = struct{}{}
		}
	}
}

func normalizePeer(value string) string {
	value = strings.TrimRight(strings.TrimSpace(value), "/")
	if value == "" {
		return ""
	}
	parsed, err := url.Parse(value)
	if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") || parsed.Host == "" {
		return ""
	}
	return fmt.Sprintf("%s://%s", parsed.Scheme, parsed.Host)
}

func firstNonEmpty(value, fallback string) string {
	if strings.TrimSpace(value) == "" {
		return fallback
	}
	return value
}
