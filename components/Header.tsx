import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="glass border-b border-slate-200/60 sticky top-0 z-50 h-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-full flex items-center justify-between">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 transform group-hover:rotate-12 transition-transform duration-500">
            <i className="fa-solid fa-eye text-2xl"></i>
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-slate-900 leading-none tracking-tighter uppercase">RadioXprecision</h1>
            <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase mt-1">Diagnostic Intelligence Hub</p>
          </div>
        </div>
        
        <div className="hidden lg:flex items-center gap-10">
          <nav className="flex items-center gap-8 text-xs font-black text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-indigo-600 transition-colors">Precision Engine</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Protocol V.6</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Lab Insights</a>
          </nav>
          <div className="h-6 w-px bg-slate-200"></div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
              <i className="fa-solid fa-shield-check"></i> Encrypted Session
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;