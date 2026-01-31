
import React from 'react';
import { AnalysisOutput, ClinicalData, Annotation } from '../types';

interface AnalysisResultProps {
  data: AnalysisOutput;
  clinical?: ClinicalData;
  annotations: Annotation[];
}

const severityConfig = {
  'Normal': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Mild': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Moderate': 'bg-amber-50 text-amber-700 border-amber-100',
  'Severe': 'bg-rose-50 text-rose-700 border-rose-100',
  'Critical': 'bg-red-100 text-red-900 border-red-200'
};

const Section: React.FC<{ title: string; icon: string; children: React.ReactNode; colorClass?: string }> = ({ 
  title, icon, children, colorClass = "text-indigo-600" 
}) => (
  <div className="mb-12 last:mb-0 break-inside-avoid">
    <div className="flex items-center gap-3 mb-6">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-slate-50 border border-slate-200/60 shadow-sm`}>
        <i className={`fa-solid ${icon} ${colorClass} text-lg`}></i>
      </div>
      <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">{title}</h3>
    </div>
    <div className="bg-white rounded-[2.5rem] border border-slate-200/80 p-8 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.04)] print:shadow-none">
      {children}
    </div>
  </div>
);

const AnalysisResult: React.FC<AnalysisResultProps> = ({ data, clinical, annotations }) => {
  const findings = Array.isArray(data.findings) ? data.findings : [];
  const measurements = Array.isArray(data.measurements) ? data.measurements : [];
  const recommendations = Array.isArray(data.recommendations) ? data.recommendations : [];
  const limitations = Array.isArray(data.limitations) ? data.limitations : [];

  return (
    <div className="report-container">
      {/* Print-Only Header */}
      <div className="hidden print:block mb-12 border-b-2 border-slate-900 pb-10">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black text-slate-900 uppercase tracking-tighter">Diagnostic Report</h1>
            <p className="text-sm font-black text-indigo-600 mt-2">PERIOVISION CLINICAL INTELLIGENCE SYSTEMS</p>
          </div>
          <div className="text-right text-[10px] font-black uppercase tracking-widest text-slate-400">
            <p>Ref: PV-{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
            <p>Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex items-center justify-between mb-12 print:hidden">
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg">
            Final Report
          </div>
        </div>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xl shadow-slate-200/50"
        >
          <i className="fa-solid fa-download"></i> Export Document
        </button>
      </div>

      {/* Meta Data Bar */}
      <div className="mb-12 grid grid-cols-2 md:grid-cols-4 gap-8 p-10 bg-white rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-100/50 print:border-slate-300">
        <div>
          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Scan Typology</span>
          <span className="font-black text-slate-900 uppercase tracking-tight text-sm">{data.imagingType || 'Diagnostic Scan'}</span>
        </div>
        <div>
          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Threat Vector</span>
          <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
            data.riskLevel === 'High' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 
            data.riskLevel === 'Medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
          }`}>
            {data.riskLevel || 'Low Risk'}
          </span>
        </div>
        <div>
          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Prognosis</span>
          <span className="font-black text-slate-900 uppercase tracking-tight text-sm">{data.prognosis || 'N/A'}</span>
        </div>
        <div>
          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Observations</span>
          <span className="font-black text-slate-900 uppercase tracking-tight text-sm">{findings.length} Anomalies</span>
        </div>
      </div>

      <div className="space-y-4">
        <Section title="Pathological Mapping" icon="fa-dna">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {findings.map((finding, idx) => (
              <div key={idx} className={`p-6 rounded-[2rem] border ${severityConfig[finding.severity] || severityConfig['Normal']} transition-all hover:scale-[1.02] duration-500`}>
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-black text-xs uppercase tracking-widest">{finding.label}</h4>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white/50 border border-current opacity-70">{finding.severity}</span>
                </div>
                <p className="text-xs leading-relaxed font-medium opacity-90">{finding.description}</p>
              </div>
            ))}
            {findings.length === 0 && <p className="text-slate-400 italic text-xs py-10 text-center col-span-2">No pathological indicators detected within specified parameters.</p>}
          </div>
        </Section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Section title="Final Diagnosis" icon="fa-award" colorClass="text-indigo-600">
            <div className="p-8 bg-indigo-600 rounded-[2rem] shadow-xl shadow-indigo-100 transform hover:scale-[1.02] transition-transform duration-500">
              <p className="text-white font-black text-2xl leading-[1.1] uppercase tracking-tighter">
                {data.diagnosis || 'Diagnosis Formulation Pending'}
              </p>
            </div>
          </Section>

          <Section title="Measurements" icon="fa-ruler-horizontal" colorClass="text-slate-600">
            <ul className="space-y-4">
              {measurements.map((m, idx) => (
                <li key={idx} className="flex gap-4 text-slate-900 text-xs font-black uppercase tracking-tight items-center">
                  <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                  {m}
                </li>
              ))}
              {annotations.map((ann, idx) => (
                <li key={`manual-${idx}`} className="flex gap-4 text-indigo-600 text-xs font-black uppercase tracking-tight items-center">
                  <i className="fa-solid fa-pencil text-[9px]"></i>
                  Manual {ann.label}: {Math.sqrt(Math.pow((ann.x2||0) - ann.x1, 2) + Math.pow((ann.y2||0) - ann.y1, 2)).toFixed(1)}px
                </li>
              ))}
              {measurements.length === 0 && annotations.length === 0 && (
                <p className="text-slate-400 italic text-xs">Awaiting dimensional quantification.</p>
              )}
            </ul>
          </Section>
        </div>

        <Section title="Therapeutic Recommendations" icon="fa-clipboard-list" colorClass="text-emerald-600">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {recommendations.map((item, idx) => (
              <div key={idx} className="flex gap-5 items-start p-2">
                <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100">
                  <i className="fa-solid fa-arrow-right text-[10px] text-emerald-600"></i>
                </div>
                <p className="text-slate-700 text-sm font-semibold leading-relaxed pt-1">{item}</p>
              </div>
            ))}
            {recommendations.length === 0 && <p className="text-slate-400 italic text-xs py-4">No specific interventions formulated.</p>}
          </div>
        </Section>

        {limitations.length > 0 && (
          <Section title="Contextual Constraints" icon="fa-circle-exclamation" colorClass="text-slate-400">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {limitations.map((item, idx) => (
                <li key={idx} className="text-slate-500 text-[11px] font-bold uppercase tracking-tight flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  {item}
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>

      {/* Disclaimer Footer */}
      <div className="mt-20 p-12 premium-gradient text-white rounded-[4rem] shadow-2xl print:bg-white print:text-black print:border-2 print:border-slate-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        </div>
        <div className="flex flex-col lg:flex-row gap-12 items-center relative z-10">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center shrink-0 border border-white/20 shadow-2xl">
            <i className="fa-solid fa-shield-halved text-4xl text-indigo-400"></i>
          </div>
          <div className="text-center lg:text-left">
            <h4 className="font-black text-[11px] uppercase tracking-[0.4em] mb-4 text-indigo-400">Regulatory & Safety Disclaimer</h4>
            <p className="text-slate-400 text-xs leading-relaxed font-medium max-w-4xl print:text-slate-600">
              {data.disclaimer} This PerioVision automated analysis provides preliminary visual observations based on biological pattern recognition. It is designed for educational and screening assistance and must NOT be utilized as a standalone diagnostic tool. Final clinical diagnosis and treatment plans are the sole responsibility of a board-certified medical or dental professional after direct clinical examination.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;