import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, LayoutDashboard, BarChart2, UserPlus, 
  Settings, LogOut, Search, Bell, Activity, 
  Users, Clock, CheckCircle2, ChevronLeft, Download, 
  Calendar, Video, Star, AlertTriangle, Sparkles, Save, Printer, Lock
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Legend, Tooltip as RechartsTooltip 
} from 'recharts';
import html2pdf from 'html2pdf.js';

const interviewQuestionBank = {
  'Adaptability': { operator: ["Kalau kamu tiba-tiba dipindah ke area produksi..."], admin: ["Kalau pabrik tiba-tiba mengganti program komputer..."] },
  'Creativity': { operator: ["Saat sedang mengejar target produksi, tiba-tiba bahan baku di mejamu habis..."], admin: ["Kalau kamu harus merekap ratusan lembar bon kertas..."] },
  'Curiosity': { operator: ["Kerja produksi menuntut kita hafal cara kerja banyak mesin..."], admin: ["Saat sedang membuat data di komputer, apakah kamu suka mencari tahu rumus..."] },
  'Emotional Intelligence': { operator: ["Di area pabrik itu biasanya bising..."], admin: ["Kalau ada sopir truk pengiriman atau orang lapangan yang marah-marah..."] },
  'Initiative': { operator: ["Kalau target kuota kerjamu hari ini kebetulan sudah beres..."], admin: ["Kalau semua data hari ini sudah kamu masukkan ke sistem..."] },
  'Resilience': { operator: ["Kerja produksi mengharuskan kamu berdiri lama..."], admin: ["Menjadi admin berarti harus betah menatap layar komputer..."] },
  'Integrity': { operator: ["Kalau kamu tidak sengaja menjatuhkan barang produksi..."], admin: ["Kalau ternyata jumlah barang fisik di gudang dengan catatan di komputermu tidak sama..."] },
  'Motivation': { operator: ["Selain karena butuh penghasilan..."], admin: ["Menurutmu, apa yang membuat pekerjaan administrasi itu menarik..."] },
  'Resolution': { operator: ["Bel tanda pulang sudah berbunyi..."], admin: ["Sudah waktunya pulang kantor, tapi laporan pengeluaran harian..."] }
};

