
import React, { useState, useRef, useEffect } from 'react';
import { Message, Role, ModelType, Book, CommunityPost, ChatSession, ReportAnalytics } from './types';
import { sendMessageStream, resetChat } from './services/geminiService';
import { searchBooks } from './services/googleBooksService';
import { dbService } from './services/dbService';
import { supabase } from './supabaseClient';
import MessageBubble from './components/MessageBubble';
import InputArea from './components/InputArea';
import LoginScreen from './components/LoginScreen';
import Onboarding from './components/Onboarding';
import MarkdownRenderer from './components/MarkdownRenderer';
import { EmotionLineGraph, FocusDonutChart, KeywordBarChart } from './components/ReportComponents';
import {
  MenuIcon, ChevronDownIcon, LeafIcon, LibraryIcon,
  PlusIcon, SparklesIcon, CheckCircleIcon, XIcon, UserIcon, LogOutIcon,
  HeartIcon, ShareIcon, LockIcon, EditIcon, HistoryIcon, BrainIcon, TargetIcon, TrendingUpIcon
} from './components/Icon';
import { INITIAL_SUGGESTIONS, COVER_COLORS } from './constants';

type AppState = 'LOGIN' | 'ONBOARDING' | 'MAIN';
type LibraryTab = 'REPORT' | 'REFLECTION' | 'COMMUNITY' | 'CHAT';

// --- MOCK DATA ---

const MOCK_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    user: { id: 'u1', nickname: 'BookLover', email: '' },
    book: { id: 'b1', title: '데미안', author: '헤르만 헤세', coverColor: '#4A5A4A' },
    likes: 12,
    isLiked: false,
    createdAt: new Date(Date.now() - 86400000)
  },
  {
    id: 'post-2',
    user: { id: 'u2', nickname: 'MidnightReader', email: '' },
    book: { id: 'b2', title: '월든', author: '헨리 데이비드 소로', coverColor: '#8FA88F' },
    likes: 8,
    isLiked: true,
    createdAt: new Date(Date.now() - 172800000)
  }
];

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
      emotionAnalysis: { primary: '성찰', intensity: 8, keywords: ['자아', '성장'] },
      readingHabits: { sessionCount: 5, avgDurationMinutes: 45 },
      growthAreas: ['내면 탐구']
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
      emotionAnalysis: { primary: '순수', intensity: 9, keywords: ['동심', '관계'] },
      readingHabits: { sessionCount: 3, avgDurationMinutes: 30 },
      growthAreas: ['관계의 의미']
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

