import { supabase } from '../supabaseClient';
import { Book, Message, UserProfile, CommunityPost, ChatSession } from '../types';

export const dbService = {
    // --- Profiles ---
    async getUserProfile(userId: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single(); // Changed from maybeSingle()

        if (error) {
            console.error('Error fetching profile:', error);
            // If fetching failed, try creating one? No, existing logic handles it elsewhere
            return null;
        }
        return data;
    },

    async updateUserProfile(userId: string, updates: { nickname?: string; location?: string; age_group?: string; avatar_url?: string; favorite_books?: Book[] }) {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
        return data;
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
    book: books(*)
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
        book: books(*)
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

    async deleteUserProfile(userId: string) {
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (error) throw error;
    },

    // --- Chat Sessions ---
    async getBookChatHistory(userBookId: string): Promise<Message[]> {
        // 1. Get all sessions for this book
        const { data: sessions, error: sessionError } = await supabase
            .from('chat_sessions')
            .select('id')
            .eq('user_book_id', userBookId);

        if (sessionError) throw sessionError;
        if (!sessions || sessions.length === 0) return [];

        const sessionIds = sessions.map(s => s.id);

        // 2. Get all messages for these sessions
        const { data: messages, error: msgError } = await supabase
            .from('messages')
            .select('*')
            .in('session_id', sessionIds)
            .order('created_at', { ascending: true });

        if (msgError) throw msgError;

        return messages.map(this.mapMessage);
    },

    async createSession(userId: string, userBookId?: string): Promise<ChatSession> {
        const payload: any = { user_id: userId };
        if (userBookId) {
            payload.user_book_id = userBookId;
            payload.expires_at = null; // Book sessions are permanent
        }

        const { data, error } = await supabase
            .from('chat_sessions')
            .insert(payload)
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

    async deleteSession(sessionId: string) {
        const { error } = await supabase
            .from('chat_sessions')
            .delete()
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

    async getUserSessions(userId: string): Promise<(ChatSession & { bookTitle?: string })[]> {
        const { data, error } = await supabase
            .from('chat_sessions')
            .select(`
            *,
            user_book: user_books(
                book: books(title)
            )
                `)
            .eq('user_id', userId)
            .is('expires_at', null)
            .order('created_at', { ascending: false });

        if (error) return [];

        return data.map((item: any) => ({
            id: item.id,
            userId: item.user_id,
            userBookId: item.user_book_id,
            expiresAt: item.expires_at ? new Date(item.expires_at) : null,
            createdAt: new Date(item.created_at),
            bookTitle: item.user_book?.book?.title
        }));
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
    async getCommunityPosts(currentUserId?: string): Promise<CommunityPost[]> {
        // 1. Get Posts
        const { data, error } = await supabase
            .from('user_books')
            .select(`
id,
    review,
    rating,
    created_at,
    user: profiles(id, nickname, avatar_url),
        book: books(title, author, cover_url),
            likes: post_likes(count)
                `)
            .eq('is_shared', true)
            .order('created_at', { ascending: false });

        if (error) return [];

        // 2. Get My Likes (if logged in)
        let myLikedIds = new Set<string>();
        if (currentUserId) {
            const { data: myLikes } = await supabase
                .from('post_likes')
                .select('user_book_id')
                .eq('user_id', currentUserId);

            if (myLikes) {
                myLikes.forEach(l => myLikedIds.add(l.user_book_id));
            }
        }

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
            isLiked: myLikedIds.has(item.id),
            createdAt: new Date(item.created_at)
        }));
    },

    async toggleLike(userBookId: string, currentUserId: string): Promise<boolean> {
        // Check if already liked
        const { data } = await supabase
            .from('post_likes')
            .select('user_book_id')
            .eq('user_book_id', userBookId)
            .eq('user_id', currentUserId)
            .maybeSingle();

        if (data) {
            // Un-like
            await supabase
                .from('post_likes')
                .delete()
                .eq('user_book_id', userBookId)
                .eq('user_id', currentUserId);
            return false;
        } else {
            // Like
            await supabase
                .from('post_likes')
                .insert({
                    user_book_id: userBookId,
                    user_id: currentUserId
                });
            return true;
        }
    },

    async getReadingActivity(userId: string): Promise<Record<string, number>> {
        const { data, error } = await supabase
            .from('messages')
            .select(`
created_at,
    sessions!inner(
        user_id
    )
        `)
            .eq('sessions.user_id', userId);

        if (error) {
            console.error('Error fetching activity:', error);
            return {};
        }

        const activity: Record<string, number> = {};

        data.forEach((item: any) => {
            const date = new Date(item.created_at).toISOString().split('T')[0];
            activity[date] = (activity[date] || 0) + 1;
        });

        return activity;
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
    },

    mapMessage(msg: any): Message {
        return {
            id: msg.id,
            sessionId: msg.session_id,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.created_at)
        };
    }
};
