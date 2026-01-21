
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle';

const Logo = ({ className = "h-16" }: { className?: string }) => (
  <div className={`flex flex-col items-center justify-center ${className} leading-none select-none`}>
    <div 
      className="text-primary font-black italic text-5xl tracking-tighter opacity-60"
      style={{
        textShadow: '1px 1px 0px rgba(255,255,255,0.2), -1px -1px 0px rgba(0,0,0,0.4)',
        filter: 'contrast(1.2)'
      }}
    >
      AHW
    </div>
    <div 
      className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white mt-2 opacity-40"
      style={{
        textShadow: '0.5px 0.5px 0px rgba(255,255,255,0.1), -0.5px -0.5px 0px rgba(0,0,0,0.3)'
      }}
    >
      Busbetriebe AG
    </div>
  </div>
);

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginPhase, setLoginPhase] = useState<'idle' | 'processing' | 'finalizing'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setLoginPhase('processing');
    await new Promise(r => setTimeout(r, 400));
    setLoginPhase('finalizing');
    await new Promise(r => setTimeout(r, 400));

    const lowerId = identifier.toLowerCase();

    // Admin login
    if (lowerId === 'admin' && password === '007') {
      navigate('/admin');
      return;
    }

    // Feste User-Liste (Immer im System)
    const fixedUsers: Record<string, any> = {
      'jonas': { id: 101, vorname: 'Jonas', personalnummer: '101', email: 'jonas@ahw-bus.ch' },
      'patrick': { id: 102, vorname: 'Patrick', personalnummer: '102', email: 'patrick@ahw-bus.ch' },
      'viktor': { id: 103, vorname: 'Viktor', personalnummer: '103', email: 'viktor@ahw-bus.ch' },
      'aria': { id: 104, vorname: 'Aria', personalnummer: '104', email: 'aria@ahw-bus.ch' },
      'janus': { id: 105, vorname: 'Janus', personalnummer: '105', email: 'janus@ahw-bus.ch' },
      'mitzifar': { id: 106, vorname: 'Mitzifar', personalnummer: '106', email: 'mitzifar@ahw-bus.ch' }
    };

    let targetUser = null;

    if (fixedUsers[lowerId] && password === '007') {
      targetUser = { ...fixedUsers[lowerId], status: 'approved' };
    } else {
      // Check database for registered users
      const users = JSON.parse(localStorage.getItem('app_users') || '[]');
      targetUser = users.find((u: any) => 
        (u.personalnummer === identifier || u.vorname.toLowerCase() === lowerId) && 
        u.password === password
      );
    }

    if (!targetUser) {
      setError('Ungültige Anmeldedaten.');
      setLoginPhase('idle');
      return;
    }

    if (targetUser.status !== 'approved') {
      setError('Ihr Zugang wurde noch nicht vom Administrator freigeschaltet.');
      setLoginPhase('idle');
      return;
    }

    localStorage.setItem('current_user', JSON.stringify(targetUser));
    navigate('/entry');
  };

  const getButtonStyles = () => {
    switch (loginPhase) {
      case 'processing': return 'bg-green-500 shadow-green-500/40 scale-95';
      case 'finalizing': return 'bg-amber-400 shadow-amber-400/40 scale-105 text-slate-900';
      default: return 'bg-primary/80 backdrop-blur-md shadow-primary/30 hover:bg-primary active:scale-95';
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#f8fafc] dark:bg-[#0a0f14] transition-colors duration-500">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="flex items-center p-6 justify-between relative z-10">
        <div className="size-10"></div>
        <div className="flex justify-center flex-1">
          <Logo className="h-20" />
        </div>
        <ThemeToggle />
      </div>

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full relative z-10 px-6">
        <div className="bg-slate-900/40 backdrop-blur-xl overflow-hidden rounded-[2.5rem] min-h-[220px] shadow-2xl relative group border border-white/10 mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-black/60 z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800" 
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-1000"
            alt="Bus"
          />
          <div className="relative z-20 p-8 h-full flex flex-col justify-end">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white/90">KILOMETERERFASSUNG</h2>
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest leading-relaxed mt-1">Zentrale Erfassung AHW Busbetriebe AG</p>
          </div>
        </div>

        <h2 className="text-slate-900 dark:text-white text-4xl font-black tracking-tighter italic uppercase leading-none mb-2">Anmelden</h2>
        <p className="text-slate-500 text-sm mb-8 font-bold uppercase tracking-widest opacity-40 italic">Mitarbeiter-Portal</p>

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border-2 border-red-500/20 p-4 rounded-2xl text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-widest flex items-center gap-3">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Personal-Nr / Vorname</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">badge</span>
              <input 
                required
                className="w-full h-16 rounded-2xl border border-slate-200 dark:border-white/5 bg-white/50 dark:bg-[#111820]/50 backdrop-blur-md pl-14 pr-5 text-slate-900 dark:text-white font-bold transition-all outline-none focus:border-primary/50" 
                placeholder="Name oder Nummer" 
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Passwort</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">lock</span>
              <input 
                required
                className="w-full h-16 rounded-2xl border border-slate-200 dark:border-white/5 bg-white/50 dark:bg-[#111820]/50 backdrop-blur-md pl-14 pr-14 text-slate-900 dark:text-white font-bold transition-all outline-none focus:border-primary/50" 
                placeholder="••••" 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 h-full w-14 flex items-center justify-center text-slate-300"
              >
                <span className="material-symbols-outlined">{showPassword ? 'visibility' : 'visibility_off'}</span>
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loginPhase !== 'idle'}
            className={`mt-4 w-full h-20 text-white rounded-[2.5rem] font-black uppercase italic tracking-tighter flex items-center justify-between px-10 transition-all duration-500 shadow-2xl ${getButtonStyles()}`}
          >
            <span className="text-xl">Anmelden</span>
            <span className="material-symbols-outlined font-black">login</span>
          </button>
        </form>

        <div className="mt-8 text-center pb-10">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Kein Zugang? 
            <button onClick={() => navigate('/register')} className="ml-2 text-primary font-black hover:underline">Registrieren</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
