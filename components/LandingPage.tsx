import React from 'react';
import {
    SparklesIcon, BookIcon,
    ChevronDownIcon, LeafIcon, ChartBarIcon, ShareIcon,
    MessageSquareIcon, HistoryIcon, LockIcon
} from './Icon';

interface LandingPageProps {
    onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
    return (
        <div className="min-h-screen bg-sage-50 text-sage-900 font-sans selection:bg-sage-200 overflow-x-hidden">

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-sage-50/90 backdrop-blur-md border-b border-sage-100/50 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-2xl text-sage-900 tracking-tight">소원</span>
                        <span className="text-xs text-sage-500 uppercase tracking-widest hidden sm:block border-l border-sage-300 pl-3 ml-1">
                            AI Reading Therapist
                        </span>
                    </div>
                    <button
                        onClick={onStart}
                        className="px-6 py-2 bg-sage-800 hover:bg-sage-900 text-white text-sm font-medium rounded-full transition-all hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                        체험하기
                    </button>
                </div>
            </nav>

            {/* 1. HERO: The Problem & Hook (0-1 min) */}
            <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20">
                <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-sage-200/40 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-green-100/40 rounded-full blur-[80px] animate-pulse delay-1000" />

                <div className="relative z-10 max-w-5xl mx-auto space-y-8 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sage-100 border border-sage-200 text-sage-700 text-xs font-bold uppercase tracking-wider mb-6">
                        <SparklesIcon className="w-4 h-4" />
                        AI Driven Bibliotherapy
                    </div>

                    <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-sage-900 leading-tight">
                        당신의 마음을 읽는<br />
                        <span className="text-sage-500 italic">독서 치료사, 소원</span>
                    </h1>

                    <p className="font-sans text-xl md:text-2xl text-sage-600 max-w-3xl mx-auto leading-relaxed pt-4">
                        말로 다 할 수 없는 고민이 있나요? <br className="md:hidden" />
                        소원은 당신의 감정을 이해하고, 지금 당신에게 가장 필요한 문장과 책을 처방해 드립니다.
                    </p>

                    <div className="pt-12">
                        <button
                            onClick={onStart}
                            className="group relative px-10 py-5 bg-sage-900 text-white text-lg font-medium rounded-full overflow-hidden shadow-2xl hover:shadow-3xl transition-all hover:-translate-y-1"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                치유의 여정 시작하기
                                <ChevronDownIcon className="w-5 h-5 transform -rotate-90 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-sage-800 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                        </button>
                    </div>
                </div>

                <div className="absolute bottom-12 animate-bounce text-sage-400">
                    <p className="text-xs mb-2 tracking-widest uppercase">Scroll to Discover</p>
                    <ChevronDownIcon className="w-6 h-6 mx-auto" />
                </div>
            </section>

            {/* 2. SOLUTION: AI Bibliotherapy (User Journey) */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <SectionHeader
                        badge="Solution"
                        title="AI Bibliotherapy"
                        subtitle="단순한 챗봇이 아닙니다. 당신의 감정을 분석하고 문학적 처방을 내립니다."
                    />

                    {/* STEP 1: Onboarding */}
                    <div className="flex flex-col md:flex-row items-center gap-16 mb-32">
                        <div className="md:w-1/2 space-y-6">
                            <div className="inline-block px-3 py-1 bg-sage-100 text-sage-800 rounded-full text-sm font-bold mb-2">Step 1</div>
                            <h3 className="font-serif text-3xl font-bold text-sage-900">당신을 알아가는 첫 만남</h3>
                            <p className="text-lg text-sage-600 leading-relaxed">
                                간단한 대화를 통해 당신의 성향, 고민, 그리고 독서 취향을 파악합니다.<br />
                                소원은 당신에 대해 더 많이 알수록, 더 섬세한 위로를 건넬 수 있습니다.
                            </p>
                        </div>
                        <div className="md:w-1/2 w-full flex justify-center">
                            <div className="w-full max-w-xs">
                                <PlaceholderFrame label="Onboarding / Profile Setup" aspect="aspect-[9/19]" icon={<SparklesIcon className="w-12 h-12" />} radius="rounded-[2rem]" />
                            </div>
                        </div>
                    </div>

                    {/* STEP 2: Deep Empathy */}
                    <div className="flex flex-col-reverse md:flex-row items-center gap-16 mb-32">
                        <div className="md:w-1/2 w-full flex justify-center">
                            <div className="w-full max-w-xs">
                                <PlaceholderFrame label="Chat UI Screenshot (Deep Empathy)" aspect="aspect-[9/19]" icon={<MessageSquareIcon className="w-12 h-12" />} radius="rounded-[2rem]" />
                            </div>
                        </div>
                        <div className="md:w-1/2 space-y-6">
                            <div className="inline-block px-3 py-1 bg-sage-100 text-sage-800 rounded-full text-sm font-bold mb-2">Step 2</div>
                            <h3 className="font-serif text-3xl font-bold text-sage-900">깊이 있는 공감 대화</h3>
                            <p className="text-lg text-sage-600 leading-relaxed">
                                "요즘 너무 무기력해"라고 말하면, 기계적인 답변 대신<br />
                                당신의 감정선에 맞춘 따뜻한 대화를 이어갑니다.<br />
                                Gemini 2.5 Flash 모델이 문맥을 완벽하게 파악합니다.
                            </p>
                        </div>
                    </div>

                    {/* STEP 3: Prescription */}
                    <div className="flex flex-col md:flex-row items-center gap-16 mb-32">
                        <div className="md:w-1/2 space-y-6">
                            <div className="inline-block px-3 py-1 bg-sage-100 text-sage-800 rounded-full text-sm font-bold mb-2">Step 3</div>
                            <h3 className="font-serif text-3xl font-bold text-sage-900">상황별 맞춤 도서 처방</h3>
                            <p className="text-lg text-sage-600 leading-relaxed">
                                수십만 권의 도서 데이터베이스에서<br />
                                지금 당신의 고민을 해결해 줄 단 한 권의 책을 찾아냅니다.<br />
                                책 표지, 저자, 그리고 추천 이유를 명확하게 제시합니다.
                            </p>
                        </div>
                        <div className="md:w-1/2 w-full">
                            <PlaceholderFrame label="Book Recommendation Card" aspect="aspect-video" icon={<BookIcon className="w-12 h-12" />} />
                        </div>
                    </div>

                    {/* STEP 4: Reading Support */}
                    <div className="flex flex-col-reverse md:flex-row items-center gap-16 mb-32">
                        <div className="md:w-1/2 w-full flex justify-center">
                            <div className="w-full max-w-xs">
                                <PlaceholderFrame label="Reading Progress / Timer UI" aspect="aspect-[9/19]" icon={<ChartBarIcon className="w-12 h-12" />} radius="rounded-[2rem]" />
                            </div>
                        </div>
                        <div className="md:w-1/2 space-y-6">
                            <div className="inline-block px-3 py-1 bg-sage-100 text-sage-800 rounded-full text-sm font-bold mb-2">Step 4</div>
                            <h3 className="font-serif text-3xl font-bold text-sage-900">완독을 돕는 러닝메이트</h3>
                            <p className="text-lg text-sage-600 leading-relaxed">
                                혼자 읽다 지치지 않도록, 진행 상황을 시각화하고 격려합니다.<br />
                                목표하신 분량을 읽을 수 있도록 꾸준히 동기를 부여해 드립니다.
                            </p>
                        </div>
                    </div>

                    {/* STEP 5: Report & History */}
                    <div className="flex flex-col md:flex-row items-center gap-16 mb-32">
                        <div className="md:w-1/2 space-y-6">
                            <div className="inline-block px-3 py-1 bg-sage-100 text-sage-800 rounded-full text-sm font-bold mb-2">Step 5</div>
                            <h3 className="font-serif text-3xl font-bold text-sage-900">독서 감정 리포트</h3>
                            <p className="text-lg text-sage-600 leading-relaxed">
                                완독 후, 당신의 감정 변화와 읽은 내용을 분석한 리포트를 제공합니다.<br />
                                AI와의 지난 대화 내역도 언제든 다시 꺼내볼 수 있습니다.
                            </p>
                        </div>
                        <div className="md:w-1/2 w-full flex justify-center">
                            <div className="w-full max-w-xs">
                                <PlaceholderFrame label="Reading Report & Chat History" aspect="aspect-[9/19]" icon={<HistoryIcon className="w-12 h-12" />} radius="rounded-[2rem]" />
                            </div>
                        </div>
                    </div>

                    {/* STEP 6: Community */}
                    <div className="flex flex-col-reverse md:flex-row items-center gap-16">
                        <div className="md:w-1/2 w-full flex justify-center">
                            <div className="w-full max-w-xs">
                                <PlaceholderFrame label="Community Feed & Likes" aspect="aspect-[9/19]" icon={<ShareIcon className="w-12 h-12" />} radius="rounded-[2rem]" />
                            </div>
                        </div>
                        <div className="md:w-1/2 space-y-6">
                            <div className="inline-block px-3 py-1 bg-sage-100 text-sage-800 rounded-full text-sm font-bold mb-2">Step 6</div>
                            <h3 className="font-serif text-3xl font-bold text-sage-900">공감의 도서관</h3>
                            <p className="text-lg text-sage-600 leading-relaxed">
                                같은 책을 읽은 다른 사람들은 어떤 생각을 했을까요?<br />
                                서로의 감상에 '좋아요'를 누르며, 느슨하지만 따뜻한 연대를 경험하세요.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. EXPERIENCE: Cross-Platform (3-5 min) */}
            <section className="py-24 px-6 bg-sage-50">
                <div className="max-w-7xl mx-auto">
                    <SectionHeader
                        badge="Experience"
                        title="Seamless Everywhere"
                        subtitle="언제 어디서나, 당신 곁의 든든한 멘탈 케어 파트너."
                    />

                    <div className="relative mt-20 flex flex-col md:flex-row justify-center items-end gap-8">
                        {/* Desktop Mockup */}
                        <div className="w-full md:w-2/3 max-w-3xl relative z-10">
                            <div className="bg-gray-800 rounded-t-xl p-2 pb-0 shadow-2xl">
                                <div className="flex gap-1.5 p-2 mb-1">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                                </div>
                                <PlaceholderFrame label="Desktop View" aspect="aspect-[16/10]" bg="bg-white" hideBorder icon={<ChartBarIcon className="w-12 h-12 text-sage-200" />} />
                            </div>
                        </div>

                        {/* Mobile Mockup */}
                        <div className="w-full md:w-1/3 max-w-xs relative z-20 md:-ml-20 md:-mb-12">
                            <div className="bg-gray-900 rounded-[3rem] p-3 shadow-2xl border-4 border-gray-800">
                                <div className="w-1/3 h-6 bg-black rounded-b-xl mx-auto absolute top-3 left-1/3 z-30" />
                                <PlaceholderFrame label="Mobile View" aspect="aspect-[9/19]" bg="bg-white" radius="rounded-[2rem]" hideBorder icon={<MessageSquareIcon className="w-8 h-8 text-sage-200" />} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. TECHNOLOGY: Core Engine (5-7 min) */}
            <section className="py-24 px-6 bg-sage-900 text-sage-50 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