const MyPageModal: React.FC<{
  userName: string;
  userProfile: any;
  completedBooksCount: number;
  messageCount: number;
  onLogout: () => void;
  onDeleteAccount: () => void; // New Prop
  onClose: () => void;
}> = ({ userName, userProfile, completedBooksCount, messageCount, onLogout, onDeleteAccount, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sage-900/40 backdrop-blur-sm">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="bg-sage-100/50 p-6 text-center border-b border-sage-100">
        <div className="w-20 h-20 bg-sage-300 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-serif">
          {userName ? userName.charAt(0).toUpperCase() : 'G'}
        </div>
        <h3 className="text-xl font-serif font-bold text-sage-900">{userName}</h3>
        <p className="text-xs text-sage-500">{userProfile?.ageGroup ? `${userProfile.ageGroup}대` : ''} · {userProfile?.location || '나의 작은 정원'}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 border-b border-sage-100 divide-x divide-sage-100">
        <div className="p-4 text-center">
          <span className="block text-2xl font-bold text-sage-700">{completedBooksCount}</span>
          <span className="text-[10px] uppercase font-bold text-sage-400 tracking-wider">Books Read</span>
        </div>
        <div className="p-4 text-center">
          <span className="block text-2xl font-bold text-sage-700">{messageCount}</span>
          <span className="text-[10px] uppercase font-bold text-sage-400 tracking-wider">Talks</span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-sage-50 flex flex-col gap-2">
        <div className="flex gap-2 w-full">
          <button
            onClick={onLogout}
            className="flex-1 py-3 text-sage-600 hover:bg-sage-100 rounded-xl transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <LogOutIcon className="w-4 h-4" />
            로그아웃
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-sage-700 text-white hover:bg-sage-800 rounded-xl transition-colors text-sm font-medium"
          >
            닫기
          </button>
        </div>
        <button
          onClick={() => {
            if (window.confirm('정말 계정을 초기화하시겠습니까? 모든 데이터가 삭제됩니다.')) {
              onDeleteAccount();
            }
          }}
          className="w-full py-2 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          계정 초기화 (회원 탈퇴)
        </button>
      </div>
    </div>
  </div>
);

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
                            {viewingBook.analytics?.summary || "독서를 통해 많은 성장을 이루셨습니다."}
                          </p>
                        </div>
                      </div>

                      {/* 2. Emotion Graph */}
                      {viewingBook.analytics && (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-sage-100">
                          <h5 className="font-bold text-sage-900 mb-4 flex items-center gap-2">
                            <HeartIcon className="w-5 h-5 text-red-400" filled />
                            나의 감정 변화 추이
                          </h5>
                          <EmotionLineGraph data={viewingBook.analytics.emotionTrajectory} />
                        </div>
                      )}

                      {/* 3. Focus Areas */}
                      {viewingBook.analytics && (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-sage-100">
                          <h5 className="font-bold text-sage-900 mb-4 flex items-center gap-2">
                            <TargetIcon className="w-5 h-5 text-blue-400" />
                            통찰 분포도
                          </h5>
                          <FocusDonutChart data={viewingBook.analytics.focusAreas} />
                          <p className="text-xs text-center text-sage-400 mt-4">
                            {viewingBook.analytics.focusAreas.reduce((prev, current) => (prev.percentage > current.percentage) ? prev : current).label}에 가장 집중하셨습니다.
                          </p>
                        </div>
                      )}

                      {/* 4. Keywords */}
                      {viewingBook.analytics && (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-sage-100">
                          <h5 className="font-bold text-sage-900 mb-4 flex items-center gap-2">
                            <BrainIcon className="w-5 h-5 text-purple-400" />
                            핵심 키워드 분석
                          </h5>
                          <KeywordBarChart data={viewingBook.analytics.keywords} />
                        </div>
                      )}

                      {/* 5. Action Items */}
                      {viewingBook.analytics && (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-sage-100">
                          <h5 className="font-bold text-sage-900 mb-4 flex items-center gap-2">
                            <TrendingUpIcon className="w-5 h-5 text-green-500" />
                            실생활 적용 계획
                          </h5>
                          <div className="space-y-3">
                            {viewingBook.analytics.actionItems.map((item, i) => (
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

                      {/* Original Markdown Report Fallback/Footer */}
                      {viewingBook.report && (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-sage-100 mt-4">
                          <h5 className="font-bold text-sage-900 mb-4">📝 소원의 상세 코멘트</h5>
                          <MarkdownRenderer content={viewingBook.report} className="text-sm" />
                        </div>
                      )}
                    </div>
                  )}

                  {libraryTab === 'CHAT' && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-sage-100 h-[500px] overflow-y-auto custom-scrollbar animate-fade-in">
                      {viewingBook.chatHistory && viewingBook.chatHistory.length > 0 ? (
                        viewingBook.chatHistory.map(msg => (
                          <div key={msg.id} className={`mb-4 ${msg.role === Role.USER ? 'text-right' : 'text-left'}`}>
                            <div className={`inline-block p-3 rounded-lg text-sm max-w-[85%] ${msg.role === Role.USER
                              ? 'bg-sage-100 text-sage-800'
                              : 'bg-white border border-sage-100 text-sage-700'
                              }`}>
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
                            }`}
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
                                  className={`flex items-center gap-1 text-xs font-bold transition-colors ${post.isLiked ? 'text-red-400' : 'text-sage-400 hover:text-sage-600'}`}
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
                        onClick={() => { setViewingBook(book); setLibraryTab('REPORT'); }}
                        className="group relative flex flex-col items-center text-left"
                      >
                        <div
                          className="w-full aspect-[2/3] rounded-lg shadow-md mb-3 transition-transform group-hover:-translate-y-1 relative overflow-hidden"
                          style={{ backgroundColor: book.coverColor }}
                        >
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
  messages: Message[];
  userName: string;
  handleNewChat: () => void;
  handleRequestFinish: () => void;
  setCurrentBook: (b: Book | null) => void;
  setShowMyPage: (v: boolean) => void;
}> = ({ currentBook, messages, userName, handleNewChat, handleRequestFinish, setCurrentBook, setShowMyPage }) => (
  <div className="flex flex-col h-full">
    {currentBook ? (
      // Reading Mode Sidebar
      <div className="animate-fade-in flex flex-col h-full">
        <div className="mb-6 px-2">
          <span className="text-xs font-bold text-sage-400 uppercase tracking-wider">Currently Reading</span>
        </div>

        {/* CSS Book Cover */}
        <div className="px-4 mb-6 flex justify-center">
          <div
            className="w-40 h-60 rounded-r-lg rounded-l-sm shadow-xl flex flex-col justify-between p-4 relative"
            style={{
              backgroundColor: currentBook.coverColor,
              boxShadow: 'inset 4px 0 10px rgba(0,0,0,0.1), 10px 10px 20px rgba(0,0,0,0.15)'
            }}
          >
            <div className="w-1 h-full absolute left-1 top-0 bg-black/10 mix-blend-overlay"></div>
            <div className="text-white/90 font-serif font-bold text-lg leading-tight mt-4 text-center break-words">
              {currentBook.title}
            </div>
            <div className="text-white/70 text-xs text-center font-medium">
              {currentBook.author}
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 text-center">
          <p className="text-sage-600 text-sm mb-6">
            이 책을 통해 마음을 치유하고 있어요.
          </p>
          <button
            onClick={handleRequestFinish}
            className="w-full py-3 bg-sage-700 text-white rounded-xl shadow-md hover:bg-sage-800 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <CheckCircleIcon className="w-4 h-4" />
            완독하기
          </button>
        </div>

        <button
          onClick={() => {
            setCurrentBook(null);
            handleNewChat();
          }}
          className="mt-auto mx-4 mb-4 text-xs text-sage-400 hover:text-sage-600 underline text-center"
        >
          독서 모드 종료하기
        </button>
      </div>
    ) : (
      // Default Sidebar
      <>
        <div className="flex items-center gap-3 mb-8 px-2">
          <span className="font-serif font-bold text-2xl text-sage-800 tracking-tight">소원</span>
        </div>

        <button
          onClick={handleNewChat}
          className="flex items-center gap-2 w-full p-3 bg-white border border-sage-200 rounded-xl hover:bg-sage-100 transition-colors text-sage-700 text-sm font-medium mb-6 shadow-sm"
        >
          <PlusIcon className="w-4 h-4" />
          새로운 대화 시작하기
        </button>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="text-xs font-bold text-sage-400 uppercase tracking-wider mb-3 px-2 mt-4">오늘</div>
          {messages.length > 0 && (
            <div className="px-2 py-2 text-sm text-sage-700 truncate hover:bg-sage-200/50 rounded-lg cursor-pointer">
              {messages[0].content.slice(0, 20)}...
            </div>
          )}
        </div>

        <div className="mt-auto px-2 pt-4 border-t border-sage-200">
          <button
            onClick={() => setShowMyPage(true)}
            className="flex items-center gap-2 text-sm text-sage-600 w-full hover:bg-sage-100 p-2 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-sage-300 flex items-center justify-center text-white font-serif">
              {userName ? userName.charAt(0).toUpperCase() : 'G'}
            </div>
            <span className="truncate max-w-[140px] text-left">{userName || 'Guest User'}</span>
          </button>
        </div>
      </>
    )}
  </div>
);


const App: React.FC = () => {
  // Session State
  const [appState, setAppState] = useState<AppState>('LOGIN');
  const [session, setSession] = useState<any>(null);
  const [userName, setUserName] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null); // New error state
  const [selectedModel, setSelectedModel] = useState<ModelType>(ModelType.FLASH);

  // Mobile Sidebar
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Book Therapy Features
  const [messageCount, setMessageCount] = useState(0);

  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [completedBooks, setCompletedBooks] = useState<Book[]>([]);

  // Library & Community State
  const [showLibrary, setShowLibrary] = useState(false);
  const [viewingBook, setViewingBook] = useState<Book | null>(null); // For detail view
  const [libraryTab, setLibraryTab] = useState<LibraryTab>('REPORT');
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);

  const [showMyPage, setShowMyPage] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // --- Auth & Session Management ---
  useEffect(() => {
    // 1. Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 2. Listen for auth changes (e.g. OAuth redirect)
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

  // Initial greeting if current book exists (Test Mode)
  useEffect(() => {
    if (appState === 'MAIN' && currentBook && messages.length === 0) {
      const initialMsg: Message = {
        id: 'init-msg',
        role: Role.MODEL,
        content: `**[${currentBook.title}]** 독서를 계속하고 계시네요.\n오늘 이 책의 어떤 구절이 마음에 와닿으셨나요?`,
        timestamp: new Date(),
        isSystem: true
      };
      setMessages([initialMsg]);
    }
  }, [appState, currentBook]);

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
        setAppState('MAIN'); // Skip onboarding if profile exists
      } else {
        setAppState('ONBOARDING');
      }

      // 2. Load User Books
      const books = await dbService.getUserBooks(userId);
      setCompletedBooks(books.filter(b => b.status === 'COMPLETED'));

      const activeBook = books.find(b => b.status === 'READING');
      if (activeBook) {
        setCurrentBook(activeBook);
        // Load messages for the book's session
        const session = await dbService.getSessionByBookId(activeBook.id);
        if (session) {
          setCurrentSession(session);
          const msgs = await dbService.getMessages(session.id);
          setMessages(msgs);
        } else {
          // Should not happen if book exists, but handle gracefully
          console.warn("No session found for book:", activeBook.id);
          setMessages([]);
          setCurrentSession(null);
        }
      } else {
        // General chat - reset or fetch latest ephemeral session?
        // For now, reset to empty for new general chat
        setMessages([]);
        setCurrentSession(null);
      }

      // 3. Community Posts
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
    setIsLoading(true);

    // Mock API call simulation
    await new Promise(resolve => setTimeout(resolve, 2000));


    try {
      // Generate mock report (in real app, this would come from AI analysis of chat history)
      const mockReport: ReportAnalytics = {
        emotionAnalysis: {
          primary: '성취감',
          intensity: 8,
          keywords: ['완독', '뿌듯함', '새로운 시작']
        },
        readingHabits: {
          sessionCount: 12,
          avgDurationMinutes: 45
        },
        growthAreas: ['꾸준한 독서 습관', '깊이 있는 사색']
      };

      const analytics = {
        summary: "독서를 통해 차분함을 되찾으셨습니다.",
        emotionTrajectory: [{ progress: 0, score: 3 }, { progress: 50, score: 4 }, { progress: 100, score: 4 }],
        focusAreas: [{ label: '안정', percentage: 60, color: '#10B981' }, { label: '이해', percentage: 40, color: '#6366F1' }],
        keywords: [{ label: '시작', count: 5 }],
        actionItems: ["마음속 문장 간직하기"]
      };

      await dbService.updateUserBook(currentBook.id, {
        completedDate: new Date(),
        status: 'COMPLETED',
        report: mockReport
      });

      // Mark the session as completed
      await dbService.updateSession(currentSession.id, { expiresAt: new Date() });


      const completed: Book = {
        ...currentBook,
        completedDate: new Date(),
        report: mockReport,
        analytics: analytics,
        review: '',
        isShared: false,
        chatHistory: [...messages]
      };

      setCompletedBooks(prev => [completed, ...prev]);

      setMessages([]);
      setCurrentBook(null);
      setCurrentSession(null); // Clear current session after finishing book
      setMessageCount(0);
      resetChat();
      setIsLoading(false);
      setShowLibrary(true);
    } catch (error) {
      console.error('Error finishing book:', error);
      setIsLoading(false);
    }
  };

  const handleBookSelect = async (book: Book) => {
    if (!userProfile) return;

    try {
      // 1. Create UserBook (handles Caching internally)
      const newBook = await dbService.createUserBook(userProfile.id, book);
      setCurrentBook(newBook);

      // 2. Link current session to this book (promote to permanent)
      let activeSession = currentSession;
      if (activeSession) {
        await dbService.linkSessionToBook(activeSession.id, newBook.id);
        setCurrentSession(prev => prev ? { ...prev, userBookId: newBook.id, expiresAt: null } : null);
      } else {
        // If no session existed (rare), create one
        const newSession = await dbService.createSession(userProfile.id);
        await dbService.linkSessionToBook(newSession.id, newBook.id);
        setCurrentSession({ ...newSession, userBookId: newBook.id, expiresAt: null });
        activeSession = newSession;
      }

      // Add system message indicating reading mode started
      const systemMsg: Message = {
        id: Date.now().toString(),
        role: Role.MODEL,
        content: `**[${book.title}]** 독서 모드를 시작합니다.\n이 책의 첫 문장을 읽고 어떤 느낌이 드셨나요?`,
        timestamp: new Date(),
        isSystem: true
      };

      // Save system message
      if (activeSession) {
        await dbService.saveMessage(activeSession.id, systemMsg);
      }
      setMessages(prev => [...prev, systemMsg]);

    } catch (error) {
      console.error('Error selecting book:', error);
    }
  };

  const handleSend = async (text: string = inputValue, isHiddenPrompt: boolean = false) => {
    if ((!text.trim() && !isHiddenPrompt) || isLoading) return;

    let displayMsg: Message | null = null;

    // Ensure Session Exists
    let activeSessionId = currentSession?.id;
    const userId = userProfile?.id || session?.user?.id;

    if (!activeSessionId && userId) {
      try {
        const newSession = await dbService.createSession(userId);
        setCurrentSession(newSession);
        activeSessionId = newSession.id;
      } catch (e) {
        console.error("Failed to create session:", e);
        setDbError("채팅 세션을 생성할 수 없습니다. 데이터베이스 권한을 확인해주세요. (403 Error)");
        return;
      }
    }

    if (!activeSessionId) {
      console.error("No active session to send message.");
      setDbError("활성 세션이 없습니다. 새로고침 후 다시 시도해주세요.");
      return;
    }

    if (!isHiddenPrompt) {
      const userMsgId = Date.now().toString();
      displayMsg = {
        id: userMsgId,
        role: Role.USER,
        content: text,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, displayMsg!]);

      // Save user message to DB
      await dbService.saveMessage(activeSessionId, displayMsg!);

      setInputValue('');
      setMessageCount(prev => prev + 1);
    }
    // --- TRIGGER: Real Book Recommendation ---
    if (text.includes("추천") || text.includes("recommend")) {
      setIsLoading(true);

      try {
        // 1. Ask Gemini for book titles based on user context
        // We use a separate non-streaming call or just a new stream for this hidden step.
        // For simplicity, we'll use the existing stream function but ignore the stream and just get the final text.
        // We construct a prompt to get JSON output.
        const recommendationPrompt = `
          User input: "${text}"
          Based on this input, recommend 3 specific book titles that would be helpful.
          Return ONLY a JSON array of strings. Do not include any other text.
          Example: ["Demian", "The Little Prince", "Walden"]
        `;

        let jsonString = '';
        await sendMessageStream(
          recommendationPrompt,
          [], // No history needed for this specific extraction, or maybe we do? Let's keep it simple.
          ModelType.FLASH,
          (chunk) => { jsonString += chunk; }
        );

        // Clean up markdown code blocks if present
        jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();

        let titles: string[] = [];
        try {
          titles = JSON.parse(jsonString);
        } catch (e) {
          console.error("Failed to parse book titles from AI:", jsonString);
          // Fallback: Search for the user's text directly
          titles = [text];
        }

        // 2. Fetch details from Google Books API
        const recommendedBooks: Book[] = [];
        for (const title of titles) {
          const results = await searchBooks(title);
          if (results.length > 0) {
            recommendedBooks.push(results[0]); // Take the best match
          }
        }

        // 3. Create the recommendation message
        const recMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: Role.MODEL,
          content: "지수님의 상황에 맞는 책들을 찾아보았습니다.\n이 책들이 위로가 되기를 바랍니다.",
          timestamp: new Date(),
          recommendedBooks: recommendedBooks
        };

        setMessages(prev => [...prev, recMsg]);

        // Save to DB
        if (activeSessionId) {
          await dbService.saveMessage(activeSessionId, recMsg);
        }

      } catch (error) {
        console.error("Error getting recommendations:", error);
        // Fallback message
        const errorMsg: Message = {
          id: Date.now().toString(),
          role: Role.MODEL,
          content: "죄송합니다. 책을 추천하는 중에 문제가 발생했습니다.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
      return;
    }


    setIsLoading(true);

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
      const finalContent = await sendMessageStream(
        text,
        messages,
        selectedModel,
        (streamedText) => {
          setMessages(prev => prev.map(msg =>
            msg.id === aiMsgId
              ? { ...msg, content: streamedText }
              : msg
          ));
        }
      );

      // Save AI message to DB after streaming completes
      if (activeSessionId) {
        const finalAiMsg: Message = {
          id: aiMsgId,
          role: Role.MODEL,
          content: finalContent,
          timestamp: new Date(),
          isStreaming: false
        };
        await dbService.saveMessage(activeSessionId, finalAiMsg);
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => prev.map(msg =>
        msg.id === aiMsgId
          ? { ...msg, content: "**오류가 발생했습니다.** 잠시 후 다시 시도해 주세요." }
          : msg
      ));
    } finally {
      setIsLoading(false);
      setMessages(prev => prev.map(msg =>
        msg.id === aiMsgId
          ? { ...msg, isStreaming: false }
          : msg
      ));
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

  const handleLikePost = (postId: string) => {
    setCommunityPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, likes: p.isLiked ? p.likes - 1 : p.likes + 1, isLiked: !p.isLiked };
      }
      return p;
    }));
  };

  const handleDeleteAccount = async () => {
    if (!session?.user) return;
    try {
      await dbService.deleteUserProfile(session.user.id);
      await handleLogout();
      alert('계정이 초기화되었습니다.');
    } catch (error) {
      console.error("Account deletion failed:", error);
      alert('계정 삭제 중 오류가 발생했습니다.');
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
    />
  );

  return (
    <div className="flex h-screen bg-sage-100 font-sans overflow-hidden text-sage-900">

      {/* Modals */}
      {showFinishConfirm && (
        <FinishConfirmModal
          onConfirm={handleConfirmFinish}
          onClose={() => setShowFinishConfirm(false)}
        />
      )}
      {showLibrary && (
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
      )}
      {showMyPage && (
        <MyPageModal
          userName={userName}
          userProfile={userProfile}
          completedBooksCount={completedBooks.length}
          messageCount={messages.length}
          onLogout={handleLogout}
          onClose={() => setShowMyPage(false)}
        />
      )}

      {/* Sidebar (Desktop) */}
      <aside className={`hidden md:flex flex-col w-72 bg-sage-50 border-r border-sage-200 h-full p-6 transition-all duration-500`}>
        <SidebarContent
          currentBook={currentBook}
          messages={messages}
          userName={userName}
          handleNewChat={handleNewChat}
          handleRequestFinish={handleRequestFinish}
          setCurrentBook={setCurrentBook}
          setShowMyPage={setShowMyPage}
        />
      </aside>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-sage-900/20 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="relative w-72 h-full bg-sage-50 p-6 flex flex-col shadow-2xl animate-slide-in-left">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-sage-400 hover:text-sage-600"
            >
              <PlusIcon className="w-6 h-6 rotate-45" />
            </button>
            <SidebarContent
              currentBook={currentBook}
              messages={messages}
              userName={userName}
              handleNewChat={handleNewChat}
              handleRequestFinish={handleRequestFinish}
              setCurrentBook={setCurrentBook}
              setShowMyPage={setShowMyPage}
            />
          </aside>
        </div>
      )}

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

        {/* Header */}
        <header className="flex items-center justify-between p-4 md:p-6 sticky top-0 z-10 bg-sage-100/95 backdrop-blur-sm">
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-sage-700 hover:bg-sage-200 rounded-lg transition-colors"
            >
              {currentBook ? (
                <div
                  className="w-8 h-10 rounded-sm shadow-sm border border-black/10"
                  style={{ backgroundColor: currentBook.coverColor }}
                />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </button>
          </div>

          <div className="relative">
            {currentBook ? (
              <div className="flex flex-col items-center animate-fade-in">
                <span className="text-xs font-bold text-sage-500 uppercase tracking-widest mb-0.5">Reading</span>
                <span className="font-serif font-bold text-lg text-sage-900">{currentBook.title}</span>
              </div>
            ) : (
              <span className="font-serif font-bold text-lg text-sage-800 tracking-tight">소원</span>
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
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onBookSelect={handleBookSelect}
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
          {currentBook && (
            <div className="max-w-3xl mx-auto px-4 mb-2 flex justify-center">
              <div className="bg-sage-800 text-white text-xs px-3 py-1 rounded-full shadow-lg opacity-80 flex items-center gap-2">
                <span>Reading Mode On</span>
                <span className="w-1 h-1 bg-white rounded-full"></span>
                <span>{currentBook.title}</span>
              </div>
            </div>
          )}
          <InputArea
            value={inputValue}
            onChange={setInputValue}
            onSend={() => handleSend()}
            isLoading={isLoading}
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
    </div>
  );
};

export default App;
