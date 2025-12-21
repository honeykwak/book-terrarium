import React, { useState, useEffect } from 'react';
import { KOREA_REGIONS } from '../constants';
import { searchBooks } from '../services/googleBooksService';
import { Book } from '../types';
import { BookIcon, CheckCircleIcon, SearchIcon, XIcon, PlusIcon, SpinnerIcon } from './Icon';
import { Helmet } from 'react-helmet-async';

interface OnboardingProps {
  initialName: string;
  onComplete: (data: any) => void;
  onLogout: () => void;
}

const STEPS = ['GUIDE', 'PROFILE', 'FAVORITES', 'ALARM'];

// --- Sub-components (Extracted to prevent re-renders) ---

const GuideStep = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="text-center mb-8">
      <h2 className="text-2xl font-serif font-bold text-sage-900 mb-2">북테라리움과 함께하는 치유 여정</h2>
      <p className="text-sage-600 text-sm">시작하기 전에, 몇 가지 안내사항을 알려드릴게요</p>
    </div>

    <div className="bg-white/60 rounded-2xl p-6 shadow-sm border border-sage-100 space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
      <section>
        <h3 className="text-sage-800 font-bold mb-1 text-sm flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-sage-500"></span>
          서비스 목적
        </h3>
        <p className="text-xs text-sage-600 leading-relaxed">
          북테라리움은 책을 통한 자기 성찰과 정서적 치유를 돕는 AI 독서 동반자입니다.
          전문적인 심리 상담이나 의료 서비스를 대체하지 않으며, 일상의 고민에 대한 따뜻한 위로와 통찰을 제공합니다.
        </p>
      </section>

      <section>
        <h3 className="text-sage-800 font-bold mb-1 text-sm flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-sage-500"></span>
          역할 명확화
        </h3>
        <p className="text-xs text-sage-600 leading-relaxed">
          소원 AI는 당신의 이야기를 경청하고, 적절한 치유 도서를 추천하며, 독서 과정에서 질문과 성찰을 촉진하는 독서 촉진자 역할을 합니다.
        </p>
      </section>

      <section>
        <h3 className="text-sage-800 font-bold mb-1 text-sm flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-sage-500"></span>
          개인정보 보호 및 데이터 수집
        </h3>
        <p className="text-xs text-sage-600 leading-relaxed">
          대화 내용과 개인정보는 안전하게 암호화되어 저장됩니다. 맞춤형 도서 추천을 위해 연령대, 성별, 지역 정보를 수집하며 이는 서비스 개선 목적 외에 제3자와 공유되지 않습니다.
        </p>
      </section>

      <section>
        <h3 className="text-red-400 font-bold mb-1 text-sm flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
          위기 상황 안내
        </h3>
        <p className="text-xs text-sage-600 leading-relaxed">
          자살, 자해, 심각한 정신적 고통 등 긴급한 위기 상황에서는 전문 상담 기관(자살예방상담전화 1393, 정신건강위기상담 1577-0199)의 도움을 받으시기 바랍니다.
        </p>
      </section>
    </div>

    <div className="flex items-start gap-2 p-3 bg-sage-50 rounded-lg">
      <input type="checkbox" className="mt-1 rounded text-sage-700 focus:ring-sage-500" id="agree" />
      <label htmlFor="agree" className="text-xs text-sage-500 leading-tight cursor-pointer">
        위의 서비스 안내사항을 확인했으며, 개인정보 수집 및 이용에 동의합니다.
      </label>
    </div>
  </div>
);

