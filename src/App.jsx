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

// Sample guide data
const CATEGORIES = [
  { id: "onboarding", icon: "🖥️", label: "Kom i gang", count: 8, color: "#0078D4" },
  { id: "email", icon: "📧", label: "E-post & Kalender", count: 12, color: "#0F6CBD" },
  { id: "office", icon: "📄", label: "Office-apper", count: 15, color: "#107C10" },
  { id: "teams", icon: "💬", label: "Teams", count: 10, color: "#6264A7" },
  { id: "onedrive", icon: "☁️", label: "OneDrive & Filer", count: 7, color: "#0078D4" },
  { id: "security", icon: "🔒", label: "Sikkerhet & Passord", count: 6, color: "#D83B01" },
  { id: "mobile", icon: "📱", label: "Mobil & Nettbrett", count: 9, color: "#8764B8" },
  { id: "troubleshoot", icon: "🔧", label: "Feilsøking", count: 11, color: "#CA5010" },
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
    { id: "company-portal", title: "Bruke Bedriftsportalen for apper", difficulty: "Enkel", time: "5 min", popular: false },
  ],
  email: [
    { id: "setup-outlook", title: "Sette opp Outlook på PC", difficulty: "Enkel", time: "8 min", popular: true },
    { id: "setup-email-phone", title: "Sette opp e-post på mobil", difficulty: "Enkel", time: "5 min", popular: true },
    { id: "shared-mailbox", title: "Åpne en delt postkasse", difficulty: "Middels", time: "5 min", popular: true },
    { id: "email-signature", title: "Lage e-postsignatur", difficulty: "Enkel", time: "10 min", popular: true },
    { id: "calendar-share", title: "Dele kalender med kollegaer", difficulty: "Enkel", time: "5 min", popular: false },
    { id: "out-of-office", title: "Sette opp fraværsmelding", difficulty: "Enkel", time: "3 min", popular: true },
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

  const bg = darkMode ? "#1A1A2E" : "#F8F9FA";
  const cardBg = darkMode ? "#16213E" : "#FFFFFF";
  const textColor = darkMode ? "#E0E0E0" : "#242424";
  const subtleText = darkMode ? "#A0A0B0" : "#616161";
  const borderColor = darkMode ? "#2A2A4A" : "#E0E0E0";

  // Filter guides based on search
  const allGuides = Object.entries(GUIDES).flatMap(([cat, guides]) =>
    guides.map((g) => ({ ...g, category: cat }))
  );
  const filteredGuides = searchQuery
    ? allGuides.filter((g) => g.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  // ---- LANDING PAGE ----
  if (view === "landing") {
    return (
      <div style={{ fontFamily: "'Segoe UI', -apple-system, sans-serif", background: "linear-gradient(135deg, #0078D4 0%, #106EBE 40%, #005A9E 100%)", minHeight: "100vh", color: "#fff" }}>
        {/* Nav */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>
            <span style={{ opacity: 0.9 }}>Guide</span>Hub <span style={{ fontWeight: 400, fontSize: 16, opacity: 0.8 }}>365</span>
          </div>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <span onClick={() => setView("pricing")} style={{ cursor: "pointer", opacity: 0.9, fontSize: 14 }}>Priser</span>
            <span style={{ opacity: 0.9, fontSize: 14, cursor: "pointer" }}>Funksjoner</span>
            <span style={{ opacity: 0.9, fontSize: 14, cursor: "pointer" }}>Kontakt</span>
            <button onClick={() => setView("dashboard")} style={{ background: "#fff", color: "#0078D4", border: "none", borderRadius: 6, padding: "8px 20px", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
              Demo
            </button>
          </div>
        </div>

        {/* Hero */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 40px 60px", display: "flex", gap: 60, alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: 2, opacity: 0.8, marginBottom: 16 }}>
              For bedrifter som bruker Microsoft 365
            </div>
            <h1 style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.15, margin: "0 0 24px" }}>
              Brukervennlige guider som <span style={{ background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: 6 }}>alltid er oppdatert</span>
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.6, opacity: 0.9, margin: "0 0 36px", maxWidth: 500 }}>
              Reduser supporthenvendelser med opptil 40%. Gi dine ansatte steg-for-steg guider tilpasset deres tekniske nivå - automatisk oppdatert når Microsoft endrer noe.
            </p>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <button onClick={() => setView("dashboard")} style={{ background: "#fff", color: "#0078D4", border: "none", borderRadius: 8, padding: "14px 32px", fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
                Se live demo
              </button>
              <button onClick={() => setView("pricing")} style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, padding: "14px 32px", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>
                Se priser
              </button>
            </div>
          </div>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.1)", borderRadius: 16, padding: 32, backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.15)" }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 24, color: "#242424" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: "#0078D4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📧</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>Sette opp Outlook på PC</div>
                  <div style={{ fontSize: 12, color: "#616161" }}>Oppdatert: mars 2026 | 8 min</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["Åpne Outlook", "Skriv inn e-postadressen din", "Logg inn med passord", "Godkjenn med MFA"].map((step, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: i < 2 ? "#E8F5E9" : "#F5F5F5", borderRadius: 8, fontSize: 13 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: i < 2 ? "#4CAF50" : "#E0E0E0", color: i < 2 ? "#fff" : "#999", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                      {i < 2 ? "✓" : i + 1}
                    </div>
                    <span style={{ color: i < 2 ? "#2E7D32" : "#616161" }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Key stats */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 40px 80px", display: "flex", gap: 40, justifyContent: "center" }}>
          {[
            { number: "40%", label: "Færre supporthenvendelser" },
            { number: "78+", label: "Ferdiglagde guider" },
            { number: "24t", label: "Maks tid til oppdatering" },
            { number: "100%", label: "Tilpasset din bedrift" },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 36, fontWeight: 700 }}>{stat.number}</div>
              <div style={{ fontSize: 14, opacity: 0.8 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div style={{ background: "rgba(0,0,0,0.15)", padding: "60px 40px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 700, marginBottom: 48 }}>Hvorfor velge GuideHub 365?</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
              {[
                { icon: "🔄", title: "Alltid oppdatert", desc: "Automatisk overvåking av endringer i M365. Guidene oppdateres innen 24 timer når Microsoft ruller ut nytt design eller nye funksjoner." },
                { icon: "🏢", title: "Tilpasset din bedrift", desc: "Alle guider bruker bedriftens domene, logo og farger. Brukerne ser sine egne e-postadresser i eksemplene." },
                { icon: "📸", title: "Automatiske skjermbilder", desc: "Skjermbildene oppdateres automatisk når grensesnittene endres. Aldri mer utdaterte bilder i guidene." },
                { icon: "🎯", title: "For vanlige brukere", desc: "Skrevet for folk uten IT-bakgrunn. Klart, enkelt språk med tydelige steg-for-steg instruksjoner." },
                { icon: "📊", title: "Innsikt & Analytics", desc: "Se hvilke guider som brukes mest, hvor brukere sliter, og mål effekten på supporthenvendelser." },
                { icon: "🔗", title: "Enkel integrasjon", desc: "Bygg inn guidene i intranett, Teams eller ServiceNow. SSO-støtte med Azure AD." },
              ].map((f, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: 24, border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>{f.title}</div>
                  <div style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.85 }}>{f.desc}</div>
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
      },
    ];
    return (
      <div style={{ fontFamily: "'Segoe UI', -apple-system, sans-serif", background: "linear-gradient(135deg, #0078D4, #005A9E)", minHeight: "100vh", color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", maxWidth: 1200, margin: "0 auto" }}>
          <div onClick={() => setView("landing")} style={{ fontSize: 22, fontWeight: 700, cursor: "pointer" }}>
            Guide<span style={{ opacity: 0.8 }}>Hub</span> <span style={{ fontWeight: 400, fontSize: 16, opacity: 0.8 }}>365</span>
          </div>
          <button onClick={() => setView("landing")} style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "none", borderRadius: 6, padding: "8px 20px", cursor: "pointer", fontSize: 14 }}>Tilbake</button>
        </div>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 40px 80px" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>Enkel, forutsigbar prising</h1>
            <p style={{ fontSize: 16, opacity: 0.9 }}>Velg planen som passer din bedrift. Alle planer inkluderer 14 dagers gratis prøveperiode.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, alignItems: "start" }}>
            {plans.map((plan, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 16, padding: 32, color: "#242424", position: "relative", transform: plan.popular ? "scale(1.05)" : "none", boxShadow: plan.popular ? "0 8px 40px rgba(0,0,0,0.25)" : "0 2px 8px rgba(0,0,0,0.1)" }}>
                {plan.popular && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#107C10", color: "#fff", padding: "4px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                    Mest populær
                  </div>
                )}
                <div style={{ fontSize: 13, color: "#0078D4", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{plan.name}</div>
                <div style={{ fontSize: 13, color: "#616161", marginBottom: 16 }}>{plan.subtitle}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                  <span style={{ fontSize: plan.price === "Kontakt oss" ? 24 : 40, fontWeight: 700 }}>
                    {plan.price !== "Kontakt oss" ? `kr ${plan.price}` : plan.price}
                  </span>
                  <span style={{ fontSize: 14, color: "#616161" }}>{plan.period}</span>
                </div>
                <div style={{ fontSize: 13, color: "#616161", marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid #E0E0E0" }}>{plan.users}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 14, color: "#424242" }}>
                      <span style={{ color: "#107C10", fontWeight: 700, fontSize: 14, marginTop: 1 }}>✓</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => setView("dashboard")} style={{ width: "100%", background: plan.popular ? "#0078D4" : "#F5F5F5", color: plan.popular ? "#fff" : "#242424", border: "none", borderRadius: 8, padding: "12px 0", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 48, padding: 32, background: "rgba(255,255,255,0.1)", borderRadius: 16 }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>MSP Partnerprogram</h3>
            <p style={{ fontSize: 14, opacity: 0.9, maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
              Tilby GuideHub 365 som en del av din managed service. Gi alle dine kunder tilpassede guider under ditt eget merke, med sentralisert administrasjon og volumprising fra kr 490/tenant/mnd.
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
    <div style={{ background: cardBg, borderBottom: `1px solid ${borderColor}`, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: textColor, padding: 4 }}>☰</button>
        <div onClick={() => { setView("dashboard"); setSelectedCategory(null); setSelectedGuide(null); }} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#0078D4" }}>GuideHub</span>
          <span style={{ fontSize: 14, color: subtleText }}>365</span>
          <span style={{ fontSize: 12, color: subtleText, marginLeft: 8 }}>|</span>
          <span style={{ fontSize: 13, color: subtleText, marginLeft: 8 }}>{companyName}</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, maxWidth: 400, margin: "0 24px", position: "relative" }}>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
          placeholder="Søk i guider..."
          style={{ width: "100%", padding: "8px 12px 8px 36px", borderRadius: 8, border: `1px solid ${borderColor}`, background: darkMode ? "#0E1628" : "#F5F5F5", color: textColor, fontSize: 13, outline: "none" }}
        />
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: subtleText }}>🔍</span>
        {searchFocused && searchQuery && filteredGuides.length > 0 && (
          <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, marginTop: 4, boxShadow: "0 4px 16px rgba(0,0,0,0.15)", maxHeight: 300, overflow: "auto", zIndex: 200 }}>
            {filteredGuides.slice(0, 6).map((g, i) => (
              <div key={i} onClick={() => { handleGuideClick(g); setSearchQuery(""); }} style={{ padding: "10px 14px", cursor: "pointer", borderBottom: `1px solid ${borderColor}`, fontSize: 13, color: textColor }}>
                <div style={{ fontWeight: 500 }}>{g.title}</div>
                <div style={{ fontSize: 11, color: subtleText, marginTop: 2 }}>{CATEGORIES.find((c) => c.id === g.category)?.label} · {g.time}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => setDarkMode(!darkMode)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>{darkMode ? "☀️" : "🌙"}</button>
        <button onClick={() => setView("admin")} style={{ background: "none", border: `1px solid ${borderColor}`, borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12, color: subtleText }}>Admin</button>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#0078D4", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600 }}>ON</div>
      </div>
    </div>
  );

  // Sidebar
  const Sidebar = () => (
    <div style={{ width: sidebarOpen ? 240 : 0, overflow: "hidden", transition: "width 0.2s", background: cardBg, borderRight: `1px solid ${borderColor}`, flexShrink: 0, height: "calc(100vh - 53px)", position: "sticky", top: 53 }}>
      <div style={{ padding: "16px 16px 8px", fontSize: 11, fontWeight: 600, color: subtleText, textTransform: "uppercase", letterSpacing: 1 }}>Kategorier</div>
      {CATEGORIES.map((cat) => (
        <div key={cat.id} onClick={() => handleCategoryClick(cat.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", cursor: "pointer", background: selectedCategory === cat.id ? (darkMode ? "#1A2744" : "#EBF5FF") : "transparent", borderLeft: selectedCategory === cat.id ? "3px solid #0078D4" : "3px solid transparent", fontSize: 13, color: textColor }}>
          <span>{cat.icon}</span>
          <span style={{ flex: 1 }}>{cat.label}</span>
          <span style={{ fontSize: 11, color: subtleText, background: darkMode ? "#2A2A4A" : "#F0F0F0", padding: "2px 6px", borderRadius: 10 }}>{cat.count}</span>
        </div>
      ))}
      {!userMode && (
        <div style={{ borderTop: `1px solid ${borderColor}`, margin: "12px 16px 0", paddingTop: 12 }}>
          <div onClick={() => setView("pricing")} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", cursor: "pointer", fontSize: 13, color: subtleText }}>
            <span>💰</span> Priser & Planer
          </div>
          <div onClick={() => setView("landing")} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", cursor: "pointer", fontSize: 13, color: subtleText }}>
            <span>🏠</span> Landingsside
          </div>
        </div>
      )}
    </div>
  );

  // ---- ADMIN VIEW ----
  if (view === "admin") {
    return (
      <div style={{ fontFamily: "'Segoe UI', -apple-system, sans-serif", background: bg, minHeight: "100vh", color: textColor }}>
        <TopBar />
        <div style={{ display: "flex" }}>
          <Sidebar />
          <div style={{ flex: 1, padding: 32, maxWidth: 800 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px" }}>Bedriftsinnstillinger</h2>
            <p style={{ color: subtleText, fontSize: 14, margin: "0 0 32px" }}>Tilpass guidene til din bedrift. Alle endringer oppdateres umiddelbart i alle guider.</p>

            <div style={{ background: cardBg, borderRadius: 12, border: `1px solid ${borderColor}`, padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 20px" }}>Generelt</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Bedriftsnavn</label>
                  <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${borderColor}`, background: darkMode ? "#0E1628" : "#F8F8F8", color: textColor, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>E-postdomene (UPN)</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: subtleText, fontSize: 14 }}>bruker@</span>
                    <input value={companyDomain} onChange={(e) => setCompanyDomain(e.target.value)} style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: `1px solid ${borderColor}`, background: darkMode ? "#0E1628" : "#F8F8F8", color: textColor, fontSize: 14, outline: "none" }} />
                  </div>
                  <p style={{ fontSize: 12, color: subtleText, marginTop: 6 }}>Alle guider vil automatisk bruke dette domenet i eksempler (f.eks. ola.nordmann@{companyDomain})</p>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Primærfarge</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["#0078D4", "#107C10", "#D83B01", "#5C2D91", "#008575"].map((c) => (
                      <div key={c} style={{ width: 36, height: 36, borderRadius: 8, background: c, cursor: "pointer", border: "2px solid transparent" }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: cardBg, borderRadius: 12, border: `1px solid ${borderColor}`, padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 20px" }}>Integrasjoner</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { name: "Microsoft Teams", desc: "Vis guider som Teams-faner og bot", active: true },
                  { name: "Azure AD SSO", desc: "Single Sign-On for alle brukere", active: true },
                  { name: "ServiceNow", desc: "Lenke guider fra support-tickets", active: false },
                  { name: "SharePoint Intranett", desc: "Embed guider i intranett-sider", active: false },
                ].map((integration, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: darkMode ? "#0E1628" : "#F8F8F8", borderRadius: 8 }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{integration.name}</div>
                      <div style={{ fontSize: 12, color: subtleText }}>{integration.desc}</div>
                    </div>
                    <div style={{ width: 44, height: 24, borderRadius: 12, background: integration.active ? "#107C10" : "#CCC", cursor: "pointer", position: "relative" }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: integration.active ? 22 : 2, transition: "left 0.2s" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: cardBg, borderRadius: 12, border: `1px solid ${borderColor}`, padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 20px" }}>Bruksstatistikk (siste 30 dager)</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {[
                  { label: "Guide-visninger", value: "1 247", change: "+12%" },
                  { label: "Unike brukere", value: "89", change: "+8%" },
                  { label: "Fullførte guider", value: "634", change: "+23%" },
                ].map((stat, i) => (
                  <div key={i} style={{ textAlign: "center", padding: 16, background: darkMode ? "#0E1628" : "#F8F8F8", borderRadius: 8 }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: "#0078D4" }}>{stat.value}</div>
                    <div style={{ fontSize: 12, color: subtleText, marginTop: 4 }}>{stat.label}</div>
                    <div style={{ fontSize: 12, color: "#107C10", marginTop: 4, fontWeight: 600 }}>{stat.change}</div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => { setShowAdminSaved(true); setTimeout(() => setShowAdminSaved(false), 2000); }} style={{ marginTop: 24, background: "#0078D4", color: "#fff", border: "none", borderRadius: 8, padding: "12px 32px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
              Lagre endringer
            </button>
            {showAdminSaved && <span style={{ marginLeft: 12, color: "#107C10", fontSize: 13, fontWeight: 500 }}>Lagret!</span>}
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
    };
    const guide = GUIDE_MAP[selectedGuide?.id] || (demoGuide === "mfa" ? MFA_GUIDE : DETAILED_GUIDE);
    const stepsCompleted = Object.values(showCompletionCheck).filter(Boolean).length;
    const allDone = stepsCompleted === guide.steps.length;

    // Section label component
    const SectionLabel = ({ number, title, color = "#0078D4", bg = "#EBF5FF" }) => (
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{number}</div>
        <span style={{ fontSize: 15, fontWeight: 700, color }}>{title}</span>
      </div>
    );

    return (
      <div style={{ fontFamily: "'Segoe UI', -apple-system, sans-serif", background: bg, minHeight: "100vh", color: textColor }}>
        <TopBar />
        <div style={{ display: "flex" }}>
          <Sidebar />
          <div style={{ flex: 1, padding: "24px 32px", maxWidth: 820, margin: "0 auto" }}>

            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: subtleText, marginBottom: 16 }}>
              <span onClick={() => setView("dashboard")} style={{ cursor: "pointer" }}>Hjem</span>
              <span>/</span>
              <span onClick={() => { setView("category"); setSelectedCategory("email"); }} style={{ cursor: "pointer" }}>E-post & Kalender</span>
              <span>/</span>
              <span style={{ color: textColor }}>{guide.title}</span>
            </div>

            {/* Demo switcher */}
            <div style={{ background: darkMode ? "#1A2744" : "#EBF5FF", borderRadius: 10, padding: "10px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: subtleText, fontWeight: 600 }}>DEMO — Velg guide:</span>
              <button onClick={() => { setDemoGuide("outlook"); setShowCompletionCheck({}); }} style={{ padding: "5px 14px", borderRadius: 6, border: "none", background: demoGuide === "outlook" ? "#0078D4" : (darkMode ? "#2A3A5C" : "#fff"), color: demoGuide === "outlook" ? "#fff" : textColor, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                📧 Sette opp Outlook (uten «Hvorfor»)
              </button>
              <button onClick={() => { setDemoGuide("mfa"); setShowCompletionCheck({}); }} style={{ padding: "5px 14px", borderRadius: 6, border: "none", background: demoGuide === "mfa" ? "#CA5010" : (darkMode ? "#2A3A5C" : "#fff"), color: demoGuide === "mfa" ? "#fff" : textColor, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                🛡️ MFA-oppsett (med «Hvorfor»)
              </button>
            </div>

            {/* Guide header with metadata */}
            <div style={{ background: cardBg, borderRadius: 12, border: `1px solid ${borderColor}`, padding: "24px 28px", marginBottom: 20 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 12px" }}>{guide.title}</h1>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, padding: "4px 12px", background: "#E8F5E9", color: "#2E7D32", borderRadius: 20 }}>{guide.difficulty}</span>
                <span style={{ fontSize: 12, padding: "4px 12px", background: darkMode ? "#1A2744" : "#E3F2FD", color: "#0078D4", borderRadius: 20 }}>⏱ {guide.time}</span>
                <span style={{ fontSize: 12, padding: "4px 12px", background: darkMode ? "#2A2A4A" : "#F5F5F5", color: subtleText, borderRadius: 20 }}>Oppdatert: {guide.lastUpdated}</span>
                <span style={{ fontSize: 12, padding: "4px 12px", background: darkMode ? "#2A2A4A" : "#F5F5F5", color: subtleText, borderRadius: 20 }}>{guide.version}</span>
              </div>
            </div>

            {/* Quick navigation */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
              {[
                { label: "1 · Beskrivelse", color: "#0078D4" },
                ...(guide.why ? [{ label: "2 · Hvorfor?", color: "#CA5010" }] : []),
                { label: guide.why ? "3 · Steg for steg" : "2 · Steg for steg", color: "#0078D4" },
                { label: guide.why ? "4 · Sjekk resultatet" : "3 · Sjekk resultatet", color: "#107C10" },
                { label: guide.why ? "5 · Trenger du hjelp?" : "4 · Trenger du hjelp?", color: "#003F7D" },
              ].map((item, i) => (
                <span key={i} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 20, border: `1px solid ${item.color}`, color: item.color, cursor: "pointer", fontWeight: 500 }}>{item.label}</span>
              ))}
            </div>

            {/* Før du begynner */}
            <div style={{ background: darkMode ? "#1A2744" : "#FFF8E1", borderRadius: 12, border: `1px solid ${darkMode ? "#2A3A5C" : "#FFE082"}`, padding: 20, marginBottom: 20 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10, color: darkMode ? "#FFE082" : "#F57F17" }}>⚡ Før du begynner — ha dette klart:</div>
              {guide.prerequisites.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 6, color: darkMode ? "#E0E0E0" : "#424242" }}>
                  <span style={{ color: darkMode ? "#FFE082" : "#FFA000" }}>•</span> {p}
                </div>
              ))}
            </div>

            {/* ── ELEMENT 1: Beskrivelse ── */}
            <div style={{ background: cardBg, borderRadius: 12, border: `1px solid ${borderColor}`, padding: 24, marginBottom: 16 }}>
              <SectionLabel number="1" title="Beskrivelse" color="#0078D4" />
              <p style={{ fontSize: 15, lineHeight: 1.7, color: darkMode ? "#C8D0E0" : "#3C3C3C", margin: 0 }}>
                {guide.description}
              </p>
            </div>

            {/* ── ELEMENT 2: Hvorfor gjør vi dette? (valgfri) ── */}
            {guide.why && (
              <div style={{ background: darkMode ? "#1E1A10" : "#FFF8E1", borderRadius: 12, border: `1px solid ${darkMode ? "#4A3A10" : "#FFD54F"}`, padding: 24, marginBottom: 16 }}>
                <SectionLabel number="2" title="Hvorfor gjør vi dette?" color="#CA5010" />
                {guide.why.split("\n\n").map((para, i) => para.trim() && (
                  <p key={i} style={{ fontSize: 14, lineHeight: 1.7, color: darkMode ? "#E0D0A0" : "#4A3000", margin: i === 0 ? 0 : "12px 0 0" }}>
                    {para}
                  </p>
                ))}
              </div>
            )}

            {/* ── ELEMENT 3: Steg for steg (Hvordan gjør jeg det?) ── */}
            <div style={{ background: cardBg, borderRadius: 12, border: `1px solid ${borderColor}`, padding: 24, marginBottom: 16 }}>
              <SectionLabel number={guide.why ? "3" : "2"} title="Hvordan gjør jeg det? — Steg for steg" color="#0078D4" />

              {/* Progress */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: subtleText, marginBottom: 6 }}>
                  <span>Fremgang</span>
                  <span>{stepsCompleted} av {guide.steps.length} steg fullført</span>
                </div>
                <div style={{ height: 6, background: darkMode ? "#2A2A4A" : "#E0E0E0", borderRadius: 3 }}>
                  <div style={{ height: 6, background: "#107C10", borderRadius: 3, width: `${(stepsCompleted / guide.steps.length) * 100}%`, transition: "width 0.3s" }} />
                </div>
              </div>

              {guide.steps.map((step, i) => (
                <div key={i} style={{ border: `1px solid ${showCompletionCheck[step.number] ? "#A5D6A7" : borderColor}`, borderRadius: 10, padding: 20, marginBottom: 12, background: showCompletionCheck[step.number] ? (darkMode ? "#0E2010" : "#F0FBF0") : "transparent", transition: "all 0.3s" }}>
                  <div style={{ display: "flex", alignItems: "start", gap: 14 }}>
                    <div
                      onClick={() => handleStepComplete(step.number)}
                      style={{ width: 32, height: 32, borderRadius: "50%", background: showCompletionCheck[step.number] ? "#4CAF50" : "#0078D4", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, cursor: "pointer", flexShrink: 0, transition: "background 0.3s" }}
                    >
                      {showCompletionCheck[step.number] ? "✓" : step.number}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 600, margin: "4px 0 8px", color: showCompletionCheck[step.number] ? "#2E7D32" : textColor }}>{step.title}</h3>
                      <p style={{ fontSize: 14, lineHeight: 1.6, color: darkMode ? "#C0C0D0" : "#424242", margin: "0 0 12px" }}>
                        {step.instruction.replace("{domain}", companyDomain)}
                      </p>
                      <ScreenshotPlaceholder name={step.screenshot} guideId={step.guideId || selectedGuide?.id} domain={companyDomain} />
                      {step.tip && (
                        <div style={{ marginTop: 12, padding: "10px 14px", background: darkMode ? "#1A2744" : "#E3F2FD", borderRadius: 8, fontSize: 13, color: darkMode ? "#90CAF9" : "#0D47A1", display: "flex", gap: 8 }}>
                          <span>💡</span> {step.tip}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── ELEMENT 4: Hvordan vet jeg at jeg har gjort riktig? ── */}
            <div style={{ background: allDone ? (darkMode ? "#0A200A" : "#F0FBF0") : cardBg, borderRadius: 12, border: `2px solid ${allDone ? "#4CAF50" : borderColor}`, padding: 24, marginBottom: 16, transition: "all 0.4s" }}>
              <SectionLabel number={guide.why ? "4" : "3"} title="Hvordan vet jeg at jeg har gjort riktig?" color="#107C10" />
              {allDone && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: "#E8F5E9", borderRadius: 8, marginBottom: 16, border: "1px solid #A5D6A7" }}>
                  <span style={{ fontSize: 20 }}>🎉</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#2E7D32" }}>Flott! Du har fullført alle stegene.</span>
                </div>
              )}
              <p style={{ fontSize: 14, color: subtleText, margin: "0 0 14px" }}>Etter at du har fulgt alle stegene, skal dette se riktig ut:</p>
              {guide.confirmation.checks.map((check, i) => (
                <div key={i} style={{ display: "flex", alignItems: "start", gap: 10, padding: "10px 14px", background: allDone ? (darkMode ? "#0E2A0E" : "#E8F5E9") : (darkMode ? "#1A2A1A" : "#F5FBF5"), borderRadius: 8, marginBottom: 8, border: `1px solid ${allDone ? "#A5D6A7" : borderColor}` }}>
                  <span style={{ color: allDone ? "#4CAF50" : subtleText, fontSize: 16, flexShrink: 0, marginTop: 1 }}>{allDone ? "✅" : "○"}</span>
                  <span style={{ fontSize: 14, color: allDone ? (darkMode ? "#A0D4A0" : "#2E7D32") : (darkMode ? "#C0C0D0" : "#424242") }}>{check}</span>
                </div>
              ))}
              {!allDone && (
                <p style={{ fontSize: 12, color: subtleText, margin: "12px 0 0", fontStyle: "italic" }}>
                  Huk av hvert steg ovenfor når du er ferdig — så ser du her om alt er riktig.
                </p>
              )}
            </div>

            {/* ── ELEMENT 5: Hvem kontakter jeg? ── */}
            <div style={{ background: darkMode ? "#0E1628" : "#F0F4FF", borderRadius: 12, border: `1px solid ${darkMode ? "#2A3A5C" : "#C5D3F0"}`, padding: 24, marginBottom: 20 }}>
              <SectionLabel number={guide.why ? "5" : "4"} title="Hvem kontakter jeg hvis jeg trenger hjelp?" color="#003F7D" />
              <p style={{ fontSize: 14, color: subtleText, margin: "0 0 16px" }}>Stod du fast eller trenger du hjelp fra noen? Ta kontakt med din IT-support:</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { icon: "📞", label: "Telefon", value: guide.support.phone },
                  { icon: "✉️", label: "E-post", value: guide.support.email.replace("{domain}", companyDomain) },
                  { icon: "🌐", label: "Support-portal", value: guide.support.portal.replace("{domain}", companyDomain) },
                  { icon: "🕐", label: "Åpningstider", value: guide.support.hours },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: cardBg, borderRadius: 8, border: `1px solid ${borderColor}` }}>
                    <span style={{ fontSize: 18 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: 11, color: subtleText, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{item.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: textColor, marginTop: 2 }}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback */}
            <div style={{ padding: 20, background: cardBg, borderRadius: 12, border: `1px solid ${borderColor}`, textAlign: "center", marginBottom: 32 }}>
              <div style={{ fontSize: 14, marginBottom: 12, color: subtleText }}>Var denne guiden nyttig for deg?</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
                <button style={{ padding: "8px 28px", borderRadius: 8, border: "1px solid #4CAF50", background: darkMode ? "#0E2010" : "#E8F5E9", cursor: "pointer", fontSize: 20 }}>👍</button>
                <button style={{ padding: "8px 28px", borderRadius: 8, border: `1px solid ${borderColor}`, background: cardBg, cursor: "pointer", fontSize: 20 }}>👎</button>
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
    return (
      <div style={{ fontFamily: "'Segoe UI', -apple-system, sans-serif", background: bg, minHeight: "100vh", color: textColor }}>
        <TopBar />
        <div style={{ display: "flex" }}>
          <Sidebar />
          <div style={{ flex: 1, padding: "24px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: subtleText, marginBottom: 20 }}>
              <span onClick={() => setView("dashboard")} style={{ cursor: "pointer" }}>Hjem</span>
              <span>/</span>
              <span style={{ color: textColor }}>{cat?.label}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: cat?.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{cat?.icon}</div>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{cat?.label}</h2>
                <p style={{ fontSize: 13, color: subtleText, margin: "4px 0 0" }}>{guides.length} guider tilgjengelig</p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {guides.map((guide, i) => (
                <div key={i} onClick={() => handleGuideClick(guide)} style={{ background: cardBg, borderRadius: 12, border: `1px solid ${borderColor}`, padding: "16px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "box-shadow 0.2s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: guide.difficulty === "Enkel" ? "#4CAF50" : guide.difficulty === "Middels" ? "#FF9800" : "#F44336" }} />
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{guide.title}</div>
                      <div style={{ fontSize: 12, color: subtleText, marginTop: 4 }}>{guide.difficulty} · {guide.time}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {guide.popular && <span style={{ fontSize: 11, padding: "3px 10px", background: darkMode ? "#1A2744" : "#E3F2FD", color: "#0078D4", borderRadius: 20 }}>Populær</span>}
                    <span style={{ color: subtleText, fontSize: 16 }}>→</span>
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
    <div style={{ fontFamily: "'Segoe UI', -apple-system, sans-serif", background: bg, minHeight: "100vh", color: textColor }}>
      <TopBar />
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ flex: 1, padding: "24px 32px" }}>
          {/* Welcome */}
          {userMode ? (
            <div style={{ background: "linear-gradient(135deg, #0078D4, #106EBE)", borderRadius: 16, padding: "28px 32px", color: "#fff", marginBottom: 28, display: "flex", alignItems: "center", gap: 24 }}>
              <div style={{ fontSize: 48 }}>👋</div>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 6px" }}>Hei! Her finner du hjelp til Microsoft 365</h2>
                <p style={{ fontSize: 15, opacity: 0.9, margin: 0 }}>Velg en guide nedenfor, eller bruk søket øverst for å finne det du leter etter. Alt er forklart steg for steg.</p>
              </div>
            </div>
          ) : (
            <div style={{ background: "linear-gradient(135deg, #0078D4, #106EBE)", borderRadius: 16, padding: "28px 32px", color: "#fff", marginBottom: 28 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>Velkommen til {companyName} sin brukerhjelp</h2>
              <p style={{ fontSize: 14, opacity: 0.9, margin: 0 }}>Finn enkle steg-for-steg guider for alt du trenger hjelp med i Microsoft 365.</p>
            </div>
          )}

          {/* Popular guides */}
          <h3 style={{ fontSize: 17, fontWeight: 600, margin: "0 0 16px" }}>Mest brukte guider</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260, 1fr))", gap: 16, marginBottom: 32 }}>
            {allGuides.filter((g) => g.popular).slice(0, 6).map((guide, i) => {
              const cat = CATEGORIES.find((c) => c.id === guide.category);
              return (
                <div key={i} onClick={() => handleGuideClick(guide)} style={{ background: cardBg, borderRadius: 12, border: `1px solid ${borderColor}`, padding: "16px 20px", cursor: "pointer", transition: "box-shadow 0.2s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 16 }}>{cat?.icon}</span>
                    <span style={{ fontSize: 11, color: subtleText }}>{cat?.label}</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{guide.title}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ fontSize: 11, padding: "2px 8px", background: "#E8F5E9", color: "#2E7D32", borderRadius: 12 }}>{guide.difficulty}</span>
                    <span style={{ fontSize: 11, padding: "2px 8px", background: darkMode ? "#2A2A4A" : "#F5F5F5", color: subtleText, borderRadius: 12 }}>{guide.time}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Categories */}
          <h3 style={{ fontSize: 17, fontWeight: 600, margin: "0 0 16px" }}>Alle kategorier</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200, 1fr))", gap: 16 }}>
            {CATEGORIES.map((cat) => (
              <div key={cat.id} onClick={() => handleCategoryClick(cat.id)} style={{ background: cardBg, borderRadius: 12, border: `1px solid ${borderColor}`, padding: "20px", cursor: "pointer", textAlign: "center", transition: "box-shadow 0.2s" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{cat.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{cat.label}</div>
                <div style={{ fontSize: 12, color: subtleText }}>{cat.count} guider</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
                  }