                <div className="max-w-7xl mx-auto relative z-10">
                    <SectionHeader
                        badge="Technology"
                        title="Engineered for Empathy"
                        subtitle="최신 생성형 AI 모델과 견고한 엔지니어링의 결합."
                        dark
                    />

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
                        <TechCard
                            title="Gemini 2.5 Flash"
                            desc="초저지연(Latency < 200ms) 및 1M 토큰 컨텍스트로 긴 대화도 완벽 기억."
                            icon={<SparklesIcon className="w-6 h-6" />}
                        />
                        <TechCard
                            title="Supabase Realtime"
                            desc="대화 내용과 상태를 실시간으로 동기화하는 엔터프라이즈급 백엔드."
                            icon={<ShareIcon className="w-6 h-6" />}
                        />
                        <TechCard
                            title="Data Pipeline"
                            desc="Google Books + 도서관 정보나루 API를 통한 검증된 도서 데이터."
                            icon={<BookIcon className="w-6 h-6" />}
                        />
                        <TechCard
                            title="Security First"
                            desc="모든 대화는 암호화되며, 익명성이 철저하게 보장됩니다."
                            icon={<LockIcon className="w-6 h-6" />}
                        />
                    </div>

                    {/* Architecture Diagram Placeholder */}
                    <div className="mt-20">
                        <div className="bg-sage-800/50 backdrop-blur-sm rounded-3xl p-8 border border-sage-700/50">
                            <div className="text-center mb-8">
                                <h4 className="text-xl font-bold font-mono text-sage-200">System Architecture</h4>
                            </div>
                            <PlaceholderFrame label="Architecture Diagram (Mermaid)" aspect="aspect-[21/9]" bg="bg-sage-900/50" dark icon={<ShareIcon className="w-12 h-12 text-sage-700" />} />
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. VISION: Roadmap (8-9 min) */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-4xl mx-auto">
                    <SectionHeader
                        badge="Vision"
                        title="Roadmap 2026"
                        subtitle="소원은 멈추지 않습니다. 더 깊은 치유를 향해 나아갑니다."
                    />

