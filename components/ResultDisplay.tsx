import React from 'react';
import { AnalysisResult } from '../types';

interface ResultDisplayProps {
  result: AnalysisResult;
  onReset: () => void;
}

const CircularGauge = ({ score, isAI }: { score: number; isAI: boolean }) => {
  const radius = 56;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  // Colors: Red for AI (Warning), Green for Real (Safe)
  // Using slightly brighter shades for dark mode visibility
  const strokeColor = isAI ? '#f87171' : '#4ade80'; 
  const colorClass = isAI ? 'text-red-400' : 'text-green-400';
  const glowClass = isAI ? 'shadow-[0_0_15px_rgba(248,113,113,0.3)]' : 'shadow-[0_0_15px_rgba(74,222,128,0.3)]';

  return (
    <div className="relative flex items-center justify-center mb-6">
      {/* Outer Neumorphic container */}
      <div className={`w-36 h-36 rounded-full bg-main shadow-neu-pressed flex items-center justify-center relative border border-white/5 ${glowClass} transition-shadow duration-500`}>
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
          style={{ filter: 'drop-shadow(0px 0px 2px rgba(0,0,0,0.5))' }}
        >
          {/* Background Track */}
          <circle
            stroke="#1a1c20"
            strokeWidth={strokeWidth}
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress Arc */}
          <circle
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 1.5s ease-out' }}
            strokeLinecap="round"
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className={isAI ? "drop-shadow-[0_0_8px_rgba(248,113,113,0.6)]" : "drop-shadow-[0_0_8px_rgba(74,222,128,0.6)]"}
          />
        </svg>
        
        {/* Center Value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold font-mono ${colorClass}`}>
              {score}<span className="text-sm opacity-70">%</span>
            </span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">置信度</span>
        </div>
      </div>
    </div>
  );
};

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onReset }) => {
  const isAI = result.isLikelyAI;
  const statusColor = isAI ? 'text-red-500' : 'text-green-500';

  return (
    <div className="w-full max-w-5xl animate-fade-in-up space-y-10">
      
      {/* Dashboard Header */}
      <div className="flex justify-between items-center px-4">
        <h2 className="text-xl text-gray-400 font-medium tracking-wide uppercase">分析报告</h2>
        <div className="flex gap-4">
          <button 
            onClick={onReset}
            className="w-12 h-12 rounded-full bg-main shadow-neu flex items-center justify-center text-gray-400 hover:text-gold-500 active:shadow-neu-pressed transition-all"
            title="重新开始"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Analysis Card */}
      <div className="bg-main rounded-[2.5rem] p-8 md:p-12 shadow-neu relative overflow-hidden group">
        
        {/* Decorative Background Elements */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-gradient-to-br from-main to-transparent rounded-full shadow-neu-pressed z-0"></div>
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Column 1: Dashboard Gauge & Verdict */}
          <div className="col-span-1 flex flex-col items-center justify-center text-center p-6 bg-main rounded-3xl shadow-neu-pressed border border-white/5 relative overflow-hidden">
             {/* Subtle colored ambient glow based on result */}
             <div className={`absolute inset-0 opacity-5 pointer-events-none ${isAI ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
             
             <CircularGauge score={result.confidenceScore} isAI={isAI} />
             
             <h2 className="text-2xl md:text-3xl font-serif font-bold text-gold-gradient mb-2 z-10">
               {result.verdictTitle}
             </h2>
             <span className="text-xs font-mono text-gray-500 tracking-widest uppercase z-10">
               Black Bee Verified
             </span>
          </div>

          {/* Column 2: Reasoning Text */}
          <div className="col-span-1 md:col-span-2 flex flex-col justify-center p-2">
            <h3 className="text-lg font-medium text-gold-400 mb-6 flex items-center gap-3">
               <div className="p-2 rounded-lg bg-main shadow-neu text-gold-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
               </div>
               取证分析摘要
            </h3>
            <p className="text-gray-400 leading-relaxed text-justify font-light text-lg">
              {result.reasoning}
            </p>
          </div>
        </div>
      </div>

      {/* Details Grid (Only for AI) */}
      {isAI && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Flaws Card */}
          <div className="bg-main rounded-[2rem] p-8 shadow-neu border-l-4 border-l-gold-500/20">
            <h3 className="text-lg font-medium text-gold-400 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-main shadow-neu flex items-center justify-center text-xs text-gray-400">01</span>
              检测到的物理异常
            </h3>
            <ul className="space-y-4">
              {result.flaws?.map((flaw, idx) => (
                <li key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-main shadow-neu-pressed hover:shadow-neu transition-shadow cursor-default group">
                  <div className="w-2 h-2 rounded-full bg-gold-600 mt-2 flex-shrink-0 group-hover:scale-125 transition-transform"></div>
                  <span className="text-gray-300 text-sm">{flaw}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Remediation Card */}
          <div className="bg-main rounded-[2rem] p-8 shadow-neu border-l-4 border-l-gold-500/20 flex flex-col">
            <h3 className="text-lg font-medium text-gold-400 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-main shadow-neu flex items-center justify-center text-xs text-gray-400">02</span>
              针对瑕疵的AI修复提示词
            </h3>
            
            <div className="relative flex-grow">
              <div className="absolute inset-0 bg-main shadow-neu-pressed rounded-2xl"></div>
              <div className="relative p-6 h-full text-gray-400 font-mono text-xs leading-relaxed overflow-y-auto max-h-64 custom-scrollbar">
                {result.remediationPrompt}
              </div>
              
              <button 
                onClick={() => navigator.clipboard.writeText(result.remediationPrompt || "")}
                className="absolute top-4 right-4 p-3 bg-main shadow-neu rounded-xl text-gold-500 hover:text-white hover:scale-105 active:shadow-neu-pressed transition-all"
                title="复制提示词"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};