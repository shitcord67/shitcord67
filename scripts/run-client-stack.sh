#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

CLIENT_HOST="${CLIENT_HOST:-127.0.0.1}"
CLIENT_PORT="${CLIENT_PORT:-8080}"
GATEWAY_HOST="${GATEWAY_HOST:-127.0.0.1}"
GATEWAY_PORT="${GATEWAY_PORT:-8790}"
GATEWAY_MODE="${GATEWAY_MODE:-auto}" # auto|on|off

PIDS=()
NAMES=()

usage() {
  cat <<'EOF'
Usage: scripts/run-client-stack.sh [options]

Starts a local static client server and optionally the XMPP auth gateway.
Any processes started by this script are stopped automatically on exit/INT/TERM.

Options:
  --client-host <host>       Client server host (default: 127.0.0.1)
  --client-port <port>       Client server port (default: 8080)
  --gateway-host <host>      Gateway host (default: 127.0.0.1)
  --gateway-port <port>      Gateway port (default: 8790)
  --gateway-mode <mode>      auto | on | off (default: auto)
  --with-gateway             Same as --gateway-mode on
  --no-gateway               Same as --gateway-mode off
  -h, --help                 Show help

Environment overrides:
  CLIENT_HOST, CLIENT_PORT, GATEWAY_HOST, GATEWAY_PORT, GATEWAY_MODE
EOF
}

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

is_port_listening() {
  local port="$1"
  if command_exists ss; then
    ss -H -ltn "sport = :${port}" 2>/dev/null | grep -q .
    return $?
  fi
  if command_exists lsof; then
    lsof -nP -iTCP:"${port}" -sTCP:LISTEN >/dev/null 2>&1
    return $?
  fi
  return 1
}

is_http_responding() {
  local url="$1"
  if command_exists curl; then
    curl -fsS --max-time 2 --output /dev/null "$url" >/dev/null 2>&1
    return $?
  fi
  if command_exists wget; then
    wget -q --spider --timeout=2 "$url" >/dev/null 2>&1
    return $?
  fi
  # If neither client exists, fall back to optimistic reuse/start behavior.
  return 0
}

start_bg() {
  local name="$1"
  shift
  "$@" &
  local pid=$!
  PIDS+=("$pid")
  NAMES+=("$name")
  echo "[run-client-stack] started ${name} (pid ${pid})"
}

cleanup() {
  local exit_code=$?
  trap - EXIT INT TERM HUP

  if ((${#PIDS[@]} > 0)); then
    echo "[run-client-stack] shutting down..."
  fi

  for i in "${!PIDS[@]}"; do
    local pid="${PIDS[$i]}"
    local name="${NAMES[$i]}"
    if kill -0 "${pid}" 2>/dev/null; then
      echo "[run-client-stack] stopping ${name} (pid ${pid})"
      kill "${pid}" 2>/dev/null || true
    fi
  done

  local force_after=$((SECONDS + 4))
  for pid in "${PIDS[@]}"; do
    while kill -0 "${pid}" 2>/dev/null && ((SECONDS < force_after)); do
      sleep 0.1
    done
    if kill -0 "${pid}" 2>/dev/null; then
      kill -9 "${pid}" 2>/dev/null || true
    fi
  done

  wait >/dev/null 2>&1 || true
  exit "${exit_code}"
}

should_start_gateway() {
  case "${GATEWAY_MODE}" in
    on|true|1) return 0 ;;
    off|false|0) return 1 ;;
    auto)
      [[ -f "${ROOT_DIR}/.xmpp.local.json" ]]
      return $?
      ;;
    *)
      echo "[run-client-stack] invalid gateway mode: ${GATEWAY_MODE}" >&2
      exit 2
      ;;
  esac
}

monitor_children() {
  while true; do
    for i in "${!PIDS[@]}"; do
      local pid="${PIDS[$i]}"
      local name="${NAMES[$i]}"
      if ! kill -0 "${pid}" 2>/dev/null; then
        wait "${pid}" || true
        echo "[run-client-stack] ${name} exited"
        return 1
      fi
    done
    sleep 1
  done
}

while (($# > 0)); do
  case "$1" in
    --client-host)
      CLIENT_HOST="${2:-}"
      shift 2
      ;;
    --client-port)
      CLIENT_PORT="${2:-}"
      shift 2
      ;;
    --gateway-host)
      GATEWAY_HOST="${2:-}"
      shift 2
      ;;
    --gateway-port)
      GATEWAY_PORT="${2:-}"
      shift 2
      ;;
    --gateway-mode)
      GATEWAY_MODE="${2:-}"
      shift 2
      ;;
    --with-gateway)
      GATEWAY_MODE="on"
      shift
      ;;
    --no-gateway)
      GATEWAY_MODE="off"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "[run-client-stack] unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

trap cleanup EXIT INT TERM HUP

if ! command_exists python3; then
  echo "[run-client-stack] python3 is required for the local static server." >&2
  exit 1
fi

if command_exists node; then
  if ! node "${ROOT_DIR}/scripts/sync-strophe-runtime.mjs"; then
    echo "[run-client-stack] warning: runtime sync failed; media runtime fallbacks may be unavailable." >&2
  fi
else
  echo "[run-client-stack] warning: node is unavailable, skipping runtime sync." >&2
fi

CLIENT_URL="http://${CLIENT_HOST}:${CLIENT_PORT}/"

if is_port_listening "${CLIENT_PORT}"; then
  if is_http_responding "${CLIENT_URL}"; then
    echo "[run-client-stack] client server port ${CLIENT_PORT} already in use, reusing existing server."
  else
    echo "[run-client-stack] client server port ${CLIENT_PORT} is listening but ${CLIENT_URL} is not responding." >&2
    echo "[run-client-stack] refusing stale reuse; stop the process on port ${CLIENT_PORT} or pick another CLIENT_PORT." >&2
    exit 1
  fi
else
  start_bg "client-server" python3 -m http.server "${CLIENT_PORT}" --bind "${CLIENT_HOST}" --directory "${ROOT_DIR}"
fi

if should_start_gateway; then
  if ! command_exists node; then
    echo "[run-client-stack] node is required to start xmpp auth gateway." >&2
    exit 1
  fi
  if is_port_listening "${GATEWAY_PORT}"; then
    echo "[run-client-stack] xmpp gateway port ${GATEWAY_PORT} already in use, reusing existing gateway."
  else
    start_bg "xmpp-auth-gateway" env HOST="${GATEWAY_HOST}" PORT="${GATEWAY_PORT}" node "${ROOT_DIR}/scripts/xmpp-auth-gateway.mjs"
  fi
else
  echo "[run-client-stack] gateway disabled (mode=${GATEWAY_MODE})."
fi

echo "[run-client-stack] client: ${CLIENT_URL}"
if should_start_gateway; then
  echo "[run-client-stack] gateway: http://${GATEWAY_HOST}:${GATEWAY_PORT}"
fi
echo "[run-client-stack] press Ctrl+C to stop."

if ((${#PIDS[@]} == 0)); then
  echo "[run-client-stack] no processes started by this script."
  exit 0
fi

monitor_children
