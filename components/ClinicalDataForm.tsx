
import React from 'react';
import { ClinicalData } from '../types';

interface ClinicalDataFormProps {
  data: ClinicalData;
  onChange: (data: ClinicalData) => void;
}

const ClinicalDataForm: React.FC<ClinicalDataFormProps> = ({ data, onChange }) => {
  const handleChange = (field: keyof ClinicalData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white p-10 rounded-[3rem] border border-slate-200/80 shadow-2xl shadow-slate-100/50">
      <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
        <i className="fa-solid fa-id-card text-indigo-600"></i> Clinical Context
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Patient Identifier</label>
          <input 
            type="text" 
            value={data.patientName} 
            onChange={(e) => handleChange('patientName', e.target.value)}
            className="w-full px-6 py-4 bg-slate-50 border border-slate-200/60 rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
            placeholder="e.g. ALPHA-909"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Bleeding Index %</label>
          <input 
            type="number" 
            value={data.bop} 
            onChange={(e) => handleChange('bop', parseInt(e.target.value))}
            className="w-full px-6 py-4 bg-slate-50 border border-slate-200/60 rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
            placeholder="25"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Lifestyle Profile</label>
          <select 
            value={data.smokingStatus} 
            onChange={(e) => handleChange('smokingStatus', e.target.value)}
            className="w-full px-6 py-4 bg-slate-50 border border-slate-200/60 rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all cursor-pointer"
          >
            <option value="Never">Never (Non-Smoker)</option>
            <option value="Former">Former (Quitted)</option>
            <option value="Current">Current (Active)</option>
          </select>
        </div>
        <div className="flex items-center gap-4 pt-6 px-2">
          <label className="relative flex items-center cursor-pointer group">
            <input 
              type="checkbox" 
              checked={data.diabetic} 
              onChange={(e) => handleChange('diabetic', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
            <span className="ml-4 text-[11px] font-black text-slate-700 uppercase tracking-widest">Diabetic Profile</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ClinicalDataForm;