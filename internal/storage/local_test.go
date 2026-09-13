package storage

import (
	"strings"
	"testing"
)

func TestLocalBlobStorePutIsContentAddressed(t *testing.T) {
	store, err := NewLocalBlobStore(t.TempDir())
	if err != nil {
		t.Fatal(err)
	}

	hash, size, err := store.Put(strings.NewReader("hello Forkalope"))
	if err != nil {
		t.Fatal(err)
	}
	if size != 15 {
		t.Fatalf("size = %d, want 15", size)
	}
	if !store.Has(hash) {
		t.Fatalf("blob %s was not stored", hash)
	}
}
