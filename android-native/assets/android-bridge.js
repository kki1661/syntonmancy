(function () {
  const native = window.AndroidBridge;

  function call(name, args) {
    return new Promise(function (resolve, reject) {
      try {
        if (!native || typeof native[name] !== 'function') {
          reject(new Error('Android bridge not ready: ' + name));
          return;
        }
        resolve(native[name].apply(native, args || []));
      } catch (error) {
        reject(error);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    const style = document.createElement('style');
    style.textContent = '#openBackupFolderBtn{display:none!important}';
    document.head.appendChild(style);
  });

  window.zijianImageFolderChosen = function (folder) {
    const resolve = window.__zijianImageFolderResolve;
    window.__zijianImageFolderResolve = null;
    if (typeof resolve === 'function') resolve(folder || '');
  };

  window.zijianPhotoBookFolderChosen = function (folder) {
    const resolve = window.__zijianPhotoBookFolderResolve;
    window.__zijianPhotoBookFolderResolve = null;
    if (typeof resolve === 'function') resolve(folder || '');
  };

  window.zijianBackupFolderChosen = function (folder) {
    const resolve = window.__zijianBackupFolderResolve;
    window.__zijianBackupFolderResolve = null;
    if (typeof resolve === 'function') resolve(folder || '');
  };

  window.zijianDesktop = {
    isDesktop: true,
    platform: 'android',
    supportsFolderChoice: true,
    notify: function (payload) {
      try {
        return call('notifyMessage', [String((payload && payload.title) || '字势静兼'), String((payload && payload.body) || '')]);
      } catch (error) { return Promise.resolve('error'); }
    },
    onOpenChat: function () { return function () {}; },
    backupInfo: function () {
      return call('backupInfo').then(function (value) {
        try { return JSON.parse(value || '{}'); } catch (error) { return {}; }
      });
    },
    chooseBackupFolder: function () {
      return new Promise(function (resolve) {
        try {
          if (!native || typeof native.chooseBackupFolder !== 'function') { resolve(''); return; }
          const result = native.chooseBackupFolder();
          if (result !== 'opening') { resolve(result || ''); return; }
          window.__zijianBackupFolderResolve = resolve;
        } catch (error) { resolve(''); }
      });
    },
    setBackupFolder: function (folder) { return call('setBackupFolder', [folder]); },
    pruneBackupFiles: function (folder, kind, keep) {
      return call('pruneBackupFiles', [folder, kind, keep]);
    },
    chooseImageFolder: function () {
      return new Promise(function (resolve) {
        try {
          if (!native || typeof native.chooseImageFolder !== 'function') { resolve(''); return; }
          const result = native.chooseImageFolder();
          if (result !== 'opening') { resolve(result || ''); return; }
          window.__zijianImageFolderResolve = resolve;
        } catch (error) { resolve(''); }
      });
    },
    saveImageToFolder: function (folder, filename, dataUrl) {
      return call('saveImageToFolder', [folder, filename, dataUrl]);
    },
    saveBackupFile: function (folder, filename, content) {
      return call('saveBackupFile', [folder, filename, content]);
    },
    openBackupFolder: function () { return call('openBackupFolder'); },
    fetchImage: function (url) { return call('fetchImage', [url]); },
    saveImageToDownloads: function (filename, dataUrl) { return call('saveImageToDownloads', [filename, dataUrl]); },
    choosePhotoBookFolder: function () {
      return new Promise(function (resolve) {
        try {
          if (!native || typeof native.choosePhotoBookFolder !== 'function') { resolve(''); return; }
          const result = native.choosePhotoBookFolder();
          if (result !== 'opening') { resolve(result || ''); return; }
          window.__zijianPhotoBookFolderResolve = resolve;
        } catch (error) { resolve(''); }
      });
    },
    savePhotoBookFile: function (folder, filename, dataUrl) { return call('savePhotoBookFile', [folder, filename, dataUrl]); },
    exportBackupToDownloads: function (filename, content) { return call('exportBackupToDownloads', [filename, content]); },
    shareBackup: function (filename, content) {
      return call('shareBackup', [filename, content]);
    },
    quit: function () {},
  };
})();
