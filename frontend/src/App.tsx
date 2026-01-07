import React, { useState, useEffect } from 'react';
import './App.css';
// สมมติว่าไฟล์ hashfunction อยู่ที่เดิม
// import { sha256 } from './service/hashfunction';

// Mock function กรณีไม่มีไฟล์ service
const sha256 = async (text: string) => {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const CORRECT_USERNAME = 'YUCOM';
const FLAG = 'FLAG{SUT_Smart_Bus_System_Restored_2026}';

type GameStage = 'intro' | 'stage1' | 'stage2' | 'stage3' | 'victory';

function App() {
  const [stage, setStage] = useState<GameStage>('intro');
  const [usernameInput, setUsernameInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('passenger');
  const [showHint, setShowHint] = useState(false);
  const [showHint2, setShowHint2] = useState(false);
  const [showHint3, setShowHint3] = useState(false);

  // --- Cookie Helpers ---
  const setCookie = (name: string, value: string, days: number) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
  };

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
    return '';
  };

  const resetGame = () => {
    setCookie('role', 'passenger', 1);
    setUserRole('passenger');
    setStage('intro');
    setUsernameInput('');
    setPinInput('');
    setError('');
  };

  // useEffect สำหรับดักจับการเข้าด่าน 2 และจัดการ Timer
  useEffect(() => {
    if (stage === 'stage2') {
      // รีเซ็ตคำใบ้ทั้งหมดเมื่อเข้าด่าน
      setShowHint(false);
      setShowHint2(false);
      setShowHint3(false);

      // คำใบ้ที่ 1: 10 นาที (10 * 60 * 1000)
      const timer1 = setTimeout(() => setShowHint(true), 600000);  //600000

      // คำใบ้ที่ 2: 20 นาที (20 * 60 * 1000)
      const timer2 = setTimeout(() => setShowHint2(true), 1200000);  //1200000

      // คำใบ้ที่ 3: 30 นาที (30 * 60 * 1000)
      const timer3 = setTimeout(() => setShowHint3(true), 1800000);  //1800000

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [stage]);

  useEffect(() => {
    let interval: any;
    if (stage === 'stage3') {
      const current = getCookie('role') || 'passenger';
      setUserRole(current);

      interval = setInterval(() => {
        const liveCookie = getCookie('role');
        if (liveCookie && liveCookie !== userRole) setUserRole(liveCookie);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [stage, userRole]);

  const handleStage1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput === CORRECT_USERNAME) {
      setError('');
      setStage('stage2');
    } else {
      setError('❌ Username ไม่ถูกต้อง! ลองถอดรหัส Base64 อีกครั้ง');
    }
  };

  const handleStage2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const PIN_HASH = await sha256('0062');
    const inputHash = await sha256(pinInput);
    if (inputHash === PIN_HASH) {
      setError('');
      setStage('stage3');
    } else {
      setError('❌ PIN ไม่ถูกต้อง! (เบาะแส: 044-223-3xxx)');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#667eea] to-[#764ba2] flex flex-col items-center justify-center p-5 relative font-sans">

      {/* Stage: INTRO */}
      {stage === 'intro' && (
        <div className="bg-white rounded-[20px] p-10 max-w-[700px] w-full shadow-[0_20px_60px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-bottom-8 duration-500 text-center">
          <div className="text-[80px] animate-bounce-slow">🚌</div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#667eea] my-5">The SUT Smart Bus Hack</h1>
          <div className="bg-linear-to-br from-[#ffeaa7] to-[#fdcb6e] p-6 rounded-2xl my-8 border-l-5 border-[#e17055] text-left">
            <p className="text-lg text-[#2d3436] leading-relaxed mb-2">⚠️ ระบบเดินรถเมล์มอถูกล็อก!</p>
            <p className="text-lg text-[#2d3436] leading-relaxed">ภารกิจ: กู้คืนระบบให้เพื่อนๆ ไปเรียนทันเวลา</p>
          </div>
          <button
            className="bg-linear-to-br from-[#00b894] to-[#00cec9] text-white px-10 py-4 text-xl font-bold rounded-full cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,184,148,0.6)] shadow-[0_5px_15px_rgba(0,184,148,0.4)]"
            onClick={() => { setCookie('role', 'passenger', 1); setStage('stage1'); }}
          >
            🔓 เริ่มภารกิจ
          </button>
        </div>
      )}

      {/* Stage 1: Cryptography */}
      {stage === 'stage1' && (
        <div className="bg-white rounded-[20px] p-10 max-w-[700px] w-full shadow-2xl animate-in fade-in duration-500">
          <div className="text-center mb-8">
            <span className="bg-linear-to-br from-[#fd79a8] to-[#e84393] text-white px-5 py-2 rounded-full text-sm font-bold inline-block mb-2">ด่านที่ 1</span>
            <h2 className="text-3xl font-bold text-[#2d3436]">🔐 Cryptography</h2>
            <div className='border border-amber-600 text-amber-600 bg-amber-200 rounded-2xl mt-5 h-18 flex justify-center items-center'>
              <h3>นี่คือ Cyphertext ที่ได้ BJPNH โดยให้เอาภาพด้านล่างคือรหัสที่จะเอามาถอดเพื่อหา Plaintext</h3>
            </div>
            <img src="/image_level1.png" alt="Logo" />
          </div>
          <div className="bg-[#2d3436] p-8 rounded-xl my-5 overflow-hidden relative">
            <div className="flex overflow-hidden select-all">
              <span className="text-[#00ff00] font-mono text-2xl font-bold whitespace-nowrap animate-scroll drop-shadow-[0_0_10px_#00ff00]">
                U1VUX1N0dWRlbnRfMjAyNg==
              </span>
            </div>
          </div>
          <form onSubmit={handleStage1Submit} className="flex flex-col md:flex-row gap-3 my-5">
            <input
              type="text"
              placeholder="Username"
              className="flex-1 p-4 border-2 border-[#dfe6e9] rounded-xl text-lg focus:outline-none focus:border-[#667eea] transition-all"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
            />
            <button className="bg-linear-to-br from-[#667eea] to-[#764ba2] text-white px-8 py-4 rounded-xl font-bold hover:-translate-y-0.5 transition-all">ยืนยัน</button>
          </form>
          {error && <div className="bg-[#ffebee] text-[#c62828] p-4 rounded-xl border-l-5 border-[#f44336] font-bold animate-shake">{error}</div>}
        </div>
      )}

      {/* Stage 2: Authentication */}
      {stage === 'stage2' && (
        <div className="bg-white rounded-[20px] p-10 max-w-[700px] w-full shadow-2xl animate-in fade-in duration-500">
          <div className="text-center mb-8">
            <span className="bg-linear-to-br from-[#fd79a8] to-[#e84393] text-white px-5 py-2 rounded-full text-sm font-bold inline-block mb-2">ด่านที่ 2</span>
            <h2 className="text-3xl font-bold text-[#2d3436]">🔑 Authentication</h2>
          </div>

          <div className='flex justify-center items-center flex-col'>
            <h2 className="font-bold mb-2">คำใบ้เริ่มต้น</h2>
            <img src="image_leval2.png" alt="Hint" className="rounded-lg shadow-md mb-4" />
          </div>

          <div className="bg-[#e3f2fd] border-l-5 border-[#2196f3] text-[#1565c0] p-5 rounded-xl my-5">
            <p>ใส่รหัส PIN 4 หลัก </p>
          </div>

          {/* คำใบ้ที่ 1 (10 นาที) */}
          {showHint && (
            <div className="bg-amber-50 border-l-5 border-amber-400 p-4 rounded-xl mb-3 animate-in slide-in-from-top-2 duration-700">
              <h4 className="font-bold text-amber-800">💡 คำใบ้พิเศษที่ 1 (10 นาที):</h4>
              <p className="text-amber-700">เป็นลำดับตัวอักษร</p>
            </div>
          )}

          {/* คำใบ้ที่ 2 (20 นาที) */}
          {showHint2 && (
            <div className="bg-orange-50 border-l-5 border-orange-400 p-4 rounded-xl mb-3 animate-in slide-in-from-top-2 duration-700">
              <h4 className="font-bold text-orange-800">💡 คำใบ้พิเศษที่ 2 (20 นาที):</h4>
              <p className="text-orange-700">มีการบวกกัน</p>
            </div>
          )}

          {/* คำใบ้ที่ 3 (30 นาที) */}
          {showHint3 && (
            <div className="bg-red-50 border-l-5 border-red-400 p-4 rounded-xl mb-3 animate-in slide-in-from-top-2 duration-700">
              <h4 className="font-bold text-red-800">💡 คำใบ้พิเศษที่ 3 (30 นาที):</h4>
              <p className="text-red-700">ใช้ตัวอักษรไม่ซ้ำกัน</p>
            </div>
          )}

          {/* ข้อความบอกสถานะเวลา (จะหายไปเมื่อคำใบ้มาครบแล้ว) */}
          {!showHint3 && (
            <p className="text-gray-400 text-xs text-center italic mb-5">
              {!showHint ? "คำใบ้ถัดไปจะมาใน 10 นาที..." : !showHint2 ? "คำใบ้ที่ 2 จะมาในอีก 10 นาที..." : "คำใบ้สุดท้ายจะมาในอีก 10 นาที..."}
            </p>
          )}

          <form onSubmit={handleStage2Submit} className="flex flex-col md:flex-row gap-3 my-5">
            <input
              type="password"
              maxLength={4}
              placeholder="PIN"
              className="flex-1 p-4 border-2 border-[#dfe6e9] rounded-xl text-2xl text-center tracking-[10px] font-bold focus:outline-none focus:border-[#667eea]"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
            />
            <button className="bg-linear-to-br from-[#667eea] to-[#764ba2] text-white px-8 py-4 rounded-xl font-bold hover:-translate-y-0.5 transition-all">Login</button>
          </form>

          {error && <div className="bg-[#ffebee] text-[#c62828] p-4 rounded-xl border-l-5 border-[#f44336] font-bold animate-shake">{error}</div>}
        </div>
      )}

      {/* Stage 3: Authorization (The Cookie Hack) */}
      {stage === 'stage3' && (
        <div className="bg-white rounded-[20px] p-10 max-w-[700px] w-full shadow-2xl animate-in fade-in duration-500">
          <div className="text-center mb-8">
            <span className="bg-linear-to-br from-[#fd79a8] to-[#e84393] text-white px-5 py-2 rounded-full text-sm font-bold inline-block mb-2">ด่านที่ 3</span>
            <h2 className="text-3xl font-bold text-[#2d3436]">👤 Authorization</h2>
          </div>

          <div className="mt-5">
            <div className="flex justify-between items-center p-5 bg-linear-to-br from-[#667eea] to-[#764ba2] text-white rounded-xl mb-5">
              <h3 className="text-xl font-bold">🚌 Dashboard</h3>
              <div className="bg-white/20 px-4 py-2 rounded-full text-sm">
                Role: <span className={`font-bold uppercase ${userRole === 'driver' ? 'text-[#55efc4]' : 'text-[#ffeaa7]'}`}>{userRole}</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (getCookie('role') === 'driver') setStage('victory');
                else setError(`🚫 Access Denied! คุณเป็น "${userRole}" ระบบต้องการ "driver"`);
              }}
              className={`w-full p-5 text-xl font-bold rounded-xl transition-all mb-5 ${userRole === 'driver' ? 'bg-linear-to-br from-[#00b894] to-[#00cec9] text-white cursor-pointer hover:-translate-y-1 shadow-lg' : 'bg-[#dfe6e9] text-[#b2bec3] cursor-not-allowed'}`}
            >
              🔥 Start Bus Engine
            </button>

            <div className="bg-[#fff3e0] border-l-5 border-[#ff9800] text-[#e65100] p-5 rounded-xl">
              <p className="font-bold">🚫 สถานะปัจจุบัน: {userRole}</p>
              <p className="text-sm opacity-80 mt-2">🔍 แฮกเกอร์ต้องแก้ไข Cookie ด้วยตนเอง (F12 -&gt; Application -&gt; Cookies)</p>
            </div>
            {error && <div className="bg-[#ffebee] text-[#c62828] p-4 rounded-xl border-l-5 border-[#f44336] font-bold mt-4 animate-shake">{error}</div>}
          </div>
        </div>
      )}

      {/* Stage: VICTORY */}
      {stage === 'victory' && (
        <div className="bg-white rounded-[20px] p-10 max-w-[700px] w-full shadow-2xl animate-in fade-in duration-500 text-center">
          <h1 className="text-4xl font-bold text-[#00b894] mb-5">🎊 MISSION SUCCESS!</h1>
          <div className="bg-[#2d3436] p-8 rounded-2xl my-5">
            <p className="text-[#ffeaa7] text-xl font-bold mb-3">🏁 FLAG ค้นพบแล้ว:</p>
            <code className="block text-[#00ff00] font-mono text-lg bg-[#1e1e1e] p-4 rounded-md select-all drop-shadow-[0_0_8px_#00ff00]">
              {FLAG}
            </code>
          </div>
          <button
            className="bg-linear-to-br from-[#667eea] to-[#764ba2] text-white px-10 py-4 rounded-full font-bold text-lg hover:-translate-y-1 transition-all shadow-lg"
            onClick={resetGame}
          >
            🔄 เล่นอีกครั้ง
          </button>
        </div>
      )}

      <footer className="fixed bottom-3 left-1/2 -translate-x-1/2 bg-black/30 text-white px-5 py-2 rounded-full text-sm backdrop-blur-sm">
        SUT Cyber Security Workshop 2026
      </footer>
    </div>
  );
}

export default App;