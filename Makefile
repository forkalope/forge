.PHONY: dev api web build test fmt

dev:
	@echo "Start the API in one terminal with: go run ./cmd/forkalope --addr :8080"
	@echo "Start the web app in another with:  cd web && npm install && npm run dev"

api:
	go run ./cmd/forkalope --addr :8080 --data-dir ./.forkalope

web:
	cd web && npm install && npm run dev

build:
	@mkdir -p bin
	cd web && npm install && npm run build
	go build -o bin/forkalope ./cmd/forkalope

test:
	go test ./...

fmt:
	gofmt -w cmd internal
