"use client";

import { useSessionStore } from "@/store/useSessionStore";

export default function Home() {
  const { status, startSession, stopSession } = useSessionStore();

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col items-center justify-center font-sans">
      <main className="flex flex-col items-center gap-8 p-8 max-w-lg w-full bg-[#161b22] rounded-2xl shadow-xl border border-gray-800">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
          ITXStudie – Timer MVP
        </h1>
        
        <div className="text-xl text-gray-300">
          Status: <span className="font-semibold text-emerald-400">{status.toUpperCase()}</span>
        </div>

        <button
          onClick={status === 'idle' ? startSession : stopSession}
          className={`w-full py-4 rounded-xl text-lg font-bold transition-all duration-300 ${
            status === 'idle' 
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(5,150,105,0.4)]'
              : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]'
          }`}
        >
          {status === 'idle' ? 'START SESSION' : 'STOP SESSION'}
        </button>
      </main>
    </div>
  );
}
