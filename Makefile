.PHONY: wasm server dev frontend

wasm:
	wasm-pack build crates/client --target web --out-dir ../../frontend/src/wasm

frontend: wasm
	cd frontend && npm run dev

server:
	cargo run -p server

dev: wasm
	cd frontend && npm run dev & cargo run -p server & wait
