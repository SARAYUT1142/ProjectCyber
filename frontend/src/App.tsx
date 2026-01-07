import React, { useState, useEffect } from 'react';
import './App.css';

// คำตอบที่ถูกต้อง
const CORRECT_USERNAME = 'SUT_Student_2026';
const CORRECT_PIN = '3600'; // 4 หลักท้ายของเบอร์โทร รพ. มทส. (044-223-600)
const FLAG = 'FLAG{SUT_Smart_Bus_System_Restored_2026}';

type GameStage = 'intro' | 'stage1' | 'stage2' | 'stage3' | 'victory';

function App() {
  const [stage, setStage] = useState<GameStage>('intro');
  const [usernameInput, setUsernameInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('passenger');

  // ตรวจสอบ Cookie เมื่อเข้าด่าน 3
  useEffect(() => {
    if (stage === 'stage3') {
      const role = getCookie('role') || 'passenger';
      setUserRole(role);
      
      // ถ้ายังไม่มี Cookie ให้สร้าง
      if (!getCookie('role')) {
        setCookie('role', 'passenger', 1);
      }
    }
  }, [stage]);

  // ฟังก์ชันจัดการ Cookie
  const setCookie = (name: string, value: string, days: number) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
  };

  const getCookie = (name: string) => {
    return document.cookie.split('; ').reduce((r, v) => {
      const parts = v.split('=');
      return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, '');
  };

  // ด่านที่ 1: ตรวจสอบ Username
  const handleStage1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput === CORRECT_USERNAME) {
      setError('');
      setStage('stage2');
    } else {
      setError('❌ Username ไม่ถูกต้อง! ลองถอดรหัสอีกครั้ง');
    }
  };

  // ด่านที่ 2: ตรวจสอบ PIN
  const handleStage2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === CORRECT_PIN) {
      setError('');
      setStage('stage3');
    } else {
      setError('❌ PIN ไม่ถูกต้อง! ลองค้นหาข้อมูลอีกครั้ง');
    }
  };

  // ด่านที่ 3: กดปุ่ม Start Bus
  const handleStartBus = () => {
    const currentRole = getCookie('role') || 'passenger';
    if (currentRole === 'driver') {
      setStage('victory');
    } else {
      setError('🚫 Access Denied. You are "Passenger", only "Driver" can start the bus.');
    }
  };

  return (
    <div className="App">
      {/* Intro Screen */}
      {stage === 'intro' && (
        <div className="screen intro-screen">
          <div className="bus-icon">🚌</div>
          <h1 className="game-title">The SUT Smart Bus Hack</h1>
          <div className="story-box">
            <p>⚠️ ระบบเดินรถเมล์มอถูกล็อก!</p>
            <p>ผู้เล่นต้องสวมบทเป็นแฮกเกอร์เพื่อกู้คืนระบบเดินรถ</p>
            <p>ให้เพื่อนๆ ได้ไปเรียนทันเวลา</p>
          </div>
          <button className="start-btn" onClick={() => setStage('stage1')}>
            🔓 เริ่มภารกิจ
          </button>
        </div>
      )}

      {/* Stage 1: Cryptography */}
      {stage === 'stage1' && (
        <div className="screen stage-screen">
          <div className="stage-header">
            <span className="stage-badge">ด่านที่ 1</span>
            <h2>🔐 Cryptography</h2>
          </div>
          
          <div className="info-box">
            <p>ระบบถูกล็อก! คุณต้องหา <strong>Username</strong> เพื่อเข้าสู่ระบบ</p>
          </div>

          <div className="cipher-display">
            <div className="marquee">
              <span>U1VUX1N0dWRlbnRfMjAyNg==</span>
            </div>
          </div>

          <div className="hint-box">
            <p>💡 <strong>คำใบ้:</strong> รหัสนี้คือชื่อผู้ใช้ (Username) ที่ถูกเข้ารหัสด้วยวิธีพื้นฐานที่นิยมใช้บนเว็บ (ลงท้ายด้วย ==)</p>
          </div>

          <form onSubmit={handleStage1Submit} className="input-form">
            <input
              type="text"
              placeholder="ใส่ Username ที่ถอดรหัสได้"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="input-field"
            />
            <button type="submit" className="submit-btn">ยืนยัน</button>
          </form>

          {error && <div className="error-msg">{error}</div>}
        </div>
      )}

      {/* Stage 2: Authentication */}
      {stage === 'stage2' && (
        <div className="screen stage-screen">
          <div className="stage-header">
            <span className="stage-badge">ด่านที่ 2</span>
            <h2>🔑 Authentication</h2>
          </div>

          <div className="success-box">
            <p>✅ Username ถูกต้อง! ยินดีต้อนรับ {CORRECT_USERNAME}</p>
          </div>

          <div className="info-box">
            <p>ระบบต้องการ <strong>รหัสฉุกเฉิน (Emergency PIN)</strong> 4 หลัก</p>
          </div>

          <div className="hint-box">
            <p>💡 <strong>คำใบ้:</strong> รหัสคือเลขท้าย 4 ตัว ของเบอร์โทรศัพท์ <strong>โรงพยาบาลมหาวิทยาลัยเทคโนโลยีสุรนารี</strong></p>
            <p className="hint-sub">🔍 ลองค้นหาด้วย Google: "เบอร์โทร โรงพยาบาล มทส"</p>
          </div>

          <form onSubmit={handleStage2Submit} className="input-form">
            <input
              type="text"
              placeholder="ใส่ PIN 4 หลัก"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              maxLength={4}
              className="input-field pin-input"
            />
            <button type="submit" className="submit-btn">ยืนยัน</button>
          </form>

          {error && <div className="error-msg">{error}</div>}
        </div>
      )}

      {/* Stage 3: Authorization */}
      {stage === 'stage3' && (
        <div className="screen stage-screen">
          <div className="stage-header">
            <span className="stage-badge">ด่านที่ 3</span>
            <h2>👤 Authorization</h2>
          </div>

          <div className="success-box">
            <p>✅ เข้าสู่ระบบสำเร็จ!</p>
          </div>

          <div className="dashboard">
            <div className="dashboard-header">
              <h3>🚌 SUT Smart Bus Dashboard</h3>
              <div className="role-badge">
                Role: <span className={`role ${userRole}`}>{userRole}</span>
              </div>
            </div>

            <div className="bus-status">
              <div className="status-item">
                <span className="status-label">สถานะเครื่องยนต์:</span>
                <span className="status-value offline">🔴 ปิด</span>
              </div>
              <div className="status-item">
                <span className="status-label">สายรถ:</span>
                <span className="status-value">มอ - หอพัก</span>
              </div>
            </div>

            <button 
              className={`start-bus-btn ${userRole === 'driver' ? 'enabled' : 'disabled'}`}
              onClick={handleStartBus}
            >
              🔥 Start Bus Engine
            </button>

            <div className="hint-box">
              <p>💡 <strong>คำใบ้:</strong> คนขับรถชอบกินคุกกี้ (Cookie)</p>
              <p className="hint-sub">🔍 ลองกด F12 และไปดูที่ Application → Cookies</p>
            </div>

            {error && <div className="error-msg">{error}</div>}
          </div>
        </div>
      )}

      {/* Victory Screen */}
      {stage === 'victory' && (
        <div className="screen victory-screen">
          <div className="victory-animation">
            <div className="bus-icon large">🚌</div>
            <div className="confetti">🎉</div>
          </div>
          <h1 className="victory-title">🎊 ภารกิจสำเร็จ!</h1>
          <div className="victory-box">
            <p>✅ คุณได้กู้คืนระบบเดินรถเมล์มอสำเร็จแล้ว!</p>
            <p>ตอนนี้เพื่อนๆ สามารถไปเรียนทันเวลาแล้ว</p>
          </div>
          <div className="flag-box">
            <p className="flag-label">🏁 FLAG:</p>
            <code className="flag-code">{FLAG}</code>
          </div>
          <div className="stats-box">
            <h3>สรุปทักษะที่ใช้:</h3>
            <ul>
              <li>✅ Cryptography (Base64 Decoding)</li>
              <li>✅ Authentication (PIN Verification / OSINT)</li>
              <li>✅ Authorization (Cookie Manipulation)</li>
            </ul>
          </div>
          <button className="restart-btn" onClick={() => {
            setStage('intro');
            setUsernameInput('');
            setPinInput('');
            setError('');
            document.cookie = 'role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          }}>
            🔄 เล่นอีกครั้ง
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="game-footer">
        <p>🎓 CTF Challenge by มทส. | Difficulty: ⭐ Beginner</p>
      </footer>
    </div>
  );
}

export default App;
