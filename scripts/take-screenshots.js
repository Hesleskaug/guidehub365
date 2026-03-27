#!/usr/bin/env node

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EMAIL = process.env.M365_EMAIL;
const PASSWORD = process.env.M365_PASSWORD;

const VIEWPORT = { width: 1280, height: 800 };
const SESSION_FILE = path.join(__dirname, '../data/session.json');

// Validate credentials
if (!EMAIL || !PASSWORD) {
  console.error('Error: M365_EMAIL and M365_PASSWORD environment variables are required');
  process.exit(1);
}

// Shared waitFor selectors for common contexts
const W = {
  OWA_INBOX:    '[role="main"], [aria-label*="Inbox"], [aria-label*="Innboks"]',
  OWA_SETTINGS: '[role="dialog"], [class*="SettingsPane"], [class*="settingsPanel"]',
  OWA_COMPOSE:  '[role="dialog"], [class*="SettingsPane"]',
  TEAMS_APP:    '[id="app-root"], [class*="ts-app"], main',
  ONEDRIVE:     '[class*="ms-FocusZone"], [role="main"], main',
  ENTRA:        'main, [role="main"], h1, [class*="ms-Viewport"]',
};

const GUIDES = [
  {
    id: 'out-of-office',
    name: 'Out of Office',
    steps: [
      {
        name: 'steg-1-innstillinger',
        url: 'https://outlook.cloud.microsoft/mail/inbox',
        waitFor: W.OWA_INBOX,
        clickSelector: null
      },
      {
        name: 'steg-2-automatiske-svar',
        url: 'https://outlook.cloud.microsoft/mail/options/mail/automaticReplies',
        waitFor: W.OWA_SETTINGS,
        clickSelector: null
      },
      {
        name: 'steg-3-slaa-paa',
        url: 'https://outlook.cloud.microsoft/mail/options/mail/automaticReplies',
        waitFor: W.OWA_SETTINGS,
        clickSelector: '[role="switch"], [aria-label*="Automatisk"], [aria-label*="Automatic"]'
      },
      {
        name: 'steg-4-skriv-melding',
        url: 'https://outlook.cloud.microsoft/mail/options/mail/automaticReplies',
        waitFor: W.OWA_SETTINGS,
        clickSelector: null
      },
      {
        name: 'steg-5-lagre',
        url: 'https://outlook.cloud.microsoft/mail/options/mail/automaticReplies',
        waitFor: W.OWA_SETTINGS,
        clickSelector: null
      }
    ]
  },
  {
    id: 'email-signature',
    name: 'Email Signature',
    steps: [
      {
        name: 'steg-1-innstillinger',
        url: 'https://outlook.cloud.microsoft/mail/inbox',
        waitFor: W.OWA_INBOX,
        clickSelector: null
      },
      {
        name: 'steg-2-skriv-og-svar',
        url: 'https://outlook.cloud.microsoft/mail/options/mail/compose',
        waitFor: W.OWA_SETTINGS,
        clickSelector: null
      },
      {
        name: 'steg-3-skriv-signatur',
        url: 'https://outlook.cloud.microsoft/mail/options/mail/compose',
        waitFor: W.OWA_SETTINGS,
        clickSelector: '[contenteditable="true"]'
      },
      {
        name: 'steg-4-aktiver',
        url: 'https://outlook.cloud.microsoft/mail/options/mail/compose',
        waitFor: W.OWA_SETTINGS,
        clickSelector: null
      },
      {
        name: 'steg-5-lagre',
        url: 'https://outlook.cloud.microsoft/mail/options/mail/compose',
        waitFor: W.OWA_SETTINGS,
        clickSelector: null
      }
    ]
  },
  {
    id: 'shared-mailbox',
    name: 'Shared Mailbox',
    steps: [
      {
        name: 'steg-1-outlook-innboks',
        url: 'https://outlook.cloud.microsoft/mail/inbox',
        waitFor: W.OWA_INBOX,
        clickSelector: null
      },
      {
        name: 'steg-2-hoyreklikk',
        url: 'https://outlook.cloud.microsoft/mail/inbox',
        waitFor: W.OWA_INBOX,
        clickSelector: '[role="treeitem"]:first-child',
        preAction: 'rightClick'
      },
      {
        name: 'steg-3-legg-til',
        url: 'https://outlook.cloud.microsoft/mail/inbox',
        waitFor: 'div:has-text("Add shared mailbox")',
        clickSelector: 'div:has-text("Add shared mailbox")'
      },
      {
        name: 'steg-4-sok-postkasse',
        url: 'https://outlook.cloud.microsoft/mail/inbox',
        waitFor: 'input[placeholder*="search"]',
        clickSelector: 'input[placeholder*="search"]'
      },
      {
        name: 'steg-5-ferdig',
        url: 'https://outlook.cloud.microsoft/mail/inbox',
        waitFor: 'button:has-text("Add")',
        clickSelector: 'button:has-text("Add")'
      }
    ]
  },
  {
    id: 'install-office',
    name: 'Install Office',
    steps: [
      {
        name: 'steg-1-portal',
        url: 'https://www.microsoft365.com/',
        waitFor: '[role="main"], main',
        clickSelector: null
      },
      {
        name: 'steg-2-installer-knapp',
        url: 'https://www.microsoft365.com/',
        waitFor: 'button:has-text("Install")',
        clickSelector: 'button:has-text("Install")'
      },
      {
        name: 'steg-3-nedlasting',
        url: 'https://www.microsoft365.com/',
        waitFor: 'div:has-text("Downloading")',
        clickSelector: null
      },
      {
        name: 'steg-4-installer',
        url: 'https://www.microsoft365.com/',
        waitFor: 'div:has-text("Installing")',
        clickSelector: null
      },
      {
        name: 'steg-5-aktiver',
        url: 'https://www.microsoft365.com/',
        waitFor: 'button:has-text("Activate")',
        clickSelector: 'button:has-text("Activate")'
      }
    ]
  },
  {
    id: 'password-reset',
    name: 'Password Reset',
    steps: [
      {
        name: 'steg-1-sspr',
        url: 'https://passwordreset.microsoftonline.com/',
        waitFor: 'input[name="UserID"]',
        clickSelector: 'input[name="UserID"]'
      },
      {
        name: 'steg-2-epost',
        url: 'https://passwordreset.microsoftonline.com/',
        waitFor: 'button:has-text("Next")',
        clickSelector: 'button:has-text("Next")'
      },
      {
        name: 'steg-3-bekreft-metode',
        url: 'https://passwordreset.microsoftonline.com/',
        waitFor: 'input[type="radio"]',
        clickSelector: 'input[type="radio"]'
      },
      {
        name: 'steg-4-skriv-kode',
        url: 'https://passwordreset.microsoftonline.com/',
        waitFor: 'input[name="VerificationCode"]',
        clickSelector: 'input[name="VerificationCode"]'
      },
      {
        name: 'steg-5-nytt-passord',
        url: 'https://passwordreset.microsoftonline.com/',
        waitFor: 'input[name="NewPassword"]',
        clickSelector: 'input[name="NewPassword"]'
      },
      {
        name: 'steg-6-ferdig',
        url: 'https://passwordreset.microsoftonline.com/',
        waitFor: 'button:has-text("Finish")',
        clickSelector: 'button:has-text("Finish")'
      }
    ]
  },
  {
    id: 'onedrive-sync',
    name: 'OneDrive Sync',
    steps: [
      {
        name: 'steg-1-aapne',
        url: 'https://www.office.com/launch/onedrive',
        waitFor: W.ONEDRIVE,
        clickSelector: null
      },
      {
        name: 'steg-2-logg-inn',
        url: 'https://www.office.com/launch/onedrive',
        waitFor: 'button:has-text("Sign in")',
        clickSelector: 'button:has-text("Sign in")'
      },
      {
        name: 'steg-3-velg-mappe',
        url: 'https://www.office.com/launch/onedrive',
        waitFor: '[role="gridcell"]',
        clickSelector: '[role="gridcell"]'
      },
      {
        name: 'steg-4-synkroniserer',
        url: 'https://www.office.com/launch/onedrive',
        waitFor: '.od-SyncIcon',
        clickSelector: null
      },
      {
        name: 'steg-5-utforsker',
        url: 'https://www.office.com/launch/onedrive',
        waitFor: '.od-FileIcon',
        clickSelector: '.od-FileIcon'
      }
    ]
  },
  {
    id: 'teams-first-meeting',
    name: 'Teams First Meeting',
    steps: [
      {
        name: 'steg-1-aapne-teams',
        url: 'https://teams.microsoft.com/_#/calendarv2',
        waitFor: '[data-icon-name="Calendar"]',
        clickSelector: null
      },
      {
        name: 'steg-2-se-motedetaljer',
        url: 'https://teams.microsoft.com/_#/calendarv2',
        waitFor: '.cal-item',
        clickSelector: '.cal-item'
      },
      {
        name: 'steg-3-delta-klikk',
        url: 'https://teams.microsoft.com/_#/calendarv2',
        waitFor: 'button:has-text("Join")',
        clickSelector: 'button:has-text("Join")'
      },
      {
        name: 'steg-4-sjekk-lyd-video',
        url: 'https://teams.microsoft.com/_#/calendarv2',
        waitFor: '[data-icon-name="Microphone"]',
        clickSelector: null
      },
      {
        name: 'steg-5-inne-i-motet',
        url: 'https://teams.microsoft.com/_#/calendarv2',
        waitFor: '.call-participant',
        clickSelector: null
      }
    ]
  },
  {
    id: 'onedrive-save',
    name: 'OneDrive Save',
    steps: [
      {
        name: 'steg-1-systemtray',
        url: 'https://www.office.com/launch/onedrive',
        waitFor: '.od-AppBrand',
        clickSelector: null
      },
      {
        name: 'steg-2-onedrive-mappe',
        url: 'https://www.office.com/launch/onedrive',
        waitFor: '[role="listitem"]',
        clickSelector: '[role="listitem"]'
      },
      {
        name: 'steg-3-dra-fil',
        url: 'https://www.office.com/launch/onedrive',
        waitFor: '.od-DragHandle',
        clickSelector: null
      },
      {
        name: 'steg-4-synkroniserer',
        url: 'https://www.office.com/launch/onedrive',
        waitFor: '.od-SyncIcon',
        clickSelector: null
      },
      {
        name: 'steg-5-ferdig-synkronisert',
        url: 'https://www.office.com/launch/onedrive',
        waitFor: '.od-SyncComplete',
        clickSelector: null
      }
    ]
  },
  {
    id: 'outlook-setup-pc',
    name: 'Outlook Setup PC',
    steps: [
      {
        name: 'steg-1-portal',
        url: 'https://www.microsoft365.com/',
        waitFor: 'button:has-text("Install")',
        clickSelector: null
      },
      {
        name: 'steg-2-kjor-installasjon',
        url: 'https://www.microsoft365.com/',
        waitFor: 'button:has-text("Run")',
        clickSelector: 'button:has-text("Run")'
      },
      {
        name: 'steg-3-installerer',
        url: 'https://www.microsoft365.com/',
        waitFor: 'div:has-text("Installing")',
        clickSelector: null
      },
      {
        name: 'steg-4-legg-til-konto',
        url: 'https://outlook.cloud.microsoft/mail/inbox',
        waitFor: 'button:has-text("Add account")',
        clickSelector: 'button:has-text("Add account")'
      },
      {
        name: 'steg-5-logg-inn',
        url: 'https://outlook.cloud.microsoft/mail/inbox',
        waitFor: 'input[type="email"]',
        clickSelector: 'input[type="email"]'
      },
      {
        name: 'steg-6-ferdig-innboks',
        url: 'https://outlook.cloud.microsoft/mail/inbox',
        waitFor: '.ms-List-cell',
        clickSelector: null
      }
    ]
  },
  {
    id: 'mfa-setup',
    name: 'MFA Setup',
    steps: [
      {
        name: 'steg-1-epost',
        url: 'https://mysignins.microsoft.com/security-info',
        waitFor: 'input[type="email"]',
        clickSelector: 'input[type="email"]'
      },
      {
        name: 'steg-2-passord',
        url: 'https://mysignins.microsoft.com/security-info',
        waitFor: 'input[type="password"]',
        clickSelector: 'input[type="password"]'
      },
      {
        name: 'steg-3-sikre-konto',
        url: 'https://mysignins.microsoft.com/security-info',
        waitFor: 'button:has-text("Secure")',
        clickSelector: 'button:has-text("Secure")'
      },
      {
        name: 'steg-4-installer-authenticator',
        url: 'https://mysignins.microsoft.com/security-info',
        waitFor: 'button:has-text("Authenticator")',
        clickSelector: 'button:has-text("Authenticator")'
      },
      {
        name: 'steg-5-qr-kode',
        url: 'https://mysignins.microsoft.com/security-info',
        waitFor: '.qr-code',
        clickSelector: null
      },
      {
        name: 'steg-6-godkjenn-varsel',
        url: 'https://mysignins.microsoft.com/security-info',
        waitFor: 'button:has-text("Approve")',
        clickSelector: 'button:has-text("Approve")'
      },
      {
        name: 'steg-7-fullfort',
        url: 'https://mysignins.microsoft.com/security-info',
        waitFor: 'div:has-text("Complete")',
        clickSelector: null
      }
    ]
  },

  // ── OUTLOOK: E-POSTREGLER ─────────────────────────────────────────────────
  {
    id: 'email-rules',
    name: 'E-postregler',
    steps: [
      {
        name: 'steg-1-innstillinger',
        url: 'https://outlook.cloud.microsoft/mail/inbox',
        waitFor: W.OWA_INBOX,
        clickSelector: null
      },
      {
        name: 'steg-2-regler-side',
        url: 'https://outlook.cloud.microsoft/mail/options/mail/rules',
        waitFor: 'h1, [role="heading"]',
        clickSelector: null
      },
      {
        name: 'steg-3-ny-regel',
        url: 'https://outlook.cloud.microsoft/mail/options/mail/rules',
        waitFor: 'button:has-text("Add new rule"), button:has-text("New rule")',
        clickSelector: 'button:has-text("Add new rule"), button:has-text("New rule")'
      },
      {
        name: 'steg-4-betingelse',
        url: 'https://outlook.cloud.microsoft/mail/options/mail/rules',
        waitFor: 'input[placeholder*="name"], input[aria-label*="name"]',
        clickSelector: null
      },
      {
        name: 'steg-5-lagre',
        url: 'https://outlook.cloud.microsoft/mail/options/mail/rules',
        waitFor: 'button:has-text("Save")',
        clickSelector: null
      }
    ]
  },

  // ── OUTLOOK: VIDERESENDING ────────────────────────────────────────────────
  {
    id: 'email-forwarding',
    name: 'Videresend e-post',
    steps: [
      {
        name: 'steg-1-innstillinger',
        url: 'https://outlook.cloud.microsoft/mail/inbox',
        waitFor: W.OWA_INBOX,
        clickSelector: null
      },
      {
        name: 'steg-2-videresending-side',
        url: 'https://outlook.cloud.microsoft/mail/options/mail/forwardingAndStorage',
        waitFor: W.OWA_SETTINGS,
        clickSelector: null
      },
      {
        name: 'steg-3-aktiver',
        url: 'https://outlook.cloud.microsoft/mail/options/mail/forwardingAndStorage',
        waitFor: 'input[type="radio"]',
        clickSelector: 'input[type="radio"]'
      },
      {
        name: 'steg-4-skriv-adresse',
        url: 'https://outlook.cloud.microsoft/mail/options/mail/forwardingAndStorage',
        waitFor: 'input[type="email"], input[placeholder*="email"], input[placeholder*="address"]',
        clickSelector: null
      },
      {
        name: 'steg-5-lagre',
        url: 'https://outlook.cloud.microsoft/mail/options/mail/forwardingAndStorage',
        waitFor: 'button:has-text("Save")',
        clickSelector: null
      }
    ]
  },

  // ── OUTLOOK: KALENDER – DEL MED KOLLEGA ──────────────────────────────────
  {
    id: 'calendar-share',
    name: 'Del kalender',
    steps: [
      {
        name: 'steg-1-kalender',
        url: 'https://outlook.cloud.microsoft/calendar/',
        waitFor: '[role="main"], [aria-label*="Calendar"]',
        clickSelector: null
      },
      {
        name: 'steg-2-del-knapp',
        url: 'https://outlook.cloud.microsoft/calendar/',
        waitFor: 'button:has-text("Share"), [aria-label*="Share"]',
        clickSelector: 'button:has-text("Share")'
      },
      {
        name: 'steg-3-skriv-mottaker',
        url: 'https://outlook.cloud.microsoft/calendar/',
        waitFor: 'input[placeholder*="name"], input[type="email"]',
        clickSelector: null
      },
      {
        name: 'steg-4-velg-tilgang',
        url: 'https://outlook.cloud.microsoft/calendar/',
        waitFor: 'select, [role="combobox"], [role="listbox"]',
        clickSelector: null
      },
      {
        name: 'steg-5-send',
        url: 'https://outlook.cloud.microsoft/calendar/',
        waitFor: 'button:has-text("Share"), button:has-text("Send")',
        clickSelector: null
      }
    ]
  },

  // ── OUTLOOK: GJENTAKENDE AVTALE ───────────────────────────────────────────
  {
    id: 'calendar-recurring',
    name: 'Gjentakende avtale',
    steps: [
      {
        name: 'steg-1-kalender',
        url: 'https://outlook.cloud.microsoft/calendar/',
        waitFor: 'button:has-text("New event"), [aria-label*="New event"]',
        clickSelector: 'button:has-text("New event")'
      },
      {
        name: 'steg-2-ny-avtale-form',
        url: 'https://outlook.cloud.microsoft/calendar/',
        waitFor: 'input[aria-label*="title"], input[placeholder*="title"]',
        clickSelector: null
      },
      {
        name: 'steg-3-gjentakelse',
        url: 'https://outlook.cloud.microsoft/calendar/',
        waitFor: 'button:has-text("Repeat"), [aria-label*="Repeat"], [aria-label*="Recurrence"]',
        clickSelector: 'button:has-text("Repeat")'
      },
      {
        name: 'steg-4-velg-moenster',
        url: 'https://outlook.cloud.microsoft/calendar/',
        waitFor: '[role="radiogroup"], input[type="radio"]',
        clickSelector: null
      },
      {
        name: 'steg-5-lagre',
        url: 'https://outlook.cloud.microsoft/calendar/',
        waitFor: 'button:has-text("Save"), button:has-text("Send")',
        clickSelector: null
      }
    ]
  },

  // ── TEAMS: STATUSMELDING ──────────────────────────────────────────────────
  {
    id: 'teams-status-message',
    name: 'Teams statusmelding',
    steps: [
      {
        name: 'steg-1-teams-hjem',
        url: 'https://teams.microsoft.com',
        waitFor: '[data-tid="app-bar-layout"]',
        clickSelector: null
      },
      {
        name: 'steg-2-profil-meny',
        url: 'https://teams.microsoft.com',
        waitFor: '[data-tid="me-control-menu-button"], button[aria-label*="profile"], button[aria-label*="Profile"]',
        clickSelector: '[data-tid="me-control-menu-button"]'
      },
      {
        name: 'steg-3-sett-status',
        url: 'https://teams.microsoft.com',
        waitFor: '[data-tid="set-status-message"], div:has-text("Set status message")',
        clickSelector: null
      },
      {
        name: 'steg-4-skriv-melding',
        url: 'https://teams.microsoft.com',
        waitFor: 'textarea, input[placeholder*="status"]',
        clickSelector: null
      },
      {
        name: 'steg-5-ferdig',
        url: 'https://teams.microsoft.com',
        waitFor: 'button:has-text("Done"), button:has-text("Save")',
        clickSelector: null
      }
    ]
  },

  // ── TEAMS: NY KANAL ───────────────────────────────────────────────────────
  {
    id: 'teams-new-channel',
    name: 'Opprett Teams-kanal',
    steps: [
      {
        name: 'steg-1-teams-liste',
        url: 'https://teams.microsoft.com/_#/teamChannels',
        waitFor: '[data-tid="app-bar-layout"]',
        clickSelector: null
      },
      {
        name: 'steg-2-team-meny',
        url: 'https://teams.microsoft.com/_#/teamChannels',
        waitFor: '[data-icon-name="MoreHorizontal"], button[aria-label*="More options"]',
        clickSelector: null
      },
      {
        name: 'steg-3-legg-til-kanal',
        url: 'https://teams.microsoft.com/_#/teamChannels',
        waitFor: 'div:has-text("Add channel"), li:has-text("Add channel")',
        clickSelector: null
      },
      {
        name: 'steg-4-kanal-navn',
        url: 'https://teams.microsoft.com/_#/teamChannels',
        waitFor: 'input[placeholder*="channel name"], input[aria-label*="Channel name"]',
        clickSelector: null
      },
      {
        name: 'steg-5-opprett',
        url: 'https://teams.microsoft.com/_#/teamChannels',
        waitFor: 'button:has-text("Add"), button:has-text("Create")',
        clickSelector: null
      }
    ]
  },

  // ── TEAMS: NY CHAT ────────────────────────────────────────────────────────
  {
    id: 'teams-new-chat',
    name: 'Start ny Teams-chat',
    steps: [
      {
        name: 'steg-1-chat-fane',
        url: 'https://teams.microsoft.com/_#/conversations',
        waitFor: '[data-tid="app-bar-layout"]',
        clickSelector: null
      },
      {
        name: 'steg-2-ny-chat-knapp',
        url: 'https://teams.microsoft.com/_#/conversations',
        waitFor: 'button[aria-label*="New chat"], [data-tid="newChat"]',
        clickSelector: 'button[aria-label*="New chat"]'
      },
      {
        name: 'steg-3-sok-person',
        url: 'https://teams.microsoft.com/_#/conversations',
        waitFor: 'input[aria-label*="To"], input[placeholder*="Type a name"]',
        clickSelector: null
      },
      {
        name: 'steg-4-skriv-melding',
        url: 'https://teams.microsoft.com/_#/conversations',
        waitFor: '[contenteditable="true"][aria-label*="message"], [data-tid="message-editor"]',
        clickSelector: null
      }
    ]
  },

  // ── ONEDRIVE: DEL EN FIL ─────────────────────────────────────────────────
  {
    id: 'onedrive-share',
    name: 'Del fil i OneDrive',
    steps: [
      {
        name: 'steg-1-mine-filer',
        url: 'https://www.office.com/launch/onedrive?id=root',
        waitFor: '[role="gridcell"], [data-automationid="DetailsRow"]',
        clickSelector: null
      },
      {
        name: 'steg-2-velg-fil',
        url: 'https://www.office.com/launch/onedrive?id=root',
        waitFor: '[role="gridcell"]',
        clickSelector: '[role="gridcell"]'
      },
      {
        name: 'steg-3-del-knapp',
        url: 'https://www.office.com/launch/onedrive?id=root',
        waitFor: 'button:has-text("Share"), [aria-label*="Share"]',
        clickSelector: 'button:has-text("Share")'
      },
      {
        name: 'steg-4-legg-til-person',
        url: 'https://www.office.com/launch/onedrive?id=root',
        waitFor: 'input[placeholder*="name"], input[aria-label*="recipient"]',
        clickSelector: null
      },
      {
        name: 'steg-5-send-lenke',
        url: 'https://www.office.com/launch/onedrive?id=root',
        waitFor: 'button:has-text("Send"), button:has-text("Copy link")',
        clickSelector: null
      }
    ]
  },

  // ── ONEDRIVE: GJENOPPRETT VERSJON ─────────────────────────────────────────
  {
    id: 'onedrive-version-history',
    name: 'Gjenopprett OneDrive-versjon',
    steps: [
      {
        name: 'steg-1-mine-filer',
        url: 'https://www.office.com/launch/onedrive?id=root',
        waitFor: '[role="gridcell"]',
        clickSelector: null
      },
      {
        name: 'steg-2-meny-fil',
        url: 'https://www.office.com/launch/onedrive?id=root',
        waitFor: '[data-icon-name="MoreHorizontal"], button[aria-label*="More"]',
        clickSelector: null
      },
      {
        name: 'steg-3-versjonshistorikk',
        url: 'https://www.office.com/launch/onedrive?id=root',
        waitFor: 'li:has-text("Version history"), div:has-text("Version history")',
        clickSelector: null
      },
      {
        name: 'steg-4-velg-versjon',
        url: 'https://www.office.com/launch/onedrive?id=root',
        waitFor: '[role="listitem"], [role="row"]',
        clickSelector: null
      },
      {
        name: 'steg-5-gjenopprett',
        url: 'https://www.office.com/launch/onedrive?id=root',
        waitFor: 'button:has-text("Restore")',
        clickSelector: null
      }
    ]
  },

  // ── ENTRA ID: OPPRETT BRUKER ──────────────────────────────────────────────
  {
    id: 'entra-new-user',
    name: 'Opprett ny bruker (Entra ID)',
    steps: [
      {
        name: 'steg-1-brukerliste',
        url: 'https://entra.microsoft.com/#view/Microsoft_AAD_UsersAndTenants/UserManagementMenuBlade/~/AllUsers',
        waitFor: 'h1, [role="heading"]',
        clickSelector: null
      },
      {
        name: 'steg-2-ny-bruker-knapp',
        url: 'https://entra.microsoft.com/#view/Microsoft_AAD_UsersAndTenants/UserManagementMenuBlade/~/AllUsers',
        waitFor: 'button:has-text("New user"), [aria-label*="New user"]',
        clickSelector: 'button:has-text("New user")'
      },
      {
        name: 'steg-3-fyll-inn',
        url: 'https://entra.microsoft.com/#view/Microsoft_AAD_UsersAndTenants/UserManagementMenuBlade/~/AllUsers',
        waitFor: 'input[id*="displayName"], input[aria-label*="Display name"]',
        clickSelector: null
      },
      {
        name: 'steg-4-passord',
        url: 'https://entra.microsoft.com/#view/Microsoft_AAD_UsersAndTenants/UserManagementMenuBlade/~/AllUsers',
        waitFor: 'input[type="password"], input[id*="password"]',
        clickSelector: null
      },
      {
        name: 'steg-5-opprett',
        url: 'https://entra.microsoft.com/#view/Microsoft_AAD_UsersAndTenants/UserManagementMenuBlade/~/AllUsers',
        waitFor: 'button:has-text("Create"), button:has-text("Review + create")',
        clickSelector: null
      }
    ]
  },

  // ── ENTRA ID: TILDEL LISENS ────────────────────────────────────────────────
  {
    id: 'entra-assign-license',
    name: 'Tildel M365-lisens (Entra ID)',
    steps: [
      {
        name: 'steg-1-brukerliste',
        url: 'https://entra.microsoft.com/#view/Microsoft_AAD_UsersAndTenants/UserManagementMenuBlade/~/AllUsers',
        waitFor: '[role="row"], [data-automationid="DetailsRow"]',
        clickSelector: null
      },
      {
        name: 'steg-2-velg-bruker',
        url: 'https://entra.microsoft.com/#view/Microsoft_AAD_UsersAndTenants/UserManagementMenuBlade/~/AllUsers',
        waitFor: 'a[href*="users"]',
        clickSelector: 'a[href*="users"]'
      },
      {
        name: 'steg-3-lisenser-fane',
        url: 'https://entra.microsoft.com/',
        waitFor: 'a:has-text("Licenses"), button:has-text("Licenses")',
        clickSelector: 'a:has-text("Licenses")'
      },
      {
        name: 'steg-4-legg-til',
        url: 'https://entra.microsoft.com/',
        waitFor: 'button:has-text("Add assignments"), button:has-text("+ Assignments")',
        clickSelector: null
      },
      {
        name: 'steg-5-velg-lisens',
        url: 'https://entra.microsoft.com/',
        waitFor: 'input[type="checkbox"], [role="checkbox"]',
        clickSelector: null
      },
      {
        name: 'steg-6-lagre',
        url: 'https://entra.microsoft.com/',
        waitFor: 'button:has-text("Save"), button:has-text("Assign")',
        clickSelector: null
      }
    ]
  },

  // ── ENTRA ID: INNLOGGINGSLOGG ─────────────────────────────────────────────
  {
    id: 'entra-sign-in-logs',
    name: 'Se innloggingslogg (Entra ID)',
    steps: [
      {
        name: 'steg-1-logg-side',
        url: 'https://entra.microsoft.com/#view/Microsoft_AAD_IAM/SignInEventsV3Blade',
        waitFor: 'h1, [role="heading"]',
        clickSelector: null
      },
      {
        name: 'steg-2-filtrer',
        url: 'https://entra.microsoft.com/#view/Microsoft_AAD_IAM/SignInEventsV3Blade',
        waitFor: 'button:has-text("Add filters"), [aria-label*="filter"]',
        clickSelector: 'button:has-text("Add filters")'
      },
      {
        name: 'steg-3-velg-bruker',
        url: 'https://entra.microsoft.com/#view/Microsoft_AAD_IAM/SignInEventsV3Blade',
        waitFor: 'div:has-text("User"), li:has-text("User")',
        clickSelector: null
      },
      {
        name: 'steg-4-resultatliste',
        url: 'https://entra.microsoft.com/#view/Microsoft_AAD_IAM/SignInEventsV3Blade',
        waitFor: '[role="row"], [data-automationid="DetailsRow"]',
        clickSelector: null
      },
      {
        name: 'steg-5-detaljer',
        url: 'https://entra.microsoft.com/#view/Microsoft_AAD_IAM/SignInEventsV3Blade',
        waitFor: '[role="row"]',
        clickSelector: '[role="row"]'
      }
    ]
  }
];

