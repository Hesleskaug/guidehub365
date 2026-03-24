#!/usr/bin/env python3
"""
gen-mockups.py — GuideHub365 annotated mock screenshot generator
================================================================
Generates 1280×800 PNG screenshots for every guide step with:
  - Realistic M365-style UI backgrounds (Outlook / Teams / OneDrive / Portal / Windows)
  - A clean red arrow pointing directly at the click target — NO text overlay.
    The guide step description in App.jsx explains what to do; the arrow just shows WHERE.

Screenshot names and guide IDs MUST match exactly what App.jsx references
in each guide's steps array (screenshot: "name", guideId: "guide-id").

Usage:
    pip install pillow
    python scripts/gen-mockups.py            # skip existing files
    OVERWRITE=1 python scripts/gen-mockups.py  # regenerate all

Output: public/screenshots/<guide-id>/<step-name>.png

Step definition format:
    (step_name, step_label, ui_type, click_x, click_y, click_label)

    ui_type:     "outlook" | "teams" | "onedrive" | "portal" | "windows"
    click_x/y:   pixel coords in 1280×800 where the arrow tip should point
    click_label: unused (kept for documentation only — arrow has no text)

HOW TO ADD NEW SCREENSHOTS:
  1. Add steps to GUIDE_STEPS below (guide_id must match App.jsx guideId)
  2. Run: OVERWRITE=1 python scripts/gen-mockups.py
  3. Commit: git add public/screenshots && git commit -m "Add screenshots for <guide>"
  4. For real M365 screenshots: use scripts/take-screenshots.js (Playwright)
     then add annotation overlay with scripts/annotate.py (coming soon)
"""

import os, sys, math
try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("ERROR: Pillow ikke installert. Kjør: pip install pillow")
    sys.exit(1)

W, H = 1280, 800
OVERWRITE = os.environ.get("OVERWRITE", "0") == "1"
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT  = os.path.dirname(SCRIPT_DIR)
OUTPUT_DIR = os.path.join(REPO_ROOT, "public", "screenshots")

# ─── Colour palette ────────────────────────────────────────────────────────────
C = {
    "outlook_navy":  (0,   30,  60),
    "outlook_blue":  (0,  120, 212),
    "teams_purple":  (70,  72, 167),
    "onedrive_blue": (0,   99, 177),
    "portal_dark":   (16,  24,  40),
    "windows_bg":    (30,  30,  46),
    "panel":         (248,249,250),
    "white":         (255,255,255),
    "border":        (225,227,232),
    "text_dark":     (32,  31,  30),
    "text_mid":      (96, 100, 108),
    "text_light":    (180,182,186),
    "selected_blue": (237,246,255),
    "click_red":     (220,  38,  38),
    "click_ring":    (254, 202, 202),
    "arrow_red":     (185,  28,  28),
}

