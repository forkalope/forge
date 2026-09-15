package federation

import (
	"bytes"
	"crypto/ed25519"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

type Config struct {
	DataDir         string
	FranchiseID     string
	FranchiseName   string
	Endpoint        string
	PeerURL         string
	PeerFranchiseID string
}

type Manifest struct {
	FranchiseID string `json:"franchise_id"`
	Name        string `json:"name"`
	Endpoint    string `json:"endpoint"`
	PublicKey   string `json:"public_key"`
	Fingerprint string `json:"fingerprint"`
}

type Contract struct {
	ID               string    `json:"id"`
	LocalManifest    Manifest  `json:"local_manifest"`
	RemoteManifest   Manifest  `json:"remote_manifest"`
	Scope            []string  `json:"scope"`
	ProposalSent     bool      `json:"proposal_sent"`
	ProposalReceived bool      `json:"proposal_received"`
	LocalApproved    bool      `json:"local_approved"`
	RemoteApproved   bool      `json:"remote_approved"`
	GatewayReachable bool      `json:"gateway_reachable"`
	State            string    `json:"state"`
	LastError        string    `json:"last_error,omitempty"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
	LastProbeAt      time.Time `json:"last_probe_at,omitempty"`
}

type Step struct {
	Key    string `json:"key"`
	Label  string `json:"label"`
	State  string `json:"state"`
	Detail string `json:"detail"`
}

type Status struct {
	Local          Manifest  `json:"local"`
	PeerConfigured bool      `json:"peer_configured"`
	PeerURL        string    `json:"peer_url,omitempty"`
	PeerFranchise  string    `json:"peer_franchise,omitempty"`
	Contract       *Contract `json:"contract,omitempty"`
	Steps          []Step    `json:"steps"`
}

type proposalEnvelope struct {
	Type          string   `json:"type"`
	ContractID    string   `json:"contract_id"`
	From          Manifest `json:"from"`
	ToFranchiseID string   `json:"to_franchise_id"`
	Scope         []string `json:"scope"`
	IssuedAt      string   `json:"issued_at"`
	Signature     string   `json:"signature"`
}

type approvalEnvelope struct {
	Type          string   `json:"type"`
	ContractID    string   `json:"contract_id"`
	From          Manifest `json:"from"`
	ToFranchiseID string   `json:"to_franchise_id"`
	IssuedAt      string   `json:"issued_at"`
	Signature     string   `json:"signature"`
}

type identityFile struct {
	PrivateKey string `json:"private_key"`
}

type Service struct {
	mu            sync.RWMutex
	local         Manifest
	privateKey    ed25519.PrivateKey
	peerURL       string
	peerFranchise string
	contractPath  string
	contract      *Contract
	client        *http.Client
}

func NewService(config Config) (*Service, error) {
	if strings.TrimSpace(config.DataDir) == "" {
		return nil, errors.New("federation data directory is required")
	}
	if strings.TrimSpace(config.FranchiseID) == "" {
		return nil, errors.New("franchise ID is required")
	}
	if strings.TrimSpace(config.Endpoint) == "" {
		return nil, errors.New("franchise endpoint is required")
	}
	if config.FranchiseName == "" {
		config.FranchiseName = config.FranchiseID
	}
	if err := os.MkdirAll(config.DataDir, 0o700); err != nil {
		return nil, fmt.Errorf("create federation data directory: %w", err)
	}

	privateKey, err := loadOrCreateKey(filepath.Join(config.DataDir, "federation-identity.json"))
	if err != nil {
		return nil, err
	}
	publicKey := privateKey.Public().(ed25519.PublicKey)
	service := &Service{
		local: Manifest{
			FranchiseID: config.FranchiseID,
			Name:        config.FranchiseName,
			Endpoint:    strings.TrimRight(config.Endpoint, "/"),
			PublicKey:   base64.RawStdEncoding.EncodeToString(publicKey),
			Fingerprint: fingerprint(publicKey),
		},
		privateKey:    privateKey,
		peerURL:       normalizeURL(config.PeerURL),
		peerFranchise: config.PeerFranchiseID,
		contractPath:  filepath.Join(config.DataDir, "federation-contract.json"),
		client:        &http.Client{Timeout: 3 * time.Second},
	}
	if data, err := os.ReadFile(service.contractPath); err == nil {
		var contract Contract
		if err := json.Unmarshal(data, &contract); err != nil {
			return nil, fmt.Errorf("decode federation contract: %w", err)
		}
		service.contract = &contract
	} else if !errors.Is(err, os.ErrNotExist) {
		return nil, fmt.Errorf("read federation contract: %w", err)
	}
	return service, nil
}

func (s *Service) Handler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/v1/federation/status", s.statusHandler)
	mux.HandleFunc("GET /api/v1/federation/manifest", s.manifestHandler)
	mux.HandleFunc("POST /api/v1/federation/propose", s.proposeHandler)
	mux.HandleFunc("POST /api/v1/federation/approve", s.approveHandler)
	mux.HandleFunc("POST /api/v1/federation/probe", s.probeHandler)
	mux.HandleFunc("POST /api/v1/federation/inbound/proposal", s.inboundProposalHandler)
	mux.HandleFunc("POST /api/v1/federation/inbound/approval", s.inboundApprovalHandler)
	mux.HandleFunc("GET /api/v1/federation/probe", s.inboundProbeHandler)
	return mux
}

func (s *Service) Status() Status {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.statusLocked()
}

func (s *Service) Propose() error {
	s.mu.Lock()
	if s.peerURL == "" || s.peerFranchise == "" {
		s.mu.Unlock()
		return errors.New("federation peer is not configured")
	}
	now := time.Now().UTC()
	contract := &Contract{
		ID:            newContractID(s.local.PublicKey, s.peerFranchise),
		LocalManifest: s.local,
		Scope:         []string{"node-observation"},
		State:         "proposed",
		CreatedAt:     now,
		UpdatedAt:     now,
	}
	s.contract = contract
	if err := s.saveLocked(); err != nil {
		s.mu.Unlock()
		return err
	}
	envelope := s.proposalEnvelopeLocked(contract)
	s.mu.Unlock()

	if err := s.post(s.peerURL+"/api/v1/federation/inbound/proposal", envelope); err != nil {
		s.setError(err)
		return err
	}
	manifest, err := s.fetchPeerManifest()
	if err != nil {
		s.setError(err)
		return err
	}
	s.mu.Lock()
	if s.contract != nil && s.contract.ID == contract.ID {
		s.contract.RemoteManifest = manifest
		s.contract.ProposalReceived = true // the peer's 2xx response confirms receipt
		_ = s.saveLocked()
	}
	s.mu.Unlock()
	s.mu.Lock()
	if s.contract != nil && s.contract.ID == contract.ID {
		s.contract.ProposalSent = true
		s.contract.LastError = ""
		s.contract.UpdatedAt = time.Now().UTC()
		_ = s.saveLocked()
	}
	s.mu.Unlock()
	return nil
}

func (s *Service) Approve() error {
	s.mu.Lock()
	if s.contract == nil {
		s.mu.Unlock()
		return errors.New("no federation proposal is available")
	}
	if s.peerURL == "" || s.peerFranchise == "" {
		s.mu.Unlock()
		return errors.New("federation peer is not configured")
	}
	contractID := s.contract.ID
	s.contract.LocalApproved = true
	s.contract.LastError = ""
	s.contract.UpdatedAt = time.Now().UTC()
	_ = s.saveLocked()
	envelope := s.approvalEnvelopeLocked(contractID)
	s.mu.Unlock()

	if err := s.post(s.peerURL+"/api/v1/federation/inbound/approval", envelope); err != nil {
		s.setError(err)
		return err
	}
	s.mu.RLock()
	remoteApproved := s.contract != nil && s.contract.ID == contractID && s.contract.RemoteApproved
	s.mu.RUnlock()
	if remoteApproved {
		return s.probe()
	}
	return nil
}

func (s *Service) probe() error {
	s.mu.Lock()
	if s.contract == nil || !s.contract.LocalApproved || !s.contract.RemoteApproved {
		s.mu.Unlock()
		return errors.New("both franchises must approve before probing the gateway")
	}
	contractID := s.contract.ID
	peerURL := s.peerURL
	s.contract.LastProbeAt = time.Now().UTC()
	_ = s.saveLocked()
	s.mu.Unlock()

	request, err := http.NewRequest(http.MethodGet, peerURL+"/api/v1/federation/probe?contract_id="+url.QueryEscape(contractID), nil)
	if err != nil {
		s.setError(err)
		return err
	}
	response, err := s.client.Do(request)
	if err != nil {
		s.setError(err)
		return err
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		err := fmt.Errorf("peer gateway probe returned %s", response.Status)
		s.setError(err)
		return err
	}
	s.mu.Lock()
	if s.contract != nil && s.contract.ID == contractID {
		s.contract.GatewayReachable = true
		s.contract.State = "active"
		s.contract.LastError = ""
		s.contract.UpdatedAt = time.Now().UTC()
		_ = s.saveLocked()
	}
	s.mu.Unlock()
	return nil
}

func (s *Service) statusLocked() Status {
	var contract *Contract
	if s.contract != nil {
		copy := *s.contract
		contract = &copy
	}
	peerConfigured := s.peerURL != "" && s.peerFranchise != ""
	steps := []Step{
		{Key: "identity", Label: "Local franchise identity", State: "complete", Detail: "Signed identity " + s.local.Fingerprint},
		{Key: "peer", Label: "Peer configured", State: stateFor(peerConfigured), Detail: detailFor(peerConfigured, "Peer "+s.peerFranchise+" at "+s.peerURL, "No peer endpoint is configured")},
	}
	proposalCreated := contract != nil
	proposalSent := proposalCreated && (contract.ProposalSent || contract.ProposalReceived)
	proposalReceived := proposalCreated && contract.ProposalReceived
	localApproved := proposalCreated && contract.LocalApproved
	remoteApproved := proposalCreated && contract.RemoteApproved
	gateway := proposalCreated && contract.GatewayReachable
	steps = append(steps,
		Step{Key: "created", Label: "Proposal created", State: stateFor(proposalCreated), Detail: detailFor(proposalCreated, "Contract "+contractID(contract), "Create a proposal to begin")},
		Step{Key: "sent", Label: "Proposal delivered", State: stateFor(proposalSent), Detail: proposalDeliveryDetail(contract)},
		Step{Key: "received", Label: "Peer received proposal", State: stateFor(proposalReceived), Detail: detailFor(proposalReceived, "Peer identity was verified and recorded", "Waiting for peer to receive it")},
		Step{Key: "local-approval", Label: "This franchise approved", State: stateFor(localApproved), Detail: detailFor(localApproved, "Local operator approval recorded", "Local approval is still required")},
		Step{Key: "remote-approval", Label: "Peer approved", State: stateFor(remoteApproved), Detail: detailFor(remoteApproved, "Peer operator approval received", "Waiting for peer approval")},
		Step{Key: "gateway", Label: "Federation gateway reachable", State: stateFor(gateway), Detail: detailFor(gateway, "Both sides approved; authenticated probe succeeded", "Gateway remains closed until both approvals are complete")},
	)
	return Status{Local: s.local, PeerConfigured: peerConfigured, PeerURL: s.peerURL, PeerFranchise: s.peerFranchise, Contract: contract, Steps: steps}
}

func (s *Service) statusHandler(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, s.Status())
}

func (s *Service) manifestHandler(w http.ResponseWriter, _ *http.Request) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	writeJSON(w, http.StatusOK, s.local)
}

func (s *Service) proposeHandler(w http.ResponseWriter, _ *http.Request) {
	if err := s.Propose(); err != nil {
		writeJSON(w, http.StatusConflict, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, s.Status())
}

func (s *Service) approveHandler(w http.ResponseWriter, _ *http.Request) {
	if err := s.Approve(); err != nil {
		writeJSON(w, http.StatusConflict, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, s.Status())
}

func (s *Service) probeHandler(w http.ResponseWriter, _ *http.Request) {
	if err := s.probe(); err != nil {
		writeJSON(w, http.StatusConflict, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, s.Status())
}

func (s *Service) inboundProposalHandler(w http.ResponseWriter, r *http.Request) {
	var envelope proposalEnvelope
	if err := decodeJSON(r, &envelope); err != nil || envelope.Type != "proposal" || envelope.ToFranchiseID != s.local.FranchiseID || envelope.From.FranchiseID != s.peerFranchise || !verifyProposal(envelope) {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "invalid federation proposal"})
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.contract != nil && s.contract.ID != envelope.ContractID {
		writeJSON(w, http.StatusConflict, map[string]string{"error": "another federation contract is already pending"})
		return
	}
	now := time.Now().UTC()
	if s.contract == nil {
		s.contract = &Contract{ID: envelope.ContractID, LocalManifest: s.local, CreatedAt: now}
	}
	s.contract.RemoteManifest = envelope.From
	s.contract.Scope = append([]string(nil), envelope.Scope...)
	s.contract.ProposalReceived = true
	s.contract.State = "received"
	s.contract.LastError = ""
	s.contract.UpdatedAt = now
	if err := s.saveLocked(); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "received"})
}

func (s *Service) inboundApprovalHandler(w http.ResponseWriter, r *http.Request) {
	var envelope approvalEnvelope
	if err := decodeJSON(r, &envelope); err != nil || envelope.Type != "approval" || envelope.ToFranchiseID != s.local.FranchiseID || !verifyApproval(envelope) {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "invalid federation approval"})
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.contract == nil || s.contract.ID != envelope.ContractID || s.contract.RemoteManifest.PublicKey != envelope.From.PublicKey {
		writeJSON(w, http.StatusConflict, map[string]string{"error": "approval does not match the pending contract"})
		return
	}
	s.contract.RemoteApproved = true
	s.contract.LastError = ""
	s.contract.State = "approved"
	s.contract.UpdatedAt = time.Now().UTC()
	if err := s.saveLocked(); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "approved"})
}

func (s *Service) inboundProbeHandler(w http.ResponseWriter, r *http.Request) {
	contractID := r.URL.Query().Get("contract_id")
	s.mu.RLock()
	valid := s.contract != nil && s.contract.ID == contractID && s.contract.LocalApproved && s.contract.RemoteApproved
	s.mu.RUnlock()
	if !valid {
		writeJSON(w, http.StatusForbidden, map[string]string{"error": "federation contract is not active"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "active"})
}

func (s *Service) proposalEnvelopeLocked(contract *Contract) proposalEnvelope {
	envelope := proposalEnvelope{Type: "proposal", ContractID: contract.ID, From: s.local, ToFranchiseID: s.peerFranchise, Scope: contract.Scope, IssuedAt: time.Now().UTC().Format(time.RFC3339Nano)}
	envelope.Signature = sign(s.privateKey, proposalSigningBytes(envelope))
	return envelope
}

func (s *Service) approvalEnvelopeLocked(contractID string) approvalEnvelope {
	envelope := approvalEnvelope{Type: "approval", ContractID: contractID, From: s.local, ToFranchiseID: s.peerFranchise, IssuedAt: time.Now().UTC().Format(time.RFC3339Nano)}
	envelope.Signature = sign(s.privateKey, approvalSigningBytes(envelope))
	return envelope
}

func (s *Service) post(endpoint string, value any) error {
	payload, err := json.Marshal(value)
	if err != nil {
		return err
	}
	request, err := http.NewRequest(http.MethodPost, endpoint, bytes.NewReader(payload))
	if err != nil {
		return err
	}
	request.Header.Set("Content-Type", "application/json")
	response, err := s.client.Do(request)
	if err != nil {
		return err
	}
	defer response.Body.Close()
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return fmt.Errorf("peer returned %s", response.Status)
	}
	return nil
}

func (s *Service) fetchPeerManifest() (Manifest, error) {
	request, err := http.NewRequest(http.MethodGet, s.peerURL+"/api/v1/federation/manifest", nil)
	if err != nil {
		return Manifest{}, err
	}
	response, err := s.client.Do(request)
	if err != nil {
		return Manifest{}, err
	}
	defer response.Body.Close()
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return Manifest{}, fmt.Errorf("peer manifest returned %s", response.Status)
	}
	var manifest Manifest
	if err := json.NewDecoder(io.LimitReader(response.Body, 64*1024)).Decode(&manifest); err != nil {
		return Manifest{}, err
	}
	if manifest.FranchiseID != s.peerFranchise {
		return Manifest{}, fmt.Errorf("peer manifest belongs to %q", manifest.FranchiseID)
	}
	if _, ok := decodePublicKey(manifest); !ok {
		return Manifest{}, errors.New("peer manifest has an invalid signing key")
	}
	return manifest, nil
}

func (s *Service) setError(err error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.contract != nil {
		s.contract.LastError = err.Error()
		s.contract.State = "error"
		s.contract.UpdatedAt = time.Now().UTC()
		_ = s.saveLocked()
	}
}

func (s *Service) saveLocked() error {
	if s.contract == nil {
		return nil
	}
	data, err := json.MarshalIndent(s.contract, "", "  ")
	if err != nil {
		return err
	}
	temporary := s.contractPath + ".tmp"
	if err := os.WriteFile(temporary, data, 0o600); err != nil {
		return err
	}
	return os.Rename(temporary, s.contractPath)
}

func loadOrCreateKey(path string) (ed25519.PrivateKey, error) {
	if data, err := os.ReadFile(path); err == nil {
		var file identityFile
		if err := json.Unmarshal(data, &file); err != nil {
			return nil, fmt.Errorf("decode federation identity: %w", err)
		}
		key, err := base64.RawStdEncoding.DecodeString(file.PrivateKey)
		if err != nil || len(key) != ed25519.PrivateKeySize {
			return nil, errors.New("federation identity contains an invalid private key")
		}
		return ed25519.PrivateKey(key), nil
	} else if !errors.Is(err, os.ErrNotExist) {
		return nil, fmt.Errorf("read federation identity: %w", err)
	}
	_, privateKey, err := ed25519.GenerateKey(rand.Reader)
	if err != nil {
		return nil, fmt.Errorf("generate federation identity: %w", err)
	}
	data, _ := json.MarshalIndent(identityFile{PrivateKey: base64.RawStdEncoding.EncodeToString(privateKey)}, "", "  ")
	if err := os.WriteFile(path, data, 0o600); err != nil {
		return nil, fmt.Errorf("write federation identity: %w", err)
	}
	return privateKey, nil
}

func verifyProposal(envelope proposalEnvelope) bool {
	key, ok := decodePublicKey(envelope.From)
	return ok && ed25519.Verify(key, proposalSigningBytes(envelope), decodeSignature(envelope.Signature))
}

func verifyApproval(envelope approvalEnvelope) bool {
	key, ok := decodePublicKey(envelope.From)
	return ok && ed25519.Verify(key, approvalSigningBytes(envelope), decodeSignature(envelope.Signature))
}

func decodePublicKey(manifest Manifest) (ed25519.PublicKey, bool) {
	key, err := base64.RawStdEncoding.DecodeString(manifest.PublicKey)
	return ed25519.PublicKey(key), err == nil && len(key) == ed25519.PublicKeySize && fingerprint(key) == manifest.Fingerprint
}

func decodeSignature(value string) []byte {
	decoded, _ := base64.RawStdEncoding.DecodeString(value)
	return decoded
}

func sign(key ed25519.PrivateKey, payload []byte) string {
	return base64.RawStdEncoding.EncodeToString(ed25519.Sign(key, payload))
}

func proposalSigningBytes(envelope proposalEnvelope) []byte {
	envelope.Signature = ""
	data, _ := json.Marshal(envelope)
	return data
}

func approvalSigningBytes(envelope approvalEnvelope) []byte {
	envelope.Signature = ""
	data, _ := json.Marshal(envelope)
	return data
}

func fingerprint(publicKey []byte) string {
	sum := sha256.Sum256(publicKey)
	return hex.EncodeToString(sum[:])[:16]
}

func newContractID(publicKey, peer string) string {
	stamp := time.Now().UTC().Format(time.RFC3339Nano)
	sum := sha256.Sum256([]byte(publicKey + ":" + peer + ":" + stamp))
	return hex.EncodeToString(sum[:])[:20]
}

func normalizeURL(value string) string {
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

func stateFor(done bool) string {
	if done {
		return "complete"
	}
	return "pending"
}

func detailFor(done bool, complete, pending string) string {
	if done {
		return complete
	}
	return pending
}

func proposalDeliveryDetail(contract *Contract) string {
	if contract == nil {
		return "Waiting for delivery"
	}
	if contract.ProposalSent {
		return "Peer endpoint accepted the proposal"
	}
	if contract.ProposalReceived {
		return "Proposal arrived from the peer"
	}
	return "Waiting for delivery"
}

func contractID(contract *Contract) string {
	if contract == nil {
		return "not created"
	}
	return contract.ID
}

func decodeJSON(request *http.Request, value any) error {
	defer request.Body.Close()
	decoder := json.NewDecoder(io.LimitReader(request.Body, 64*1024))
	return decoder.Decode(value)
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}
