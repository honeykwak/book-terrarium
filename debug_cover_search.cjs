
const https = require('https');

const queries = ['어린 왕자', '달러구트 꿈 백화점', '데미안'];

// Helper to fetch JSON
const fetchJson = (url) => new Promise((resolve, reject) => {
    https.get(url, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            try { return resolve(JSON.parse(data)); }
            catch (e) { reject(e); }
        });
    }).on('error', reject);
});

async function run() {
    for (const q of queries) {
        console.log(`\n--- Searching: ${q} ---`);
        const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=5&langRestrict=ko`;
        try {
            const data = await fetchJson(url);
            if (!data.items) {
                console.log("No items found.");
                continue;
            }

            data.items.forEach((item, idx) => {
                const info = item.volumeInfo;
                const hasImage = !!(info.imageLinks && info.imageLinks.thumbnail);
                console.log(`Result #${idx + 1}: [${hasImage ? 'HAS_IMG' : 'NO_IMG'}] ${info.title} (${info.authors?.join(', ')})`);
                if (hasImage) {
                    console.log(`   URL: ${info.imageLinks.thumbnail}`);
                }
            });
        } catch (e) {
            console.error("Error:", e.message);
        }
    }
}

run();
