const { app, BrowserWindow, Tray, Menu, Notification, ipcMain, nativeImage, shell, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');

const APP_ID = 'com.syntonmancy.desktop';
const APP_NAME = '字势静兼';
const OLD_APP_NAME = '字间';

app.setName(APP_NAME);

// Preserve chats and settings from the pre-rename app data directory.
function copyDirectory(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDirectory(from, to);
    else if (entry.isFile()) {
      try { fs.copyFileSync(from, to); }
      catch (err) { console.warn('[Syntonmancy] copy skipped:', from, err && err.message ? err.message : err); }
    }
  }
}

function migrateDirectory(oldDir, newDir) {
  if (process.platform === 'win32') {
    const result = spawnSync('robocopy', [oldDir, newDir, '/E', '/R:2', '/W:1', '/NFL', '/NDL', '/NJH', '/NJS', '/NP'], { windowsHide: true });
    if (result.status !== null && result.status > 7) {
      throw new Error('robocopy exit code ' + result.status);
    }
  } else {
    copyDirectory(oldDir, newDir);
  }
}

(function migrateUserData() {
  try {
    const oldDir = path.join(app.getPath('appData'), OLD_APP_NAME);
    const newDir = app.getPath('userData');
    const oldStorage = path.join(oldDir, 'Local Storage', 'leveldb');
    const newStorage = path.join(newDir, 'Local Storage', 'leveldb');
    if (fs.existsSync(oldDir) && (!fs.existsSync(newDir) || (!fs.existsSync(newStorage) && fs.existsSync(oldStorage)))) {
      migrateDirectory(oldDir, newDir);
      if (fs.existsSync(oldStorage) && !fs.existsSync(newStorage)) {
        throw new Error('Local Storage migration incomplete');
      }
      console.info('[Syntonmancy] migrated user data from ' + oldDir + ' to ' + newDir);
    }
  } catch (err) {
    console.warn('[Syntonmancy] user data migration failed:', err && err.message ? err.message : err);
  }
})();
if (process.platform === 'win32') app.setAppUserModelId(APP_ID);
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  let mainWindow = null;
  let tray = null;
  let isQuitting = false;
  let closeHintShown = false;

  const root = __dirname;
  const htmlPath = path.join(root, 'app', 'hanzi-oracle.html');
  const iconPath = path.join(root, 'assets', 'icon-v3.png');
  const iconIcoPath = path.join(root, 'assets', 'icon-v3.ico');
  const trayPath = path.join(root, 'assets', 'tray-v3.png');

  function showNotification(data) {
    if (!Notification.isSupported()) return;
    const title = String(data && data.title ? data.title : APP_NAME).slice(0, 80);
    const body = String(data && data.body ? data.body : '').slice(0, 240);
    const notification = new Notification({
      title,
      body,
      icon: process.platform === 'win32' && fs.existsSync(iconIcoPath) ? iconIcoPath : (fs.existsSync(iconPath) ? iconPath : undefined),
      silent: true,
      timeoutType: 'default',
    });
    notification.on('click', () => {
      showWindow();
      if (mainWindow && data && data.chatId) {
        mainWindow.webContents.send('zijian:open-chat', String(data.chatId));
      }
    });
    notification.show();
  }

  function showWindow() {
    if (!mainWindow) {
      createWindow();
      return;
    }
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  }

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1180,
      height: 840,
      minWidth: 390,
      minHeight: 560,
      title: APP_NAME,
      backgroundColor: '#f6f0e4',
      show: false,
      icon: process.platform === 'win32' && fs.existsSync(iconIcoPath) ? iconIcoPath : (fs.existsSync(iconPath) ? iconPath : undefined),
      autoHideMenuBar: true,
      webPreferences: {
        preload: path.join(root, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
        backgroundThrottling: false,
        spellcheck: false,
      },
    });

    if (process.platform === 'darwin') {
      Menu.setApplicationMenu(Menu.buildFromTemplate([
        { role: 'appMenu' },
        { role: 'editMenu' },
        { role: 'windowMenu' },
      ]));
    } else {
      Menu.setApplicationMenu(null);
    }
    mainWindow.loadFile(htmlPath);
    mainWindow.once('ready-to-show', () => {
      if (!isQuitting) mainWindow.show();
    });
    mainWindow.on('close', event => {
      if (isQuitting) return;
      event.preventDefault();
      mainWindow.hide();
      if (!closeHintShown) {
        closeHintShown = true;
        showNotification({
          title: '字势静兼仍在后台运行',
          body: '新消息会继续提示。可从 Windows 任务栏托盘重新打开。',
          silent: true,
        });
      }
    });
    mainWindow.on('closed', () => {
      mainWindow = null;
    });
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      try { shell.openExternal(url); } catch (err) { /* ignore */ }
      return { action: 'deny' };
    });
  }

  function ensureShortcuts() {
    if (process.platform !== 'win32') return;
    const shortcutOptions = {
      target: process.execPath,
      cwd: path.dirname(process.execPath),
      description: APP_NAME,
      icon: iconIcoPath,
      iconIndex: 0,
      appUserModelId: APP_ID,
    };
    const shortcutPaths = [
      path.join(app.getPath('appData'), 'Microsoft', 'Windows', 'Start Menu', 'Programs', APP_NAME + '.lnk'),
      path.join(app.getPath('desktop'), APP_NAME + '.lnk'),
    ];
    const oldShortcutPaths = [
      path.join(app.getPath('appData'), 'Microsoft', 'Windows', 'Start Menu', 'Programs', OLD_APP_NAME + '.lnk'),
      path.join(app.getPath('desktop'), OLD_APP_NAME + '.lnk'),
    ];
    for (const oldShortcut of oldShortcutPaths) {
      try { if (fs.existsSync(oldShortcut)) fs.unlinkSync(oldShortcut); } catch (err) { /* ignore */ }
    }
    for (const shortcut of shortcutPaths) {
      try {
        shell.writeShortcutLink(shortcut, fs.existsSync(shortcut) ? 'replace' : 'create', shortcutOptions);
      } catch (err) {
        console.warn('[字势静兼] shortcut failed:', shortcut, err && err.message ? err.message : err);
      }
    }
  }

  function createTray() {
    const trayImagePath = process.platform === 'win32' && fs.existsSync(iconIcoPath) ? iconIcoPath : (fs.existsSync(trayPath) ? trayPath : iconPath);
    if (!fs.existsSync(trayImagePath)) return;
    const image = nativeImage.createFromPath(trayImagePath);
    if (image.isEmpty()) return;
    tray = new Tray(image);
    tray.setToolTip(APP_NAME);
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: '打开字势静兼', click: showWindow },
      { type: 'separator' },
      {
        label: '退出字势静兼',
        click: () => {
          isQuitting = true;
          app.quit();
        },
      },
    ]));
    tray.on('click', showWindow);
    tray.on('double-click', showWindow);
  }

  app.on('second-instance', () => showWindow());
  app.on('before-quit', () => { isQuitting = true; });
  app.on('window-all-closed', () => { /* keep running in the tray */ });
  app.on('activate', () => showWindow());

  app.whenReady().then(() => {
    migrateLegacyBackups();
    createWindow();
    createTray();
    ensureShortcuts();
  });

  function backupConfigPath() {
    return path.join(app.getPath('userData'), 'backup-location.json');
  }

  function readConfiguredBackupFolder() {
    try {
      const raw = JSON.parse(fs.readFileSync(backupConfigPath(), 'utf8') || '{}');
      if (typeof raw.folder === 'string' && raw.folder.trim()) return raw.folder.trim();
    } catch (err) { /* try installer text file */ }
    try {
      const txtPath = path.join(app.getPath('userData'), 'backup-location.txt');
      if (fs.existsSync(txtPath)) {
        let text = fs.readFileSync(txtPath, 'utf16le').replace(/^\uFEFF/, '').trim();
        if (!text) text = fs.readFileSync(txtPath, 'utf8').replace(/^\uFEFF/, '').trim();
        return text;
      }
    } catch (err) { /* ignore */ }
    return '';
  }

  function writeConfiguredBackupFolder(folder) {
    try {
      const target = backupConfigPath();
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, JSON.stringify({ folder, updatedAt: new Date().toISOString() }, null, 2), 'utf8');
      return true;
    } catch (err) {
      console.warn('[Syntonmancy] backup config write failed:', err && err.message ? err.message : err);
      return false;
    }
  }

  function migrateLegacyBackups() {
    try {
      const info = backupPaths();
      const source = info.legacyAppBackupDir;
      const target = info.appBackupDir;
      if (!source || !target || source === target || !fs.existsSync(source)) return;
      const pattern = /^syntonmancy-(?:auto|manual)-backup-\d{8}-\d{4}\.json$/;
      fs.mkdirSync(target, { recursive: true });
      for (const name of fs.readdirSync(source)) {
        if (!pattern.test(name)) continue;
        const dest = path.join(target, name);
        if (fs.existsSync(dest)) continue;
        try { fs.copyFileSync(path.join(source, name), dest); } catch (err) { /* best effort */ }
      }
    } catch (err) {
      console.warn('[Syntonmancy] legacy backup migration failed:', err && err.message ? err.message : err);
    }
  }

  function backupPaths() {
    const appDir = path.dirname(process.execPath);
    let documentsDir = '';
    try { documentsDir = app.getPath('documents'); } catch (err) { documentsDir = app.getPath('userData'); }
    const defaultFolder = path.join(documentsDir, 'Syntonmancy Backups');
    return {
      configuredFolder: readConfiguredBackupFolder(),
      defaultFolder,
      appDir,
      appBackupDir: path.join(documentsDir, 'Syntonmancy Backups'),
      legacyAppBackupDir: path.join(appDir, 'backups'),
      fallbackBackupDir: path.join(app.getPath('userData'), 'backups'),
      userData: app.getPath('userData'),
    };
  }

  ipcMain.handle('backup:info', () => backupPaths());

  ipcMain.handle('backup:choose-folder', async () => {
    try {
      const info = backupPaths();
      const options = {
        title: '选择备份保存位置',
        defaultPath: info.configuredFolder || info.defaultFolder,
        properties: ['openDirectory', 'createDirectory'],
      };
      const result = mainWindow ? await dialog.showOpenDialog(mainWindow, options) : await dialog.showOpenDialog(options);
      if (result.canceled || !result.filePaths || !result.filePaths[0]) return '';
      const folder = result.filePaths[0];
      writeConfiguredBackupFolder(folder);
      return folder;
    } catch (err) {
      console.warn('[Syntonmancy] backup folder choose failed:', err && err.message ? err.message : err);
      return '';
    }
  });

  ipcMain.handle('backup:set-folder', (_event, folder) => {
    if (typeof folder !== 'string' || !folder.trim()) return false;
    return writeConfiguredBackupFolder(folder);
  });

  ipcMain.handle('backup:write', (_event, payload) => {
    const folder = payload && String(payload.folder || '');
    const filename = payload && String(payload.filename || '');
    const content = payload && String(payload.content || '');
    if (!folder || !/^[A-Za-z0-9._-]+\.json$/.test(filename)) throw new Error('无效的备份文件名');
    fs.mkdirSync(folder, { recursive: true });
    const target = path.join(folder, filename);
    fs.writeFileSync(target, content, 'utf8');
    return target;
  });

  ipcMain.handle('backup:prune', (_event, payload) => {
    const folder = payload && String(payload.folder || '');
    const kind = payload && (payload.kind === 'manual' ? 'manual' : 'auto');
    const keep = Math.min(20, Math.max(1, Number(payload && payload.keep) || 3));
    if (!folder) return 0;
    const prefix = kind === 'manual' ? 'syntonmancy-manual-backup-' : 'syntonmancy-auto-backup-';
    const pattern = new RegExp('^' + prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(\\d{8}-\\d{4})\\.json$');
    try {
      if (!fs.existsSync(folder)) return 0;
      const files = fs.readdirSync(folder, { withFileTypes: true })
        .filter(entry => entry.isFile() && pattern.test(entry.name))
        .map(entry => ({ name: entry.name, stamp: pattern.exec(entry.name)[1] }))
        .sort((a, b) => b.stamp.localeCompare(a.stamp));
      let deleted = 0;
      for (const item of files.slice(keep)) {
        try { fs.unlinkSync(path.join(folder, item.name)); deleted += 1; } catch (err) { /* ignore one file */ }
      }
      return deleted;
    } catch (err) {
      console.warn('[Syntonmancy] backup prune failed:', err && err.message ? err.message : err);
      return 0;
    }
  });

  ipcMain.handle('backup:open-folder', async (_event, folder) => {
    if (typeof folder !== 'string' || !folder) return false;
    try { fs.mkdirSync(folder, { recursive: true }); await shell.openPath(folder); return true; }
    catch (err) { return false; }
  });

  // 图片生成服务返回的是带签名的临时 URL；渲染进程常因 COS 的 CORS
  // 限制无法把图片读成 data URL。桌面端在 main 进程里下载，绕过浏览器 CORS。
  ipcMain.handle('image:choose-folder', async () => {
    try {
      const options = {
        title: '选择凝兹图片保存位置',
        properties: ['openDirectory', 'createDirectory'],
      };
      const result = mainWindow ? await dialog.showOpenDialog(mainWindow, options) : await dialog.showOpenDialog(options);
      if (result.canceled || !result.filePaths || !result.filePaths[0]) return '';
      return result.filePaths[0];
    } catch (err) {
      console.warn('[Syntonmancy] image folder choose failed:', err && err.message ? err.message : err);
      return '';
    }
  });

  ipcMain.handle('image:save-folder', async (_event, payload) => {
    const folder = payload && String(payload.folder || '');
    const filename = payload && String(payload.filename || '');
    const dataUrl = payload && String(payload.dataUrl || '');
    if (!folder || !/^[A-Za-z0-9._-]+\.(?:jpe?g|png|webp)$/i.test(filename)) throw new Error('无效的图片文件名');
    const match = /^data:image\/[^;]+;base64,(.*)$/is.exec(dataUrl);
    if (!match) throw new Error('图片数据无效');
    const buffer = Buffer.from(match[1], 'base64');
    fs.mkdirSync(folder, { recursive: true });
    const target = path.join(folder, filename);
    fs.writeFileSync(target, buffer);
    return target;
  });

  ipcMain.handle('image:fetch', async (_event, url) => {
    try {
      const value = String(url || '');
      if (!/^https:\/\//i.test(value)) throw new Error('只允许 https 图片地址');
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 60000);
      try {
        const response = await fetch(value, { signal: controller.signal });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const type = String(response.headers.get('content-type') || '');
        if (!/^image\//i.test(type)) throw new Error('返回内容不是图片');
        const buffer = Buffer.from(await response.arrayBuffer());
        if (buffer.length > 25 * 1024 * 1024) throw new Error('图片超过 25MB');
        return 'data:' + type.split(';')[0] + ';base64,' + buffer.toString('base64');
      } finally {
        clearTimeout(timer);
      }
    } catch (err) {
      console.warn('[Syntonmancy] image fetch failed:', err && err.message ? err.message : err);
      throw err;
    }
  });

  ipcMain.on('zijian:notify', (_event, payload) => {
    if (!payload || typeof payload !== 'object') return;
    showNotification(payload);
  });

  ipcMain.on('zijian:quit', () => {
    isQuitting = true;
    app.quit();
  });
}
