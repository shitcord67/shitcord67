#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="${ROOT_DIR}/dist"

TARGET_PLATFORM=""
MODE="prompt" # prompt|clean|build
BUILD_VERBOSE="${BUILD_VERBOSE:-0}"
BUILD_HEARTBEAT_SECONDS="${BUILD_HEARTBEAT_SECONDS:-15}"
ANDROID_GRADLE_MAX_WORKERS="${ANDROID_GRADLE_MAX_WORKERS:-2}"
ANDROID_GRADLE_LOG_LEVEL="${ANDROID_GRADLE_LOG_LEVEL:-lifecycle}" # quiet|lifecycle|info|debug
ANDROID_GRADLE_NO_DAEMON="${ANDROID_GRADLE_NO_DAEMON:-1}"

usage() {
  cat <<'EOF'
Usage: scripts/build-platform.sh <electron|web|android> [--build|--clean]

Build targets:
  electron    Package desktop app with @electron/packager
  web         Build static web output into dist/web
  android     Sync Capacitor Android project and build debug APK

Options:
  --build     Build only (skip clean prompt and skip clean step)
  --clean     Force clean before build (no prompt)
  -h, --help  Show this help

Default behavior:
  The script asks whether to clean before build (interactive terminals).
  In non-interactive mode, it defaults to clean+build.

Environment (electron target):
  ELECTRON_BUILD_PLATFORM  default: linux
  ELECTRON_BUILD_ARCH      default: x64

Environment (all targets):
  BUILD_VERBOSE            1 enables extra command logging
  BUILD_HEARTBEAT_SECONDS  heartbeat interval for long-running steps (default: 15)

Environment (android target):
  ANDROID_GRADLE_MAX_WORKERS  default: 2
  ANDROID_GRADLE_LOG_LEVEL    quiet | lifecycle | info | debug (default: lifecycle)
  ANDROID_GRADLE_NO_DAEMON    1 disables daemon for one-shot builds (default: 1)
EOF
}

log() {
  echo "[build-platform] $*"
}

die() {
  echo "[build-platform] error: $*" >&2
  exit 1
}

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

run_cmd() {
  if [[ "${BUILD_VERBOSE}" == "1" ]]; then
    log "exec: $*"
  fi
  "$@"
}

run_with_heartbeat() {
  local label="$1"
  shift
  local -a cmd=("$@")
  local started_at elapsed

  if [[ "${BUILD_VERBOSE}" == "1" ]]; then
    log "exec: ${cmd[*]}"
  fi

  "${cmd[@]}" &
  local cmd_pid=$!
  started_at="$(date +%s)"

  while kill -0 "${cmd_pid}" 2>/dev/null; do
    sleep "${BUILD_HEARTBEAT_SECONDS}"
    if ! kill -0 "${cmd_pid}" 2>/dev/null; then
      break
    fi
    elapsed=$(( $(date +%s) - started_at ))
    log "${label}... (${elapsed}s elapsed)"
  done

  wait "${cmd_pid}"
}

parse_args() {
  if (($# < 1)); then
    usage >&2
    exit 2
  fi

  while (($# > 0)); do
    case "$1" in
      electron|web|android)
        if [[ -n "${TARGET_PLATFORM}" ]]; then
          die "platform already set to '${TARGET_PLATFORM}', got extra '${1}'"
        fi
        TARGET_PLATFORM="$1"
        shift
        ;;
      --build)
        MODE="build"
        shift
        ;;
      --clean)
        MODE="clean"
        shift
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        die "unknown argument: $1"
        ;;
    esac
  done

  [[ -n "${TARGET_PLATFORM}" ]] || die "missing platform (electron|web|android)"
}

should_clean() {
  case "${MODE}" in
    clean) return 0 ;;
    build) return 1 ;;
    prompt)
      if [[ ! -t 0 ]]; then
        log "non-interactive shell detected, defaulting to clean+build"
        return 0
      fi
      local answer
      read -r -p "[build-platform] Clean before build? [Y/n] " answer
      case "${answer}" in
        n|N|no|NO) return 1 ;;
        *) return 0 ;;
      esac
      ;;
    *)
      die "invalid mode: ${MODE}"
      ;;
  esac
}

clean_web() {
  rm -rf "${DIST_DIR}/web"
}

build_web() {
  log "building web bundle"
  run_with_heartbeat "web asset copy" bash -lc "cd \"${ROOT_DIR}\" && npm run mobile:build:web"
  mkdir -p "${DIST_DIR}"
  rm -rf "${DIST_DIR}/web"
  run_cmd cp -a "${ROOT_DIR}/.mobile-web" "${DIST_DIR}/web"
  log "web output: dist/web"
}

clean_electron() {
  rm -rf "${DIST_DIR}/electron"
}