const ProfileStep = ({ formData, setFormData }: { formData: any, setFormData: any }) => {
  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const region = e.target.value;
    setFormData({
      ...formData,
      region,
      district: '', // Reset district when region changes
      location: region // Update location string
    });
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const district = e.target.value;
    setFormData({
      ...formData,
      district,
      location: `${formData.region} ${district} `.trim()
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-serif font-bold text-sage-900 mb-2">기본 정보를 입력해주세요</h2>
        <p className="text-sage-600 text-sm">더 정확한 맞춤 추천을 위해 필요한 정보입니다</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-sage-500 uppercase mb-2">이름 (닉네임)</label>
          <input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-white border border-sage-200 rounded-xl p-3 text-sage-900 focus:ring-2 focus:ring-sage-400 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-sage-500 uppercase mb-2">성별</label>
          <div className="flex gap-2">
            {['여성', '남성', '선택안함'].map((gender) => (
              <button
                key={gender}
                onClick={() => setFormData({ ...formData, gender })}
                className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-all ${formData.gender === gender
                  ? 'bg-sage-600 text-white border-sage-600'
                  : 'bg-white text-sage-600 border-sage-200 hover:bg-sage-50'
                  }`}
              >
                {gender}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-sage-500 uppercase mb-2">연령대</label>
          <select
            value={formData.ageGroup}
            onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
            className="w-full bg-white border border-sage-200 rounded-xl p-3 text-sage-900 focus:ring-2 focus:ring-sage-400 outline-none"
          >
            <option value="">연령대를 선택해주세요</option>
            <option value="10">10대</option>
            <option value="20">20대</option>
            <option value="30">30대</option>
            <option value="40">40대</option>
            <option value="50">50대 이상</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-sage-500 uppercase mb-2">거주 지역</label>
          <div className="flex gap-2">
            <select
              value={formData.region || ''}
              onChange={handleRegionChange}
              className="flex-1 bg-white border border-sage-200 rounded-xl p-3 text-sage-900 focus:ring-2 focus:ring-sage-400 outline-none"
            >
              <option value="">시/도 선택</option>
              {Object.keys(KOREA_REGIONS).map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>

            <select
              value={formData.district || ''}
              onChange={handleDistrictChange}
              disabled={!formData.region}
              className="flex-1 bg-white border border-sage-200 rounded-xl p-3 text-sage-900 focus:ring-2 focus:ring-sage-400 outline-none disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value="">시/구/군 선택</option>
              {formData.region && KOREA_REGIONS[formData.region]?.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- NEW STEP: Favorite Books ---
const FavoriteBookStep = ({ formData, setFormData }: { formData: any, setFormData: any }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [searching, setSearching] = useState(false);
  const [favorites, setFavorites] = useState<Book[]>(formData.favoriteBooks || []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const books = await searchBooks(query);
      setResults(books);
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  const addFavorite = (book: Book) => {
    if (favorites.length >= 3) {
      alert("최대 3권까지 선택할 수 있습니다.");
      return;
    }
    if (favorites.some(b => b.title === book.title)) return; // Simple dedup by title
    const newFavorites = [...favorites, book];
    setFavorites(newFavorites);
    setFormData({ ...formData, favoriteBooks: newFavorites });
  };

  const removeFavorite = (bookTitle: string) => {
    const newFavorites = favorites.filter(b => b.title !== bookTitle);
    setFavorites(newFavorites);
    setFormData({ ...formData, favoriteBooks: newFavorites });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-sage-900 mb-2">인생 책을 알려주세요</h2>
        <p className="text-sage-600 text-sm">
          가장 기억에 남는 책 1~3권을 선택해주세요.<br />
          취향을 분석하여 더 좋은 책을 추천해 드릴게요.
        </p>
      </div>

      {/* Selected Books */}
      <div className="flex flex-wrap gap-2 justify-center min-h-[40px]">
        {favorites.map((book) => (
          <div key={book.id} className="flex items-center gap-2 px-3 py-1.5 bg-sage-700 text-white rounded-full text-sm shadow-md animate-fade-in">
            <span className="truncate max-w-[150px]">{book.title}</span>
            <button onClick={() => removeFavorite(book.title)} className="hover:text-red-200">
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
        {favorites.length === 0 && (
          <span className="text-sage-400 text-xs italic py-2">아직 선택된 책이 없습니다</span>
        )}
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="책 제목 또는 저자 검색"
          className="w-full pl-10 pr-4 py-3 bg-white border border-sage-200 rounded-xl text-sage-900 focus:ring-2 focus:ring-sage-400 outline-none"
        />
        <SearchIcon className="w-5 h-5 text-sage-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-sage-100 text-sage-600 rounded-lg font-bold text-xs hover:bg-sage-200"
          disabled={searching}
        >
          {searching ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : "검색"}
        </button>
      </form>

      {/* Results */}
      <div className="h-[280px] overflow-y-auto custom-scrollbar space-y-2 pr-1">
        {results.map((book) => {
          const isSelected = favorites.some(f => f.title === book.title);
          return (
            <button
              key={book.id}
              onClick={() => !isSelected && addFavorite(book)}
              disabled={isSelected}
              className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-colors border ${isSelected
                ? 'bg-sage-50 border-sage-200 opacity-60 cursor-default'
                : 'bg-white border-transparent hover:bg-sage-50 hover:border-sage-200'
                }`}
            >
              <div
                className="w-10 h-14 bg-gray-200 rounded shrink-0 overflow-hidden shadow-sm"
                style={{ backgroundColor: book.coverColor }}
              >
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/50"><BookIcon className="w-4 h-4" /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sage-900 text-sm truncate">{book.title}</h4>
                <p className="text-xs text-sage-500 truncate">{book.author}</p>
              </div>
              {isSelected ? (
                <CheckCircleIcon className="w-5 h-5 text-sage-500" />
              ) : (
                <div className="w-5 h-5 rounded-full border border-sage-300 flex items-center justify-center text-sage-300">
                  <PlusIcon className="w-3 h-3" />
                </div>
              )}
            </button>
          )
        })}
        {results.length === 0 && !searching && query && (
          <p className="text-center text-sage-400 text-xs py-8">검색 결과가 없습니다.</p>
        )}
      </div>
    </div>
  );
};


