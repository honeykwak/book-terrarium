import React from 'react';
import { LogOutIcon } from './Icon';
import ReadingCalendar from './ReadingCalendar';

interface MyPageModalProps {
    userName: string;
    userProfile: any;
    completedBooksCount: number;
    messageCount: number;
    onLogout: () => void;
    onDeleteAccount: () => void;
    onClose: () => void;
    readingActivity: Record<string, number>;
}

const MyPageModal: React.FC<MyPageModalProps> = ({
    userName,
    userProfile,
    completedBooksCount,
    messageCount,
    onLogout,
    onDeleteAccount,
    onClose,
    readingActivity
}) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sage-900/40 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up">
            {/* Header */}
            <div className="bg-sage-100/50 p-6 text-center border-b border-sage-100">
                <div className="w-20 h-20 bg-sage-300 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-serif">
                    {userName ? userName.charAt(0).toUpperCase() : 'G'}
                </div>
                <h3 className="text-xl font-serif font-bold text-sage-900">{userName}</h3>
                <p className="text-xs text-sage-500">{userProfile?.ageGroup ? `${userProfile.ageGroup} 대` : ''} · {userProfile?.location || '나의 작은 정원'}</p>
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

            {/* Reading Calendar */}
            <div className="p-4 border-b border-sage-100">
                <ReadingCalendar activityData={readingActivity} />
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

export default MyPageModal;
