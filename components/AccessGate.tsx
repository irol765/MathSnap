import React, { useState } from 'react';
import { Icons } from './Icon';
import { Language } from '../types';

interface AccessGateProps {
  onUnlock: () => void;
  lang: Language;
  onLanguageToggle: () => void;
}

export const AccessGate: React.FC<AccessGateProps> = ({ onUnlock, lang, onLanguageToggle }) => {
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const t = {
    en: {
      title: "Security Check",
      subtitle: "Please enter the access code to use StudySnap.",
      placeholder: "Enter Access Code",
      button: "Unlock",
      error: "Incorrect access code. Please try again.",
      footer: "Contact the administrator if you don't have a code."
    },
    zh: {
      title: "安全验证",
      subtitle: "请输入访问码以使用 StudySnap。",
      placeholder: "在此输入访问码",
      button: "解锁",
      error: "访问码错误，请重试。",
      footer: "如果您没有访问码，请联系管理员。"
    }
  };

  const text = t[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setVerifying(true);

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inputCode }),
      });

      if (response.ok) {
        onUnlock();
      } else {
        setError(true);
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Language Toggle (Top Right) */}
      <div className="absolute top-4 right-4">
         <button
           onClick={onLanguageToggle}
           className="flex items-center px-3 py-1.5 rounded-full bg-white shadow-sm text-slate-700 font-semibold text-sm transition-colors border border-slate-200"
         >
           <span className={lang === 'zh' ? "text-indigo-600" : "text-slate-400"}>中</span>
           <span className="mx-1 text-slate-300">/</span>
           <span className={lang === 'en' ? "text-indigo-600" : "text-slate-400"}>EN</span>
         </button>
      </div>

      <div className={`w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden ${shake ? 'animate-shake' : ''}`}>
        <div className="bg-indigo-600 p-8 text-center">
          <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
            <div className="text-white font-bold text-3xl">🔒</div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{text.title}</h2>
          <p className="text-indigo-100 opacity-90">{text.subtitle}</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="password"
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value);
                  setError(false);
                }}
                className={`
                  w-full px-4 py-3 rounded-xl border-2 outline-none transition-all text-center text-lg tracking-widest
                  ${error
                    ? 'border-red-300 bg-red-50 focus:border-red-500 text-red-900 placeholder-red-300'
                    : 'border-slate-200 bg-slate-50 focus:border-indigo-500 focus:bg-white text-slate-800'
                  }
                `}
                placeholder={text.placeholder}
                autoFocus
              />
              {error && (
                <p className="text-red-500 text-sm mt-2 text-center flex items-center justify-center animate-fade-in">
                  <Icons.Alert className="w-4 h-4 mr-1" />
                  {text.error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={verifying}
              className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-xl transition-all transform active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {verifying ? (lang === 'zh' ? '验证中...' : 'Verifying...') : text.button}
            </button>
          </form>

          <div className="mt-8 text-center">
             <p className="text-xs text-slate-400">{text.footer}</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
};
