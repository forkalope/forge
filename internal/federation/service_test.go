package federation

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestServiceFederationFlow(t *testing.T) {
	var first, second *Service
	firstServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { first.Handler().ServeHTTP(w, r) }))
	defer firstServer.Close()
	secondServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { second.Handler().ServeHTTP(w, r) }))
	defer secondServer.Close()

	var err error
	first, err = NewService(Config{DataDir: t.TempDir(), FranchiseID: "franchise-1", Endpoint: firstServer.URL, PeerURL: secondServer.URL, PeerFranchiseID: "franchise-2"})
	if err != nil {
		t.Fatal(err)
	}
	second, err = NewService(Config{DataDir: t.TempDir(), FranchiseID: "franchise-2", Endpoint: secondServer.URL, PeerURL: firstServer.URL, PeerFranchiseID: "franchise-1"})
	if err != nil {
		t.Fatal(err)
	}

	if err := first.Propose(); err != nil {
		t.Fatal(err)
	}
	if !second.Status().Contract.ProposalReceived {
		t.Fatal("second franchise did not receive proposal")
	}
	if err := second.Approve(); err != nil {
		t.Fatal(err)
	}
	if err := first.Approve(); err != nil {
		t.Fatal(err)
	}
	if !first.Status().Contract.GatewayReachable {
		t.Fatal("first gateway was not reached")
	}
	if err := second.probe(); err != nil {
		t.Fatal(err)
	}
	if second.Status().Contract.State != "active" {
		t.Fatalf("second contract state = %q", second.Status().Contract.State)
	}
}

func TestIdentityPersists(t *testing.T) {
	dir := t.TempDir()
	first, err := NewService(Config{DataDir: dir, FranchiseID: "franchise-1", Endpoint: "http://localhost:8080"})
	if err != nil {
		t.Fatal(err)
	}
	second, err := NewService(Config{DataDir: dir, FranchiseID: "franchise-1", Endpoint: "http://localhost:8080"})
	if err != nil {
		t.Fatal(err)
	}
	if first.Status().Local.Fingerprint != second.Status().Local.Fingerprint {
		t.Fatal("federation identity changed across restart")
	}
}
