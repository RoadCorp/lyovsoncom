#!/usr/bin/env bash
# Cursor Cloud Agent install. Idempotent: a second run on a prepared disk
# skips the Node download and refreshes dependencies from the lockfile.
# Does not migrate, seed, start Postgres, or call paid providers.
set -euo pipefail

NODE_VERSION="24.21.0"
PNPM_VERSION="10.30.0"
NODE_PREFIX="/usr/local/lib/node-v${NODE_VERSION}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ "$(id -u)" -eq 0 ]]; then
  SUDO=()
else
  SUDO=(sudo)
fi

if [[ "$(/usr/local/bin/node -v 2>/dev/null || true)" != "v${NODE_VERSION}" ]]; then
  tmp="$(mktemp -d)"
  curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz" |
    tar -xJ -C "$tmp" --strip-components=1
  "${SUDO[@]}" rm -rf "$NODE_PREFIX"
  "${SUDO[@]}" mkdir -p "$NODE_PREFIX"
  "${SUDO[@]}" cp -a "$tmp/." "$NODE_PREFIX/"
  "${SUDO[@]}" ln -sfn "$NODE_PREFIX/bin/node" /usr/local/bin/node
  "${SUDO[@]}" ln -sfn "$NODE_PREFIX/bin/npm" /usr/local/bin/npm
  "${SUDO[@]}" ln -sfn "$NODE_PREFIX/bin/npx" /usr/local/bin/npx
  "${SUDO[@]}" ln -sfn "$NODE_PREFIX/bin/corepack" /usr/local/bin/corepack
  rm -rf "$tmp"
fi

# Login shells (install and start) source this. /usr/local/bin must win over
# any older Node already on PATH.
"${SUDO[@]}" tee /etc/profile.d/cursor-node.sh >/dev/null <<'EOF'
export PATH="/usr/local/bin:${PATH}"
EOF

ORIGINAL_PATH="$PATH"
export PATH="/usr/local/bin:${PATH}"
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
hash -r

if [[ "$(/usr/local/bin/pnpm -v 2>/dev/null || true)" != "$PNPM_VERSION" ]]; then
  "${SUDO[@]}" /usr/local/bin/corepack enable
  "${SUDO[@]}" /usr/local/bin/corepack prepare "pnpm@${PNPM_VERSION}" --activate
fi

# Some login shells load nvm after /etc/profile.d, so prepend again at the
# end of ~/.bashrc. Stock Ubuntu returns early for non-interactive shells;
# those shells keep the /usr/local/bin entry from profile.d.
MARKER="# cursor-cloud-node"
if [[ -f "${HOME}/.bashrc" ]] && ! grep -q "$MARKER" "${HOME}/.bashrc"; then
  cat >>"${HOME}/.bashrc" <<EOF

${MARKER}
export PATH="/usr/local/bin:\${PATH}"
EOF
fi

# Non-login shells inherit a PATH that can list an older Node first
# (/exec-daemon/node or nvm). Link the toolchain into the earliest such
# directory that does not already contain a real node binary.
if [[ "$(PATH="$ORIGINAL_PATH" node -v 2>/dev/null || true)" != "v${NODE_VERSION}" ]]; then
  IFS=':' read -r -a path_dirs <<<"$ORIGINAL_PATH"
  for dir in "${path_dirs[@]}"; do
    [[ -n "$dir" && -d "$dir" ]] || continue
    if [[ -e "$dir/node" && ! -L "$dir/node" ]]; then
      continue
    fi
    for tool in node npm npx corepack pnpm pnpx; do
      if [[ -e "/usr/local/bin/$tool" ]]; then
        "${SUDO[@]}" ln -sfn "/usr/local/bin/$tool" "$dir/$tool"
      fi
    done
    break
  done
fi

if [[ "$(PATH="$ORIGINAL_PATH" node -v 2>/dev/null || true)" != "v${NODE_VERSION}" ]]; then
  echo "Node ${NODE_VERSION} is installed at /usr/local/bin/node but is not first on PATH." >&2
  echo "Run: export PATH=\"/usr/local/bin:\$PATH\"" >&2
  exit 1
fi

cd "$ROOT"
pnpm install --frozen-lockfile
