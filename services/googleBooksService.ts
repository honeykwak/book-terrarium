import { Book } from '../types';
import { COVER_COLORS } from '../constants';

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

export const searchBooks = async (query: string): Promise<Book[]> => {
    try {
        const response = await fetch(`${GOOGLE_BOOKS_API_URL}?q=${encodeURIComponent(query)}&maxResults=3&langRestrict=ko`);
        const data = await response.json();

        if (!data.items) return [];

        return data.items.map((item: any) => {
            const info = item.volumeInfo;
            const randomColor = COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)];
            const coverUrl = info.imageLinks?.thumbnail?.replace(/^http:\/\//i, 'https://');

            return {
                id: item.id,
                title: info.title,
                author: info.authors ? info.authors.join(', ') : 'Unknown Author',
                coverColor: randomColor,
                coverUrl: coverUrl,
                startDate: new Date(),
            };
        });
    } catch (error) {
        console.error('Error fetching books:', error);
        return [];
    }
};