const AlarmStep = ({ formData, setFormData }: { formData: any, setFormData: any }) => {
  const times = [
    { id: 'morning', label: '아침 (06-09시)' },
    { id: 'afternoon', label: '낮 (09-18시)' },
    { id: 'evening', label: '저녁 (18-22시)' },
    { id: 'night', label: '밤 (22-24시)' }
  ];
  const days = ['월', '화', '수', '목', '금', '토', '일'];

  const toggleTime = (id: string) => {
    const current = formData.alarmTimes;
    const next = current.includes(id)
      ? current.filter((t: string) => t !== id)
      : [...current, id];
    setFormData({ ...formData, alarmTimes: next });
  };

  const toggleDay = (day: string) => {
    const current = formData.alarmDays;
    const next = current.includes(day)
      ? current.filter((d: string) => d !== day)
      : [...current, day];
    setFormData({ ...formData, alarmDays: next });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-serif font-bold text-sage-900 mb-2">알림 설정</h2>
        <p className="text-sage-600 text-sm">편안하게 대화 나눌 수 있는 시간대를 알려주세요</p>
      </div>

      <div>
        <label className="block text-xs font-bold text-sage-500 uppercase mb-3">선호 요일</label>
        <div className="flex justify-between gap-2">
          {days.map(day => (
            <button
              key={day}
              onClick={() => toggleDay(day)}
              className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${formData.alarmDays.includes(day)
                ? 'bg-sage-600 text-white shadow-md'
                : 'bg-white text-sage-400 border border-sage-100 hover:border-sage-300'
                }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-sage-500 uppercase mb-3">선호 시간대</label>
        <div className="grid grid-cols-1 gap-3">
          {times.map((time) => (
            <button
              key={time.id}
              onClick={() => toggleTime(time.id)}
              className={`w-full p-4 rounded-xl text-left transition-all border ${formData.alarmTimes.includes(time.id)
                ? 'bg-sage-50 border-sage-400 ring-1 ring-sage-400 text-sage-900'
                : 'bg-white border-sage-100 text-sage-500 hover:bg-sage-50'
                }`}
            >
              <span className="font-medium">{time.label}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-sage-400 text-center mt-4">
        선택하신 시간대에 독서 리마인더, 감정 점검, 생각 발문 알림을 받으실 수 있습니다.
      </p>
    </div>
  );
};

const Onboarding: React.FC<OnboardingProps> = ({ initialName, onComplete, onLogout }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: initialName,
    gender: '',
    ageGroup: '',
    region: '',
    district: '',
    location: '',
    favoriteBooks: [] as Book[],
    alarmDays: [] as string[],
    alarmTimes: [] as string[]
  });

  const handleNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(prev => prev + 1);
    } else {
      onComplete(formData);
    }
  };

  const currentStep = STEPS[stepIndex];

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#E8F0E8] p-4 relative">
      <Helmet>
        <title>온보딩 | 북 테라리움</title>
      </Helmet>
      <button
        onClick={onLogout}
        className="absolute top-4 right-4 text-xs text-sage-500 hover:text-sage-700 underline z-10"
      >
        로그아웃 (처음으로)
      </button>

      <div className="w-full max-w-lg">
        {/* Steps Indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 rounded-full transition-all duration-500 ${idx <= stepIndex ? 'w-8 bg-sage-600' : 'w-2 bg-sage-300'
                }`}
            />
          ))}
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-10 shadow-xl border border-white">
          {currentStep === 'GUIDE' && <GuideStep />}
          {currentStep === 'PROFILE' && <ProfileStep formData={formData} setFormData={setFormData} />}
          {currentStep === 'FAVORITES' && <FavoriteBookStep formData={formData} setFormData={setFormData} />}
          {currentStep === 'ALARM' && <AlarmStep formData={formData} setFormData={setFormData} />}

          <div className="mt-10 flex justify-end">
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-sage-700 hover:bg-sage-800 text-white rounded-xl font-medium shadow-lg transition-all active:scale-95 flex items-center justify-center"
            >
              {stepIndex === STEPS.length - 1 ? '소원 시작하기' : '다음'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
