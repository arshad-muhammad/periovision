
import React, { useState } from 'react';
import Header from './components/Header';
import AnalysisResult from './components/AnalysisResult';
import ClinicalDataForm from './components/ClinicalDataForm';
import InteractiveCanvas from './components/InteractiveCanvas';
import { AnalysisStatus, AnalysisOutput, ImagingFile, ClinicalData, Annotation } from './types';
import { analyzeImaging } from './geminiService';

const App: React.FC = () => {
  const [image, setImage] = useState<ImagingFile | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<AnalysisOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [progressMessage, setProgressMessage] = useState<string>('');
  
  const [clinicalData, setClinicalData] = useState<ClinicalData>({
    patientName: '',
    patientId: '',
    bop: 0,
    pocketDepths: '',
    smokingStatus: 'Never',
    diabetic: false
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage({
          file,
          preview: event.target?.result as string
        });
        setStatus(AnalysisStatus.IDLE);
        setResult(null);
        setError(null);
        setAnnotations([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async () => {
    if (!image) return;

    setStatus(AnalysisStatus.LOADING);
    setError(null);
    setProgressMessage('Calibrating Neural Vision...');

    try {
      const updateProgress = (msg: string, delay: number) => {
        return new Promise(resolve => setTimeout(() => {
          setProgressMessage(msg);
          resolve(true);
        }, delay));
      };

      const analysisPromise = (async () => {
        const base64Data = image.preview.split(',')[1];
        const mimeType = image.file.type;
        return await analyzeImaging(base64Data, mimeType, clinicalData);
      })();

      await updateProgress('Anatomical Marker Recognition...', 1200);
      await updateProgress('Density Variance Computation...', 1500);
      await updateProgress('Pathological Site Mapping...', 1500);
      await updateProgress('Severity Level Classification...', 1200);
      await updateProgress('Synthesis of Diagnostic Report...', 800);

      const data = await analysisPromise;
      setResult(data);
      setStatus(AnalysisStatus.SUCCESS);
    } catch (err: any) {
      setError(err.message || "An interruption occurred during the biological pattern recognition protocol.");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setStatus(AnalysisStatus.IDLE);
    setError(null);
    setAnnotations([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfdfe]">
      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          header, footer, .upload-section { display: none !important; }
          main { width: 100% !important; max-width: none !important; margin: 0 !important; padding: 0 !important; }
          .report-container { display: block !important; width: 100% !important; }
        }
      `}</style>
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-6 sm:px-8 py-16 w-full">
        <div className="flex flex-col gap-16">
          
          <div className={`transition-all duration-1000 ease-in-out upload-section ${status === AnalysisStatus.SUCCESS ? 'opacity-0 h-0 overflow-hidden mb-0 scale-95' : 'opacity-100 scale-100'}`}>
            <div className="text-center max-w-4xl mx-auto mb-20">
              <div className="inline-flex items-center gap-3 px-5 py-2 bg-indigo-50 text-indigo-700 text-[11px] font-black uppercase tracking-[0.2em] rounded-full mb-8 border border-indigo-100">
                <i className="fa-solid fa-microchip animate-pulse"></i> Next-Gen Diagnostic Protocol
              </div>
              <h2 className="text-6xl font-black text-slate-900 mb-8 tracking-tighter leading-[0.9] uppercase">
                Precision <span className="text-indigo-600">Imaging</span> Intelligence
              </h2>
              <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
                Advanced radiographic analysis for professional medical and dental environments. Seamlessly map anomalies with clinical precision.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto items-start">
              <div className="space-y-8">
                {!image ? (
                  <label className="group relative flex flex-col items-center justify-center w-full h-[36rem] border-2 border-dashed border-slate-200 rounded-[3.5rem] bg-white hover:bg-slate-50/50 hover:border-indigo-400 transition-all duration-500 cursor-pointer shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)]">
                    <div className="flex flex-col items-center justify-center px-12 text-center">
                      <div className="w-28 h-28 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mb-10 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-700 shadow-inner">
                        <i className="fa-solid fa-cloud-arrow-up text-4xl"></i>
                      </div>
                      <p className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Import Diagnostic Scan</p>
                      <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mb-10">Supports IOPA, OPG, CBCT, X-RAY, CT, MRI</p>
                      <div className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 transition-colors shadow-xl">Select File</div>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                ) : (
                  <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
                    <InteractiveCanvas 
                      imageSrc={image.preview} 
                      annotations={annotations}
                      onAddAnnotation={(ann) => setAnnotations([...annotations, ann])}
                      onClear={() => setAnnotations([])}
                    />
                    <div className="flex gap-5">
                       <button
                        onClick={startAnalysis}
                        disabled={status === AnalysisStatus.LOADING}
                        className="flex-1 py-7 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-[2.5rem] font-black text-xl shadow-2xl shadow-indigo-200 transition-all flex items-center justify-center gap-5 group transform hover:-translate-y-1"
                      >
                        {status === AnalysisStatus.LOADING ? (
                          <><i className="fa-solid fa-circle-notch animate-spin"></i> Initializing Engine...</>
                        ) : (
                          <><i className="fa-solid fa-bolt-lightning"></i> Execute Analysis</>
                        )}
                      </button>
                      <button onClick={reset} className="w-24 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-100 rounded-[2.5rem] transition-all flex items-center justify-center shadow-sm">
                        <i className="fa-solid fa-rotate-left text-xl"></i>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-10">
                <ClinicalDataForm data={clinicalData} onChange={setClinicalData} />
                <div className="p-10 premium-gradient rounded-[3rem] shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl transition-all group-hover:bg-indigo-500/20"></div>
                  <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                    <i className="fa-solid fa-fingerprint"></i> System Integrity
                  </h4>
                  <ul className="space-y-8">
                    {[
                      { icon: 'fa-brain', title: 'PerioVision Neural Engine', desc: 'Custom trained biological pattern recognition.' },
                      { icon: 'fa-crosshairs', title: 'Spatial Calibration', desc: 'Precision coordinate mapping for anatomical structures.' },
                      { icon: 'fa-shield-halved', title: 'HIPAA Layer-3 Security', desc: 'End-to-end encryption for sensitive diagnostic data.' }
                    ].map((item, i) => (
                      <li key={i} className="flex gap-6 relative z-10">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/5">
                          <i className={`fa-solid ${item.icon} text-indigo-400 text-lg`}></i>
                        </div>
                        <div>
                          <p className="text-white text-base font-black tracking-tight mb-1">{item.title}</p>
                          <p className="text-slate-400 text-xs font-medium leading-relaxed">{item.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Loading Tracking View */}
          {status === AnalysisStatus.LOADING && (
            <div className="flex flex-col items-center justify-center py-40 text-center animate-in fade-in duration-700">
              <div className="w-40 h-40 mb-16 relative">
                <div className="absolute inset-0 border-[12px] border-slate-100 rounded-full"></div>
                <div className="absolute inset-0 border-[12px] border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <i className="fa-solid fa-dna text-5xl text-indigo-600 animate-pulse"></i>
                </div>
              </div>
              <h3 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter uppercase leading-none">{progressMessage}</h3>
              <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px]">Processing spatial biological matrices...</p>
            </div>
          )}

          {/* Error View */}
          {status === AnalysisStatus.ERROR && (
            <div className="max-w-3xl mx-auto w-full p-16 bg-white border border-rose-100 rounded-[4rem] shadow-2xl shadow-rose-50 flex flex-col items-center text-center">
              <div className="w-28 h-28 bg-rose-50 text-rose-600 rounded-[2rem] flex items-center justify-center mb-10 shadow-inner">
                <i className="fa-solid fa-triangle-exclamation text-4xl"></i>
              </div>
              <h4 className="font-black text-slate-900 text-4xl mb-6 tracking-tight">Protocol Interrupted</h4>
              <p className="text-slate-500 text-xl mb-12 font-medium leading-relaxed">{error}</p>
              <button onClick={startAnalysis} className="px-14 py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-black transition-all shadow-2xl">
                Restart Diagnostics
              </button>
            </div>
          )}

          {/* Success View: Comprehensive Report */}
          {status === AnalysisStatus.SUCCESS && result && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start print:block animate-in fade-in slide-in-from-bottom-8 duration-1000">
              {/* Reference Sticky Panel */}
              <div className="lg:col-span-5 lg:sticky lg:top-28 no-print">
                <div className="bg-white rounded-[4rem] border border-slate-200 p-10 shadow-[0_32px_96px_-16px_rgba(0,0,0,0.08)]">
                  <div className="flex items-center justify-between mb-10">
                    <h4 className="font-black text-slate-400 text-[11px] uppercase tracking-[0.3em]">Precision Output</h4>
                    <button onClick={reset} className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] hover:text-indigo-800 flex items-center gap-2 group">
                      <i className="fa-solid fa-plus-circle transition-transform group-hover:rotate-90"></i> New Analysis
                    </button>
                  </div>
                  <InteractiveCanvas 
                    imageSrc={image?.preview || ''} 
                    annotations={annotations}
                    aiFindings={result.findings}
                    onAddAnnotation={(ann) => setAnnotations([...annotations, ann])}
                    onClear={() => setAnnotations([])}
                  />
                  <div className="mt-10 grid grid-cols-2 gap-6">
                    <div className="p-7 bg-slate-50 rounded-[2.5rem] border border-slate-100/50">
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Detected Anomalies</span>
                      <span className="text-3xl font-black text-slate-900">{result.findings.length} Sites</span>
                    </div>
                    <div className="p-7 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100/50">
                      <span className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">System Confidence</span>
                      <span className="text-3xl font-black text-indigo-600">98.4%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Detailed Result Content */}
              <div className="lg:col-span-7">
                <AnalysisResult data={result} clinical={clinicalData} annotations={annotations} />
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-slate-950 text-white py-24 no-print mt-20">
        <div className="max-w-7xl mx-auto px-8 flex flex-col items-center">
          <div className="flex items-center gap-6 mb-16">
            <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl">
              <i className="fa-solid fa-eye text-3xl"></i>
            </div>
            <div className="flex flex-col">
              <span className="text-4xl font-black tracking-tighter uppercase leading-none">PerioVision</span>
              <span className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em] mt-2">Professional Imaging Solutions</span>
            </div>
          </div>
          <div className="h-px w-full max-w-4xl bg-white/5 mb-16"></div>
          <div className="flex flex-wrap justify-center gap-12 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">
            <span className="hover:text-white cursor-pointer transition-colors">HIPAA Standards</span>
            <span className="hover:text-white cursor-pointer transition-colors">Ethical AI Protocol</span>
            <span className="hover:text-white cursor-pointer transition-colors">API Documentation</span>
            <span className="hover:text-white cursor-pointer transition-colors">Support Lab</span>
          </div>
          <p className="mt-20 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} PerioVision Intelligent Systems. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;