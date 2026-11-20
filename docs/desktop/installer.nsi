Unicode true

!include "MUI2.nsh"
!include "nsDialogs.nsh"
!include "LogicLib.nsh"

!define APP_NAME "字势静兼"
!define APP_EXE "字势静兼.exe"
!define APP_VERSION "2.9.10"
!define APP_PUBLISHER "Syntonmancy"
!define APP_ID "Syntonmancy"

Name "Syntonmancy / 字势静兼"
OutFile "Syntonmancy-Setup-2.9.10.exe"
InstallDir "$LOCALAPPDATA\Programs\Syntonmancy"
InstallDirRegKey HKCU "Software\Syntonmancy" "InstallLocation"
RequestExecutionLevel user
SetCompressor /SOLID zlib
XPStyle on
ShowInstDetails show
CRCCheck on

Icon "assets\icon-v3.ico"
UninstallIcon "assets\icon-v3.ico"

VIProductVersion "2.9.10.0"
VIAddVersionKey /LANG=2052 "ProductName" "字势静兼"
VIAddVersionKey /LANG=2052 "CompanyName" "Syntonmancy"
VIAddVersionKey /LANG=2052 "FileDescription" "字势静兼安装程序"
VIAddVersionKey /LANG=2052 "FileVersion" "2.9.10"
VIAddVersionKey /LANG=1033 "ProductName" "Syntonmancy"
VIAddVersionKey /LANG=1033 "CompanyName" "Syntonmancy"
VIAddVersionKey /LANG=1033 "FileDescription" "Syntonmancy installer"
VIAddVersionKey /LANG=1033 "FileVersion" "2.9.10"

BrandingText "Syntonmancy · 字势静兼"

Var BackupFolder
Var BackupEdit
Var BackupBrowse
Var AgeCheck

!define MUI_ABORTWARNING
!define MUI_ICON "assets\icon-v3.ico"
!define MUI_UNICON "assets\icon-v3.ico"
!define MUI_FINISHPAGE_RUN "$INSTDIR\${APP_EXE}"
!define MUI_FINISHPAGE_RUN_TEXT "$(LaunchApp)"
!define MUI_FINISHPAGE_NOREBOOTSUPPORT

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "installer-legal.txt"
Page custom AgePageCreate AgePageLeave
!insertmacro MUI_PAGE_DIRECTORY
Page custom BackupPageCreate BackupPageLeave
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "SimpChinese"
!insertmacro MUI_LANGUAGE "English"
!insertmacro MUI_RESERVEFILE_LANGDLL

LangString AgeTitle ${LANG_SIMPCHINESE} "年龄确认"
LangString AgeTitle ${LANG_ENGLISH} "Age confirmation"
LangString AgeSubtitle ${LANG_SIMPCHINESE} "请确认你已年满 18 周岁"
LangString AgeSubtitle ${LANG_ENGLISH} "Please confirm that you are at least 18 years old"
LangString AgeText ${LANG_SIMPCHINESE} "字势静兼仅供年满 18 周岁的成年人使用。严禁未成年人使用本软件进行拟人化情感互动或角色扮演。$\r$\n$\r$\n继续安装前，请勾选下方确认项。"
LangString AgeText ${LANG_ENGLISH} "Syntonmancy is intended only for adults aged 18 or older. Minors must not use it for anthropomorphic emotional interaction or role-play.$\r$\n$\r$\nPlease check the box below before continuing."
LangString AgeCheck ${LANG_SIMPCHINESE} "我已年满 18 周岁，并已阅读并同意免责声明与使用限制"
LangString AgeCheck ${LANG_ENGLISH} "I am at least 18 years old and have read and accept the disclaimer and terms of use"
LangString AgeRequired ${LANG_SIMPCHINESE} "请先确认你已年满 18 周岁并同意免责声明。"
LangString AgeRequired ${LANG_ENGLISH} "Please confirm that you are at least 18 years old and accept the disclaimer."

