package storage

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"os"
	"path/filepath"
)

// LocalBlobStore keeps immutable files addressed by their SHA-256 digest.
// The layout makes later peer replication a hash exchange followed by a file transfer.
type LocalBlobStore struct {
	root string
}

func NewLocalBlobStore(dataDir string) (*LocalBlobStore, error) {
	root := filepath.Join(dataDir, "blobs", "sha256")
	if err := os.MkdirAll(root, 0o755); err != nil {
		return nil, fmt.Errorf("create blob store: %w", err)
	}
	return &LocalBlobStore{root: root}, nil
}

func (s *LocalBlobStore) Root() string { return s.root }

func (s *LocalBlobStore) Has(hash string) bool {
	if !validHash(hash) {
		return false
	}
	_, err := os.Stat(s.path(hash))
	return err == nil
}

func (s *LocalBlobStore) Put(r io.Reader) (string, int64, error) {
	tmp, err := os.CreateTemp(s.root, ".upload-*")
	if err != nil {
		return "", 0, fmt.Errorf("create temporary blob: %w", err)
	}
	tmpName := tmp.Name()
	defer os.Remove(tmpName)

	hash := sha256.New()
	size, err := io.Copy(io.MultiWriter(tmp, hash), r)
	if closeErr := tmp.Close(); err == nil {
		err = closeErr
	}
	if err != nil {
		return "", 0, fmt.Errorf("write blob: %w", err)
	}

	digest := hex.EncodeToString(hash.Sum(nil))
	destination := s.path(digest)
	if err := os.MkdirAll(filepath.Dir(destination), 0o755); err != nil {
		return "", 0, fmt.Errorf("create blob prefix: %w", err)
	}
	if s.Has(digest) {
		return digest, size, nil
	}
	if err := os.Rename(tmpName, destination); err != nil {
		return "", 0, fmt.Errorf("commit blob: %w", err)
	}
	return digest, size, nil
}

func (s *LocalBlobStore) path(hash string) string {
	return filepath.Join(s.root, hash[:2], hash[2:4], hash)
}

func validHash(hash string) bool {
	if len(hash) != sha256.Size*2 {
		return false
	}
	_, err := hex.DecodeString(hash)
	return err == nil
}
