
import { Book } from '../types';

const NAROO_API_URL = 'http://data4library.kr/api/srchDtlList';

const getInfoNaruKeys = () => {
    const key1 = import.meta.env.VITE_INFONARU_API_KEY1;
    const key2 = import.meta.env.VITE_INFONARU_API_KEY2;
    // Filter out undefined keys
    return [key1, key2].filter(Boolean) as string[];
};

let keyIndex = 0;

export const fetchCoverFromNaroo = async (isbn: string): Promise<string | null> => {
    const keys = getInfoNaruKeys();
    if (keys.length === 0) return null;

    // Round-robin key selection
    const authKey = keys[keyIndex];
    keyIndex = (keyIndex + 1) % keys.length;

    try {
        // format=json is supported by Naroo API
        const response = await fetch(`${NAROO_API_URL}?authKey=${authKey}&isbn13=${isbn}&format=json`);
        const data = await response.json();

        if (data.response && data.response.detail && data.response.detail.length > 0) {
            return data.response.detail[0].book.bookImageURL;
        }
        return null;
    } catch (error) {
        console.error('Error fetching from Naroo API:', error);
        return null;
    }
};
