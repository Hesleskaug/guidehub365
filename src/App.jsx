import { useState } from "react";

// ============================================================
// M365 GuideHub - Interactive Prototype
// Commercial SaaS for always up-to-date Microsoft 365 guides
// Target: SMB + MSP / IT Consulting companies
// ============================================================

const BRAND = {
  name: "GuideHub 365",
  tagline: "Brukervennlige M365-guider som alltid er oppdatert",
};

// ── SVG icon library ──────────────────────────────────────────
const Ic = ({ id, size = 18, color = "currentColor", strokeWidth = 2 }) => {
  const s = { width: size, height: size, display: "block", flexShrink: 0 };
  const p = { fill: "none", stroke: color, strokeWidth, strokeLinecap: "round", strokeLinejoin: "round" };
  const paths = {
    monitor:   <><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>,
    mail:      <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></>,
    file:      <><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></>,
    chat:      <><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></>,
    cloud:     <><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/></>,
    shield:    <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
    phone:     <><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="17" r="1" fill={color} stroke="none"/></>,
    wrench:    <><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></>,
    menu:      <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>,
    search:    <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    sun:       <><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>,
    moon:      <><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></>,
    settings:  <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    home:      <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
    dollar:    <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
    chevron:   <><polyline points="9 18 15 12 9 6"/></>,
    arrowR:    <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
    check:     <><polyline points="20 6 9 17 4 12"/></>,
    star:      <path d="m12 2 3.09 6.26 6.91.99-5 4.87 1.18 6.88L12 17.77l-6.18 3.23L7 14.12 2 9.25l6.91-.99z" fill={color} stroke="none"/>,
    users:     <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    bar:       <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    lightning: <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>,
    globe:     <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
    refresh:   <><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></>,
    lock:      <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    phone2:    <><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></>,
  };
  return <svg viewBox="0 0 24 24" style={s} {...p}>{paths[id]}</svg>;
};

// Sample guide data
const CATEGORIES = [
  { id: "onboarding", icon: "monitor", label: "Kom i gang",          count: 8,  color: "#F59E0B", bg: "#FEF3C7" },
  { id: "email",      icon: "mail",    label: "E-post & Kalender",   count: 12, color: "#3B82F6", bg: "#DBEAFE" },
  { id: "office",     icon: "file",    label: "Office-apper",        count: 15, color: "#10B981", bg: "#D1FAE5" },
  { id: "teams",      icon: "chat",    label: "Teams",               count: 10, color: "#8B5CF6", bg: "#EDE9FE" },
  { id: "onedrive",   icon: "cloud",   label: "OneDrive & Filer",    count: 7,  color: "#0EA5E9", bg: "#E0F2FE" },
  { id: "security",   icon: "shield",  label: "Sikkerhet & Passord", count: 6,  color: "#EF4444", bg: "#FEE2E2" },
  { id: "mobile",     icon: "phone",   label: "Mobil & Nettbrett",   count: 9,  color: "#F97316", bg: "#FFEDD5" },
  { id: "troubleshoot",icon:"wrench",  label: "Feilsøking",          count: 11, color: "#6366F1", bg: "#E0E7FF" },
];

const GUIDES = {
  onboarding: [
    { id: "enroll-pc", title: "Innrullere PC i bedriftens system", difficulty: "Enkel", time: "10 min", popular: true },
    { id: "first-login", title: "Første innlogging på ny PC", difficulty: "Enkel", time: "5 min", popular: true },
    { id: "install-office", title: "Laste ned og installere Office-pakken", difficulty: "Enkel", time: "15 min", popular: true },
    { id: "setup-printer", title: "Sette opp skriver", difficulty: "Middels", time: "10 min", popular: false },
    { id: "setup-vpn", title: "Koble til bedriftens VPN", difficulty: "Enkel", time: "8 min", popular: false },
    { id: "windows-hello", title: "Sette opp Windows Hello (ansiktsgjenkjenning)", difficulty: "Enkel", time: "5 min", popular: false },
    { id: "onedrive-sync", title: "Synkronisere filer med OneDrive", difficulty: "Enkel", time: "7 min", popular: true },
    { id: "onedrive-save", title: "Lagre filer fra PC til OneDrive", difficulty: "Enkel", time: "5 min", popular: true },
    { id: "company-portal", title: "Bruke Bedriftsportalen for apper", difficulty: "Enkel", time: "5 min", popular: false },
  ],
  email: [
    { id: "outlook-setup-pc", title: "Sette opp Outlook på PC", difficulty: "Enkel", time: "15 min", popular: true },
    { id: "setup-outlook", title: "Konfigurere Outlook (eksisterende installasjon)", difficulty: "Enkel", time: "8 min", popular: false },
    { id: "setup-email-phone", title: "Sette opp e-post på mobil", difficulty: "Enkel", time: "5 min", popular: true },
    { id: "shared-mailbox", title: "Åpne en delt postkasse", difficulty: "Middels", time: "5 min", popular: true },
    { id: "email-signature", title: "Lage e-postsignatur", difficulty: "Enkel", time: "10 min", popular: true },
    { id: "calendar-share", title: "Dele kalender med kollegaer", difficulty: "Enkel", time: "5 min", popular: false },
    { id: "out-of-office", title: "Sette opp fraværsmelding", difficulty: "Enkel", time: "3 min", popular: true },
  ],
  teams: [
    { id: "teams-first-meeting", title: "Delta i ditt første Teams-møte", difficulty: "Enkel", time: "5 min", popular: true },
    { id: "teams-mobile", title: "Bruke Teams på mobil", difficulty: "Enkel", time: "5 min", popular: false },
    { id: "teams-share-screen", title: "Dele skjerm i Teams-møte", difficulty: "Enkel", time: "3 min", popular: false },
    { id: "teams-chat", title: "Sende meldinger i Teams", difficulty: "Enkel", time: "5 min", popular: true },
  ],
  mobile: [
    { id: "enroll-phone", title: "Innrullere mobiltelefon i Intune", difficulty: "Enkel", time: "10 min", popular: true },
    { id: "authenticator", title: "Sette opp Microsoft Authenticator", difficulty: "Enkel", time: "5 min", popular: true },
    { id: "teams-mobile", title: "Bruke Teams på mobil", difficulty: "Enkel", time: "5 min", popular: false },
    { id: "outlook-mobile", title: "Outlook-appen på mobil", difficulty: "Enkel", time: "5 min", popular: false },
  ],
  security: [
    { id: "setup-mfa", title: "Sette opp totrinnsbekreftelse (MFA)", difficulty: "Enkel", time: "5 min", popular: true },
    { id: "password-reset", title: "Tilbakestille passord", difficulty: "Enkel", time: "3 min", popular: true },
    { id: "sspr-setup", title: "Sette opp selvbetjent passordtilbakestilling", difficulty: "Enkel", time: "5 min", popular: false },
    { id: "conditional-access", title: "Forstå betinget tilgang", difficulty: "Middels", time: "10 min", popular: false },
    { id: "account-locked", title: "Hva gjør du når kontoen er låst?", difficulty: "Enkel", time: "3 min", popular: true },
    { id: "suspicious-email", title: "Rapportere mistenkelig e-post", difficulty: "Enkel", time: "5 min", popular: false },
  ],
};

// Detailed guide content (sample for "Sette opp Outlook på PC")
const DETAILED_GUIDE = {
  id: "setup-outlook",
  title: "Sette opp Outlook på PC",
  lastUpdated: "18. mars 2026",
  version: "Outlook (New) - Mars 2026",
  difficulty: "Enkel",
  time: "8 min",
  // Element 1: Beskrivelse
  description: "Denne guiden viser deg steg for steg hvordan du setter opp Outlook på din PC. Etter å ha fulgt disse stegene vil du ha full tilgang til e-post, kalender og kontakter.",
  // Element 2: Hvorfor gjør vi dette? (null = vis ikke for denne guiden)
  why: null,
  // Element 4: Bekreftelse
  confirmation: {
    title: "Slik vet du at alt er riktig satt opp",
    checks: [
      "Outlook åpner seg og viser din innboks med e-poster",
      "Du ser ditt navn og e-postadresse øverst i venstre hjørne",
      "Kalenderen viser dine møter og avtaler",
    ]
  },
  // Element 5: Hvem kontakter jeg?
  support: {
    label: "IT-support",
    phone: "22 00 00 00",
    email: "it@{domain}",
    portal: "https://support.{domain}",
    hours: "Man–fre  08:00–16:00",
  },
  prerequisites: ["Du har fått tildelt en brukerkonto", "PC-en er koblet til internett", "Du kjenner din e-postadresse og passord"],
  steps: [
    {
      number: 1,
      title: "Åpne Outlook",
      instruction: "Klikk på Start-menyen (Windows-ikonet nede til venstre) og skriv «Outlook». Klikk på Outlook-appen når den dukker opp.",
      tip: "Hvis du ikke finner Outlook, kan det hende at Office ikke er installert ennå. Se guiden «Laste ned og installere Office-pakken».",
      screenshot: "start-menu-outlook",
    },
    {
      number: 2,
      title: "Skriv inn e-postadressen din",
      instruction: "Skriv inn din e-postadresse (f.eks. ola.nordmann@{domain}) og klikk «Koble til».",
      tip: "Bruk den e-postadressen du har fått fra IT-avdelingen.",
      screenshot: "outlook-email-input",
    },
    {
      number: 3,
      title: "Logg inn med passordet ditt",
      instruction: "Du blir nå sendt til innloggingssiden. Skriv inn passordet ditt og klikk «Logg på».",
      tip: "Hvis du har glemt passordet, se guiden «Tilbakestille passord».",
      screenshot: "outlook-password",
    },
    {
      number: 4,
      title: "Godkjenn med totrinnsbekreftelse",
      instruction: "Hvis bedriften bruker totrinnsbekreftelse (MFA), vil du få en forespørsel på telefonen din. Åpne Microsoft Authenticator-appen og godkjenn innloggingen.",
      tip: "Har du ikke satt opp Authenticator? Se guiden «Sette opp Microsoft Authenticator».",
      screenshot: "mfa-approve",
    },
    {
      number: 5,
      title: "Ferdig!",
      instruction: "Outlook er nå satt opp! E-postene dine begynner å laste ned. Dette kan ta noen minutter avhengig av hvor mye e-post du har.",
      tip: "Neste steg: Lag din e-postsignatur! Se guiden «Lage e-postsignatur».",
      screenshot: "outlook-ready",
    },
  ],
};

// ─── FRAVÆRSMELDING ───────────────────────────────────────────────
const OUT_OF_OFFICE_GUIDE = {
  id: "out-of-office",
  title: "Sette opp fraværsmelding (automatisk svar)",
  lastUpdated: "22. mars 2026",
  version: "Outlook på nett",
  difficulty: "Enkel",
  time: "3 min",
  description: "Når du er på ferie eller borte fra jobb, kan du sette opp en automatisk melding som sendes til alle som e-poster deg. Da vet kollegaer og kunder at du er utilgjengelig — og hvem de kan kontakte i stedet.",
  prerequisites: ["Du er logget inn på Outlook på nett (outlook.office.com)", "Du vet hvem som kan kontaktes mens du er borte"],
  steps: [
    { number: 1, title: "Åpne Outlook innstillinger", instruction: "Gå til outlook.office.com og logg inn. Klikk på tannhjulikonet ⚙️ øverst til høyre.", tip: "Ser du ikke tannhjulet? Sørg for at du er i Outlook — ikke Teams eller OneDrive.", screenshot: "steg-1-innstillinger", guideId: "out-of-office" },
    { number: 2, title: "Finn 'Automatiske svar'", instruction: "En meny åpner seg på høyre side. Klikk på «Vis alle Outlook-innstillinger» nederst. Gå deretter til E-post → Automatiske svar.", tip: "Du kan også søke etter 'fraværsmelding' i søkefeltet øverst i innstillingsmenyen.", screenshot: "steg-2-automatiske-svar", guideId: "out-of-office" },
    { number: 3, title: "Slå på automatiske svar", instruction: "Klikk på «Send automatiske svar». Sett gjerne dato for når du reiser og når du er tilbake — da slår meldingen seg av automatisk.", tip: "Huk av «Send bare svar i denne tidsperioden» og fyll inn datoer for å slippe å huske å slå det av.", screenshot: "steg-3-slaa-paa", guideId: "out-of-office" },
    { number: 4, title: "Skriv fraværsmeldingen", instruction: "Skriv meldingen din i tekstfeltet. Fortell når du er tilbake, og hvem som kan kontaktes i din fravær. Du kan ha én melding til kollegaer og én til folk utenfor bedriften.", tip: "Eksempel: 'Jeg er på ferie t.o.m. 15. april. For haster, kontakt Kari på kari@bedrift.no'", screenshot: "steg-4-skriv-melding", guideId: "out-of-office" },
    { number: 5, title: "Lagre — du er klar!", instruction: "Klikk «Lagre» øverst til høyre. En blå linje øverst i Outlook bekrefter at automatiske svar er aktivert. Husk å slå det av når du er tilbake!", tip: "En gul banner øverst i innboksen din vil alltid minne deg på at fraværsmeldingen er på.", screenshot: "steg-5-lagre", guideId: "out-of-office" },
  ],
  confirmation: { title: "Slik ser du at det fungerer", checks: ["En gul/blå banner vises øverst i innboksen din", "Be en kollega sende deg en test-e-post — de skal få automatisk svar"] },
  support: { label: "IT-support", phone: "22 00 00 00", email: "it@{domain}", portal: "https://support.{domain}", hours: "Man–fre 08:00–16:00" },
};

