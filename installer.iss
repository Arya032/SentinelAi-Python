; =============================================================================
;  SENTINELAI — PROFESSIONAL WINDOWS INSTALLER
;  Inno Setup 6 script — builds SentinelAI-Setup.exe
;
;  User experience:
;    1. Download SentinelAI-Setup.exe from website
;    2. Double-click it
;    3. Click "Yes" on UAC prompt (one time only)
;    4. Click "Install"
;    5. Done — runs silently in background forever
; =============================================================================

#define AppName      "SentinelAI"
#define AppFullName  "SentinelAI — Enterprise Cyber Defense"
#define AppVersion   "1.0.0"
#define AppPublisher "AryaShield Technologies"
#define AppURL       "https://aryashield.com"
#define ServiceName  "SentinelAIEDR"
#define ExeName      "SentinelAI.exe"

[Setup]
; Unique app ID (generate new one for different products)
AppId={{A7C3E9D1-4B2F-4E8A-9D6C-3F1B0E5A2C9D}
AppName={#AppName}
AppVersion={#AppVersion}
AppVerName={#AppFullName} v{#AppVersion}
AppPublisher={#AppPublisher}
AppPublisherURL={#AppURL}
AppSupportURL={#AppURL}/support
DefaultDirName={autopf}\{#AppName}
DefaultGroupName={#AppName}
; No directory page — installs silently to Program Files
DisableDirPage=yes
DisableProgramGroupPage=yes
; No "Select Components" page — one-click install
DisableReadyPage=no
; Require admin (UAC prompt appears once at start)
PrivilegesRequired=admin
; Output
OutputDir=dist\installer
OutputBaseFilename=SentinelAI-Setup
Compression=lzma2/ultra64
SolidCompression=yes
; Modern wizard UI
WizardStyle=modern
; Silent install supported: SentinelAI-Setup.exe /SILENT
; Uninstall shows in Add/Remove Programs
CreateUninstallRegKey=yes
UninstallDisplayName={#AppFullName}
; Minimum Windows 10
MinVersion=10.0
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
; The entire PyInstaller bundle (SentinelAI.exe + all dependencies)
Source: "dist\SentinelAI\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
; Start Menu entry
Name: "{group}\{#AppName}"; Filename: "{app}\{#ExeName}"
Name: "{group}\Uninstall {#AppName}"; Filename: "{uninstallexe}"

[Run]
; Step 1: Register Windows Service (runs at every boot before login)
Filename: "{app}\{#ExeName}"; Parameters: "--install-service"; \
    StatusMsg: "Registering system service..."; \
    Flags: runhidden waituntilterminated

; Step 2: Start the service immediately
Filename: "{sys}\sc.exe"; Parameters: "start {#ServiceName}"; \
    StatusMsg: "Starting SentinelAI protection..."; \
    Flags: runhidden waituntilterminated

[UninstallRun]
; Stop and remove service cleanly on uninstall
Filename: "{sys}\sc.exe"; Parameters: "stop {#ServiceName}"; \
    Flags: runhidden waituntilterminated; RunOnceId: "StopService"
Filename: "{app}\{#ExeName}"; Parameters: "--remove-service"; \
    Flags: runhidden waituntilterminated; RunOnceId: "RemoveService"

[Messages]
; Customize the wizard text
WelcomeLabel1=Welcome to {#AppFullName}
WelcomeLabel2=This will install {#AppFullName} on your computer.%n%nSentinelAI runs silently in the background and protects your system from viruses, ransomware, and zero-day threats — 24/7, even before you log in.%n%nClick Install to continue.
FinishedHeadingLabel=Protection Active
FinishedLabel=SentinelAI is now protecting your computer.%n%nIt runs automatically in the background and starts every time Windows boots — even before you log in. You do not need to do anything else.

[Code]
function InitializeSetup(): Boolean;
begin
  Result := True;
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    // Service already started in [Run] section
    // Nothing extra needed
  end;
end;
