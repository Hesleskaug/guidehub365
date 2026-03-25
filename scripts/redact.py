#!/usr/bin/env python3
"""
redact.py — Fjerner tenant-spesifikk data fra M365-skjermbilder.

Strategi (to lag):
  1. Fast profil-sone: øverst til høyre viser alltid brukerens navn/avatar
     i alle M365-apper — den blures alltid, uavhengig av innhold.
  2. OCR-tekstgjenkjenning: scanner hele bildet med pytesseract, finner
     tekstregioner som inneholder e-postadresser eller tenantdomenet,
     og blurer dem individuelt.
"""

import glob
import os
import re
import sys
from PIL import Image, ImageFilter

# ------------------------------------------------------------------
# Konfigurasjon
# ------------------------------------------------------------------

# Tenantdomene og e-postprefiks (settes via env-var i GitHub Actions)
TENANT_DOMAIN     = os.environ.get('M365_TENANT_DOMAIN', 'zfjyk.onmicrosoft.com')
SCREENSHOTS_EMAIL = os.environ.get('M365_EMAIL', '')

# Regex-mønstre — alle treff blures
REDACT_PATTERNS = [
    r'\b[\w.+\-]+@[\w\-]+\.[\w.\-]+\b',   # e-postadresser generelt
    re.escape(TENANT_DOMAIN),               # tenantdomenet
    re.escape(TENANT_DOMAIN.split('.')[0]), # kort tenantprefiks (f.eks. "zfjyk")
]
if SCREENSHOTS_EMAIL:
    REDACT_PATTERNS.append(re.escape(SCREENSHOTS_EMAIL.split('@')[0]))

# Fast profil-sone (px) for 1280x800 skjermbilder.
# M365-apper viser alltid brukeravatar/navn øverst til høyre.
PROFILE_ZONES = {
    'default': (1105, 0, 1280, 62),   # Outlook, OneDrive, M365.com
    'teams':   (1170, 0, 1280, 55),   # Teams (litt trangere topplinje)
    'entra':   (1090, 0, 1280, 62),   # Entra ID / admin-senter
}

BLUR_RADIUS = 18


# ------------------------------------------------------------------
# Hjelpefunksjoner
# ------------------------------------------------------------------

def detect_app(path: str) -> str:
    p = path.lower()
    if 'teams' in p:
        return 'teams'
    if 'entra' in p or 'admin' in p or 'mfa' in p:
        return 'entra'
    return 'default'


def blur_box(img: Image.Image, box: tuple, radius: int = BLUR_RADIUS) -> Image.Image:
    left, top, right, bottom = box
    left   = max(0, left);   top    = max(0, top)
    right  = min(img.width, right); bottom = min(img.height, bottom)
    if right <= left or bottom <= top:
        return img
    region  = img.crop((left, top, right, bottom))
    blurred = region.filter(ImageFilter.GaussianBlur(radius=radius))
    img.paste(blurred, (left, top))
    return img


def redact_with_ocr(img: Image.Image) -> tuple:
    try:
        import pytesseract
    except ImportError:
        return img, 0

    data = pytesseract.image_to_data(
        img, output_type=pytesseract.Output.DICT, config='--psm 11'
    )
    hits = 0
    for i, text in enumerate(data['text']):
        if not text.strip():
            continue
        for pattern in REDACT_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                x = data['left'][i];  y = data['top'][i]
                w = data['width'][i]; h = data['height'][i]
                if w > 0 and h > 0:
                    box = (x - 6, y - 3, x + w + 6, y + h + 6)
                    img = blur_box(img, box, radius=BLUR_RADIUS + 5)
                    hits += 1
                break
    return img, hits


# ------------------------------------------------------------------
# Hoved-redaksjonslogikk
# ------------------------------------------------------------------

def redact_screenshot(path: str, use_ocr: bool = True) -> None:
    img = Image.open(path).convert('RGB')
    app = detect_app(path)

    # Lag 1 — fast profil-sone
    img = blur_box(img, PROFILE_ZONES.get(app, PROFILE_ZONES['default']))

    # Lag 2 — OCR
    ocr_hits = 0
    if use_ocr:
        img, ocr_hits = redact_with_ocr(img)

    img.save(path, optimize=True)
    ocr_info = f', {ocr_hits} OCR-treff' if use_ocr else ''
    print(f'  ✓ {path} (profil-sone blured{ocr_info})')


def main() -> None:
    pattern  = os.path.join('public', 'screenshots', '**', '*.png')
    all_pngs = glob.glob(pattern, recursive=True)
    targets  = [p for p in all_pngs if not os.path.basename(p).startswith('_debug')]

    if not targets:
        print('[redact] Ingen skjermbilder funnet — hopper over.')
        sys.exit(0)

    use_ocr = False
    try:
        import pytesseract
        pytesseract.get_tesseract_version()
        use_ocr = True
        print('[redact] pytesseract tilgjengelig — OCR aktivert')
    except Exception:
        print('[redact] pytesseract ikke tilgjengelig — kun fast profil-sone blures')

    print(f'[redact] Behandler {len(targets)} skjermbilder...')
    errors = 0
    for path in sorted(targets):
        try:
            redact_screenshot(path, use_ocr=use_ocr)
        except Exception as e:
            print(f'  FEIL: {path}: {e}')
            errors += 1

    if errors:
        print(f'[redact] Ferdig med {errors} feil.')
        sys.exit(1)
    else:
        print('[redact] Ferdig — alle skjermbilder anonymisert.')


if __name__ == '__main__':
    main()
