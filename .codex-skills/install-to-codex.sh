#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="${CODEX_HOME:-$HOME/.codex}/skills"

mkdir -p "$TARGET_DIR"

for skill_dir in "$ROOT_DIR"/antt-*; do
  if [[ ! -d "$skill_dir" ]]; then
    continue
  fi

  skill_name="$(basename "$skill_dir")"
  ln -sfn "$skill_dir" "$TARGET_DIR/$skill_name"
  printf 'Linked %s -> %s\n' "$skill_name" "$TARGET_DIR/$skill_name"
done
