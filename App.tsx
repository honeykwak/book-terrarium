import React, { useState, useRef, useEffect } from 'react';
import { Message, Role, ModelType, Book, CommunityPost, ChatSession, ReportAnalytics } from './types';
import { checkAvailableModels, resetChat, sendMessageStream, generateReport } from './services/geminiService';
import { searchBooks } from './services/googleBooksService';
import { dbService } from './services/dbService';
import { supabase } from './supabaseClient';
import MessageBubble from './components/MessageBubble';
import InputArea from './components/InputArea';
import LoginScreen from './components/LoginScreen';
import Onboarding from './components/Onboarding';
import MyPageModal from './components/MyPageModal'; // Import MyPageModal
import LandingPage from './components/LandingPage'; // Import LandingPage
import MarkdownRenderer from './components/MarkdownRenderer';
import { EmotionLineGraph, FocusDonutChart, KeywordBarChart } from './components/ReportComponents';
import {
  MenuIcon, ChevronDownIcon, LeafIcon, LibraryIcon,
  PlusIcon, SparklesIcon, CheckCircleIcon, XIcon, UserIcon, LogOutIcon, SpinnerIcon,
  HeartIcon, ShareIcon, LockIcon, EditIcon, HistoryIcon, BrainIcon, TargetIcon, TrendingUpIcon, TrashIcon
} from './components/Icon';
import { INITIAL_SUGGESTIONS, COVER_COLORS } from './constants';

type AppState = 'LOGIN' | 'ONBOARDING' | 'MAIN';
type LibraryTab = 'REPORT' | 'REFLECTION' | 'COMMUNITY' | 'CHAT';

// --- MOCK DATA ---

// ... (MOCK_COMMUNITY_POSTS removed in view)

const MOCK_COMPLETED_BOOKS: Book[] = [
  {
    id: 'b1',
    title: '데미안',
    author: '헤르만 헤세',
    coverColor: '#4A5A4A',
    startDate: new Date(Date.now() - 86400000 * 5),
    completedDate: new Date(Date.now() - 86400000 * 2),
    rating: 5,
    review: '내면의 목소리를 찾는 여정이 인상 깊었습니다.',
    isShared: true,
    report: {
      summary: '내면의 목소리를 찾아가는 깊은 여정이었습니다.',
      emotionAnalysis: { primary: '성찰', intensity: 8, keywords: ['자아', '성장'] },
      readingHabits: { sessionCount: 5, avgDurationMinutes: 45 },
      growthAreas: ['내면 탐구'],
      actionItems: ['매일 10분 명상하기', '감정 일기 쓰기', '혼자만의 산책 즐기기'],
      emotionTrajectory: [{ progress: 0, score: 5 }, { progress: 50, score: 3 }, { progress: 100, score: 8 }],
      focusAreas: [{ label: '자아', percentage: 40, color: '#4A5A4A' }, { label: '성장', percentage: 30, color: '#8FA88F' }, { label: '고독', percentage: 30, color: '#5C7C8A' }]
    }
  },
  {
    id: 'b2',
    title: '어린왕자',
    author: '앙투안 드 생텍쥐페리',
    coverColor: '#5C7C8A',
    startDate: new Date(Date.now() - 86400000 * 10),
    completedDate: new Date(Date.now() - 86400000 * 8),
    rating: 4,
    review: '어른이 되어 다시 읽으니 새로운 느낌이네요.',
    isShared: false,
    report: {
      summary: '순수한 동심을 다시 만나는 따뜻한 시간이었습니다.',
      emotionAnalysis: { primary: '순수', intensity: 9, keywords: ['동심', '관계'] },
      readingHabits: { sessionCount: 3, avgDurationMinutes: 30 },
      growthAreas: ['관계의 의미'],
      actionItems: ['소중한 사람에게 안부 묻기', '밤하늘 별 보기', '반려 식물 돌보기'],
      emotionTrajectory: [{ progress: 0, score: 7 }, { progress: 50, score: 9 }, { progress: 100, score: 8 }],
      focusAreas: [{ label: '순수', percentage: 50, color: '#FCD34D' }, { label: '관계', percentage: 30, color: '#F87171' }, { label: '이별', percentage: 20, color: '#9CA3AF' }]
    }
  }
];

const MOCK_CURRENT_BOOK: Book = {
  id: 'book-3',
  title: '월든',
  author: '헨리 데이비드 소로',
  coverColor: '#8FA88F',
  startDate: new Date()
};

// --- ISOLATED COMPONENTS ---

// MyPageModal definition removed (now imported)

