import React, { useState, useEffect } from 'react';
import './App.css';

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
  // -----------------------------------------------------------
  // [MODIFIED] เปลี่ยนการสร้าง State stage ให้โหลดจาก localStorage
  // -----------------------------------------------------------
  const [stage, setStage] = useState<GameStage>(() => {
    const savedStage = localStorage.getItem('sut_ctf_stage');
    // ตรวจสอบว่ามีค่าที่บันทึกไว้ไหม ถ้ามีให้ใช้ท่านั้น ถ้าไม่มีให้เริ่มที่ 'intro'
    return (savedStage as GameStage) || 'intro';
  });

  const [usernameInput, setUsernameInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('passenger');
  
  // State สำหรับคำใบ้
  const [showHint, setShowHint] = useState(false);
  const [showHint2, setShowHint2] = useState(false);
  const [showHint3, setShowHint3] = useState(false);

  // Stage 3: Captcha States
  const [authStep, setAuthStep] = useState<'verify' | 'role'>('verify');
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [isHuman, setIsHuman] = useState(false);
  const [visualRecognition, setVisualRecognition] = useState(false);
  const [captchaPassed, setCaptchaPassed] = useState(false);

  // -----------------------------------------------------------
  // [NEW] useEffect สำหรับบันทึก Stage ลง localStorage ทุกครั้งที่เปลี่ยนด่าน
  // -----------------------------------------------------------
  useEffect(() => {
    localStorage.setItem('sut_ctf_stage', stage);
  }, [stage]);

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
    setStage('intro'); // เมื่อเซ็ตเป็น intro useEffect จะบันทึกลง localStorage ให้เอง
    setUsernameInput('');
    setPinInput('');
    setError('');
    
    // Reset Stage 3 states
    setAuthStep('verify');
    setVerifySuccess(false);
    setSelectedImages([]);
    setIsHuman(false);
    setVisualRecognition(false);
    setCaptchaPassed(false);
  };

  // useEffect สำหรับดักจับการเข้าด่าน 1 และจัดการ Timer
  useEffect(() => {
    if (stage === 'stage1') {
      setShowHint(false);
      setShowHint2(false);
      setShowHint3(false);

      const timer1 = setTimeout(() => setShowHint(true), 600000);   // 10 วินาที (ตัวอย่าง)
      const timer2 = setTimeout(() => setShowHint2(true), 1200000);  // 20 วินาที
      const timer3 = setTimeout(() => setShowHint3(true), 1800000);  // 30 วินาที

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [stage]);

  // useEffect สำหรับดักจับการเข้าด่าน 2 และจัดการ Timer
  useEffect(() => {
    if (stage === 'stage2') {
      setShowHint(false);
      setShowHint2(false);
      setShowHint3(false);

      const timer1 = setTimeout(() => setShowHint(true), 600000); 
      const timer2 = setTimeout(() => setShowHint2(true), 1200000); 
      const timer3 = setTimeout(() => setShowHint3(true), 1800000); 

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
      // เมื่อโหลดกลับมาด่าน 3 ให้เช็ค Cookie ทันทีเพื่อให้ Role ถูกต้อง
      const current = getCookie('role') || 'passenger';
      setUserRole(current);

      interval = setInterval(() => {
        const liveCookie = getCookie('role');
        if (liveCookie && liveCookie !== userRole) setUserRole(liveCookie);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [stage, userRole]);

  // Clear error when stage or authStep changes
  useEffect(() => {
    setError('');
  }, [stage, authStep]);

  const handleStage1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput === CORRECT_USERNAME) {
      setError('');
      setStage('stage2');
    } else {
      setError('❌ Username ไม่ถูกต้อง! ');
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
        <div className="bg-white rounded-[20px] p-10 max-w-175 w-full shadow-[0_20px_60px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-bottom-8 duration-500 text-center">
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
            <div className='border border-amber-600 text-amber-600 bg-amber-200 rounded-2xl mt-5 h-18 flex justify-center items-center px-4'>
              <h3>นี่คือ Cyphertext ที่ได้ AIOMG โดยให้เอาภาพด้านล่างคือรหัสที่จะเอามาถอดเพื่อหา Plaintext</h3>
            </div>
            <img src="/image_level1.png" alt="Logo" className="mx-auto mt-4 max-w-full h-auto" />
          </div>

          <div className="bg-[#2d3436] p-8 rounded-xl my-5 overflow-hidden relative">
            <div className="flex overflow-hidden select-all">
              <span className="text-[#00ff00] font-mono text-2xl font-bold whitespace-nowrap animate-scroll drop-shadow-[0_0_10px_#00ff00]">
                You are gay.
              </span>
            </div>
          </div>

          {showHint && (
            <div className="bg-amber-50 border-l-5 border-amber-400 p-4 rounded-xl mb-3 animate-in slide-in-from-top-2 duration-700">
              <h4 className="font-bold text-amber-800">💡 คำใบ้พิเศษที่ 1 (10 นาที):</h4>
              <p className="text-amber-700">ให้หา Key ตำแหน่งตาม column</p>
            </div>
          )}

          {showHint2 && (
            <div className="bg-orange-50 border-l-5 border-orange-400 p-4 rounded-xl mb-3 animate-in slide-in-from-top-2 duration-700">
              <h4 className="font-bold text-orange-800">💡 คำใบ้พิเศษที่ 2 (20 นาที):</h4>
              <p className="text-orange-700">เอา key แปลงเป็นตัวเลขตามตำแหน่งในภาษาอังกฤษ A = 0 ,B = 1</p>
            </div>
          )}

          {showHint3 && (
            <div className="bg-red-50 border-l-5 border-red-400 p-4 rounded-xl mb-3 animate-in slide-in-from-top-2 duration-700">
              <h4 className="font-bold text-red-800">💡 คำใบ้พิเศษที่ 3 (30 นาที):</h4>
              <p className="text-red-700">เอา key มาลบแล้ว mod ด้วย 26 และแปลง</p>
            </div>
          )}

          {!showHint3 && (
            <p className="text-gray-400 text-xs text-center italic mb-5">
              {!showHint ? "คำใบ้ถัดไปจะมาใน 10 นาที..." : !showHint2 ? "คำใบ้ที่ 2 จะมาในอีก 10 นาที..." : "คำใบ้สุดท้ายจะมาในอีก 10 นาที..."}
            </p>
          )}

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

          {showHint && (
            <div className="bg-amber-50 border-l-5 border-amber-400 p-4 rounded-xl mb-3 animate-in slide-in-from-top-2 duration-700">
              <h4 className="font-bold text-amber-800">💡 คำใบ้พิเศษที่ 1 (10 นาที):</h4>
              <p className="text-amber-700">เป็นลำดับตัวอักษร</p>
            </div>
          )}

          {showHint2 && (
            <div className="bg-orange-50 border-l-5 border-orange-400 p-4 rounded-xl mb-3 animate-in slide-in-from-top-2 duration-700">
              <h4 className="font-bold text-orange-800">💡 คำใบ้พิเศษที่ 2 (20 นาที):</h4>
              <p className="text-orange-700">มีการบวกกัน</p>
            </div>
          )}

          {showHint3 && (
            <div className="bg-red-50 border-l-5 border-red-400 p-4 rounded-xl mb-3 animate-in slide-in-from-top-2 duration-700">
              <h4 className="font-bold text-red-800">💡 คำใบ้พิเศษที่ 3 (30 นาที):</h4>
              <p className="text-red-700">ใช้ตัวอักษรไม่ซ้ำกัน</p>
            </div>
          )}

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
        <div className="bg-white rounded-[20px] p-10 max-w-175 w-full shadow-2xl animate-in fade-in duration-500">
          <div className="text-center mb-8">
            <span className="bg-linear-to-br from-[#fd79a8] to-[#e84393] text-white px-5 py-2 rounded-full text-sm font-bold inline-block mb-2">ด่านที่ 3</span>
            <h2 className="text-3xl font-bold text-[#2d3436]">👤 Authorization</h2>
          </div>

          {/* ===================== STEP 1: SUBJECT ATTRIBUTE ===================== */}
          {authStep === 'verify' && (
            <>
              {/* Dashboard */}
              <div className="flex justify-between items-center p-5 bg-linear-to-br from-[#667eea] to-[#764ba2] text-white rounded-xl mb-5">
                <h3 className="text-xl font-bold">🚌 Dashboard</h3>
                <div className="bg-white/20 px-4 py-2 rounded-full text-sm">
                  Role: <span className="font-bold text-[#ffeaa7]">PASSENGER</span>
                </div>
              </div>

              {/* CAPTCHA */}
              <div
                className={`p-5 rounded-xl transition-all duration-500
    ${verifySuccess
                    ? "bg-green-100 border-2 border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.7)]"
                    : "bg-gray-100"
                  }
  `}
              >
                <h4 className="font-bold mb-2">🧠 Subject Attribute Verification</h4>
                <p className="text-sm mb-3">กุ๊งกิ๊ง กุ๊งกิ๊ง กุ๊งกุ๊งกุ๊งกุ๊ง กิ๊งกิ๊งกิ๊งกิ๊ง <b>มีกระดิ่งทั้งหมดกี่ลูก</b></p>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[0, 1, 2].map((i) => (
                    <img
                      key={i}
                      src={
                        i === 0
                          ? "/4.avif"   // BUS (จงใจหลอก)
                          : i === 1
                            ? "/7.jpg"    // NOT BUS
                            : "/12.avif" // BUS (จงใจหลอก)
                      }
                      onClick={() => {
                        setError(''); // Clear error when user interacts
                        setSelectedImages(prev =>
                          prev.includes(i)
                            ? prev.filter(x => x !== i)
                            : [...prev, i]
                        );
                      }}
                      className={`cursor-pointer rounded-lg border-4 ${selectedImages.includes(i)
                          ? "border-green-500"
                          : "border-transparent"
                        }`}
                    />
                  ))}
                </div>

                <div className="flex justify-center flex-col items-center gap-4">
                  <button
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-600 transition-colors"
                    onClick={() => {
                      const correct =
                        !selectedImages.includes(0) &&
                        !selectedImages.includes(2) &&
                        selectedImages.includes(1);

                      if (correct) {
                        setIsHuman(true);
                        setVisualRecognition(true);
                        setCaptchaPassed(true);
                        setVerifySuccess(true); // ⭐ trigger effect

                        // หน่วงเวลาเพื่อให้เห็นเอฟเฟกต์
                        setTimeout(() => {
                          setAuthStep('role');
                        }, 1500);
                      } else {
                        setError("❌ CAPTCHA Failed! กรุณาเลือกเลขให้ถูกต้อง");
                      }
                    }}
                  >
                    Verify
                  </button>

                  {error && (
                    <div className="w-full bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 text-sm font-bold animate-shake text-center">
                      {error}
                    </div>
                  )}
                </div>

                <p className="text-xs mt-2 text-gray-600">
                  isHuman={String(isHuman)} | visualRecognition={String(visualRecognition)}
                </p>
              </div>
            </>
          )}

          {/* ===================== STEP 2: ROLE CHECK ===================== */}
          {authStep === 'role' && (
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
              <div>
                <p className="text-sm text-gray-500 text-center">
                  Hint: <b>คนขับรถ</b>มีผู้โดยสารชื่อ <b>cookie</b> คนขับรถต้องไปส่งผู้โดยสารที่ <b>F12</b>
                </p>
              </div>
              

              <div className="bg-[#fff3e0] border-l-5 border-[#ff9800] text-[#e65100] p-5 rounded-xl">
                <p className="font-bold">🚫 สถานะปัจจุบัน: {userRole}</p>
              </div>
              
              {error && <div className="bg-[#ffebee] text-[#c62828] p-4 rounded-xl border-l-5 border-[#f44336] font-bold mt-4 animate-shake">{error}</div>}
            </div>
          )}
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