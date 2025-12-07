import React from 'react';
import { Book } from '../types';
import { CheckCircleIcon } from './Icon';

interface BookRecommendationProps {
    book: Book;
    onSelect: (book: Book) => void;
}

const BookRecommendation: React.FC<BookRecommendationProps> = ({ book, onSelect }) => {
    return (
        <div className="flex flex-col sm:flex-row bg-white rounded-2xl p-4 shadow-sm border border-sage-100 gap-4 max-w-lg transition-all hover:shadow-md">
            {/* Book Cover */}
            <div
                className="w-24 h-36 sm:w-28 sm:h-40 rounded-lg shadow-md flex-shrink-0 relative overflow-hidden group"
                style={{ backgroundColor: book.coverColor }}
            >
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20" />
                <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                />
                {!book.coverUrl && (
                    <div className="p-2 text-center mt-4">
                        <span className="text-white/90 font-serif font-bold text-xs leading-tight block break-words">
                            {book.title}
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-col justify-between flex-1 py-1">
                <div>
                    <h4 className="font-serif font-bold text-lg text-sage-900 mb-1">{book.title}</h4>
                    <p className="text-sm text-sage-600 mb-3">{book.author}</p>
                    <p className="text-xs text-sage-500 leading-relaxed line-clamp-3 mb-4">
                        이 책은 당신의 현재 고민에 깊은 울림을 줄 수 있습니다. 주인공의 여정을 통해 새로운 시각을 발견해보세요.
                    </p>
                </div>

                <button
                    onClick={() => onSelect(book)}
                    className="w-full py-2.5 bg-sage-700 hover:bg-sage-800 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                    <CheckCircleIcon className="w-4 h-4" />
                    이 책 읽기
                </button>
            </div>
        </div>
    );
};

export default BookRecommendation;