                    <div className="relative mt-16 border-l-2 border-sage-200 ml-4 md:ml-0 space-y-12 pl-8 md:pl-0">
                        <RoadmapItem
                            quarter="Q1 2026"
                            title="Voice Therapy Interface"
                            desc="텍스트를 넘어, 따뜻한 음성으로 대화하는 보이스 테라피 기능 탑재."
                        />
                        <RoadmapItem
                            quarter="Q2 2026"
                            title="Community Group Therapy"
                            desc="비슷한 고민을 가진 사용자들과 익명으로 서로를 위로하는 안전한 공간."
                        />
                        <RoadmapItem
                            quarter="Q3 2026"
                            title="VR Book Immersion"
                            desc="추천받은 책의 풍경 속으로 들어가는 몰입형 독서 경험."
                        />
                    </div>
                </div>
            </section>

            {/* 6. CLOSE: Call to Action (9-10 min) */}
            <section className="py-32 px-6 bg-sage-50 text-center">
                <div className="max-w-3xl mx-auto space-y-8">
                    <LeafIcon className="w-16 h-16 text-sage-400 mx-auto" />
                    <h2 className="font-serif text-4xl md:text-5xl font-bold text-sage-900 leading-tight">
                        지금, 당신의 마음을<br />들려주세요.
                    </h2>
                    <p className="text-xl text-sage-600">
                        소원은 언제나 당신을 기다리고 있습니다.
                    </p>
                    <div className="pt-8">
                        <button
                            onClick={onStart}
                            className="px-12 py-5 bg-sage-900 hover:bg-sage-800 text-white text-xl font-bold rounded-full shadow-2xl transition-all transform hover:-translate-y-1 hover:scale-105"
                        >
                            무료로 시작하기
                        </button>
                    </div>
                    <p className="text-sm text-sage-400 mt-12">
                        © 2025 Sowon Project. Powered by HoneyKwak.
                    </p>
                </div>
            </section>

