#!/usr/bin/env python3
"""
gen-mockups.py — GuideHub365 mock screenshot generator
=======================================================
Generates placeholder PNG screenshots for all guide steps defined in GUIDE_STEPS.
Output goes to public/screenshots/<guide-id>/<step-name>.png

Usage:
    pip install pillow
    python scripts/gen-mockups.py

Set environment variable OVERWRITE=1 to regenerate existing files.

NOTE: These are mock screenshots used for development/demo only.
Replace with real M365 screenshots using scripts/take-screenshots.js + Playwright.
"""

import os
import sys
import math

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("ERROR: Pillow not installed. Run: pip install pillow")
    sys.exit(1)

# -----------------------------------------------------------------------
# Guide steps: { guide_id: [ (step_name, step_label, hex_color), ... ] }
# -----------------------------------------------------------------------
GUIDE_STEPS = {
    "setup-mfa": [
        ("security-settings",   "Sikkerhetsinnstillinger",         "#6366F1"),
        ("qr-code",             "Skann QR-kode med Authenticator", "#8B5CF6"),
        ("verify-code",         "Verifiser engangskode",            "#7C3AED"),
        ("mfa-complete",        "MFA aktivert",                     "#059669"),
    ],
    "out-of-office": [
        ("file-menu",           "Fil-menyen i Outlook",             "#0078D4"),
        ("automatic-replies",   "Automatiske svar",                 "#106EBE"),
        ("date-range",          "Angi datoperiode",                 "#2B88D8"),
        ("message-box",         "Skriv fraværsmelding",             "#0091A1"),
    ],
    "email-signature": [
        ("outlook-settings",    "Innstillinger i Outlook",          "#0078D4"),
        ("signature-panel",     "Signaturpanel",                    "#106EBE"),
        ("create-signature",    "Opprett ny signatur",              "#2B88D8"),
        ("set-default",         "Angi som standard",                "#0091A1"),
    ],
    "shared-mailbox": [
        ("add-account",         "Legg til konto",                   "#0078D4"),
        ("open-another",        "Åpne annen brukers postboks",      "#106EBE"),
        ("find-mailbox",        "Finn delt postboks",               "#2B88D8"),
        ("access-granted",      "Tilgang innvilget",                "#059669"),
    ],
    "install-office": [
        ("portal-home",         "Office 365 Portal",                "#D83B01"),
        ("install-apps",        "Installer Office-apper",           "#B7410E"),
        ("download-start",      "Last ned starter",                 "#E97048"),
        ("run-installer",       "Kjør installatøren",               "#107C41"),
        ("installation-done",   "Installasjon fullført",            "#059669"),
    ],
    "password-reset": [
        ("login-page",          "Microsoft-innloggingsside",        "#0078D4"),
        ("forgot-password",     "Glemt passord?",                   "#106EBE"),
        ("verify-identity",     "Bekreft identitet",                "#2B88D8"),
        ("new-password",        "Nytt passord",                     "#7C3AED"),
        ("reset-complete",      "Passord tilbakestilt",             "#059669"),
    ],
    "onedrive-sync": [
        ("onedrive-tray",       "OneDrive i systemstatusfeltet",    "#0078D4"),
        ("sign-in-onedrive",    "Logg inn på OneDrive",             "#106EBE"),
        ("choose-folders",      "Velg mapper å synkronisere",       "#2B88D8"),
        ("sync-active",         "Synkronisering aktiv",             "#059669"),
    ],
    "teams-first-meeting": [
        ("teams-calendar",      "Kalender i Teams",                 "#6264A7"),
        ("new-meeting",         "Nytt møte",                        "#464775"),
        ("invite-people",       "Inviter deltakere",                "#7B83EB"),
        ("join-meeting",        "Bli med i møtet",                  "#059669"),
    ],
    "onedrive-save": [
        ("save-as-dialog",      "Lagre som-dialog",                 "#0078D4"),
        ("choose-onedrive",     "Velg OneDrive",                    "#106EBE"),
        ("pick-folder",         "Velg mappe",                       "#2B88D8"),
        ("file-saved",          "Fil lagret i skyen",               "#059669"),
    ],
    "outlook-setup-pc": [
        ("start-menu-outlook",  "Start-meny — søk etter Outlook",   "#0078D4"),
        ("outlook-email-input", "Skriv inn e-postadresse",          "#106EBE"),
        ("exchange-detect",     "Exchange-konto oppdaget",          "#2B88D8"),
        ("account-setup-done",  "Konto konfigurert",                "#059669"),
    ],
}

