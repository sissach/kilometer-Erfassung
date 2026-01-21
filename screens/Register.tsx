
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    personalnummer: '',
    vorname: '',
    email: '',
    password: ''
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newUser = {
      ...formData,
      id: Date.now(),
      status: 'pending', // Initial status requires admin approval
      createdAt: new Date().toISOString()
    };

    const existingUsers = JSON.parse(localStorage.getItem('app_users') || '[]');
    localStorage.setItem('app_users', JSON.stringify([...existingUsers, newUser]));
    
    alert('Registrierung erfolgreich! Bitte warten Sie auf die Freigabe durch den Administrator.');
    navigate('/login');
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-background-light/90 dark:bg-background-dark/90 px-4 py-3 backdrop-blur-md">
        <button 
          onClick={() => navigate(-1)}
          className="flex size-10 items-center justify-center rounded-full text-slate-900 transition-colors hover:bg-slate-200/50 dark:text-white dark:hover:bg-white/10"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back_ios_new</span>
        </button>
        <h2 className="flex-1 pr-10 text-center text-lg font-bold text-slate-900 dark:text-white">Registrierung</h2>
      </header>

      <main className="flex flex-1 flex-col px-5 pb-8 pt-2 sm:mx-auto sm:max-w-md w-full">
        <div className="mb-8 mt-2">
          <h1 className="mb-2 text-left text-[32px] font-bold tracking-tight text-slate-900 dark:text-white">Konto erstellen</h1>
          <p className="text-left text-base font-normal text-slate-600 dark:text-slate-400">
            Geben Sie Ihre Daten ein. Der Zugriff muss vom Admin bestätigt werden.
          </p>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleRegister}>
          <div className="flex gap-4">
            <div className="flex flex-1 flex-col">
              <label className="mb-2 text-sm font-medium text-slate-700 dark:text-white">Personalnummer</label>
              <input 
                required
                className="h-14 w-full rounded-lg border border-slate-300 bg-white px-4 text-slate-900 dark:border-[#324d67] dark:bg-[#192633] dark:text-white focus:ring-2 focus:ring-primary/20" 
                placeholder="123456" 
                type="text"
                value={formData.personalnummer}
                onChange={e => setFormData({...formData, personalnummer: e.target.value})}
              />
            </div>
            <div className="flex flex-1 flex-col">
              <label className="mb-2 text-sm font-medium text-slate-700 dark:text-white">Vorname</label>
              <input 
                required
                className="h-14 w-full rounded-lg border border-slate-300 bg-white px-4 text-slate-900 dark:border-[#324d67] dark:bg-[#192633] dark:text-white focus:ring-2 focus:ring-primary/20" 
                placeholder="Vorname" 
                type="text"
                value={formData.vorname}
                onChange={e => setFormData({...formData, vorname: e.target.value})}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="mb-2 text-sm font-medium text-slate-700 dark:text-white">E-Mail Adresse</label>
            <input 
              required
              className="h-14 w-full rounded-lg border border-slate-300 bg-white px-4 text-slate-900 dark:border-[#324d67] dark:bg-[#192633] dark:text-white focus:ring-2 focus:ring-primary/20" 
              placeholder="name@firma.ch" 
              type="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 text-sm font-medium text-slate-700 dark:text-white">Passwort</label>
            <div className="relative">
              <input 
                required
                className="h-14 w-full rounded-lg border border-slate-300 bg-white px-4 pr-12 text-slate-900 dark:border-[#324d67] dark:bg-[#192633] dark:text-white focus:ring-2 focus:ring-primary/20" 
                placeholder="••••••••" 
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 flex h-full w-12 items-center justify-center text-slate-400 dark:text-[#92adc9]"
              >
                <span className="material-symbols-outlined">{showPassword ? 'visibility' : 'visibility_off'}</span>
              </button>
            </div>
          </div>

          <button 
            type="submit"
            className="flex h-14 w-full items-center justify-center rounded-lg bg-primary text-base font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-blue-600 active:scale-[0.98]"
          >
            Registrieren
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Bereits ein Konto? 
            <button onClick={() => navigate('/login')} className="font-semibold text-primary ml-1 hover:underline">Anmelden</button>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Register;
