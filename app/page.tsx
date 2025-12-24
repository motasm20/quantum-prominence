'use client';

import { useState } from 'react';
import styles from './page.module.css';
import { Search, Users, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Follower = {
    username: string;
    full_name: string;
    id: string;
};

type ScrapeResult = {
    success: boolean;
    followers: Follower[];
    method: string;
    error?: string;
};

export default function Home() {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<Follower[]>([]);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');

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
                body: JSON.stringify({ username }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to scrape followers');
            }

            if (data.followers && data.followers.length > 0) {
                setResults(data.followers);
                setStatus(`Successfully scraped ${data.followers.length} followers using ${data.method}`);
            } else {
                setError('No followers found or profile is private/inaccessible.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className={styles.container}>
            <div className={styles.title}>InstaScrape Pro</div>

            <motion.div
                className={styles.card}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
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
                        />
                    </div>

                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <Loader2 className="animate-spin" size={20} />
                                Scraping...
                            </span>
                        ) : (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <Search size={20} />
                                Start Scrape
                            </span>
                        )}
                    </button>
                </form>

                {status && <div style={{ marginTop: '1rem', textAlign: 'center', color: '#888' }}>{status}</div>}
                {error && (
                    <div style={{ marginTop: '1rem', color: '#ff4444', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}
            </motion.div>

            <div className={styles.results}>
                <AnimatePresence>
                    {results.map((follower, index) => (
                        <motion.div
                            key={index}
                            className={styles.resultCard}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <div className={styles.username}>@{follower.username}</div>
                            <div className={styles.fullname}>{follower.full_name}</div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </main>
    );
}
