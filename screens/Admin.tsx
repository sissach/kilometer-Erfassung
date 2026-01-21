
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle';

const Logo = ({ className = "h-12" }: { className?: string }) => (
  <div className={`flex flex-col items-center justify-center ${className} leading-none select-none`}>
    <div 
      className="text-primary font-black italic text-2xl tracking-tighter opacity-70"
      style={{ textShadow: '1px 1px 0px rgba(255,255,255,0.2), -1px -1px 0px rgba(0,0,0,0.4)' }}
    >
      AHW
    </div>
    <div 
      className="text-[7px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white mt-1 opacity-50"
      style={{ textShadow: '0.5px 0.5px 0px rgba(255,255,255,0.1), -0.5px -0.5px 0px rgba(0,0,0,0.3)' }}
    >
      Busbetriebe AG
    </div>
  </div>
);

interface Entry {
  id: number;
  date: string;
  wagenNr: string;
  zhNummer: string;
  kmStart: number;
  kmEnd: number;
  kmDiff: number;
  categories: string[];
  dienst95P: boolean;
  bemerkungen: string;
  extDieselAmount?: number;
  extAdblueAmount?: number;
  createdBy: string;
  createdTime?: string;
  finalizedBy?: string;
  visum?: boolean;
  reportId?: string;
}

