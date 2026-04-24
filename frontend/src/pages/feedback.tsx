import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../hooks/useWallet';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import AuthGuard from '../components/AuthGuard';

const FORM_ACTION = "https://docs.google.com/forms/u/0/d/e/1FAIpQLSdr49v2bkHHenYJ_X7WmmE5jBnWihXXxoltbHd9akmwnWX-Tw/formResponse";

const ENTRY_IDS = {
  fullName: "entry.869872607",
  email: "entry.1043848765",
  walletAddress: "entry.1931494188",
  web3Experience: "entry.1378392613",
  walletConnected: "entry.510475892",
  onboardingEase: "entry.2135240538",
  dAppSuccess: "entry.1564634464",
  bestFeature: "entry.1097552205",
  predicateBuilderEase: "entry.377755298",
  bugs: "entry.538994697",
  realWorldUse: "entry.2113848787",
  topImprovement: "entry.1757042830",
  additionalFeedback: "entry.1911411157"
};

const STEPS = [
  { id: 1, label: 'Identity', icon: '👤' },
  { id: 2, label: 'Experience', icon: '✨' },
  { id: 3, label: 'Validation', icon: '🛡️' },
  { id: 4, label: 'Finalize', icon: '🚀' }
];

const FeedbackPage = () => {
  const { wallet } = useWallet();
  const { theme } = useTheme();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [transmissionProgress, setTransmissionProgress] = useState(0);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    walletAddress: wallet.address || '',
    web3Experience: '3',
    walletConnected: 'Yes',
    onboardingEase: '3',
    dAppSuccess: 'Fully working',
    bestFeature: 'Logic Architect',
    predicateBuilderEase: '3',
    bugs: '',
    realWorldUse: 'Yes',
    topImprovement: '',
    additionalFeedback: ''
  });

  useEffect(() => {
    if (wallet.address && !formData.walletAddress) {
      setFormData(prev => ({ ...prev, walletAddress: wallet.address }));
    }
  }, [wallet.address]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (step < 4) setStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const prevStep = () => {
    if (step > 1) setStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate transmission progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setTransmissionProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setSubmitted(true);
          setIsSubmitting(false);
        }, 500);
      }
    }, 100);

    try {
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = FORM_ACTION;
      form.target = 'hidden_iframe';

      Object.entries(formData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = ENTRY_IDS[key as keyof typeof ENTRY_IDS];
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    } catch (error) {
      console.error('Submission error:', error);
      setIsSubmitting(false);
      clearInterval(interval);
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-blue-500">
                Phase_01
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Identity_Binding_</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Establish your presence on the validation layer.</p>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Full Name_</label>
                <div className="relative group">
                  <input 
                    type="text" 
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                    placeholder="Enter operator name"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-blue-500/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Email_Address_</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                  placeholder="communication@node.io"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Stellar_Address_</label>
                <div className="relative">
                  <input 
                    type="text" 
                    name="walletAddress"
                    required
                    value={formData.walletAddress}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 dark:text-white font-mono text-xs"
                    placeholder="G..."
                  />
                  {!wallet.address && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md">
                      NOT CONNECTED
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button 
              onClick={nextStep}
              disabled={!formData.fullName || !formData.walletAddress}
              className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98]"
            >
              Initialize Next Phase_
            </button>
          </motion.div>
        );
      case 2:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                Phase_02
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Experience_Metrics_</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">How would you rate your interaction with the protocol?</p>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Web3 Mastery_ (1-5)</label>
                <div className="flex justify-between gap-3">
                  {['1', '2', '3', '4', '5'].map(rating => (
                    <button
                      key={rating}
                      onClick={() => handleRatingChange('web3Experience', rating)}
                      className={`flex-1 py-4 rounded-2xl border font-bold transition-all ${formData.web3Experience === rating ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/20 scale-105' : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-indigo-500/50'}`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Connectivity Success_</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Yes', 'No', 'Faced issues'].map(option => (
                    <button
                      key={option}
                      onClick={() => handleRatingChange('walletConnected', option)}
                      className={`py-4 rounded-2xl border text-[10px] font-bold uppercase tracking-wider transition-all ${formData.walletConnected === option ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/20' : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-indigo-500/50'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Onboarding Friction_</label>
                <div className="flex justify-between gap-3">
                  {['1', '2', '3', '4', '5'].map(rating => (
                    <button
                      key={rating}
                      onClick={() => handleRatingChange('onboardingEase', rating)}
                      className={`flex-1 py-4 rounded-2xl border font-bold transition-all ${formData.onboardingEase === rating ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/20 scale-105' : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-indigo-500/50'}`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={prevStep} className="flex-1 py-5 bg-slate-100 dark:bg-white/[0.03] text-slate-900 dark:text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] transition-all border border-slate-200 dark:border-white/10">Back_</button>
              <button onClick={nextStep} className="flex-[2] py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl shadow-indigo-600/20">Proceed_</button>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                Phase_03
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Functional_Validation_</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Did the core automation logic meet expectations?</p>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Deployment Status_</label>
                <div className="grid grid-cols-1 gap-3">
                  {['Fully working', 'Partially working', 'Not working'].map(option => (
                    <button
                      key={option}
                      onClick={() => handleRatingChange('dAppSuccess', option)}
                      className={`py-4 px-6 rounded-2xl border text-left font-bold transition-all flex items-center justify-between ${formData.dAppSuccess === option ? 'bg-emerald-600 border-emerald-500 text-white shadow-xl shadow-emerald-600/20' : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-emerald-500/50'}`}
                    >
                      <span className="uppercase tracking-widest text-[10px]">{option}</span>
                      {formData.dAppSuccess === option && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">High-Impact Features_</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Logic Architect', 'Governance', 'Gas Abstraction', 'Telemetry'].map(option => (
                    <button
                      key={option}
                      onClick={() => handleRatingChange('bestFeature', option)}
                      className={`py-4 rounded-2xl border text-[9px] font-bold uppercase tracking-widest transition-all ${formData.bestFeature === option ? 'bg-emerald-600 border-emerald-500 text-white shadow-xl shadow-emerald-600/20' : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-emerald-500/50'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Architect Intuition_ (1-5)</label>
                <div className="flex justify-between gap-3">
                  {['1', '2', '3', '4', '5'].map(rating => (
                    <button
                      key={rating}
                      onClick={() => handleRatingChange('predicateBuilderEase', rating)}
                      className={`flex-1 py-4 rounded-2xl border font-bold transition-all ${formData.predicateBuilderEase === rating ? 'bg-emerald-600 border-emerald-500 text-white shadow-xl shadow-emerald-600/20 scale-105' : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-emerald-500/50'}`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={prevStep} className="flex-1 py-5 bg-slate-100 dark:bg-white/[0.03] text-slate-900 dark:text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] transition-all border border-slate-200 dark:border-white/10">Back_</button>
              <button onClick={nextStep} className="flex-[2] py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl shadow-emerald-600/20">Verify_</button>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-amber-500">
                Phase_04
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Final_Synthesis_</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Final adjustments for real-world protocol deployment.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Anomalies Detected_</label>
                <textarea 
                  name="bugs"
                  value={formData.bugs}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-500 text-xs"
                  placeholder="List any bugs or friction points..."
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Real-World Viability_</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Yes', 'Maybe', 'No'].map(option => (
                    <button
                      key={option}
                      onClick={() => handleRatingChange('realWorldUse', option)}
                      className={`py-4 rounded-2xl border text-[10px] font-bold uppercase tracking-widest transition-all ${formData.realWorldUse === option ? 'bg-amber-600 border-amber-500 text-white shadow-xl shadow-amber-600/20' : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-amber-500/50'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Primary Enhancement_ *</label>
                <textarea 
                  name="topImprovement"
                  required
                  value={formData.topImprovement}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-500 text-xs"
                  placeholder="What is the #1 improvement you want to see?"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Additional_Telemetry_</label>
                <textarea 
                  name="additionalFeedback"
                  value={formData.additionalFeedback}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-500 text-xs"
                  placeholder="Any other insights?"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={prevStep} className="flex-1 py-5 bg-slate-100 dark:bg-white/[0.03] text-slate-900 dark:text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] transition-all border border-slate-200 dark:border-white/10">Back_</button>
              <button 
                onClick={handleSubmit} 
                disabled={isSubmitting || !formData.topImprovement}
                className="flex-[2] py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl shadow-blue-600/20 disabled:opacity-30"
              >
                {isSubmitting ? 'Transmitting...' : 'Finalize Transmission_'}
              </button>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-zypher-bg text-white' : 'bg-slate-50 text-slate-900'} transition-colors duration-300 relative overflow-x-hidden`}>
      <Head>
        <title>Protocol Validation | Zypherion Protocol</title>
        <meta name="description" content="Share your experience with Zypherion Protocol and help us shape the future of Web3 automation." />
      </Head>

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] dark:opacity-[0.05]" />
      </div>

      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-24 flex flex-col items-center relative z-10">
        <div className="w-full max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16 space-y-6"
          >
            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              Community_Validation_Layer
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-tight">
              Protocol <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-500 dark:to-indigo-400">Validation_</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto font-medium">
              Your feedback is the foundation of our decentralized evolution. Help us refine the sovereign automation footprint.
            </p>
          </motion.div>

          {/* Stepper Container */}
          <div className="relative mb-12">
            {!submitted && !isSubmitting && (
              <div className="flex justify-between items-center px-4 relative max-w-2xl mx-auto">
                <div className="absolute top-8 left-12 right-12 h-px bg-slate-200 dark:bg-white/10 z-0 hidden sm:block" />
                {STEPS.map((s, i) => (
                  <div key={s.id} className="relative z-10 flex flex-col items-center gap-3 group">
                    <motion.div 
                      initial={false}
                      animate={{ 
                        scale: step === s.id ? 1.1 : 1,
                        backgroundColor: step >= s.id ? (step === s.id ? '#2563eb' : '#059669') : (theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f1f5f9'),
                        borderColor: step >= s.id ? (step === s.id ? '#3b82f6' : '#10b981') : (theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0'),
                      }}
                      className="w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-2xl shadow-xl transition-colors duration-500"
                    >
                      {step > s.id ? (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : s.icon}
                    </motion.div>
                    <div className="flex flex-col items-center text-center">
                      <span className={`text-[8px] font-bold uppercase tracking-[0.2em] mb-1 ${step >= s.id ? 'text-blue-500' : 'text-slate-500'}`}>Step_0{s.id}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= s.id ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{s.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <div className="glass-card p-8 lg:p-16 relative overflow-hidden rounded-[3rem] border border-slate-200 dark:border-white/5">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-8 py-16"
                  >
                    <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 relative">
                      <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full animate-pulse" />
                      <svg className="w-12 h-12 text-emerald-500 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="space-y-4">
                      <h2 className="text-4xl font-bold tracking-tight">Transmission <span className="text-emerald-500">Successful_</span></h2>
                      <p className="text-slate-500 dark:text-slate-400 text-lg max-w-md mx-auto">
                        Thank you for contributing to the Zypherion Protocol. Your insights have been successfully recorded on the validation layer.
                      </p>
                    </div>
                    <div className="pt-8">
                      <button 
                        onClick={() => window.location.href = '/'}
                        className="px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-xs transition-all shadow-2xl shadow-blue-600/30 active:scale-95"
                      >
                        Return to Command Center_
                      </button>
                    </div>
                  </motion.div>
                ) : isSubmitting ? (
                  <motion.div
                    key="transmitting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-20 space-y-10"
                  >
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="60"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="transparent"
                          className="text-slate-200 dark:text-white/5"
                        />
                        <motion.circle
                          cx="64"
                          cy="64"
                          r="60"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="transparent"
                          strokeDasharray="377"
                          animate={{ strokeDashoffset: 377 - (377 * transmissionProgress) / 100 }}
                          className="text-blue-600"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-blue-500">{transmissionProgress}%</span>
                      </div>
                    </div>
                    <div className="text-center space-y-4">
                      <h3 className="text-xl font-bold uppercase tracking-[0.3em] text-blue-500 animate-pulse">Transmitting_Data...</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">ENCRYPTING_VALIDATION_PACKET...</p>
                    </div>
                  </motion.div>
                ) : (
                  renderStep()
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Skip / Footer Info */}
          {!submitted && (
            <div className="mt-12 flex justify-between items-center px-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                SECURE_ENCRYPTION_ENABLED
              </div>
              <div>ZYPH_V1_ALPHA</div>
            </div>
          )}
        </div>
      </main>

      <iframe name="hidden_iframe" id="hidden_iframe" style={{ display: 'none' }}></iframe>
    </div>
  );
};

export default FeedbackPage;
