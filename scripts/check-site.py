#!/usr/bin/env python3
"""Validate local site references and accessibility contracts without dependencies."""

from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1]
SKIPPED_SCHEMES = {"data", "javascript", "mailto", "tel", "blob"}
GENERIC_ARIA_TAGS = {"div", "span"}


class SiteParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.references: list[tuple[str, str, str]] = []
        self.generic_aria: list[tuple[str, str]] = []
        self.menu_buttons: list[dict[str, str | None]] = []
        self.menu_navs: list[dict[str, str | None]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        for attribute in ("href", "src", "action", "poster"):
            value = values.get(attribute)
            if value:
                self.references.append((tag, attribute, value))

        if tag in GENERIC_ARIA_TAGS and values.get("aria-label") and not values.get("role"):
            self.generic_aria.append((tag, values["aria-label"] or ""))

        if "data-menu-toggle" in values:
            self.menu_buttons.append(values)
        if "data-site-nav" in values:
            self.menu_navs.append(values)


def local_target_exists(source: Path, raw_value: str) -> bool:
    parsed = urlsplit(raw_value)
    if parsed.scheme in SKIPPED_SCHEMES or parsed.netloc:
        return True
    if not parsed.path or raw_value.startswith("#"):
        return True

    relative = unquote(parsed.path)
    target = ROOT / relative.lstrip("/") if relative.startswith("/") else source.parent / relative
    candidates = [target]
    if relative.endswith("/"):
        candidates.append(target / "index.html")
    if not target.suffix:
        candidates.extend((Path(f"{target}.html"), target / "index.html"))
    return any(candidate.exists() for candidate in candidates)


def main() -> int:
    errors: list[str] = []
    html_files = [
        path for path in ROOT.rglob("*.html")
        if ".git" not in path.parts and ".netlify" not in path.parts
    ]

    for path in html_files:
        relative = path.relative_to(ROOT)
        source = path.read_text(encoding="utf-8", errors="replace")
        parser = SiteParser()
        parser.feed(source)

        for tag, attribute, value in parser.references:
            if not local_target_exists(path, value):
                errors.append(f"{relative}: missing {tag} {attribute} target {value}")

        for tag, label in parser.generic_aria:
            errors.append(f'{relative}: <{tag}> aria-label "{label}" needs a semantic role')

        if parser.menu_buttons or parser.menu_navs:
            if len(parser.menu_buttons) != 1 or len(parser.menu_navs) != 1:
                errors.append(f"{relative}: expected one mobile menu button and navigation")
            else:
                button = parser.menu_buttons[0]
                nav = parser.menu_navs[0]
                if button.get("aria-controls") != "primary-navigation":
                    errors.append(f"{relative}: menu button must control primary-navigation")
                if nav.get("id") != "primary-navigation":
                    errors.append(f"{relative}: mobile navigation needs id primary-navigation")

        lowered = source.lower()
        if "user-scalable=no" in lowered or "maximum-scale=1" in lowered:
            errors.append(f"{relative}: browser zoom must remain enabled")

    shared_script = (ROOT / "assets/js/main.js").read_text(encoding="utf-8")
    if 'isOpen ? "Close navigation" : "Open navigation"' not in shared_script:
        errors.append("assets/js/main.js: menu accessible label state is missing")

    if errors:
        print("Site validation failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print(f"Site validation passed for {len(html_files)} HTML files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
