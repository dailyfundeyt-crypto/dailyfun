/**
 * File System Access API für lokale Speicherung von Chat-Bildern
 * Nutzer können einen Ordner auf ihrem PC wählen
 */

// Extended types for File System Access API
interface FileSystemHandle {
  queryPermission?(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
  requestPermission?(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
}

interface FileSystemHandlePermissionDescriptor {
  mode?: 'read' | 'readwrite';
}

let directoryHandle: FileSystemDirectoryHandle | null = null;

/**
 * Ordner für Chat-Bilder auswählen
 */
export async function selectStorageDirectory(): Promise<boolean> {
  try {
    // Check if File System Access API is supported
    if (!('showDirectoryPicker' in window)) {
      throw new Error('File System Access API wird von diesem Browser nicht unterstützt. Bitte verwenden Sie Chrome, Edge oder einen anderen modernen Browser.');
    }

    directoryHandle = await (window as any).showDirectoryPicker({
      mode: 'readwrite',
      startIn: 'pictures',
    });

    // Store directory handle for later use
    const permission = await (directoryHandle as any).requestPermission({ mode: 'readwrite' });
    
    if (permission !== 'granted') {
      throw new Error('Zugriff verweigert');
    }

    // Save directory handle to IndexedDB
    await saveDirectoryHandle(directoryHandle);
    
    return true;
  } catch (error) {
    console.error('Error selecting directory:', error);
    throw error;
  }
}

/**
 * Speichere Datei im gewählten Ordner
 */
export async function saveFileToLocalDirectory(
  fileName: string,
  file: File | Blob
): Promise<string> {
  try {
    if (!directoryHandle) {
      directoryHandle = await loadDirectoryHandle();
      
      if (!directoryHandle) {
        throw new Error('Kein Ordner ausgewählt. Bitte wählen Sie zuerst einen Ordner in den Einstellungen.');
      }
    }

    // Verify permission
    const permission = await (directoryHandle as any).requestPermission({ mode: 'readwrite' });
    if (permission !== 'granted') {
      throw new Error('Zugriff verweigert');
    }

    // Create "DailyFun-Chats" subdirectory if it doesn't exist
    let chatDir: FileSystemDirectoryHandle;
    try {
      chatDir = await directoryHandle.getDirectoryHandle('DailyFun-Chats', { create: true });
    } catch (error) {
      chatDir = directoryHandle;
    }

    // Create file
    const fileHandle = await chatDir.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(file);
    await writable.close();

    return `local://${fileName}`;
  } catch (error) {
    console.error('Error saving file to local directory:', error);
    throw error;
  }
}

/**
 * Datei aus lokalem Ordner lesen
 */
export async function readFileFromLocalDirectory(fileName: string): Promise<File | null> {
  try {
    if (!directoryHandle) {
      directoryHandle = await loadDirectoryHandle();
      
      if (!directoryHandle) {
        return null;
      }
    }

    // Try to get from subdirectory first
    let chatDir: FileSystemDirectoryHandle;
    try {
      chatDir = await directoryHandle.getDirectoryHandle('DailyFun-Chats');
    } catch {
      chatDir = directoryHandle;
    }

    const fileHandle = await chatDir.getFileHandle(fileName);
    return await fileHandle.getFile();
  } catch (error) {
    console.error('Error reading file from local directory:', error);
    return null;
  }
}

/**
 * Prüfen ob Ordner gewählt wurde
 */
export async function hasDirectoryAccess(): Promise<boolean> {
  try {
    if (!directoryHandle) {
      directoryHandle = await loadDirectoryHandle();
    }
    
    if (!directoryHandle) {
      return false;
    }

    const permission = await (directoryHandle as any).queryPermission({ mode: 'readwrite' });
    return permission === 'granted';
  } catch {
    return false;
  }
}

/**
 * Directory Handle in IndexedDB speichern
 */
async function saveDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await openSettingsDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['settings'], 'readwrite');
    const store = transaction.objectStore('settings');
    
    const request = store.put({
      key: 'chatStorageDirectory',
      handle: handle,
    });
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  });
}

/**
 * Directory Handle aus IndexedDB laden
 */
async function loadDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  const db = await openSettingsDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['settings'], 'readonly');
    const store = transaction.objectStore('settings');
    const request = store.get('chatStorageDirectory');
    
    request.onsuccess = () => {
      const result = request.result;
      resolve(result?.handle || null);
    };
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  });
}

/**
 * Settings DB öffnen
 */
function openSettingsDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('DailyFunSettings', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };
  });
}
