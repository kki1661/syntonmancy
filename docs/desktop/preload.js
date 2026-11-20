const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('zijianDesktop', {
  isDesktop: true,
  platform: process.platform,
  notify(payload) {
    if (!payload || typeof payload !== 'object') return;
    ipcRenderer.send('zijian:notify', {
      title: String(payload.title || '字势静兼'),
      body: String(payload.body || ''),
      chatId: payload.chatId ? String(payload.chatId) : '',
    });
  },
  onOpenChat(callback) {
    if (typeof callback !== 'function') return () => {};
    const handler = (_event, chatId) => callback(String(chatId || ''));
    ipcRenderer.on('zijian:open-chat', handler);
    return () => ipcRenderer.removeListener('zijian:open-chat', handler);
  },
  backupInfo() { return ipcRenderer.invoke('backup:info'); },
  chooseBackupFolder() { return ipcRenderer.invoke('backup:choose-folder'); },
  setBackupFolder(folder) { return ipcRenderer.invoke('backup:set-folder', String(folder || '')); },
  pruneBackupFiles(folder, kind, keep) {
    return ipcRenderer.invoke('backup:prune', { folder: String(folder || ''), kind: String(kind || 'auto'), keep: Number(keep) || 3 });
  },
  saveBackupFile(folder, filename, content) {
    return ipcRenderer.invoke('backup:write', { folder: String(folder || ''), filename: String(filename || ''), content: String(content || '') });
  },
  openBackupFolder(folder) { return ipcRenderer.invoke('backup:open-folder', String(folder || '')); },
  chooseImageFolder() { return ipcRenderer.invoke('image:choose-folder'); },
  saveImageToFolder(folder, filename, dataUrl) {
    return ipcRenderer.invoke('image:save-folder', { folder: String(folder || ''), filename: String(filename || ''), dataUrl: String(dataUrl || '') });
  },
  fetchImage(url) { return ipcRenderer.invoke('image:fetch', String(url || '')); },
  quit() {
    ipcRenderer.send('zijian:quit');
  },
});