const initialCandidates = [
  { id: 1, name: 'Kartika Sari', email: 'kartika@example.com', phone: '0812-3456-7890', role: 'Admin Pabrik', date: '2026-05-24', status: 'DONE', score: 86, traits: { adaptability: 85, creativity: 70, curiosity: 80, eq: 85, initiative: 90, resilience: 80, integrity: 100, motivation: 85, resolution: 75 } },
  { id: 2, name: 'Damai Sejahtera', email: 'damai@example.com', phone: '0812-9876-5432', role: 'Pelaksana Operator', date: '2026-05-25', status: 'WAITING', score: null, traits: null }
];
const initialStandardTraits = { adaptability: 80, creativity: 75, curiosity: 75, eq: 80, initiative: 80, resilience: 85, integrity: 95, motivation: 80, resolution: 80 };
const initialAspectWeights = { adaptability: 3, creativity: 2, curiosity: 2, eq: 4, initiative: 3, resilience: 4, integrity: 5, motivation: 3, resolution: 3 };
const criteriaList = ['Adaptability', 'Creativity', 'Curiosity', 'Emotional Intelligence', 'Initiative', 'Resilience', 'Integrity', 'Motivation', 'Resolution'];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authRole, setAuthRole] = useState(null); 
  const [currentView, setCurrentView] = useState('landing');
  const [recruiterSubView, setRecruiterSubView] = useState('dashboard');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidates, setCandidates] = useState(initialCandidates);
  const [standardTraits, setStandardTraits] = useState(initialStandardTraits);
  const [aspectWeights, setAspectWeights] = useState(initialAspectWeights);
  const [toast, setToast] = useState(null);

  const [activeInterviewAspect, setActiveInterviewAspect] = useState('Adaptability');
  const [interviewAnswers, setInterviewAnswers] = useState({});
  const [selectedQuestions, setSelectedQuestions] = useState({});
  const [aiQuestions, setAiQuestions] = useState({});

  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleExportPDF = () => {
    const element = document.getElementById('pdf-content');
    if (!element) return;
    showToast('Menyiapkan file PDF...');
    const opt = { margin: 0.2, filename: `Laporan_${selectedCandidate?.name}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' } };
    const btn = document.getElementById('btn-export-pdf');
    const originalDisplay = btn ? btn.style.display : '';
    if (btn) btn.style.display = 'none';
    html2pdf().set(opt).from(element).save().then(() => { if (btn) btn.style.display = originalDisplay; showToast('PDF berhasil diunduh!'); });
  };

  const handleDownloadCSV = () => { /* implementation */ showToast('Berhasil mengunduh Data CSV!'); };
  const handleAddCandidate = (newCandidate) => { setCandidates([...candidates, { ...newCandidate, id: Date.now(), status: 'WAITING', score: null }]); setRecruiterSubView('dashboard'); showToast('Kandidat test Berhasil Ditambahkan'); };
  const handleLogout = () => { setIsLoggedIn(false); setAuthRole(null); setCurrentView('landing'); };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* LANDING & LOGIN */}
      {currentView === 'landing' && (
        <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white p-6 relative">
          <ShieldCheck size={48} className="text-indigo-500 mb-4" />
          <h1 className="text-4xl font-extrabold mb-8">Integrit<span className="text-indigo-500">AS</span></h1>
          <div className="flex gap-4">
            <button onClick={() => { setAuthRole('recruiter'); setCurrentView('login'); }} className="p-6 bg-slate-800 rounded-xl font-bold hover:bg-slate-700">Portal Rekruter</button>
            <button onClick={() => { setAuthRole('candidate'); setCurrentView('login'); }} className="p-6 bg-slate-800 rounded-xl font-bold hover:bg-slate-700">Portal Kandidat</button>
          </div>
        </div>
      )}

      {currentView === 'login' && (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
          <form onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); setCurrentView(authRole); setRecruiterSubView('dashboard'); }} className="bg-white p-8 rounded-2xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Login {authRole}</h3>
            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl mt-4">MASUK</button>
          </form>
        </div>
      )}

      {/* RECRUITER VIEW */}
      {isLoggedIn && currentView === 'recruiter' && (
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar Minimal */}
          <div className="w-64 bg-slate-900 text-white flex flex-col p-4">
            <h2 className="text-xl font-bold mb-8">IntegritAS Dashboard</h2>
            <button onClick={() => setRecruiterSubView('dashboard')} className="text-left mb-4 font-bold">Dashboard</button>
            <button onClick={() => setRecruiterSubView('analyticsList')} className="text-left mb-4 font-bold">Analytics</button>
            <button onClick={handleLogout} className="mt-auto text-left font-bold text-red-400">Logout</button>
          </div>

          <div className="flex-1 overflow-auto p-8 relative">
            {toast && (<div className="fixed bottom-4 right-4 bg-slate-800 text-white px-4 py-3 rounded-xl shadow-xl z-50">{toast}</div>)}
            
            {recruiterSubView === 'dashboard' && (
              <div>
                 <h2 className="text-2xl font-bold mb-6">Daftar Kandidat</h2>
                 {candidates.map(cand => (
                   <div key={cand.id} className="bg-white p-4 rounded-xl mb-4 shadow flex justify-between items-center">
                     <div><p className="font-bold">{cand.name}</p><p className="text-sm text-gray-500">{cand.role}</p></div>
                     {cand.status === 'WAITING' ? 
                       <button onClick={() => { setSelectedCandidate(cand); setRecruiterSubView('interview'); }} className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-bold">Interview AI</button> :
                       <button onClick={() => { setSelectedCandidate(cand); setRecruiterSubView('analyticsDetail'); }} className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg font-bold">Lihat Hasil</button>
                     }
                   </div>
                 ))}
              </div>
            )}

            {recruiterSubView === 'analyticsDetail' && selectedCandidate && (
              <div id="pdf-content" className="bg-white p-8 rounded-3xl shadow">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold">Laporan AI: {selectedCandidate.name}</h2>
                  <button id="btn-export-pdf" onClick={handleExportPDF} className="bg-slate-900 text-white px-4 py-2 rounded-lg">Export PDF</button>
                </div>
                <h3 className="text-2xl font-bold text-indigo-600 mb-4">FIT SCORE: {selectedCandidate.score}%</h3>
                <button onClick={() => setRecruiterSubView('dashboard')} className="mt-8 text-indigo-600 font-bold">Kembali</button>
              </div>
            )}

            {recruiterSubView === 'interview' && selectedCandidate && (
              <div className="flex gap-6">
                <div className="w-1/4 bg-white p-4 rounded-2xl shadow">
                  {criteriaList.map(c => (
                    <button key={c} onClick={() => setActiveInterviewAspect(c)} className={`block w-full text-left p-3 rounded-lg mb-2 ${activeInterviewAspect === c ? 'bg-indigo-500 text-white' : 'bg-slate-50'}`}>{c}</button>
                  ))}
                </div>
                
                <div className="flex-1 bg-white p-8 rounded-2xl shadow">
                  <h2 className="text-2xl font-bold mb-6">{activeInterviewAspect}</h2>
                  
                  {/* GENERATE AI QUESTION */}
                  <button 
                    disabled={isGenerating}
                    onClick={async () => { 
                      setIsGenerating(true);
                      showToast(`AI sedang menganalisis posisi ${selectedCandidate.role}...`); 
                      try {
                        const response = await fetch('/.netlify/functions/generate-question', {
                          method: 'POST',
                          body: JSON.stringify({ role: selectedCandidate.role, aspect: activeInterviewAspect })
                        });
                        const data = await response.json();
                        if(data.question) {
                          setAiQuestions(prev => ({ ...prev, [activeInterviewAspect]: data.question })); 
                          setSelectedQuestions(prev => ({ ...prev, [activeInterviewAspect]: data.question }));
                        }
                      } catch(err) { showToast('Gagal terhubung ke AI.'); }
                      finally { setIsGenerating(false); }
                    }} 
                    className="mb-4 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                  >
                    <Sparkles size={16} /> {isGenerating ? 'Memproses AI...' : 'Generate AI Question'}
                  </button>

                  <div className="mb-6">
                    {aiQuestions[activeInterviewAspect] && (
                       <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 mb-4">{aiQuestions[activeInterviewAspect]}</div>
                    )}
                  </div>

                  <textarea 
                    className="w-full p-4 border rounded-xl h-40 mb-4" 
                    placeholder="Catat jawaban kandidat di sini..."
                    value={interviewAnswers[activeInterviewAspect] || ''}
                    onChange={e => setInterviewAnswers({...interviewAnswers, [activeInterviewAspect]: e.target.value})}
                  />
                  
                  {/* AI ANALYZE */}
                  <button 
                    disabled={isAnalyzing || Object.keys(interviewAnswers).filter(k => interviewAnswers[k]?.trim() !== "").length < 9}
                    onClick={async () => { 
                      if(Object.keys(interviewAnswers).filter(k => interviewAnswers[k]?.trim() !== "").length === 9) { 
                        setIsAnalyzing(true);
                        showToast('AI sedang menganalisis seluruh jawaban...'); 
                        try {
                          const response = await fetch('/.netlify/functions/analyze-score', {
                            method: 'POST',
                            body: JSON.stringify({ role: selectedCandidate.role, answers: interviewAnswers })
                          });
                          const generatedTraits = await response.json();
                          let weightedSum = 0, totalWeight = 0;
                          criteriaList.forEach(a => {
                            const key = a === 'Emotional Intelligence' ? 'eq' : a.toLowerCase().replace(' ', '');
                            const aiScore = generatedTraits[key] || 70;
                            const weight = aspectWeights[key] || 1;
                            weightedSum += (aiScore * weight);
                            totalWeight += weight;
                          });
                          const finalWeightedScore = Math.round(weightedSum / totalWeight);
                          setCandidates(candidates.map(c => c.id === selectedCandidate.id ? { ...c, status: 'DONE', score: finalWeightedScore, traits: generatedTraits } : c )); 
                          showToast('Analisis Selesai!');
                          setTimeout(() => setRecruiterSubView('dashboard'), 1500); 
                        } catch (err) { showToast('Gagal memproses data dengan AI.'); } 
                        finally { setIsAnalyzing(false); }
                      }
                    }} 
                    className={`w-full py-4 rounded-xl font-bold text-white ${ Object.keys(interviewAnswers).filter(k => interviewAnswers[k]?.trim() !== "").length === 9 ? 'bg-indigo-600' : 'bg-slate-400' }`}
                  >
                    {isAnalyzing ? 'MENJALANKAN ANALITIK AI...' : 'JALANKAN ANALISIS AI (TERTIMBANG)'}
                  </button>
                  <p className="text-xs text-center mt-2 text-slate-500">AI hanya bisa dijalankan jika ke-9 aspek telah dijawab.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}