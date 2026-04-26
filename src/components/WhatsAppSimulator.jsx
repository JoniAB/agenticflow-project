import { useState, useRef, useEffect } from 'react';
import { Send, Phone, Video, MoreVertical } from 'lucide-react';

const BOT_RESPONSES = {
  'שלום': 'שלום! 👋 אני העוזר החכם. במה אוכל לעזור?\n\n1️⃣ מחירים\n2️⃣ קביעת פגישה\n3️⃣ שאלות כלליות',
  'היי': 'שלום! 👋 אני העוזר החכם. במה אוכל לעזור?\n\n1️⃣ מחירים\n2️⃣ קביעת פגישה\n3️⃣ שאלות כלליות',
  'הי': 'שלום! 👋 אני העוזר החכם. במה אוכל לעזור?\n\n1️⃣ מחירים\n2️⃣ קביעת פגישה\n3️⃣ שאלות כלליות',
  '1': '💰 החבילות שלנו:\n\n• בסיסי – 990₪/חודש\n• מתקדם – 1,990₪/חודש\n• פרימיום – 3,500₪/חודש\n\nרוצה שנדבר על מה מתאים לך?',
  'מחירים': '💰 החבילות שלנו:\n\n• בסיסי – 990₪/חודש\n• מתקדם – 1,990₪/חודש\n• פרימיום – 3,500₪/חודש\n\nרוצה שנדבר על מה מתאים לך?',
  '2': '📅 מעולה! מתי נוח לך?\n\n• מחר ב-10:00\n• מחר ב-14:00\n• יום ה\' ב-11:00',
  'פגישה': '📅 מעולה! מתי נוח לך?\n\n• מחר ב-10:00\n• מחר ב-14:00\n• יום ה\' ב-11:00',
  'מחר ב-10:00': '✅ נקבע! פגישה למחר ב-10:00.\nתקבל תזכורת שעה לפני. נתראה! 😊',
  'מחר ב-14:00': '✅ נקבע! פגישה למחר ב-14:00.\nתקבל תזכורת שעה לפני. נתראה! 😊',
  'כן': '🎉 מעולה! מה הכי מתאים לך מבחינת תקציב?\n\n• עד 1,000₪/חודש\n• עד 2,000₪/חודש\n• גמיש',
  'default': 'מעניין! 🤔 תן לי לחבר אותך עם נציג שיוכל לעזור יותר. מה מספר הטלפון שלך?',
};

const INITIAL_MESSAGE = {
  id: 1,
  from: 'bot',
  text: 'שלום! 👋 כתוב "שלום" כדי להתחיל',
  time: '10:00',
};

function getBotReply(text) {
  const t = text.trim();
  const match = Object.keys(BOT_RESPONSES).find(
    (key) => key !== 'default' && t.includes(key)
  );
  return BOT_RESPONSES[match ?? 'default'];
}

function now() {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-1.5 self-start">
      <span className="text-base leading-none">🤖</span>
      <div className="bg-gray-700 rounded-xl rounded-bl-none px-3 py-2 flex gap-1 items-center">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}

