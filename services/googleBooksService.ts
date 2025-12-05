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
            // Randomly assign a cover color from the palette
            const randomColor = COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)];

            return {
                id: item.id,
                title: info.title,
                author: info.authors ? info.authors.join(', ') : 'Unknown Author',
                coverColor: randomColor,
                startDate: new Date(),
                // We can store the thumbnail URL in a new field if we update the Book type, 
                // but for now we'll stick to the existing structure or maybe misuse a field?
                // Actually, let's just use the color for now as per design, 
                // or if the user wants real covers, we need to update the Book type.
                // The user said "book recommendation... using Google Books API". 
                // The current UI uses CSS colors for covers. 
                // I will stick to the color for consistency with the current UI, 
                // but I'll add a 'description' or 'thumbnail' if I can.
                // Looking at BookRecommendation.tsx, it uses `book.coverColor`.
            };
        });
    } catch (error) {
        console.error('Error fetching books:', error);
        return [];
    }
};