# -----------------------------------------------------------------------
# Generator
# -----------------------------------------------------------------------
W, H = 1280, 800
OVERWRITE = os.environ.get("OVERWRITE", "0") == "1"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT  = os.path.dirname(SCRIPT_DIR)
OUTPUT_DIR = os.path.join(REPO_ROOT, "public", "screenshots")


def hex_to_rgb(h: str):
    h = h.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))


def lighten(rgb, factor=0.88):
    return tuple(int(c + (255 - c) * factor) for c in rgb)


def draw_window_chrome(draw: ImageDraw.ImageDraw, bg_rgb):
    """Fake browser/app title bar at the top."""
    bar_h = 42
    bar_color = tuple(int(c * 0.75) for c in bg_rgb)
    draw.rectangle([0, 0, W, bar_h], fill=bar_color)
    # Traffic-light dots
    for x, dot_color in [(18, (255, 95, 86)), (40, (255, 189, 46)), (62, (39, 201, 63))]:
        draw.ellipse([x - 7, bar_h // 2 - 7, x + 7, bar_h // 2 + 7], fill=dot_color)
    # URL bar
    draw.rounded_rectangle([120, 8, W - 120, bar_h - 8], radius=6, fill=(255, 255, 255, 40))


def draw_text_centered(draw: ImageDraw.ImageDraw, text: str, y: int, font_size: int,
                        color=(255, 255, 255), bold=False):
    """Draw text centered horizontally — uses default font (no TTF needed)."""
    # PIL default font has no bold/size variant, so we tile characters for emphasis
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size) if bold \
               else ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", font_size)
    except OSError:
        font = ImageFont.load_default()

    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) // 2, y), text, fill=color, font=font)


def make_screenshot(guide_id: str, step_name: str, step_label: str, accent_hex: str):
    out_dir = os.path.join(OUTPUT_DIR, guide_id)
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, f"{step_name}.png")

    if os.path.exists(out_path) and not OVERWRITE:
        return False  # skipped

    accent_rgb = hex_to_rgb(accent_hex)
    bg_rgb     = lighten(accent_rgb, 0.92)

    img  = Image.new("RGB", (W, H), bg_rgb)
    draw = ImageDraw.Draw(img)

    # Subtle grid pattern
    grid_color = tuple(max(0, c - 12) for c in bg_rgb)
    for x in range(0, W, 40):
        draw.line([(x, 0), (x, H)], fill=grid_color, width=1)
    for y in range(0, H, 40):
        draw.line([(0, y), (W, y)], fill=grid_color, width=1)

    draw_window_chrome(draw, accent_rgb)

    # Centre card
    card_w, card_h = 520, 200
    cx, cy = W // 2, H // 2
    draw.rounded_rectangle(
        [cx - card_w // 2, cy - card_h // 2, cx + card_w // 2, cy + card_h // 2],
        radius=16, fill=(255, 255, 255)
    )

    # Accent circle
    circle_r = 36
    draw.ellipse(
        [cx - circle_r, cy - card_h // 2 + 28, cx + circle_r, cy - card_h // 2 + 28 + 2 * circle_r],
        fill=accent_rgb
    )

    # Step label
    draw_text_centered(draw, step_label, cy - card_h // 2 + 28 + 2 * circle_r + 18,
                       font_size=20, color=tuple(int(c * 0.18) for c in (1, 1, 1)), bold=True)

    # Guide ID subtitle
    draw_text_centered(draw, f"GuideHub365 · {guide_id}",
                       cy - card_h // 2 + 28 + 2 * circle_r + 52,
                       font_size=13, color=(120, 120, 140))

    img.save(out_path, "PNG", optimize=True)
    return True  # created


def main():
    created = 0
    skipped = 0
    for guide_id, steps in GUIDE_STEPS.items():
        for step_name, step_label, accent_hex in steps:
            made = make_screenshot(guide_id, step_name, step_label, accent_hex)
            if made:
                created += 1
                print(f"  ✓ {guide_id}/{step_name}.png")
            else:
                skipped += 1

    print(f"\nDone: {created} created, {skipped} skipped (set OVERWRITE=1 to regenerate).")
    print(f"Output: {OUTPUT_DIR}/")


if __name__ == "__main__":
    main()