const FinishConfirmModal: React.FC<{
  onConfirm: () => void;
  onClose: () => void;
}> = ({ onConfirm, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sage-900/40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-fade-in-up text-center">
      <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4 text-sage-600">
        <CheckCircleIcon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-serif font-bold text-sage-900 mb-2">정말 완독하셨나요?</h3>
      <p className="text-sm text-sage-600 mb-6 leading-relaxed">
        완독을 확정하면 리포트가 생성되고,<br />
        현재의 대화 세션은 종료되어 서재에 저장됩니다.
      </p>
      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 py-3 bg-sage-50 text-sage-600 hover:bg-sage-100 rounded-xl font-medium transition-colors"
        >
          조금 더 읽을래요
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-3 bg-sage-700 text-white hover:bg-sage-800 rounded-xl font-medium transition-colors"
        >
          네, 다 읽었어요
        </button>
      </div>
    </div>
  </div>
);

const DeleteConfirmModal: React.FC<{
  onConfirm: () => void;
  onClose: () => void;
}> = ({ onConfirm, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sage-900/40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-fade-in-up text-center">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
        <TrashIcon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-serif font-bold text-sage-900 mb-2">대화 기록 삭제</h3>
      <p className="text-sm text-sage-600 mb-6 leading-relaxed">
        삭제된 대화는 복구할 수 없습니다.<br />
        정말 삭제하시겠습니까?
      </p>
      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 py-3 bg-sage-50 text-sage-600 hover:bg-sage-100 rounded-xl font-medium transition-colors"
        >
          취소
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-3 bg-red-500 text-white hover:bg-red-600 rounded-xl font-medium transition-colors"
        >
          삭제하기
        </button>
      </div>
    </div>
  </div>
);

const LibraryModal: React.FC<{
  onClose: () => void;
  completedBooks: Book[];
  viewingBook: Book | null;
  setViewingBook: (book: Book | null) => void;
  libraryTab: LibraryTab;
  setLibraryTab: (tab: LibraryTab) => void;
  userName: string;
  communityPosts: CommunityPost[];
  handleUpdateReview: (bookId: string, text: string) => void;
  handleToggleShare: (bookId: string) => void;
  handleLikePost: (postId: string) => void;
}> = ({
  onClose, completedBooks, viewingBook, setViewingBook,
  libraryTab, setLibraryTab, userName, communityPosts,
  handleUpdateReview, handleToggleShare, handleLikePost
}) => {
    return (
      <div className="fixed inset-0 z-50 flex justify-end">
        <div
          className="absolute inset-0 bg-sage-900/20 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative w-full max-w-lg bg-white h-full shadow-2xl overflow-hidden animate-slide-in-right flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-sage-100 bg-white z-10">
            {viewingBook ? (
              <button
                onClick={() => setViewingBook(null)}
                className="flex items-center gap-2 text-sage-600 hover:text-sage-900"
              >
                <ChevronDownIcon className="w-5 h-5 rotate-90" />
                <span className="font-bold">목록으로</span>
              </button>
            ) : (
              <h2 className="text-2xl font-serif font-bold text-sage-900 flex items-center gap-2">
                <LibraryIcon className="w-6 h-6" />
                나의 서재
              </h2>
            )}
            <button onClick={onClose} className="p-2 hover:bg-sage-100 rounded-full">
              <XIcon className="w-6 h-6 text-sage-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-sage-50/50 p-6 custom-scrollbar">
            {viewingBook ? (
              // --- Book Detail View ---
              <div className="space-y-6 animate-fade-in pb-10">
                {/* Book Info Header */}
                <div className="flex gap-4">
                  <div
                    className="w-24 h-36 rounded-md shadow-md flex-shrink-0"
                    style={{ backgroundColor: viewingBook.coverColor }}
                  />
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-sage-900">{viewingBook.title}</h3>
                    <p className="text-sage-600 mb-2">{viewingBook.author}</p>
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-sage-100 text-sage-600 rounded-md text-xs">
                      <CheckCircleIcon className="w-3 h-3" />
                      {viewingBook.completedDate?.toLocaleDateString()} 완독
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-sage-200 overflow-x-auto">
                  {[
                    { id: 'REPORT', label: '리포트' },
                    { id: 'CHAT', label: '대화 기록' },
                    { id: 'REFLECTION', label: '나의 감상' },
                    { id: 'COMMUNITY', label: '공감하기' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setLibraryTab(tab.id as LibraryTab)}
                      className={`flex-1 pb-3 text-sm font-bold transition-colors whitespace-nowrap px-2 ${libraryTab === tab.id ? 'text-sage-700 border-b-2 border-sage-700' : 'text-sage-400 hover:text-sage-600'}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="min-h-[300px]">
                  {libraryTab === 'REPORT' && (
                    <div className="space-y-4 animate-fade-in">
                      {/* 1. Intro Summary */}
                      {viewingBook.report?.summary && (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-sage-100">
                          <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-12 h-12 bg-sage-100 rounded-full flex items-center justify-center mb-2 text-sage-600">
                              <LeafIcon className="w-6 h-6" />
                            </div>
                            <h4 className="text-lg font-serif font-bold text-sage-900">{userName}님의 성장 리포트</h4>
                          </div>
                          <div className="bg-red-50/50 p-4 rounded-xl flex items-start gap-3">
                            <span className="text-xl">📊</span>
                            <p className="text-sm text-sage-700 leading-relaxed font-medium">
                              {viewingBook.report.summary}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* 2. Emotion Graph */}
                      {viewingBook.report?.emotionTrajectory && viewingBook.report.emotionTrajectory.length > 1 && (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-sage-100">
                          <h5 className="font-bold text-sage-900 mb-4 flex items-center gap-2">
                            <HeartIcon className="w-5 h-5 text-red-400" filled />
                            나의 감정 변화 추이
                          </h5>
                          <EmotionLineGraph data={viewingBook.report.emotionTrajectory} />
                        </div>
                      )}

                      {/* 3. Focus Areas */}
                      {viewingBook.report?.focusAreas && viewingBook.report.focusAreas.length > 0 && (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-sage-100">
                          <h5 className="font-bold text-sage-900 mb-4 flex items-center gap-2">
                            <TargetIcon className="w-5 h-5 text-blue-400" />
                            통찰 분포도
                          </h5>
                          <FocusDonutChart data={viewingBook.report.focusAreas} />
                        </div>
                      )}

                      {/* 4. Action Items (AI) */}
                      {viewingBook.report?.actionItems && viewingBook.report.actionItems.length > 0 && (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-sage-100 mb-4 animate-fade-in">
                          <h5 className="font-bold text-sage-900 mb-4 flex items-center gap-2">
                            <TrendingUpIcon className="w-5 h-5 text-green-500" />
                            실생활 적용 계획
                          </h5>
                          <div className="space-y-3">
                            {viewingBook.report.actionItems.map((item, i) => (
                              <div key={i} className="flex gap-3 items-start p-3 bg-sage-50 rounded-xl">
                                <div className="w-5 h-5 bg-sage-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold text-sage-600">
                                  {i + 1}
                                </div>
                                <p className="text-sm text-sage-800">{item}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 5. Summary & Growth (Legacy + New) */}
                      {viewingBook.report && (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-sage-100 animate-fade-in delay-100">
                          {viewingBook.report.summary && (
                            <div className="mb-6 p-4 bg-sage-50 rounded-xl text-center italic text-sage-600">
                              "{viewingBook.report.summary}"
                            </div>
                          )}

                          <h5 className="font-bold text-sage-900 mb-4">🌱 성장 포인트</h5>
                          <div className="flex flex-wrap gap-2 mb-6">
                            {viewingBook.report.growthAreas?.map((area, idx) => (
                              <span key={idx} className="px-3 py-1.5 bg-sage-100 text-sage-700 text-xs rounded-full font-medium">
                                {area}
                              </span>
                            ))}
                            {viewingBook.report.emotionAnalysis?.keywords?.map((kw, idx) => (
                              <span key={`kw-${idx}`} className="px-3 py-1.5 bg-purple-50 text-purple-700 text-xs rounded-full font-medium"> # {kw} </span>
                            ))}
                          </div>

                          {viewingBook.report.readingHabits && (
                            <div className="pt-4 border-t border-sage-50 grid grid-cols-2 gap-4">
                              <div className="text-center">
                                <div className="text-xs text-sage-400 mb-1">총 대화 세션</div>
                                <div className="text-lg font-bold text-sage-800">{viewingBook.report.readingHabits.sessionCount}회</div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs text-sage-400 mb-1">평균 대화 시간</div>
                                <div className="text-lg font-bold text-sage-800">{viewingBook.report.readingHabits.avgDurationMinutes}분</div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {libraryTab === 'CHAT' && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-sage-100 h-[500px] overflow-y-auto custom-scrollbar animate-fade-in">
                      {viewingBook.chatHistory && viewingBook.chatHistory.length > 0 ? (
                        viewingBook.chatHistory.map(msg => (
                          <div key={msg.id} className={`mb-4 ${msg.role === Role.USER ? 'text-right' : 'text-left'} `}>
                            <div className={`inline-block p-3 rounded-lg text-sm max-w-[85%] ${msg.role === Role.USER
                              ? 'bg-sage-100 text-sage-800'
                              : 'bg-white border border-sage-100 text-sage-700'
                              } `}>
                              <MarkdownRenderer content={msg.content} />
                            </div>
                            <div className="text-[10px] text-sage-300 mt-1">
                              {new Date(msg.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-sage-400 py-10 flex flex-col items-center">
                          <HistoryIcon className="w-8 h-8 mb-2 opacity-50" />
                          <p>저장된 대화 내용이 없습니다.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {libraryTab === 'REFLECTION' && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-sage-100 space-y-4 animate-fade-in">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-sage-900 flex items-center gap-2">
                          <EditIcon className="w-4 h-4" />
                          나의 기록
                        </h4>
                        <button
                          onClick={() => handleToggleShare(viewingBook.id)}
                          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all ${viewingBook.isShared
                            ? 'bg-sage-600 text-white'
                            : 'bg-sage-100 text-sage-500'
                            } `}
                        >
                          <ShareIcon className="w-3 h-3" />
                          {viewingBook.isShared ? '공유 중' : '나만 보기'}
                        </button>
                      </div>
                      <textarea
                        className="w-full h-40 p-4 bg-sage-50 border border-sage-200 rounded-xl resize-none focus:ring-2 focus:ring-sage-400 outline-none text-sage-800 text-sm leading-relaxed"
                        placeholder="이 책을 읽으며 느낀 점을 기록해보세요. 내용을 공유하면 다른 사람들의 감상도 볼 수 있습니다."
                        value={viewingBook.review || ''}
                        onChange={(e) => handleUpdateReview(viewingBook.id, e.target.value)}
                      />
                      <p className="text-[10px] text-sage-400">
                        * 작성하신 내용은 개인 보관함에 저장됩니다. 공유하기를 켜면 다른 사용자들과 감상을 나눌 수 있습니다.
                      </p>
                    </div>
                  )}

                  {libraryTab === 'COMMUNITY' && (
                    <div className="space-y-4 animate-fade-in">
                      {!viewingBook.isShared ? (
                        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-sage-100 text-center px-6">
                          <div className="w-12 h-12 bg-sage-100 rounded-full flex items-center justify-center mb-4 text-sage-500">
                            <LockIcon className="w-6 h-6" />
                          </div>
                          <h4 className="font-bold text-sage-800 mb-2">공감 커뮤니티 잠금</h4>
                          <p className="text-sm text-sage-500 mb-6">
                            나의 감상을 공유하면 다른 사람들의 이야기를 볼 수 있어요.<br />
                            서로의 마음에 공감해보세요.
                          </p>
                          <button
                            onClick={() => {
                              setLibraryTab('REFLECTION');
                            }}
                            className="px-6 py-2 bg-sage-700 text-white rounded-full text-sm font-bold hover:bg-sage-800"
                          >
                            감상 쓰러 가기
                          </button>
                        </div>
                      ) : (
                        <>
                          {communityPosts.filter(p => p.book.title === viewingBook.title || true).map(post => ( // Using 'true' for demo if titles don't match mock
                            <div key={post.id} className="bg-white rounded-xl p-5 shadow-sm border border-sage-100">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-sage-200 flex items-center justify-center text-xs text-sage-700 font-bold">
                                    {post.user.nickname[0]}
                                  </div>
                                  <div>
                                    <span className="text-sm font-bold text-sage-900 block">{post.user.nickname}</span>
                                    <span className="text-[10px] text-sage-400">2일 전</span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-sm text-sage-700 leading-relaxed mb-4">
                                {post.content}
                              </p>
                              <div className="flex items-center gap-4 border-t border-sage-50 pt-3">
                                <button
                                  onClick={() => handleLikePost(post.id)}
                                  className={`flex items-center gap-1 text-xs font-bold transition-colors ${post.isLiked ? 'text-red-400' : 'text-sage-400 hover:text-sage-600'} `}
                                >
                                  <HeartIcon className="w-4 h-4" filled={post.isLiked} />
                                  {post.likes}
                                </button>
                              </div>
                            </div>
                          ))}
                          <p className="text-center text-xs text-sage-400 py-4">더 많은 이야기가 기다리고 있어요.</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // --- Bookshelf View ---
              <>
                {completedBooks.length === 0 ? (
                  <div className="text-center py-20 text-sage-400">
                    <div className="text-4xl mb-4 opacity-50 font-serif">Empty</div>
                    <p>아직 완독한 책이 없습니다.<br />소원과 함께 첫 번째 책을 읽어보세요.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 animate-fade-in">
                    {completedBooks.map((book) => (
                      <button
                        key={book.id}
                        onClick={async () => {
                          setViewingBook(book);
                          setLibraryTab('REPORT');
                          try {
                            const history = await dbService.getBookChatHistory(book.id);
                            setViewingBook(prev => prev && prev.id === book.id ? { ...prev, chatHistory: history } : prev);
                          } catch (e) {
                            console.error("Failed to fetch book history:", e);
                          }
                        }}
                        className="group relative flex flex-col items-center text-left"
                      >
                        <div
                          className="w-full aspect-[2/3] rounded-lg shadow-md mb-3 transition-transform group-hover:-translate-y-1 relative overflow-hidden bg-gray-200"
                          style={{ backgroundColor: book.coverUrl ? undefined : book.coverColor }}
                        >
                          {book.coverUrl ? (
                            <img
                              src={book.coverUrl}
                              alt={book.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            // No image fallback (Color only) is handled by parent style
                            null
                          )}

                          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                          {/* Minimal spine effect */}
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-white/20" />
                        </div>
                        <h4 className="font-bold text-sage-900 text-sm w-full truncate text-center px-1">{book.title}</h4>
                        <p className="text-xs text-sage-500 w-full truncate text-center px-1">{book.author}</p>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

const SidebarContent: React.FC<{
  currentBook: Book | null;
  sessions: (ChatSession & { bookTitle?: string })[];
  currentSessionId: string | undefined;
  userName: string;
  handleNewChat: () => void;
  handleSelectSession: (session: ChatSession) => void;
  handleDeleteSession: (sessionId: string) => void; // New Prop
  handleRequestFinish: () => void; // Keeping for context menu or future use
  setShowMyPage: (v: boolean) => void;
  // setCurrentBook no longer needed here as selection handles it
}> = ({ currentBook, sessions, currentSessionId, userName, handleNewChat, handleSelectSession, handleDeleteSession, handleRequestFinish, setShowMyPage }) => {

  // Separate Daily Session (Bookless) and Book Sessions
  const dailySession = sessions.find(s => !s.userBookId);
  const bookSessions = sessions.filter(s => s.userBookId);

  const isDailyActive = dailySession && dailySession.id === currentSessionId;

  return (
    <div className="flex flex-col h-full bg-sage-50/50">
      {/* Header & Daily Chat Slot */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <span className="font-serif font-bold text-2xl text-sage-900 tracking-tight">소원</span>
        </div>

        {/* Daily Chat - Dedicated Slot */}
        <div className="relative group">
          <button
            onClick={() => {
              if (dailySession) handleSelectSession(dailySession);
              else handleNewChat();
            }}
            className={`flex items-center justify-between w-full p-4 rounded-xl transition-all shadow-sm relative ${isDailyActive
              ? 'bg-white border-sage-200 shadow-md text-sage-900 ring-1 ring-sage-900/5'
              : 'bg-white border border-sage-100 text-sage-600 hover:border-sage-300 hover:shadow-md'
              }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-start">
                <span className={`text-sm font-bold ${isDailyActive ? 'text-sage-900' : 'text-sage-700'}`}>
                  새로운 책 찾기
                </span>
                <span className="text-[10px] text-sage-400">
                  {dailySession ? '오늘의 이야기를 나눠보세요' : '새로운 대화를 시작해보세요'}
                </span>
              </div>
            </div>

            {/* Active Indicator */}
            {isDailyActive && (
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-sage-800 rounded-r-xl"></div>
            )}
          </button>

          {/* Delete Button for Daily Chat (Only if exists) */}
          {dailySession && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteSession(dailySession.id);
              }}
              className="absolute top-2 right-2 p-1.5 text-sage-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 z-10"
              title="대화 초기화"
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Book Session List */}
      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
        {bookSessions.length > 0 && (
          <div className="ml-2 mb-2 mt-2">
            <span className="text-xs font-bold text-sage-400 uppercase tracking-wider">Book Chats</span>
          </div>
        )}

        <div className="space-y-2">
          {bookSessions.map(session => {
            const isActive = session.id === currentSessionId;
            const displayTitle = session.bookTitle || '이름 없는 책'; // Should ideally always have title

            return (
              <div key={session.id} className="relative group">
                <button
                  onClick={() => handleSelectSession(session)}
                  className={`w-full text-left p-3 rounded-xl transition-all relative pr-10 ${isActive
                    ? 'bg-white shadow-md border border-sage-100'
                    : 'hover:bg-sage-100/50 border border-transparent hover:border-sage-100'
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-0.5 w-full">
                      <span className={`text-sm font-bold truncate ${isActive ? 'text-sage-900' : 'text-sage-700'}`}>
                        {displayTitle}
                      </span>
                      <span className="text-[10px] text-sage-400 font-medium">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {isActive && (
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-sage-800 rounded-r-xl"></div>
                  )}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSession(session.id);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-sage-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 z-10"
                  title="대화 삭제"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {bookSessions.length === 0 && (
          <div className="text-center py-12 text-sage-400 text-xs">
            읽고 있는 책이 없습니다.<br />
            소원에게 책을 추천받아보세요.
          </div>
        )}
      </div>

      {/* Finish Reading Button (Conditional) */}
      {currentBook && (
        <div className="px-6 pb-4">
          <button
            onClick={handleRequestFinish}
            className="w-full py-3 bg-sage-700 text-white rounded-xl shadow-lg shadow-sage-200 hover:bg-sage-800 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <CheckCircleIcon className="w-4 h-4" />
            완독하기
          </button>
        </div>
      )}

      {/* User Profile Footer */}
      <div className="mt-auto p-4 border-t border-sage-200/60 bg-white/50 backdrop-blur-sm">
        <button
          onClick={() => setShowMyPage(true)}
          className="flex items-center gap-3 w-full hover:bg-white p-2 rounded-xl transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sage-200 to-sage-300 flex items-center justify-center text-white font-serif text-lg shadow-inner">
            {userName ? userName.charAt(0).toUpperCase() : 'G'}
          </div>
          <div className="flex flex-col items-start overflow-hidden">
            <span className="text-sm font-bold text-sage-800 truncate w-full text-left group-hover:text-sage-900">{userName || 'Guest User'}</span>
            <span className="text-[10px] text-sage-500 truncate w-full text-left">My Page</span>
          </div>
        </button>
      </div>
    </div>
  );

};

import { Helmet } from 'react-helmet-async';

const App: React.FC = () => {
  // --- Special Route: Landing Page (/info) ---
  if (window.location.pathname === '/info') {
    return (
      <>
        <Helmet>
          <title>소개 | 북 테라리움, 소원</title>
        </Helmet>
        <LandingPage onStart={() => window.location.href = '/'} />
      </>
    );
  }

  // Session State
  const [appState, setAppState] = useState<AppState>('LOGIN');
  const [session, setSession] = useState<any>(null);
  const [userName, setUserName] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessions, setSessions] = useState<(ChatSession & { bookTitle?: string; dateTitle?: string })[]>([]); // New State

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null); // New Toast State

  const [dbError, setDbError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelType>(ModelType.FLASH);

  // Delete Confirmation State (Moved to top)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  // Mobile Sidebar
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Reading Activity
  const [readingActivity, setReadingActivity] = useState<Record<string, number>>({});


  // (Effect moved below)

  // Book Therapy Features
  const [messageCount, setMessageCount] = useState(0);

  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [completedBooks, setCompletedBooks] = useState<Book[]>([]);

  // Library & Community State
  const [showLibrary, setShowLibrary] = useState(false);
  const [viewingBook, setViewingBook] = useState<Book | null>(null);
  const [libraryTab, setLibraryTab] = useState<LibraryTab>('REPORT');
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);

  const [showMyPage, setShowMyPage] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch Reading Activity on MyPage Open
  useEffect(() => {
    if (showMyPage && session?.user) {
      dbService.getReadingActivity(session.user.id)
        .then(setReadingActivity)
        .catch(console.error);
    }
  }, [showMyPage, session]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // --- Auth & Session Management ---
  useEffect(() => {
    // 1. Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 2. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial greeting if current book exists (Test Mode) -> Migrated  // Fetch Community Posts
  useEffect(() => {
    if (libraryTab === 'COMMUNITY') {
      const fetchPosts = async () => {
        if (!session?.user) return;
        const posts = await dbService.getCommunityPosts(session.user.id);
        setCommunityPosts(posts);
      };
      fetchPosts();
    }
  }, [libraryTab, session]);

  // Handle Book Selection
  // We remove the automatic effect to prevent weird loops, logic moved to book selection

  // Initial Data Fetching
  useEffect(() => {
    if (session?.user) {
      loadUserData(session.user.id);
    }
  }, [session]);

  const loadUserData = async (userId: string) => {
    try {
      // 1. Profile
      const profile = await dbService.getUserProfile(userId);
      if (profile) {
        setUserName(profile.nickname);
        setUserProfile(profile);
        setAppState('MAIN');
      } else {
        setAppState('ONBOARDING');
      }

      // 2. Load User Books
      const books = await dbService.getUserBooks(userId);
      setCompletedBooks(books.filter(b => b.status === 'COMPLETED'));

      // 3. Load Chat Sessions (NEW)
      const userSessions = await dbService.getUserSessions(userId);
      setSessions(userSessions);

      // Auto-select most recent session
      if (userSessions.length > 0) {
        const recent = userSessions[0];
        setCurrentSession(recent);
        const msgs = await dbService.getMessages(recent.id);
        setMessages(msgs);

        if (recent.userBookId) {
          // Find book details if linked
          const relevantBook = books.find(b => b.id === recent.userBookId); // Note: userBookId in session refers to user_books.id
          if (relevantBook) setCurrentBook(relevantBook);
        } else {
          setCurrentBook(null);
        }
      } else {
        // No sessions, ready for new chat
      }

      // 4. Community Posts
      const posts = await dbService.getCommunityPosts();
      setCommunityPosts(posts);

    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleLogin = (newSession: any) => {
    setSession(newSession);
    // State transition handled in useEffect
  };

  const handleOnboardingComplete = async (data: any) => {
    if (!session?.user) return;

    try {
      await dbService.updateUserProfile(session.user.id, {
        nickname: data.name,
        // age_group: data.ageGroup, // Removed as per new schema
        // interests: data.interests // Removed as per new schema
      });
      setUserProfile({
        ...data,
        id: session.user.id,
        email: session.user.email,
        nickname: data.name
      });
      setUserName(data.name);
      setAppState('MAIN');
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setAppState('LOGIN');
    setMessages([]);
    setMessageCount(0);
    setCurrentBook(null);
    setCurrentSession(null); // Clear current session on logout
    setUserName('');
    setUserProfile(null);
    setShowMyPage(false);
    resetChat();
  };

  const handleNewChat = () => {
    // Check if there is already a session with no book assigned
    const existingBooklessSession = sessions.find(s => !s.userBookId);

    if (existingBooklessSession) {
      handleSelectSession(existingBooklessSession);
      setIsMobileMenuOpen(false);
      return;
    }

    setMessages([]);
    setMessageCount(0);
    setCurrentBook(null);
    setCurrentSession(null); // Clear current session for new chat
    resetChat();
    setIsMobileMenuOpen(false);
  };

  const handleRequestFinish = () => {
    setShowFinishConfirm(true);
  };

  const handleConfirmFinish = async () => {
    if (!currentBook || !currentSession) return; // Ensure session exists

    setShowFinishConfirm(false);
    // REMOVED blocking loading state
    // setIsLoading(true);
    // setLoadingText('AI가 독서 여정을 분석 중입니다...\n잠시만 기다려주세요.');

    setToastMessage('AI가 독서 여정을 분석 중입니다...'); // Show Toast

    // Mock API call simulation
    await new Promise(resolve => setTimeout(resolve, 2000));


    try {
      // AI Report Generation
      let report: ReportAnalytics | undefined;
      try {
        report = await generateReport(messages);
      } catch (e) {
        console.error("AI Report Generation Failed, using fallback", e);
        report = {
          summary: '분석을 완료하지 못했습니다.',
          emotionAnalysis: { primary: '알 수 없음', intensity: 0, keywords: [] },
          readingHabits: { sessionCount: messages.filter(m => m.sessionId).length || 1, avgDurationMinutes: 0 },
          growthAreas: ['분석 정보가 부족합니다.'],
          actionItems: [],
          emotionTrajectory: [],
          focusAreas: []
        };
      }


      await dbService.updateUserBook(currentBook.id, {
        completedDate: new Date(),
        status: 'COMPLETED',
        report: report
      });

      // Mark the session as completed
      await dbService.updateSession(currentSession.id, { expiresAt: new Date() });


      const completed: Book = {
        ...currentBook,
        completedDate: new Date(),
        report: report,
        review: '',
        isShared: false,
        chatHistory: [...messages]
      };

      setCompletedBooks(prev => [completed, ...prev]);

      // Remove the completed session from the sidebar list
      setSessions(prev => prev.filter(s => s.id !== currentSession.id));

      setMessages([]);
      setCurrentBook(null);
      setCurrentSession(null);
      setMessageCount(0);
      resetChat();
      resetChat();
      setIsLoading(false); // Ensure loading is off if it was on for other reasons
      setLoadingText('');
      setToastMessage(null); // Clear toast
      setShowLibrary(true);
    } catch (error) {
      console.error('Error finishing book:', error);
      setIsLoading(false);
      setLoadingText('');
      setToastMessage(null); // Clear toast
      alert('분석 중 오류가 발생했습니다.'); // Fallback alert
    }
  };




  const handleBookSelect = async (book: Book) => {
    if (!session?.user) return;

    resetChat(); // Clear previous AI session memory to ensure new context for this book
    setIsLoading(true);

    try {
      // 1. Save to DB
      const userBook = await dbService.createUserBook(session.user.id, book);
      setCurrentBook(userBook);
      setCompletedBooks(prev => [...prev.filter(b => b.id !== userBook.id)]);

      // 2. Link or Create Session
      let activeSessionId = currentSession?.id;

      if (currentSession) {
        // Link existing session
        await dbService.linkSessionToBook(currentSession.id, userBook.id);

        // Update local object immediately to reflect change
        setCurrentSession({ ...currentSession, userBookId: userBook.id });
      } else {
        // Create NEW session for this book
        const newSession = await dbService.createSession(session.user.id, userBook.id);
        setCurrentSession(newSession);
        activeSessionId = newSession.id;
      }

      // REFRESH SESSIONS to show the new badge/item in sidebar
      const updatedSessions = await dbService.getUserSessions(session.user.id);
      setSessions(updatedSessions);

      // 3. System Message
      const systemMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        content: `** [${book.title}] ** 독서 모드를 시작합니다.\n이 책의 첫 문장을 읽고 어떤 느낌이 드셨나요 ? `,
        timestamp: new Date(),
        isSystem: true
      };

      // Save system message
      if (activeSessionId) {
        await dbService.saveMessage(activeSessionId, systemMsg);
      }
      setMessages(prev => [...prev, systemMsg]);

    } catch (error) {
      console.error('Error selecting book:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSession = async (session: ChatSession) => {
    resetChat(); // Clear previous AI session memory
    setCurrentSession(session);
    setIsLoading(true);
    try {
      const msgs = await dbService.getMessages(session.id);
      setMessages(msgs);

      if (session.userBookId) {
        // Find the book logic
        // We need all books to find specifics, doing a fetch or finding in state if we had it.
        // For simplicity, let's just fetch user books again or trust linking.
        // To avoid an extra call, we can rely on cached `completedBooks` + `currentBook` or just fetch again.
        // Fetching again is safer.
        const allBooks = await dbService.getUserBooks(session.userId);
        const book = allBooks.find(b => b.id === session.userBookId);
        setCurrentBook(book || null);
      } else {
        setCurrentBook(null);
      }
      setIsMobileMenuOpen(false);
    } catch (e) {
      console.error("Failed to load session:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
      setLoadingText('');
      // Update UI to show it stopped?
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last && last.isStreaming) {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, isStreaming: false, content: m.content + " (중단됨)" } : m);
        }
        return prev;
      });
    }
  };

  const handleRegenerate = async () => {
    const lastUserMsgIndex = messages.findLastIndex(m => m.role === Role.USER);
    if (lastUserMsgIndex === -1) return;

    const lastUserMsg = messages[lastUserMsgIndex];

    // Truncate to BEFORE the last user message
    const historyBefore = messages.slice(0, lastUserMsgIndex);
    setMessages(historyBefore);
    // Re-send
    handleSend(lastUserMsg.content, true); // true = hiddenPrompt? No, we want to re-send as if user typed it.
    // Actually handleSend adds the user message again. So we just pass text.
  };

  const handleStartEdit = (message: Message) => {
    setInputValue(message.content);
    const msgIndex = messages.findIndex(m => m.id === message.id);
    if (msgIndex !== -1) {
      // Keep messages BEFORE this one
      setMessages(messages.slice(0, msgIndex));
    }
    setTimeout(() => {
      const input = document.querySelector('textarea') as HTMLTextAreaElement;
      input?.focus();
    }, 100);
  };

  const handleSend = async (text: string = inputValue, isHiddenPrompt: boolean = false) => {
    let activeSessionId = currentSession?.id;

    if ((!text.trim() && !isHiddenPrompt) || isLoading) return;

    // Reset AbortController
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const ac = new AbortController();
    abortControllerRef.current = ac;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: Role.USER,
      content: text,
      timestamp: new Date()
    };

    if (!isHiddenPrompt) {
      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
      setMessageCount(prev => prev + 1);
    }

    // Lazy Session Creation: If no session, create one now
    if (!activeSessionId && session?.user && !isHiddenPrompt) {
      try {
        const newSession = await dbService.createSession(session.user.id);
        activeSessionId = newSession.id;
        setCurrentSession(newSession);

        // Refresh sidebar list
        const updatedSessions = await dbService.getUserSessions(session.user.id);
        setSessions(updatedSessions);
      } catch (e) {
        console.error("Failed to create lazy session:", e);
      }
    }

    // Save User Message to DB
    if (activeSessionId && !isHiddenPrompt) {
      await dbService.saveMessage(activeSessionId, userMessage);
    }

    // AI Placeholder
    setIsLoading(true);
    setIsStreaming(true);
    setLoadingText('AI가 답변을 생각하는 중...');

    const aiMsgId = (Date.now() + 1).toString();
    const aiPlaceholder: Message = {
      id: aiMsgId,
      role: Role.MODEL,
      content: '',
      isStreaming: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, aiPlaceholder]);

    try {
      // Context Injection
      const contentToSend = currentBook
        ? `[System Note: User is currently reading '${currentBook.title}'. Ensure all responses are deeply grounded in this book's context unless explicitly asked otherwise.]\n\n${text}`
        : text;

      // Note: geminiService.sendMessageStream(text, history, modelId, callback)
      const finalContent = await sendMessageStream(
        contentToSend,
        messages,
        selectedModel,
        (streamedText) => {
          if (ac.signal.aborted) return;
          setMessages(prev => prev.map(msg =>
            msg.id === aiMsgId
              ? { ...msg, content: streamedText, isStreaming: true }
              : msg
          ));
        },
        userProfile || undefined // Pass userProfile
      );

      // Final check if aborted
      if (ac.signal.aborted) {
        return;
      }

      // --- Optimization: Extract Recommendations from Main Response ---
      // The System Instruction ensures the AI puts ["Title1", "Title2"] at the end if it recommends books.
      // We process this HERE instead of making a second API call, preventing 429 Quota errors.

      let processedContent = finalContent;
      let recommendedBooks: Book[] = [];

      // Regex to find JSON array (loosened to match anywhere, preferring the one with book titles)
      // Matches: ["Title", ...] optionally wrapped in markdown code blocks
      const jsonRegex = /(?:```json\s*)?(\[[\s\S]*?\])(?:\s*```)?/g;

      // We look for the last match to avoid picking up random arrays in the text
      const matches = [...finalContent.matchAll(jsonRegex)];
      const match = matches.length > 0 ? matches[matches.length - 1] : null;

      if (match) {
        try {
          const jsonString = match[1];
          const titles = JSON.parse(jsonString);

          if (Array.isArray(titles) && titles.length > 0) {
            // Remove the JSON string from the display text for a cleaner UI
            processedContent = finalContent.replace(match[0], '').trim();

            // Fetch book metadata in parallel
            for (const title of titles) {
              const results = await searchBooks(title);
              if (results.length > 0) {
                recommendedBooks.push(results[0]);
              }
            }
          }
        } catch (e) {
          console.error("Failed to parse recommendation JSON:", e);
          // If parsing fails, we keep the content as is and don't attach books
        }
      }

      // Save AI message to DB after processing
      if (activeSessionId) {
        const finalAiMsg: Message = {
          id: aiMsgId,
          role: Role.MODEL,
          content: processedContent,
          timestamp: new Date(),
          isStreaming: false,
          recommendedBooks: recommendedBooks.length > 0 ? recommendedBooks : undefined
        };
        await dbService.saveMessage(activeSessionId, finalAiMsg);
      }

      // Update local state one last time to reflect processed content and recommendations
      setMessages(prev => prev.map(msg =>
        msg.id === aiMsgId
          ? {
            ...msg,
            content: processedContent,
            isStreaming: false,
            recommendedBooks: recommendedBooks.length > 0 ? recommendedBooks : undefined
          }
          : msg
      ));

    } catch (error) {
      if (ac.signal.aborted) {
        console.log("Stream aborted.");
        setMessages(prev => prev.map(msg =>
          msg.id === aiMsgId
            ? { ...msg, content: msg.content + " (중단됨)", isStreaming: false }
            : msg
        ));
      } else {
        console.error(error);
        setMessages(prev => prev.map(msg =>
          msg.id === aiMsgId
            ? { ...msg, content: "**오류가 발생했습니다.** 잠시 후 다시 시도해 주세요.", isStreaming: false }
            : msg
        ));
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setLoadingText('');
      abortControllerRef.current = null;
    }
  };





  // --- Library Handlers ---
  const handleUpdateReview = (bookId: string, text: string) => {
    setCompletedBooks(prev => prev.map(b => b.id === bookId ? { ...b, review: text } : b));
    if (viewingBook?.id === bookId) {
      setViewingBook(prev => prev ? { ...prev, review: text } : null);
    }
  };

  const handleToggleShare = (bookId: string) => {
    const targetBook = completedBooks.find(b => b.id === bookId);
    if (!targetBook) return;

    const newStatus = !targetBook.isShared;
    setCompletedBooks(prev => prev.map(b => b.id === bookId ? { ...b, isShared: newStatus } : b));
    if (viewingBook?.id === bookId) {
      setViewingBook(prev => prev ? { ...prev, isShared: newStatus } : null);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!session?.user) return;

    // Optimistic Update
    const targetPost = communityPosts.find(p => p.id === postId);
    if (!targetPost) return;

    const newLikedState = !targetPost.isLiked;
    const newLikesCount = newLikedState ? targetPost.likes + 1 : targetPost.likes - 1;

    setCommunityPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, likes: newLikesCount, isLiked: newLikedState };
      }
      return p;
    }));

    // DB Update
    try {
      await dbService.toggleLike(postId, session.user.id);
    } catch (error) {
      console.error("Failed to toggle like:", error);
      // Revert on error
      setCommunityPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return { ...p, likes: targetPost.likes, isLiked: targetPost.isLiked };
        }
        return p;
      }));
    }
  };

  const handleUpdateProfile = async (updates: { nickname: string }) => {
    if (!session?.user) return;
    try {
      await dbService.updateUserProfile(session.user.id, updates);
      setUserName(updates.nickname); // Update local state
    } catch (error) {
      console.error("Failed to update profile", error);
      throw error; // Re-throw for modal to handle
    }
  };

  const handleDeleteAccount = async () => {
    if (!session?.user) return;
    try {
      await dbService.deleteUserProfile(session.user.id);
      await supabase.auth.signOut();
      setAppState('LOGIN');
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete account", error);
      alert("계정 삭제에 실패했습니다.");
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteSession = async () => {
    if (!sessionToDelete) return;
    try {
      await dbService.deleteSession(sessionToDelete);

      // Update local state
      const updatedSessions = sessions.filter(s => s.id !== sessionToDelete);
      setSessions(updatedSessions);

      // If deleted active session, reset view
      if (currentSession?.id === sessionToDelete) {
        if (updatedSessions.length > 0) {
          handleSelectSession(updatedSessions[0]);
        } else {
          handleNewChat();
        }
      }
      setShowDeleteConfirm(false);
      setSessionToDelete(null);
    } catch (e) {
      console.error("Failed to delete session:", e);
      setDbError("대화 삭제 중 오류가 발생했습니다.");
    }
  };

  // --- Render ---

  if (appState === 'LOGIN') {
    return <LoginScreen onLogin={handleLogin} />;
  }
  if (appState === 'ONBOARDING') {
    return (
      <Onboarding
        initialName={session?.user?.user_metadata?.full_name || ''}
        onComplete={handleOnboardingComplete}
        onLogout={handleLogout}
      />
    );
  }

  // Helper render for MyPageModal
  const renderMyPage = () => (
    <MyPageModal
      userName={userName}
      userProfile={userProfile}
      completedBooksCount={completedBooks.length}
      messageCount={messageCount}
      onLogout={handleLogout}
      onDeleteAccount={handleDeleteAccount}
      onClose={() => setShowMyPage(false)}
      readingActivity={readingActivity}
    />
  );





  // --- Login Screen ---
  if (!session) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-sage-100 font-sans overflow-hidden text-sage-900">
      {/* Modals */}
      {
        showDeleteConfirm && (
          <DeleteConfirmModal
            onConfirm={confirmDeleteSession}
            onClose={() => { setShowDeleteConfirm(false); setSessionToDelete(null); }}
          />
        )
      }
      {
        showFinishConfirm && (
          <FinishConfirmModal
            onConfirm={handleConfirmFinish}
            onClose={() => setShowFinishConfirm(false)}
          />
        )
      }
      {
        showLibrary && (
          <LibraryModal
            onClose={() => { setShowLibrary(false); setViewingBook(null); }}
            completedBooks={completedBooks}
            viewingBook={viewingBook}
            setViewingBook={setViewingBook}
            libraryTab={libraryTab}
            setLibraryTab={setLibraryTab}
            userName={userName}
            communityPosts={communityPosts}
            handleUpdateReview={handleUpdateReview}
            handleToggleShare={handleToggleShare}
            handleLikePost={handleLikePost}
          />
        )
      }
      {
        showMyPage && (
          <MyPageModal
            userName={userName}
            userProfile={userProfile}
            completedBooksCount={completedBooks.length}
            messageCount={messageCount || (messages.length + (sessions.length * 10))}
            onLogout={handleLogout}
            onDeleteAccount={handleDeleteAccount}
            onClose={() => setShowMyPage(false)}
            readingActivity={readingActivity}
            onUpdateProfile={handleUpdateProfile}
          />
        )
      }

      {/* Sidebar (Desktop) */}
      <aside className={`hidden md:flex flex-col w-72 bg-sage-50 border-r border-sage-200 h-full transition-all duration-500`}>
        <SidebarContent
          currentBook={currentBook}
          sessions={sessions}
          currentSessionId={currentSession?.id}
          userName={userName}
          handleNewChat={handleNewChat}
          handleSelectSession={handleSelectSession}
          handleDeleteSession={handleDeleteSession}
          handleRequestFinish={handleRequestFinish}
          setShowMyPage={setShowMyPage}
        />
      </aside>

      {/* Mobile Sidebar */}
      {
        isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div
              className="fixed inset-0 bg-sage-900/20 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <aside className="relative w-72 h-full bg-sage-50 flex flex-col shadow-2xl animate-slide-in-left">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 text-sage-400 hover:text-sage-600 z-50"
              >
                <PlusIcon className="w-6 h-6 rotate-45" />
              </button>
              <SidebarContent
                currentBook={currentBook}
                sessions={sessions}
                currentSessionId={currentSession?.id}
                userName={userName}
                handleNewChat={handleNewChat}
                handleSelectSession={handleSelectSession}
                handleDeleteSession={handleDeleteSession}
                handleRequestFinish={handleRequestFinish}
                setShowMyPage={setShowMyPage}
              />
            </aside>
          </div>
        )
      }

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative">
        {dbError && (
          <div className="absolute top-20 left-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">오류 발생: </strong>
            <span className="block sm:inline">{dbError}</span>
            <button onClick={() => setDbError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
              <span className="text-xl">&times;</span>
            </button>
          </div>
        )}

        {/* Loading Overlay with Text */}
        {isLoading && loadingText && !isStreaming && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm animate-fade-in">
            <div className="flex flex-col items-center">
              <SpinnerIcon className="w-10 h-10 text-sage-600 animate-spin mb-4" />
              <p className="text-sage-800 font-bold text-lg whitespace-pre-wrap text-center">{loadingText}</p>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-up">
            <div className="bg-sage-800/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
              <SpinnerIcon className="w-4 h-4 text-sage-200 animate-spin" />
              <span className="text-sm font-medium">{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="flex items-center justify-between p-4 md:p-6 sticky top-0 z-10 bg-sage-100/95 backdrop-blur-sm">
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-sage-700 hover:bg-sage-200 rounded-lg transition-colors"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="relative">
            {currentBook ? (
              <div className="flex flex-col items-start animate-fade-in text-left">
                <span className="text-xs font-bold text-sage-500 uppercase tracking-widest mb-0.5">Reading</span>
                <span className="font-serif font-bold text-lg text-sage-900">{currentBook.title}</span>
              </div>
            ) : (
              <span className="font-serif font-bold text-lg text-sage-800 tracking-tight">
                {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\./g, '.')}
              </span>
            )}
          </div>

          <div className="w-10 flex justify-end">
            <button
              onClick={() => setShowLibrary(true)}
              className="p-2 text-sage-600 hover:bg-sage-200 rounded-full transition-colors relative"
              title="My Library"
            >
              <LibraryIcon className="w-6 h-6" />
              {completedBooks.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-sage-500 rounded-full border-2 border-sage-100" />
              )}
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-0 scroll-smooth">
          <div className="max-w-3xl mx-auto w-full pt-4 pb-32">

            {/* Empty State */}
            {messages.length === 0 && !currentBook && (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-8 animate-fade-in px-4">
                <div className="p-2">
                  <div className="text-6xl font-serif text-sage-200 mb-2">"</div>
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-bold text-sage-800 mb-2">
                    {userName ? `안녕하세요, ${userName}님.` : '안녕하세요, 소원입니다.'}
                  </h2>
                  <p className="text-sage-600 max-w-md mx-auto leading-relaxed">
                    당신의 마음에 귀 기울이고, 책 속의 지혜로 위로를 건네드립니다.<br />
                    오늘 어떤 기분이신가요?
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-xl">
                  {INITIAL_SUGGESTIONS.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(suggestion)}
                      className="p-4 bg-white/60 border border-sage-200 hover:border-sage-400 hover:bg-white rounded-xl text-left text-sm text-sage-700 transition-all shadow-sm hover:shadow-md"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, index) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onBookSelect={(book) => {
                  handleBookSelect(book);
                }}
                onRegenerate={index === messages.length - 1 && msg.role === Role.MODEL ? handleRegenerate : undefined}
                onEdit={() => handleStartEdit(msg)}
                onStop={msg.isStreaming ? handleStopGeneration : undefined}
              />
            ))}

            {/* Recommendation Chip */}
            {!currentBook && messageCount >= 3 && messages.length > 0 && messages[messages.length - 1].role === Role.MODEL && !messages[messages.length - 1].isStreaming && (
              <div className="flex justify-start mb-6 animate-fade-in">
                <button
                  onClick={() => handleSend("내 상황에 맞는 책을 추천해줄래? 한 권이나 세 권 정도 추천해주면 좋겠어.")}
                  className="flex items-center gap-2 px-4 py-2 bg-sage-200/50 hover:bg-sage-200 text-sage-700 rounded-full text-sm font-medium transition-colors ml-2"
                >
                  <SparklesIcon className="w-4 h-4" />
                  책 추천 받기
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-sage-100 via-sage-100 to-transparent pt-10 pb-2 z-20">

          <InputArea
            value={inputValue}
            onChange={setInputValue}
            onSend={() => handleSend()}
            isLoading={isLoading}
            onStop={handleStopGeneration}
            isStreaming={isStreaming}
          />
        </div>

      </main>

      <style>{`
        @keyframes slide-in-left {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
        }
        @keyframes slide-in-right {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
        }
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in-left { animation: slide-in-left 0.3s ease-out; }
        .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
      `}</style>
    </div >
  );
};

export default App;