// ─── E-POSTSIGNATUR ───────────────────────────────────────────────
const EMAIL_SIGNATURE_GUIDE = {
  id: "email-signature",
  title: "Lage e-postsignatur i Outlook",
  lastUpdated: "22. mars 2026",
  version: "Outlook på nett",
  difficulty: "Enkel",
  time: "10 min",
  description: "En profesjonell e-postsignatur med navn, tittel og kontaktinfo gir et godt inntrykk og gjør det enkelt for mottakere å ta kontakt. Her viser vi deg hvordan du lager og aktiverer signaturen i Outlook på nett.",
  prerequisites: ["Du er logget inn på Outlook på nett (outlook.office.com)", "Du har klar: navn, tittel, telefonnummer"],
  steps: [
    { number: 1, title: "Åpne Outlook innstillinger", instruction: "Gå til outlook.office.com. Klikk på tannhjulikonet ⚙️ øverst til høyre, deretter «Vis alle Outlook-innstillinger» nederst i menyen.", tip: "Snarveien er: Innstillinger → E-post → Skriv og svar.", screenshot: "steg-1-innstillinger", guideId: "email-signature" },
    { number: 2, title: "Gå til 'Skriv og svar'", instruction: "I innstillingsvinduet, klikk på «E-post» i venstre meny, deretter «Skriv og svar». Her finner du signaturinnstillingene.", tip: "Ser du ikke «Skriv og svar»? Sørg for at du har klikket «E-post» i venstremenyen først.", screenshot: "steg-2-skriv-og-svar", guideId: "email-signature" },
    { number: 3, title: "Skriv signaturen din", instruction: "Klikk på «Ny signatur», gi den et navn (f.eks. 'Jobb'), og skriv signaturen i tekstfeltet. Bruk verktøylinjen til å formatere tekst med fet skrift, farge osv.", tip: "Hold det enkelt: Navn, tittel, bedrift, telefon og e-post er alt du trenger.", screenshot: "steg-3-skriv-signatur", guideId: "email-signature" },
    { number: 4, title: "Aktiver automatisk signatur", instruction: "Under signaturen er det to nedtrekksmenyer: «For nye meldinger» og «For svar/videresendinger». Velg signaturen din i begge for at den legges til automatisk.", tip: "Vil du ikke ha signatur på svar og videresendinger? La «For svar/videresendinger» stå på Ingen.", screenshot: "steg-4-aktiver", guideId: "email-signature" },
    { number: 5, title: "Lagre signaturen", instruction: "Klikk «Lagre» øverst i vinduet. Neste gang du skriver en ny e-post vil signaturen ligge klar automatisk nederst i e-posten.", tip: "Test det: Klikk «Ny e-post» og sjekk at signaturen dukker opp automatisk.", screenshot: "steg-5-lagre", guideId: "email-signature" },
  ],
  confirmation: { title: "Slik ser du at det fungerer", checks: ["Åpne en ny e-post — signaturen skal vises automatisk nederst", "Teksten, farge og formatering ser riktig ut"] },
  support: { label: "IT-support", phone: "22 00 00 00", email: "it@{domain}", portal: "https://support.{domain}", hours: "Man–fre 08:00–16:00" },
};

// ─── DELT POSTKASSE ───────────────────────────────────────────────
const SHARED_MAILBOX_GUIDE = {
  id: "shared-mailbox",
  title: "Åpne en delt postkasse i Outlook",
  lastUpdated: "22. mars 2026",
  version: "Outlook på nett",
  difficulty: "Enkel",
  time: "5 min",
  description: "En delt postkasse er en felles e-postkasse som flere i bedriften kan lese og svare fra — for eksempel post@bedrift.no eller support@bedrift.no. Her viser vi deg hvordan du legger den til i Outlook.",
  prerequisites: ["Du er logget inn på Outlook på nett (outlook.office.com)", "IT har gitt deg tilgang til den delte postkassen"],
  steps: [
    { number: 1, title: "Åpne Outlook på nett", instruction: "Gå til outlook.office.com og logg inn med din vanlige jobbe-post. Du skal nå se din vanlige innboks.", tip: "Bruker du Outlook-appen på PC? Delte postkasser du har tilgang til dukker ofte opp automatisk der.", screenshot: "steg-1-outlook-innboks", guideId: "shared-mailbox" },
    { number: 2, title: "Høyreklikk på 'Mapper'", instruction: "I venstre meny, finn «Mapper» eller din e-postadresse øverst. Høyreklikk på den. En meny dukker opp med ulike valg.", tip: "Ser du ikke venstremenyen? Klikk på de tre strekene ☰ øverst til venstre for å åpne den.", screenshot: "steg-2-hoyreklikk", guideId: "shared-mailbox" },
    { number: 3, title: "Velg 'Legg til delt mappe'", instruction: "I menyen som dukker opp, klikk på «Legg til delt mappe eller postkasse». Et søkefelt åpner seg.", tip: "Ser du ikke dette alternativet? IT-avdelingen må gi deg tilgang til postkassen først.", screenshot: "steg-3-legg-til", guideId: "shared-mailbox" },
    { number: 4, title: "Søk og legg til postkassen", instruction: "Skriv inn navnet eller e-postadressen til den delte postkassen (f.eks. 'post' eller 'support'). Klikk på riktig postkasse i listen og trykk «Legg til».", tip: "Usikker på e-postadressen? Spør IT-avdelingen om det nøyaktige navnet.", screenshot: "steg-4-sok-postkasse", guideId: "shared-mailbox" },
    { number: 5, title: "Postkassen er klar til bruk", instruction: "Den delte postkassen vises nå i venstre meny under din vanlige innboks. Klikk på den for å se e-poster. For å sende fra den, velg «Fra»-feltet når du skriver ny e-post.", tip: "Innboksen oppdateres automatisk. Du kan svare på e-poster som om du var postkassen.", screenshot: "steg-5-ferdig", guideId: "shared-mailbox" },
  ],
  confirmation: { title: "Slik ser du at det fungerer", checks: ["Den delte postkassen vises i venstre meny i Outlook", "Du kan klikke deg inn og se e-postene", "Når du skriver ny e-post kan du velge postkassen i «Fra»-feltet"] },
  support: { label: "IT-support", phone: "22 00 00 00", email: "it@{domain}", portal: "https://support.{domain}", hours: "Man–fre 08:00–16:00" },
};

// ─── LAST NED OFFICE ──────────────────────────────────────────────
const INSTALL_OFFICE_GUIDE = {
  id: "install-office",
  title: "Laste ned og installere Microsoft 365 på PC",
  lastUpdated: "22. mars 2026",
  version: "Microsoft 365 Apps",
  difficulty: "Enkel",
  time: "15 min",
  description: "Du kan installere Word, Excel, PowerPoint, Outlook og mer gratis via din jobbkonto. Nedlastingen tar ca. 5 minutter, og installasjonen gjøres automatisk i bakgrunnen.",
  prerequisites: ["PC med Windows 10/11 eller Mac", "Internettforbindelse", "Din jobb-e-post og passord"],
  steps: [
    { number: 1, title: "Gå til portal.office.com", instruction: "Åpne nettleseren og gå til portal.office.com. Logg inn med din jobb-e-post og passord.", tip: "Bruk Edge eller Chrome for best opplevelse. Godkjenn gjerne MFA-varselet på telefonen.", screenshot: "steg-1-portal", guideId: "install-office" },
    { number: 2, title: "Klikk 'Installer Office'", instruction: "Øverst til høyre på forsiden ser du en knapp som heter «Installer Office» eller «Installer apper». Klikk på den.", tip: "Ser du ikke knappen? Klikk på de ni prikkene (app-ikonet) øverst til venstre og se etter Office-installasjonen.", screenshot: "steg-2-installer-knapp", guideId: "install-office" },
    { number: 3, title: "Start nedlastingen", instruction: "Velg «Microsoft 365-apper» fra menyen. En .exe-fil (Windows) eller .pkg-fil (Mac) lastes ned automatisk. Klikk «Lagre fil» hvis nettleseren spør.", tip: "Nedlastingen kan ta 2–5 minutter avhengig av internettforbindelsen.", screenshot: "steg-3-nedlasting", guideId: "install-office" },
    { number: 4, title: "Kjør installasjonsfilen", instruction: "Åpne den nedlastede filen (se i nedlastingsmappen din eller klikk på filen i nettleseren). Klikk «Ja» hvis Windows spør om tillatelse. Installasjonen starter automatisk.", tip: "Ikke lukk dette vinduet! Office installerer i bakgrunnen — det kan ta 10–20 minutter.", screenshot: "steg-4-installer", guideId: "install-office" },
    { number: 5, title: "Logg inn og aktiver Office", instruction: "Når installasjonen er ferdig, åpne f.eks. Word fra Start-menyen. Logg inn med din jobb-e-post for å aktivere Office. Du er klar til å bruke alle appene!", tip: "Bruker du Mac? Finn Office-appene i Finder → Programmer.", screenshot: "steg-5-aktiver", guideId: "install-office" },
  ],
  confirmation: { title: "Slik ser du at det fungerer", checks: ["Word, Excel og PowerPoint finnes i Start-menyen", "Åpne Word — øverst ser du at du er logget inn med jobb-e-posten din", "Du kan lagre filer direkte til OneDrive"] },
  support: { label: "IT-support", phone: "22 00 00 00", email: "it@{domain}", portal: "https://support.{domain}", hours: "Man–fre 08:00–16:00" },
};

// ─── TILBAKESTILLE PASSORD ────────────────────────────────────────
const PASSWORD_RESET_GUIDE = {
  id: "password-reset",
  title: "Tilbakestille passordet ditt selv",
  lastUpdated: "22. mars 2026",
  version: "Microsoft SSPR",
  difficulty: "Enkel",
  time: "3 min",
  description: "Har du glemt passordet eller blitt låst ute? Du kan tilbakestille passordet selv på under 3 minutter — uten å vente på IT-support. Alt du trenger er tilgang til telefonen eller e-posten du registrerte.",
  why: "Selvbetjent passordtilbakestilling (SSPR) sparer deg for ventetid og IT-avdelingen for unødvendige henvendelser. For at dette skal fungere må du ha registrert en alternativ e-post eller telefonnummer på forhånd.\n\nHar du ikke satt opp dette ennå? Gå til mysignins.microsoft.com mens du er innlogget, og legg til en sikkerhetskontaktmetode under «Sikkerhetsinformasjon».",
  prerequisites: ["Tilgang til telefonen eller e-posten du registrerte hos IT", "En nettleser (du trenger ikke logge inn)"],
  steps: [
    { number: 1, title: "Gå til tilbakestillingssiden", instruction: "Åpne nettleseren og gå til aka.ms/sspr (eller passwordreset.microsoftonline.com). Du trenger ikke være logget inn.", tip: "Kan du ikke huske adressen? På innloggingssiden til Microsoft er det en lenke: «Kan ikke logge på kontoen?»", screenshot: "steg-1-sspr", guideId: "password-reset" },
    { number: 2, title: "Skriv inn e-postadressen din", instruction: "Skriv inn din jobb-e-postadresse og skriv av sikkerhetsbildet (CAPTCHA). Klikk «Neste».", tip: "Bruk den fulle e-postadressen din, f.eks. navn@bedrift.no", screenshot: "steg-2-epost", guideId: "password-reset" },
    { number: 3, title: "Velg bekreftelsesmetode", instruction: "Velg hvordan du vil bekrefte hvem du er: via SMS til telefonen din, e-post til alternativ e-post, eller Microsoft Authenticator-appen. Klikk «Send».", tip: "Bruk den metoden du registrerte — vanligvis SMS eller Authenticator-appen.", screenshot: "steg-3-bekreft-metode", guideId: "password-reset" },
    { number: 4, title: "Bekreft koden", instruction: "Skriv inn koden du fikk på SMS, e-post eller fra Authenticator-appen. Klikk «Neste».", tip: "Koden er gyldig i noen minutter. Fikk du ikke koden? Sjekk søppelpost eller prøv en annen metode.", screenshot: "steg-4-skriv-kode", guideId: "password-reset" },
    { number: 5, title: "Sett nytt passord", instruction: "Skriv inn et nytt passord to ganger. Passordet må oppfylle bedriftens krav (vanligvis minst 8 tegn, store og små bokstaver, tall). Klikk «Fullfør».", tip: "Bruk et passord du husker, men ikke bruk navn, fødselsdato eller enkle ord.", screenshot: "steg-5-nytt-passord", guideId: "password-reset" },
    { number: 6, title: "Passordet er endret!", instruction: "Du ser en bekreftelse om at passordet er endret. Gå til portal.office.com og logg inn med det nye passordet ditt.", tip: "Husk å oppdatere passordet på telefonen din også, ellers kan kontoen bli låst.", screenshot: "steg-6-ferdig", guideId: "password-reset" },
  ],
  confirmation: { title: "Slik ser du at det fungerer", checks: ["Du kan logge inn på portal.office.com med det nye passordet", "Oppdater passordet på telefon og andre enheter"] },
  support: { label: "IT-support", phone: "22 00 00 00", email: "it@{domain}", portal: "https://support.{domain}", hours: "Man–fre 08:00–16:00" },
};

