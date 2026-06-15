import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImg from '../../assets/images/logo.jpg';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import { AUTH_PAGE_TXT } from './constants/auth';

const HOME_PATH = '/';
const LOGIN_MODE = 'login';
const REGISTER_MODE = 'register';

const DECORATIVE_PATTERN_STYLE: React.CSSProperties = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='g' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 10 0 L 0 0 0 10' fill='none' stroke='white' stroke-width='0.8'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3C/svg%3E")`,
};

const BRAND_STYLE: React.CSSProperties = {
  fontFamily: 'Raleway, sans-serif',
  letterSpacing: '0.25em',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>(LOGIN_MODE);

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Nền chuyển sắc trang trí */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-brand-primary to-brand-deep" />

      {/* Vòng tròn họa tiết trang trí */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-white/[0.03] -translate-y-1/2" />
        <div className="absolute inset-0 opacity-[0.07]" style={DECORATIVE_PATTERN_STYLE} />
      </div>

      <div className="relative w-full max-w-[460px]">
        {/* Logo và tiêu đề dự án */}
        <div className="text-center mb-8">
          <Link to={HOME_PATH} className="inline-block group">
            <div className="flex items-center justify-center gap-3 mb-3">
              <img src={logoImg} alt={AUTH_PAGE_TXT.logoAlt} className="w-[52px] h-[52px] rounded-full object-cover" />
              <div className="text-left">
                <h1 className="text-4xl font-black text-white leading-none" style={BRAND_STYLE}>
                  {AUTH_PAGE_TXT.brandName}
                </h1>
                <p className="text-white/55 text-[10px] tracking-[0.25em] uppercase mt-0.5">
                  {AUTH_PAGE_TXT.slogan}
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Nút gạt tab Đăng nhập / Đăng ký */}
        <div className="flex bg-white/10 backdrop-blur-sm rounded-2xl p-1 mb-4 border border-white/20">
          <button
            onClick={() => setMode(LOGIN_MODE)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              mode === LOGIN_MODE
                ? 'bg-white text-brand-primary shadow-md'
                : 'text-white/70 hover:text-white'
            }`}
          >
            {AUTH_PAGE_TXT.loginTab}
          </button>
          <button
            onClick={() => setMode(REGISTER_MODE)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              mode === REGISTER_MODE
                ? 'bg-white text-brand-primary shadow-md'
                : 'text-white/70 hover:text-white'
            }`}
          >
            {AUTH_PAGE_TXT.registerTab}
          </button>
        </div>

        {/* Hộp chứa Form chính */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-brand-primary via-brand-accent to-brand-secondary" />

          {mode === LOGIN_MODE ? (
            <LoginForm
              onSwitchToRegister={() => setMode(REGISTER_MODE)}
              onForgot={() => navigate('/forgot-password')}
            />
          ) : (
            <RegisterForm onSwitchToLogin={() => setMode(LOGIN_MODE)} />
          )}
        </div>

        <p className="text-center text-white/50 text-xs mt-6">
          {AUTH_PAGE_TXT.footer}
        </p>
      </div>
    </div>
  );
}