# ─── Guide steps ───────────────────────────────────────────────────────────────
# Key = guideId as used in App.jsx step definitions (screenshot path: /screenshots/<key>/<step_name>.png)
# Format: (step_name, step_label, ui_type, click_x, click_y, click_label)
GUIDE_STEPS = {

    # ── MFA OPPSETT (guideId in App.jsx steps = "mfa-setup") ──
    "mfa-setup": [
        ("steg-1-epost",                "Skriv inn e-postadresse",              "portal",  640, 400, "Skriv inn jobb-e-posten og klikk 'Neste'"),
        ("steg-2-passord",              "Skriv inn passord",                    "portal",  640, 440, "Skriv inn passordet og klikk 'Logg på'"),
        ("steg-3-sikre-konto",          "La oss sikre kontoen din",             "portal",  640, 520, "Klikk 'Neste' for å starte oppsett"),
        ("steg-4-installer-authenticator","Installer Microsoft Authenticator",  "portal",  640, 460, "Last ned appen og klikk 'Neste'"),
        ("steg-5-qr-kode",              "Skann QR-koden med appen",             "portal",  640, 410, "Hold telefonen over QR-koden for å skanne"),
        ("steg-6-godkjenn-varsel",      "Godkjenn varselet på telefonen",       "portal",  640, 480, "Åpne Authenticator og trykk 'Godkjenn'"),
        ("steg-7-fullfort",             "Sikkerhetsinformasjon er lagret",       "portal",  640, 530, "Klikk 'Ferdig' — MFA er nå aktivert"),
    ],

    # ── FRAVÆRSMELDING ──
    "out-of-office": [
        ("steg-1-innstillinger",        "Åpne innstillinger i Outlook",         "outlook", 1210, 24,  "Klikk på tannhjulet øverst til høyre"),
        ("steg-2-automatiske-svar",     "Finn Automatiske svar",                "outlook", 210, 310,  "Klikk 'E-post' → 'Automatiske svar'"),
        ("steg-3-slaa-paa",             "Aktiver automatiske svar",             "outlook", 450, 330,  "Slå på bryteren og velg datoperiode"),
        ("steg-4-skriv-melding",        "Skriv fraværsmeldingen din",           "outlook", 640, 480,  "Skriv meldingen i tekstfeltet"),
        ("steg-5-lagre",                "Lagre innstillingene",                 "outlook", 980, 710,  "Klikk 'Lagre' for å aktivere"),
    ],

    # ── E-POSTSIGNATUR ──
    "email-signature": [
        ("steg-1-innstillinger",        "Åpne innstillinger i Outlook",         "outlook", 1210, 24,  "Klikk på tannhjulet øverst til høyre"),
        ("steg-2-skriv-og-svar",        "Gå til Skriv og svar",                 "outlook", 210, 310,  "Klikk 'E-post' → 'Skriv og svar'"),
        ("steg-3-skriv-signatur",       "Lag ny signatur",                      "outlook", 490, 250,  "Klikk '+ Ny signatur' og skriv teksten"),
        ("steg-4-aktiver",              "Angi som standard",                    "outlook", 760, 540,  "Velg signaturen som standard for nye meldinger"),
        ("steg-5-lagre",                "Lagre signaturen",                     "outlook", 980, 710,  "Klikk 'Lagre'"),
    ],

    # ── DELT POSTKASSE ──
    "shared-mailbox": [
        ("steg-1-outlook-innboks",      "Åpne Outlook på nett",                 "outlook", 270, 145,  "Logg inn — du er nå i innboksen"),
        ("steg-2-hoyreklikk",           "Høyreklikk på mappenivået ditt",       "outlook", 270, 175,  "Høyreklikk på e-postadressen din i venstre meny"),
        ("steg-3-legg-til",             "Velg 'Legg til delt mappe'",           "outlook", 330, 320,  "Klikk 'Legg til delt mappe eller postkasse'"),
        ("steg-4-sok-postkasse",        "Søk etter den delte postkassen",       "outlook", 640, 380,  "Skriv inn navnet på den delte postkassen"),
        ("steg-5-ferdig",               "Delt postkasse er lagt til",           "outlook", 155, 280,  "Postkassen vises nå i venstre meny"),
    ],

    # ── INSTALLER OFFICE ──
    "install-office": [
        ("steg-1-portal",               "Logg inn på portal.office.com",        "portal",  640, 400,  "Skriv inn jobb-e-post og logg inn"),
        ("steg-2-installer-knapp",      "Klikk 'Installer Office'",             "portal",  1100, 72,  "Klikk knappen øverst til høyre"),
        ("steg-3-nedlasting",           "Velg Microsoft 365-apper",             "portal",  640, 380,  "Klikk 'Microsoft 365 Apps for business'"),
        ("steg-4-installer",            "Kjør installasjonsfilen",              "windows", 640, 460,  "Klikk 'Ja' i sikkerhetsadvarselen"),
        ("steg-5-aktiver",              "Logg inn og aktiver Office",           "portal",  640, 460,  "Logg inn med jobb-e-posten for å aktivere"),
    ],

    # ── PASSORD TILBAKESTILLING ──
    "password-reset": [
        ("steg-1-sspr",                 "Gå til tilbakestillingssiden",         "portal",  640, 460,  "Gå til aka.ms/sspr og skriv inn e-post"),
        ("steg-2-epost",                "Skriv inn e-postadressen din",         "portal",  640, 400,  "Skriv inn jobb-e-posten og klikk 'Neste'"),
        ("steg-3-bekreft-metode",       "Velg bekreftelsesmetode",              "portal",  640, 380,  "Velg SMS, e-post eller Authenticator-appen"),
        ("steg-4-skriv-kode",           "Skriv inn bekreftelseskoden",          "portal",  640, 420,  "Skriv inn koden du mottok og klikk 'Neste'"),
        ("steg-5-nytt-passord",         "Angi nytt passord",                    "portal",  640, 420,  "Skriv inn nytt passord to ganger"),
        ("steg-6-ferdig",               "Passord er endret",                    "portal",  640, 530,  "Klikk 'Logg inn' med det nye passordet"),
    ],

    # ── ONEDRIVE SYNKRONISERING ──
    "onedrive-sync": [
        ("steg-1-aapne",                "Finn OneDrive i systemstatusfeltet",   "windows", 1200, 754, "Klikk på sky-ikonet nede til høyre"),
        ("steg-2-logg-inn",             "Logg inn med jobbkontoen",             "portal",  640, 400,  "Skriv inn jobb-e-posten og klikk 'Logg på'"),
        ("steg-3-velg-mappe",           "Velg OneDrive-mappeposisjon",          "windows", 640, 460,  "Klikk 'Neste' for å godta standardplasseringen"),
        ("steg-4-synkroniserer",        "Filene synkroniseres",                 "windows", 1200, 754, "Blå sirkel betyr synkronisering pågår"),
        ("steg-5-utforsker",            "Finn filene i Windows Utforsker",      "windows", 640, 400,  "Klikk 'OneDrive – Bedriftsnavn' i venstre meny"),
    ],

    # ── TEAMS MØTE ──
    "teams-first-meeting": [
        ("steg-1-aapne-teams",          "Åpne Kalender i Teams",                "teams",   28,  440,  "Klikk på kalender-ikonet i venstre meny"),
        ("steg-2-se-motedetaljer",      "Klikk på møtet for detaljer",          "teams",   500, 300,  "Klikk på møtet i kalenderen"),
        ("steg-3-delta-klikk",          "Klikk 'Delta i møte'",                 "teams",   1120, 130, "Klikk den grønne 'Delta i møte'-knappen"),
        ("steg-4-sjekk-lyd-video",      "Sjekk lyd og kamera",                  "teams",   640, 500,  "Slå på/av mikrofon og kamera, klikk 'Delta nå'"),
        ("steg-5-inne-i-motet",         "Du er inne i møtet",                   "teams",   640, 750,  "Bruk kontrollene nederst for mikrofon og kamera"),
    ],

    # ── ONEDRIVE LAGRING ──
    "onedrive-save": [
        ("steg-1-systemtray",           "Finn OneDrive i systemstatusfeltet",   "windows", 1200, 754, "Klikk på det blå sky-ikonet"),
        ("steg-2-onedrive-mappe",       "Åpne OneDrive-mappen",                 "windows", 640, 460,  "Klikk 'Åpne OneDrive-mappen'"),
        ("steg-3-dra-fil",              "Dra filen inn i OneDrive-mappen",      "windows", 640, 400,  "Dra og slipp filen inn i mappen"),
        ("steg-4-synkroniserer",        "Filen lastes opp",                     "windows", 1200, 754, "Blå synk-pil vises — vent til den er ferdig"),
        ("steg-5-ferdig-synkronisert",  "Grønt hake — filen er trygt lagret",  "windows", 640, 380,  "Grønt hake-ikon bekrefter at opplasting er ferdig"),
    ],

    # ── OUTLOOK PÅ PC ──
    "outlook-setup-pc": [
        ("steg-1-portal",               "Gå til portal.office.com",             "portal",  640, 400,  "Logg inn med jobb-e-post"),
        ("steg-2-kjor-installasjon",    "Kjør installasjonsfilen",              "windows", 640, 460,  "Klikk 'Ja' i UAC-dialogen"),
        ("steg-3-installerer",          "Vent mens Office installeres",         "windows", 640, 400,  "Ikke lukk vinduet — tar 5–15 minutter"),
        ("steg-4-legg-til-konto",       "Åpne Outlook og legg til konto",       "outlook", 640, 380,  "Skriv inn jobb-e-posten og klikk 'Koble til'"),
        ("steg-5-logg-inn",             "Logg inn og godkjenn MFA",             "outlook", 640, 460,  "Godkjenn innloggingen i Authenticator-appen"),
        ("steg-6-ferdig-innboks",       "Outlook er klar — innboksen er åpen", "outlook", 270, 155,  "Innboksen din vises med e-poster"),
    ],
}