// ─── ONEDRIVE SYNKRONISERING ──────────────────────────────────────
const ONEDRIVE_SYNC_GUIDE = {
  id: "onedrive-sync",
  title: "Synkronisere filer med OneDrive",
  lastUpdated: "22. mars 2026",
  version: "OneDrive for Business",
  difficulty: "Enkel",
  time: "7 min",
  description: "Med OneDrive kan du lagre filer i skyen slik at de er tilgjengelige på alle enhetene dine — og er sikkerhetskopiert automatisk. Du finner filene dine i Windows Utforsker, akkurat som vanlige mapper.",
  prerequisites: ["Windows 10 eller 11 (OneDrive er innebygd)", "Din jobb-e-post og passord", "Internettforbindelse"],
  steps: [
    { number: 1, title: "Åpne OneDrive", instruction: "Klikk på skysymbolet i systemstatusfeltet (nede til høyre ved klokken). Ser du ikke skyikonet? Søk etter «OneDrive» i Start-menyen og åpne appen.", tip: "OneDrive er allerede installert på de fleste Windows 10/11-maskiner.", screenshot: "steg-1-aapne", guideId: "onedrive-sync" },
    { number: 2, title: "Logg inn med jobbkontoen", instruction: "Klikk «Logg på» og skriv inn din jobb-e-postadresse. Klikk «Logg på», skriv inn passordet, og godkjenn MFA om du blir bedt om det.", tip: "Sørg for å logge inn med din jobb-e-post (@bedrift.no), ikke en privat Microsoft-konto.", screenshot: "steg-2-logg-inn", guideId: "onedrive-sync" },
    { number: 3, title: "Velg OneDrive-mappen", instruction: "OneDrive spør deg om hvor du vil lagre synkroniserte filer på PC-en. Standardplasseringen er fin — klikk «Neste» for å godta.", tip: "Du kan alltid flytte mappen senere via OneDrive-innstillinger.", screenshot: "steg-3-velg-mappe", guideId: "onedrive-sync" },
    { number: 4, title: "Filene synkroniseres", instruction: "OneDrive begynner å synkronisere filene dine. En blå sirkel betyr «synkroniserer», en grønn hake betyr «ferdig». Dette kan ta noen minutter første gang.", tip: "Du kan bruke PC-en som normalt mens synkroniseringen pågår.", screenshot: "steg-4-synkroniserer", guideId: "onedrive-sync" },
    { number: 5, title: "Finn filene i Utforsker", instruction: "Åpne Windows Utforsker (mappeikonet i oppgavelinjen). Du ser nå «OneDrive – Bedriftsnavn» i venstremenyen. Her finner du alle skyfilene dine som vanlige filer.", tip: "Lagrer du filer i OneDrive-mappen er de automatisk sikkerhetskopiert. Aldri mer tapte filer!", screenshot: "steg-5-utforsker", guideId: "onedrive-sync" },
  ],
  confirmation: { title: "Slik ser du at det fungerer", checks: ["Et grønt hakemerke vises på skyikonet nede til høyre", "«OneDrive – Bedriftsnavn» vises i Windows Utforsker", "Filer du lagrer i OneDrive-mappen dukker opp på alle dine enheter"] },
  support: { label: "IT-support", phone: "22 00 00 00", email: "it@{domain}", portal: "https://support.{domain}", hours: "Man–fre 08:00–16:00" },
};

const TEAMS_MEETING_GUIDE = {
  id: "teams-first-meeting",
  title: "Delta i ditt første Teams-møte",
  lastUpdated: "23. mars 2026",
  version: "Microsoft Teams (nett/app)",
  difficulty: "Enkel",
  time: "5 min",
  description: "Fått en møteinvitasjon på e-post eller i Teams-kalenderen? Denne guiden viser deg steg for steg hvordan du finner møtet og deltar uten problemer — enten du bruker nettleser, Teams-appen eller mobil.",
  prerequisites: ["Microsoft Teams-appen installert, eller nettleseren Chrome/Edge", "En aktiv Microsoft 365-konto", "Mikrofon (og gjerne kamera)"],
  steps: [
    { number: 1, title: "Åpne Teams og gå til Kalender", instruction: "Åpne Teams-appen og klikk på Kalender-ikonet i venstre meny. Her ser du alle kommende møter. Finner du ikke møtet? Sjekk e-posten din — innkallingen inneholder alltid en lenke.", tip: "Du kan også klikke direkte på møtelenken i e-posten for å bli med uten å åpne Teams-appen.", screenshot: "steg-1-aapne-teams", guideId: "teams-first-meeting" },
    { number: 2, title: "Klikk på møtet for å se detaljer", instruction: "Klikk én gang på møtet i kalenderen. Et panel åpnes til høyre med tidspunkt, organisator og hvem som er invitert. Her finner du også knappen for å delta.", tip: "Ser du en lenke «Bli med i Teams-møte»? Den tar deg direkte inn i møterommet.", screenshot: "steg-2-se-motedetaljer", guideId: "teams-first-meeting" },
    { number: 3, title: "Klikk 'Delta i møte'", instruction: "Klikk på den grønne «Delta i møte»-knappen. Teams åpner et nytt vindu der du kan sjekke lyd og kamera før du går inn.", tip: "Du kan bli med opp til 15 minutter før møtet starter — ingen grunn til å vente til eksakt starttid.", screenshot: "steg-3-delta-klikk", guideId: "teams-first-meeting" },
    { number: 4, title: "Sjekk lyd og kamera", instruction: "Før du går inn ser du en forhåndsvisning. Slå på eller av mikrofon og kamera etter ønske. Klikk deretter «Delta nå» for å gå inn i møterommet.", tip: "Usikker på om mikrofonen fungerer? Du kan alltid skru den på/av inne i møtet. Start med mikrofon av hvis du er i et støyende miljø.", screenshot: "steg-4-sjekk-lyd-video", guideId: "teams-first-meeting" },
    { number: 5, title: "Du er inne i møtet!", instruction: "Nå er du inne i møterommet. Bruk kontrollene nederst for å slå av/på mikrofon og kamera, dele skjermen, eller forlate møtet. Møte-chatten finner du øverst til høyre.", tip: "Vil du si noe? Slå på mikrofonen og snakk, eller skriv i møte-chatten.", screenshot: "steg-5-inne-i-motet", guideId: "teams-first-meeting" },
  ],
  confirmation: { title: "Slik vet du at du er i møtet", checks: ["Du ser de andre deltakerne som videofelt eller initialer", "Kontrollene for mikrofon/kamera vises nederst", "Møtetittelen vises øverst i vinduet"] },
  support: { label: "IT-support", phone: "22 00 00 00", email: "it@{domain}", portal: "https://support.{domain}", hours: "Man–fre 08:00–16:00" },
};

const ONEDRIVE_SAVE_GUIDE = {
  id: "onedrive-save",
  title: "Lagre filer fra PC til OneDrive",
  lastUpdated: "23. mars 2026",
  version: "OneDrive for Business",
  difficulty: "Enkel",
  time: "5 min",
  description: "OneDrive lar deg lagre filer i skyen slik at de aldri går tapt — og er tilgjengelige på alle enheter. Denne guiden viser deg hvordan du enkelt lagrer filer fra PC-en din til OneDrive.",
  prerequisites: ["Windows 10 eller 11 med OneDrive installert", "Innlogget med jobbkontoen i OneDrive", "Filen du ønsker å lagre"],
  steps: [
    { number: 1, title: "Finn OneDrive i systemstatusfeltet", instruction: "Se ned i høyre hjørne av skjermen (ved klokken). Klikk på det blå sky-ikonet for å åpne OneDrive-menyen. Ser du ikke ikonet? Klikk på den lille pilen '∧' for å vise skjulte ikoner.", tip: "Ikonet er blått hvis OneDrive er koblet til jobbkontoen. Hvitt sky-ikon betyr privat Microsoft-konto.", screenshot: "steg-1-systemtray", guideId: "onedrive-save" },
    { number: 2, title: "Åpne OneDrive-mappen", instruction: "Klikk «Åpne OneDrive-mappen» i menyen. Windows Utforsker åpner seg og viser din OneDrive-mappe med alle synkroniserte filer.", tip: "Du kan også gå direkte til OneDrive-mappen via «OneDrive – Bedrift» i venstre meny i Windows Utforsker.", screenshot: "steg-2-onedrive-mappe", guideId: "onedrive-save" },
    { number: 3, title: "Dra filen din hit", instruction: "Åpne en annen Windows Utforsker-fane der filen din ligger. Dra og slipp filen inn i OneDrive-mappen. Du kan også bruke Kopier (Ctrl+C) og Lim inn (Ctrl+V).", tip: "Alternativt: klikk «Last opp» i OneDrive-menylinjen og velg filen.", screenshot: "steg-3-dra-fil", guideId: "onedrive-save" },
    { number: 4, title: "Filen lastes opp", instruction: "En liten blå synk-pil vises på filens ikon. Det betyr at filen lastes opp til skyen. Du ser også synk-aktivitet i sky-ikonet nede til høyre.", tip: "Ikke slå av PC-en eller internettforbindelsen under opplasting av store filer.", screenshot: "steg-4-synkroniserer", guideId: "onedrive-save" },
    { number: 5, title: "Grønt hake — filen er trygt lagret", instruction: "Når det grønne hake-ikonet vises på filen er opplastingen ferdig. Filen er nå lagret i skyen og tilgjengelig fra alle enheter og via office.com.", tip: "Du kan sjekke alle filene dine på nett ved å gå til office.com og klikke OneDrive.", screenshot: "steg-5-ferdig-synkronisert", guideId: "onedrive-save" },
  ],
  confirmation: { title: "Slik vet du at det fungerer", checks: ["Grønt hake-ikon vises på filen i OneDrive-mappen", "Filen er synlig når du logger inn på office.com → OneDrive", "Sky-ikonet nede til høyre viser 'Oppdatert'"] },
  support: { label: "IT-support", phone: "22 00 00 00", email: "it@{domain}", portal: "https://support.{domain}", hours: "Man–fre 08:00–16:00" },
};

