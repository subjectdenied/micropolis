# Micropolis

Lightweight WordPress language switcher plugin. No full i18n framework needed — just point each language to a page.

## What it does

- Adds a dropdown language switcher to your site header (flag + language code)
- Auto-detects the visitor's browser language and redirects to the matching page
- Visitors can override by picking a different language from the dropdown
- Stores the visitor's choice in localStorage

## How it works

Each language entry maps to a WordPress page. When a visitor selects a language, they're taken to that page. This is intentionally simple — no translation engine, no duplicate content, no complex URL structures. Just a jump menu.

**Example setup:**
| Code | Page | Purpose |
|------|------|---------|
| `de` | `/` (homepage) | German content |
| `en` | `/english-information/` | English summary page |

## Installation

1. Download or clone this repo into `wp-content/plugins/micropolis/`
2. Activate the plugin in WordPress admin
3. Go to **Settings → Micropolis** to configure your languages

## Settings

- **Language Code** — ISO 639-1 code (e.g., `de`, `en`, `fr`)
- **Page Slug** — the slug of the WordPress page for this language
- Slugs are validated on save — the plugin checks that the page exists
- Add/remove language entries as needed

## Features

- Works with any WordPress theme (Divi, block themes, classic themes)
- Responsive — adapts for desktop, tablet, and mobile
- Hides automatically when Divi's search overlay opens
- Flag emojis generated from language codes — no image assets needed
- Accessible — proper ARIA attributes, keyboard support (Escape to close)
- Lightweight — no external dependencies, no jQuery on the frontend

## Requirements

- WordPress 6.0+
- PHP 7.4+

## License

GPL-2.0+
