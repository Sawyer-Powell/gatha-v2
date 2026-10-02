#!/bin/sh
set -eu

repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$repo_root"

# Preserve local configuration; initialize new worktrees from documented defaults.
if [ ! -e .env ]; then
    cp .env.example .env
fi

# The server requires a 32-byte hex-encoded authentication secret.
if ! awk -F= '$1 == "AUTH_SECRET" && length($2) == 64 && $2 !~ /[^[:xdigit:]]/ { valid = 1 } END { exit !valid }' .env; then
    auth_secret=$(openssl rand -hex 32)
    awk -v auth_secret="$auth_secret" '
        BEGIN { FS = "=" }
        /^AUTH_SECRET=/ {
            print "AUTH_SECRET=" auth_secret
            found = 1
            next
        }
        { print }
        END {
            if (!found) print "AUTH_SECRET=" auth_secret
        }
    ' .env > .env.tmp
    mv .env.tmp .env
fi

# The backend serves HTTPS and uses these paths from .env.
. ./.env
if [ ! -f "$TLS_KEY" ] || [ ! -f "$TLS_CERT" ]; then
    mkdir -p "$(dirname "$TLS_KEY")" "$(dirname "$TLS_CERT")"
    openssl req -x509 -newkey rsa:2048 -nodes \
        -keyout "$TLS_KEY" -out "$TLS_CERT" -days 365 \
        -subj "/CN=localhost" \
        -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
fi

# make dev invokes frontend tools directly. Install dependencies once per worktree.
if [ ! -d frontend/node_modules ]; then
    (cd frontend && npm ci --no-audit --no-fund)
fi
