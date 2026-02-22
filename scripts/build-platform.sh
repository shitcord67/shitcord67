#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="${ROOT_DIR}/dist"

TARGET_PLATFORM=""
MODE="prompt" # prompt|clean|build

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
  (cd "${ROOT_DIR}" && npm run mobile:build:web)
  mkdir -p "${DIST_DIR}"
  rm -rf "${DIST_DIR}/web"
  cp -a "${ROOT_DIR}/.mobile-web" "${DIST_DIR}/web"
  log "web output: dist/web"
}

clean_electron() {
  rm -rf "${DIST_DIR}/electron"
}

build_electron() {
  local electron_platform="${ELECTRON_BUILD_PLATFORM:-linux}"
  local electron_arch="${ELECTRON_BUILD_ARCH:-x64}"
  log "packaging electron app (${electron_platform}/${electron_arch})"
  mkdir -p "${DIST_DIR}/electron"
  (
    cd "${ROOT_DIR}"
    npx @electron/packager . shitcord67 \
      --platform="${electron_platform}" \
      --arch="${electron_arch}" \
      --asar=false \
      --out="${DIST_DIR}/electron" \
      --overwrite
  )
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
  log "syncing android project"
  (cd "${ROOT_DIR}" && npm run mobile:android:sync)
  if [[ ! -x "${ROOT_DIR}/android/gradlew" ]]; then
    die "android/gradlew missing (run npm run mobile:android:init first)"
  fi
  log "building debug APK"
  (
    cd "${ROOT_DIR}/android"
    GRADLE_USER_HOME="${PWD}/.gradle-local" ./gradlew assembleDebug
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
