import { supabase } from '../supabaseClient';
import { Book, Message, UserProfile, CommunityPost, ChatSession } from '../types';

export const dbService = {
    // --- Profiles ---
    async getUserProfile(userId: string): Promise<UserProfile | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) return null;
        return {
            id: data.id,
            nickname: data.nickname,
            email: data.email,
            avatarUrl: data.avatar_url,
            preferredLibCodes: data.preferred_lib_codes
        };
    },

    // --- Books (Cache) ---
    async getOrCreateBook(bookData: Book): Promise<string> {
        // 1. Check if book exists by ISBN (or Title/Author if ISBN missing)
        let query = supabase.from('books').select('id');

        if (bookData.isbn) {
            query = query.eq('isbn', bookData.isbn);
        } else {
            query = query.eq('title', bookData.title).eq('author', bookData.author);
        }

        const { data: existing, error } = await query.maybeSingle();

        if (existing) return existing.id;

        // 2. Insert if not exists
        const { data: newBook, error: insertError } = await supabase
            .from('books')
            .insert({
                isbn: bookData.isbn,
                title: bookData.title,
                author: bookData.author,
                cover_url: bookData.coverUrl,
                description: bookData.description,
                publisher: bookData.publisher
            })
            .select('id')
            .single();

        if (insertError) throw insertError;
        return newBook.id;
    },

    // --- User Books ---
    async createUserBook(userId: string, bookData: Book): Promise<Book> {
        // 1. Ensure book exists in cache
        const publicBookId = await this.getOrCreateBook(bookData);

        // 2. Create user_book entry
        const { data, error } = await supabase
            .from('user_books')
            .insert({
                user_id: userId,
                book_id: publicBookId,
                status: 'READING',
                start_date: new Date().toISOString(),
                // cover_url is optional in user_books as we can join, but keeping it for now if schema has it? 
                // Schema says cover_url is NOT in user_books, it's in books. 
                // Wait, my schema had cover_url in user_books? 
                // Let's check schema. user_books does NOT have cover_url in the new schema. 
                // It has book_id.
            })
            .select(`
        *,
        book:books(*)
      `)
            .single();

        if (error) throw error;
        return this.mapUserBook(data);
    },

    async getUserBooks(userId: string): Promise<Book[]> {
        const { data, error } = await supabase
            .from('user_books')
            .select(`
        *,
        book:books(*)
      `)
            .eq('user_id', userId)
            .order('start_date', { ascending: false });

        if (error) throw error;
        return data.map(this.mapUserBook);
    },

    async updateUserBook(userBookId: string, updates: Partial<Book>) {
        const dbUpdates: any = {};
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.completedDate) dbUpdates.completed_date = updates.completedDate.toISOString();
        if (updates.rating) dbUpdates.rating = updates.rating;
        if (updates.review) dbUpdates.review = updates.review;
        if (updates.isShared !== undefined) dbUpdates.is_shared = updates.isShared;
        if (updates.report) {
            dbUpdates.report_content = JSON.stringify(updates.report);
        }

        const { error } = await supabase
            .from('user_books')
            .update(dbUpdates)
            .eq('id', userBookId);

        if (error) throw error;
    },

    async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
        const dbUpdates: any = {
            id: userId, // Required for upsert
            updated_at: new Date(),
        };
        if (updates.nickname) dbUpdates.nickname = updates.nickname;
        if (updates.preferredLibCodes) dbUpdates.preferred_lib_codes = updates.preferredLibCodes;
        if (updates.email) dbUpdates.email = updates.email; // Optional if passed

        const { error } = await supabase
            .from('profiles')
            .upsert(dbUpdates)
            .select();

        if (error) throw error;
    },

    // --- Chat Sessions ---
    async createSession(userId: string): Promise<ChatSession> {
        const { data, error } = await supabase
            .from('chat_sessions')
            .insert({ user_id: userId })
            .select()
            .single();

        if (error) throw error;
        return {
            id: data.id,
            userId: data.user_id,
            userBookId: data.user_book_id,
            expiresAt: data.expires_at ? new Date(data.expires_at) : null,
            createdAt: new Date(data.created_at)
        };
    },

    async updateSession(sessionId: string, updates: { expiresAt?: Date | null }) {
        const dbUpdates: any = {};
        if (updates.expiresAt !== undefined) dbUpdates.expires_at = updates.expiresAt;

        const { error } = await supabase
            .from('chat_sessions')
            .update(dbUpdates)
            .eq('id', sessionId);

        if (error) throw error;
    },

    async getSessionByBookId(bookId: string): Promise<ChatSession | null> {
        const { data, error } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('user_book_id', bookId)
            .single();

        if (error) return null;
        return {
            id: data.id,
            userId: data.user_id,
            userBookId: data.user_book_id,
            expiresAt: data.expires_at ? new Date(data.expires_at) : null,
            createdAt: new Date(data.created_at)
        };
    },

    async linkSessionToBook(sessionId: string, userBookId: string) {
        const { error } = await supabase
            .from('chat_sessions')
            .update({
                user_book_id: userBookId,
                expires_at: null // Make permanent
            })
            .eq('id', sessionId);

        if (error) throw error;
    },

    // --- Messages ---
    async saveMessage(sessionId: string, message: Message) {
        const { error } = await supabase
            .from('messages')
            .insert({
                session_id: sessionId,
                role: message.role,
                content: message.content,
                created_at: message.timestamp.toISOString()
            });

        if (error) throw error;
    },

    async getMessages(sessionId: string): Promise<Message[]> {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data.map(msg => ({
            id: msg.id,
            sessionId: msg.session_id,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.created_at)
        }));
    },

    // --- Community ---
    async getCommunityPosts(): Promise<CommunityPost[]> {
        const { data, error } = await supabase
            .from('user_books')
            .select(`
        id,
        review,
        rating,
        created_at,
        user:profiles(id, nickname, avatar_url),
        book:books(title, author, cover_url),
        likes:post_likes(count)
      `)
            .eq('is_shared', true)
            .order('created_at', { ascending: false });

        if (error) return [];

        return data.map((item: any) => ({
            id: item.id,
            user: {
                id: item.user.id,
                nickname: item.user.nickname,
                email: '',
                avatarUrl: item.user.avatar_url
            },
            book: {
                id: item.id, // user_book id
                bookId: item.book.id,
                title: item.book.title,
                author: item.book.author,
                coverUrl: item.book.cover_url
            } as Book,
            likes: item.likes?.[0]?.count || 0,
            isLiked: false,
            createdAt: new Date(item.created_at)
        }));
    },

    // Helper
    mapUserBook(data: any): Book {
        return {
            id: data.id,
            bookId: data.book.id,
            isbn: data.book.isbn,
            title: data.book.title,
            author: data.book.author,
            publisher: data.book.publisher,
            coverUrl: data.book.cover_url,
            description: data.book.description,
            status: data.status,
            startDate: new Date(data.start_date),
            completedDate: data.completed_date ? new Date(data.completed_date) : undefined,
            rating: data.rating,
            review: data.review,
            report: data.report_content ? JSON.parse(data.report_content) : undefined,
            isShared: data.is_shared
        };
    }
};
