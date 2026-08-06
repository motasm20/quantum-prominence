
export const METHOD1_SNIPPET = `
// ==========================================
// 📸 INSTAGRAM FOLLOWER SCRAPER (MANUAL)
// ==========================================
// 1. Log in to Instagram.com
// 2. Open the "Followers" or "Following" list of any profile.
// 3. Paste this ENTIRE code into the Developer Console (F12 -> Console) and hit Enter.
// ==========================================

(async function() {
    console.clear();
    console.log("%c🚀 Starting InstaScrape Manual...", "color: #00e676; font-size: 16px; font-weight: bold;");

    // --- Helper: Sleep ---
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    // --- Helper: Find Scrollable Modal ---
    function findScrollable() {
        // Current IG selector for the scrollable list container (Subject to change)
        // Usually inside role="dialog"
        const dialog = document.querySelector('div[role="dialog"]');
        if (!dialog) return null;
        
        // Find the element with scroll capability
        const scrollable = Array.from(dialog.querySelectorAll('div')).find(el => {
            const style = window.getComputedStyle(el);
            return style.overflowY === 'auto' || style.overflowY === 'scroll';
        });
        
        return scrollable;
    }

    const scrollableDiv = findScrollable();

    if (!scrollableDiv) {
        console.error("❌ ERROR: Could not find the followers list!");
        alert("⚠️ Please open the Followers/Following list window first, then run this script again.");
        return;
    }

    console.log("✅ Target list found. Scrolling started...");

    // --- Scrolling Loop ---
    let prevHeight = 0;
    let sameHeightCount = 0;
    const MAX_RETRIES = 5;

    while (true) {
        // Scroll to bottom
        scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
        
        // Wait random time to mimic human (1.5s - 2.5s)
        const waitTime = Math.floor(Math.random() * 1000) + 1500;
        await sleep(waitTime);

        const newHeight = scrollableDiv.scrollHeight;
        const count = document.querySelectorAll('div[role="dialog"] a:not([href="#"])').length / 2; // rough est
        
        console.log(\`📜 Height: \${prevHeight} -> \${newHeight} | Est. Items: ~\${Math.floor(count)}\`);

        if (newHeight === prevHeight) {
            sameHeightCount++;
            if (sameHeightCount >= MAX_RETRIES) {
                console.log("🛑 Reached bottom or limit.");
                break;
            }
        } else {
            sameHeightCount = 0;
            prevHeight = newHeight;
        }
    }

    // --- Extraction ---
    console.log("⛏️ Extracting data...");
    const data = [];
    const seen = new Set();

    // Select all links in the dialog
    const links = document.querySelectorAll('div[role="dialog"] a');
    
    links.forEach(a => {
        const href = a.getAttribute('href');
        const username = a.innerText.trim();
        
        // Filter basics
        if (href && href !== '/' && !href.includes('explore') && username && !seen.has(username)) {
             // Basic heuristic: IG usernames in lists are usually bold links
             // This scrapes ANY link text, so might get garbage, but unique Set helps.
             if(href.replace('/', '').replace('/', '') === username) {
                 data.push({ username, url: \`https://www.instagram.com\${href}\` });
                 seen.add(username);
             }
        }
    });

    console.log(\`✅ Found \${data.length} unique users!\`);

    if (data.length === 0) {
        alert("⚠️ No users found. Did the page change?");
        return;
    }

    // --- CSV Export ---
    let csvContent = "data:text/csv;charset=utf-8,Username,Profile URL\\n";
    data.forEach(row => {
        csvContent += \`\${row.username},\${row.url}\\n\`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const filename = \`followers_\${new Date().toISOString().slice(0,10)}.csv\`;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log(\`🎉 Downloaded: \${filename}\`);
    alert(\`🎉 SUCCESS! Scraped \${data.length} users.\n\nFile downloaded: \${filename}\`);

})();
`;

export const METHOD3_INSTRUCTIONS = `
### How to use Method 3 (Browser Extension)

This method involves running a custom browser extension that intercepts Instagram's network traffic to scrape data invisibly.

**Steps:**
1.  **Locate the Extension**: Navigate to \`playgound/quantum-prominence/scrapers/method3\` in this project.
2.  **Load Unpacked**:
    *   Open Chrome/Edge.
    *   Go to \`chrome://extensions\`.
    *   Enable "Developer Mode" (top right).
    *   Click "Load Unpacked" and select the \`dist\` folder inside \`method3\`. (You may need to build it first with \`npm run build\` inside that folder).
3.  **Run**:
    *   Go to Instagram.com.
    *   You should see a new "Download" button overlay or panel injected by the extension.
    *   Browse any followers list, hashtags, or locations. The background scraper will collect profiles.
    *   Click "Download" to export the data.

*Note: This is an advanced method for heavy users.*
`;
