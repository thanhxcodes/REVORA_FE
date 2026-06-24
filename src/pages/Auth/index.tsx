import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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

const FLOATING_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop', top: '10%', left: '8%', width: '180px', delay: 0, rotate: -6 },
  { url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=400&auto=format&fit=crop', top: '65%', left: '12%', width: '150px', delay: 1.5, rotate: 4 },
  { url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=400&auto=format&fit=crop', top: '15%', right: '10%', width: '160px', delay: 0.5, rotate: 8 },
  { url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=400&auto=format&fit=crop', top: '55%', right: '6%', width: '200px', delay: 2, rotate: -5 },
  { url: 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=400&auto=format&fit=crop', bottom: '-5%', left: '30%', width: '220px', delay: 1, rotate: 12 },
  { url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=400&auto=format&fit=crop', top: '5%', right: '35%', width: '180px', delay: 2.5, rotate: -10 },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>(LOGIN_MODE);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Tính toán độ lệch (offset) dựa trên vị trí chuột so với tâm màn hình
      setMousePos({
        x: (e.clientX - window.innerWidth / 2) * 0.03,
        y: (e.clientY - window.innerHeight / 2) * 0.03,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-brand-dark">
      {/* Nền chuyển sắc trang trí (Animated) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 bg-gradient-to-br from-[#122a1f] via-[#20422c] to-[#0a1a10]" 
      />

      {/* Lớp Parallax chứa các họa tiết trôi nổi và hình ảnh */}
      <motion.div 
        animate={{ x: -mousePos.x, y: -mousePos.y }}
        transition={{ type: "spring", stiffness: 50, damping: 20, mass: 0.5 }}
        className="absolute inset-0 pointer-events-none z-0"
      >
        {/* Vòng tròn họa tiết trang trí trôi nổi */}
        <div className="absolute inset-0 overflow-hidden opacity-80">
          <motion.div 
            animate={{ y: [0, -30, 0], rotate: [0, 10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" 
          />
          <motion.div 
            animate={{ y: [0, 40, 0], x: [0, -30, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl" 
          />
          <motion.div 
            animate={{ y: ['-50%', '-40%', '-50%'], x: [0, 30, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-1/2 left-1/4 w-[30rem] h-[30rem] rounded-full bg-white/[0.02] blur-2xl" 
          />
          <div className="absolute inset-0 opacity-[0.04]" style={DECORATIVE_PATTERN_STYLE} />
        </div>

        {/* Các hình ảnh thời trang trôi nổi */}
        {FLOATING_IMAGES.map((img, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.45, scale: 1, y: [0, -20, 0] }}
            transition={{
              opacity: { duration: 1.5, delay: img.delay * 0.3 },
              scale: { duration: 1.5, delay: img.delay * 0.3 },
              y: { duration: 7 + (i % 3), repeat: Infinity, ease: "easeInOut", delay: img.delay }
            }}
            style={{
              position: 'absolute',
              top: img.top,
              left: img.left,
              right: img.right,
              bottom: img.bottom,
              width: img.width,
              rotate: img.rotate,
            }}
            className="rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-white/10"
          >
            {/* Lớp phủ màu xanh lá để blend hình ảnh vào nền */}
            <div className="absolute inset-0 bg-emerald-900/30 mix-blend-overlay z-10" />
            <img 
              src={img.url} 
              alt="Fashion Inspiration" 
              className="w-full h-auto object-cover filter grayscale-[30%] contrast-125 brightness-90"
            />
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-[460px] z-10"
      >
        {/* Logo và tiêu đề dự án */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mb-8"
        >
          <Link to={HOME_PATH} className="inline-block group">
            <div className="flex items-center justify-center gap-3 mb-3">
              <motion.img 
                whileHover={{ rotate: 10, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                src={logoImg} 
                alt={AUTH_PAGE_TXT.logoAlt} 
                className="w-[52px] h-[52px] rounded-full object-cover shadow-lg border-2 border-white/20" 
              />
              <div className="text-left">
                <h1 className="text-4xl font-black text-white leading-none drop-shadow-md" style={BRAND_STYLE}>
                  {AUTH_PAGE_TXT.brandName}
                </h1>
                <p className="text-white/70 text-[10px] tracking-[0.25em] uppercase mt-1 font-semibold">
                  {AUTH_PAGE_TXT.slogan}
                </p>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Nút gạt tab Đăng nhập / Đăng ký */}
        <div className="flex bg-white/10 backdrop-blur-md rounded-2xl p-1 mb-4 border border-white/20 shadow-xl relative">
          <button
            onClick={() => setMode(LOGIN_MODE)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 z-10 ${
              mode === LOGIN_MODE
                ? 'text-brand-primary'
                : 'text-white/80 hover:text-white'
            }`}
          >
            {AUTH_PAGE_TXT.loginTab}
          </button>
          <button
            onClick={() => setMode(REGISTER_MODE)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 z-10 ${
              mode === REGISTER_MODE
                ? 'text-brand-primary'
                : 'text-white/80 hover:text-white'
            }`}
          >
            {AUTH_PAGE_TXT.registerTab}
          </button>
          {/* Animated Tab Background */}
          <motion.div
            layout
            initial={false}
            animate={{
              x: mode === LOGIN_MODE ? 0 : '100%',
            }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
            className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-md"
          />
        </div>

        {/* Hộp chứa Form chính */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/40">
          <div className="h-1.5 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500" />

          <div className="relative">
            <AnimatePresence mode="wait">
              {mode === LOGIN_MODE ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <LoginForm
                    onSwitchToRegister={() => setMode(REGISTER_MODE)}
                    onForgot={() => navigate('/forgot-password')}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <RegisterForm onSwitchToLogin={() => setMode(LOGIN_MODE)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="text-center text-white/60 text-xs mt-6 font-medium tracking-wide">
          {AUTH_PAGE_TXT.footer}
        </p>
      </motion.div>
    </div>
  );
}
