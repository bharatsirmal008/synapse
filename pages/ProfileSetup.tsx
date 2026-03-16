import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../App';
import { ArrowRight, Sparkles, GraduationCap, Target, Rocket, Briefcase } from 'lucide-react';

const ProfileSetup: React.FC = () => {
  const { user, updateProfile } = useUser();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [details, setDetails] = useState({
    targetRole: '',
    graduationYear: '2025',
    currentLevel: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
    skills: [] as string[]
  });

  const next = () => setStep(step + 1);

  const finish = () => {
    if (user) {
      updateProfile({ ...user, ...details });
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 transition-colors duration-500">
      <div className="max-w-xl w-full">
        {/* Progress Navigation */}
        <div className="flex items-center justify-between mb-12 px-2">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex flex-col items-center gap-2 flex-1 relative">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all duration-500 z-10 ${
                step >= s 
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' 
                  : 'bg-gray-100 dark:bg-slate-900 text-gray-400'
              }`}>
                {s === 1 ? <Target size={18} /> : s === 2 ? <GraduationCap size={18} /> : <Rocket size={18} />}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s ? 'text-brand-600' : 'text-gray-400'}`}>
                {s === 1 ? 'Focus' : s === 2 ? 'Details' : 'Launch'}
              </span>
              {s < 3 && (
                <div className={`absolute left-1/2 w-full h-1 top-5 -z-0 ${step > s ? 'bg-brand-600' : 'bg-gray-100 dark:bg-slate-900'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-gray-50 dark:bg-slate-900 p-10 sm:p-12 rounded-[3.5rem] border dark:border-slate-800 shadow-2xl space-y-10 animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl"></div>
          
          {step === 1 && (
            <div className="space-y-8 relative z-10">
              <div className="space-y-3">
                <h2 className="text-3xl font-black dark:text-white tracking-tight">Define your dream.</h2>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Which career path should Synapse optimize for you?</p>
              </div>
              
              <div className="relative group">
                <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-600 group-focus-within:scale-110 transition-transform" size={24} />
                <input 
                  autoFocus
                  type="text"
                  placeholder="e.g. Frontend Engineer, Product Manager"
                  className="w-full pl-16 pr-6 py-5 bg-white dark:bg-slate-800 rounded-3xl border-2 border-transparent focus:border-brand-600 outline-none text-xl font-bold dark:text-white shadow-sm transition-all"
                  value={details.targetRole}
                  onChange={(e) => setDetails({...details, targetRole: e.target.value})}
                  onKeyDown={(e) => e.key === 'Enter' && details.targetRole && next()}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                 {['SDE-1', 'Data Scientist', 'UI/UX Designer', 'Mobile Dev'].map(preset => (
                   <button 
                     key={preset}
                     onClick={() => setDetails({...details, targetRole: preset})}
                     className="px-4 py-2 bg-white dark:bg-slate-800 rounded-xl text-xs font-bold text-gray-500 hover:text-brand-600 border dark:border-slate-700 transition-colors"
                   >
                     + {preset}
                   </button>
                 ))}
              </div>

              <button 
                disabled={!details.targetRole}
                onClick={next}
                className="w-full py-5 bg-brand-600 text-white rounded-2xl font-black text-lg hover:bg-brand-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-500/20 active:scale-[0.98]"
              >
                Continue Setup <ArrowRight size={22} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 relative z-10">
              <div className="space-y-3">
                <h2 className="text-3xl font-black dark:text-white tracking-tight">Calibration.</h2>
                <p className="text-gray-500 dark:text-gray-400 font-medium">We tailor our AI responses based on your timeline.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Class of</label>
                  <div className="grid grid-cols-3 gap-4">
                    {['2025', '2026', '2027'].map(year => (
                      <button 
                        key={year}
                        onClick={() => setDetails({...details, graduationYear: year})}
                        className={`py-5 rounded-3xl font-black transition-all border-4 ${
                          details.graduationYear === year 
                            ? 'border-brand-600 bg-white dark:bg-slate-800 text-brand-600 shadow-lg' 
                            : 'border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-400 hover:bg-white dark:hover:bg-slate-800'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Experience Level</label>
                  <div className="grid grid-cols-1 gap-3">
                    {(['Beginner', 'Intermediate', 'Advanced'] as const).map(level => (
                      <button 
                        key={level}
                        onClick={() => setDetails({...details, currentLevel: level})}
                        className={`p-6 rounded-3xl text-left transition-all border-4 flex justify-between items-center group ${
                          details.currentLevel === level 
                            ? 'border-brand-600 bg-white dark:bg-slate-800 shadow-lg' 
                            : 'border-transparent bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800'
                        }`}
                      >
                        <div>
                          <p className={`font-black ${details.currentLevel === level ? 'text-brand-600' : 'text-gray-700 dark:text-gray-300'}`}>{level}</p>
                          <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                            {level === 'Beginner' ? 'Fundamental knowledge only' : level === 'Intermediate' ? 'Built some real projects' : 'Ready for interview revision'}
                          </p>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${details.currentLevel === level ? 'bg-brand-600 animate-pulse' : 'bg-gray-200 dark:bg-slate-700'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={next}
                className="w-full py-5 bg-brand-600 text-white rounded-2xl font-black text-lg hover:bg-brand-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-500/20 active:scale-[0.98]"
              >
                Finalize Path <ArrowRight size={22} />
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 text-center relative z-10">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-[2rem] flex items-center justify-center mx-auto ring-8 ring-brand-50 dark:ring-brand-950/20">
                  <Sparkles size={48} className="animate-bounce" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-4xl font-black dark:text-white tracking-tighter">Systems Online.</h2>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Your personalized AI dashboard is ready.</p>
              </div>
              
              <div className="p-8 bg-white dark:bg-slate-800 rounded-[2.5rem] border dark:border-slate-700 text-left space-y-6 shadow-sm">
                <div className="flex items-center justify-between border-b dark:border-slate-700 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-600 overflow-hidden border-2 border-white dark:border-slate-800">
                      {user?.avatar && <img src={user.avatar} className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase">Profile</p>
                      <p className="font-bold dark:text-white">{user?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-gray-400 uppercase">Class</p>
                    <p className="font-bold dark:text-white">{details.graduationYear}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                   <div>
                      <p className="text-xs font-black text-gray-400 uppercase">Target Goal</p>
                      <p className="text-xl font-black text-brand-600">{details.targetRole}</p>
                   </div>
                   <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400 text-[10px] font-black uppercase tracking-widest">
                      Ready
                   </div>
                </div>
              </div>

              <button 
                onClick={finish}
                className="w-full py-5 bg-brand-600 text-white rounded-2xl font-black text-xl hover:bg-brand-700 transition-all shadow-2xl shadow-brand-500/40 active:scale-[0.98] animate-pulse"
              >
                Launch Dashboard
              </button>
            </div>
          )}
        </div>
        
        <p className="text-center mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
           Synapse Engine v2.0
        </p>
      </div>
    </div>
  );
};

export default ProfileSetup;