#!/usr/bin/env bash
set -euo pipefail

# ------------------------------------------------------------
# TokenizeRWA Template - One-command setup + run script
#
# Usage (from repo root):
#   chmod +x setup.sh
#   ./setup.sh
#
# What it does:
# - Ensures AlgoKit CLI is installed (algokit command)
# - Installs frontend dependencies
# - (Optional) Installs backend deps if Node >= 22
# - Runs frontend dev server (which also runs algokit project link --all)
# ------------------------------------------------------------

FRONTEND_DIR="projects/TokenizeRWATemplate-frontend"
BACKEND_DIR="smart_contracts"
PORT="${PORT:-5173}"

# --- Helpers ---
log() { echo -e "\033[1;36m[setup]\033[0m $*"; }
warn() { echo -e "\033[1;33m[warn]\033[0m $*"; }
err() { echo -e "\033[1;31m[error]\033[0m $*"; }

command_exists() { command -v "$1" >/dev/null 2>&1; }

get_node_major() {
  # prints major version as integer, or empty
  if ! command_exists node; then
    echo ""
    return
  fi
  node -p "process.versions.node.split('.')[0]" 2>/dev/null || echo ""
}

# --- Sanity checks ---
log "Starting TokenizeRWA Template setup..."

if [ ! -d "$FRONTEND_DIR" ]; then
  err "Could not find frontend directory: $FRONTEND_DIR"
  err "Run this script from the repository root."
  exit 1
fi

if ! command_exists npm; then
  err "npm not found. Please install Node.js (Node >= 20) first."
  exit 1
fi

NODE_MAJOR="$(get_node_major)"
if [ -z "$NODE_MAJOR" ]; then
  err "Node.js not found. Please install Node.js (Node >= 20) first."
  exit 1
fi

if [ "$NODE_MAJOR" -lt 20 ]; then
  err "Node.js version is too old (detected major: $NODE_MAJOR). Frontend requires Node >= 20."
  err "Fix: install Node 20+ (recommend nvm) and re-run."
  exit 1
fi

log "Node detected: v$(node -v) | npm: v$(npm -v)"

# --- Ensure AlgoKit CLI exists ---
# In Codespaces, pip installs usually land in ~/.local/bin
export PATH="$HOME/.local/bin:$PATH"

if ! command_exists algokit; then
  log "AlgoKit CLI (algokit) not found. Installing via pip..."

  # Prefer python3 if available, else python
  PYTHON_BIN=""
  if command_exists python3; then
    PYTHON_BIN="python3"
  elif command_exists python; then
    PYTHON_BIN="python"
  fi

  if [ -z "$PYTHON_BIN" ]; then
    err "Python not found. Python is required to install AlgoKit CLI via pip."
    err "Fix: install Python 3 and re-run."
    exit 1
  fi

  # Ensure pip exists
  if ! $PYTHON_BIN -m pip --version >/dev/null 2>&1; then
    err "pip not available for $PYTHON_BIN."
    err "Fix: install pip for Python 3 and re-run."
    exit 1
  fi

  $PYTHON_BIN -m pip install --upgrade pip >/dev/null
  $PYTHON_BIN -m pip install --user algokit >/dev/null

  # Re-apply PATH (some shells need it after install)
  export PATH="$HOME/.local/bin:$PATH"
fi

if ! command_exists algokit; then
  err "AlgoKit CLI install attempted but 'algokit' is still not on PATH."
  err "Try: export PATH=\"\$HOME/.local/bin:\$PATH\""
  exit 1
fi

log "AlgoKit CLI ready: $(algokit --version 2>/dev/null || echo 'installed')"

# --- Optional: backend deps install (only if Node >= 22) ---
if [ -d "$BACKEND_DIR" ]; then
  if [ "$NODE_MAJOR" -ge 22 ]; then
    log "Backend detected ($BACKEND_DIR) and Node >= 22, installing backend dependencies..."
    (cd "$BACKEND_DIR" && npm install)
  else
    warn "Backend detected ($BACKEND_DIR) but Node is < 22 (you have $NODE_MAJOR)."
    warn "Skipping backend npm install to avoid engine mismatch. This does NOT block running the frontend."
    warn "If you want backend later: upgrade Node to 22+ and run: (cd $BACKEND_DIR && npm install)"
  fi
else
  warn "Backend directory not found at '$BACKEND_DIR' (this is okay for frontend-only usage)."
fi

# --- Frontend install + run ---
log "Installing frontend dependencies..."
(cd "$FRONTEND_DIR" && npm install)

log "Starting frontend dev server on port $PORT..."
log "If you are in Codespaces: forward port $PORT and open in browser."

cd "$FRONTEND_DIR"
npm run dev -- --host 0.0.0.0 --port "$PORT"
