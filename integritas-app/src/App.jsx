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

// --- DATA BANK PERTANYAAN DINAMIS ---
const interviewQuestionBank = {
  'Adaptability': {
    operator: [
      "Kalau kamu tiba-tiba dipindah ke area produksi atau memegang mesin yang belum pernah kamu kerjakan sebelumnya, apa yang akan kamu lakukan pertama kali?",
      "Pernahkah kamu mendapat giliran shift malam padahal biasanya bekerja di shift pagi? Bagaimana caramu membiasakan kondisi badanmu?",
      "Kalau ada mandor atau kepala regu baru yang gaya kerjanya sangat berbeda dengan mandor lamamu, bagaimana caramu menyesuaikan diri dengan aturan barunya?"
    ],
    admin: [
      "Kalau pabrik tiba-tiba mengganti program komputer atau format laporan Excel dengan yang baru, apa yang akan kamu lakukan supaya cepat paham?",
      "Biasanya kamu mendata barang keluar, tapi hari ini tiba-tiba diminta menggantikan teman yang sakit untuk mengecek barang masuk di gudang. Bagaimana tanggapanmu?",
      "Pernahkah kamu dipindah meja kerja atau digabung satu ruangan dengan tim dari divisi lain? Bagaimana caramu berbaur dan berkomunikasi dengan mereka?"
    ]
  },
  'Creativity': {
    operator: [
      "Saat sedang mengejar target produksi, tiba-tiba bahan baku di mejamu habis dan petugas suplai sedang tidak ada. Apa akalmu supaya pekerjaanmu tidak berhenti lama?",
      "Pernahkah kamu menemukan cara atau posisimu sendiri supaya tugas menyortir/mengemas barang bisa selesai lebih cepat dari teman-temanmu tapi tetap rapi?",
      "Kalau mesin/alat kerjamu agak macet sedikit (bukan rusak parah) dan teknisi sedang sibuk, apa yang biasanya kamu lakukan agar bisa tetap bekerja dengan aman?"
    ],
    admin: [
      "Kalau kamu harus merekap ratusan lembar bon kertas tapi waktunya sangat mepet, adakah cara atau urutan kerja yang kamu buat sendiri supaya lebih cepat selesai?",
      "Pernahkah kamu kesulitan mencari satu lembar dokumen penting di antara tumpukan kertas yang berantakan? Bagaimana caramu mencarinya dengan cepat?",
      "Tiba-tiba printer rusak padahal atasan sangat butuh laporan fisik saat itu juga. Apa jalan keluar yang bisa kamu tawarkan?"
    ]
  },
  'Curiosity': {
    operator: [
      "Kerja produksi menuntut kita hafal cara kerja banyak mesin dan alat. Waktu baru pertama kali diajari, bagian apa yang biasanya paling ingin kamu pelajari duluan?",
      "Kalau melihat teman kerjamu memakai alat bantu yang belum kamu tahu fungsinya, apakah kamu biasa bertanya atau membiarkannya saja? Kenapa?",
      "Pernahkah kamu mencari tahu, sebenarnya barang yang kamu proses ini nantinya akan dikirim ke mana atau digunakan untuk apa oleh pembeli?"
    ],
    admin: [
      "Saat sedang membuat data di komputer, apakah kamu suka mencari tahu rumus atau tombol cepat (shortcut) baru supaya kerjamu lebih enak?",
      "Kalau ada istilah aneh atau singkatan di surat jalan yang belum kamu pahami, kepada siapa dan bagaimana caramu bertanyanya?",
      "Pernahkah kamu mencoba belajar sendiri cara membuat tabel atau pembukuan yang lebih rapi, padahal atasanmu tidak menyuruhnya?"
    ]
  },
  'Emotional Intelligence': {
    operator: [
      "Di area pabrik itu biasanya bising dan mandor kadang bicara dengan nada tinggi/berteriak karena pusing mengejar target. Bagaimana sikapmu saat ditegur dengan keras?",
      "Waktu badanmu sudah sangat capek, tiba-tiba teman regumu bekerja sangat lambat sehingga tugasmu ikut terhambat. Bagaimana caramu menegurnya tanpa bikin keributan?",
      "Pernahkah kamu ditegur karena hasil barangmu dibilang cacat, padahal kamu yakin sudah bekerja dengan benar? Bagaimana caramu menjawabnya?"
    ],
    admin: [
      "Kalau ada sopir truk pengiriman atau orang lapangan yang marah-marah minta surat jalan cepat dicetak padahal kamu sedang merekap data lain, apa yang kamu lakukan?",
      "Pernahkah atasan menyuruhmu mengetik ulang laporan sampai tiga kali karena ada format yang salah terus? Bagaimana perasaanmu saat itu dan apa yang kamu lakukan?",
      "Saat kamu sedang butuh konsentrasi menghitung angka, teman-teman di ruangan malah bercanda dan berisik. Bagaimana caramu memberitahu mereka agar tenang?"
    ]
  },
  'Initiative': {
    operator: [
      "Kalau target kuota kerjamu hari ini kebetulan sudah beres, tapi jam pulang pabrik masih setengah jam lagi, apa yang biasanya akan kamu kerjakan?",
      "Saat berjalan ke area istirahat, kamu melihat genangan oli atau air di lantai yang bisa bikin orang terpeleset. Padahal itu area kebersihan, apa yang kamu lakukan?",
      "Teman di sebelahmu terlihat sangat kewalahan karena barangnya menumpuk, sedangkan mejamu sudah kosong. Apakah kamu akan membantunya? Kenapa?"
    ],
    admin: [
      "Kalau semua data hari ini sudah kamu masukkan ke sistem dan atasan belum memberi tugas baru, biasanya apa yang kamu lakukan di mejamu?",
      "Kamu melihat tumpukan map lama berdebu dan tidak beraturan di lemari kantor. Padahal merapikan lemari bukan tugas utamamu, apa yang akan kamu lakukan?",
      "Sebelum menyerahkan hasil print-out laporan ke atasan, apakah kamu punya kebiasaan mengecek ulang angka-angkanya walau tidak disuruh?"
    ]
  },
  'Resilience': {
    operator: [
      "Kerja produksi mengharuskan kamu berdiri lama dan mengulang gerakan tangan yang sama ribuan kali dari pagi ke sore. Bagaimana caramu agar tidak gampang lelah atau bosan?",
      "Kalau target pabrik hari ini sangat tinggi dan mengharuskan kamu lembur mendadak padahal badan sudah lumayan pegal, bagaimana tanggapanmu?",
      "Pernahkah kamu merasa sangat lelah dan sebenarnya ingin izin tidak masuk, tapi akhirnya tetap berangkat kerja? Apa yang membuatmu tetap berangkat?"
    ],
    admin: [
      "Menjadi admin berarti harus betah menatap layar komputer dan memelototi angka-angka berjam-jam. Bagaimana caramu menjaga mata dan pikiran agar tidak mengantuk atau pusing?",
      "Saat akhir bulan (tutup buku), biasanya banyak tagihan yang harus dibereskan sampai harus lembur malam di kantor. Apakah kamu siap menghadapi rutinitas seperti ini?",
      "Kalau ada tumpukan berkas setinggi meja yang harus di-input datanya dalam waktu 2 hari, bagaimana caramu menjaga konsentrasi agar tidak ada angka yang terlewat?"
    ]
  },
  'Integrity': {
    operator: [
      "Kalau kamu tidak sengaja menjatuhkan barang produksi sampai rusak, tapi kebetulan tidak ada pengawas yang melihat, apa yang akan kamu lakukan?",
      "Teman akrabmu mengajak mematikan sensor mesin atau melepas helm/masker pelindung supaya bisa bekerja lebih leluasa. Apa tindakanmu?",
      "Kalau kamu tanpa sengaja melihat temanmu diam-diam membawa pulang barang sisa pabrik ke dalam tasnya, apa yang akan kamu lakukan?"
    ],
    admin: [
      "Kalau ternyata jumlah barang fisik di gudang dengan catatan di komputermu tidak sama (selisih), apakah kamu akan jujur melapor atau mengubah angka di komputer secara diam-diam agar cocok?",
      "Teman akrabmu datang telat dan mengirim pesan agar kamu memalsukan jam absensinya di buku depan. Apa balasan yang akan kamu berikan kepadanya?",
      "Pernahkah kamu salah mengetik jumlah barang yang dipesan pembeli sehingga perusahaan hampir rugi? Apa yang kamu lakukan seketika setelah sadar ada kesalahan itu?"
    ]
  },
  'Motivation': {
    operator: [
      "Selain karena butuh penghasilan, adakah alasan lain mengapa kamu tertarik bekerja sebagai operator di pabrik kami dibanding bekerja di tempat lain?",
      "Pekerjaan lapangan ini sangat menguras keringat. Apa yang biasanya ada di pikiranmu supaya kamu tetap semangat berangkat dari rumah setiap hari?",
      "Apa harapan atau target pribadimu dari hasil gajimu bekerja sebagai operator di sini untuk beberapa tahun ke depan?"
    ],
    admin: [
      "Menurutmu, apa yang membuat pekerjaan administrasi itu menarik atau membuatmu betah, padahal kerjanya hanya duduk di depan komputer setiap hari?",
      "Pekerjaan admin itu kadang jarang terlihat hasilnya oleh orang lapangan, tapi datanya sangat penting. Apa yang membuatmu bangga bisa mengerjakan posisi ini?",
      "Selama menjadi bagian administrasi nanti, apakah kamu punya target keahlian tertentu yang ingin kamu capai? (Misalnya: ingin lancar rumus Excel, dsb)."
    ]
  },
  'Resolution': {
    operator: [
      "Bel tanda pulang sudah berbunyi, tapi di sekeliling mesin kerjamu masih banyak sisa potongan bahan yang kotor. Apakah kamu akan menyapunya dulu atau langsung pulang?",
      "Waktu pergantian shift, teman penggantimu belum juga datang padahal mesinmu tidak boleh ditinggal mati. Apa yang akan kamu lakukan?",
      "Kalau ada alat kerja atau troli yang rodanya rusak saat sedang kamu pakai, apakah kamu akan diam saja dan ganti troli lain, atau lapor ke teknisi perbaikan?"
    ],
    admin: [
      "Sudah waktunya pulang kantor, tapi laporan pengeluaran harian yang kamu kerjakan ternyata angkanya belum seimbang (balance). Apa yang akan kamu putuskan?",
      "Meja kerjamu kebetulan masih penuh dengan tumpukan dokumen rahasia milik perusahaan padahal jam kantor sudah usai. Apa yang kamu lakukan sebelum meninggalkan meja?",
      "Pernahkah kamu dipercaya memegang kunci lemari arsip penting perusahaan? Bagaimana cara keseharianmu untuk memastikan agar kuncinya aman dan tidak dipinjam sembarang orang?"
    ]
  }
};

