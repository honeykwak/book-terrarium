import React from 'react';
import {
  MenuIcon, ChevronDownIcon, LeafIcon, LibraryIcon,
  PlusIcon, SparklesIcon, CheckCircleIcon, XIcon, UserIcon, LogOutIcon, SpinnerIcon,
  HeartIcon, ShareIcon, LockIcon, EditIcon, HistoryIcon, BrainIcon, TargetIcon, TrendingUpIcon, TrashIcon, RefreshIcon
} from '../components/Icon';
import { Message, Role, Book } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import BookRecommendation from './BookRecommendation';

interface Props {
  message: Message;
  onBookSelect?: (book: Book) => void;
  onRegenerate?: () => void;
  onEdit?: () => void;
  onStop?: () => void;
}

const MessageBubble: React.FC<Props> = ({ message, onBookSelect, onRegenerate, onEdit, onStop }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 group`}>
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[70%]`}>
        {/* Bubble */}
        <div
          className={`
            rounded-2xl px-5 py-3.5 relative
            transition-all duration-300 shadow-sm
            ${isUser
              ? 'bg-sage-300/30 text-sage-900 rounded-tr-sm'
              : 'bg-white border border-sage-100 text-sage-800 rounded-tl-sm font-serif text-lg tracking-wide'
            }
          `}
        >
          {/* Avatar/Identifier for Model (Inside bubble or just hidden since we have sidebar?) 
              Keeping it inside for clear speaker identification in text blocks if needed, 
              but "Sowon" text is minimal. 
          */}
          {!isUser && (
            <div className="flex items-center gap-2 mb-2 text-sage-600 text-xs font-serif font-bold tracking-wider">
              <span>소원</span>
            </div>
          )}
          {/* Action Buttons (Hover) */}
          <div className="absolute top-2 -right-8 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
            {!isUser && onRegenerate && !message.isStreaming && (
              <button onClick={onRegenerate} className="p-1 text-sage-400 hover:text-sage-600" title="다시 생성">
                <RefreshIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* User Message Actions (Left Side) */}
          <div className="absolute top-2 -left-8 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
            {isUser && onEdit && (
              <button onClick={onEdit} className="p-1 text-sage-400 hover:text-sage-600" title="수정">
                <EditIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          <MarkdownRenderer content={message.content} />

          {/* Book Recommendations */}
          {message.recommendedBooks && message.recommendedBooks.length > 0 && (
            <div className="mt-4 space-y-3">
              {message.recommendedBooks.map((book) => (
                <BookRecommendation
                  key={book.id}
                  book={book}
                  onSelect={(b) => onBookSelect && onBookSelect(b)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Timestamp - Outside the bubble */}
        <div className={`
          text-[10px] mt-1.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity
          ${isUser ? 'text-right text-sage-400' : 'text-left text-sage-400'}
        `}>
          {message.isStreaming ? '작성 중...' : new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit' }).format(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
