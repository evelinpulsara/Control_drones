#!/bin/sh
set -e

# ---------------------------------------------------------------------------
# AgriDrone startup script
# Runs the gRPC backend (HTTP/2) and the Next.js frontend in a single
# container. Designed for platforms like Render or Fly.io.
#
# Written in POSIX sh (no bash) so it runs under BusyBox ash on Alpine.
#
# Environment variables:
#   PORT        - port for the Next.js frontend (default: 3000)
#   GRPC_PORT   - host:port for the gRPC server (default: 0.0.0.0:50051)
# ---------------------------------------------------------------------------

export PORT="${PORT:-3000}"
export GRPC_PORT="${GRPC_PORT:-0.0.0.0:50051}"

echo "[startup] AgriDrone starting..."
echo "[startup] Next.js frontend on http://0.0.0.0:${PORT}"
echo "[startup] gRPC MonitoreoFlota on ${GRPC_PORT} (HTTP/2 + binary protobuf)"

cleanup() {
  echo ""
  echo "[startup] Received shutdown signal, stopping services..."
  kill -TERM "$GRPC_PID" 2>/dev/null || true
  kill -TERM "$WEB_PID" 2>/dev/null || true
  wait "$GRPC_PID" 2>/dev/null || true
  wait "$WEB_PID" 2>/dev/null || true
  echo "[startup] All services stopped."
  exit 0
}

trap cleanup TERM INT

# ---- gRPC backend (HTTP/2 with bidirectional binary streaming) -------------
cd /app/backend
node dist/server.js &
GRPC_PID=$!

# ---- Next.js frontend ------------------------------------------------------
# Next.js standalone server.js reads process.env.HOSTNAME to decide the bind
# address. Docker sets HOSTNAME to the container id by default, which would
# make Next.js bind only to the container IP (not 0.0.0.0). We override it so
# the frontend listens on all interfaces and is reachable via port mapping.
cd /app/web
HOSTNAME=0.0.0.0 node server.js -p "${PORT}" &
WEB_PID=$!

# ---- Wait for either service to exit (POSIX-compatible polling) -----------
# busybox ash does not support `wait -n`, so we poll process liveness.
set +e
while kill -0 "$GRPC_PID" 2>/dev/null && kill -0 "$WEB_PID" 2>/dev/null; do
  sleep 1
done
set -e

echo "[startup] A service exited, shutting down..."
cleanup
