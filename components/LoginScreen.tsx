import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface LoginScreenProps {
  onLogin: (session: any) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // Auth State
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsAnimating(true);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: nickname }
          }
        });
        if (error) throw error;
        if (data.session) onLogin(data.session);
        else alert('회원가입 확인 메일을 확인해주세요.');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        if (data.session) onLogin(data.session);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'kakao' | 'azure') => {
    alert(`${provider} 로그인 기능은 준비 중입니다.`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#E8F0E8] overflow-hidden relative">

      {/* --- Wave Background Animation --- */}
      <div className="absolute bottom-0 left-0 w-full h-[40vh] overflow-hidden z-0 pointer-events-none">
        {/* Wave 1 (Back) */}
        <div
          className="absolute bottom-0 left-0 w-[200%] h-full animate-wave-slow opacity-40"
          style={{ animationDelay: '0s' }}
        >
          <svg viewBox="0 0 1440 320" className="w-full h-full preserve-3d" preserveAspectRatio="none">
            <path fill="#8FA88F" fillOpacity="1" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        {/* Wave 2 (Middle) */}
        <div
          className="absolute bottom-0 left-0 w-[200%] h-full animate-wave opacity-60"
          style={{ animationDelay: '-5s' }}
        >
          <svg viewBox="0 0 1440 320" className="w-full h-full preserve-3d" preserveAspectRatio="none">
            <path fill="#637A63" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,208C1248,224,1344,192,1392,176L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        {/* Wave 3 (Front) */}
        <div
          className="absolute bottom-[-10px] left-0 w-[200%] h-full animate-wave-fast opacity-80"
          style={{ animationDelay: '-2s' }}
        >
          <svg viewBox="0 0 1440 320" className="w-full h-full preserve-3d" preserveAspectRatio="none">
            <path fill="#4A5A4A" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>

      {/* --- Login Card --- */}
      <div className={`relative z-10 w-full max-w-md p-6 transition-all duration-1000 transform ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl p-8 text-center">

          <div className="mb-8">
            <p className="text-[#637A63] font-sans text-xs tracking-[0.3em] uppercase mb-2">Book Terrarium</p>
            <h1 className="text-4xl font-serif font-bold text-[#4A5A4A] tracking-tight">소원</h1>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                className="w-full px-5 py-3.5 bg-white/70 border border-white rounded-xl text-[#4A5A4A] placeholder-[#7A967A] outline-none focus:ring-2 focus:ring-[#8FA88F] focus:bg-white transition-all font-medium text-sm"
                placeholder="닉네임"
              />
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-5 py-3.5 bg-white/70 border border-white rounded-xl text-[#4A5A4A] placeholder-[#7A967A] outline-none focus:ring-2 focus:ring-[#8FA88F] focus:bg-white transition-all font-medium text-sm"
              placeholder="이메일"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-5 py-3.5 bg-white/70 border border-white rounded-xl text-[#4A5A4A] placeholder-[#7A967A] outline-none focus:ring-2 focus:ring-[#8FA88F] focus:bg-white transition-all font-medium text-sm"
              placeholder="비밀번호"
            />

            {error && <p className="text-red-500 text-xs text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#4A5A4A] text-white rounded-xl font-bold text-base shadow-lg hover:bg-[#354035] transition-all duration-300 active:scale-[0.98] mt-2 disabled:opacity-70"
            >
              {loading ? '처리 중...' : (isSignUp ? '시작하기' : '로그인')}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="h-px bg-[#7A967A] opacity-30 flex-1" />
            <span className="text-[10px] text-[#4A5A4A] opacity-60 font-medium">또는 SNS로 시작하기</span>
            <div className="h-px bg-[#7A967A] opacity-30 flex-1" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Google */}
            <button
              onClick={() => handleSocialLogin('google')}
              type="button"
              className="flex items-center justify-center py-3 bg-white/80 hover:bg-white border border-white rounded-xl shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.86 0 3.53.66 4.85 1.92l3.59-3.59C18.26 1.25 15.33 0 12 0 7.39 0 3.37 2.65 1.43 6.52l4.23 3.28C6.67 6.88 9.13 5.04 12 5.04z" />
                <path fill="#34A853" d="M24 12.3c0-.85-.08-1.68-.22-2.48H12v4.7h6.74c-.29 1.55-1.16 2.86-2.47 3.74l3.99 3.09c2.34-2.15 3.74-5.33 3.74-9.05z" />
                <path fill="#4A90E2" d="M6.67 14.18c-.25-.74-.39-1.54-.39-2.36s.14-1.62.39-2.36L1.43 6.16C.52 7.93 0 9.91 0 12c0 2.09.52 4.07 1.43 5.84l4.24-3.28z" />
                <path fill="#FBBC05" d="M12 24c3.24 0 6.09-1.07 8.16-2.88l-3.99-3.09c-1.08.72-2.46 1.15-4.17 1.15-2.88 0-5.33-1.95-6.2-4.57l-4.23 3.28C3.37 21.35 7.39 24 12 24z" />
              </svg>
            </button>
            {/* Kakao */}
            <button
              onClick={() => handleSocialLogin('kakao')}
              type="button"
              className="flex items-center justify-center py-3 bg-[#FEE500]/90 hover:bg-[#FEE500] border border-[#FEE500] rounded-xl shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#000000">
                <path d="M12 3C5.373 3 0 7.373 0 12.768c0 3.515 2.28 6.63 5.712 8.352l-1.176 4.32c-.108.396.252.756.624.576l5.028-3.336c.588.06 1.188.096 1.812.096 6.627 0 12-4.373 12-9.768C24 7.373 18.627 3 12 3z" />
              </svg>
            </button>
            {/* Naver/Other */}
            <button
              onClick={() => handleSocialLogin('azure')}
              type="button"
              className="flex items-center justify-center py-3 bg-[#03C75A]/90 hover:bg-[#03C75A] border border-[#03C75A] rounded-xl shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <span className="text-white font-bold text-xs">N</span>
            </button>
          </div>

          <div className="mt-8">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[11px] text-[#4A5A4A] opacity-70 hover:opacity-100 underline transition-opacity"
            >
              {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