# ─── Font helpers ───────────────────────────────────────────────────────────────
FONT_PATHS = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
]

def load_font(size: int, bold=False):
    candidates = [p for p in FONT_PATHS if ("Bold" in p) == bold] + FONT_PATHS
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()

def text_w(draw, text, font):
    bb = draw.textbbox((0, 0), text, font=font)
    return bb[2] - bb[0]


# ─── UI renderers ────────────────────────────────────────────────────────────────

def draw_outlook_bg(draw, step_label):
    nav_w, topbar_h = 48, 48
    draw.rectangle([0, 0, W, topbar_h], fill=C["outlook_navy"])
    draw.rectangle([14, 14, 34, 34], fill=(255,255,255))
    draw.text((60, 15), "Outlook", fill=(255,255,255), font=load_font(15, bold=True))
    draw.rounded_rectangle([310, 10, 970, 38], radius=4, fill=(255,255,255,30))
    draw.text((320, 14), "Søk i e-post, kontakter og kalender", fill=(180,190,210), font=load_font(13))
    # Gear icon placeholder
    draw.rounded_rectangle([1190, 8, 1226, 40], radius=4, fill=(40,60,90))
    draw.text((1197, 12), "⚙", fill=(255,255,255), font=load_font(20))
    draw.ellipse([1233, 8, 1267, 40], fill=(0,140,80))
    draw.text((1239, 12), "ON", fill=(255,255,255), font=load_font(14, bold=True))

    draw.rectangle([0, topbar_h, nav_w, H], fill=C["outlook_navy"])
    for y, ch in [(72,"✉"),(112,"📅"),(152,"👤"),(192,"✓"),(232,"💬")]:
        draw.text((14, y), ch, fill=(180,200,220), font=load_font(18))

    sx = nav_w
    draw.rectangle([sx, topbar_h, sx+220, H], fill=(255,255,255))
    draw.rectangle([sx+220, topbar_h, sx+221, H], fill=C["border"])
    fb, fn = load_font(13, bold=True), load_font(13)
    draw.rounded_rectangle([sx+10, topbar_h+10, sx+210, topbar_h+38], radius=6, fill=C["outlook_blue"])
    draw.text((sx+48, topbar_h+16), "+ Ny e-post", fill=(255,255,255), font=fb)
    draw.text((sx+14, topbar_h+58), "FAVORITTER", fill=C["text_light"], font=load_font(10, bold=True))
    sel_y = topbar_h + 76
    draw.rectangle([sx+10, sel_y, sx+210, sel_y+26], fill=C["selected_blue"], outline=C["outlook_blue"])
    draw.text((sx+38, sel_y+4), "Innboks", fill=C["text_dark"], font=fb)
    draw.text((sx+183, sel_y+4), "12", fill=C["outlook_blue"], font=fb)
    draw.text((sx+38, sel_y+34), "Sendte elementer", fill=C["text_mid"], font=fn)
    draw.text((sx+14, sel_y+66), "MAPPER", fill=C["text_light"], font=load_font(10, bold=True))
    for i, (lbl, badge) in enumerate([("Innboks","12"),("Utkast","3"),("Sendte elementer",""),
                                       ("Slettede elementer",""),("Søppelpost","")]):
        iy = sel_y + 88 + i*30
        draw.text((sx+38, iy), lbl, fill=C["text_mid"], font=fn)
        if badge:
            draw.text((sx+183, iy), badge, fill=C["text_mid"], font=fn)

    lx = sx + 222
    draw.rectangle([lx, topbar_h, lx+360, H], fill=(255,255,255))
    draw.rectangle([lx+360, topbar_h, lx+361, H], fill=C["border"])
    draw.text((lx+14, topbar_h+14), "Innboks", fill=C["text_dark"], font=load_font(18, bold=True))
    draw.text((lx+14, topbar_h+50), "Fokusert", fill=C["outlook_blue"], font=fb)
    draw.rectangle([lx+14, topbar_h+68, lx+84, topbar_h+70], fill=C["outlook_blue"])
    draw.text((lx+100, topbar_h+50), "Annet", fill=C["text_mid"], font=fn)

    emails = [("IT-avdelingen","Viktig: Husk Outlook-innstillinger","09:15",True),
              ("Kari Nordmann","Møteinnkalling fredag kl 10","08:42",False),
              ("Microsoft 365","Ny oppdatering tilgjengelig","I går",False),
              ("Per Hansen","Prosjektrapport Q1 2026","Man",False)]
    avc = [(0,120,212),(107,70,193),(218,59,1),(0,164,120)]
    for i,(sender,subj,t,unread) in enumerate(emails):
        ey = topbar_h+80+i*72
        if unread:
            draw.ellipse([lx+8,ey+26,lx+16,ey+34], fill=C["outlook_blue"])
        draw.ellipse([lx+22,ey+14,lx+54,ey+46], fill=avc[i])
        draw.text((lx+31,ey+20), sender[:2].upper(), fill=(255,255,255), font=load_font(12,bold=True))
        draw.text((lx+62,ey+14), sender, fill=C["text_dark"], font=fb if unread else fn)
        draw.text((lx+62,ey+34), subj[:34], fill=C["text_mid"], font=fn)
        draw.text((lx+310,ey+14), t, fill=C["text_light"], font=load_font(11))
        draw.rectangle([lx,ey+70,lx+360,ey+71], fill=C["border"])

    rx = lx+362
    draw.rectangle([rx, topbar_h, W, H], fill=(248,249,250))
    draw.text((rx+80, H//2-20), "Velg en e-post for å lese", fill=C["text_light"], font=load_font(15))
    _draw_step_label(draw, step_label)


def draw_teams_bg(draw, step_label):
    nav_w, topbar_h = 68, 48
    draw.rectangle([0, 0, W, topbar_h], fill=C["teams_purple"])
    draw.text((84, 15), "Microsoft Teams", fill=(255,255,255), font=load_font(15, bold=True))
    draw.rounded_rectangle([320, 10, 900, 38], radius=4, fill=(255,255,255,25))
    draw.text((330, 14), "Søk", fill=(200,200,230), font=load_font(13))
    draw.rectangle([0, topbar_h, nav_w, H], fill=C["teams_purple"])
    for ico,lbl,ny in [("💬","Chat",360),("👥","Team",400),("📅","Kalender",440),("📁","Filer",480),("···","Mer",520)]:
        draw.text((22, ny), ico, fill=(200,200,240), font=load_font(20))
        draw.text((10, ny+24), lbl, fill=(200,200,240), font=load_font(10))
    mx = nav_w
    draw.rectangle([mx, topbar_h, W, H], fill=(255,255,255))
    draw.text((mx+20, topbar_h+16), "Mars 2026", fill=C["text_dark"], font=load_font(18, bold=True))
    draw.rounded_rectangle([W-160, topbar_h+10, W-20, topbar_h+38], radius=6, fill=C["teams_purple"])
    draw.text((W-138, topbar_h+16), "+ Nytt møte", fill=(255,255,255), font=load_font(13, bold=True))
    days = ["Man","Tir","Ons","Tor","Fre","Lør","Søn"]
    cw = (W-mx)//7
    for d,day in enumerate(days):
        draw.text((mx+d*cw+cw//2-10, topbar_h+60), day, fill=C["text_mid"], font=load_font(12, bold=True))
    draw.rectangle([mx, topbar_h+80, W, topbar_h+81], fill=C["border"])
    for row in range(4):
        for col in range(7):
            cx2 = mx+col*cw; cy2 = topbar_h+90+row*120
            draw.rectangle([cx2,cy2,cx2+cw-2,cy2+118], fill=(252,252,252))
            draw.rectangle([cx2,cy2,cx2+cw-2,cy2+1], fill=C["border"])
            if (row,col) in [(0,2),(1,4),(2,0)]:
                draw.rounded_rectangle([cx2+4,cy2+20,cx2+cw-6,cy2+80], radius=4, fill=(235,236,250))
                draw.text((cx2+8,cy2+26), "Møte", fill=C["teams_purple"], font=load_font(11))
    _draw_step_label(draw, step_label)


def draw_onedrive_bg(draw, step_label):
    topbar_h, nav_w = 50, 230
    draw.rectangle([0, 0, W, topbar_h], fill=C["onedrive_blue"])
    draw.text((20, 14), "OneDrive", fill=(255,255,255), font=load_font(16, bold=True))
    draw.rounded_rectangle([280, 10, 860, 40], radius=4, fill=(255,255,255,30))
    draw.text((292, 14), "Søk i Filer", fill=(180,200,230), font=load_font(13))
    draw.rectangle([0, topbar_h, nav_w, H], fill=(255,255,255))
    draw.rectangle([nav_w, topbar_h, nav_w+1, H], fill=C["border"])
    fn, fb = load_font(13), load_font(13, bold=True)
    for i,(lbl,sel) in enumerate([("Mine filer",True),("Delt med meg",False),("Nylig",False),("Papirkurv",False)]):
        ny = topbar_h+20+i*40
        if sel:
            draw.rectangle([0,ny-4,nav_w,ny+22], fill=C["selected_blue"])
        draw.text((20,ny), lbl, fill=C["onedrive_blue"] if sel else C["text_mid"], font=fb if sel else fn)
    gx = nav_w+20
    folders = ["Dokumenter","Bilder","Delt med team","Prosjekter 2026"]
    fc = [(0,120,212),(107,70,193),(218,59,1),(0,164,120)]
    for i,(folder,col) in enumerate(zip(folders,fc)):
        fx = gx+(i%3)*240; fy = topbar_h+60+(i//3)*140
        draw.rounded_rectangle([fx,fy,fx+220,fy+120], radius=8, fill=(255,255,255), outline=C["border"])
        draw.rounded_rectangle([fx+16,fy+16,fx+56,fy+56], radius=6, fill=tuple(int(c*.15+240) for c in col))
        draw.text((fx+22,fy+24), "📁", fill=col, font=load_font(22))
        draw.text((fx+14,fy+72), folder, fill=C["text_dark"], font=load_font(13, bold=True))
        draw.text((fx+14,fy+92), "14 elementer", fill=C["text_mid"], font=load_font(11))
    _draw_step_label(draw, step_label)


def draw_portal_bg(draw, step_label):
    topbar_h = 50
    draw.rectangle([0, 0, W, topbar_h], fill=C["portal_dark"])
    draw.text((20, 14), "Microsoft 365", fill=(255,255,255), font=load_font(16, bold=True))
    draw.rounded_rectangle([320, 10, 860, 40], radius=4, fill=(255,255,255,20))
    draw.text((332, 14), "Søk", fill=(160,170,190), font=load_font(13))
    draw.ellipse([1230, 8, 1262, 40], fill=(0,140,80))
    draw.text((1236, 12), "MH", fill=(255,255,255), font=load_font(13, bold=True))
    draw.rectangle([0, topbar_h, W, H], fill=(245,247,250))
    draw.text((60, topbar_h+30), "God morgen, Marius", fill=C["text_dark"], font=load_font(22, bold=True))
    apps = [("Outlook","✉",(0,120,212)),("Teams","💬",(70,72,167)),("Word","W",(42,86,154)),
            ("Excel","X",(33,115,70)),("PowerPoint","P",(196,83,28)),("OneDrive","☁",(0,99,177)),
            ("SharePoint","S",(2,120,91)),("OneNote","N",(122,63,162))]
    for i,(name,ico,col) in enumerate(apps):
        ax=60+(i%4)*280; ay=topbar_h+100+(i//4)*160
        draw.rounded_rectangle([ax,ay,ax+240,ay+130], radius=10, fill=(255,255,255), outline=C["border"])
        draw.rounded_rectangle([ax+16,ay+16,ax+56,ay+56], radius=8, fill=col)
        draw.text((ax+24,ay+22), ico, fill=(255,255,255), font=load_font(22))
        draw.text((ax+16,ay+72), name, fill=C["text_dark"], font=load_font(14, bold=True))
    _draw_step_label(draw, step_label)


def draw_windows_bg(draw, step_label):
    draw.rectangle([0, 0, W, H-48], fill=(12, 12, 60))
    # Stars / dots for wallpaper feel
    import random; rng = random.Random(42)
    for _ in range(80):
        sx=rng.randint(0,W); sy=rng.randint(0,H-48); ss=rng.randint(1,2)
        draw.ellipse([sx,sy,sx+ss,sy+ss], fill=(255,255,255,120))
    # Taskbar
    draw.rectangle([0, H-48, W, H], fill=(20,20,20))
    draw.rounded_rectangle([10, H-42, 46, H-8], radius=4, fill=(40,40,40))
    draw.text((18, H-36), "⊞", fill=(255,255,255), font=load_font(20))
    draw.rounded_rectangle([60, H-40, 420, H-10], radius=4, fill=(40,40,40))
    draw.text((74, H-33), "🔍  Søk", fill=(160,160,160), font=load_font(13))
    draw.text((W-82, H-37), "09:15", fill=(220,220,220), font=load_font(12))
    draw.text((W-90, H-22), "24.03.2026", fill=(180,180,180), font=load_font(10))
    # Tray icons
    draw.text((W-178, H-36), "☁", fill=(100,160,255), font=load_font(18))  # OneDrive
    # Dialog
    dw,dh=560,340; dx=(W-dw)//2; dy=(H-48-dh)//2
    draw.rounded_rectangle([dx+4,dy+4,dx+dw+4,dy+dh+4], radius=10, fill=(0,0,0,40))
    draw.rounded_rectangle([dx,dy,dx+dw,dy+dh], radius=10, fill=(255,255,255))
    draw.rectangle([dx,dy,dx+dw,dy+46], fill=(0,99,177))
    draw.text((dx+18,dy+13), "Microsoft 365 — Installasjon", fill=(255,255,255), font=load_font(14, bold=True))
    draw.text((dx+44,dy+72), "Fortsette med installasjon?", fill=C["text_dark"], font=load_font(16, bold=True))
    draw.text((dx+44,dy+108), "Publisher: Microsoft Corporation", fill=C["text_mid"], font=load_font(12))
    draw.rounded_rectangle([dx+340,dy+260,dx+460,dy+298], radius=6, fill=(0,99,177))
    draw.text((dx+374,dy+270), "Ja", fill=(255,255,255), font=load_font(14, bold=True))
    draw.rounded_rectangle([dx+100,dy+260,dx+220,dy+298], radius=6, fill=(255,255,255), outline=C["border"])
    draw.text((dx+130,dy+270), "Avbryt", fill=C["text_dark"], font=load_font(14))
    _draw_step_label(draw, step_label)


UI_RENDERERS = {
    "outlook":  draw_outlook_bg,
    "teams":    draw_teams_bg,
    "onedrive": draw_onedrive_bg,
    "portal":   draw_portal_bg,
    "windows":  draw_windows_bg,
}

def _draw_step_label(draw, text):
    draw.rectangle([0, H-32, W, H], fill=(230,232,238))
    draw.text((16, H-24), f"GuideHub365 · {text}", fill=C["text_mid"], font=load_font(12))


# ─── Click annotation ────────────────────────────────────────────────────────────

def draw_click_annotation(draw, cx, cy, label=None):
    """
    Draw a clean arrow pointing directly at the click target.
    No text — the guide step instructions explain what to do.
    Arrow tail starts ~130px away at a diagonal, arrowhead sits on the target.
    A subtle highlight ring marks the exact click point.
    """
    cx = max(20, min(W - 20, cx))
    cy = max(20, min(H - 60, cy))

    ARROW_COLOR  = (220, 38, 38)    # red
    ARROW_W      = 5                # line thickness
    HEAD_LEN     = 22               # arrowhead arm length
    HEAD_ANGLE   = 0.42             # arrowhead spread (radians)
    TAIL_DIST    = 130              # how far the tail is from tip
    RING_R       = 14               # highlight ring radius

    # Choose tail direction: prefer upper-right, but avoid edges
    margin = 80
    if cx + TAIL_DIST < W - margin:
        tail_dx, tail_dy = 1, -1   # upper-right
    else:
        tail_dx, tail_dy = -1, -1  # upper-left

    # Normalize tail direction
    mag = math.sqrt(tail_dx**2 + tail_dy**2)
    tail_dx /= mag; tail_dy /= mag

    tx = int(cx + tail_dx * TAIL_DIST)
    ty = int(cy + tail_dy * TAIL_DIST)
    # Clamp tail inside image
    tx = max(margin // 2, min(W - margin // 2, tx))
    ty = max(margin // 2, min(H - 60, ty))

    # Subtle glow ring at click point
    for r, alpha in [(RING_R + 10, (255, 180, 180)), (RING_R + 4, (255, 130, 130))]:
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=alpha)

    # Filled red dot at tip
    dot_r = 8
    draw.ellipse([cx - dot_r, cy - dot_r, cx + dot_r, cy + dot_r],
                 fill=ARROW_COLOR, outline=(255, 255, 255), width=2)

    # Arrow shaft (tip → tail direction, stop just at the dot edge)
    angle = math.atan2(ty - cy, tx - cx)
    shaft_start_x = int(cx + dot_r * math.cos(angle))
    shaft_start_y = int(cy + dot_r * math.sin(angle))
    draw.line([(shaft_start_x, shaft_start_y), (tx, ty)],
              fill=ARROW_COLOR, width=ARROW_W)

    # Arrowhead (V-shape at tail end, pointing back toward tip)
    back_angle = math.atan2(cy - ty, cx - tx)   # direction: tail → tip
    for side in [HEAD_ANGLE, -HEAD_ANGLE]:
        hx = int(tx + HEAD_LEN * math.cos(back_angle + side))
        hy = int(ty + HEAD_LEN * math.sin(back_angle + side))
        draw.line([(tx, ty), (hx, hy)], fill=ARROW_COLOR, width=ARROW_W)


# ─── Main ────────────────────────────────────────────────────────────────────────

def make_screenshot(guide_id, step_name, step_label, ui_type, click_x, click_y, click_label):
    out_dir = os.path.join(OUTPUT_DIR, guide_id)
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, f"{step_name}.png")
    if os.path.exists(out_path) and not OVERWRITE:
        return False
    img  = Image.new("RGB", (W,H), C["white"])
    draw = ImageDraw.Draw(img)
    UI_RENDERERS.get(ui_type, draw_portal_bg)(draw, step_label)
    draw_click_annotation(draw, click_x, click_y, click_label)
    img.save(out_path, "PNG", optimize=True)
    return True


def main():
    created = skipped = 0
    for guide_id, steps in GUIDE_STEPS.items():
        for step in steps:
            step_name, step_label, ui_type, cx, cy, click_label = step
            made = make_screenshot(guide_id, step_name, step_label, ui_type, cx, cy, click_label)
            if made:
                created += 1
                print(f"  ✓ {guide_id}/{step_name}.png  ({ui_type}) click=({cx},{cy})")
            else:
                skipped += 1
    print(f"\nFerdig: {created} generert, {skipped} hoppet over (OVERWRITE=1 for å regenerere).")
    print(f"Output: {OUTPUT_DIR}/")

if __name__ == "__main__":
    main()
