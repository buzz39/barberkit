import * as SQLite from 'expo-sqlite';
import { Customer, SyncOperation, Analytics } from '../types';

export class LocalStorageService {
  private static db: SQLite.WebSQLDatabase | null = null;

  static async initDatabase(): Promise<void> {
    try {
      this.db = SQLite.openDatabase('BarberPro.db');
      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private static createTables(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.transaction(
        (tx) => {
          // Create customers table
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS customers (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              mobile TEXT NOT NULL,
              visit_date TEXT NOT NULL,
              services TEXT NOT NULL,
              payment_amount REAL NOT NULL,
              birthday TEXT,
              notes TEXT,
              photo_uri TEXT,
              created_at TEXT NOT NULL,
              updated_at TEXT,
              sync_status TEXT DEFAULT 'synced'
            );
          `);

          // Create sync queue table
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS sync_queue (
              id TEXT PRIMARY KEY,
              table_name TEXT NOT NULL,
              operation TEXT NOT NULL,
              data TEXT NOT NULL,
              timestamp TEXT NOT NULL,
              synced INTEGER DEFAULT 0
            );
          `);

          // Create analytics cache table
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS analytics_cache (
              id INTEGER PRIMARY KEY,
              data TEXT NOT NULL,
              cached_at TEXT NOT NULL
            );
          `);
        },
        (error) => {
          console.error('Transaction error:', error);
          reject(error);
        },
        () => {
          console.log('Tables created successfully');
          resolve();
        }
      );
    });
  }

  // Customer operations
  static async getCustomers(): Promise<Customer[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM customers ORDER BY created_at DESC',
          [],
          (_, { rows }) => {
            const customers: Customer[] = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              customers.push({
                id: row.id,
                name: row.name,
                mobile: row.mobile,
                visitDate: row.visit_date,
                services: JSON.parse(row.services),
                paymentAmount: row.payment_amount,
                birthday: row.birthday,
                notes: row.notes,
                photoUri: row.photo_uri,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                syncStatus: row.sync_status as 'synced' | 'pending' | 'conflict'
              });
            }
            resolve(customers);
          },
          (_, error) => {
            console.error('Error getting customers:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }

  static async saveCustomer(customer: Customer): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.transaction((tx) => {
        tx.executeSql(
          `INSERT OR REPLACE INTO customers 
           (id, name, mobile, visit_date, services, payment_amount, birthday, notes, photo_uri, created_at, updated_at, sync_status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            customer.id,
            customer.name,
            customer.mobile,
            customer.visitDate,
            JSON.stringify(customer.services),
            customer.paymentAmount,
            customer.birthday || null,
            customer.notes || null,
            customer.photoUri || null,
            customer.createdAt,
            customer.updatedAt || new Date().toISOString(),
            customer.syncStatus || 'pending'
          ],
          () => resolve(),
          (_, error) => {
            console.error('Error saving customer:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }

  static async deleteCustomer(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.transaction((tx) => {
        tx.executeSql(
          'DELETE FROM customers WHERE id = ?',
          [id],
          () => resolve(),
          (_, error) => {
            console.error('Error deleting customer:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }

  // Sync queue operations
  static async addToSyncQueue(operation: SyncOperation): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.transaction((tx) => {
        tx.executeSql(
          `INSERT INTO sync_queue (id, table_name, operation, data, timestamp, synced)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            operation.id,
            operation.table,
            operation.operation,
            JSON.stringify(operation.data),
            operation.timestamp,
            operation.synced ? 1 : 0
          ],
          () => resolve(),
          (_, error) => {
            console.error('Error adding to sync queue:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }

  static async getSyncQueue(): Promise<SyncOperation[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM sync_queue WHERE synced = 0 ORDER BY timestamp ASC',
          [],
          (_, { rows }) => {
            const operations: SyncOperation[] = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              operations.push({
                id: row.id,
                table: row.table_name,
                operation: row.operation,
                data: JSON.parse(row.data),
                timestamp: row.timestamp,
                synced: row.synced === 1
              });
            }
            resolve(operations);
          },
          (_, error) => {
            console.error('Error getting sync queue:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }

  static async markSynced(operationId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.transaction((tx) => {
        tx.executeSql(
          'UPDATE sync_queue SET synced = 1 WHERE id = ?',
          [operationId],
          () => resolve(),
          (_, error) => {
            console.error('Error marking operation as synced:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }

  // Analytics cache
  static async cacheAnalytics(analytics: Analytics): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.transaction((tx) => {
        tx.executeSql('DELETE FROM analytics_cache', []);
        tx.executeSql(
          'INSERT INTO analytics_cache (data, cached_at) VALUES (?, ?)',
          [JSON.stringify(analytics), new Date().toISOString()],
          () => resolve(),
          (_, error) => {
            console.error('Error caching analytics:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }

  static async getCachedAnalytics(): Promise<Analytics | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM analytics_cache ORDER BY cached_at DESC LIMIT 1',
          [],
          (_, { rows }) => {
            if (rows.length > 0) {
              const row = rows.item(0);
              const cachedAt = new Date(row.cached_at);
              const now = new Date();
              const hoursSinceCached = (now.getTime() - cachedAt.getTime()) / (1000 * 60 * 60);

              // Return cached data if it's less than 1 hour old
              if (hoursSinceCached < 1) {
                resolve(JSON.parse(row.data));
                return;
              }
            }
            resolve(null);
          },
          (_, error) => {
            console.error('Error getting cached analytics:', error);
            resolve(null);
            return false;
          }
        );
      });
    });
  }
}