const OUTLOOK_SETUP_GUIDE = {
  id: "outlook-setup-pc",
  title: "Sette opp Outlook på Windows PC",
  lastUpdated: "23. mars 2026",
  version: "Microsoft 365 / Outlook 2024",
  difficulty: "Enkel",
  time: "15 min",
  description: "Denne guiden viser deg hvordan du laster ned og setter opp Outlook på din Windows-PC, slik at du får tilgang til e-post, kalender og kontakter direkte fra skrivebordet.",
  prerequisites: ["Windows 10 eller 11", "Microsoft 365-lisens (sjekk med IT om du er usikker)", "Din jobb-e-postadresse og passord"],
  steps: [
    { number: 1, title: "Gå til portal.office.com og last ned Office", instruction: "Åpne en nettleser og gå til portal.office.com. Logg inn med din jobb-e-post. Klikk «Installer apper» øverst til høyre, og velg «Microsoft 365-apper». En installeringsfil lastes ned.", tip: "Har bedriften din allerede installert Office? Søk etter «Outlook» i Start-menyen — kanskje det allerede er der!", screenshot: "steg-1-portal", guideId: "outlook-setup-pc" },
    { number: 2, title: "Kjør installasjonsfilen", instruction: "Når nedlastingen er ferdig, klikk på filen (OfficeSetup.exe) i nedlastingsfeltet i nettleseren. Klikk «Åpne fil» og «Ja» hvis Windows spør om tillatelse.", tip: "Filen havner vanligvis i Nedlastinger-mappen din. Du kan også finne den via Windows Utforsker.", screenshot: "steg-2-kjor-installasjon", guideId: "outlook-setup-pc" },
    { number: 3, title: "Vent mens Office installeres", instruction: "En fremdriftslinje viser installeringsstatusen. Dette tar vanligvis 5–15 minutter avhengig av internettforbindelsen. La PC-en stå på og ikke lukk vinduet.", tip: "Lukk andre programmer under installasjonen for å gå raskere.", screenshot: "steg-3-installerer", guideId: "outlook-setup-pc" },
    { number: 4, title: "Start Outlook og skriv inn e-postadressen", instruction: "Søk etter «Outlook» i Start-menyen og åpne programmet. Skriv inn din jobb-e-postadresse i feltet og klikk «Koble til».", tip: "Bruk alltid jobb-e-posten din her (navn@bedrift.no), ikke en privat Gmail eller Hotmail-adresse.", screenshot: "steg-4-legg-til-konto", guideId: "outlook-setup-pc" },
    { number: 5, title: "Logg inn og godkjenn MFA", instruction: "Skriv inn passordet ditt og klikk «Logg på». Du vil bli bedt om å godkjenne innloggingen i Authenticator-appen på mobilen. Åpne appen og trykk «Godkjenn».", tip: "Har du ikke satt opp Authenticator-appen ennå? Se guiden «Sett opp MFA».", screenshot: "steg-5-logg-inn", guideId: "outlook-setup-pc" },
    { number: 6, title: "Outlook er klar — innboksen er åpen!", instruction: "Outlook åpner seg med innboksen din. E-poster, kalender og kontakter er nå tilgjengelig. Outlook synkroniserer automatisk nye e-poster i bakgrunnen.", tip: "Vil du ha Outlook på oppgavelinjen? Høyreklikk Outlook-ikonet og velg «Fest til oppgavelinjen».", screenshot: "steg-6-ferdig-innboks", guideId: "outlook-setup-pc" },
  ],
  confirmation: { title: "Slik vet du at Outlook er riktig satt opp", checks: ["Innboksen din vises med e-poster", "Kalender-ikonet i venstre meny viser møtene dine", "Nye e-poster ankommer automatisk"] },
  support: { label: "IT-support", phone: "22 00 00 00", email: "it@{domain}", portal: "https://support.{domain}", hours: "Man–fre 08:00–16:00" },
};

const MFA_GUIDE = {
  id: "setup-mfa",
  title: "Sette opp totrinnsbekreftelse (ekstra sikkerhet)",
  lastUpdated: "15. mars 2026",
  version: "Microsoft Authenticator 6.x",
  difficulty: "Enkel",
  time: "5 min",
  description: "Denne guiden viser deg hvordan du setter opp et ekstra sikkerhetslås på din Microsoft 365-konto. Etter dette vil kontoen din være beskyttet selv om noen skulle få tak i passordet ditt.",
  // Element 2: Hvorfor - vises fordi dette er en endring ansatte kan motstå
  why: "Microsoft 365 inneholder bedriftens e-post, filer og sensitive dokumenter. Passordet ditt alene er dessverre ikke nok lenger — hackere er veldig gode til å gjette eller stjæle passord.\n\nTotrinnsbekreftelse er som å ha ett ekstra lås på døren: selv om noen kjenner passordet ditt, kan de ikke logge inn uten å også ha telefonen din. Det tar bare 5 sekunder ekstra for deg hver gang — men stopper nesten alle innbruddsforsøk.\n\nDette er et krav fra bedriften din og gjelder alle ansatte. Du er i trygge hender — guiden nedenfor tar deg gjennom hvert steg.",
  confirmation: {
    title: "Slik ser du at det fungerer",
    checks: [
      "Du får en forespørsel på telefonen neste gang du logger inn",
      "Microsoft Authenticator-appen viser et tidsbasert tall (endres hvert 30. sekund)",
      "En grønn hake i Authenticator bekrefter at kontoen er koblet til",
    ]
  },
  support: {
    label: "IT-support",
    phone: "22 00 00 00",
    email: "it@{domain}",
    portal: "https://support.{domain}",
    hours: "Man–fre  08:00–16:00",
  },
  prerequisites: ["Smarttelefon (iPhone eller Android)", "Microsoft Authenticator-appen installert fra App Store / Google Play", "Du er pålogget på PC-en din"],
  steps: [
    { number: 1, title: "Logg inn med e-postadressen din", instruction: "Åpne nettleseren og gå til portal.office.com. Skriv inn din jobb-e-postadresse og klikk «Neste».", tip: "Bruk din vanlige jobbe-post — for eksempel navn@bedrift.no", screenshot: "steg-1-epost", guideId: "mfa-setup" },
    { number: 2, title: "Skriv inn passordet ditt", instruction: "Skriv inn passordet ditt og klikk «Logg på». Første gang du logger inn vil Microsoft automatisk starte sikkerhetsoppsettet.", tip: "Har du glemt passordet? Klikk «Jeg har glemt passordet» under passordfeltet.", screenshot: "steg-2-passord", guideId: "mfa-setup" },
    { number: 3, title: "Microsoft vil sikre kontoen din", instruction: "Du ser en side som heter «La oss sikre kontoen din». Dette er normalt og betyr at bedriften din krever ekstra sikkerhet. Klikk «Neste» for å fortsette.", tip: "Dette skjer kun første gang du logger inn. Etterpå tar det bare 2 sekunder ved fremtidige innlogginger.", screenshot: "steg-3-sikre-konto", guideId: "mfa-setup" },
    { number: 4, title: "Installer Microsoft Authenticator-appen", instruction: "Last ned Microsoft Authenticator-appen på telefonen din — den er gratis. Finn den i App Store (iPhone) eller Google Play (Android). Klikk «Neste» på PC-en når appen er installert.", tip: "Søk etter «Microsoft Authenticator» — pass på at det er Microsoft sitt logo (blå skjold med person).", screenshot: "steg-4-installer-authenticator", guideId: "mfa-setup" },
    { number: 5, title: "Skann QR-koden med telefonen", instruction: "Åpne Authenticator-appen på telefonen. Trykk på «+» øverst og velg «Jobb- eller skolekonto». Hold telefonen over QR-koden på PC-skjermen for å skanne den.", tip: "Ser du ikke QR-koden? Klikk «Kan ikke skanne bildet» for å legge inn koden manuelt.", screenshot: "steg-5-qr-kode", guideId: "mfa-setup" },
    { number: 6, title: "Godkjenn varselet på telefonen", instruction: "Klikk «Neste» på PC-en. Du vil nå få et varsel på telefonen din i Microsoft Authenticator-appen. Trykk «Godkjenn» på telefonen.", tip: "Varselet kan ta noen sekunder å komme. Ikke lukk PC-vinduet mens du venter.", screenshot: "steg-6-godkjenn-varsel", guideId: "mfa-setup" },
    { number: 7, title: "Ferdig — du er sikret!", instruction: "Du ser nå en bekreftelse om at sikkerhetsinformasjonen er lagret. Klikk «Ferdig» for å gå til Microsoft 365. Fra nå av vil du få et varsel på telefonen din ved innlogging.", tip: "Neste gang du logger inn tar det bare 2 sekunder: åpne telefonen og trykk «Godkjenn».", screenshot: "steg-7-fullfort", guideId: "mfa-setup" },
  ],
};