build_electron() {
  local electron_platform="${ELECTRON_BUILD_PLATFORM:-linux}"
  local electron_arch="${ELECTRON_BUILD_ARCH:-x64}"
  local electron_icon="${ROOT_DIR}/assets/icons/shitcord67-logo-512.png"
  local -a ignore_patterns=(
    "^/docs($|/)"
    "^/xmppmessengers($|/)"
    "^/discord-api-docs($|/)"
    "^/dist($|/)"
    "^/android($|/)"
    "^/\\.git($|/)"
    "^/\\.mobile-web($|/)"
  )
  local -a packager_args=(
    .
    shitcord67
    "--platform=${electron_platform}"
    "--arch=${electron_arch}"
    "--icon=${electron_icon}"
    "--no-asar"
    "--out=${DIST_DIR}/electron"
    "--overwrite"
  )

  for pattern in "${ignore_patterns[@]}"; do
    packager_args+=("--ignore=${pattern}")
  done

  log "packaging electron app (${electron_platform}/${electron_arch})"
  log "electron excludes: docs, xmppmessengers, discord-api-docs, dist, android, .git, .mobile-web"
  mkdir -p "${DIST_DIR}/electron"
  (
    cd "${ROOT_DIR}"
    run_with_heartbeat "electron packaging" npx @electron/packager "${packager_args[@]}"
  )
  if [[ "${electron_platform}" == "linux" ]]; then
    local app_dir="${DIST_DIR}/electron/shitcord67-linux-${electron_arch}"
    local app_exec="${app_dir}/shitcord67"
    local app_icon="${app_dir}/shitcord67.png"
    local desktop_entry="${app_dir}/shitcord67.desktop"
    if [[ -f "${app_exec}" ]]; then
      cp -f "${electron_icon}" "${app_icon}"
      cat > "${desktop_entry}" <<EOF
[Desktop Entry]
Type=Application
Version=1.0
Name=shitcord67
Comment=shitcord67 desktop client
Exec=${app_exec} %U
Icon=${app_icon}
Terminal=false
Categories=Network;Chat;InstantMessaging;
StartupNotify=true
EOF
      chmod +x "${desktop_entry}"
      log "linux desktop entry: ${desktop_entry}"
    fi
  fi
  log "electron output: dist/electron"
}

clean_android() {
  rm -rf "${DIST_DIR}/android"
  if [[ -x "${ROOT_DIR}/android/gradlew" ]]; then
    (
      cd "${ROOT_DIR}/android"
      GRADLE_USER_HOME="${PWD}/.gradle-local" ./gradlew clean
    )
  fi
}

build_android() {
  local -a gradle_args=(assembleDebug "--console=plain" "--max-workers=${ANDROID_GRADLE_MAX_WORKERS}")
  case "${ANDROID_GRADLE_LOG_LEVEL}" in
    quiet) gradle_args=("--quiet" "${gradle_args[@]}") ;;
    lifecycle) : ;;
    info) gradle_args=("--info" "${gradle_args[@]}") ;;
    debug) gradle_args=("--debug" "${gradle_args[@]}") ;;
    *) die "invalid ANDROID_GRADLE_LOG_LEVEL='${ANDROID_GRADLE_LOG_LEVEL}' (use quiet|lifecycle|info|debug)" ;;
  esac
  if [[ "${ANDROID_GRADLE_NO_DAEMON}" == "1" ]]; then
    gradle_args=("--no-daemon" "${gradle_args[@]}")
  fi

  log "syncing android project"
  run_with_heartbeat "capacitor sync" bash -lc "cd \"${ROOT_DIR}\" && npm run mobile:android:sync"
  if [[ ! -x "${ROOT_DIR}/android/gradlew" ]]; then
    die "android/gradlew missing (run npm run mobile:android:init first)"
  fi
  log "building debug APK (workers=${ANDROID_GRADLE_MAX_WORKERS}, daemon=$([[ \"${ANDROID_GRADLE_NO_DAEMON}\" == \"1\" ]] && echo off || echo on), log=${ANDROID_GRADLE_LOG_LEVEL})"
  (
    cd "${ROOT_DIR}/android"
    run_with_heartbeat "gradle assembleDebug" env GRADLE_USER_HOME="${PWD}/.gradle-local" ./gradlew "${gradle_args[@]}"
  )
  local apk="${ROOT_DIR}/android/app/build/outputs/apk/debug/app-debug.apk"
  [[ -f "${apk}" ]] || die "debug APK not found at android/app/build/outputs/apk/debug/app-debug.apk"
  mkdir -p "${DIST_DIR}/android"
  cp -f "${apk}" "${DIST_DIR}/android/app-debug.apk"
  log "android output: dist/android/app-debug.apk"
}

run_target() {
  local do_clean=1
  if should_clean; then
    do_clean=1
    log "clean step enabled"
  else
    do_clean=0
    log "clean step skipped"
  fi

  case "${TARGET_PLATFORM}" in
    web)
      ((do_clean == 1)) && clean_web
      build_web
      ;;
    electron)
      ((do_clean == 1)) && clean_electron
      build_electron
      ;;
    android)
      ((do_clean == 1)) && clean_android
      build_android
      ;;
    *)
      die "unsupported platform: ${TARGET_PLATFORM}"
      ;;
  esac
}

main() {
  command_exists npm || die "npm is required"
  parse_args "$@"
  run_target
}

main "$@"
