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

            // 1. Try Google Books Covers
            let coverUrl = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail;

            // 2. Fallback to Open Library if Google fails but ISBN exists
            if (!coverUrl && info.industryIdentifiers) {
                const isbn13 = info.industryIdentifiers.find((id: any) => id.type === 'ISBN_13')?.identifier;
                const isbn10 = info.industryIdentifiers.find((id: any) => id.type === 'ISBN_10')?.identifier;
                const isbn = isbn13 || isbn10;
                if (isbn) {
                    coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;
                }
            }

            // Ensure HTTPS
            if (coverUrl) {
                coverUrl = coverUrl.replace(/^http:\/\//i, 'https://');
            }

            return {
                id: item.id,
                title: info.title,
                author: info.authors ? info.authors.join(', ') : 'Unknown Author',
                coverColor: randomColor,
                coverUrl: coverUrl,
                startDate: new Date(),
                isbn: info.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13')?.identifier
            };
        });
    } catch (error) {
        console.error('Error fetching books:', error);
        return [];
    }
};