// Screenshot component — viser ekte PNG-bilde hvis tilgjengelig, ellers placeholder
function ScreenshotPlaceholder({ name, guideId, domain }) {
  const [imgError, setImgError] = useState(false);

  // Bygg bilde-URL basert på guide-ID og screenshot-navn
  const imgSrc = guideId ? `/screenshots/${guideId}/${name}.png` : null;

  // Fallback-tekster for placeholder
  const mockScreenshots = {
    "start-menu-outlook": { bg: "#1B1B1B", content: "Windows Start-meny med søk: 'Outlook'" },
    "outlook-email-input": { bg: "#F5F5F5", content: `Outlook — Skriv inn e-post: ola.nordmann@${domain}` },
    "outlook-password": { bg: "#F5F5F5", content: "Microsoft innlogging — Passord-felt" },
    "mfa-approve": { bg: "#F5F5F5", content: "Authenticator-appen — Trykk 'Godkjenn'" },
    "outlook-ready": { bg: "#0078D4", content: "Outlook er klar — Innboks vises" },
    "steg-1-epost": { bg: "#1a3a3a", content: "Microsoft 365 — Skriv inn e-postadresse" },
    "steg-2-passord": { bg: "#1a3a3a", content: "Microsoft 365 — Skriv inn passord" },
    "steg-3-sikre-konto": { bg: "#1a3a3a", content: "La oss sikre kontoen din — klikk Neste" },
    "steg-4-installer-authenticator": { bg: "#1a3a3a", content: "Installer Microsoft Authenticator-appen" },
    "steg-5-qr-kode": { bg: "#1a3a3a", content: "Skann QR-koden med Microsoft Authenticator" },
    "steg-6-godkjenn-varsel": { bg: "#1a3a3a", content: "Godkjenn varselet på telefonen" },
    "steg-7-fullfort": { bg: "#107C10", content: "Sikkerhetsinformasjon lagret — ferdig!" },
  };

  // Vis ekte bilde hvis tilgjengelig og ikke feilet
  if (imgSrc && !imgError) {
    return (
      <div style={{ margin: "12px 0", borderRadius: 8, overflow: "hidden", border: "1px solid #D1D1D1", background: "#f8f8f8" }}>
        <img
          src={imgSrc}
          alt={`Skjermbilde: ${name}`}
          onError={() => setImgError(true)}
          style={{ width: "100%", display: "block", maxHeight: 400, objectFit: "cover", objectPosition: "top" }}
        />
        <div style={{ padding: "6px 12px", fontSize: 11, color: "#888", borderTop: "1px solid #eee", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: "#107C10" }}>●</span> Automatisk skjermbilde — oppdatert mars 2026
        </div>
      </div>
    );
  }

  // Fallback placeholder
  const mock = mockScreenshots[name] || { bg: "#E0E0E0", content: name };
  return (
    <div style={{ background: mock.bg, borderRadius: 8, padding: "32px 24px", margin: "12px 0", border: "1px solid #D1D1D1", textAlign: "center", color: mock.bg === "#1B1B1B" || mock.bg === "#0078D4" || mock.bg === "#1a3a3a" || mock.bg === "#107C10" ? "#fff" : "#333", minHeight: 120, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
      <div style={{ fontSize: 12, opacity: 0.7, textTransform: "uppercase", letterSpacing: 1 }}>Automatisk skjermbilde</div>
      <div style={{ fontSize: 14, fontWeight: 500 }}>{mock.content}</div>
      <div style={{ fontSize: 11, opacity: 0.5, marginTop: 4 }}>Oppdatert: mars 2026</div>
    </div>
  );
}

// --- MAIN APP COMPONENT ---
// ─── WAITLIST SECTION ─────────────────────────────────────────
// Formspree endpoint: gå til formspree.io, opprett konto, lag nytt skjema
// og lim inn din form-ID nedenfor (erstatt XXXXXXXX):
const FORMSPREE_ID = "xwkjlbna"; // TODO: bytt med din egen Formspree-ID

function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | success | error

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, role, _subject: "Ny waitlist-påmelding — GuideHub 365" }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
        setRole("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div style={{ textAlign: "center", padding: "70px 40px" }}>
      <div style={{ maxWidth: 580, margin: "0 auto" }}>
        <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 600, letterSpacing: 1, marginBottom: 20, textTransform: "uppercase" }}>
          Tidlig tilgang
        </div>
        <h2 style={{ fontSize: 30, fontWeight: 700, margin: "0 0 14px" }}>
          Bli med på ventelisten
        </h2>
        <p style={{ fontSize: 16, opacity: 0.85, margin: "0 0 36px", lineHeight: 1.6 }}>
          Vi åpner for pilot-kunder snart. Meld deg på og få beskjed først — og tilbud om gratis pilot i 60 dager.
        </p>

        {status === "success" ? (
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 12, padding: "28px 32px", border: "1px solid rgba(255,255,255,0.3)" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Du er på lista!</div>
            <div style={{ fontSize: 14, opacity: 0.85 }}>Vi tar kontakt så snart pilot-plassene åpner. Sjekk e-posten din.</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="email"
              required
              placeholder="Din e-postadresse"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ padding: "14px 18px", borderRadius: 8, border: "none", fontSize: 15, outline: "none", width: "100%", boxSizing: "border-box" }}
            />
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              style={{ padding: "14px 18px", borderRadius: 8, border: "none", fontSize: 15, color: role ? "#242424" : "#888", outline: "none", width: "100%", boxSizing: "border-box" }}
            >
              <option value="" disabled>Hvem er du? (valgfritt)</option>
              <option value="smb">Leder / ansatt i en bedrift</option>
              <option value="msp">IT-konsulent / MSP</option>
              <option value="it-ansatt">IT-ansatt i bedrift</option>
              <option value="annet">Annet</option>
            </select>
            <button
              type="submit"
              disabled={status === "sending"}
              style={{ background: "#fff", color: "#0078D4", border: "none", borderRadius: 8, padding: "15px 32px", fontWeight: 700, fontSize: 16, cursor: status === "sending" ? "wait" : "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.15)", transition: "opacity 0.2s", opacity: status === "sending" ? 0.7 : 1 }}
            >
              {status === "sending" ? "Sender..." : "Meld meg på — gratis"}
            </button>
            {status === "error" && (
              <div style={{ fontSize: 13, color: "rgba(255,200,200,1)" }}>
                Noe gikk galt. Send en e-post direkte til mhesleskaug@gmail.com
              </div>
            )}
            <div style={{ fontSize: 12, opacity: 0.65, marginTop: 4 }}>
              Ingen spam. Kun én e-post når vi åpner. Du kan melde deg av når som helst.
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function GuideHub365() {
  // Check URL params — ?guides bypasses landing page for end users
  const urlParams = new URLSearchParams(window.location.search);
  const isUserMode = urlParams.has("guides") || urlParams.has("start");
  const [view, setView] = useState(isUserMode ? "dashboard" : "landing"); // landing | dashboard | category | guide | admin | pricing
  const [userMode] = useState(isUserMode); // true = enkel brukervisning (ingen salg)
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [companyDomain, setCompanyDomain] = useState("example.com");
  const [companyName, setCompanyName] = useState("Din Bedrift AS");
  const [companyLogo, setCompanyLogo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [showCompletionCheck, setShowCompletionCheck] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("no");
  const [showAdminSaved, setShowAdminSaved] = useState(false);
  const [demoGuide, setDemoGuide] = useState("outlook");

  const bg         = darkMode ? "#111118"              : "#F4F5F8";
  const cardBg     = darkMode ? "#1C1B26"              : "#FFFFFF";
  const textColor  = darkMode ? "#F1F1F3"              : "#0D0D12";
  const subtleText = darkMode ? "#8B8B99"              : "#71717A";
  const borderColor= darkMode ? "rgba(255,255,255,.07)": "rgba(0,0,0,.07)";
  const sidebarBg  = darkMode ? "#16151F"              : "#FFFFFF";
  const sidebarBorder = darkMode ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.07)";
  // Near-black primary (Salesforce-stil: sort pill-knapp)
  const primary    = darkMode ? "#E8E8F0"              : "#111118";
  const primaryFg  = darkMode ? "#111118"              : "#FFFFFF";
  // Aksentfarge for ikoner / aktive elementer
  const accent     = "#6366F1";
  const shadow     = "0 1px 3px rgba(0,0,0,.06), 0 2px 8px rgba(0,0,0,.04)";
  const shadowMd   = "0 4px 20px rgba(0,0,0,.09), 0 1px 4px rgba(0,0,0,.05)";

  // Filter guides based on search
  const allGuides = Object.entries(GUIDES).flatMap(([cat, guides]) =>
    guides.map((g) => ({ ...g, category: cat }))
  );
  const filteredGuides = searchQuery
    ? allGuides.filter((g) => g.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  // ---- LANDING PAGE ----
  if (view === "landing") {
    const features = [
      { icon: "refresh",   color: "#7C3AED", bg: "#EDE9FE", title: "Alltid oppdatert",        desc: "Automatisk overvåking av M365-endringer. Oppdatert innen 24 timer." },
      { icon: "settings",  color: "#0EA5E9", bg: "#E0F2FE", title: "Tilpasset din bedrift",   desc: "Bedriftens domene, logo og farger satt automatisk i alle guider." },
      { icon: "monitor",   color: "#10B981", bg: "#D1FAE5", title: "Automatiske skjermbilder",desc: "Skjermbilder oppdateres automatisk. Aldri mer utdaterte bilder." },
      { icon: "users",     color: "#F59E0B", bg: "#FEF3C7", title: "For vanlige brukere",     desc: "Enkelt språk, tydelige steg. Ingen IT-bakgrunn nødvendig." },
      { icon: "bar",       color: "#EF4444", bg: "#FEE2E2", title: "Innsikt & Analytics",     desc: "Se hvilke guider som brukes mest og mål effekten på support." },
      { icon: "globe",     color: "#8B5CF6", bg: "#EDE9FE", title: "Enkel integrasjon",       desc: "Teams, intranett, ServiceNow. SSO med Azure AD." },
    ];
    return (
      <div style={{ fontFamily: "'Inter','Segoe UI',-apple-system,sans-serif", background: "#FAFAFC", minHeight: "100vh", color: "#0D0D12" }}>

        {/* Nav */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 48px", height: 58, maxWidth: 1240, margin: "0 auto", borderBottom: "1px solid rgba(0,0,0,.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, background: "#111118", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Ic id="file" size={14} color="#fff" />
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: -0.4, color: "#0D0D12" }}>GuideHub<span style={{ color: accent }}>365</span></span>
          </div>
          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            {["Funksjoner", "Integrasjoner", "Kontakt"].map(lbl => (
              <span key={lbl} style={{ cursor: "pointer", fontSize: 13, color: "#71717A", fontWeight: 500 }}
                onMouseEnter={e => e.currentTarget.style.color = "#0D0D12"}
                onMouseLeave={e => e.currentTarget.style.color = "#71717A"}>{lbl}</span>
            ))}
            <span onClick={() => setView("pricing")} style={{ cursor: "pointer", fontSize: 13, color: "#71717A", fontWeight: 500 }}>Priser</span>
            <button onClick={() => setView("dashboard")} style={{ background: "#111118", color: "#fff", border: "none", borderRadius: 22, padding: "9px 20px", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
              Se demo →
            </button>
          </div>
        </div>

        {/* Hero */}
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "72px 48px 60px", display: "flex", gap: 64, alignItems: "center" }}>
          <div style={{ flex: 1, maxWidth: 540 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#EEF2FF", borderRadius: 22, padding: "4px 12px 4px 8px", fontSize: 12, fontWeight: 600, color: accent, marginBottom: 22 }}>
              <div style={{ width: 18, height: 18, borderRadius: 5, background: accent, display: "flex", alignItems: "center", justifyContent: "center" }}><Ic id="lightning" size={10} color="#fff" /></div>
              For bedrifter med Microsoft 365
            </div>
            <h1 style={{ fontSize: 46, fontWeight: 800, lineHeight: 1.1, margin: "0 0 20px", letterSpacing: -1.5, color: "#0D0D12" }}>
              M365-guider som<br/><span style={{ color: accent }}>alltid er oppdatert</span>
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: "#71717A", margin: "0 0 32px" }}>
              Reduser supporthenvendelser med 40%. Steg-for-steg guider for alle ansatte — automatisk oppdatert når Microsoft endrer noe.
            </p>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button onClick={() => setView("dashboard")}
                style={{ background: "#111118", color: "#fff", border: "none", borderRadius: 26, padding: "13px 28px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                Se live demo
              </button>
              <button onClick={() => setView("pricing")}
                style={{ background: "#fff", color: "#0D0D12", border: "1px solid rgba(0,0,0,.12)", borderRadius: 26, padding: "13px 24px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                Se priser
              </button>
            </div>
          </div>
          <div style={{ flex: 1, maxWidth: 480 }}>
            {/* Clean app preview card */}
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,.08)", boxShadow: "0 8px 40px rgba(0,0,0,.10), 0 1px 4px rgba(0,0,0,.04)", padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid rgba(0,0,0,.06)" }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Ic id="mail" size={17} color="#3B82F6" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#0D0D12" }}>Sette opp Outlook på PC</div>
                  <div style={{ fontSize: 11, color: "#71717A", marginTop: 1 }}>Oppdatert mars 2026 · 8 min</div>
                </div>
                <span style={{ marginLeft: "auto", fontSize: 11, background: "#ECFDF5", color: "#059669", padding: "2px 9px", borderRadius: 20, fontWeight: 700 }}>Enkel</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {[
                  { title: "Åpne Outlook", done: true },
                  { title: "Skriv inn e-postadressen din", done: true },
                  { title: "Logg inn med passord", done: false },
                  { title: "Godkjenn med MFA", done: false },
                ].map((step, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: step.done ? "#F0FDF4" : "#FAFAFA", borderRadius: 9, border: `1px solid ${step.done ? "#BBF7D0" : "rgba(0,0,0,.06)"}` }}>
                    <div style={{ width: 24, height: 24, borderRadius: 7, background: step.done ? "#10B981" : "#F1F1F5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {step.done ? <Ic id="check" size={12} color="#fff" strokeWidth={3} /> : <span style={{ fontSize: 11, fontWeight: 700, color: "#A1A1AA" }}>{i + 1}</span>}
                    </div>
                    <span style={{ fontSize: 13, color: step.done ? "#059669" : "#71717A", fontWeight: step.done ? 600 : 400 }}>{step.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ borderTop: "1px solid rgba(0,0,0,.07)", borderBottom: "1px solid rgba(0,0,0,.07)", padding: "28px 48px", background: "#fff" }}>
          <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", justifyContent: "space-around" }}>
            {[
              { number: "40%", label: "Færre supporthenvendelser" },
              { number: "78+",  label: "Ferdiglagde guider" },
              { number: "< 24t", label: "Til oppdatering" },
              { number: "100%", label: "Tilpasset din bedrift" },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1, color: "#0D0D12" }}>{stat.number}</div>
                <div style={{ fontSize: 12, color: "#71717A", marginTop: 3, fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div style={{ padding: "72px 48px", background: "#FAFAFC" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: -0.8, margin: "0 0 10px", color: "#0D0D12" }}>Hvorfor velge GuideHub 365?</h2>
              <p style={{ fontSize: 15, color: "#71717A", margin: 0 }}>Alt du trenger for å hjelpe ansatte med Microsoft 365</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {features.map((f, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "24px 22px", border: "1px solid rgba(0,0,0,.07)", boxShadow: "0 1px 4px rgba(0,0,0,.05)", transition: "box-shadow .2s, transform .2s" }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.09)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,.05)"; e.currentTarget.style.transform = "none"; }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: f.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                    <Ic id={f.icon} size={20} color={f.color} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, color: "#0D0D12" }}>{f.title}</div>
                  <div style={{ fontSize: 13, lineHeight: 1.65, color: "#71717A" }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Waitlist */}
        <WaitlistSection />
      </div>
    );
  }

  // ---- PRICING PAGE ----
  if (view === "pricing") {
    const plans = [
      {
        name: "SMB",
        subtitle: "For mindre bedrifter",
        price: "2 490",
        period: "/mnd",
        users: "Opptil 50 brukere",
        features: ["Alle standard-guider (78+)", "Bedriftstilpasning (logo, domene, farger)", "Automatiske oppdateringer", "Norsk og engelsk", "E-post support"],
        cta: "Start gratis prøveperiode",
        popular: false,
        accentColor: "#6366F1",
      },
      {
        name: "Professional",
        subtitle: "For mellomstore bedrifter",
        price: "4 990",
        period: "/mnd",
        users: "Opptil 250 brukere",
        features: ["Alt i SMB +", "Bruksanalyse & rapporter", "Egendefinerte guider", "Teams-integrasjon", "SSO med Azure AD", "Prioritert support", "Embed i intranett"],
        cta: "Start gratis prøveperiode",
        popular: true,
        accentColor: "#7C3AED",
      },
      {
        name: "MSP / Partner",
        subtitle: "For IT-konsulenter & MSP",
        price: "Kontakt oss",
        period: "",
        users: "Ubegrenset kunder",
        features: ["Alt i Professional +", "Multi-tenant administrasjon", "White-label (ditt merke)", "Automatisk onboarding av kunder", "API-tilgang", "Dedikert Customer Success", "Volumprising per tenant"],
        cta: "Book en demo",
        popular: false,
        accentColor: "#0EA5E9",
      },
    ];
    return (
      <div style={{ fontFamily: "'Inter','Segoe UI',-apple-system,sans-serif", background: "#FAFAFC", minHeight: "100vh", color: "#0D0D12" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 48px", height: 56, borderBottom: "1px solid rgba(0,0,0,.07)", background: "#fff" }}>
          <div onClick={() => setView("landing")} style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}>
            <div style={{ width: 26, height: 26, background: "#111118", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}><Ic id="file" size={13} color="#fff" /></div>
            <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: -0.4 }}>GuideHub<span style={{ color: accent }}>365</span></span>
          </div>
          <button onClick={() => setView("landing")} style={{ background: "#fff", color: "#0D0D12", border: "1px solid rgba(0,0,0,.10)", borderRadius: 22, padding: "7px 18px", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>← Tilbake</button>
        </div>
        <div style={{ maxWidth: 1060, margin: "0 auto", padding: "56px 48px 96px" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: -0.8, marginBottom: 10, color: "#0D0D12" }}>Enkel, forutsigbar prising</h1>
            <p style={{ fontSize: 15, color: "#71717A", margin: 0 }}>Alle planer inkluderer 14 dagers gratis prøveperiode.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, alignItems: "start" }}>
            {plans.map((plan, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "28px 24px", position: "relative", border: plan.popular ? `2px solid ${accent}` : "1px solid rgba(0,0,0,.08)", boxShadow: plan.popular ? "0 8px 32px rgba(99,102,241,.12)" : "0 1px 4px rgba(0,0,0,.05)", transition: "transform .2s, box-shadow .2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,.10)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = plan.popular ? "0 8px 32px rgba(99,102,241,.12)" : "0 1px 4px rgba(0,0,0,.05)"; }}>
                {plan.popular && (
                  <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: "#111118", color: "#fff", padding: "4px 16px", borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
                    Mest populær
                  </div>
                )}
                <div style={{ fontSize: 11, color: plan.accentColor, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>{plan.name}</div>
                <div style={{ fontSize: 13, color: "#71717A", marginBottom: 18 }}>{plan.subtitle}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 3 }}>
                  <span style={{ fontSize: plan.price === "Kontakt oss" ? 24 : 38, fontWeight: 800, letterSpacing: -1, color: "#0D0D12" }}>
                    {plan.price !== "Kontakt oss" ? `kr ${plan.price}` : plan.price}
                  </span>
                  <span style={{ fontSize: 13, color: "#71717A" }}>{plan.period}</span>
                </div>
                <div style={{ fontSize: 12, color: "#71717A", marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid rgba(0,0,0,.07)" }}>{plan.users}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 24 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 13, color: "#374151" }}>
                      <div style={{ width: 17, height: 17, borderRadius: 5, background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        <Ic id="check" size={10} color="#10B981" strokeWidth={3} />
                      </div>
                      {f}
                    </div>
                  ))}
                </div>
                <button onClick={() => setView("dashboard")} style={{ width: "100%", background: plan.popular ? "#111118" : "#F4F5F8", color: plan.popular ? "#fff" : "#0D0D12", border: "none", borderRadius: 11, padding: "12px 0", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 40, padding: "28px 40px", background: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,.07)" }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <Ic id="users" size={20} color={accent} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: "#0D0D12" }}>MSP Partnerprogram</h3>
            <p style={{ fontSize: 13, color: "#71717A", maxWidth: 540, margin: "0 auto", lineHeight: 1.7 }}>
              Tilby GuideHub 365 som en del av din managed service. Sentralisert administrasjon og volumprising fra kr 490/tenant/mnd.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ---- DASHBOARD / GUIDE VIEWS ----
  const handleCategoryClick = (catId) => {
    setSelectedCategory(catId);
    setSelectedGuide(null);
    setCurrentStep(0);
    setView("category");
  };

  const handleGuideClick = (guide) => {
    setSelectedGuide(guide);
    setCurrentStep(0);
    setShowCompletionCheck({});
    setView("guide");
  };

  const handleStepComplete = (stepNum) => {
    setShowCompletionCheck((prev) => ({ ...prev, [stepNum]: !prev[stepNum] }));
  };

  // Top bar
  const TopBar = () => (
    <div style={{ background: cardBg, borderBottom: `1px solid ${borderColor}`, padding: "0 20px 0 0", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
      {/* Left: logo block matches sidebar width */}
      <div style={{ width: sidebarOpen ? 244 : 54, flexShrink: 0, display: "flex", alignItems: "center", padding: "0 16px", gap: 10, borderRight: `1px solid ${borderColor}`, height: "100%", transition: "width 0.22s cubic-bezier(.4,0,.2,1)", overflow: "hidden" }}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 7, display: "flex", alignItems: "center", flexShrink: 0, transition: "background .15s" }}
          onMouseEnter={e => e.currentTarget.style.background = darkMode ? "rgba(255,255,255,.07)" : "#F1F1F4"}
          onMouseLeave={e => e.currentTarget.style.background = "none"}>
          <Ic id="menu" size={18} color={subtleText} />
        </button>
        {sidebarOpen && (
          <div onClick={() => { setView("dashboard"); setSelectedCategory(null); setSelectedGuide(null); }} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
            <div style={{ width: 26, height: 26, background: "#111118", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Ic id="file" size={13} color="#fff" />
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, color: textColor, letterSpacing: -0.5 }}>GuideHub<span style={{ color: accent }}>365</span></span>
          </div>
        )}
      </div>

      {/* Center: search */}
      <div style={{ flex: 1, maxWidth: 400, margin: "0 20px", position: "relative" }}>
        <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
          <Ic id="search" size={15} color={subtleText} />
        </div>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
          placeholder="Søk i guider..."
          style={{ width: "100%", padding: "8px 14px 8px 36px", borderRadius: 22, border: `1px solid ${borderColor}`, background: darkMode ? "rgba(255,255,255,.05)" : "#F4F5F8", color: textColor, fontSize: 13, outline: "none", boxSizing: "border-box" }}
        />
        {searchFocused && searchQuery && filteredGuides.length > 0 && (
          <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 12, boxShadow: shadowMd, maxHeight: 320, overflow: "auto", zIndex: 200 }}>
            {filteredGuides.slice(0, 6).map((g, i) => {
              const cat = CATEGORIES.find((c) => c.id === g.category);
              return (
                <div key={i} onClick={() => { handleGuideClick(g); setSearchQuery(""); }}
                  style={{ padding: "10px 16px", cursor: "pointer", borderBottom: i < 5 ? `1px solid ${borderColor}` : "none", fontSize: 13, color: textColor, display: "flex", alignItems: "center", gap: 12 }}
                  onMouseEnter={e => e.currentTarget.style.background = darkMode ? "rgba(255,255,255,.04)" : "#F8F8FB"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: cat?.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Ic id={cat?.icon} size={15} color={cat?.color} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{g.title}</div>
                    <div style={{ fontSize: 11, color: subtleText, marginTop: 1 }}>{cat?.label} · {g.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button onClick={() => setDarkMode(!darkMode)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 8, borderRadius: 8, display: "flex", alignItems: "center", transition: "background .15s" }}
          onMouseEnter={e => e.currentTarget.style.background = darkMode ? "rgba(255,255,255,.07)" : "#F1F1F4"}
          onMouseLeave={e => e.currentTarget.style.background = "none"}>
          <Ic id={darkMode ? "sun" : "moon"} size={17} color={subtleText} />
        </button>
        <button onClick={() => setView("admin")}
          style={{ background: "none", border: `1px solid ${borderColor}`, borderRadius: 22, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: subtleText, display: "flex", alignItems: "center", gap: 6, transition: "all .15s" }}
          onMouseEnter={e => { e.currentTarget.style.background = darkMode ? "rgba(255,255,255,.07)" : "#F1F1F4"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "none"; }}>
          <Ic id="settings" size={13} color={subtleText} /> Admin
        </button>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#111118", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>ON</div>
      </div>
    </div>
  );

  // Sidebar
  const Sidebar = () => (
    <div style={{ width: sidebarOpen ? 244 : 0, overflow: "hidden", transition: "width 0.22s cubic-bezier(.4,0,.2,1)", background: sidebarBg, borderRight: `1px solid ${sidebarBorder}`, flexShrink: 0, height: "calc(100vh - 54px)", position: "sticky", top: 54, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "12px 10px 8px", overflowY: "auto", flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: subtleText, textTransform: "uppercase", letterSpacing: 1.2, padding: "8px 10px 6px", whiteSpace: "nowrap" }}>Kategorier</div>
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat.id;
          return (
            <div key={cat.id} onClick={() => handleCategoryClick(cat.id)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", cursor: "pointer", borderRadius: 9, marginBottom: 1, background: active ? (darkMode ? "rgba(99,102,241,.15)" : "#EDEDF8") : "transparent", transition: "background .15s", whiteSpace: "nowrap" }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = darkMode ? "rgba(255,255,255,.05)" : "#F4F4F8"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: active ? cat.bg : (darkMode ? "rgba(255,255,255,.07)" : "#F1F1F5"), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background .15s" }}>
                <Ic id={cat.icon} size={15} color={active ? cat.color : subtleText} />
              </div>
              <span style={{ flex: 1, fontSize: 13, fontWeight: active ? 700 : 400, color: active ? (darkMode ? "#E0E0F0" : "#111118") : subtleText }}>{cat.label}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: active ? accent : subtleText, background: active ? (darkMode ? "rgba(99,102,241,.2)" : cat.bg) : (darkMode ? "rgba(255,255,255,.07)" : "#EBEBF0"), padding: "1px 7px", borderRadius: 9, minWidth: 20, textAlign: "center" }}>{cat.count}</span>
            </div>
          );
        })}

        {!userMode && (
          <>
            <div style={{ borderTop: `1px solid ${sidebarBorder}`, margin: "12px 4px 10px" }} />
            <div style={{ fontSize: 10, fontWeight: 700, color: subtleText, textTransform: "uppercase", letterSpacing: 1.2, padding: "0 10px 6px", whiteSpace: "nowrap" }}>Mer</div>
            {[
              { icon: "dollar", label: "Priser & Planer", action: () => setView("pricing") },
              { icon: "home",   label: "Landingsside",    action: () => setView("landing") },
            ].map((item) => (
              <div key={item.label} onClick={item.action}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", cursor: "pointer", borderRadius: 9, marginBottom: 1, transition: "background .15s", whiteSpace: "nowrap" }}
                onMouseEnter={e => e.currentTarget.style.background = darkMode ? "rgba(255,255,255,.05)" : "#F4F4F8"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: darkMode ? "rgba(255,255,255,.07)" : "#F1F1F5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Ic id={item.icon} size={15} color={subtleText} />
                </div>
                <span style={{ fontSize: 13, color: subtleText }}>{item.label}</span>
              </div>
            ))}
          </>
        )}
      </div>
      <div style={{ padding: "10px 20px", borderTop: `1px solid ${sidebarBorder}`, fontSize: 11, color: subtleText, fontWeight: 500, whiteSpace: "nowrap" }}>v1.0 · Mars 2026</div>
    </div>
  );

  // ---- ADMIN VIEW ----
  if (view === "admin") {
    const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${borderColor}`, background: darkMode ? "rgba(255,255,255,.04)" : "#F9FAFB", color: textColor, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", transition: "border-color .15s" };
    return (
      <div style={{ fontFamily: "'Inter','Segoe UI',-apple-system,sans-serif", background: bg, minHeight: "100vh", color: textColor }}>
        <TopBar />
        <div style={{ display: "flex" }}>
          <Sidebar />
          <div style={{ flex: 1, padding: "28px 36px", maxWidth: 820 }}>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px", letterSpacing: -0.4 }}>Bedriftsinnstillinger</h2>
              <p style={{ color: subtleText, fontSize: 14, margin: 0 }}>Tilpass guidene til din bedrift. Alle endringer oppdateres umiddelbart.</p>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
              {[
                { label: "Guide-visninger", value: "1 247", change: "+12%", icon: "bar",   color: "#7C3AED", bg: "#EDE9FE" },
                { label: "Unike brukere",   value: "89",    change: "+8%",  icon: "users", color: "#0EA5E9", bg: "#E0F2FE" },
                { label: "Fullført",        value: "634",   change: "+23%", icon: "check", color: "#10B981", bg: "#D1FAE5" },
              ].map((stat, i) => (
                <div key={i} style={{ background: cardBg, borderRadius: 16, border: `1px solid ${borderColor}`, padding: "20px 22px", boxShadow: shadow, display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Ic id={stat.icon} size={22} color={stat.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: textColor, letterSpacing: -0.5 }}>{stat.value}</div>
                    <div style={{ fontSize: 12, color: subtleText }}>{stat.label} <span style={{ color: "#10B981", fontWeight: 700 }}>{stat.change}</span></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Settings card */}
            <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${borderColor}`, padding: "24px 26px", marginBottom: 18, boxShadow: shadow }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 20px", color: textColor }}>Bedriftsprofil</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 7, color: textColor }}>Bedriftsnavn</label>
                  <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} style={inputStyle} onFocus={e => e.target.style.borderColor = primary} onBlur={e => e.target.style.borderColor = borderColor} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 7, color: textColor }}>E-postdomene (UPN)</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: subtleText, fontSize: 14, fontWeight: 500 }}>bruker@</span>
                    <input value={companyDomain} onChange={(e) => setCompanyDomain(e.target.value)} style={{ ...inputStyle, flex: 1 }} onFocus={e => e.target.style.borderColor = primary} onBlur={e => e.target.style.borderColor = borderColor} />
                  </div>
                  <p style={{ fontSize: 12, color: subtleText, marginTop: 7 }}>Eksempel: ola.nordmann@{companyDomain}</p>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 10, color: textColor }}>Primærfarge</label>
                  <div style={{ display: "flex", gap: 10 }}>
                    {["#7C3AED","#2563EB","#0891B2","#059669","#DC2626"].map((c) => (
                      <div key={c} style={{ width: 38, height: 38, borderRadius: 10, background: c, cursor: "pointer", border: "2px solid transparent", boxShadow: "0 2px 8px rgba(0,0,0,.15)", transition: "transform .15s" }}
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.12)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Integrations */}
            <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${borderColor}`, padding: "24px 26px", marginBottom: 24, boxShadow: shadow }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 18px", color: textColor }}>Integrasjoner</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { name: "Microsoft Teams", desc: "Vis guider som Teams-faner og bot", active: true,  icon: "chat",  color: "#8B5CF6", bg: "#EDE9FE" },
                  { name: "Azure AD SSO",    desc: "Single Sign-On for alle brukere",  active: true,  icon: "shield", color: "#10B981", bg: "#D1FAE5" },
                  { name: "ServiceNow",      desc: "Lenke guider fra support-tickets", active: false, icon: "wrench", color: "#F59E0B", bg: "#FEF3C7" },
                  { name: "SharePoint",      desc: "Embed guider i intranett-sider",   active: false, icon: "globe",  color: "#0EA5E9", bg: "#E0F2FE" },
                ].map((intg, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: darkMode ? "rgba(255,255,255,.03)" : "#F9FAFB", borderRadius: 12, border: `1px solid ${borderColor}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: intg.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Ic id={intg.icon} size={18} color={intg.color} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: textColor }}>{intg.name}</div>
                        <div style={{ fontSize: 12, color: subtleText }}>{intg.desc}</div>
                      </div>
                    </div>
                    <div style={{ width: 44, height: 24, borderRadius: 12, background: intg.active ? "#7C3AED" : (darkMode ? "rgba(255,255,255,.15)" : "#D1D5DB"), cursor: "pointer", position: "relative", flexShrink: 0 }}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: intg.active ? 23 : 3, transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,.2)" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => { setShowAdminSaved(true); setTimeout(() => setShowAdminSaved(false), 2000); }}
              style={{ background: `linear-gradient(135deg, ${primary}, #9333EA)`, color: "#fff", border: "none", borderRadius: 12, padding: "12px 32px", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: `0 4px 14px rgba(124,58,237,.35)` }}>
              Lagre endringer
            </button>
            {showAdminSaved && <span style={{ marginLeft: 14, color: "#10B981", fontSize: 13, fontWeight: 700 }}>✓ Lagret!</span>}
          </div>
        </div>
      </div>
    );
  }

  // ---- GUIDE DETAIL VIEW ----
  if (view === "guide") {
    const GUIDE_MAP = {
      "setup-mfa": MFA_GUIDE,
      "out-of-office": OUT_OF_OFFICE_GUIDE,
      "email-signature": EMAIL_SIGNATURE_GUIDE,
      "shared-mailbox": SHARED_MAILBOX_GUIDE,
      "install-office": INSTALL_OFFICE_GUIDE,
      "password-reset": PASSWORD_RESET_GUIDE,
      "onedrive-sync": ONEDRIVE_SYNC_GUIDE,
      "teams-first-meeting": TEAMS_MEETING_GUIDE,
      "onedrive-save": ONEDRIVE_SAVE_GUIDE,
      "outlook-setup-pc": OUTLOOK_SETUP_GUIDE,
    };
    const guide = GUIDE_MAP[selectedGuide?.id] || (demoGuide === "mfa" ? MFA_GUIDE : DETAILED_GUIDE);
    const stepsCompleted = Object.values(showCompletionCheck).filter(Boolean).length;
    const allDone = stepsCompleted === guide.steps.length;

    // Section label component
    const SectionLabel = ({ number, title, color = primary }) => (
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{number}</div>
        <span style={{ fontSize: 15, fontWeight: 700, color, letterSpacing: -0.2 }}>{title}</span>
      </div>
    );

    return (
      <div style={{ fontFamily: "'Inter','Segoe UI',-apple-system,sans-serif", background: bg, minHeight: "100vh", color: textColor }}>
        <TopBar />
        <div style={{ display: "flex" }}>
          <Sidebar />
          <div style={{ flex: 1, padding: "28px 36px", maxWidth: 860, minWidth: 0 }}>

            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: subtleText, marginBottom: 20 }}>
              <span onClick={() => setView("dashboard")} style={{ cursor: "pointer", color: primary, fontWeight: 500 }}>Hjem</span>
              <Ic id="chevron" size={13} color={subtleText} />
              <span onClick={() => { setView("category"); setSelectedCategory("email"); }} style={{ cursor: "pointer", color: primary, fontWeight: 500 }}>E-post & Kalender</span>
              <Ic id="chevron" size={13} color={subtleText} />
              <span style={{ color: textColor, fontWeight: 500 }}>{guide.title}</span>
            </div>

            {/* Demo switcher */}
            <div style={{ background: darkMode ? "rgba(124,58,237,.1)" : "#F5F3FF", borderRadius: 12, padding: "10px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", border: `1px solid ${darkMode ? "rgba(124,58,237,.2)" : "#DDD6FE"}` }}>
              <span style={{ fontSize: 11, color: primary, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>Demo</span>
              <button onClick={() => { setDemoGuide("outlook"); setShowCompletionCheck({}); }}
                style={{ padding: "5px 14px", borderRadius: 20, border: "none", background: demoGuide === "outlook" ? primary : (darkMode ? "rgba(255,255,255,.08)" : "#fff"), color: demoGuide === "outlook" ? "#fff" : textColor, cursor: "pointer", fontSize: 12, fontWeight: 600, boxShadow: demoGuide === "outlook" ? `0 2px 8px rgba(124,58,237,.35)` : "none" }}>
                ✉ Outlook (uten «Hvorfor»)
              </button>
              <button onClick={() => { setDemoGuide("mfa"); setShowCompletionCheck({}); }}
                style={{ padding: "5px 14px", borderRadius: 20, border: "none", background: demoGuide === "mfa" ? "#EA580C" : (darkMode ? "rgba(255,255,255,.08)" : "#fff"), color: demoGuide === "mfa" ? "#fff" : textColor, cursor: "pointer", fontSize: 12, fontWeight: 600, boxShadow: demoGuide === "mfa" ? "0 2px 8px rgba(234,88,12,.35)" : "none" }}>
                🛡 MFA (med «Hvorfor»)
              </button>
            </div>

            {/* Guide header with metadata */}
            <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${borderColor}`, padding: "24px 28px", marginBottom: 20, boxShadow: shadow }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 14px", letterSpacing: -0.4, color: textColor }}>{guide.title}</h1>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, padding: "4px 12px", background: "#D1FAE5", color: "#065F46", borderRadius: 20, fontWeight: 600 }}>{guide.difficulty}</span>
                <span style={{ fontSize: 12, padding: "4px 12px", background: darkMode ? "rgba(59,130,246,.15)" : "#DBEAFE", color: "#2563EB", borderRadius: 20, fontWeight: 600 }}>⏱ {guide.time}</span>
                <span style={{ fontSize: 12, padding: "4px 12px", background: darkMode ? "rgba(255,255,255,.07)" : "#F3F4F6", color: subtleText, borderRadius: 20 }}>🔄 {guide.lastUpdated}</span>
                <span style={{ fontSize: 12, padding: "4px 12px", background: darkMode ? "rgba(255,255,255,.07)" : "#F3F4F6", color: subtleText, borderRadius: 20 }}>{guide.version}</span>
              </div>
            </div>

            {/* Quick navigation */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
              {[
                { label: "1 · Beskrivelse",   color: primary },
                ...(guide.why ? [{ label: "2 · Hvorfor?", color: "#EA580C" }] : []),
                { label: guide.why ? "3 · Steg for steg" : "2 · Steg for steg", color: primary },
                { label: guide.why ? "4 · Sjekk resultatet" : "3 · Sjekk resultatet", color: "#10B981" },
                { label: guide.why ? "5 · Trenger du hjelp?" : "4 · Trenger du hjelp?", color: "#4F46E5" },
              ].map((item, i) => (
                <span key={i} style={{ fontSize: 12, padding: "5px 14px", borderRadius: 20, border: `1.5px solid ${item.color}`, color: item.color, cursor: "pointer", fontWeight: 600 }}>{item.label}</span>
              ))}
            </div>

            {/* Før du begynner */}
            <div style={{ background: darkMode ? "rgba(245,158,11,.10)" : "#FFFBEB", borderRadius: 14, border: `1.5px solid ${darkMode ? "rgba(245,158,11,.25)" : "#FDE68A"}`, padding: "16px 20px", marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: "#B45309", display: "flex", alignItems: "center", gap: 8 }}>
                <Ic id="lightning" size={16} color="#F59E0B" /> Før du begynner — ha dette klart:
              </div>
              {guide.prerequisites.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, marginBottom: i < guide.prerequisites.length - 1 ? 8 : 0, color: darkMode ? "#E0D090" : "#78350F" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#F59E0B", flexShrink: 0 }} />
                  {p}
                </div>
              ))}
            </div>

            {/* ── ELEMENT 1: Beskrivelse ── */}
            <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${borderColor}`, padding: "22px 24px", marginBottom: 14, boxShadow: shadow }}>
              <SectionLabel number="1" title="Beskrivelse" color={primary} />
              <p style={{ fontSize: 15, lineHeight: 1.75, color: darkMode ? "#C8D0E0" : "#374151", margin: 0 }}>
                {guide.description}
              </p>
            </div>

            {/* ── ELEMENT 2: Hvorfor gjør vi dette? (valgfri) ── */}
            {guide.why && (
              <div style={{ background: darkMode ? "rgba(249,115,22,.08)" : "#FFF7ED", borderRadius: 16, border: `1.5px solid ${darkMode ? "rgba(249,115,22,.2)" : "#FED7AA"}`, padding: "22px 24px", marginBottom: 14, boxShadow: shadow }}>
                <SectionLabel number="2" title="Hvorfor gjør vi dette?" color="#EA580C" />
                {guide.why.split("\n\n").map((para, i) => para.trim() && (
                  <p key={i} style={{ fontSize: 14, lineHeight: 1.7, color: darkMode ? "#E0D0A0" : "#4A3000", margin: i === 0 ? 0 : "12px 0 0" }}>
                    {para}
                  </p>
                ))}
              </div>
            )}

            {/* ── ELEMENT 3: Steg for steg (Hvordan gjør jeg det?) ── */}
            <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${borderColor}`, padding: "22px 24px", marginBottom: 14, boxShadow: shadow }}>
              <SectionLabel number={guide.why ? "3" : "2"} title="Hvordan gjør jeg det? — Steg for steg" color={primary} />

              {/* Progress */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: subtleText, marginBottom: 8, fontWeight: 500 }}>
                  <span>Fremgang</span>
                  <span style={{ color: stepsCompleted === guide.steps.length ? "#10B981" : subtleText, fontWeight: stepsCompleted === guide.steps.length ? 700 : 500 }}>{stepsCompleted} av {guide.steps.length} steg fullført</span>
                </div>
                <div style={{ height: 7, background: darkMode ? "rgba(255,255,255,.08)" : "#E5E7EB", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ height: 7, background: stepsCompleted === guide.steps.length ? "#10B981" : `linear-gradient(90deg, ${primary}, #9333EA)`, borderRadius: 10, width: `${(stepsCompleted / guide.steps.length) * 100}%`, transition: "width 0.35s cubic-bezier(.4,0,.2,1)" }} />
                </div>
              </div>

              {guide.steps.map((step, i) => (
                <div key={i} style={{ border: `1.5px solid ${showCompletionCheck[step.number] ? "#86EFAC" : borderColor}`, borderRadius: 14, padding: "18px 20px", marginBottom: 10, background: showCompletionCheck[step.number] ? (darkMode ? "rgba(16,185,129,.06)" : "#F0FDF4") : (darkMode ? "rgba(255,255,255,.01)" : "transparent"), transition: "all 0.25s" }}>
                  <div style={{ display: "flex", alignItems: "start", gap: 14 }}>
                    <div
                      onClick={() => handleStepComplete(step.number)}
                      style={{ width: 34, height: 34, borderRadius: 10, background: showCompletionCheck[step.number] ? "#10B981" : primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, cursor: "pointer", flexShrink: 0, transition: "background 0.25s", boxShadow: showCompletionCheck[step.number] ? "0 2px 8px rgba(16,185,129,.35)" : `0 2px 8px rgba(124,58,237,.3)` }}
                    >
                      {showCompletionCheck[step.number] ? <Ic id="check" size={16} color="#fff" strokeWidth={3} /> : step.number}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 600, margin: "2px 0 8px", color: showCompletionCheck[step.number] ? "#059669" : textColor }}>{step.title}</h3>
                      <p style={{ fontSize: 14, lineHeight: 1.65, color: darkMode ? "#C0C0D0" : "#374151", margin: "0 0 12px" }}>
                        {step.instruction.replace("{domain}", companyDomain)}
                      </p>
                      <ScreenshotPlaceholder name={step.screenshot} guideId={step.guideId || selectedGuide?.id} domain={companyDomain} />
                      {step.tip && (
                        <div style={{ marginTop: 12, padding: "10px 14px", background: darkMode ? "rgba(59,130,246,.12)" : "#EFF6FF", borderRadius: 10, fontSize: 13, color: darkMode ? "#93C5FD" : "#1D4ED8", display: "flex", gap: 8, alignItems: "flex-start", border: `1px solid ${darkMode ? "rgba(59,130,246,.2)" : "#BFDBFE"}` }}>
                          <span style={{ flexShrink: 0 }}>💡</span> {step.tip}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── ELEMENT 4: Hvordan vet jeg at jeg har gjort riktig? ── */}
            <div style={{ background: allDone ? (darkMode ? "rgba(16,185,129,.06)" : "#F0FDF4") : cardBg, borderRadius: 16, border: `1.5px solid ${allDone ? "#6EE7B7" : borderColor}`, padding: "22px 24px", marginBottom: 14, transition: "all 0.4s", boxShadow: shadow }}>
              <SectionLabel number={guide.why ? "4" : "3"} title="Hvordan vet jeg at jeg har gjort riktig?" color="#10B981" />
              {allDone && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#DCFCE7", borderRadius: 10, marginBottom: 16, border: "1px solid #86EFAC" }}>
                  <span style={{ fontSize: 20 }}>🎉</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#15803D" }}>Flott! Du har fullført alle stegene.</span>
                </div>
              )}
              <p style={{ fontSize: 14, color: subtleText, margin: "0 0 12px" }}>Etter at du har fulgt alle stegene, skal dette se riktig ut:</p>
              {guide.confirmation.checks.map((check, i) => (
                <div key={i} style={{ display: "flex", alignItems: "start", gap: 12, padding: "10px 14px", background: allDone ? (darkMode ? "rgba(16,185,129,.08)" : "#DCFCE7") : (darkMode ? "rgba(255,255,255,.03)" : "#F8FAF8"), borderRadius: 10, marginBottom: 8, border: `1px solid ${allDone ? "#86EFAC" : borderColor}`, transition: "all 0.3s" }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: allDone ? "#10B981" : (darkMode ? "rgba(255,255,255,.1)" : "#E5E7EB"), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {allDone && <Ic id="check" size={13} color="#fff" strokeWidth={3} />}
                  </div>
                  <span style={{ fontSize: 14, color: allDone ? (darkMode ? "#A0D4A0" : "#15803D") : (darkMode ? "#C0C0D0" : "#374151") }}>{check}</span>
                </div>
              ))}
              {!allDone && (
                <p style={{ fontSize: 12, color: subtleText, margin: "10px 0 0", fontStyle: "italic" }}>
                  Huk av hvert steg ovenfor når du er ferdig — så ser du her om alt er riktig.
                </p>
              )}
            </div>

            {/* ── ELEMENT 5: Hvem kontakter jeg? ── */}
            <div style={{ background: darkMode ? "rgba(99,102,241,.08)" : "#EEF2FF", borderRadius: 16, border: `1.5px solid ${darkMode ? "rgba(99,102,241,.2)" : "#C7D2FE"}`, padding: "22px 24px", marginBottom: 20, boxShadow: shadow }}>
              <SectionLabel number={guide.why ? "5" : "4"} title="Hvem kontakter jeg hvis jeg trenger hjelp?" color="#4F46E5" />
              <p style={{ fontSize: 14, color: subtleText, margin: "0 0 14px" }}>Stod du fast? Ta kontakt med din IT-support:</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { icn: "phone2", label: "Telefon",       value: guide.support.phone,                                      color: "#7C3AED", bg: "#EDE9FE" },
                  { icn: "mail",   label: "E-post",        value: guide.support.email.replace("{domain}", companyDomain),   color: "#3B82F6", bg: "#DBEAFE" },
                  { icn: "globe",  label: "Support-portal",value: guide.support.portal.replace("{domain}", companyDomain),  color: "#0EA5E9", bg: "#E0F2FE" },
                  { icn: "sun",    label: "Åpningstider",  value: guide.support.hours,                                      color: "#F59E0B", bg: "#FEF3C7" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: cardBg, borderRadius: 12, border: `1px solid ${borderColor}`, boxShadow: shadow }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Ic id={item.icn} size={18} color={item.color} />
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: subtleText, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>{item.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: textColor, marginTop: 2 }}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback */}
            <div style={{ padding: "20px 24px", background: cardBg, borderRadius: 16, border: `1px solid ${borderColor}`, textAlign: "center", marginBottom: 32, boxShadow: shadow }}>
              <div style={{ fontSize: 14, marginBottom: 14, color: subtleText, fontWeight: 500 }}>Var denne guiden nyttig for deg?</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
                <button style={{ padding: "9px 28px", borderRadius: 24, border: "1.5px solid #86EFAC", background: "#F0FDF4", cursor: "pointer", fontSize: 18, fontWeight: 600, color: "#15803D", transition: "all .15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#DCFCE7"}
                  onMouseLeave={e => e.currentTarget.style.background = "#F0FDF4"}>👍 Ja</button>
                <button style={{ padding: "9px 28px", borderRadius: 24, border: `1.5px solid ${borderColor}`, background: darkMode ? "rgba(255,255,255,.05)" : "#F9FAFB", cursor: "pointer", fontSize: 18, fontWeight: 600, color: subtleText, transition: "all .15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = darkMode ? "rgba(255,255,255,.08)" : "#F3F4F6"}
                  onMouseLeave={e => e.currentTarget.style.background = darkMode ? "rgba(255,255,255,.05)" : "#F9FAFB"}>👎 Nei</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ---- CATEGORY VIEW ----
  if (view === "category" && selectedCategory) {
    const cat = CATEGORIES.find((c) => c.id === selectedCategory);
    const guides = GUIDES[selectedCategory] || [];
    const diffColor = { Enkel: { bg: "#D1FAE5", color: "#065F46" }, Middels: { bg: "#FEF3C7", color: "#92400E" }, Avansert: { bg: "#FEE2E2", color: "#991B1B" } };
    return (
      <div style={{ fontFamily: "'Inter','Segoe UI',-apple-system,sans-serif", background: bg, minHeight: "100vh", color: textColor }}>
        <TopBar />
        <div style={{ display: "flex" }}>
          <Sidebar />
          <div style={{ flex: 1, padding: "28px 36px", maxWidth: 900 }}>

            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: subtleText, marginBottom: 24 }}>
              <span onClick={() => setView("dashboard")} style={{ cursor: "pointer", color: primary, fontWeight: 500 }}>Hjem</span>
              <Ic id="chevron" size={14} color={subtleText} />
              <span style={{ color: textColor, fontWeight: 500 }}>{cat?.label}</span>
            </div>

            {/* Category header */}
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 28, background: cardBg, borderRadius: 16, padding: "20px 24px", border: `1px solid ${borderColor}`, boxShadow: shadow }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: cat?.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Ic id={cat?.icon} size={26} color={cat?.color} />
              </div>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px", color: textColor }}>{cat?.label}</h2>
                <p style={{ fontSize: 13, color: subtleText, margin: 0 }}><span style={{ fontWeight: 700, color: cat?.color }}>{guides.length}</span> guider tilgjengelig · Oppdatert mars 2026</p>
              </div>
            </div>

            {/* Guide list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {guides.map((guide, i) => (
                <div key={i} onClick={() => handleGuideClick(guide)}
                  style={{ background: cardBg, borderRadius: 12, border: `1px solid ${borderColor}`, padding: "16px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: shadow, transition: "transform .15s, box-shadow .15s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateX(3px)"; e.currentTarget.style.boxShadow = shadowMd; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.boxShadow = shadow; }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: cat?.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Ic id={cat?.icon} size={18} color={cat?.color} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: textColor }}>{guide.title}</div>
                      <div style={{ fontSize: 12, color: subtleText, marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ padding: "1px 7px", borderRadius: 20, fontWeight: 600, ...(diffColor[guide.difficulty] || { bg: "#F3F4F6", color: "#6B7280" }) }}>{guide.difficulty}</span>
                        <span>⏱ {guide.time}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {guide.popular && (
                      <span style={{ fontSize: 11, padding: "3px 10px", background: darkMode ? "rgba(124,58,237,.2)" : "#EDE9FE", color: primary, borderRadius: 20, fontWeight: 600 }}>★ Populær</span>
                    )}
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: darkMode ? "rgba(255,255,255,.07)" : "#F5F6FA", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Ic id="arrowR" size={16} color={subtleText} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- DASHBOARD VIEW (default) ----
  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',-apple-system,sans-serif", background: bg, minHeight: "100vh", color: textColor }}>
      <TopBar />
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ flex: 1, padding: "32px 36px", minWidth: 0 }}>

          {/* Page header — clean, no gradient */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, color: subtleText, marginBottom: 6 }}>Microsoft 365 brukerhjelp</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px", letterSpacing: -0.6, color: textColor }}>
              {userMode ? "Hei! Her finner du hjelp til M365" : `${companyName}`}
            </h1>
            <p style={{ fontSize: 14, color: subtleText, margin: 0, lineHeight: 1.6 }}>
              Steg-for-steg guider for alle i bedriften. Alltid oppdatert.
            </p>
          </div>

          {/* Stats strip */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 32 }}>
            {[
              { val: "78+",  lbl: "Tilgjengelige guider", icon: "file",     color: "#6366F1", bg: "#EEF2FF", trend: "+6 denne måneden" },
              { val: "24t",  lbl: "Maks oppdateringstid", icon: "refresh",  color: "#10B981", bg: "#ECFDF5", trend: "Alltid aktuell" },
              { val: "100%", lbl: "Tilpasset din bedrift", icon: "settings", color: "#F59E0B", bg: "#FFFBEB", trend: "Logo, navn & domene" },
            ].map((s, i) => (
              <div key={i} style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 14, padding: "18px 22px", display: "flex", alignItems: "center", gap: 16, boxShadow: shadow }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Ic id={s.icon} size={21} color={s.color} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: textColor, letterSpacing: -0.8, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: textColor, marginTop: 3, marginBottom: 2 }}>{s.lbl}</div>
                  <div style={{ fontSize: 11, color: subtleText }}>{s.trend}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Popular guides */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, letterSpacing: -0.2, color: textColor }}>Mest brukte guider</h2>
              <p style={{ fontSize: 12, color: subtleText, margin: "2px 0 0" }}>De guidene kolleger åpner oftest</p>
            </div>
            <span style={{ fontSize: 12, color: accent, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>Se alle <Ic id="chevron" size={13} color={accent} /></span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 36 }}>
            {allGuides.filter((g) => g.popular).slice(0, 6).map((guide, i) => {
              const cat = CATEGORIES.find((c) => c.id === guide.category);
              return (
                <div key={i} onClick={() => handleGuideClick(guide)}
                  style={{ background: cardBg, borderRadius: 14, border: `1px solid ${borderColor}`, padding: "18px 20px", cursor: "pointer", boxShadow: shadow, transition: "box-shadow .18s ease, transform .18s ease" }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = shadowMd; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = shadow; e.currentTarget.style.transform = "none"; }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: cat?.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Ic id={cat?.icon} size={16} color={cat?.color} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: subtleText, letterSpacing: 0.2 }}>{cat?.label}</span>
                    {guide.popular && (
                      <span style={{ marginLeft: "auto", fontSize: 10, color: "#F59E0B", fontWeight: 700, background: "#FFFBEB", padding: "2px 7px", borderRadius: 20 }}>Populær</span>
                    )}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 12, lineHeight: 1.5, color: textColor, letterSpacing: -0.1 }}>{guide.title}</div>
                  <div style={{ display: "flex", gap: 6, borderTop: `1px solid ${borderColor}`, paddingTop: 10, marginTop: 2 }}>
                    <span style={{ fontSize: 11, padding: "3px 9px", background: "#ECFDF5", color: "#059669", borderRadius: 20, fontWeight: 600 }}>{guide.difficulty}</span>
                    <span style={{ fontSize: 11, padding: "3px 9px", background: darkMode ? "rgba(255,255,255,.07)" : "#F4F5F8", color: subtleText, borderRadius: 20 }}>{guide.time}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Categories */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, letterSpacing: -0.2, color: textColor }}>Alle kategorier</h2>
              <p style={{ fontSize: 12, color: subtleText, margin: "2px 0 0" }}>Finn guider etter tema</p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {CATEGORIES.map((cat) => (
              <div key={cat.id} onClick={() => handleCategoryClick(cat.id)}
                style={{ background: cardBg, borderRadius: 14, border: `1px solid ${borderColor}`, padding: "20px 18px", cursor: "pointer", boxShadow: shadow, transition: "box-shadow .18s ease, transform .18s ease" }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = shadowMd; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = shadow; e.currentTarget.style.transform = "none"; }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: cat.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 13 }}>
                  <Ic id={cat.icon} size={21} color={cat.color} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: textColor, letterSpacing: -0.1 }}>{cat.label}</div>
                <div style={{ fontSize: 12, color: subtleText, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontWeight: 700, color: cat.color }}>{cat.count}</span>
                  <span>guider</span>
                  <Ic id="chevron" size={12} color={subtleText} style={{ marginLeft: "auto" }} />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
                  }
