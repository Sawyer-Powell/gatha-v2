.PHONY: wasm infra dev

wasm:
	wasm-pack build crates/client --target web --out-dir ../../frontend/src/wasm

infra:
	cd docker && docker compose down && docker compose up -d

dev: wasm
	cd docker && docker compose up -d
	trap 'kill 0 2>/dev/null' EXIT; \
	cargo watch -w crates/server -w crates/common --delay 1 -x 'run -p server' & \
	cargo watch -w crates/client -w crates/common -s 'wasm-pack build crates/client --target web --out-dir ../../frontend/src/wasm' & \
	cd frontend && npm run dev & \
	wait
