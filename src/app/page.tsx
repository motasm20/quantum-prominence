'use client';

import { useState } from 'react';
import styles from './page.module.css';
import { Search, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Follower = {
  username: string;
  full_name: string;
  id: string;
  follower_count?: number;
  biography?: string;
};

export default function Home() {
  const [attemptLog, setAttemptLog] = useState<any[]>([]);

  // ... (inside handleScrape)
  setAttemptLog([]); // Clear previous logs
  // ...
  try {
    // ... fetch call ...
    const data = await response.json();

    if (data.attempt_log) {
      setAttemptLog(data.attempt_log);
    }

    if (!response.ok) {
      throw new Error(data.error || 'Failed to scrape followers');
    }
    // ...
    // ...

    return (
      <main className={styles.container}>
        {/* ... existing content ... */}

        {/* DEBUG LOG SIDEBAR */}
        <AnimatePresence>
          {attemptLog.length > 0 && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                width: '300px',
                background: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '15px',
                zIndex: 1000,
                fontSize: '0.85rem',
                maxHeight: '80vh',
                overflowY: 'auto'
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#fff', borderBottom: '1px solid #333', paddingBottom: '5px' }}>
                📡 Auto-Pilot Logs
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {attemptLog.map((log, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: log.status === 'success' ? '#4caf50' : '#ff5252'
                  }}>
                    {log.status === 'success' ? '✅' : '❌'}
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{log.method}</div>
                      {log.error && <div style={{ fontSize: '0.75rem', color: '#ccc' }}>{log.error}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    );
  }

      <div className={styles.results}>
    <AnimatePresence>
      {results.map((follower, index) => (
        <motion.div
          key={index}
          className={styles.resultCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div>
            <div className={styles.username}>@{follower.username}</div>
            <div className={styles.fullname}>{follower.full_name}</div>
            {follower.biography && (
              <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '4px', fontStyle: 'italic' }}>
                {follower.biography.slice(0, 60)}{follower.biography.length > 60 ? '...' : ''}
              </div>
            )}
          </div>
          {follower.follower_count !== undefined && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', color: '#888' }}>Followers</div>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#fff' }}>
                {follower.follower_count.toLocaleString()}
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
    </main >
  );
}
