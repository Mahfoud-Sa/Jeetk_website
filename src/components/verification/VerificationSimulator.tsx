import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Smartphone, MessageSquare, PhoneIncoming, Phone, 
  Volume2, VolumeX, Check, CheckCheck, Send, Bell 
} from 'lucide-react';

interface VerificationSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  channel: 'email' | 'whatsapp' | 'sms' | 'call';
  code: string;
  phoneNumber: string;
  email: string;
  language: 'en' | 'ar';
}

export const VerificationSimulator = ({
  isOpen,
  onClose,
  channel,
  code,
  phoneNumber,
  email,
  language
}: VerificationSimulatorProps) => {
  const isRtl = language === 'ar';
  const [isAnswered, setIsAnswered] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechInstance, setSpeechInstance] = useState<SpeechSynthesisUtterance | null>(null);
  const [callTimer, setCallTimer] = useState(0);

  // Auto ring timer
  useEffect(() => {
    let timer: any;
    if (isOpen && channel === 'call' && isAnswered) {
      timer = setInterval(() => {
        setCallTimer(prev => prev + 1);
      }, 1000);
    } else {
      setCallTimer(0);
    }
    return () => clearInterval(timer);
  }, [isOpen, channel, isAnswered]);

  // Handle Speech synthesis for Direct Call
  useEffect(() => {
    if (isAnswered && channel === 'call') {
      speakCode();
    }
    return () => {
      // Clean up speech on close / unmount
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isAnswered, channel]);

  const speakCode = () => {
    if (!('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel(); // Stop any pending speech
    
    const codeSpaced = code.split('').join(', ');
    const textMsg = isRtl 
      ? `مرحباً بك في خدمة جيتك. هذا هو نظام الاتصال التلقائي لتفعيل حسابك. رمز التحقق الخاص بك هو: ${codeSpaced}. نكرر: ${codeSpaced}. شكراً لك ومع السلامة.`
      : `Hello, welcome to Jeetk delivery service. This is the automated verification system. Your activation code is: ${codeSpaced}. I repeat: ${codeSpaced}. Thank you and goodbye.`;

    const utterance = new SpeechSynthesisUtterance(textMsg);
    utterance.lang = isRtl ? 'ar-SA' : 'en-US';
    utterance.rate = 0.85; // slightly slower for clarity
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setSpeechInstance(utterance);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-sm bg-zinc-950 text-white rounded-[40px] border-8 border-zinc-800 shadow-2xl shadow-black/80 overflow-hidden font-sans p-6"
        >
          {/* Top Speaker/Camera Bar */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-900 rounded-full flex items-center justify-center gap-1.5 px-3 z-10">
            <div className="w-12 h-1 bg-zinc-700 rounded-full" />
            <div className="w-2.5 h-2.5 bg-zinc-800 rounded-full border border-zinc-700 shrink-0" />
          </div>

          {/* Close trigger */}
          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Device Header */}
          <div className="text-center pt-8 pb-3 border-b border-zinc-800/80 mb-4">
            <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 font-medium mb-1">
              <Smartphone className="w-3.5 h-3.5 text-primary" />
              <span>{isRtl ? 'محاكي بوابة التحقق للأجهزة' : 'Security Channel Simulator'}</span>
            </div>
            <p className="text-[10px] text-zinc-500 max-w-[240px] mx-auto leading-relaxed">
              {isRtl 
                ? 'لوحة فحص الأجهزة لمحاكاة استلام وقراءة كود التحقق OTP.' 
                : 'Interactive sandbox to demo real-time OTP message dispatch or call receipt.'}
            </p>
          </div>

          {/* --- WHATSAPP SIMULATION --- */}
          {channel === 'whatsapp' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1 text-emerald-400 font-bold text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>{isRtl ? 'مستلم من واتساب' : 'WhatsApp Client Recipient'}</span>
              </div>

              <div className="bg-[#0b141a] rounded-3xl p-4 border border-zinc-800 relative min-h-[180px] flex flex-col justify-between">
                <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-2 mb-3">
                  <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white shrink-0 font-bold text-xs">
                    JT
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">Jeetk Security</h4>
                    <p className="text-[9px] text-[#25d366] font-medium">{isRtl ? 'حساب أعمال موثق ✓' : 'Verified Business Account ✓'}</p>
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="bg-[#1f2c34] text-zinc-200 text-xs p-3 rounded-2xl rounded-tl-none max-w-[85%] border border-[#2b3942]">
                    <p className="leading-relaxed">
                      {isRtl 
                        ? `مرحباً بك في جيتك! رمز الأمان الخاص بك للتفعيل هو:` 
                        : `Welcome to Jeetk! Your account verification security code is:`}
                    </p>
                    <p className="text-base font-bold tracking-widest text-[#25d366] my-2 bg-black/30 p-2 rounded-xl text-center border border-zinc-800 select-all">
                      {code}
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      {isRtl 
                        ? 'يرجى عدم مشاركة هذا الرمز مع أي شخص لحماية حسابك.' 
                        : 'Never share this code with anyone to secure your profile.'}
                    </p>
                  </div>
                </div>

                <div className="text-[9px] text-zinc-500 text-end mt-2 flex items-center justify-end gap-1 px-1">
                  <span>9:48 AM</span>
                  <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                </div>
              </div>
            </div>
          )}

          {/* --- SMS SIMULATION --- */}
          {channel === 'sms' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1 text-blue-400 font-bold text-sm">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                <span>{isRtl ? 'رسالة نصية واردة (SMS)' : 'Incoming SMS message'}</span>
              </div>

              <div className="bg-zinc-900 rounded-3xl p-4 border border-zinc-800 min-h-[160px] flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-zinc-400" />
                    <span className="text-xs font-bold text-zinc-300">JEETK-SMS</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">{isRtl ? 'الآن' : 'now'}</span>
                </div>

                <div className="space-y-2 flex-1">
                  <p className="text-zinc-200 text-xs leading-relaxed">
                    {isRtl
                      ? `جيتك: رمز التفعيل المؤقت لتسجيل دخولك هو [${code}]. هذا الرمز صالح لمدة 10 دقائق فقط.`
                      : `JEETK: Your temporary login activation code is [${code}]. This OTP is valid for 10 minutes.`}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-zinc-800/60 flex justify-between items-center text-[10px] text-zinc-400">
                  <span>{isRtl ? 'اضغط مطولاً للنسخ' : 'Tap to copy code'}</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(code);
                    }}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 mt-1"
                  >
                    {isRtl ? 'نسخ الرمز' : 'Copy Code'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- DIRECT CALL SIMULATION --- */}
          {channel === 'call' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1 text-red-400 font-bold text-sm">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>{isRtl ? 'نظام الاتصال المباشر' : 'Direct Verification Call'}</span>
              </div>

              {!isAnswered ? (
                <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 text-center space-y-6 min-h-[220px] flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                      <PhoneIncoming className="w-6 h-6 text-red-500" />
                    </div>
                    <h3 className="font-bold text-sm">{isRtl ? 'اتصال تلقائي وارد' : 'Incoming Autodial Call'}</h3>
                    <p className="text-xs text-zinc-400 mt-1">{phoneNumber || '+966 xx xxx xxxx'}</p>
                    <p className="text-[10px] text-zinc-500 mt-2">
                      {isRtl 
                        ? 'سيتصل بك نظامنا ويقرأ كود التفعيل هاتفياً.' 
                        : 'Our computer system is calling you to voice out your active OTP.'}
                    </p>
                  </div>

                  <div className="flex justify-around items-center pt-2">
                    <button
                      onClick={() => {
                        stopSpeaking();
                        onClose();
                      }}
                      className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition-all shadow-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => setIsAnswered(true)}
                      className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 transition-all animate-bounce shadow-lg shadow-green-500/20"
                    >
                      <Phone className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-900 rounded-3xl p-5 border border-zinc-800 text-center space-y-4 min-h-[220px] flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-1">
                      {isRtl ? 'تم الرد هاتفياً' : 'CONNECTED'}
                    </p>
                    <h4 className="text-sm font-bold text-emerald-400">{isRtl ? 'جيتك - نظام الاتصال التلقائي' : 'Jeetk Autodial Bot'}</h4>
                    <span className="inline-block text-xs font-mono text-zinc-400 bg-black/40 px-3 py-1 rounded-full mt-1.5">
                      {formatTime(callTimer)}
                    </span>

                    {/* Audio visual simulator waves */}
                    <div className="flex items-center justify-center gap-1 h-8 my-3">
                      {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((scale, i) => (
                        <motion.div
                          key={i}
                          animate={{ height: isSpeaking ? [8, scale * 6, 8] : 8 }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.05 }}
                          className="w-1 bg-primary rounded-full"
                        />
                      ))}
                    </div>

                    {/* Live transcripts */}
                    <div className="bg-black/30 p-3 rounded-2xl border border-zinc-800 text-start">
                      <p className="text-[10px] text-zinc-400 uppercase tracking-wide font-bold mb-1 flex items-center gap-1.5">
                        <Bell className="w-3 h-3 text-primary" />
                        {isRtl ? 'النص الصوتي المكتوب' : 'Speech Transcript'}
                      </p>
                      <p className="text-xs text-zinc-200 leading-relaxed font-arabic">
                        {isRtl 
                          ? `"... كود التحقق الخاص بك هو: ${code} ..."`
                          : `"... Your activation code is: ${code} ..."`}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center items-center gap-4 pt-2">
                    <button
                      onClick={speakCode}
                      disabled={isSpeaking}
                      className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-xl transition-all disabled:opacity-40"
                    >
                      {isSpeaking ? <Volume2 className="w-3.5 h-3.5 text-primary animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
                      <span>{isRtl ? 'إعادة القراءة' : 'Repeat Speak'}</span>
                    </button>

                    <button
                      onClick={() => {
                        stopSpeaking();
                        setIsAnswered(false);
                        onClose();
                      }}
                      className="w-11 h-11 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition-all shadow-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Sandbox Guide */}
          <div className="mt-4 pt-3 border-t border-zinc-800/80 text-center">
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              {isRtl 
                ? 'ملاحظة: يمكنك نسخ الكود السري الظاهر أعلاه وتعبئته مباشرة في صفحة التحقق لإتمام العملية.'
                : 'Copy the security OTP displayed on this visual screen and input it directly in the confirmation box.'}
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