LangString BackupTitle ${LANG_SIMPCHINESE} "选择备份保存位置"
LangString BackupTitle ${LANG_ENGLISH} "Choose backup location"
LangString BackupSubtitle ${LANG_SIMPCHINESE} "手动备份和自动备份会同时保存到两个位置"
LangString BackupSubtitle ${LANG_ENGLISH} "Manual and auto backups are saved to two locations"
LangString BackupText ${LANG_SIMPCHINESE} "请选择你的备份目录。字势静兼还会在应用目录下的 backups 文件夹再保存一份。以后可在“备份与恢复”中更改。"
LangString BackupText ${LANG_ENGLISH} "Choose your backup folder. Syntonmancy will also keep a second copy in the backups folder inside the app directory. You can change this later in Backup & Restore."
LangString BackupLabel ${LANG_SIMPCHINESE} "备份目录："
LangString BackupLabel ${LANG_ENGLISH} "Backup folder:"
LangString Browse ${LANG_SIMPCHINESE} "浏览..."
LangString Browse ${LANG_ENGLISH} "Browse..."
LangString ChooseBackupTitle ${LANG_SIMPCHINESE} "选择备份保存位置"
LangString ChooseBackupTitle ${LANG_ENGLISH} "Choose backup location"
LangString BackupRequired ${LANG_SIMPCHINESE} "请选择一个备份目录。"
LangString BackupRequired ${LANG_ENGLISH} "Please choose a backup folder."
LangString OverwritePrompt ${LANG_SIMPCHINESE} "检测到当前安装目录已有字势静兼。安装程序会先关闭正在运行的字势静兼，然后覆盖安装；聊天和备份数据会保留。继续吗？"
LangString OverwritePrompt ${LANG_ENGLISH} "Syntonmancy is already installed in this folder. Setup will close the running app and overwrite the program files. Chat and backup data will be preserved. Continue?"
LangString CloseFailed ${LANG_SIMPCHINESE} "无法关闭正在运行的字势静兼，或安装目录中的字势静兼.exe 仍被占用。请从任务栏托盘退出字势静兼，或重启电脑后再安装。"
LangString CloseFailed ${LANG_ENGLISH} "Could not close the running Syntonmancy, or 字势静兼.exe is still locked. Please exit Syntonmancy from the tray or restart Windows, then run Setup again."
LangString LaunchApp ${LANG_SIMPCHINESE} "立即运行字势静兼"
LangString LaunchApp ${LANG_ENGLISH} "Run Syntonmancy now"

Function .onInit
  StrCpy $BackupFolder "$DOCUMENTS\Syntonmancy Backups"
  !insertmacro MUI_LANGDLL_DISPLAY
  IfFileExists "$INSTDIR\${APP_EXE}" 0 init_done
  IfSilent close_running
  MessageBox MB_YESNO|MB_ICONQUESTION "$(OverwritePrompt)" IDYES close_running
  Abort
  close_running:
  StrCpy $1 0
  close_retry:
  nsExec::Exec 'taskkill /IM "${APP_EXE}" /F /T'
  Pop $0
  Sleep 700
  ClearErrors
  FileOpen $2 "$INSTDIR\${APP_EXE}" a
  IfErrors close_locked
  FileClose $2
  Goto init_done
  close_locked:
  IntOp $1 $1 + 1
  IntCmp $1 4 close_failed close_retry close_retry
  close_failed:
  MessageBox MB_ICONSTOP|MB_OK "$(CloseFailed)"
  Abort
  init_done:
FunctionEnd

Function AgePageCreate
  !insertmacro MUI_HEADER_TEXT "$(AgeTitle)" "$(AgeSubtitle)"
  nsDialogs::Create 1018
  Pop $0
  ${If} $0 == error
    Abort
  ${EndIf}
  ${NSD_CreateLabel} 0 0 100% 70u "$(AgeText)"
  Pop $0
  ${NSD_CreateCheckBox} 0 82u 100% 14u "$(AgeCheck)"
  Pop $AgeCheck
  nsDialogs::Show
FunctionEnd