/**
 * Load session data (auth cookies, storage, etc.)
 */
function loadSession() {
  try {
    if (fs.existsSync(SESSION_FILE)) {
      const data = fs.readFileSync(SESSION_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('Warning: Could not load session file:', err.message);
  }
  return {};
}

/**
 * Save session data
 */
function saveSession(data) {
  try {
    const dir = path.dirname(SESSION_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SESSION_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error saving session:', err.message);
  }
}

/**
 * Get an access token via ROPC (Resource Owner Password Credentials).
 * This is a direct API call — no browser needed, bypasses Microsoft's
 * headless-browser detection entirely.
 */
async function getAccessToken() {
  const TENANT_ID = process.env.M365_TENANT_ID || 'zfjyk.onmicrosoft.com';
  const CLIENT_ID = process.env.M365_CLIENT_ID || '04b07795-8ddb-461a-bbee-02f9e1bf7b46';
  const CLIENT_SECRET = process.env.M365_CLIENT_SECRET;

  console.log(`[ROPC] Requesting token from tenant: ${TENANT_ID}`);

  const params = new URLSearchParams({
    grant_type: 'password',
    client_id: CLIENT_ID,
    username: EMAIL,
    password: PASSWORD,
    resource: 'https://outlook.office365.com/',
    scope: 'openid'
  });
  if (CLIENT_SECRET) params.set('client_secret', CLIENT_SECRET);

  const resp = await fetch(
    `https://login.microsoftonline.com/${TENANT_ID}/oauth2/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    }
  );

  const data = await resp.json();

  if (data.error) {
    throw new Error(`[ROPC] Token error: ${data.error} — ${(data.error_description || '').substring(0, 300)}`);
  }

  console.log('[ROPC] Access token obtained successfully');
  return data.access_token;
}

/**
 * Login to Microsoft 365 via form-based authentication.
 * Fills in username and password directly in the Microsoft login page.
 * This is more reliable than token injection which Microsoft has deprecated.
 */
async function login(page) {
  console.log('[AUTH] Starting form-based login...');

  // Navigate to OWA — will redirect to Microsoft login page
  await page.goto('https://outlook.office365.com/owa/', { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(2000);

  let currentUrl = page.url();
  console.log('[AUTH] After initial navigation:', currentUrl);

  // --- Step 1: Enter username ---
  if (currentUrl.includes('login.microsoftonline.com') || currentUrl.includes('login.microsoft.com')) {
    try {
      await page.waitForSelector('input[type="email"], input[name="loginfmt"]', { timeout: 15000 });
      await page.fill('input[type="email"], input[name="loginfmt"]', EMAIL);
      console.log('[AUTH] Username entered');
      await page.click('#idSIButton9, input[type="submit"], button[type="submit"]');
      await page.waitForTimeout(2000);
    } catch (err) {
      console.warn('[AUTH] Username step issue:', err.message);
    }
  }

  // --- Step 2: Enter password ---
  try {
    await page.waitForSelector('input[type="password"], input[name="passwd"]', { timeout: 15000 });
    await page.fill('input[type="password"], input[name="passwd"]', PASSWORD);
    console.log('[AUTH] Password entered');
    await page.click('#idSIButton9, input[type="submit"], button[type="submit"]');
    await page.waitForTimeout(3000);
  } catch (err) {
    throw new Error(`[AUTH] Password step failed: ${err.message}`);
  }

  // --- Step 3: Handle "Stay signed in?" prompt (click No) ---
  try {
    await page.waitForSelector('#idBtn_Back, input[value="No"]', { timeout: 5000 });
    await page.click('#idBtn_Back, input[value="No"]');
    console.log('[AUTH] Dismissed "Stay signed in" prompt');
    await page.waitForTimeout(2000);
  } catch { /* no prompt — fine */ }

  // --- Step 4: Wait for OWA to fully load ---
  await page.waitForTimeout(5000);

  currentUrl = page.url();
  console.log('[AUTH] URL after login:', currentUrl);

  // Check if login failed (still on login page)
  if (currentUrl.includes('login.microsoftonline.com') || currentUrl.includes('login.microsoft.com')) {
    throw new Error(`[AUTH] Login failed — still on login page: ${currentUrl}`);
  }

  // --- Step 5: Confirm OWA shell loaded ---
  const owaSelectors = [
    '[aria-label="Mail"]',
    '[role="navigation"]',
    '.ms-FocusZone',
    '[data-app-section]',
    'div[class*="ms-Viewport"]',
    'nav',
    'header'
  ];
  let confirmed = false;
  for (const sel of owaSelectors) {
    try {
      await page.waitForSelector(sel, { timeout: 10000 });
      console.log(`[AUTH] Login confirmed via selector "${sel}". URL: ${page.url()}`);
      confirmed = true;
      break;
    } catch { /* try next */ }
  }
  if (!confirmed) {
    console.warn('[AUTH] ⚠ Could not confirm inbox — proceeding anyway. URL:', page.url());
  }

  // Save session cookies for potential reuse
  const cookies = await page.context().cookies();
  saveSession({ cookies });
  console.log(`[AUTH] Session saved (${cookies.length} cookies)`);
}

/**
 * Capture a screenshot step
 */
async function captureStep(page, guide, step, screenshotsRoot) {
  try {
    console.log(`  Capturing: ${guide.id} / ${step.name}`);

    // Create per-guide subfolder: public/screenshots/<guide-id>/
    const guideDir = path.join(screenshotsRoot, guide.id);
    if (!fs.existsSync(guideDir)) {
      fs.mkdirSync(guideDir, { recursive: true });
    }

    // Detect OWA settings pages — direct URL navigation never opens the settings panel
    // in headless Chromium (SPA needs user interaction). Instead: load inbox → click gear.
    const isOwaSettings = step.url.includes('outlook.cloud.microsoft') && step.url.includes('/options/');

    if (isOwaSettings) {
      // 1. Load OWA inbox (bootstraps the SPA)
      await page.goto('https://outlook.cloud.microsoft/mail/inbox', { waitUntil: 'load', timeout: 60000 });
      await page.waitForTimeout(4000);
      await page.waitForSelector('[role="main"]', { timeout: 10000 }).catch(() => {});

      // 2. Click the Settings gear icon (works in both English and Norwegian OWA)
      const gearSelector = 'button[aria-label="Settings"], button[aria-label="Innstillinger"]';
      try {
        await page.waitForSelector(gearSelector, { timeout: 8000 });
        await page.click(gearSelector);
        await page.waitForTimeout(1500);
        console.log('    ✓ Settings gear clicked');
      } catch { console.warn('    ⚠ Settings gear not found — proceeding anyway'); }

      // 3. Wait for the settings dialog/panel to open
      try {
        await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
        console.log('    ✓ Settings dialog opened');
        await page.waitForTimeout(500);
      } catch { console.warn('    ⚠ Settings dialog did not open'); }

    } else {
      // Standard URL navigation for all non-OWA-settings pages
      await page.goto(step.url, { waitUntil: 'load', timeout: 60000 });
      await page.waitForTimeout(4000);

      // Wait for a specific element if defined (best-effort — don't abort on failure)
      if (step.waitFor) {
        try {
          await page.waitForSelector(step.waitFor, { timeout: 15000 });
          console.log(`    ✓ waitFor matched: ${step.waitFor}`);
        } catch {
          console.warn(`    ⚠ waitFor timed out (${step.waitFor}) — taking screenshot anyway`);
          await page.waitForTimeout(2000);
        }
      }
    }

    // Execute pre-action if any
    if (step.preAction === 'rightClick' && step.clickSelector) {
      try {
        const bbox = await page.locator(step.clickSelector).boundingBox();
        if (bbox) {
          await page.click(step.clickSelector, { button: 'right' });
          await page.waitForTimeout(800);
        }
      } catch { console.warn(`    ⚠ rightClick failed on: ${step.clickSelector}`); }
    } else if (step.clickSelector) {
      try {
        // Click the element to show the expected UI state, then wait for render
        await page.waitForSelector(step.clickSelector, { state: 'visible', timeout: 8000 });
        await page.click(step.clickSelector);
        await page.waitForTimeout(1500);
      } catch { console.warn(`    ⚠ click failed on: ${step.clickSelector}`); }
    }

    // Take screenshot — saved as public/screenshots/<guide-id>/<step-name>.png
    const filepath = path.join(guideDir, `${step.name}.png`);
    await page.screenshot({ path: filepath, fullPage: false });
    console.log(`    → Saved: ${filepath}`);

    // Capture bounding box of the clicked element (best-effort, short timeout)
    if (step.clickSelector) {
      try {
        const bbox = await page.locator(step.clickSelector).boundingBox({ timeout: 3000 });
        if (bbox) {
          const coordsFile = path.join(guideDir, `${step.name}.coords.json`);
          fs.writeFileSync(coordsFile, JSON.stringify({
            x: Math.round(bbox.x + bbox.width / 2),
            y: Math.round(bbox.y + bbox.height / 2),
            width: Math.round(bbox.width),
            height: Math.round(bbox.height)
          }, null, 2));
          console.log(`    → Saved coords: ${coordsFile}`);
        }
      } catch { /* element not found — no coords saved, that's fine */ }
    }
  } catch (err) {
    console.error(`  ERROR capturing ${guide.id}/${step.name}:`, err.message);
  }
}

/**
 * Main function
 */
async function main() {
  // CI-friendly Chromium flags — critical for GitHub Actions / Docker environments
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',       // Prevents crashes in low-memory CI environments
      '--disable-gpu',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-blink-features=AutomationControlled',  // Hide automation
    ]
  });

  const context = await browser.newContext({
    viewport: VIEWPORT,
    // Realistic Windows Chrome user agent
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  });

  // Remove webdriver fingerprint
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  const page = await context.newPage();

  // Create output directory
  const outputDir = path.join(__dirname, '../public/screenshots');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // Login once
    await login(page);

    // Filter guides by GUIDE_ID env var (set from workflow_dispatch input)
    const guideIdFilter = process.env.GUIDE_ID || '';
    const guidesToProcess = guideIdFilter
      ? GUIDES.filter(g => g.id === guideIdFilter)
      : GUIDES;

    if (guideIdFilter && guidesToProcess.length === 0) {
      console.error(`Error: No guide found with id "${guideIdFilter}"`);
      process.exit(1);
    }

    console.log(`Processing ${guidesToProcess.length} guide(s)...`);

    // Capture all steps for all guides
    for (const guide of guidesToProcess) {
      console.log(`\nProcessing guide: ${guide.name}`);
      for (const step of guide.steps) {
        await captureStep(page, guide, step, outputDir);
      }
    }

    console.log('\n✓ Screenshot capture complete');
  } finally {
    await context.close();
    await browser.close();
  }
}

main().catch(err => {
  console.error('=== FATAL ERROR ===');
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
});
