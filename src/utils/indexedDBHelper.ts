/**
 * IndexedDB Helper for secure local storage of encryption keys
 * Private keys are stored locally and never sent to the server
 */

const DB_NAME = 'DailyFunE2EE';
const DB_VERSION = 1;
const STORE_NAME = 'encryption_keys';

interface StoredKey {
  userId: string;
  privateKey: string;
  publicKey: string;
  createdAt: Date;
}

/**
 * Initialize IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'userId' });
        objectStore.createIndex('userId', 'userId', { unique: true });
      }
    };
  });
}

/**
 * Store encryption keys locally
 */
export async function storeKeysLocally(
  userId: string,
  privateKey: string,
  publicKey: string
): Promise<void> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const keyData: StoredKey = {
      userId,
      privateKey,
      publicKey,
      createdAt: new Date(),
    };
    
    const request = store.put(keyData);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    
    transaction.oncomplete = () => db.close();
  });
}

/**
 * Retrieve private key from local storage
 */
export async function getPrivateKey(userId: string): Promise<string | null> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(userId);
    
    request.onsuccess = () => {
      const result = request.result as StoredKey | undefined;
      resolve(result?.privateKey || null);
    };
    request.onerror = () => reject(request.error);
    
    transaction.oncomplete = () => db.close();
  });
}

/**
 * Check if keys exist for a user
 */
export async function hasKeys(userId: string): Promise<boolean> {
  const privateKey = await getPrivateKey(userId);
  return privateKey !== null;
}

/**
 * Delete all local keys (for logout or key rotation)
 */
export async function clearAllKeys(): Promise<void> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    
    transaction.oncomplete = () => db.close();
  });
}
