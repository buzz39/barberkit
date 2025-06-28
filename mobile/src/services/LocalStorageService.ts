import AsyncStorage from '@react-native-async-storage/async-storage';
import SQLite from 'react-native-sqlite-storage';
import { Customer, SyncOperation, Analytics } from '../types';

SQLite.DEBUG(true);
SQLite.enablePromise(true);

export class LocalStorageService {
  private static db: SQLite.SQLiteDatabase | null = null;

  static async initDatabase(): Promise<void> {
    try {
      this.db = await SQLite.openDatabase({
        name: 'BarberPro.db',
        location: 'default',
      });

      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private static async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const createCustomersTable = `
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
    `;

    const createSyncQueueTable = `
      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        table_name TEXT NOT NULL,
        operation TEXT NOT NULL,
        data TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        synced INTEGER DEFAULT 0
      );
    `;

    const createAnalyticsTable = `
      CREATE TABLE IF NOT EXISTS analytics_cache (
        id INTEGER PRIMARY KEY,
        data TEXT NOT NULL,
        cached_at TEXT NOT NULL
      );
    `;

    await this.db.executeSql(createCustomersTable);
    await this.db.executeSql(createSyncQueueTable);
    await this.db.executeSql(createAnalyticsTable);
  }

  // Customer operations
  static async getCustomers(): Promise<Customer[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const [results] = await this.db.executeSql(
        'SELECT * FROM customers ORDER BY created_at DESC'
      );

      const customers: Customer[] = [];
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i);
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

      return customers;
    } catch (error) {
      console.error('Error getting customers from local storage:', error);
      throw error;
    }
  }

  static async saveCustomer(customer: Customer): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const sql = `
        INSERT OR REPLACE INTO customers 
        (id, name, mobile, visit_date, services, payment_amount, birthday, notes, photo_uri, created_at, updated_at, sync_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await this.db.executeSql(sql, [
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
      ]);
    } catch (error) {
      console.error('Error saving customer to local storage:', error);
      throw error;
    }
  }

  static async deleteCustomer(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.executeSql('DELETE FROM customers WHERE id = ?', [id]);
    } catch (error) {
      console.error('Error deleting customer from local storage:', error);
      throw error;
    }
  }

  // Sync queue operations
  static async addToSyncQueue(operation: SyncOperation): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const sql = `
        INSERT INTO sync_queue (id, table_name, operation, data, timestamp, synced)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      await this.db.executeSql(sql, [
        operation.id,
        operation.table,
        operation.operation,
        JSON.stringify(operation.data),
        operation.timestamp,
        operation.synced ? 1 : 0
      ]);
    } catch (error) {
      console.error('Error adding to sync queue:', error);
      throw error;
    }
  }

  static async getSyncQueue(): Promise<SyncOperation[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const [results] = await this.db.executeSql(
        'SELECT * FROM sync_queue WHERE synced = 0 ORDER BY timestamp ASC'
      );

      const operations: SyncOperation[] = [];
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i);
        operations.push({
          id: row.id,
          table: row.table_name,
          operation: row.operation,
          data: JSON.parse(row.data),
          timestamp: row.timestamp,
          synced: row.synced === 1
        });
      }

      return operations;
    } catch (error) {
      console.error('Error getting sync queue:', error);
      throw error;
    }
  }

  static async markSynced(operationId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.executeSql(
        'UPDATE sync_queue SET synced = 1 WHERE id = ?',
        [operationId]
      );
    } catch (error) {
      console.error('Error marking operation as synced:', error);
      throw error;
    }
  }

  // Analytics cache
  static async cacheAnalytics(analytics: Analytics): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.executeSql('DELETE FROM analytics_cache');
      await this.db.executeSql(
        'INSERT INTO analytics_cache (data, cached_at) VALUES (?, ?)',
        [JSON.stringify(analytics), new Date().toISOString()]
      );
    } catch (error) {
      console.error('Error caching analytics:', error);
      throw error;
    }
  }

  static async getCachedAnalytics(): Promise<Analytics | null> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const [results] = await this.db.executeSql(
        'SELECT * FROM analytics_cache ORDER BY cached_at DESC LIMIT 1'
      );

      if (results.rows.length > 0) {
        const row = results.rows.item(0);
        const cachedAt = new Date(row.cached_at);
        const now = new Date();
        const hoursSinceCached = (now.getTime() - cachedAt.getTime()) / (1000 * 60 * 60);

        // Return cached data if it's less than 1 hour old
        if (hoursSinceCached < 1) {
          return JSON.parse(row.data);
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting cached analytics:', error);
      return null;
    }
  }

  // App settings
  static async setSetting(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(`setting_${key}`, value);
    } catch (error) {
      console.error('Error setting app setting:', error);
      throw error;
    }
  }

  static async getSetting(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(`setting_${key}`);
    } catch (error) {
      console.error('Error getting app setting:', error);
      return null;
    }
  }

  static async removeSetting(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`setting_${key}`);
    } catch (error) {
      console.error('Error removing app setting:', error);
      throw error;
    }
  }
}