
import React, { useState, useEffect } from 'react';
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

const busPlates: Record<string, string> = {
  "BUS 750": "SZ 46134",
  "BUS 751": "SZ 128930",
  "BUS 752": "SZ 128931",
  "BUS 753": "SZ 133488"
};

const EntryForm: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [existingEntry, setExistingEntry] = useState<any>(null);
  const [weeklyStats, setWeeklyStats] = useState({ count: 0, days: [] as number[] });
  
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [kmStart, setKmStart] = useState<number | string>('');
  const [kmEnd, setKmEnd] = useState<number | string>('');
  const [kmDiff, setKmDiff] = useState<number>(0);
  const [wagenNr, setWagenNr] = useState<string>('');
  const [zhNummer, setZhNummer] = useState<string>('');
  const [dienst94P, setDienst94P] = useState<boolean>(false);
  const [bemerkungen, setBemerkungen] = useState<string>('');
  
  const [extDiesel, setExtDiesel] = useState<boolean>(false);
  const [extDieselAmount, setExtDieselAmount] = useState<number | string>('');
  const [extAdblue, setExtAdblue] = useState<boolean>(false);
  const [extAdblueAmount, setExtAdblueAmount] = useState<number | string>('');
  
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const categories = [
    { id: 'WERKSTATT', icon: 'build' },
    { id: 'INSTRUKTION', icon: 'school' },
    { id: 'BAHNERSATZ', icon: 'train' },
    { id: 'EXTRAFAHRTEN', icon: 'payments' }
  ];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('current_user') || '{}');
    setCurrentUser(user);
    calculateWeeklyStats(user.vorname);
  }, []);

  const calculateWeeklyStats = (userName: string) => {
    const allEntries = JSON.parse(localStorage.getItem('mileage_entries') || '[]');
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)));
    startOfWeek.setHours(0, 0, 0, 0);

    const userEntriesThisWeek = allEntries.filter((e: any) => {
      const entryDate = new Date(e.date);
      return (e.createdBy === userName || e.finalizedBy === userName) && entryDate >= startOfWeek;
    });

    // Fix: Explicitly define activeDays as number[] and cast the map result to number to resolve type inference issues.
    const activeDays: number[] = Array.from(new Set(userEntriesThisWeek.map((e: any) => new Date(e.date).getDay() as number)));
    setWeeklyStats({
      count: activeDays.length,
      days: activeDays.map(d => d === 0 ? 7 : d) // Normalize Sunday to 7
    });
  };

  useEffect(() => {
    if (wagenNr && date) {
      const allEntries = JSON.parse(localStorage.getItem('mileage_entries') || '[]');
      const openEntry = allEntries.find((e: any) => 
        e.date === date && e.wagenNr === wagenNr && (!e.kmEnd || e.kmEnd === 0)
      );
      
      if (openEntry) {
        setExistingEntry(openEntry);
        setKmStart(openEntry.kmStart || '');
        setZhNummer(openEntry.zhNummer || busPlates[wagenNr] || '');
        setBemerkungen(openEntry.bemerkungen || '');
        setSelectedCats(openEntry.categories || []);
        // Automatisch aktivieren bei Schichtende (94P)
        setDienst94P(true); 
        setExtDiesel(openEntry.extDiesel || false);
        setExtDieselAmount(openEntry.extDieselAmount || '');
        setExtAdblue(openEntry.extAdblue || false);
        setExtAdblueAmount(openEntry.extAdblueAmount || '');
      } else {
        setExistingEntry(null);
        setKmStart('');
        setKmEnd('');
        setDienst94P(false);
        setExtDiesel(false);
        setExtDieselAmount('');
        setExtAdblue(false);
        setExtAdblueAmount('');
        setSelectedCats(['EXTRAFAHRTEN']);
        setZhNummer(busPlates[wagenNr] || 'SZ ');
        setBemerkungen('');
      }
    }
  }, [wagenNr, date]);

  useEffect(() => {
    const start = Number(kmStart) || 0;
    const end = Number(kmEnd) || 0;
    setKmDiff(end > start ? end - start : 0);
  }, [kmStart, kmEnd]);

  const toggleCategory = (catId: string) => {
    setSelectedCats(prev => 
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
  };

  const handleSave = () => {
    if (!wagenNr) { alert("Bitte Wagennummer wählen."); return; }
    if (!zhNummer || zhNummer.trim() === 'SZ') { alert("Bitte das Kennzeichen ergänzen."); return; }

    const allEntries = JSON.parse(localStorage.getItem('mileage_entries') || '[]');
    
    if (existingEntry) {
      if (!kmEnd || Number(kmEnd) <= Number(kmStart)) { alert("Gültiger Endstand nötig."); return; }
      const updatedEntries = allEntries.map((e: any) => 
        e.id === existingEntry.id 
          ? { 
              ...e, kmEnd: Number(kmEnd), kmDiff: Number(kmEnd) - e.kmStart,
              zhNummer, finalizedBy: currentUser?.vorname, finalizedAt: new Date().toISOString(),
              dienst95P: dienst94P, categories: selectedCats, bemerkungen, extDiesel,
              extDieselAmount: Number(extDieselAmount) || 0, extAdblue, extAdblueAmount: Number(extAdblueAmount) || 0
            } : e
      );
      localStorage.setItem('mileage_entries', JSON.stringify(updatedEntries));
    } else {
      if (!kmStart) { alert("Startstand eingeben."); return; }
      const newEntry = {
        id: Date.now(), date, wagenNr, zhNummer, kmStart: Number(kmStart), kmEnd: 0, kmDiff: 0,
        categories: selectedCats, bemerkungen, extDiesel, extDieselAmount: Number(extDieselAmount) || 0,
        extAdblue, extAdblueAmount: Number(extAdblueAmount) || 0, createdBy: currentUser?.vorname,
        createdTime: new Date().toLocaleTimeString('de-CH'), reportId: Math.random().toString(36).substring(2, 9).toUpperCase(),
        dienst95P: dienst94P
      };
      allEntries.push(newEntry);
      localStorage.setItem('mileage_entries', JSON.stringify(allEntries));
    }
    navigate('/confirmation');
  };

  const Weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0a0f14] text-slate-900 dark:text-white pb-40 transition-colors duration-300">
      <header className="px-4 py-6">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined font-black">arrow_back_ios_new</span>
          </button>
          <div className="text-center">
            <Logo className="h-12 mb-0.5" />
            <p className="text-[10px] font-black italic uppercase tracking-[0.2em] opacity-40">Erfassungsprotokoll</p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-md mx-auto p-6 space-y-8">
        {/* User Card & Weekly Overview */}
        <section className="bg-slate-900 dark:bg-[#151c24] rounded-[2rem] p-6 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-[10px] font-black uppercase text-primary/80 mb-1 block italic">
              {existingEntry ? 'Dienst 94P - Schichtende' : 'Dienst 91P - Schichtbeginn'}
            </span>
            <h2 className="text-2xl font-black tracking-tighter italic uppercase">Grüezi, {currentUser?.vorname}!</h2>
            
            <div className="mt-6 pt-6 border-t border-white/5">
              <div className="flex justify-between items-end mb-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Deine Woche</p>
                <p className="text-[10px] font-black italic text-primary">{weeklyStats.count} von 3 Schichten</p>
              </div>
              <div className="flex justify-between gap-1">
                {Weekdays.map((day, idx) => {
                  const dayNum = idx + 1;
                  const isActive = weeklyStats.days.includes(dayNum);
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-2">
                      <div className={`w-full h-1.5 rounded-full transition-all duration-500 ${isActive ? 'bg-primary shadow-[0_0_8px_rgba(19,127,236,0.6)]' : 'bg-white/10'}`}></div>
                      <span className={`text-[8px] font-black uppercase ${isActive ? 'text-primary' : 'text-white/20'}`}>{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="absolute -right-4 -top-4 text-white/5">
            <span className="material-symbols-outlined text-[100px] font-black">calendar_month</span>
          </div>
        </section>

        {/* Bus Selection */}
        <section className="space-y-4">
          <div className={`bg-white dark:bg-[#111820] border-2 rounded-[1.8rem] p-1 shadow-lg transition-all ${wagenNr ? 'border-green-500/60' : 'border-slate-200 dark:border-white/5'}`}>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-5 text-primary">directions_bus</span>
              <select value={wagenNr} onChange={(e) => setWagenNr(e.target.value)} className="w-full h-12 bg-transparent border-none pl-12 pr-10 font-black text-sm appearance-none focus:ring-0 text-slate-900 dark:text-white">
                <option value="" className="text-slate-900">Wagen auswählen...</option>
                <option value="BUS 750" className="text-slate-900">BUS 750</option>
                <option value="BUS 751" className="text-slate-900">BUS 751</option>
                <option value="BUS 752" className="text-slate-900">BUS 752</option>
                <option value="BUS 753" className="text-slate-900">BUS 753</option>
              </select>
            </div>
          </div>
          
          {wagenNr && (
            <div className="mx-6 px-4 py-2 rounded-xl border bg-green-50 dark:bg-green-950/20 border-green-500/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <span className="text-[8px] font-black uppercase text-green-600/60 shrink-0 italic tracking-widest">Kennzeichen</span>
              <input type="text" value={zhNummer} onChange={(e) => setZhNummer(e.target.value.toUpperCase())} className="w-full bg-transparent border-none p-0 text-[11px] font-black text-green-700 dark:text-green-300 focus:ring-0" />
            </div>
          )}
        </section>

        {/* Mileage Input */}
        <section className="bg-white dark:bg-[#111820] rounded-[2rem] shadow-xl border border-slate-200/60 dark:border-white/5 overflow-hidden">
          <div className="flex border-b border-slate-100 dark:border-white/5">
            <div className={`flex-1 py-4 text-center transition-colors ${!existingEntry ? 'border-b-4 border-primary bg-primary/5' : 'opacity-40 grayscale'}`}>
              <p className="text-[9px] font-black uppercase tracking-widest text-primary">Übernahme (91P)</p>
            </div>
            <div className={`flex-1 py-4 text-center transition-colors ${existingEntry ? 'border-b-4 border-amber-500 bg-amber-500/5' : 'opacity-40 grayscale'}`}>
              <p className="text-[9px] font-black uppercase tracking-widest text-amber-500">Abgabe (94P)</p>
            </div>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Anfang (KM)</label>
              <input type="number" disabled={!!existingEntry} value={kmStart} onChange={(e) => setKmStart(e.target.value)} placeholder="Start-KM" className="w-full text-xl font-black bg-slate-50 dark:bg-black/20 rounded-xl h-12 px-4 focus:ring-0 border-none dark:text-white" />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-right mr-1 block italic">Ende (KM)</label>
              <input type="number" disabled={!existingEntry} value={kmEnd} onChange={(e) => setKmEnd(e.target.value)} placeholder="End-KM" className="w-full text-xl font-black bg-slate-50 dark:bg-black/20 rounded-xl h-12 px-4 text-right focus:ring-0 border-none dark:text-white" />
            </div>
          </div>
          {existingEntry && (
             <div className="px-6 pb-6 animate-in fade-in">
               <div className="bg-primary/5 rounded-2xl p-3 border border-primary/10 flex justify-between items-center">
                 <span className="text-[10px] font-black uppercase text-primary/60 italic tracking-widest">Netto Fahrleistung</span>
                 <p className="text-2xl font-black italic text-primary">{kmDiff} <span className="text-[10px] uppercase">km</span></p>
               </div>
             </div>
          )}
        </section>

        {/* External Fueling Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Externe Tankung</h3>
            <div className="h-px flex-1 bg-slate-100 dark:bg-white/5"></div>
          </div>
          <div className="space-y-3">
            {/* Diesel Extern */}
            <div className="space-y-2">
              <button 
                onClick={() => setExtDiesel(!extDiesel)} 
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${extDiesel ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white dark:bg-[#111820] border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg font-black">local_gas_station</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">Diesel Extern</span>
                </div>
                {extDiesel && <span className="material-symbols-outlined">check_circle</span>}
              </button>
              {extDiesel && (
                <div className="px-4 py-3 bg-white dark:bg-[#111820] border-2 border-primary/30 rounded-2xl animate-in slide-in-from-top-2 duration-300">
                  <label className="text-[8px] font-black uppercase text-primary tracking-widest mb-1 block italic">Menge Diesel (Liter)</label>
                  <input type="number" value={extDieselAmount} onChange={(e) => setExtDieselAmount(e.target.value)} placeholder="LT eingeben..." className="w-full bg-transparent border-none p-0 text-xl font-black text-primary focus:ring-0 placeholder:text-primary/20" />
                </div>
              )}
            </div>

            {/* AdBlue Extern */}
            <div className="space-y-2">
              <button 
                onClick={() => setExtAdblue(!extAdblue)} 
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${extAdblue ? 'bg-blue-400 border-blue-400 text-white shadow-lg' : 'bg-white dark:bg-[#111820] border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg font-black">water_drop</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">AdBlue Extern</span>
                </div>
                {extAdblue && <span className="material-symbols-outlined">check_circle</span>}
              </button>
              {extAdblue && (
                <div className="px-4 py-3 bg-white dark:bg-[#111820] border-2 border-blue-400/30 rounded-2xl animate-in slide-in-from-top-2 duration-300">
                  <label className="text-[8px] font-black uppercase text-blue-500 tracking-widest mb-1 block italic">Menge AdBlue (Liter)</label>
                  <input type="number" value={extAdblueAmount} onChange={(e) => setExtAdblueAmount(e.target.value)} placeholder="LT eingeben..." className="w-full bg-transparent border-none p-0 text-xl font-black text-blue-500 focus:ring-0 placeholder:text-blue-500/20" />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Gefahrene Km für:</h3>
            <div className="h-px flex-1 bg-slate-100 dark:bg-white/5"></div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {categories.map(cat => {
              const isActive = selectedCats.includes(cat.id);
              return (
                <button 
                  key={cat.id} 
                  onClick={() => toggleCategory(cat.id)} 
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${isActive ? 'bg-white dark:bg-white/5 border-primary shadow-sm' : 'bg-white dark:bg-[#111820] border-slate-100 dark:border-white/5 text-slate-500'}`}
                >
                  <div className={`size-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-primary/10 text-primary' : 'bg-slate-50 dark:bg-black/20 text-slate-400'}`}>
                    <span className="material-symbols-outlined text-base font-black">{cat.icon}</span>
                  </div>
                  <span className={`flex-1 text-left text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-primary' : ''}`}>{cat.id}</span>
                  {isActive && <span className="material-symbols-outlined text-primary text-base">task_alt</span>}
                </button>
              );
            })}
          </div>
        </section>

        {/* Parking Task Toggle */}
        <section>
          <button 
            onClick={() => setDienst94P(!dienst94P)} 
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${dienst94P ? 'bg-green-600 border-green-600 text-white shadow-lg' : 'bg-white dark:bg-[#111820] border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400'}`}
          >
            <div className={`p-1.5 rounded-lg ${dienst94P ? 'bg-white/20' : 'bg-slate-50 dark:bg-black/20 text-slate-400'}`}>
              <span className="material-symbols-outlined text-lg font-black">local_parking</span>
            </div>
            <p className="text-[10px] font-black italic uppercase tracking-widest flex-1 text-left">Parkdienst erledigt (94P)</p>
            {dienst94P && (
              <span className="material-symbols-outlined animate-in zoom-in duration-300">check_circle</span>
            )}
          </button>
        </section>

        {/* Remarks Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Bemerkung</h3>
            <div className="h-px flex-1 bg-slate-100 dark:bg-white/5"></div>
          </div>
          <textarea 
            value={bemerkungen} 
            onChange={(e) => setBemerkungen(e.target.value)} 
            placeholder="Mitteilungen an Zentrale..." 
            className="w-full bg-white dark:bg-[#111820] border border-slate-200 dark:border-white/5 rounded-2xl p-4 text-xs font-bold min-h-[100px] focus:ring-primary focus:border-primary transition-all outline-none resize-none text-slate-900 dark:text-white" 
          />
        </section>
      </main>

      {/* Floating Action Button */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 z-50 bg-gradient-to-t from-background-light dark:from-background-dark via-background-light/80 dark:via-background-dark/80 to-transparent">
        <div className="max-w-md mx-auto">
          <button 
            onClick={handleSave} 
            className={`w-full h-16 text-white rounded-2xl shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${existingEntry ? 'bg-amber-600' : 'bg-primary'}`}
          >
            <span className="text-lg font-black uppercase italic tracking-tighter">
              {existingEntry ? 'Dienst abschliessen' : 'Übernahme erfassen'}
            </span>
            <span className="material-symbols-outlined font-black">
              {existingEntry ? 'task_alt' : 'send'}
            </span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default EntryForm;
