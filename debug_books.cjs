
const https = require('https');

const query = '어린 왕자';
const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=3&langRestrict=ko`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log(JSON.stringify(json.items[0], null, 2));
            if (json.items && json.items[0].volumeInfo.imageLinks) {
                console.log("Image Links found:", json.items[0].volumeInfo.imageLinks);
            } else {
                console.log("No Image Links found.");
            }
        } catch (e) {
            console.error(e.message);
        }
    });
}).on('error', (err) => {
    console.error("Error: " + err.message);
});
