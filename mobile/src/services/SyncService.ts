import * as Network from 'expo-network';
import { LocalStorageService } from './LocalStorageService';
import { SupabaseService } from './SupabaseService';
import { SyncOperation, Customer } from '../types';

export class SyncService {
  private static isOnline = false;
  private static syncInProgress = false;

  static async initialize(): Promise<void> {
    // Get initial network status
    const networkState = await Network.getNetworkStateAsync();
    this.isOnline = networkState.isConnected || false;

    // Monitor network status changes
    this.startNetworkMonitoring();
  }

  private static startNetworkMonitoring() {
    // Check network status periodically
    setInterval(async () => {
      const networkState = await Network.getNetworkStateAsync();
      const wasOffline = !this.isOnline;
      this.isOnline = networkState.isConnected || false;
      
      // If we just came back online, trigger sync
      if (wasOffline && this.isOnline) {
        this.syncPendingOperations();
      }
    }, 5000); // Check every 5 seconds
  }

  static async queueOperation(
    table: string,
    operation: 'create' | 'update' | 'delete',
    data: any
  ): Promise<void> {
    const syncOperation: SyncOperation = {
      id: Math.random().toString(36).substr(2, 9),
      table,
      operation,
      data,
      timestamp: new Date().toISOString(),
      synced: false
    };

    await LocalStorageService.addToSyncQueue(syncOperation);

    // Try to sync immediately if online
    if (this.isOnline) {
      this.syncPendingOperations();
    }
  }

  static async syncPendingOperations(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;

    try {
      const pendingOperations = await LocalStorageService.getSyncQueue();
      
      for (const operation of pendingOperations) {
        try {
          await this.executeOperation(operation);
          await LocalStorageService.markSynced(operation.id);
        } catch (error) {
          console.error('Error syncing operation:', operation, error);
          // Continue with other operations
        }
      }
    } catch (error) {
      console.error('Error during sync:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private static async executeOperation(operation: SyncOperation): Promise<void> {
    switch (operation.table) {
      case 'customers':
        await this.syncCustomerOperation(operation);
        break;
      // Add other table sync operations here
      default:
        console.warn('Unknown table for sync:', operation.table);
    }
  }

  private static async syncCustomerOperation(operation: SyncOperation): Promise<void> {
    switch (operation.operation) {
      case 'create':
        await SupabaseService.createCustomer(operation.data);
        break;
      case 'update':
        await SupabaseService.updateCustomer(operation.data.id, operation.data);
        break;
      case 'delete':
        await SupabaseService.deleteCustomer(operation.data.id);
        break;
    }
  }

  static async syncFromServer(): Promise<void> {
    if (!this.isOnline) {
      throw new Error('Cannot sync from server while offline');
    }

    try {
      // Fetch latest data from server
      const serverCustomers = await SupabaseService.getCustomers();
      const localCustomers = await LocalStorageService.getCustomers();

      // Simple sync strategy: server wins for conflicts
      for (const serverCustomer of serverCustomers) {
        const localCustomer = localCustomers.find(c => c.id === serverCustomer.id);
        
        if (!localCustomer) {
          // New customer from server
          await LocalStorageService.saveCustomer({
            ...serverCustomer,
            syncStatus: 'synced'
          });
        } else if (localCustomer.syncStatus === 'synced') {
          // Update local with server data
          await LocalStorageService.saveCustomer({
            ...serverCustomer,
            syncStatus: 'synced'
          });
        }
        // If local has pending changes, keep them (will be synced later)
      }

      // Remove customers that no longer exist on server
      const serverIds = new Set(serverCustomers.map(c => c.id));
      for (const localCustomer of localCustomers) {
        if (!serverIds.has(localCustomer.id) && localCustomer.syncStatus === 'synced') {
          await LocalStorageService.deleteCustomer(localCustomer.id);
        }
      }
    } catch (error) {
      console.error('Error syncing from server:', error);
      throw error;
    }
  }

  static getNetworkStatus(): boolean {
    return this.isOnline;
  }

  static isSyncInProgress(): boolean {
    return this.syncInProgress;
  }
}