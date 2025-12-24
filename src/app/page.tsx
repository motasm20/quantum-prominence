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
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Follower[]>([]);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const [scrapflyKey, setScrapflyKey] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'method2' | 'method4' | 'method5' | 'method6' | 'auto'>('auto');
  // ...

  // Inside the grid:
  {/* Auto / Best Effort */ }
              <div
                onClick={() => setSelectedMethod('auto')}
                style={{
                  gridColumn: 'span 3',
                  border: selectedMethod === 'auto' ? '2px solid #00e676' : '1px solid rgba(255,255,255,0.1)',
                  background: selectedMethod === 'auto' ? 'rgba(0, 230, 118, 0.1)' : 'rgba(0,0,0,0.2)',
                  padding: '15px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                  marginBottom: '10px'
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    🚀 Auto Pilot (Best Effort)
                </div>
                <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '4px' }}>
                    Automatically tries ALL methods until one succeeds.
                </div>
              </div>

  // ... (existing grid methods below) ...

  // Update input visibility logic
            <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <AnimatePresence>
              {(selectedMethod === 'method5' || selectedMethod === 'auto') && (
                <motion.div
  // ... (ScrapFly input) ...
  
  // ...
            <AnimatePresence>
              {(selectedMethod === 'method2' || selectedMethod === 'method4' || selectedMethod === 'method6' || selectedMethod === 'auto') && (
                <motion.div
  // ... (Session ID input) ...
  const [sessionId, setSessionId] = useState('');

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;

    setLoading(true);
    setError('');
    setResults([]);
    setStatus('Initializing scraper...');

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, scrapflyKey, selectedMethod, sessionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scrape followers');
      }

      if (data.followers && data.followers.length > 0) {
        setResults(data.followers);
        setStatus(`Successfully fetched data using ${data.method}`);
      } else {
        setError('No data found. The account might be private or blocked.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <motion.div
        className={styles.title}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        InstaScrape Pro
      </motion.div>

      <motion.div
        className={styles.card}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <form onSubmit={handleScrape}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              className={styles.input}
              placeholder="Enter Instagram Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>


          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ color: '#ccc', display: 'block', marginBottom: '10px', fontSize: '0.9rem' }}>Select Scraping Method:</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              {/* Auto / Best Effort */}
              <div
                onClick={() => setSelectedMethod('auto')}
                style={{
                  gridColumn: '1 / -1',
                  border: selectedMethod === 'auto' ? '2px solid #00e676' : '1px solid rgba(255,255,255,0.1)',
                  background: selectedMethod === 'auto' ? 'rgba(0, 230, 118, 0.1)' : 'rgba(0,0,0,0.2)',
                  padding: '15px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                  marginBottom: '5px'
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    🚀 Auto Pilot (Best Effort)
                </div>
                <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '4px' }}>
                    Automatically tries ALL methods until one succeeds.
                </div>
              </div>

              {/* Method 1: JS Snippet */}
              <div
                style={{
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(0,0,0,0.2)',
                  padding: '10px', borderRadius: '12px', cursor: 'not-allowed', textAlign: 'center', opacity: 0.6
                }}
                title="Manual Browser Snippet"
              >
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#fff' }}>Method 1</div>
                <div style={{ fontSize: '0.75rem', color: '#888' }}>JS Console (Manual)</div>
              </div>

              {/* Method 2: Instaloader */}
              <div
                onClick={() => setSelectedMethod('method2')}
                style={{
                  border: selectedMethod === 'method2' ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                  background: selectedMethod === 'method2' ? 'rgba(138, 43, 226, 0.1)' : 'rgba(0,0,0,0.2)',
                  padding: '10px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#fff' }}>Method 2</div>
                <div style={{ fontSize: '0.75rem', color: '#888' }}>Instaloader (Python)</div>
              </div>

              {/* Method 3: Browser Extension */}
              <div
                style={{
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(0,0,0,0.2)',
                  padding: '10px', borderRadius: '12px', cursor: 'not-allowed', textAlign: 'center', opacity: 0.6
                }}
                title="Browser Extension (Manual)"
              >
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#fff' }}>Method 3</div>
                <div style={{ fontSize: '0.75rem', color: '#888' }}>Extension (Browser)</div>
              </div>

              {/* Method 4: Instabot */}
              <div
                onClick={() => setSelectedMethod('method4')}
                style={{
                  border: selectedMethod === 'method4' ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                  background: selectedMethod === 'method4' ? 'rgba(138, 43, 226, 0.1)' : 'rgba(0,0,0,0.2)',
                  padding: '10px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#fff' }}>Method 4</div>
                <div style={{ fontSize: '0.75rem', color: '#888' }}>Instabot (Deep)</div>
              </div>

              {/* Method 5: ScrapFly */}
              <div
                onClick={() => setSelectedMethod('method5')}
                style={{
                  border: selectedMethod === 'method5' ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                  background: selectedMethod === 'method5' ? 'rgba(138, 43, 226, 0.1)' : 'rgba(0,0,0,0.2)',
                  padding: '10px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#fff' }}>Method 5</div>
                <div style={{ fontSize: '0.75rem', color: '#888' }}>ScrapFly (API)</div>
              </div>

              {/* Method 6: InstaTouch */}
              <div
                onClick={() => setSelectedMethod('method6')}
                style={{
                  border: selectedMethod === 'method6' ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                  background: selectedMethod === 'method6' ? 'rgba(138, 43, 226, 0.1)' : 'rgba(0,0,0,0.2)',
                  padding: '10px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                  opacity: 1
                }}
                title="Method 6 (InstaTouch)"
              >
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#fff' }}>Method 6</div>
                <div style={{ fontSize: '0.75rem', color: '#888' }}>InstaTouch (Node)</div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <AnimatePresence>
              {(selectedMethod === 'method5' || selectedMethod === 'auto') ? (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: 'auto', opacity: 1, marginTop: 8 }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Enter your ScrapFly API Key"
                    value={scrapflyKey}
                    onChange={(e) => setScrapflyKey(e.target.value)}
                    disabled={loading}
                    style={{
                      fontSize: '0.9rem',
                      padding: '0.8rem',
                      borderColor: !scrapflyKey ? 'rgba(255, 68, 68, 0.5)' : 'rgba(255,255,255,0.1)'
                    }}
                  />
                  <div className={styles.helperText}>
                    Required for Method 5. Get a key at <a href="https://scrapfly.io" target="_blank" className={styles.link}>scrapfly.io</a>
                  </div>
                </motion.div>
              ) : (null)}
            </AnimatePresence>
          </div>

          <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <AnimatePresence>
              {(selectedMethod === 'method2' || selectedMethod === 'method6' || selectedMethod === 'auto') && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className={styles.inputGroup}
                  style={{ overflow: 'hidden' }}
                >
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Instagram Session ID (Optional but Recommended)"
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                    disabled={loading}
                    style={{ fontSize: '0.9rem', borderColor: !sessionId ? 'rgba(255, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.1)' }}
                  />
                  <div className={styles.helperText}>
                    Required for Method 6 and recommended for Method 2 to fetch details. Copy `sessionid` from your browser cookies.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <Loader2 className="animate-spin" size={20} />
                Scraping...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <Search size={20} />
                Start Scrape
              </span>
            )}
          </button>
        </form>

        {status && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ marginTop: '1.5rem', textAlign: 'center', color: '#888', fontSize: '0.9rem' }}
          >
            {status}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: '1.5rem',
              color: '#ff6b6b',
              background: 'rgba(255, 107, 107, 0.1)',
              padding: '1rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.9rem'
            }}
          >
            <AlertCircle size={20} />
            <div>{error}</div>
          </motion.div>
        )}
      </motion.div>

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
    </main>
  );
}
