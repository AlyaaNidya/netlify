import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, LayoutDashboard, BarChart2, UserPlus, 
  Settings, LogOut, Search, Bell, Activity, 
  Users, Clock, CheckCircle2, ChevronLeft, ChevronRight, Download, 
  Calendar, Video, Star, AlertTriangle, Sparkles, Save, Printer, Lock, X, Filter, FileText, Check, Link as LinkIcon
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Legend, Tooltip as RechartsTooltip 
} from 'recharts';

// --- MOCK DATA (Sudah diperbarui dengan field 'manualScore' dan 'manualTraits') ---
const initialCandidates = [
  { id: 1, name: 'Kartika Sari', email: 'kartika@example.com', phone: '0812-3456-7890', role: 'Admin Pabrik', date: '2026-05-24', status: 'DONE', 
    score: 86, manualScore: 82, zoomLink: 'https://zoom.us/j/111222333',
    traits: { adaptability: 85, creativity: 70, curiosity: 80, eq: 85, initiative: 90, resilience: 80, integrity: 100, motivation: 85, resolution: 75 },
    manualTraits: { adaptability: 80, creativity: 70, curiosity: 80, eq: 80, initiative: 90, resilience: 80, integrity: 90, motivation: 80, resolution: 80 }
  },
  { id: 2, name: 'Damai Sejahtera', email: 'damai@example.com', phone: '0812-9876-5432', role: 'Pelaksana Operator', date: '2026-05-25', status: 'WAITING', score: null, manualScore: null, zoomLink: 'https://zoom.us/j/444555666', traits: null, manualTraits: null },
  { id: 3, name: 'Budi Santoso', email: 'budi@example.com', phone: '0812-1111-2222', role: 'Pelaksana Operator', date: '2026-05-24', status: 'DONE', 
    score: 65, manualScore: 68, zoomLink: 'https://zoom.us/j/777888999', 
    traits: { adaptability: 65, creativity: 60, curiosity: 70, eq: 65, initiative: 60, resilience: 75, integrity: 80, motivation: 70, resolution: 65 },
    manualTraits: { adaptability: 70, creativity: 60, curiosity: 70, eq: 70, initiative: 60, resilience: 70, integrity: 80, motivation: 70, resolution: 70 }
  }
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
  const [manualScores, setManualScores] = useState({}); // STATE BARU: Untuk Penilaian Manual 1-10
  const [aiQuestions, setAiQuestions] = useState({});
  
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [pdfCandidate, setPdfCandidate] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  // --- FETCH KE NETLIFY FUNCTION: MURNI GENERATE QUESTION AI ---
  const handleGenerateAIQuestion = async () => {
    showToast(`AI Murni sedang merakit pertanyaan ${activeInterviewAspect}...`); 
    try {
      const response = await fetch('/.netlify/functions/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aspect: activeInterviewAspect, role: selectedCandidate.role })
      });
      const data = await response.json();
      
      setAiQuestions(prev => ({ ...prev, [activeInterviewAspect]: data.question })); 
    } catch (error) {
      showToast("Gagal terhubung ke Netlify Function AI.");
    }
  };

  // --- FETCH KE NETLIFY FUNCTION: MURNI CALCULATE SCORE AI ---
  const handleSubmitEvaluation = async () => {
    if(Object.keys(interviewAnswers).filter(k => interviewAnswers[k]?.trim() !== "").length < 9) { 
        return showToast('Harap isi seluruh 9 catatan jawaban kandidat.');
    }
    if(Object.keys(manualScores).length < 9) {
        return showToast('Harap berikan skor manual (1-10) untuk ke-9 aspek.');
    }
    
    showToast('AI Serverless sedang membaca teks jawaban dan menghitung skor objektif...');
    
    try {
        const response = await fetch('/.netlify/functions/analyze-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aspectWeights: aspectWeights, answers: interviewAnswers, role: selectedCandidate.role })
        });
        const data = await response.json();
        
        // Menghitung Rata-rata Tertimbang (Weighted) untuk Skor Manual HR
        let manualWeightedSum = 0; let manualTotalWeight = 0;
        const finalManualTraits = {};
        
        criteriaList.forEach(a => {
            const key = a === 'Emotional Intelligence' ? 'eq' : a.toLowerCase().replace(' ', '');
            const mScore = (manualScores[a] || 0) * 10; // Konversi skala 1-10 ke skala 0-100
            finalManualTraits[key] = mScore;
            
            const weight = aspectWeights[key] || 1;
            manualWeightedSum += (mScore * weight);
            manualTotalWeight += weight;
        });
        const finalManualScore = Math.round(manualWeightedSum / manualTotalWeight);

        // Update State Kandidat dengan 2 Skor (AI & Manual)
        setCandidates(candidates.map(c => c.id === selectedCandidate.id ? { 
            ...c, status: 'DONE', 
            score: data.score, traits: data.traits, // Nilai dari AI Backend
            manualScore: finalManualScore, manualTraits: finalManualTraits // Nilai Manual HR
        } : c )); 
        
        showToast('Analisis Berhasil Disimpan!'); 
        setTimeout(() => setRecruiterSubView('dashboard'), 1500); 
    } catch (error) {
        showToast('Gagal menghubungi backend serverless AI.');
    }
  };

  const handleExportPDF = () => { if (selectedCandidate) setPdfCandidate(selectedCandidate); };

  const handleAddCandidate = (newCandidate) => {
    setCandidates([{ ...newCandidate, id: Date.now(), status: 'WAITING', score: null, manualScore: null }, ...candidates]);
    setRecruiterSubView('dashboard');
    showToast('Kandidat Berhasil Ditambahkan');
  };

  const handleLogout = () => { setIsLoggedIn(false); setAuthRole(null); setCurrentView('landing'); };

  useEffect(() => {
    if (pdfCandidate) {
      showToast(`Menyiapkan laporan PDF ringkas untuk ${pdfCandidate.name}...`);
      setTimeout(() => {
        const element = document.getElementById('hidden-pdf-content');
        if (element) {
          const opt = { margin: 0, filename: `Laporan_IntegritAS_${pdfCandidate.name.replace(/\s+/g, '_')}.pdf`, image: { type: 'jpeg', quality: 1.0 }, html2canvas: { scale: 2, useCORS: true, scrollY: 0, scrollX: 0 }, jsPDF: { unit: 'px', format: [794, 1123], orientation: 'portrait' } };
          window.html2pdf().set(opt).from(element).save().then(() => {
            showToast('Dokumen PDF Ringkas berhasil diunduh!');
            setPdfCandidate(null);
          });
        }
      }, 1000); 
    }
  }, [pdfCandidate]);

  const LandingView = () => (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white p-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
      <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center mb-6 z-10"><ShieldCheck size={32} /></div>
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 z-10 text-center">Integrit<span className="text-indigo-500">AS.</span></h1>
      <p className="text-slate-400 max-w-2xl text-center mb-12 text-lg z-10">Platform Evaluasi Psikologis & Kepatuhan SOP Berbasis AI Terintegrasi.</p>
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl z-10">
        <button onClick={() => { setAuthRole('recruiter'); setCurrentView('login'); }} className="flex-1 bg-[#1e293b] p-8 rounded-3xl border border-slate-700/50 text-left hover:bg-[#27354f]">
          <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-6"><LayoutDashboard className="text-indigo-400" /></div>
          <h2 className="text-2xl font-bold mb-2">Portal Rekruter</h2>
          <p className="text-slate-400 text-sm">Kelola instrumen penilaian, jalankan wawancara tertimbang AI, dan bandingkan rekap nilai.</p>
        </button>
      </div>
    </div>
  );

  const LoginView = () => {
    const handleSubmit = (e) => { e.preventDefault(); setIsLoggedIn(true); setCurrentView(authRole); setRecruiterSubView('dashboard'); showToast(`Login berhasil`); };
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-[32px] max-w-md w-full">
          <button onClick={() => setCurrentView('landing')} className="flex items-center gap-1 text-xs font-bold text-slate-400 mb-6 uppercase"><ChevronLeft size={16}/> Kembali</button>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Email</label><input type="email" defaultValue="admin@integritas.com" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" /></div>
            <div><label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Password</label><input type="password" defaultValue="123456" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" /></div>
            <button type="submit" className="w-full text-white font-bold py-3.5 rounded-xl text-sm mt-4 bg-indigo-600 hover:bg-indigo-700">MASUK</button>
          </form>
        </div>
      </div>
    );
  };

  const RecruiterView = () => {
    const uniqueRoles = [...new Set(candidates.map(c => c.role.split('(')[0].trim()))];
    const filteredCandidates = candidates.filter(cand => {
      const candBaseRole = cand.role.split('(')[0].trim();
      return (filterRole === 'All' || candBaseRole === filterRole) && (filterStatus === 'All' || cand.status === filterStatus);
    });

    const renderAnalysisReport = (candidateData, isPDF = false) => {
       if (!candidateData) return null;
       const isRoleAdmin = candidateData.role.toLowerCase().includes('admin');
       const kesimpulanText = isRoleAdmin ? `"Kandidat teliti dan teratur. Profil psikologisnya cocok menangani data operasional."` : `"Kandidat disiplin dan patuh instruksi. Profilnya siap menghadapi ritme kerja lapangan."`;
       
       const aspectData = criteriaList.map(a => {
            const key = a === 'Emotional Intelligence' ? 'eq' : a.toLowerCase().replace(' ', '');
            const aiScore = candidateData.traits[key] || 0;
            const manScore = candidateData.manualTraits?.[key] || 0;
            const targetScore = standardTraits[key] || 0;
            const gapAI = aiScore - targetScore;
            
            let statusColor = gapAI >= 5 ? 'text-emerald-700 bg-emerald-50' : (gapAI < 0 ? 'text-amber-700 bg-amber-50' : 'text-blue-700 bg-blue-50');
            return { aspect: a, aiScore, manScore, targetScore, gapAI, statusColor };
        });

       return (
         <div id={isPDF ? "hidden-pdf-content" : "pdf-content"} className={isPDF ? 'w-[794px] h-[1123px] bg-white p-8 font-sans box-border text-slate-800' : 'max-w-4xl mx-auto space-y-4 pb-10 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100'}>
            
            {/* Header: Menampilkan 2 Skor Berdampingan */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 border border-slate-200 rounded-xl p-3 gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="bg-indigo-600 flex flex-col items-center justify-center text-white rounded-lg w-12 h-12 shrink-0"><span className="text-sm font-black leading-none">{candidateData.score}%</span><span className="text-[8px] font-bold uppercase opacity-80 mt-0.5">Skor AI</span></div>
                <div className="bg-purple-600 flex flex-col items-center justify-center text-white rounded-lg w-12 h-12 shrink-0"><span className="text-sm font-black leading-none">{candidateData.manualScore}%</span><span className="text-[8px] font-bold uppercase opacity-80 mt-0.5">Manual</span></div>
                <div className="ml-2"><h3 className="font-bold text-slate-800 text-lg leading-tight">{candidateData.name}</h3><p className="text-slate-500 text-xs font-medium">{candidateData.role}</p></div>
              </div>
              <div className="flex items-center gap-2">
                  <div className={`border rounded-lg px-3 py-1.5 flex items-center gap-1.5 shadow-sm ${candidateData.score >= 80 ? 'bg-emerald-100 border-emerald-200 text-emerald-800' : (candidateData.score >= 65 ? 'bg-amber-100 border-amber-200 text-amber-800' : 'bg-red-100 border-red-200 text-red-800')}`}>
                      <span className="text-[10px] font-bold uppercase">REKOMENDASI AI: {candidateData.score >= 80 ? 'HIRE' : (candidateData.score >= 65 ? 'CONSIDER' : 'REJECT')}</span>
                  </div>
              </div>
            </div>
            
            {/* Middle Section: Chart & Text */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="col-span-1 bg-white border border-slate-200 rounded-xl p-2 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={220}>
                      <RadarChart outerRadius={70} data={criteriaList.map(a => { const key = a === 'Emotional Intelligence' ? 'eq' : a.toLowerCase().replace(' ', ''); return { aspect: a, AI: (candidateData.traits[key] || 0)/10, Manual: (candidateData.manualTraits?.[key] || 0)/10, Target: (standardTraits[key] || 0)/10 }; })}>
                        <PolarGrid stroke="#e2e8f0" /><PolarAngleAxis dataKey="aspect" tick={{ fill: '#475569', fontSize: 8, fontWeight: 600 }} /><PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                        <Radar name="AI Objektif" dataKey="AI" stroke="#6366f1" strokeWidth={1.5} fill="#6366f1" fillOpacity={0.4} isAnimationActive={!isPDF} />
                        <Radar name="Manual HR" dataKey="Manual" stroke="#9333ea" strokeWidth={1.5} fill="#9333ea" fillOpacity={0.2} isAnimationActive={!isPDF} />
                        <Radar name="Target Posisi" dataKey="Target" stroke="#10b981" strokeWidth={1} fill="#10b981" fillOpacity={0} strokeDasharray="3 3" isAnimationActive={!isPDF} />
                        <Legend wrapperStyle={{fontSize: '9px'}}/>
                        <RechartsTooltip wrapperStyle={{fontSize: '10px'}}/>
                      </RadarChart>
                    </ResponsiveContainer>
                </div>
                <div className="col-span-1 lg:col-span-2 flex flex-col gap-3">
                    <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-3 h-full"><div className="text-[10px] font-bold text-indigo-700 uppercase mb-1">Kesimpulan Sistem AI</div><p className="text-slate-700 text-xs italic">"{kesimpulanText}"</p></div>
                </div>
            </div>

            {/* Tabel Perbandingan AI vs Manual */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-left text-xs"><thead className="bg-slate-100 text-[10px] uppercase text-slate-500"><tr><th className="px-3 py-2 font-bold">Aspek Evaluasi</th><th className="px-3 py-2 font-bold text-center">Skor AI</th><th className="px-3 py-2 font-bold text-center">Skor Manual</th><th className="px-3 py-2 font-bold text-center">Target</th><th className="px-3 py-2 font-bold text-center">Gap AI</th></tr></thead>
                    <tbody className="divide-y divide-slate-100">
                        {aspectData.map((data, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                                <td className="px-3 py-1.5 font-semibold text-slate-800">{data.aspect}</td>
                                <td className="px-3 py-1.5 text-center font-black text-indigo-600">{data.aiScore}</td>
                                <td className="px-3 py-1.5 text-center font-black text-purple-600">{data.manScore}</td>
                                <td className="px-3 py-1.5 text-center text-slate-400">{data.targetScore}</td>
                                <td className="px-3 py-1.5 text-center">
                                    <span className={`font-bold px-1.5 py-0.5 rounded ${data.statusColor}`}>{data.gapAI > 0 ? `+${data.gapAI}` : data.gapAI}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
         </div>
       );
    };

    return (
      <div className="flex flex-col md:flex-row h-screen bg-slate-50 text-slate-800 font-sans">
        <div className="w-full md:w-64 bg-[#0f172a] text-slate-300 flex flex-col md:h-full shrink-0">
          <div className="p-4 md:p-6 flex items-center gap-3 cursor-pointer" onClick={handleLogout}><div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center"><ShieldCheck size={20} className="text-white" /></div><span className="text-xl font-bold text-white">IntegritAS</span></div>
          <div className="flex-row md:flex-col flex flex-1 px-4 py-2 md:py-6 gap-2 border-b border-slate-800">
            <button onClick={() => setRecruiterSubView('dashboard')} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${recruiterSubView === 'dashboard' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}><LayoutDashboard size={20} /><span className="font-medium text-sm">Dashboard</span></button>
            <button onClick={() => setRecruiterSubView('add')} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${recruiterSubView === 'add' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}><UserPlus size={20} /><span className="font-medium text-sm">Add Candidate</span></button>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <header className="h-16 md:h-20 bg-white border-b border-slate-100 flex items-center px-4 md:px-8 shrink-0">
            <h2 className="text-lg md:text-xl font-extrabold text-slate-800 flex items-center">
              {recruiterSubView === 'analyticsDetail' && (<button onClick={() => setRecruiterSubView('dashboard')} className="p-1 hover:bg-slate-100 rounded-full mr-2"><ChevronLeft size={24} /></button>)}
              {recruiterSubView === 'interview' && (<button onClick={() => setRecruiterSubView('dashboard')} className="p-1 hover:bg-slate-100 rounded-full mr-2"><ChevronLeft size={24} /></button>)}
              {recruiterSubView === 'dashboard' ? 'Overview Dashboard' : recruiterSubView === 'add' ? 'Add Candidate' : recruiterSubView === 'interview' ? 'Sesi Interview AI' : 'Detail Analisis'}
            </h2>
          </header>
          
          <main className="flex-1 overflow-auto p-4 md:p-8 bg-slate-50 relative print:p-0 print:bg-white print:overflow-visible">
            {toast && (<div className="fixed bottom-4 right-4 bg-slate-800 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50"><CheckCircle2 className="text-emerald-400" size={24} /><span className="font-medium text-sm">{toast}</span></div>)}
            
            {recruiterSubView === 'dashboard' && (
              <div className="max-w-6xl mx-auto space-y-6">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mt-6">
                  <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-800">Antrean Wawancara</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                      <thead><tr className="text-[10px] font-bold text-slate-400 border-b bg-white"><th className="p-4">KANDIDAT</th><th className="p-4">POSISI</th><th className="p-4">ZOOM LINK</th><th className="p-4">STATUS</th><th className="p-4 text-center">AKSI</th></tr></thead>
                      <tbody>
                        {filteredCandidates.map(cand => (
                          <tr key={cand.id} className="border-b border-slate-50 hover:bg-slate-50/80">
                            <td className="p-4"><div className="font-bold text-slate-800">{cand.name}</div></td>
                            <td className="p-4 text-sm text-slate-600">{cand.role}</td>
                            <td className="p-4">{cand.zoomLink ? <a href={cand.zoomLink} target="_blank" className="flex items-center gap-1 text-indigo-500 hover:text-indigo-700 text-xs font-bold"><LinkIcon size={12}/> Link Zoom</a> : '-'}</td>
                            <td className="p-4">{cand.status === 'WAITING' ? <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase">Waiting</span> : <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase">Done</span>}</td>
                            <td className="p-4 flex justify-center gap-2">
                              {cand.status === 'WAITING' ? 
                                <button onClick={() => { setSelectedCandidate(cand); setRecruiterSubView('interview'); setInterviewAnswers({}); setManualScores({}); setAiQuestions({}); setActiveInterviewAspect('Adaptability'); }} className="bg-white border text-slate-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 flex items-center gap-2"><Activity size={14} /> Analyze</button> :
                                <>
                                  <button onClick={() => { setSelectedCandidate(cand); setRecruiterSubView('analyticsDetail'); }} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold">Lihat Hasil</button>
                                  {/* TOMBOL CETAK PDF DITAMBAHKAN DI SINI */}
                                  <button onClick={() => setPdfCandidate(cand)} className="bg-white border border-slate-200 text-indigo-600 p-2 rounded-xl hover:bg-indigo-50" title="Download PDF"><FileText size={16} /></button>
                                </>
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {recruiterSubView === 'add' && (
              <div className="max-w-3xl mx-auto bg-white rounded-3xl border shadow-sm p-6 md:p-8">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Tambah Kandidat & Jadwal</h3>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target); handleAddCandidate({ name: fd.get('name'), email: fd.get('email'), phone: fd.get('phone'), role: fd.get('role'), date: fd.get('date'), zoomLink: fd.get('zoomLink') }); }}>
                  <div><label className="block text-xs font-bold text-slate-500 mb-2">NAMA LENGKAP</label><input name="name" required type="text" className="w-full bg-slate-50 border rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-indigo-500 text-sm" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-bold text-slate-500 mb-2">EMAIL</label><input name="email" required type="email" className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm" /></div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-2">POSISI</label><select name="role" className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm"><option>Pelaksana Operator</option><option>Admin Pabrik</option></select></div>
                    <div className="col-span-2"><label className="block text-xs font-bold text-slate-500 mb-2">LINK ZOOM</label><input name="zoomLink" type="url" className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm" /></div>
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl mt-6 text-sm">SIMPAN & JADWALKAN</button>
                </form>
              </div>
            )}

            {recruiterSubView === 'analyticsDetail' && renderAnalysisReport(selectedCandidate, false)}

            {recruiterSubView === 'interview' && selectedCandidate && (
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 pb-20">
                <div className="w-full md:w-1/3 lg:w-1/4 bg-white rounded-3xl border p-4 shrink-0 h-fit">
                  <div className="flex flex-col gap-2">
                    {criteriaList.map((criteria) => (
                      <button key={criteria} onClick={() => setActiveInterviewAspect(criteria)} className={`text-left px-4 py-3 rounded-2xl font-bold text-sm flex justify-between ${ activeInterviewAspect === criteria ? 'bg-indigo-500 text-white' : 'bg-slate-50 text-slate-600' }`}>
                          <span>{criteria}</span>
                          {manualScores[criteria] && <span className="bg-white/20 px-2 rounded-full text-xs">{manualScores[criteria]}/10</span>}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 space-y-6">
                  <div className="bg-slate-900 rounded-[32px] p-6 text-white">
                    <div className="flex justify-between text-sm font-bold mb-3 text-slate-400"><span>Progress Catatan</span><span className="text-indigo-400">{Object.keys(interviewAnswers).filter(k => interviewAnswers[k]?.trim() !== "").length} / 9</span></div>
                    <div className="flex justify-between text-sm font-bold mb-5 text-slate-400"><span>Progress Penilaian Manual</span><span className="text-purple-400">{Object.keys(manualScores).length} / 9</span></div>
                    <button onClick={handleSubmitEvaluation} className={`w-full py-3 rounded-xl font-bold text-sm ${ Object.keys(interviewAnswers).filter(k => interviewAnswers[k]?.trim() !== "").length === 9 && Object.keys(manualScores).length === 9 ? 'bg-indigo-500 text-white hover:bg-indigo-600' : 'bg-slate-700 text-slate-400' }`}>SIMPAN SKOR MANUAL & JALANKAN AI</button>
                  </div>
                  
                  <div className="bg-white rounded-3xl border p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div><h2 className="text-2xl font-black text-slate-800">{activeInterviewAspect}</h2></div>
                      {/* TOMBOL AI MURNI (Call ke Netlify Functions) */}
                      <button onClick={handleGenerateAIQuestion} className="bg-purple-50 text-purple-600 px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-xs hover:bg-purple-100"><Sparkles size={16} /> Generate Pertanyaan AI</button>
                    </div>

                    {/* Area Pertanyaan AI Muncul Disini */}
                    {aiQuestions[activeInterviewAspect] && (
                        <div className="mb-4 bg-purple-50 border border-purple-200 text-purple-800 p-4 rounded-2xl text-sm font-medium leading-relaxed">
                            <div className="flex items-center gap-2 mb-2 text-purple-600 font-bold text-[10px] uppercase"><Sparkles size={12} /> Dihasilkan oleh Gemini AI</div>
                            {aiQuestions[activeInterviewAspect]}
                        </div>
                    )}

                    <textarea className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[24px] min-h-[160px] outline-none text-sm focus:border-indigo-300" placeholder="Ketik jawaban kandidat di sini untuk dianalisis oleh AI nanti..." value={interviewAnswers[activeInterviewAspect] || ''} onChange={(e) => setInterviewAnswers({...interviewAnswers, [activeInterviewAspect]: e.target.value})} />
                    
                    {/* BAGIAN BARU: SISTEM PENILAIAN MANUAL & PANDUAN OBJEKTIF */}
                    <div className="mt-8 border-t border-slate-100 pt-6">
                       <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2"><Users size={16} className="text-purple-600"/> Skor Manual Rekruter (Skala 1 - 10)</h4>
                       <div className="flex flex-wrap gap-2 mb-4 mt-3">
                           {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                               <button key={num} onClick={() => setManualScores({...manualScores, [activeInterviewAspect]: num})} className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${manualScores[activeInterviewAspect] === num ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30 -translate-y-1' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                   {num}
                               </button>
                           ))}
                       </div>
                       
                       {/* PANDUAN PENILAIAN */}
                       <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 mt-2">
                           <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1"><AlertTriangle size={12}/> Panduan Penilaian Objektif HR</div>
                           <ul className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
                               <li><strong className="text-slate-800">Skor 1 - 3:</strong> Jawaban sangat buruk, tidak relevan, berbelit-belit, dan gagal menunjukkan kompetensi aspek terkait.</li>
                               <li><strong className="text-slate-800">Skor 4 - 6:</strong> Cukup. Menjawab poin utama namun kurang kedalaman, kurang bukti nyata dari pengalaman masa lalu.</li>
                               <li><strong className="text-slate-800">Skor 7 - 8:</strong> Baik. Mampu memberikan contoh konkret (Metode STAR), logis, dan relevan dengan budaya kerja.</li>
                               <li><strong className="text-slate-800">Skor 9 - 10:</strong> Sangat Luar Biasa. Pemecahan masalah yang brilian, bukti tindakan yang sangat terstruktur dan membawa dampak besar.</li>
                           </ul>
                       </div>
                    </div>

                  </div>
                </div>
              </div>
            )}
          </main>

          <div style={{ position: 'absolute', left: '-9999px', top: '0', zIndex: -10 }}>
            {pdfCandidate && renderAnalysisReport(pdfCandidate, true)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {currentView === 'landing' && <LandingView />}
      {currentView === 'login' && <LoginView />}
      {isLoggedIn && currentView === 'recruiter' && <RecruiterView />}
    </>
  );
}