        </div>
    );
};

// --- Sub Components for Consistent Design ---

const SectionHeader: React.FC<{ badge: string, title: string, subtitle: string, dark?: boolean }> = ({ badge, title, subtitle, dark }) => (
    <div className="text-center space-y-4 mb-12">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase ${dark ? 'bg-sage-800 text-sage-300' : 'bg-sage-100 text-sage-600'}`}>
            {badge}
        </span>
        <h2 className={`font-serif text-4xl md:text-5xl font-bold ${dark ? 'text-white' : 'text-sage-900'}`}>
            {title}
        </h2>
        <p className={`text-lg md:text-xl max-w-2xl mx-auto ${dark ? 'text-sage-400' : 'text-sage-600'}`}>
            {subtitle}
        </p>
    </div>
);

const PlaceholderFrame: React.FC<{
    label: string,
    aspect?: string,
    bg?: string,
    dark?: boolean,
    icon?: React.ReactNode,
    radius?: string,
    hideBorder?: boolean
}> = ({ label, aspect = "aspect-video", bg = "bg-gray-100", dark, icon, radius = "rounded-xl", hideBorder }) => (
    <div className={`w-full ${aspect} ${bg} ${radius} ${hideBorder ? '' : 'border-2 border-dashed'} ${dark ? 'border-sage-700' : 'border-sage-300'} flex flex-col items-center justify-center p-8 transition-all hover:bg-opacity-80 group cursor-pointer relative overflow-hidden`}>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <div className={`mb-4 transition-transform group-hover:scale-110 ${dark ? 'text-sage-600' : 'text-sage-400'}`}>
                {icon || <ShareIcon className="w-10 h-10" />}
            </div>
            <span className={`font-mono text-sm font-bold uppercase tracking-wider text-center px-4 ${dark ? 'text-sage-600' : 'text-sage-400'}`}>
                {label}
            </span>
            <span className={`text-xs mt-2 ${dark ? 'text-sage-700' : 'text-sage-500'}`}>
                (Size: {aspect === 'aspect-video' ? '16:9' : aspect.replace('aspect-[', '').replace(']', '')})
            </span>
        </div>
        {/* Diagonal stripe pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)', backgroundSize: '20px 20px' }}
        />
    </div>
);

const TechCard: React.FC<{ title: string, desc: string, icon: React.ReactNode }> = ({ title, desc, icon }) => (
    <div className="bg-sage-800 p-6 rounded-2xl border border-sage-700 hover:border-sage-500 transition-colors">
        <div className="w-10 h-10 bg-sage-900 rounded-lg flex items-center justify-center text-sage-300 mb-4">
            {icon}
        </div>
        <h4 className="font-bold text-white text-lg mb-2">{title}</h4>
        <p className="text-sage-400 text-sm leading-relaxed">{desc}</p>
    </div>
);

const RoadmapItem: React.FC<{ quarter: string, title: string, desc: string }> = ({ quarter, title, desc }) => (
    <div className="relative flex flex-col md:flex-row gap-4 md:gap-12 md:items-center group">
        <div className="absolute -left-[41px] md:-left-[41px] top-0 w-5 h-5 bg-white border-4 border-sage-300 rounded-full group-hover:border-sage-600 transition-colors z-10" />
        <div className="w-32 flex-shrink-0">
            <span className="text-sm font-bold text-sage-500 bg-sage-50 px-3 py-1 rounded-full uppercase tracking-wider">
                {quarter}
            </span>
        </div>
        <div>
            <h4 className="text-2xl font-bold text-sage-900 group-hover:text-sage-700 transition-colors">{title}</h4>
            <p className="text-sage-600 mt-2">{desc}</p>
        </div>
    </div>
);

export default LandingPage;
