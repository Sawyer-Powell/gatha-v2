.PHONY: wasm infra dev

wasm:
	wasm-pack build crates/client-wasm --target web --out-dir ../../frontend/src/wasm

infra:
	cd docker && docker compose down && docker compose up -d

dev: wasm
	NODE_OPTIONS=--use-system-ca npx concurrently --kill-others --names "server,wasm,vite" --prefix-colors "blue,yellow,green" \
		"cargo watch -w crates/server -w crates/common --delay 1 -x 'run -p server'" \
		"cargo watch -w crates/client -w crates/client-wasm -w crates/common -s 'wasm-pack build crates/client-wasm --target web --out-dir ../../frontend/src/wasm'" \
		"cd frontend && npx vite --clearScreen false"
