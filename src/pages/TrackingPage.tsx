import { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Navigation } from 'lucide-react';
import { motion } from 'motion/react';

export const TrackingPage = () => {
  const [status, setStatus] = useState<number>(0);
  const statuses = [
    { label: 'Order Confirmed', icon: CheckCircle2 },
    { label: 'Preparing your food', icon: Clock },
    { label: 'On the way', icon: Navigation },
    { label: 'Delivered', icon: CheckCircle2 },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStatus(prev => (prev < 3 ? prev + 1 : prev));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">Tracking Order #SW-12345</h1>
        <p className="text-zinc-500">Estimated delivery: 25-35 min</p>
      </div>

      <div className="relative h-[400px] bg-zinc-100 rounded-3xl overflow-hidden mb-12">
        {/* Simulated Map */}
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/map/1200/800')] bg-cover opacity-50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-12 h-12 bg-black rounded-full flex items-center justify-center shadow-xl"
          >
            <Navigation className="w-6 h-6 text-white" />
          </motion.div>
        </div>
      </div>

      <div className="space-y-8 text-start">
        {statuses.map((s, i) => (
          <div key={i} className={`flex items-center gap-4 ${i > status ? 'opacity-30' : 'opacity-100'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${i <= status ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-400'}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold">{s.label}</h3>
              <p className="text-sm text-zinc-500">{i <= status ? 'Completed' : 'Pending'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