export default function WhatsAppSimulator() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, typing]);

  function sendMessage() {
    const text = input.trim();
    if (!text || typing) return;
    setInput('');

    const userMsg = { id: Date.now(), from: 'user', text, time: now() };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);

    const delay = 1000 + Math.random() * 500;
    setTimeout(() => {
      const botMsg = {
        id: Date.now() + 1,
        from: 'bot',
        text: getBotReply(text),
        time: now(),
      };
      setTyping(false);
      setMessages((prev) => [...prev, botMsg]);
    }, delay);
  }

  function reset() {
    setMessages([INITIAL_MESSAGE]);
    setInput('');
    setTyping(false);
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col items-center gap-3" dir="rtl">
      {/* Reset button */}
      <button
        onClick={reset}
        className="text-xs text-gray-400 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full px-3 py-1"
      >
        ↺ אפס שיחה
      </button>

      {/* Phone frame */}
      <div className="relative" style={{ width: 280 }}>
        {/* AI-Powered badge */}
        <div className="absolute -top-3 right-3 z-10 bg-indigo-500 text-white text-xs font-bold rounded-full px-3 py-1 shadow-lg shadow-indigo-500/40 whitespace-nowrap">
          ✨ AI-Powered
        </div>

        {/* Outer shell */}
        <div
          className="bg-neutral-900 rounded-[48px] p-3 shadow-2xl"
          style={{
            boxShadow:
              '0 0 0 1px #555, 0 0 0 3px #1c1c1e, 0 0 0 5px #3a3a3c, 0 0 0 7px #1c1c1e, 0 40px 100px rgba(0,0,0,.7)',
          }}
        >
          {/* Screen */}
          <div
            className="rounded-[36px] overflow-hidden flex flex-col"
            style={{ height: 560, background: '#0d1117' }}
          >
            {/* Dynamic Island notch */}
            <div className="flex justify-center pt-2.5 pb-1 flex-shrink-0" style={{ background: '#0d1117' }}>
              <div
                className="bg-black flex items-center justify-end pr-2.5 gap-1.5"
                style={{ width: 120, height: 34, borderRadius: 20 }}
              >
                <div
                  className="bg-neutral-800 rounded-full border border-neutral-700"
                  style={{
                    width: 10,
                    height: 10,
                    boxShadow: 'inset 0 0 0 2px #111, 0 0 3px rgba(100,200,255,.3)',
                  }}
                />
              </div>
            </div>

            {/* WhatsApp header */}
            <div
              className="flex items-center gap-2 px-3 py-2 flex-shrink-0"
              style={{ background: '#1f2c34' }}
            >
              <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center text-base flex-shrink-0">
                🤖
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-semibold leading-tight">עוזר AI</div>
                <div className="text-emerald-400 text-[10px] leading-tight">מחובר</div>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Video size={18} />
                <Phone size={18} />
                <MoreVertical size={18} />
              </div>
            </div>

            {/* Messages */}
            <div
              ref={containerRef}
              className="flex-1 overflow-y-auto px-2.5 py-2 flex flex-col gap-2"
              style={{ background: '#0d1117', scrollBehavior: 'smooth' }}
            >
              {messages.map((msg) =>
                msg.from === 'bot' ? (
                  <div key={msg.id} className="flex items-end gap-1.5 self-start max-w-[85%]">
                    <span className="text-base leading-none flex-shrink-0">🤖</span>
                    <div className="bg-gray-700 text-gray-100 rounded-xl rounded-bl-none px-2.5 py-1.5">
                      <p className="text-[11px] leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>
                        {msg.text}
                      </p>
                      <p className="text-right mt-0.5" style={{ fontSize: 9, color: 'rgba(255,255,255,.35)' }}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div key={msg.id} className="self-end max-w-[85%]">
                    <div className="bg-emerald-700 text-white rounded-xl rounded-br-none px-2.5 py-1.5">
                      <p className="text-[11px] leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>
                        {msg.text}
                      </p>
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        <p style={{ fontSize: 9, color: 'rgba(255,255,255,.55)' }}>{msg.time}</p>
                        <span className="text-cyan-400" style={{ fontSize: 9 }}>✓✓</span>
                      </div>
                    </div>
                  </div>
                )
              )}
              {typing && <TypingIndicator />}
            </div>

            {/* Input bar */}
            <div
              className="flex items-center gap-2 px-2.5 py-2 flex-shrink-0"
              style={{ background: '#1a2530', borderTop: '1px solid rgba(255,255,255,.07)' }}
            >
              <button
                onClick={sendMessage}
                className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 hover:bg-emerald-400 transition-colors"
              >
                <Send size={14} color="white" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="כתוב הודעה..."
                dir="rtl"
                autoComplete="off"
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/35 font-sans"
                style={{ fontSize: 11, fontFamily: 'Rubik, sans-serif' }}
              />
              <span className="text-lg leading-none cursor-pointer" style={{ color: 'rgba(255,255,255,.4)' }}>
                😊
              </span>
            </div>

            {/* Home bar */}
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{ height: 20, background: '#0d1117' }}
            >
              <div className="rounded-full" style={{ width: 100, height: 4, background: 'rgba(255,255,255,.25)' }} />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #9CA3AF;
          animation: typing-bounce 1.2s infinite ease-in-out;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
