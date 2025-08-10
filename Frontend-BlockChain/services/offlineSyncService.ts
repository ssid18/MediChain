import Dexie, { type Table } from 'dexie';
import type { QueuedPrescription, Role } from '../types';
import { geminiService } from './geminiService';
import { generateHash } from '../utils/crypto';
import { mockBlockchainService } from './mockBlockchainService';

type SyncStatus = 'offline' | 'online' | 'syncing' | 'idle';
type StatusUpdate = {
    status: SyncStatus;
    queueSize: number;
}
type StatusListener = (update: StatusUpdate) => void;

class OfflineSyncService extends Dexie {
    prescriptions!: Table<QueuedPrescription>;
    private status: SyncStatus;
    private queueSize: number = 0;
    private listeners: StatusListener[] = [];

    constructor() {
        super('MediChainOfflineDB');
        // Explicitly cast this to Dexie to resolve a potential type inference issue in some environments.
        (this as Dexie).version(1).stores({
            prescriptions: '++id, queuedAt',
        });
        this.status = navigator.onLine ? 'online' : 'offline';
        this.initialize();
    }

    private async initialize() {
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
        this.queueSize = await this.prescriptions.count();
        this.notifyListeners();
        
        if (this.status === 'online') {
            this.processQueue();
        }
    }
    
    subscribe(listener: StatusListener): () => void {
        this.listeners.push(listener);
        // Immediately notify new listener of current status
        listener({ status: this.status, queueSize: this.queueSize });
        
        // Return an unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notifyListeners() {
        const update = { status: this.status, queueSize: this.queueSize };
        this.listeners.forEach(listener => listener(update));
    }
    
    private setStatus(newStatus: SyncStatus) {
        if (this.status !== newStatus) {
            this.status = newStatus;
            this.notifyListeners();
        }
    }
    
    private async updateQueueSize() {
        this.queueSize = await this.prescriptions.count();
        this.notifyListeners();
    }

    private handleOnline() {
        this.setStatus('online');
        this.processQueue();
    }

    private handleOffline() {
        this.setStatus('offline');
    }

    async queuePrescription(file: File, uploaderId: string, uploaderRole: Role): Promise<void> {
        const newQueuedItem: QueuedPrescription = {
            file,
            uploaderId,
            uploaderRole,
            queuedAt: new Date().toISOString(),
        };
        await this.prescriptions.add(newQueuedItem);
        await this.updateQueueSize();
    }

    async processQueue(): Promise<void> {
        if (this.status !== 'online' || this.queueSize === 0) {
            return;
        }

        this.setStatus('syncing');
        
        const itemsToProcess = await this.prescriptions.orderBy('queuedAt').toArray();
        
        for (const item of itemsToProcess) {
            const itemId = item.id;
            try {
                if (!itemId) {
                    console.warn('Skipping queued item with no ID.', item);
                    continue;
                }
                
                console.log(`Processing queued item #${itemId}`);
                const extractedData = await geminiService.extractPrescriptionData(item.file);
                const dataHash = await generateHash(extractedData);

                mockBlockchainService.storePrescription({
                    hash: dataHash,
                    data: extractedData,
                    uploaderId: item.uploaderId,
                    uploaderRole: item.uploaderRole,
                });
                
                // If successful, remove from queue
                await this.prescriptions.delete(itemId);
                await this.updateQueueSize();
                console.log(`Successfully processed and removed item #${itemId}`);
            } catch (error) {
                console.error(`Failed to process queued item #${itemId || 'unknown'}. It will be retried later.`, error);
                // We stop processing on failure to maintain order and prevent spamming a failing request
                break;
            }
        }
        
        // After processing, set status based on remaining queue.
        this.setStatus('online');
    }
}

export const offlineSyncService = new OfflineSyncService();