Function AgePageLeave
  ${NSD_GetState} $AgeCheck $0
  StrCmp $0 "1" age_ok
  MessageBox MB_ICONEXCLAMATION|MB_OK "$(AgeRequired)"
  Abort
  age_ok:
FunctionEnd

Function BackupPageCreate
  !insertmacro MUI_HEADER_TEXT "$(BackupTitle)" "$(BackupSubtitle)"
  nsDialogs::Create 1018
  Pop $0
  ${If} $0 == error
    Abort
  ${EndIf}
  ${NSD_CreateLabel} 0 0 100% 40u "$(BackupText)"
  Pop $0
  ${NSD_CreateLabel} 0 48u 100% 12u "$(BackupLabel)"
  Pop $0
  ${NSD_CreateText} 0 62u 75% 14u "$BackupFolder"
  Pop $BackupEdit
  ${NSD_CreateButton} 77% 62u 23% 14u "$(Browse)"
  Pop $BackupBrowse
  ${NSD_OnClick} $BackupBrowse BackupBrowseClick
  nsDialogs::Show
FunctionEnd

Function BackupBrowseClick
  ${NSD_GetText} $BackupEdit $BackupFolder
  nsDialogs::SelectFolderDialog "$(ChooseBackupTitle)" "$BackupFolder"
  Pop $0
  ${If} $0 != "error"
    StrCpy $BackupFolder $0
    ${NSD_SetText} $BackupEdit "$BackupFolder"
  ${EndIf}
FunctionEnd

Function BackupPageLeave
  ${NSD_GetText} $BackupEdit $BackupFolder
  StrCmp $BackupFolder "" 0 backup_ok
  MessageBox MB_ICONEXCLAMATION|MB_OK "$(BackupRequired)"
  Abort
  backup_ok:
FunctionEnd

Section "Application"
  SetShellVarContext current
  SetOutPath "$INSTDIR"
  File /r "dist-2910\字势静兼-win32-x64\*.*"

  WriteUninstaller "$INSTDIR\Uninstall.exe"
  CopyFiles /SILENT "$INSTDIR\Uninstall.exe" "$INSTDIR\一键卸载字势静兼.exe"

  CreateDirectory "$APPDATA\字势静兼"
  FileOpen $0 "$APPDATA\字势静兼\backup-location.txt" w
  FileWriteUTF16LE $0 "$BackupFolder"
  FileClose $0

  CreateShortCut "$DESKTOP\字势静兼.lnk" "$INSTDIR\${APP_EXE}" "" "$INSTDIR\assets\icon-v3.ico" 0
  CreateShortCut "$SMPROGRAMS\字势静兼.lnk" "$INSTDIR\${APP_EXE}" "" "$INSTDIR\assets\icon-v3.ico" 0
  CreateShortCut "$SMPROGRAMS\卸载字势静兼.lnk" "$INSTDIR\一键卸载字势静兼.exe"

  WriteRegStr HKCU "Software\Syntonmancy" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Syntonmancy" "DisplayName" "字势静兼 (Syntonmancy)"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Syntonmancy" "DisplayVersion" "${APP_VERSION}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Syntonmancy" "Publisher" "${APP_PUBLISHER}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Syntonmancy" "DisplayIcon" "$INSTDIR\assets\icon-v3.ico"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Syntonmancy" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Syntonmancy" "UninstallString" '"$INSTDIR\一键卸载字势静兼.exe"'
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Syntonmancy" "QuietUninstallString" '"$INSTDIR\一键卸载字势静兼.exe" /S'
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Syntonmancy" "NoModify" 1
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Syntonmancy" "NoRepair" 1
SectionEnd

Section "Uninstall"
  SetShellVarContext current
  Delete "$DESKTOP\字势静兼.lnk"
  Delete "$SMPROGRAMS\字势静兼.lnk"
  Delete "$SMPROGRAMS\卸载字势静兼.lnk"
  RMDir /r "$SMPROGRAMS\Syntonmancy"
  RMDir /r "$INSTDIR"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Syntonmancy"
  DeleteRegKey HKCU "Software\Syntonmancy"
SectionEnd