// --- MOCK DATA ---
const initialCandidates = [
  { id: 1, name: 'Kartika Sari', email: 'kartika@example.com', phone: '0812-3456-7890', role: 'Admin Pabrik', date: '2026-05-24', status: 'DONE', score: 86, 
    traits: { adaptability: 85, creativity: 70, curiosity: 80, eq: 85, initiative: 90, resilience: 80, integrity: 100, motivation: 85, resolution: 75 }
  },
  { id: 2, name: 'Damai Sejahtera', email: 'damai@example.com', phone: '0812-9876-5432', role: 'Pelaksana Operator', date: '2026-05-25', status: 'WAITING', score: null,
    traits: null
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
  const [selectedQuestions, setSelectedQuestions] = useState({});
  const [aiQuestions, setAiQuestions] = useState({});
  
  // States untuk loading AI sungguhan
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleExportPDF = () => {
    const element = document.getElementById('pdf-content');
    if (!element) return;
    showToast('Menyiapkan file PDF...');
    const opt = { margin: 0.2, filename: `Laporan_IntegritAS_${selectedCandidate?.name.replace(/\s+/g, '_')}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' } };
    const btn = document.getElementById('btn-export-pdf');
    const originalDisplay = btn ? btn.style.display : '';
    if (btn) btn.style.display = 'none';

    html2pdf().set(opt).from(element).save().then(() => {
      if (btn) btn.style.display = originalDisplay;
      showToast('PDF berhasil diunduh!');
    }).catch(err => {
      console.error(err);
      if (btn) btn.style.display = originalDisplay;
      showToast('Gagal membuat PDF.');
    });
  };

  const handleDownloadCSV = () => {
    const doneCandidates = candidates.filter(c => c.status === 'DONE');
    if (doneCandidates.length === 0) { showToast('Tidak ada data kandidat yang siap untuk diunduh.'); return; }
    const headers = ['ID', 'Nama', 'Email', 'Posisi', 'Tanggal Wawancara', 'Fit Score', ...criteriaList];
    const rows = doneCandidates.map(c => {
      const traits = criteriaList.map(criteria => c.traits[criteria === 'Emotional Intelligence' ? 'eq' : criteria.toLowerCase().replace(' ', '')] || 0);
      return [c.id, `"${c.name}"`, `"${c.email}"`, `"${c.role}"`, c.date, c.score, ...traits].join(',');
    });
    const csvString = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "Laporan_Kandidat_IntegritAS.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Berhasil mengunduh Data CSV!');
  };

  const handleAddCandidate = (newCandidate) => {
    setCandidates([...candidates, { ...newCandidate, id: Date.now(), status: 'WAITING', score: null }]);
    setRecruiterSubView('dashboard');
    showToast('Kandidat test Berhasil Ditambahkan');
  };

  const handleLogout = () => { setIsLoggedIn(false); setAuthRole(null); setCurrentView('landing'); };

  const LandingView = () => (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white p-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
      <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30 z-10">
        <ShieldCheck size={32} className="text-white" />
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 z-10 text-center">Integrit<span className="text-white">AS</span><span className="text-indigo-500">.</span></h1>
      <p className="text-slate-400 max-w-2xl text-center mb-12 md:mb-16 text-base md:text-lg z-10 px-4">Platform Evaluasi Psikologis & Kepatuhan SOP Karyawan Berbasis AI Terintegrasi.</p>
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl z-10 px-4">
        <button onClick={() => { setAuthRole('recruiter'); setCurrentView('login'); }} className="flex-1 bg-[#1e293b] hover:bg-[#27354f] transition-all p-6 md:p-8 rounded-3xl border border-slate-700/50 text-left group cursor-pointer">
          <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><LayoutDashboard className="text-indigo-400" /></div>
          <h2 className="text-xl md:text-2xl font-bold mb-2">Portal Rekruter</h2>
          <p className="text-slate-400 leading-relaxed text-sm">Kelola instrumen penilaian, jalankan wawancara tertimbang AI, dan bandingkan rekap nilai.</p>
        </button>
        <button onClick={() => { setAuthRole('candidate'); setCurrentView('login'); }} className="flex-1 bg-[#1e293b] hover:bg-[#27354f] transition-all p-6 md:p-8 rounded-3xl border border-slate-700/50 text-left group cursor-pointer">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><UserPlus className="text-emerald-400" /></div>
          <h2 className="text-xl md:text-2xl font-bold mb-2">Portal Kandidat</h2>
          <p className="text-slate-400 leading-relaxed text-sm">Isi detail biodata diri, verifikasi kecocokan posisi, dan ikuti agenda wawancara terintegrasi.</p>
        </button>
      </div>
    </div>
  );

  const LoginView = () => {
    const [email, setEmail] = useState(authRole === 'recruiter' ? 'admin@integritas.com' : 'candidate@integritas.com');
    const [password, setPassword] = useState('123456');
    const handleSubmit = (e) => {
      e.preventDefault(); setIsLoggedIn(true); setCurrentView(authRole); setRecruiterSubView('dashboard'); showToast(`Login berhasil sebagai ${authRole === 'recruiter' ? 'Rekruter' : 'Kandidat'}`);
    };
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="bg-white text-slate-800 p-8 rounded-[32px] max-w-md w-full shadow-2xl border border-slate-100">
          <button onClick={() => setCurrentView('landing')} className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-600 mb-6 uppercase"><ChevronLeft size={16}/> Kembali</button>
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 ${authRole === 'recruiter' ? 'bg-indigo-500' : 'bg-emerald-500'} rounded-xl flex items-center justify-center text-white shadow-md`}><Lock size={20}/></div>
            <div><h3 className="text-xl font-black text-slate-800">Sign In Portal</h3><p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{authRole === 'recruiter' ? 'Internal HR / Admin' : 'Kandidat Wawancara'}</p></div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Email Address</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none text-sm" /></div>
            <div><label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none text-sm" /></div>
            <button type="submit" className={`w-full text-white font-bold py-3.5 rounded-xl shadow-lg transition-colors text-sm mt-4 cursor-pointer ${authRole === 'recruiter' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'}`}>MASUK KE PLATFORM</button>
          </form>
        </div>
      </div>
    );
  };

  const RecruiterView = () => (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 text-slate-800 font-sans">
      <div className="w-full md:w-64 bg-[#0f172a] text-slate-300 flex flex-col md:h-full shrink-0 print:hidden">
        <div className="p-4 md:p-6 flex items-center justify-center md:justify-start gap-3 cursor-pointer" onClick={handleLogout}>
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center"><ShieldCheck size={20} className="text-white" /></div>
          <span className="text-xl font-bold text-white tracking-tight">IntegritAS</span>
        </div>
        <div className="flex-row md:flex-col flex overflow-x-auto md:overflow-visible flex-1 px-4 py-2 md:py-6 gap-2 md:gap-2 border-b md:border-none border-slate-800">
          <button onClick={() => setRecruiterSubView('dashboard')} className={`min-w-max flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${recruiterSubView === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-800'}`}><LayoutDashboard size={20} /><span className="font-medium text-sm md:text-base">Dashboard</span></button>
          <button onClick={() => setRecruiterSubView('analyticsList')} className={`min-w-max flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${recruiterSubView.includes('analytics') ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-800'}`}><BarChart2 size={20} /><span className="font-medium text-sm md:text-base">Analytics Hub</span></button>
          <button onClick={() => setRecruiterSubView('add')} className={`min-w-max flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${recruiterSubView === 'add' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-800'}`}><UserPlus size={20} /><span className="font-medium text-sm md:text-base">Add Candidate</span></button>
        </div>
        <div className="hidden md:block p-4">
          <div className="text-xs font-semibold text-slate-500 px-4 mb-2">SUPPORT & SETTINGS</div>
          <button onClick={() => setRecruiterSubView('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${recruiterSubView === 'settings' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'hover:bg-slate-800'}`}><Settings size={20} /><span className="font-medium">Settings</span></button>
          <button onClick={() => showToast('Menampilkan dokumen Privacy Policy...')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors"><ShieldCheck size={20} /><span className="font-medium">Privacy Policy</span></button>
          <div className="mt-4 bg-[#1e293b] p-4 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center gap-3"><div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">HR</div><div className="overflow-hidden"><div className="text-white font-bold text-sm truncate">HR Admin</div><div className="text-xs text-slate-400 truncate">Admin Account</div></div></div>
            <button onClick={handleLogout} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"><LogOut size={16} /> SIGN OUT</button>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 md:h-20 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-8 shrink-0 print:hidden">
          <h2 className="text-lg md:text-2xl font-extrabold text-slate-800 flex items-center">
            {recruiterSubView === 'dashboard' && 'Overview Dashboard'}
            {recruiterSubView === 'add' && 'Add Candidate'}
            {recruiterSubView === 'settings' && 'Pengaturan Sistem'}
            {recruiterSubView === 'analyticsList' && 'Analytics Hub'}
            {recruiterSubView === 'analyticsDetail' && (<><button onClick={() => setRecruiterSubView('analyticsList')} className="p-1 hover:bg-slate-100 rounded-full mr-2 -ml-2"><ChevronLeft size={24} /></button><span className="hidden sm:inline">Comparison / </span>Detail</>)}
            {recruiterSubView === 'interview' && (<><button onClick={() => setRecruiterSubView('dashboard')} className="p-1 hover:bg-slate-100 rounded-full mr-2 -ml-2"><ChevronLeft size={24} /></button>Interview</>)}
          </h2>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 text-emerald-600 text-xs md:text-sm font-bold tracking-wide"><Activity size={16} /> SYSTEM ONLINE</div>
            <button className="w-8 h-8 md:w-10 md:h-10 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100"><Bell size={18} /></button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-8 bg-slate-50 relative print:p-0 print:bg-white print:overflow-visible">
          {toast && (<div className="fixed bottom-4 md:bottom-8 right-4 md:right-8 bg-slate-800 text-white px-4 md:px-6 py-3 md:py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce z-50 print:hidden"><CheckCircle2 className="text-emerald-400 shrink-0" size={24} /><span className="font-medium text-sm md:text-base">{toast}</span></div>)}
          
          {recruiterSubView === 'dashboard' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[
                  { title: 'TOTAL KANDIDAT', val: candidates.length, unit: 'Minggu ini', icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                  { title: 'WAWANCARA HARI INI', val: '5', unit: 'Aktif', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
                  { title: 'SIAP REVIEW', val: candidates.filter(c => c.status === 'DONE').length, unit: 'Teranalisis', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                  { title: 'AVG FIT SCORE', val: '87%', unit: 'Standard', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.bg} rounded-2xl flex items-center justify-center mb-3 md:mb-4`}><stat.icon className={stat.color} size={20} /></div>
                    <div className="text-[10px] md:text-xs font-bold text-slate-400 mb-1 tracking-wider">{stat.title}</div>
                    <div className="text-3xl md:text-4xl font-black text-slate-800 flex items-baseline gap-2">{stat.val} <span className="text-xs md:text-sm font-semibold text-emerald-500">{stat.unit}</span></div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mt-6 md:mt-8">
                <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-50/50">
                  <h3 className="text-lg md:text-xl font-bold text-slate-800">Antrean Wawancara & Evaluasi</h3>
                  <button onClick={() => setRecruiterSubView('add')} className="flex items-center justify-center gap-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl font-semibold transition-colors text-sm whitespace-nowrap w-full sm:w-auto"><UserPlus size={16} /> Tambah Manual</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead><tr className="text-[10px] md:text-xs font-bold text-slate-400 border-b border-slate-100"><th className="p-4 md:p-6">KANDIDAT</th><th className="p-4 md:p-6">POSISI</th><th className="p-4 md:p-6">JADWAL & TOKEN ZOOM</th><th className="p-4 md:p-6">STATUS</th><th className="p-4 md:p-6 text-center">AKSI</th></tr></thead>
                    <tbody className="align-middle">
                      {candidates.map((cand) => (
                        <tr key={cand.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                          <td className="p-4 md:p-6"><div className="flex items-center gap-3 md:gap-4"><div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg md:text-xl shrink-0">{cand.name.charAt(0)}</div><div className="min-w-0"><div className="font-bold text-slate-800 text-base md:text-lg truncate">{cand.name}</div><div className="text-xs md:text-sm text-slate-500 truncate">{cand.email}</div></div></div></td>
                          <td className="p-4 md:p-6 text-slate-600 font-medium text-sm md:text-base"><div className="flex flex-col"><span>{cand.role.split('(')[0].trim()}</span>{cand.role.includes('(') && <span className="text-xs text-slate-400">({cand.role.split('(')[1]}</span>}</div></td>
                          <td className="p-4 md:p-6"><div className="flex flex-col gap-1"><div className="flex items-center gap-2 text-slate-600 font-medium text-sm"><Calendar size={14}/> {cand.date}</div><div className="flex items-center gap-2 text-indigo-500 font-bold text-[10px] md:text-xs whitespace-nowrap"><Video size={14}/> ZOOM MEETING LINK</div></div></td>
                          <td className="p-4 md:p-6">{cand.status === 'WAITING' ? (<span className="bg-amber-50 text-amber-600 px-3 md:px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider whitespace-nowrap">Waiting</span>) : (<span className="bg-emerald-50 text-emerald-600 px-3 md:px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider whitespace-nowrap">Done</span>)}</td>
                          <td className="p-4 md:p-6 flex justify-center">
                            {cand.status === 'WAITING' ? (
                              <button onClick={() => { setSelectedCandidate(cand); setActiveInterviewAspect('Adaptability'); setInterviewAnswers({}); setSelectedQuestions({}); setAiQuestions({}); setRecruiterSubView('interview'); }} className="bg-white border border-slate-200 text-slate-600 px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-bold hover:bg-slate-50 shadow-sm transition-colors whitespace-nowrap flex items-center gap-2"><Activity size={14} /> Analyze</button>
                            ) : (
                              <button onClick={() => { setSelectedCandidate(cand); setRecruiterSubView('analyticsDetail'); }} className="bg-indigo-600 text-white px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-bold hover:bg-indigo-700 shadow-sm transition-colors whitespace-nowrap">Lihat Hasil</button>
                            )}
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
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 md:mb-8"><div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0"><UserPlus size={24} /></div><div><h3 className="text-lg md:text-xl font-bold text-slate-800">Tambah Antrean Kandidat Baru</h3><p className="text-slate-500 text-xs md:text-sm">Tambahkan informasi dasar untuk menjadwalkan agenda interview virtual.</p></div></div>
                <form className="space-y-4 md:space-y-6" onSubmit={(e) => { e.preventDefault(); const formData = new FormData(e.target); handleAddCandidate({ name: formData.get('name'), email: formData.get('email'), phone: formData.get('phone'), role: formData.get('role'), date: formData.get('date'), }); }}>
                  <div><label className="block text-[10px] md:text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Nama Lengkap Kandidat</label><input name="name" required type="text" placeholder="Nama Lengkap" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm md:text-base" /></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"><div><label className="block text-[10px] md:text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Alamat Email</label><input name="email" required type="email" placeholder="nama@email.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm md:text-base" /></div><div><label className="block text-[10px] md:text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">No Telepon / WhatsApp</label><input name="phone" required type="text" placeholder="0812-xxxx-xxxx" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm md:text-base" /></div></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="block text-[10px] md:text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Posisi Yang Dilamar</label>
                      <select name="role" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-700 text-sm md:text-base">
                        <option>Pelaksana Operator</option>
                        <option>Admin Pabrik</option>
                      </select>
                    </div>
                    <div><label className="block text-[10px] md:text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Tanggal Wawancara</label><input name="date" required type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-700 text-sm md:text-base" /></div>
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 md:py-4 rounded-xl shadow-lg shadow-indigo-500/30 transition-colors mt-6 text-sm md:text-base">SIMPAN KANDIDAT & JADWALKAN</button>
                </form>
              </div>
            </div>
          )}

          {recruiterSubView === 'settings' && (
            <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 pb-20">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 md:mb-8"><div className="w-12 h-12 bg-indigo-50 rounded-[20px] flex items-center justify-center text-indigo-600 shrink-0"><Settings size={24} /></div><div><h3 className="text-xl md:text-2xl font-black text-slate-800">Standar Penilaian & Pembobotan</h3><p className="text-slate-500 text-sm font-medium mt-1">Tentukan target kelulusan (0-100) serta Bobot Prioritas Kepentingan aspek (1-5).</p></div></div>
                <div className="space-y-4">
                  {criteriaList.map((criteria) => {
                    const key = criteria === 'Emotional Intelligence' ? 'eq' : criteria.toLowerCase().replace(' ', '');
                    return (
                      <div key={key} className="flex flex-col p-5 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors gap-4">
                        <div className="font-black text-slate-800 text-base border-b border-slate-200/60 pb-1.5">{criteria}</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-400 uppercase w-20">Target (0-100)</span>
                            <input type="range" min="0" max="100" value={standardTraits[key]} onChange={(e) => setStandardTraits({...standardTraits, [key]: parseInt(e.target.value)})} className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                            <div className="w-12 py-1 bg-white border rounded-lg text-center font-black text-indigo-600 text-xs shadow-sm">{standardTraits[key]}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-purple-400 uppercase w-20">Bobot (1-5)</span>
                            <input type="range" min="1" max="5" value={aspectWeights[key] || 1} onChange={(e) => setAspectWeights({...aspectWeights, [key]: parseInt(e.target.value)})} className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600" />
                            <div className="w-12 py-1 bg-purple-50 border border-purple-100 rounded-lg text-center font-black text-purple-600 text-xs shadow-sm">x{aspectWeights[key] || 1}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-8 flex justify-end"><button onClick={() => showToast('Konfigurasi bobot dan target berhasil disimpan!')} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"><Save size={18} /> Simpan Pengaturan</button></div>
              </div>
            </div>
          )}

          {recruiterSubView === 'analyticsList' && (
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 md:p-6 mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div><h3 className="text-xl md:text-2xl font-bold text-slate-800">Analytics Hub</h3><p className="text-slate-500 text-sm">Perbandingan diagram laba-laba & hasil integrasi AI antar kandidat.</p></div>
                <button onClick={handleDownloadCSV} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 md:py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 text-sm md:text-base"><Download size={18} /> Download CSV</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {candidates.filter(c => c.status === 'DONE').map(cand => (
                  <div key={cand.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col items-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 text-xl md:text-2xl font-black mb-4">{cand.score}%</div>
                    <h4 className="text-lg md:text-xl font-bold text-slate-800 text-center">{cand.name}</h4><p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-6 text-center">{cand.role}</p>
                    <div className="w-40 h-40 md:w-48 md:h-48 mb-6 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={criteriaList.map(a => {
                            const key = a === 'Emotional Intelligence' ? 'eq' : a.toLowerCase().replace(' ', '');
                            return { aspect: a, Kandidat: (cand.traits[key] || 0) / 10, 'Posisi Standar': (standardTraits[key] || 0) / 10 };
                        })}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="aspect" tick={false} />
                          <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                          <Radar name="Kandidat" dataKey="Kandidat" stroke="#6366f1" strokeWidth={2} fill="#6366f1" fillOpacity={0.5} />
                          <Radar name="Posisi Standar" dataKey="Posisi Standar" stroke="#10b981" strokeWidth={1} fill="#10b981" fillOpacity={0.1} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-full space-y-2 md:space-y-3 mb-6">
                      <div className="flex justify-between text-xs md:text-sm font-medium"><span className="text-slate-500">Integrity:</span><span className="text-emerald-500 font-bold">10/10</span></div>
                      <div className="flex justify-between text-xs md:text-sm font-medium"><span className="text-slate-500">Resilience:</span><span className="text-indigo-500 font-bold">8/10</span></div>
                    </div>
                    <button onClick={() => { setSelectedCandidate(cand); setRecruiterSubView('analyticsDetail'); }} className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2.5 md:py-3 rounded-xl transition-colors text-sm md:text-base">Lihat Analisis</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recruiterSubView === 'analyticsDetail' && selectedCandidate && (() => {
             const isRoleAdmin = selectedCandidate.role.toLowerCase().includes('admin');
             const kesimpulanText = isRoleAdmin
                ? `"Kandidat memiliki tingkat ketelitian dan keteraturan yang sangat baik. Profil psikologisnya menunjukkan kecocokan tinggi untuk menangani data operasional, pembukuan, atau pengelolaan sistem yang membutuhkan akurasi di lingkungan perkantoran maupun pabrik."`
                : `"Kandidat memiliki landasan kedisiplinan dan kepatuhan instruksi kerja yang sangat solid. Profilnya menunjukkan ketahanan fisik dan mental yang siap untuk menghadapi ritme kerja operasional, shift pabrik, maupun aktivitas lapangan."`;
             const nilaiPlus = isRoleAdmin
                ? ["Akurasi Penginputan Data", "Manajemen Waktu & Prioritas", "Ketenangan Menghadapi Komplain"]
                : ["Kepatuhan Keselamatan Kerja (K3)", "Daya Tahan Kerja Rutin", "Disiplin Kehadiran & Shift"];
             const areaPengembangan = isRoleAdmin
                ? ["Adaptasi terhadap Software/Sistem ERP Baru", "Inisiatif Pengambilan Keputusan Mandiri"]
                : ["Butuh Pendampingan Teknis Mesin/Alat Baru", "Kecepatan Analisis saat Ada Kendala Lapangan"];
             const panduanQ1 = isRoleAdmin
                ? `"Jika tiba-tiba format laporan atau software yang biasa Anda gunakan diganti dengan sistem baru, bagaimana cara Anda mengejar ketertinggalan agar pekerjaan tidak menumpuk?"`
                : `"Jika Anda mendapati mesin atau alat kerja Anda tidak berfungsi dengan normal, tapi target produksi hari itu sangat tinggi, apa langkah pasti yang Anda ambil?"`;
             const panduanQ2 = isRoleAdmin
                ? `"Ceritakan momen ketika Anda menemukan ada data atau angka yang tidak sinkron. Bagaimana cara Anda menelusuri letak kesalahannya?"`
                : `"Ceritakan pengalaman Anda saat harus bekerja sama dengan rekan satu regu yang sering melanggar aturan keselamatan atau bekerja asal-asalan."`;

             return (
               <div id="pdf-content" className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-20 print:max-w-full print:p-4 print:pb-0 bg-slate-50 p-4">
                  <div className="bg-white p-6 sm:p-8 rounded-[32px] border flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm print:border-none print:shadow-none print:p-0 print:mb-8">
                    <div className="flex items-center gap-4 md:gap-6 w-full sm:w-auto">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-[#6366f1] rounded-[22px] flex items-center justify-center text-white text-2xl md:text-3xl font-black shadow-lg shadow-indigo-100 shrink-0">{selectedCandidate.score}%</div>
                      <div className="min-w-0"><h3 className="text-2xl font-black text-slate-800 truncate leading-tight print:whitespace-normal print:break-words">Laporan Analisis: {selectedCandidate.name}</h3><p className="text-slate-400 text-sm font-semibold truncate print:whitespace-normal">{selectedCandidate.role}</p></div>
                    </div>
                    <button id="btn-export-pdf" onClick={handleExportPDF} className="w-full sm:w-auto px-6 py-3 bg-[#0f172a] hover:bg-slate-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all shrink-0 text-sm md:text-base print:hidden"><Printer size={18}/> <span>Cetak / Ekspor PDF</span></button>
                  </div>
                  
                  <div className="bg-white p-6 md:p-8 rounded-[40px] border border-slate-200 shadow-sm print:shadow-none print:border-slate-300">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"><h4 className="font-black text-slate-400 text-xs uppercase tracking-widest">Spider Chart Assessment</h4><span className="text-xs text-slate-500 font-semibold bg-slate-100 px-3 py-1 rounded-full">VS Benchmarking Standard</span></div>
                    <div className="h-[380px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={criteriaList.map(a => {
                            const key = a === 'Emotional Intelligence' ? 'eq' : a.toLowerCase().replace(' ', '');
                            return { aspect: a, Kandidat: (selectedCandidate.traits[key] || 0) / 10, 'Posisi Standar': (standardTraits[key] || 0) / 10 };
                        })}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="aspect" tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                          <Radar name="Kandidat" dataKey="Kandidat" stroke="#6366f1" strokeWidth={3} fill="#6366f1" fillOpacity={0.5} />
                          <Radar name="Posisi Standar" dataKey="Posisi Standar" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.1} />
                          <Legend verticalAlign="top" height={36}/>
                          <RechartsTooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-indigo-50 rounded-3xl border border-indigo-100 p-6 md:p-8">
                    <div className="flex items-center gap-2 text-indigo-700 font-bold mb-3 md:mb-4 text-sm md:text-base"><Activity size={20} /> Kesimpulan Psikologis AI</div>
                    <p className="text-indigo-900 italic font-medium leading-relaxed text-sm md:text-base">{kesimpulanText}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 md:p-8">
                      <div className="flex items-center gap-2 text-emerald-700 font-bold mb-4 md:mb-6 uppercase text-xs md:text-sm tracking-wider"><Star size={18} /> NILAI PLUS UTAMA</div>
                      <ul className="space-y-3 md:space-y-4">
                        {nilaiPlus.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-emerald-900 font-medium text-sm"><CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5"/> <span>{item}</span></li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 md:p-8">
                      <div className="flex items-center gap-2 text-amber-700 font-bold mb-4 md:mb-6 uppercase text-xs md:text-sm tracking-wider"><AlertTriangle size={18} /> AREA PENGEMBANGAN</div>
                      <ul className="space-y-3 md:space-y-4">
                        {areaPengembangan.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-amber-900 font-medium text-sm"><Activity size={18} className="text-amber-500 shrink-0 mt-0.5"/> <span>{item}</span></li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <div className="md:col-span-1 bg-white border border-slate-200 shadow-sm rounded-3xl p-6 flex flex-col justify-center items-center text-center">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Rekomendasi AI</h4>
                      {selectedCandidate.score >= 80 ? (
                        <><div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3"><ShieldCheck size={32} /></div><h3 className="text-2xl font-black text-emerald-600 mb-2">HIRE</h3><p className="text-xs text-slate-500 font-medium">Sangat direkomendasikan untuk lanjut ke tahap penawaran (Offering).</p></>
                      ) : selectedCandidate.score >= 65 ? (
                        <><div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-3"><AlertTriangle size={32} /></div><h3 className="text-2xl font-black text-amber-600 mb-2">CONSIDER</h3><p className="text-xs text-slate-500 font-medium">Bisa dipertimbangkan, namun perlu validasi ekstra di area pengembangan.</p></>
                      ) : (
                        <><div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-3"><Activity size={32} /></div><h3 className="text-2xl font-black text-red-600 mb-2">REJECT</h3><p className="text-xs text-slate-500 font-medium">Skor berada di bawah batas minimum toleransi risiko perusahaan.</p></>
                      )}
                    </div>
                    <div className="md:col-span-2 bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl">
                      <div className="flex items-center gap-2 text-indigo-300 font-bold mb-4 uppercase text-xs tracking-wider"><Sparkles size={18} /> Panduan User Interview Berikutnya</div>
                      <p className="text-sm text-slate-300 mb-5 leading-relaxed">Untuk tahap wawancara dengan Manager, AI menyarankan agar Anda menggali lebih dalam terkait <strong>Adaptability</strong> dan <strong>Creativity</strong> kandidat dengan pertanyaan berikut:</p>
                      <ul className="space-y-4">
                        <li className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 text-sm font-medium leading-relaxed"><span className="text-indigo-400 font-bold mr-2">Q1:</span> {panduanQ1}</li>
                        <li className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 text-sm font-medium leading-relaxed"><span className="text-indigo-400 font-bold mr-2">Q2:</span> {panduanQ2}</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
                    <h4 className="font-bold text-slate-800 mb-3 md:mb-4 text-sm md:text-base">Metodologi Penilaian</h4>
                    <p className="text-slate-500 leading-relaxed text-xs md:text-sm">Analisis IntegritAS menggunakan pencocokan pola semantik terhadap standar kompetensi industri Manufaktur, Operasional Gudang, dan Administrasi Umum. Sistem mendeteksi kesadaran risiko, kestabilan emosi, dan komitmen kejujuran absolut melalui diksi lisan yang dituliskan rekruter.</p>
                  </div>
               </div>
             );
          })()}

          {recruiterSubView === 'interview' && selectedCandidate && (
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 md:gap-8 pb-20">
              <div className="w-full md:w-1/3 lg:w-1/4 bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 shrink-0 h-fit">
                <h4 className="text-[10px] md:text-xs font-black text-slate-400 mb-4 md:mb-6 uppercase tracking-wider">Pilih Aspek Penilaian</h4>
                <div className="flex flex-col gap-2 md:gap-3">
                  {criteriaList.map((criteria) => (
                    <button key={criteria} onClick={() => setActiveInterviewAspect(criteria)} className={`w-full text-left px-4 md:px-5 py-3 md:py-4 rounded-2xl font-bold transition-all text-sm md:text-base ${ activeInterviewAspect === criteria ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200' }`}>{criteria}</button>
                  ))}
                </div>
              </div>
              <div className="flex-1 space-y-6 md:space-y-8">
                <div className="bg-slate-900 rounded-[32px] p-6 md:p-8 text-white shadow-xl shadow-slate-900/10">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold mb-6"><ShieldCheck size={20} /> Status Evaluasi AI</div>
                  <div className="flex justify-between text-xs md:text-sm font-bold mb-3 text-slate-400"><span>Progress</span><span className="text-indigo-400">{Object.keys(interviewAnswers).filter(k => interviewAnswers[k]?.trim() !== "").length} / 9</span></div>
                  <div className="h-2 md:h-3 w-full bg-slate-800 rounded-full overflow-hidden mb-6 md:mb-8"><div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${(Object.keys(interviewAnswers).filter(k => interviewAnswers[k]?.trim() !== "").length / 9) * 100}%` }}></div></div>
                  
                  {/* TOMBOL RUN ANALITIK AI */}
                  <button 
                    disabled={isAnalyzing || Object.keys(interviewAnswers).filter(k => interviewAnswers[k]?.trim() !== "").length < 9}
                    onClick={async () => { 
                      if(Object.keys(interviewAnswers).filter(k => interviewAnswers[k]?.trim() !== "").length === 9) { 
                        setIsAnalyzing(true);
                        showToast('AI sedang menganalisis struktur bahasa dan sentimen jawaban...'); 
                        
                        try {
                          // Panggil AI Sungguhan
                          const response = await fetch('/.netlify/functions/analyze-score', {
                            method: 'POST',
                            body: JSON.stringify({
                              role: selectedCandidate.role,
                              answers: interviewAnswers
                            })
                          });
                          
                          const generatedTraits = await response.json();
                          
                          // Hitung bobot dari skor AI
                          let weightedSum = 0;
                          let totalWeight = 0;
                          criteriaList.forEach(a => {
                            const key = a === 'Emotional Intelligence' ? 'eq' : a.toLowerCase().replace(' ', '');
                            const aiScore = generatedTraits[key] || 70; // fallback jika gagal
                            const weight = aspectWeights[key] || 1;
                            weightedSum += (aiScore * weight);
                            totalWeight += weight;
                          });
                          
                          const finalWeightedScore = Math.round(weightedSum / totalWeight);
                          
                          setCandidates(candidates.map(c => c.id === selectedCandidate.id ? { ...c, status: 'DONE', score: finalWeightedScore, traits: generatedTraits } : c )); 
                          showToast('Analisis Selesai!');
                          setTimeout(() => setRecruiterSubView('dashboard'), 1500); 

                        } catch (err) {
                          showToast('Gagal memproses data dengan AI.');
                        } finally {
                          setIsAnalyzing(false);
                        }
                      } else { 
                        showToast('Harap selesaikan seluruh 9 aspek untuk menjalankan AI.'); 
                      } 
                    }} 
                    className={`w-full py-3 md:py-4 rounded-xl font-bold transition-all shadow-lg text-sm md:text-base cursor-pointer ${ Object.keys(interviewAnswers).filter(k => interviewAnswers[k]?.trim() !== "").length === 9 ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/20' : 'bg-slate-700 text-slate-400 shadow-transparent opacity-80 cursor-not-allowed' }`}
                  >
                    {isAnalyzing ? 'MENJALANKAN ANALITIK AI...' : 'JALANKAN ANALISIS AI (TERTIMBANG)'}
                  </button>
                </div>
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 md:mb-8">
                    <div><h2 className="text-2xl md:text-4xl font-black text-slate-800 mb-1 md:mb-2">{activeInterviewAspect}</h2><p className="text-slate-500 text-xs md:text-sm font-medium">Menilai tingkat {activeInterviewAspect.toLowerCase()} kandidat {selectedCandidate.name} ({selectedCandidate.role})</p></div>
                    
                    {/* TOMBOL GENERATE QUESTION */}
                    <button 
                      disabled={isGenerating}
                      onClick={async () => { 
                        setIsGenerating(true);
                        showToast(`AI sedang menganalisis posisi ${selectedCandidate.role} dan membuat pertanyaan ${activeInterviewAspect}...`); 
                        
                        try {
                          const response = await fetch('/.netlify/functions/generate-question', {
                            method: 'POST',
                            body: JSON.stringify({
                              role: selectedCandidate.role,
                              aspect: activeInterviewAspect
                            })
                          });
                          
                          const data = await response.json();
                          
                          if(data.question) {
                            setAiQuestions(prev => ({ ...prev, [activeInterviewAspect]: data.question })); 
                            setSelectedQuestions(prev => ({ ...prev, [activeInterviewAspect]: data.question }));
                          }
                        } catch(err) {
                          showToast('Gagal terhubung ke AI.');
                        } finally {
                          setIsGenerating(false);
                        }
                      }} 
                      className={`bg-purple-50 text-purple-600 px-4 md:px-5 py-2.5 md:py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-xs md:text-sm transition-colors shrink-0 border border-purple-100 shadow-sm ${isGenerating ? 'opacity-50 cursor-wait' : 'hover:bg-purple-100'}`}
                    >
                      <Sparkles size={16} /> {isGenerating ? 'Memproses AI...' : 'Generate AI Question'}
                    </button>
                  </div>
                  <h4 className="text-[10px] md:text-xs font-black text-slate-400 mb-3 md:mb-4 uppercase tracking-widest">Pertanyaan Dasar</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
                    {aiQuestions[activeInterviewAspect] && (<button onClick={() => setSelectedQuestions(prev => ({ ...prev, [activeInterviewAspect]: aiQuestions[activeInterviewAspect] }))} className={`text-left p-4 md:p-5 rounded-2xl text-xs md:text-sm font-medium leading-relaxed transition-all w-full ${ selectedQuestions[activeInterviewAspect] === aiQuestions[activeInterviewAspect] ? 'bg-purple-100 border-2 border-purple-500 text-purple-900 shadow-md ring-2 ring-purple-500/20' : 'bg-purple-50 border border-purple-200 text-purple-800 hover:bg-purple-100/80' }`}><div className="flex items-center gap-2 mb-2 text-purple-600 font-bold text-[10px] uppercase tracking-wider"><Sparkles size={12} /> AI GENERATED</div>{aiQuestions[activeInterviewAspect]}</button>)}
                    
                    {(() => {
                       const isRoleAdmin = selectedCandidate.role.toLowerCase().includes('admin');
                       const roleKey = isRoleAdmin ? 'admin' : 'operator';
                       const currentQuestions = interviewQuestionBank[activeInterviewAspect][roleKey];
                       
                       return currentQuestions.map((q, idx) => ( 
                         <button key={idx} onClick={() => setSelectedQuestions(prev => ({ ...prev, [activeInterviewAspect]: q }))} className={`text-left p-4 md:p-5 rounded-2xl text-xs md:text-sm font-medium leading-relaxed transition-all w-full ${ selectedQuestions[activeInterviewAspect] === q ? 'bg-indigo-50 border-2 border-indigo-500 text-indigo-900 shadow-md ring-2 ring-indigo-500/20' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100' }`}>{q}</button> 
                       ));
                    })()}

                  </div>
                  <h4 className="text-[10px] md:text-xs font-black text-slate-400 mb-3 md:mb-4 uppercase tracking-widest">Catatan Jawaban {selectedQuestions[activeInterviewAspect] && <span className="text-indigo-500 font-medium normal-case ml-2">(Menjawab pertanyaan terpilih)</span>}</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center"><h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Respons / Jawaban Kandidat</h5>{interviewAnswers[activeInterviewAspect]?.trim() && (<span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1"><CheckCircle2 size={12}/> Tersimpan</span>)}</div>
                    <textarea className="w-full p-6 sm:p-8 bg-slate-50 border-2 border-transparent rounded-[32px] min-h-[220px] outline-none focus:bg-white focus:border-indigo-100 transition-all text-slate-700 leading-relaxed text-sm shadow-inner" placeholder={selectedQuestions[activeInterviewAspect] ? `Menjawab: "${selectedQuestions[activeInterviewAspect]}"\n\nMasukkan poin jawaban wawancara atau gunakan pertanyaan AI kustom di atas...` : "Masukkan poin jawaban wawancara atau gunakan pertanyaan AI kustom di atas..."} value={interviewAnswers[activeInterviewAspect] || ''} onChange={(e) => setInterviewAnswers({...interviewAnswers, [activeInterviewAspect]: e.target.value})} />
                  </div>
                  <div className="flex justify-end pt-2"><button onClick={() => { if(interviewAnswers[activeInterviewAspect]?.trim()) { showToast(`Jawaban ${activeInterviewAspect} berhasil disimpan.`); } else { showToast('Catatan jawaban tidak boleh kosong.'); } }} className="flex items-center space-x-2 px-10 py-4 bg-[#6366f1] text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"><Save size={18} /><span>Simpan Jawaban Aspek</span></button></div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );

  const CandidateView = () => (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      <header className="h-16 md:h-20 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-8 shrink-0">
         <div className="flex items-center gap-3 md:gap-4 cursor-pointer" onClick={handleLogout}>
          <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0"><ShieldCheck size={20} className="text-white" /></div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">Candidate Portal</h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 text-emerald-600 text-xs md:text-sm font-bold tracking-wide"><Activity size={16} /> SYSTEM ONLINE</div>
          <button className="w-8 h-8 md:w-10 md:h-10 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100"><Bell size={18} /></button>
          <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>
          <button onClick={handleLogout} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-100 hover:text-red-600 text-slate-600 px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-colors"><LogOut size={16} /> <span className="hidden sm:inline">Sign Out</span></button>
        </div>
      </header>
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8 pt-6 md:pt-12 space-y-6 md:space-y-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="bg-indigo-500 rounded-3xl md:rounded-[2rem] p-6 md:p-8 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden flex flex-col justify-between h-auto min-h-[200px] md:h-64">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/4 translate-x-1/4"></div>
            <div className="z-10"><div className="w-10 h-10 md:w-12 md:h-12 border-2 border-white/30 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6"><Activity size={20} className="text-white" /></div><h2 className="text-2xl md:text-3xl font-extrabold mb-1 md:mb-2 leading-tight">Halo, Damai Sejahtera</h2><p className="text-indigo-100 font-medium text-sm md:text-base">Status: <span className="underline decoration-indigo-300">Sesi Wawancara Aktif</span></p></div>
            <div className="z-10 mt-6 md:mt-4"><div className="flex justify-between text-xs md:text-sm font-bold mb-2 text-indigo-100"><span>Profil Kelengkapan</span><span>100%</span></div><div className="h-1.5 md:h-2 w-full bg-indigo-900/30 rounded-full overflow-hidden"><div className="h-full bg-white w-full rounded-full"></div></div></div>
          </div>
          <div className="lg:col-span-2 bg-white rounded-3xl md:rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8 flex flex-col justify-center">
            <div className="flex items-center gap-3 text-indigo-800 font-bold text-base md:text-lg mb-3 md:mb-4"><Video size={20} className="text-indigo-500 md:w-6 md:h-6"/> Link Virtual Interview Anda</div>
            <p className="text-slate-500 mb-6 md:mb-8 leading-relaxed text-sm md:text-base">Pastikan Anda menggunakan koneksi internet stabil dan menyalakan kamera selama sesi evaluasi IntegritAS dengan HR.</p>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"><div className="flex items-center gap-4"><div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-500 shrink-0"><Calendar size={20} /></div><div><div className="font-bold text-slate-800 text-sm md:text-base">Senin, 2026-05-25</div><div className="text-xs md:text-sm text-slate-500">Pukul 14:00 - 15:30 WIB</div></div></div><button className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 md:py-3 px-6 rounded-xl shadow-md transition-colors text-sm md:text-base">Hubungkan Zoom</button></div>
          </div>
        </div>
        <div className="bg-white rounded-3xl md:rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8">
          <div className="flex items-center gap-3 text-slate-800 font-bold text-lg md:text-xl mb-6 md:mb-8"><Users size={20} className="text-indigo-500 md:w-6 md:h-6" /> Formulir Pengisian Biodata</div>
          <form className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"><div><label className="block text-[10px] md:text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">NAMA LENGKAP</label><input type="text" defaultValue="Damai Sejahtera" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 md:py-3 focus:outline-none text-slate-700 text-sm md:text-base" readOnly /></div><div><label className="block text-[10px] md:text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">ALAMAT EMAIL</label><input type="email" defaultValue="damai@example.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 md:py-3 focus:outline-none text-slate-700 text-sm md:text-base" readOnly /></div></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"><div><label className="block text-[10px] md:text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">PENGALAMAN KERJA (TAHUN)</label><input type="number" placeholder="Contoh: 3" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 md:py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm md:text-base" /></div><div><label className="block text-[10px] md:text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">LINKEDIN URL</label><input type="url" placeholder="https://linkedin.com/in/..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 md:py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm md:text-base" /></div></div>
            <div className="pt-2 md:pt-4 flex justify-end"><button type="button" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 md:py-3 px-8 rounded-xl shadow-lg shadow-indigo-500/30 transition-colors text-sm md:text-base">Simpan Perubahan</button></div>
          </form>
        </div>
      </main>
    </div>
  );

  return (
    <>
      {currentView === 'landing' && <LandingView />}
      {currentView === 'login' && <LoginView />}
      {isLoggedIn && currentView === 'recruiter' && <RecruiterView />}
      {isLoggedIn && currentView === 'candidate' && <CandidateView />}
    </>
  );
}