interface AppUser {
  id: number;
  personalnummer: string;
  vorname: string;
  email: string;
  status: 'pending' | 'approved' | 'blocked';
  password?: string;
}

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'entries' | 'users'>('entries');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [previewMode, setPreviewMode] = useState<'none' | 'receipt'>('none');
  const [previewEntry, setPreviewEntry] = useState<Entry | null>(null);
  
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [newUser, setNewUser] = useState({ personalnummer: '', vorname: '', email: '', password: '' });

  const receiptRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => { refreshData(); }, []);

  const refreshData = () => {
    setEntries(JSON.parse(localStorage.getItem('mileage_entries') || '[]'));
    setUsers(JSON.parse(localStorage.getItem('app_users') || '[]'));
  };

  const loadExampleData = () => {
    const exampleUsers = [
      { id: 101, vorname: 'Jonas', personalnummer: '101', email: 'jonas@ahw-bus.ch', status: 'approved' as const },
      { id: 102, vorname: 'Patrick', personalnummer: '102', email: 'patrick@ahw-bus.ch', status: 'approved' as const },
      { id: 103, vorname: 'Viktor', personalnummer: '103', email: 'viktor@ahw-bus.ch', status: 'approved' as const },
      { id: 104, vorname: 'Aria', personalnummer: '104', email: 'aria@ahw-bus.ch', status: 'approved' as const },
      { id: 105, vorname: 'Janus', personalnummer: '105', email: 'janus@ahw-bus.ch', status: 'approved' as const },
      { id: 106, vorname: 'Mitzifar', personalnummer: '106', email: 'mitzifar@ahw-bus.ch', status: 'approved' as const }
    ];

    const exampleEntries: Entry[] = [
      { id: Date.now() + 1, date: '2024-12-01', wagenNr: 'BUS 750', zhNummer: 'SZ 46134', kmStart: 450000, kmEnd: 450120, kmDiff: 120, categories: ['EXTRAFAHRTEN'], dienst95P: true, bemerkungen: '', createdBy: 'Jonas', createdTime: '08:00', finalizedBy: 'Patrick', visum: true, reportId: 'DEC01' },
      { id: Date.now() + 2, date: '2024-12-05', wagenNr: 'BUS 751', zhNummer: 'SZ 128930', kmStart: 320000, kmEnd: 320085, kmDiff: 85, categories: ['WERKSTATT'], dienst95P: true, bemerkungen: 'Ölstand geprüft', createdBy: 'Patrick', createdTime: '09:15', finalizedBy: 'Viktor', visum: true, reportId: 'DEC02' },
      { id: Date.now() + 3, date: '2024-12-10', wagenNr: 'BUS 752', zhNummer: 'SZ 128931', kmStart: 280000, kmEnd: 280150, kmDiff: 150, categories: ['EXTRAFAHRTEN'], dienst95P: true, bemerkungen: '', createdBy: 'Viktor', createdTime: '07:30', finalizedBy: 'Aria', visum: false, reportId: 'DEC03' },
      { id: Date.now() + 4, date: '2024-12-15', wagenNr: 'BUS 753', zhNummer: 'SZ 133488', kmStart: 190000, kmEnd: 190040, kmDiff: 40, categories: ['INSTRUKTION'], dienst95P: true, bemerkungen: 'Neuer Fahrer eingelernt', createdBy: 'Aria', createdTime: '13:00', finalizedBy: 'Janus', visum: true, reportId: 'DEC04' },
      { id: Date.now() + 5, date: '2024-12-20', wagenNr: 'BUS 750', zhNummer: 'SZ 46134', kmStart: 450120, kmEnd: 450300, kmDiff: 180, categories: ['BAHNERSATZ'], dienst95P: true, bemerkungen: 'Zentraler Bahnersatz Schwyz', createdBy: 'Janus', createdTime: '06:00', finalizedBy: 'Mitzifar', visum: true, reportId: 'DEC05' },
      { id: Date.now() + 6, date: '2024-12-24', wagenNr: 'BUS 751', zhNummer: 'SZ 128930', kmStart: 320085, kmEnd: 320140, kmDiff: 55, categories: ['EXTRAFAHRTEN'], dienst95P: true, bemerkungen: 'Weihnachtsdienst', createdBy: 'Mitzifar', createdTime: '17:00', finalizedBy: 'Jonas', visum: false, reportId: 'DEC06' }
    ];

    const currentEntries = JSON.parse(localStorage.getItem('mileage_entries') || '[]');
    const mergedEntries = [...currentEntries, ...exampleEntries];
    localStorage.setItem('mileage_entries', JSON.stringify(mergedEntries));
    
    // Ensure example users exist
    const currentUsers = JSON.parse(localStorage.getItem('app_users') || '[]');
    const userMap = new Map(currentUsers.map((u: any) => [u.personalnummer, u]));
    exampleUsers.forEach(u => userMap.set(u.personalnummer, u));
    localStorage.setItem('app_users', JSON.stringify(Array.from(userMap.values())));
    
    refreshData();
    setSelectedMonth("2024-12");
    alert("Beispieldaten für Dezember 2024 wurden zur bestehenden Datenbank hinzugefügt.");
  };

  const filteredEntries = entries.filter(e => e.date.startsWith(selectedMonth)).sort((a, b) => a.date.localeCompare(b.date));
  const totalKm = filteredEntries.reduce((sum, e) => sum + (e.kmDiff || 0), 0);
  const monthName = new Date(selectedMonth + "-01").toLocaleDateString('de-CH', { month: 'long', year: 'numeric' });

  const toggleVisum = (id: number) => {
    const updated = entries.map(e => e.id === id ? { ...e, visum: !e.visum } : e);
    setEntries(updated);
    localStorage.setItem('mileage_entries', JSON.stringify(updated));
  };

  const handleDeleteEntry = (id: number) => {
    if (window.confirm('Diesen Eintrag wirklich permanent aus der Datenbank löschen?')) {
      const updated = entries.filter(e => e.id !== id);
      setEntries(updated);
      localStorage.setItem('mileage_entries', JSON.stringify(updated));
    }
  };

  const handleUserStatusChange = (userId: number, newStatus: 'approved' | 'blocked') => {
    const updated = users.map(u => u.id === userId ? { ...u, status: newStatus } : u);
    setUsers(updated);
    localStorage.setItem('app_users', JSON.stringify(updated));
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const user = { ...newUser, id: Date.now(), status: 'approved' as const };
    const updated = [...users, user];
    setUsers(updated);
    localStorage.setItem('app_users', JSON.stringify(updated));
    setShowAddUserModal(false);
    setNewUser({ personalnummer: '', vorname: '', email: '', password: '' });
  };

  const handleUpdatePassword = (userId: number) => {
    const updated = users.map(u => u.id === userId ? { ...u, password: newPassword } : u);
    setUsers(updated);
    localStorage.setItem('app_users', JSON.stringify(updated));
    setEditingUserId(null);
    setNewPassword('');
  };

  const ReceiptTemplate = ({ entry }: { entry: Entry }) => (
    <div className="receipt-content bg-white text-black font-sans max-w-[21cm] mx-auto p-12 text-center" style={{ minHeight: '297mm', color: '#000' }}>
      <div className="flex flex-col items-center mb-10">
        <Logo className="h-24 mb-6" />
        <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2 text-black">KILOMETERERFASSUNG</h1>
        <p className="text-[11px] font-bold text-gray-600 uppercase tracking-widest leading-relaxed max-w-sm">
          Manuelle Erfassung von Kilometern ausserhalb des Linienverkehrs
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-10">
        <div className="border border-gray-300 rounded-2xl p-6 bg-gray-50 text-center">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Fahrdatum</span>
          <p className="text-xl font-black italic text-black">{new Date(entry.date).toLocaleDateString('de-CH', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="border border-gray-300 rounded-2xl p-6 bg-gray-50 text-center">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Wagen / Schild</span>
          <div className="flex flex-col items-center">
             <p className="text-xl font-black italic text-black uppercase">{entry.wagenNr}</p>
             <span className="mt-1 px-3 py-1 border border-gray-400 rounded-lg text-xs font-black italic text-black">{entry.zhNummer}</span>
          </div>
        </div>
      </div>

      <div className="mb-10 rounded-3xl border border-gray-300 overflow-hidden">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="bg-gray-100 text-[11px] font-black uppercase border-b border-gray-300">
              <th className="p-5 text-black">DIENST-VORGANG</th>
              <th className="p-5 text-black">MITARBEITER</th>
              <th className="p-5 text-black">ZÄHLERSTAND (KM)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 font-bold">
            <tr className="bg-white">
              <td className="p-6 italic text-black">Fahrzeug-Übernahme (91P)</td>
              <td className="p-6 italic text-black">{entry.createdBy}</td>
              <td className="p-6 tabular-nums text-2xl font-black text-black">{entry.kmStart.toLocaleString('de-CH')}</td>
            </tr>
            <tr className="bg-white">
              <td className="p-6 italic text-black">Fahrzeug-Abgabe (94P)</td>
              <td className="p-6 italic text-black">{entry.finalizedBy || '---'}</td>
              <td className="p-6 tabular-nums text-2xl font-black text-black">{entry.kmEnd ? entry.kmEnd.toLocaleString('de-CH') : '---'}</td>
            </tr>
            <tr className="bg-gray-50">
              <td colSpan={2} className="p-6 text-lg font-black italic uppercase text-black">Tagestotal Fahrleistung</td>
              <td className="p-6 font-black tabular-nums text-5xl tracking-tighter text-black">{entry.kmDiff} <span className="text-sm">km</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-10">
        <div className="border border-gray-300 p-6 rounded-2xl bg-gray-50 flex flex-col items-center justify-center">
           <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-3">ÜBERMITTLUNGS-STATUS</span>
           <div className="flex items-center gap-3 mb-3">
              <div className={`size-3 rounded-full ${entry.kmEnd ? 'bg-green-600' : 'bg-orange-500'}`}></div>
              <span className="text-lg font-black italic uppercase text-black">{entry.kmEnd ? 'VOLLSTÄNDIG ERFASST' : 'IN BEARBEITUNG'}</span>
           </div>
           <div className="w-full pt-3 border-t border-gray-300 flex justify-between text-[9px] font-bold text-gray-500 uppercase tracking-widest px-4">
              <span>SYSTEMZEITPUNKT</span>
              <span>{entry.createdTime || '---'}</span>
           </div>
        </div>
        <div className="flex flex-col items-center justify-center p-6 border border-gray-300 rounded-2xl">
          <p className="text-[9px] font-black text-gray-400 uppercase italic">AHW Busbetriebe AG | Freienbach</p>
          <p className="text-[7px] font-bold text-gray-300 mt-2 uppercase tracking-[0.2em]">Zentrale Kilometer-Revision</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f1f5f9] dark:bg-background-dark p-4 md:p-8">
      {showAddUserModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
            <h3 className="text-2xl font-black italic uppercase mb-6">Mitarbeiter Hinzufügen</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <input required className="w-full h-14 rounded-2xl border bg-slate-50 dark:bg-black/20 px-5 font-bold text-slate-900 dark:text-white" placeholder="Personalnummer" value={newUser.personalnummer} onChange={e => setNewUser({...newUser, personalnummer: e.target.value})} />
              <input required className="w-full h-14 rounded-2xl border bg-slate-50 dark:bg-black/20 px-5 font-bold text-slate-900 dark:text-white" placeholder="Vorname" value={newUser.vorname} onChange={e => setNewUser({...newUser, vorname: e.target.value})} />
              <input required className="w-full h-14 rounded-2xl border bg-slate-50 dark:bg-black/20 px-5 font-bold text-slate-900 dark:text-white" placeholder="Passwort" type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddUserModal(false)} className="flex-1 h-14 rounded-2xl border font-bold uppercase text-[10px] dark:text-white">Abbrechen</button>
                <button type="submit" className="flex-1 h-14 bg-primary text-white rounded-2xl font-black uppercase text-[10px]">Speichern</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewMode === 'receipt' && previewEntry && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl p-4 overflow-hidden shadow-2xl">
            <div className="flex justify-end p-4 gap-3 bg-slate-100/50 print:hidden">
              <button onClick={() => window.print()} className="bg-primary text-white px-6 h-12 rounded-xl font-black uppercase text-xs">DRUCKEN</button>
              <button onClick={() => setPreviewMode('none')} className="bg-slate-900 text-white px-6 h-12 rounded-xl font-black uppercase text-xs">Schliessen</button>
            </div>
            <div ref={receiptRef}><ReceiptTemplate entry={previewEntry} /></div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex items-center gap-6">
            <div className="size-16 bg-slate-900 flex items-center justify-center text-white rounded-2xl shadow-xl"><span className="material-symbols-outlined text-4xl">inventory_2</span></div>
            <div><Logo className="h-12 items-start" /><p className="text-[10px] font-black uppercase opacity-40 tracking-widest">Admin Dashboard</p></div>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <button onClick={loadExampleData} className="px-6 py-3 bg-amber-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:scale-105 transition-transform">Test-Daten importieren</button>
            <button onClick={() => navigate('/login')} className="px-6 py-3 border-2 rounded-xl font-black uppercase text-[10px] tracking-widest text-slate-500 dark:text-slate-400">Abmelden</button>
            <ThemeToggle />
          </div>
        </header>

        {/* Statistik Übersicht */}
        <div className="bg-white dark:bg-surface-dark p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-border-dark mb-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
           <div className="flex-1">
             <span className="text-[10px] font-black uppercase text-primary tracking-[0.3em] mb-2 block italic">Monats-Performance</span>
             <h2 className="text-3xl font-black italic uppercase tracking-tighter dark:text-white">{monthName}</h2>
             <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">Zentrale Auswertung aller Fahrten</p>
           </div>
           <div className="flex flex-col items-center md:items-end">
              <div className="text-5xl md:text-7xl font-black italic tracking-tighter text-primary">{totalKm.toLocaleString('de-CH')}</div>
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-[0.5em] mt-2 mr-2">Kilometer Total</div>
           </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex gap-4">
            <button onClick={() => setActiveTab('entries')} className={`px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === 'entries' ? 'bg-primary text-white shadow-lg' : 'bg-white dark:bg-surface-dark text-slate-400'}`}>Historie</button>
            <button onClick={() => setActiveTab('users')} className={`px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === 'users' ? 'bg-primary text-white shadow-lg' : 'bg-white dark:bg-surface-dark text-slate-400'}`}>Fahrerstamm</button>
          </div>
          <div className="flex items-center gap-4 bg-white dark:bg-surface-dark p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-border-dark">
             <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Auswahl Periode:</span>
             <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-transparent border-none font-black text-sm p-2 dark:text-white focus:ring-0 cursor-pointer" />
          </div>
        </div>

        {activeTab === 'entries' ? (
          <div className="grid gap-4">
            {filteredEntries.length === 0 ? (
              <div className="bg-white dark:bg-surface-dark p-20 text-center rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-border-dark text-slate-300 font-black uppercase tracking-widest italic">
                Keine Einträge für {monthName} gefunden
              </div>
            ) : (
              [...filteredEntries].reverse().map(e => (
                <div key={e.id} className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-slate-100 dark:border-border-dark flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-xl transition-all animate-in fade-in duration-500">
                  <div className="flex items-center gap-6">
                    <div className="size-16 bg-slate-50 dark:bg-black/20 rounded-xl flex flex-col items-center justify-center">
                      <span className="text-[9px] font-black uppercase opacity-40 dark:text-slate-400">{new Date(e.date).toLocaleDateString('de-CH', { month: 'short' })}</span>
                      <span className="text-2xl font-black italic dark:text-white">{new Date(e.date).getDate()}</span>
                    </div>
                    <div>
                      <p className="text-xl font-black uppercase italic dark:text-white">{e.wagenNr}</p>
                      <p className="text-xs font-bold text-primary italic">
                        {e.kmDiff} km • Von {e.createdBy}
                        {e.finalizedBy && e.finalizedBy !== e.createdBy ? ` (Abgabe: ${e.finalizedBy})` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => toggleVisum(e.id)} className={`size-12 rounded-xl border-2 flex items-center justify-center transition-all ${e.visum ? 'bg-green-500 border-green-500 text-white shadow-lg' : 'text-slate-200 border-slate-100 dark:border-slate-800'}`} title="Visum setzen"><span className="material-symbols-outlined font-black">verified</span></button>
                    <button onClick={() => {setPreviewEntry(e); setPreviewMode('receipt');}} className="size-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform" title="Beleg anzeigen"><span className="material-symbols-outlined">receipt_long</span></button>
                    <button onClick={() => handleDeleteEntry(e.id)} className="size-12 rounded-xl border border-red-100 text-red-300 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors" title="Eintrag löschen"><span className="material-symbols-outlined">delete</span></button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <button onClick={() => setShowAddUserModal(true)} className="mb-4 bg-slate-900 text-white px-8 h-14 rounded-2xl font-black uppercase text-xs flex items-center gap-2 shadow-xl active:scale-95 transition-all hover:bg-black"><span className="material-symbols-outlined text-sm">person_add</span> Mitarbeiter Hinzufügen</button>
            {users.map(u => (
              <div key={u.id} className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-slate-100 dark:border-border-dark flex items-center justify-between hover:shadow-lg transition-all">
                <div>
                  <p className="text-xl font-black uppercase italic dark:text-white">{u.vorname}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nr: {u.personalnummer} | {u.status}</p>
                </div>
                <div className="flex items-center gap-3">
                  {editingUserId === u.id ? (
                    <div className="flex gap-2 animate-in slide-in-from-right-2">
                      <input type="password" placeholder="Neues Passwort" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="h-10 border rounded-xl px-4 text-xs font-bold dark:bg-black/20 text-slate-900 dark:text-white outline-none focus:border-primary" />
                      <button onClick={() => handleUpdatePassword(u.id)} className="bg-green-500 text-white size-10 rounded-xl flex items-center justify-center"><span className="material-symbols-outlined text-sm">check</span></button>
                      <button onClick={() => setEditingUserId(null)} className="bg-slate-200 size-10 rounded-xl flex items-center justify-center"><span className="material-symbols-outlined text-sm">close</span></button>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => setEditingUserId(u.id)} className="h-10 px-4 border rounded-xl font-black uppercase text-[10px] flex items-center gap-2 dark:text-slate-400 hover:bg-slate-50 transition-colors"><span className="material-symbols-outlined text-sm">key</span> Passwort</button>
                      {u.status !== 'approved' && <button onClick={() => handleUserStatusChange(u.id, 'approved')} className="h-10 px-4 bg-primary text-white rounded-xl font-black uppercase text-[10px] hover:shadow-md">Freischalten</button>}
                      {u.status === 'approved' && <button onClick={() => handleUserStatusChange(u.id, 'blocked')} className="h-10 px-4 border border-red-200 text-red-500 rounded-xl font-black uppercase text-[10px] hover:bg-red-50 transition-colors">Sperren</button>}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`
        @media print {
          @page { size: portrait; margin: 0; }
          .print\\:hidden, header, footer, nav, button, input { display: none !important; }
          body { background: white !important; }
          .receipt-content { 
            width: 100% !important; 
            margin: 0 !important; 
            padding: 20mm !important; 
            text-align: center !important; 
            color: black !important;
          }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
};

export default Admin;
