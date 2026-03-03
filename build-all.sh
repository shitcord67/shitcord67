#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

"${ROOT_DIR}/build.sh" web --clean
"${ROOT_DIR}/build.sh" electron --clean
"${ROOT_DIR}/build.sh" android --clean
