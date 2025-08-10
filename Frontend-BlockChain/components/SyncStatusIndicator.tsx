import React, { useState, useEffect } from 'react';
import { offlineSyncService } from '../services/offlineSyncService';
import { WifiSlashIcon, CubeTransparentIcon } from '../constants';
import Spinner from './Spinner';

const SyncStatusIndicator: React.FC = () => {
    const [status, setStatus] = useState<'offline' | 'online' | 'syncing' | 'idle'>('idle');
    const [queueSize, setQueueSize] = useState(0);

    useEffect(() => {
        const unsubscribe = offlineSyncService.subscribe(update => {
            setStatus(update.status);
            setQueueSize(update.queueSize);
        });

        return () => unsubscribe();
    }, []);

    const getIndicatorContent = () => {
        switch (status) {
            case 'offline':
                return (
                    <div className="flex items-center gap-2" title={`You are offline. ${queueSize} item(s) are queued.`}>
                        <WifiSlashIcon className="w-5 h-5 text-yellow-400" />
                        <span className="text-yellow-300 text-sm font-medium">{queueSize > 0 ? queueSize : ''}</span>
                    </div>
                );
            case 'syncing':
                return (
                     <div className="flex items-center gap-2" title={`Syncing ${queueSize} item(s)...`}>
                        <Spinner size="sm" />
                        <span className="text-violet-300 text-sm font-medium">{queueSize}</span>
                    </div>
                );
            case 'online':
                if (queueSize > 0) {
                    return (
                        <div className="flex items-center gap-2" title={`${queueSize} item(s) pending sync.`}>
                           <CubeTransparentIcon className="w-5 h-5 text-violet-400 animate-pulse" />
                           <span className="text-violet-300 text-sm font-medium">{queueSize}</span>
                        </div>
                    );
                }
                return null; // Don't show anything if online and queue is empty
            case 'idle':
            default:
                return null;
        }
    };
    
    const content = getIndicatorContent();
    if (!content) return null;

    return (
        <div className="bg-slate-800/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-700/50">
            {content}
        </div>
    );
};

export default SyncStatusIndicator;
