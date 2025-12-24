const instatouch = require('instatouch');

async function scrapeFollowers() {
    const args = process.argv.slice(2);
    const username = args[0];
    const session = args[1]; // passed as "sessionid=..." or just the ID

    if (!username) {
        console.log(JSON.stringify({ success: false, error: 'Username required' }));
        process.exit(1);
    }

    if (!session) {
        console.log(JSON.stringify({ success: false, error: 'Session ID is required for Method 6 (InstaTouch)' }));
        process.exit(0);
    }

    // Ensure session has the cookie format
    const sessionStr = session.includes('sessionid') ? session : `sessionid=${session}`;

    try {
        const options = {
            count: 50,
            session: sessionStr,
            mediaType: 'all',
            download: false,
            asyncDownload: 5,
        };

        // instatouch.followers is a Promise that returns data
        const result = await instatouch.followers(username, options);

        // instatouch returns an object with 'collector' array
        const followers = result.collector.map(f => ({
            username: f.username,
            full_name: f.full_name,
            id: f.id,
            follower_count: 0 // InstaTouch follower list items usually don't have follower_count of themselves
        }));

        console.log(JSON.stringify({
            success: true,
            followers: followers,
            method: 'Method 6 (InstaTouch)',
            is_private: false // InstaTouch typically fails on private, assuming public if successful
        }));

    } catch (error) {
        console.log(JSON.stringify({ success: false, error: error.message || str(error) }));
    }
}

scrapeFollowers();
