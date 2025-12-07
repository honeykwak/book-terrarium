
import React from 'react';
import {
    SparklesIcon, BookIcon, BrainIcon, TargetIcon,
    ChevronDownIcon, LeafIcon, ChartBarIcon, ShareIcon
} from './Icon';

interface LandingPageProps {
    onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
    return (
        <div className="min-h-screen bg-sage-50 text-sage-900 font-sans selection:bg-sage-200 overflow-x-hidden">

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-sage-50/80 backdrop-blur-md border-b border-sage-100/50">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-xl text-sage-900 tracking-tight">소원</span>
                        <span className="text-xs text-sage-500 uppercase tracking-widest hidden sm:block">Reading Therapist</span>
                    </div>
                    <button
                        onClick={onStart}
                        className="px-5 py-2 bg-sage-800 hover:bg-sage-900 text-white text-sm font-medium rounded-full transition-all hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                        시작하기
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 min-h-[90vh] flex flex-col items-center justify-center text-center">
                {/* Background Elements */}
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-sage-200/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-100/40 rounded-full blur-3xl animate-pulse delay-700" />

                <div className="relative z-10 max-w-4xl mx-auto space-y-8 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage-100 border border-sage-200 text-sage-600 text-xs font-semibold uppercase tracking-wider mb-4">
                        <SparklesIcon className="w-3 h-3" />
                        AI Driven Bibliotherapy
                    </div>

                    <h1 className="font-serif text-5xl md:text-7xl font-bold text-sage-900 leading-tight">
                        당신의 마음을 읽는<br />
                        <span className="text-sage-600">독서 치료사, 소원</span>
                    </h1>

                    <p className="font-sans text-lg md:text-xl text-sage-600 max-w-2xl mx-auto leading-relaxed">
                        말로 다 할 수 없는 고민이 있나요? <br className="md:hidden" />소원은 당신의 감정을 이해하고, <br />
                        지금 당신에게 가장 필요한 문장과 책을 처방해 드립니다.
                    </p>

                    <div className="pt-8">
                        <button
                            onClick={onStart}
                            className="group relative px-8 py-4 bg-sage-900 text-white text-lg font-medium rounded-full overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                여정 시작하기
                                <ChevronDownIcon className="w-4 h-4 transform -rotate-90 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-sage-800 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                        </button>
                    </div>
                </div>

                <div className="absolute bottom-10 animate-bounce text-sage-400">
                    <ChevronDownIcon className="w-6 h-6" />
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 px-6 bg-white relative">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-sage-900">
                            단순한 대화 그 이상의 경험
                        </h2>
                        <p className="text-sage-600">
                            최첨단 AI 기술과 인문학적 감성이 만나<br />당신의 내면을 어루만집니다.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<BrainIcon className="w-6 h-6 text-sage-100" />}
                            title="깊이 있는 공감"
                            desc="단순한 챗봇이 아닙니다. 당신의 상황과 감정의 맥락을 깊이 이해하고, 친구처럼 다정하게 대화합니다."
                        />
                        <FeatureCard
                            icon={<BookIcon className="w-6 h-6 text-sage-100" />}
                            title="맞춤형 도서 처방"
                            desc="수많은 도서 데이터베이스 중에서, 지금 당신의 마음을 치유해 줄 단 한 권의 책을 찾아냅니다."
                        />
                        <FeatureCard
                            icon={<ChartBarIcon className="w-6 h-6 text-sage-100" />}
                            title="독서 여정 기록"
                            desc="당신이 읽은 책과 나눈 대화들을 소중히 기록합니다. 당신만의 마음 치유 데이터를 시각화해 드립니다."
                        />
                    </div>
                </div>
            </section>

            {/* Tech Stack Section */}
            <section className="py-24 px-6 bg-sage-900 text-sage-50 relative overflow-hidden">
                {/* Decorative Grid */}
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                />

                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="md:w-1/2 space-y-6">
                            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white leading-tight">
                                Engineering<br />
                                <span className="text-sage-300">The Soul's Sanctuary</span>
                            </h2>
                            <p className="text-sage-300 leading-relaxed text-lg">
                                소원은 단순한 웹사이트가 아닙니다. <br />
                                최신 웹 기술과 생성형 AI 모델이 결합된 <br />
                                고도화된 멘탈 케어 플랫폼입니다.
                            </p>

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <TechItem label="LLM Core" value="Gemini 1.5 Flash" />
                                <TechItem label="Framework" value="React + Vite" />
                                <TechItem label="Database" value="Supabase" />
                                <TechItem label="Data Source" value="Google Books + Naroo" />
                            </div>
                        </div>

                        <div className="md:w-1/2 w-full">
                            <div className="bg-sage-800/50 backdrop-blur-sm rounded-2xl p-6 border border-sage-700/50 shadow-2xl">
                                <div className="flex items-center gap-2 mb-4 border-b border-sage-700/50 pb-4">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-400" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                        <div className="w-3 h-3 rounded-full bg-green-400" />
                                    </div>
                                    <span className="ml-2 text-xs text-sage-400 font-mono">architecture.tsx</span>
                                </div>
                                <div className="space-y-3 font-mono text-sm text-sage-300">
                                    <div className="flex items-center gap-3">
                                        <span className="text-purple-300">const</span>
                                        Sowon = <span className="text-blue-300">AI</span> + <span className="text-green-300">Empathy</span>;
                                    </div>
                                    <div className="pl-4 border-l-2 border-sage-700 space-y-1">
                                        <p>// Real-time Streaming Response</p>
                                        <p>// Context-Aware Recommendation</p>
                                        <p>// Secure Data Encryption</p>
                                    </div>
                                    <div>
                                        <span className="text-purple-300">return</span>
                                        <span className="text-orange-300"> Healing</span>;
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-sage-950 text-sage-400 py-12 px-6 text-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 bg-sage-900 rounded-full flex items-center justify-center">
                        <LeafIcon className="w-5 h-5 text-sage-500" />
                    </div>
                    <p className="font-serif text-sm">© 2024 Sowon Project. All rights reserved.</p>
                    <p className="text-xs text-sage-600">Designed & Developed by HoneyKwak</p>
                </div>
            </footer>
        </div>
    );
};

// Helper Components
const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, desc: string }> = ({ icon, title, desc }) => (
    <div className="bg-sage-50/50 p-8 rounded-2xl hover:bg-sage-100 transition-colors duration-300 group">
        <div className="w-12 h-12 bg-sage-900 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <h3 className="font-bold text-xl text-sage-900 mb-3">{title}</h3>
        <p className="text-sage-600 leading-relaxed text-sm">
            {desc}
        </p>
    </div>
);

const TechItem: React.FC<{ label: string, value: string }> = ({ label, value }) => (
    <div className="flex flex-col">
        <span className="text-xs text-sage-400 uppercase tracking-wider">{label}</span>
        <span className="font-bold text-white">{value}</span>
    </div>
);

export default LandingPage;
