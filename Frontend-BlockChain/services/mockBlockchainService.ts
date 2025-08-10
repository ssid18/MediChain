import type { BlockchainRecord, PrescriptionData } from '../types';

const BLOCKCHAIN_KEY = 'medi_chain_blockchain';

class MockBlockchainService {
  private getChain(): BlockchainRecord[] {
    const chainJson = localStorage.getItem(BLOCKCHAIN_KEY);
    if (chainJson) {
      try {
        return JSON.parse(chainJson) as BlockchainRecord[];
      } catch (e) {
        console.error("Failed to parse blockchain from localStorage", e);
        return [];
      }
    }
    return [];
  }

  private saveChain(chain: BlockchainRecord[]): void {
    localStorage.setItem(BLOCKCHAIN_KEY, JSON.stringify(chain));
  }

  storePrescription(record: Omit<BlockchainRecord, 'timestamp'>): BlockchainRecord {
    const chain = this.getChain();
    const newRecord: BlockchainRecord = {
      ...record,
      timestamp: new Date().toISOString(),
    };
    const updatedChain = [...chain, newRecord];
    this.saveChain(updatedChain);
    return newRecord;
  }

  verifyHash(hash: string): BlockchainRecord | null {
    const chain = this.getChain();
    return chain.find(record => record.hash === hash) || null;
  }

  getAllTransactions(): BlockchainRecord[] {
    return this.getChain().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

export const mockBlockchainService = new MockBlockchainService();
