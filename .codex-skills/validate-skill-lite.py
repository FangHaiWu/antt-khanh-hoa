#!/usr/bin/env python3
import re
import sys
from pathlib import Path

MAX_SKILL_NAME_LENGTH = 64
ALLOWED_KEYS = {"name", "description", "license", "allowed-tools", "metadata"}


def parse_frontmatter(text: str):
    match = re.match(r"^---\n(.*?)\n---", text, re.DOTALL)
    if not match:
        return None, "Invalid frontmatter format"

    frontmatter = {}
    for raw_line in match.group(1).splitlines():
        line = raw_line.strip()
        if not line:
            continue
        if ":" not in line:
            return None, f"Invalid frontmatter line: {raw_line}"
        key, value = line.split(":", 1)
        frontmatter[key.strip()] = value.strip().strip('"').strip("'")
    return frontmatter, None


def validate_skill(skill_path: Path):
    skill_md = skill_path / "SKILL.md"
    if not skill_md.exists():
        return False, "SKILL.md not found"

    content = skill_md.read_text()
    if not content.startswith("---"):
        return False, "No YAML frontmatter found"

    frontmatter, error = parse_frontmatter(content)
    if error:
        return False, error

    unexpected_keys = set(frontmatter.keys()) - ALLOWED_KEYS
    if unexpected_keys:
        allowed = ", ".join(sorted(ALLOWED_KEYS))
        unexpected = ", ".join(sorted(unexpected_keys))
        return False, (
            f"Unexpected key(s) in SKILL.md frontmatter: {unexpected}. "
            f"Allowed properties are: {allowed}"
        )

    name = frontmatter.get("name", "").strip()
    description = frontmatter.get("description", "").strip()

    if not name:
        return False, "Missing 'name' in frontmatter"
    if not description:
        return False, "Missing 'description' in frontmatter"

    if not re.match(r"^[a-z0-9-]+$", name):
        return False, (
            f"Name '{name}' should be hyphen-case "
            "(lowercase letters, digits, and hyphens only)"
        )
    if name.startswith("-") or name.endswith("-") or "--" in name:
        return False, (
            f"Name '{name}' cannot start/end with hyphen "
            "or contain consecutive hyphens"
        )
    if len(name) > MAX_SKILL_NAME_LENGTH:
        return False, (
            f"Name is too long ({len(name)} characters). "
            f"Maximum is {MAX_SKILL_NAME_LENGTH} characters."
        )

    if "<" in description or ">" in description:
        return False, "Description cannot contain angle brackets (< or >)"
    if len(description) > 1024:
        return False, (
            f"Description is too long ({len(description)} characters). "
            "Maximum is 1024 characters."
        )

    return True, "Skill is valid!"


def main():
    if len(sys.argv) != 2:
        print("Usage: validate-skill-lite.py <skill_directory>")
        sys.exit(1)

    valid, message = validate_skill(Path(sys.argv[1]))
    print(message)
    sys.exit(0 if valid else 1)


if __name__ == "__main__":
    main()
