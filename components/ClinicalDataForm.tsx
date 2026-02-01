
import React from 'react';
import { ClinicalData, ModalityType } from '../types';

interface ClinicalDataFormProps {
  data: ClinicalData;
  onChange: (data: ClinicalData) => void;
}

const ClinicalDataForm: React.FC<ClinicalDataFormProps> = ({ data, onChange }) => {
  const handleChange = (field: keyof ClinicalData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const modalities: { value: ModalityType; icon: string; label: string }[] = [
    { value: 'Dental', icon: 'fa-tooth', label: 'Dental (OPG/IOPA)' },
    { value: 'MRI', icon: 'fa-brain', label: 'Magnetic Resonance' },
    { value: 'CT/X-Ray', icon: 'fa-x-ray', label: 'CT / Computed X-Ray' },
  ];

  return (
    <div className="bg-white p-10 rounded-[3rem] border border-slate-200/80 shadow-2xl shadow-slate-100/50">
      <div className="flex items-center justify-between mb-10">
        <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
          <i className="fa-solid fa-notes-medical text-indigo-600 text-lg"></i> Patient Clinical Protocol
        </h3>
      </div>

      <div className="space-y-10">
        {/* Modality Selector */}
        <div className="space-y-4">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Selected Imaging Modality</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {modalities.map((m) => (
              <button
                key={m.value}
                onClick={() => handleChange('modality', m.value)}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-300 ${
                  data.modality === m.value
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-lg shadow-indigo-100'
                    : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200 hover:bg-white'
                }`}
              >
                <i className={`fa-solid ${m.icon} text-xl`}></i>
                <span className="text-[10px] font-black uppercase tracking-tight">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Patient Name / Ref</label>
            <input 
              type="text" 
              value={data.patientName} 
              onChange={(e) => handleChange('patientName', e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200/60 rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
              placeholder="e.g. J. DOE #404"
            />
          </div>

          {/* Dental Fields */}
          {data.modality === 'Dental' && (
            <>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Bleeding Index %</label>
                <input 
                  type="number" 
                  value={data.bop || ''} 
                  onChange={(e) => handleChange('bop', parseInt(e.target.value))}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200/60 rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                  placeholder="e.g. 15"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Smoking Status</label>
                <select 
                  value={data.smokingStatus} 
                  onChange={(e) => handleChange('smokingStatus', e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200/60 rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all cursor-pointer"
                >
                  <option value="Never">Never Smoked</option>
                  <option value="Former">Former Smoker</option>
                  <option value="Current">Active Smoker</option>
                </select>
              </div>
            </>
          )}

          {/* MRI Fields */}
          {data.modality === 'MRI' && (
            <>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Primary Complaint</label>
                <input 
                  type="text" 
                  value={data.complaint || ''} 
                  onChange={(e) => handleChange('complaint', e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200/60 rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                  placeholder="e.g. Chronic Headaches"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Anatomical Region</label>
                <input 
                  type="text" 
                  value={data.location || ''} 
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200/60 rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                  placeholder="e.g. Cervical Spine"
                />
              </div>
            </>
          )}

          {/* CT/X-Ray Fields */}
          {data.modality === 'CT/X-Ray' && (
            <>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Clinical Indication</label>
                <input 
                  type="text" 
                  value={data.indication || ''} 
                  onChange={(e) => handleChange('indication', e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200/60 rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                  placeholder="e.g. Suspected Fracture"
                />
              </div>
              <div className="flex items-center gap-4 pt-6 px-2">
                <label className="relative flex items-center cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={data.contrastUsed} 
                    onChange={(e) => handleChange('contrastUsed', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-8 bg-slate-200 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-full"></div>
                  <span className="ml-4 text-[10px] font-black text-slate-700 uppercase tracking-widest">Contrast Agent Applied</span>
                </label>
              </div>
            </>
          )}

          {/* Shared Common Switches */}
          <div className="flex items-center gap-4 pt-6 px-2">
            <label className="relative flex items-center cursor-pointer group">
              <input 
                type="checkbox" 
                checked={data.diabetic} 
                onChange={(e) => handleChange('diabetic', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-slate-200 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-full"></div>
              <span className="ml-4 text-[10px] font-black text-slate-700 uppercase tracking-widest">Diabetic Profile</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicalDataForm;
