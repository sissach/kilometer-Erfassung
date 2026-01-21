
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle';

const Logo = ({ className = "h-12" }: { className?: string }) => (
  <div className={`flex flex-col items-center justify-center ${className} leading-none`}>
    <div className="text-primary font-black italic text-2xl tracking-tighter">
      AHW
    </div>
    <div className="text-[7px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white mt-1">
      Busbetriebe AG
    </div>
  </div>
);

const Confirmation: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('current_user');
  }, []);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#f8fafc] dark:bg-[#0a0f14] text-slate-900 dark:text-white antialiased transition-colors duration-300">
      <header className="flex items-center px-6 py-6 justify-between z-10">
        <div className="flex-1"></div>
        <div className="text-center">
          <Logo className="h-12 mb-0.5" />
          <p className="text-xs font-black italic uppercase tracking-tighter opacity-50">Schichtende</p>
        </div>
        <div className="flex-1 flex justify-end">
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-8 pb-20 w-full max-w-md mx-auto relative z-10">
        <div className="mb-12 relative flex items-center justify-center">
          <div className="absolute inset-0 bg-green-500/20 blur-[100px] rounded-full w-64 h-64 animate-pulse"></div>
          <div className="relative flex items-center justify-center w-32 h-32 rounded-[2.5rem] bg-white dark:bg-[#111820] border-[8px] border-green-500 shadow-2xl animate-in zoom-in duration-700">
            <span className="material-symbols-outlined text-7xl text-green-500 font-black">check_circle</span>
          </div>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter italic uppercase leading-none">
            Vielen Dank für deinen Einsatz!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-bold leading-tight opacity-80">
            Dein Kilometer-Eintrag wurde <br/>erfolgreich im System verbucht.
          </p>
          <div className="mt-8 inline-flex items-center gap-3 px-6 py-3 bg-white dark:bg-white/5 rounded-full border border-slate-100 dark:border-white/5 shadow-sm">
            <span className="material-symbols-outlined text-sm text-green-500">cloud_done</span>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Synchronisiert & Abgemeldet</span>
          </div>
        </div>

        <div className="w-full bg-white dark:bg-[#111820] rounded-[3rem] p-8 border border-slate-100 dark:border-white/5 shadow-2xl mb-12 flex flex-col items-center gap-6 text-center">
          <div className="w-16 h-16 rounded-[1.5rem] bg-amber-500/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-amber-500 text-4xl font-black">inventory_2</span>
          </div>
          <div className="space-y-3">
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] italic">Wichtiger Hinweis</p>
            <p className="text-slate-700 dark:text-slate-200 text-sm font-bold leading-relaxed px-4">
              Bitte lege das ausgefüllte Formular wie gewohnt zu Handen Betriebsbüro ins <span className="text-primary font-black italic underline decoration-4 underline-offset-4">Flächli</span>.
            </p>
          </div>
        </div>

        <button 
          onClick={() => navigate('/login')}
          className="w-full h-20 bg-slate-900 dark:bg-white dark:text-black text-white rounded-[2.5rem] shadow-2xl flex items-center justify-between px-10 active:scale-[0.96] transition-all group"
        >
          <span className="text-xl font-black uppercase italic tracking-tighter">Zurück zum Login</span>
          <span className="material-symbols-outlined text-3xl font-black group-hover:translate-x-1 transition-transform">logout</span>
        </button>
      </main>

      <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none opacity-50"></div>
    </div>
  );
};

export default Confirmation;
