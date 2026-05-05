#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VALIDATOR="${CODEX_HOME:-$HOME/.codex}/skills/.system/skill-creator/scripts/quick_validate.py"
FALLBACK_VALIDATOR="$ROOT_DIR/validate-skill-lite.py"
PYTHON_BIN="${PYTHON_BIN:-python3}"

if [[ ! -f "$VALIDATOR" ]]; then
  echo "Validator not found at $VALIDATOR" >&2
  exit 1
fi

if "$PYTHON_BIN" -c "import yaml" >/dev/null 2>&1; then
  VALIDATOR_CMD=("$PYTHON_BIN" "$VALIDATOR")
else
  echo "PyYAML not found; using fallback validator at $FALLBACK_VALIDATOR"
  VALIDATOR_CMD=("$PYTHON_BIN" "$FALLBACK_VALIDATOR")
fi

for skill_dir in "$ROOT_DIR"/antt-*; do
  if [[ ! -d "$skill_dir" ]]; then
    continue
  fi

  printf 'Validating %s\n' "$(basename "$skill_dir")"
  "${VALIDATOR_CMD[@]}" "$skill_dir"
done
