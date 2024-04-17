import {IDataResponse} from '../../types/cart';
import {FedopsInteraction} from '../../constants';
import {ControllerParams} from '@wix/yoshi-flow-editor';

const storeName = 'Cart';
const dbName = 'CartCache';
const key: string = 'cart';
const TTL = 1000 * 120;

export class CartCacheService {
  constructor(
    private readonly fedops: ControllerParams['flowAPI']['fedops'],
    private readonly panoramaClient: ControllerParams['flowAPI']['panoramaClient']
  ) {}

  private async getDB(): Promise<IDBDatabase | undefined> {
    return new Promise((resolve) => {
      const request = indexedDB.open(dbName);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.createObjectStore(storeName, {keyPath: 'key'});
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = () => {
        resolve(undefined);
      };
    });
  }
  public async get(memberId: string, shouldUseMemberIdAsCacheKey: boolean): Promise<IDataResponse | undefined> {
    return this.performWithDB(async (db): Promise<IDataResponse | undefined> => {
      this.fedops.interactionStarted(FedopsInteraction.GET_CART_FROM_CACHE_SUCCESS);
      this.fedops.interactionStarted(FedopsInteraction.GET_CART_FROM_CACHE_EMPTY);
      this.fedops.interactionStarted(FedopsInteraction.GET_CART_FROM_CACHE_EXPIRED);
      this.panoramaClient?.transaction(FedopsInteraction.GET_CART_FROM_CACHE_SUCCESS).start();
      this.panoramaClient?.transaction(FedopsInteraction.GET_CART_FROM_CACHE_EMPTY).start();
      this.panoramaClient?.transaction(FedopsInteraction.GET_CART_FROM_CACHE_EXPIRED).start();
      const transaction = db.transaction(storeName, 'readonly');
      const objectStore = transaction.objectStore(storeName);
      const request = objectStore.get(key);
      return new Promise((resolve) => {
        request.onsuccess = (event) => {
          const result = (event.target as IDBRequest).result;
          if (!result?.value) {
            this.fedops.interactionEnded(FedopsInteraction.GET_CART_FROM_CACHE_EMPTY);
            this.panoramaClient?.transaction(FedopsInteraction.GET_CART_FROM_CACHE_EMPTY).finish();
            return resolve(undefined);
          }

          this.fedops.interactionStarted(FedopsInteraction.PARSE_JSON);
          this.panoramaClient?.transaction(FedopsInteraction.PARSE_JSON).start();
          const {cachedMemberId, timestamp, cartData} = getCacheValue(result.value) || {};

          if (shouldUseMemberIdAsCacheKey && cachedMemberId !== memberId) {
            return resolve(undefined);
          }
          this.fedops.interactionEnded(FedopsInteraction.PARSE_JSON);
          this.panoramaClient?.transaction(FedopsInteraction.PARSE_JSON).finish();
          if (hasExpired(timestamp!)) {
            this.fedops.interactionEnded(FedopsInteraction.GET_CART_FROM_CACHE_EXPIRED);
            this.panoramaClient?.transaction(FedopsInteraction.GET_CART_FROM_CACHE_EXPIRED).finish();
            return resolve(undefined);
          }
          resolve(cartData);
          this.fedops.interactionEnded(FedopsInteraction.GET_CART_FROM_CACHE_SUCCESS);
          this.panoramaClient?.transaction(FedopsInteraction.GET_CART_FROM_CACHE_SUCCESS).finish();
        };

        request.onerror = () => {
          resolve(undefined);
          this.fedops.interactionEnded(FedopsInteraction.GET_CART_FROM_CACHE_ERROR);
          this.panoramaClient?.transaction(FedopsInteraction.GET_CART_FROM_CACHE_ERROR).finish();
        };
      });
    });
  }

  public async set(memberId: string, value: IDataResponse, shouldUseMemberIdAsCacheKey: boolean): Promise<void> {
    return this.performWithDB(async (db) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const objectStore = transaction.objectStore(storeName);
      const valueString = JSON.stringify({
        ...(shouldUseMemberIdAsCacheKey && {cachedMemberId: memberId}),
        cartData: value,
        timestamp: Date.now(),
      });

      const keyValue = {key, value: valueString};
      const request = objectStore.put(keyValue);

      return new Promise((resolve) => {
        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          resolve();
        };
      });
    });
  }

  public async clear(): Promise<void> {
    return this.performWithDB(async (db) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const objectStore = transaction.objectStore(storeName);
      const request = objectStore.clear();

      // eslint-disable-next-line sonarjs/no-identical-functions
      return new Promise((resolve) => {
        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          resolve();
        };
      });
    });
  }
  private async performWithDB<T>(callback: (db: IDBDatabase) => Promise<T>) {
    this.fedops.interactionStarted(FedopsInteraction.GET_DB);
    this.panoramaClient?.transaction(FedopsInteraction.GET_DB).start();
    const db = await this.getDB();
    this.fedops.interactionEnded(FedopsInteraction.GET_DB);
    this.panoramaClient?.transaction(FedopsInteraction.GET_DB).finish();
    if (!db) {
      return;
    }
    try {
      return await callback(db);
    } finally {
      db?.close();
    }
  }
}

function getCacheValue(
  value: string
): {cachedMemberId?: string; cartData: IDataResponse; timestamp: number} | undefined {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

function hasExpired(timestamp: number) {
  return Date.now() - timestamp > TTL;
}
