/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Droplet, 
  Sparkles, 
  Scissors, 
  ShieldCheck, 
  ChevronLeft, 
  ArrowLeft, 
  FlaskConical, 
  LayoutGrid, 
  Activity, 
  Sun, 
  Moon, 
  Clock, 
  Utensils, 
  RefreshCcw, 
  Heart, 
  Wind,
  Layers,
  Ban,
  CheckCircle2,
  AlertCircle,
  Zap,
  Info,
  Calendar,
  Waves,
  ZapOff,
  Dna,
  Atom,
  Beaker,
  Thermometer,
  ShieldAlert,
  Timer,
  Hourglass,
  ExternalLink,
  ShoppingBag,
  BrainCircuit,
  Send,
  Loader2,
  Microscope
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";

// Initialize Gemini
const genAI = new GoogleGenAI(import.meta.env.VITE_GEMINI_API_KEY || "");

const THEMES = {
  normal: { primary: 'teal', bg: 'bg-slate-950', text: 'text-teal-400', accent: 'bg-teal-500', border: 'border-teal-500/30', gradient: 'from-teal-500 to-emerald-600', neonShadow: 'neon-glow-teal' },
  oily: { primary: 'amber', bg: 'bg-slate-950', text: 'text-amber-400', accent: 'bg-amber-500', border: 'border-amber-500/30', gradient: 'from-amber-500 to-orange-600', neonShadow: 'neon-glow-amber' },
  dry: { primary: 'sky', bg: 'bg-slate-950', text: 'text-sky-400', accent: 'bg-sky-500', border: 'border-sky-500/30', gradient: 'from-sky-500 to-indigo-600', neonShadow: 'neon-glow-sky' },
  combination: { primary: 'violet', bg: 'bg-slate-950', text: 'text-violet-400', accent: 'bg-violet-500', border: 'border-violet-500/30', gradient: 'from-violet-500 to-purple-600', neonShadow: 'neon-glow-violet' },
  sensitive: { primary: 'rose', bg: 'bg-slate-950', text: 'text-rose-400', accent: 'bg-rose-500', border: 'border-rose-500/30', gradient: 'from-rose-500 to-pink-600', neonShadow: 'neon-glow-rose' },
  hair_oily: { primary: 'emerald', bg: 'bg-slate-950', text: 'text-emerald-400', accent: 'bg-emerald-500', border: 'border-emerald-500/30', gradient: 'from-emerald-500 to-teal-600', neonShadow: 'neon-glow-emerald' },
  hair_dry: { primary: 'orange', bg: 'bg-slate-950', text: 'text-orange-400', accent: 'bg-orange-500', border: 'border-orange-500/30', gradient: 'from-orange-500 to-red-600', neonShadow: 'neon-glow-orange' },
  hair_thinning: { primary: 'indigo', bg: 'bg-slate-950', text: 'text-indigo-400', accent: 'bg-indigo-500', border: 'border-indigo-500/30', gradient: 'from-indigo-500 to-blue-600', neonShadow: 'neon-glow-indigo' },
  hair_curly: { primary: 'fuchsia', bg: 'bg-slate-950', text: 'text-fuchsia-400', accent: 'bg-fuchsia-500', border: 'border-fuchsia-500/30', gradient: 'from-fuchsia-500 to-purple-600', neonShadow: 'neon-glow-fuchsia' }
};

const APP_DATA = {
  skin: {
    types: [
      { id: 'normal', name: 'Normal Skin', icon: <Waves className="w-8 h-8" />, effect: 'Balanced', suggest: 'Squalane', chemicals: ['Niacinamide (5%)', 'Hyaluronic Acid'], diet: ['Mixed Berries', 'Avocado', 'Watermelon'], rationale: "Normal skin requires 'maintenance' molecules that support the natural barrier without over-stimulating oil glands." },
      { id: 'oily', name: 'Oily Skin', icon: <Droplet className="w-8 h-8" />, effect: 'Regulation', suggest: 'Niacinamide', chemicals: ['Salicylic Acid (2%)', 'Zinc PCA'], diet: ['Cucumber', 'Lemon Water', 'Green Tea'], rationale: "Oily skin benefits from lipophilic (oil-loving) acids that penetrate pores to dissolve sebum plugs." },
      { id: 'dry', name: 'Dry Skin', icon: <ZapOff className="w-8 h-8" />, effect: 'Repair', suggest: 'Ceramides', chemicals: ['Panthenol (B5)', 'Glycerin'], diet: ['Walnuts', 'Salmon', 'Sweet Potatoes'], rationale: "Dry skin lacks structural lipids. We use humectants to pull water into the skin and occlusives to trap it." },
      { id: 'combination', name: 'Combination', icon: <Layers className="w-8 h-8" />, effect: 'Dual Zone', suggest: 'PHA', chemicals: ['Lactic Acid', 'Witch Hazel'], diet: ['Flaxseeds', 'Spinach', 'Oats'], rationale: "Combination skin requires 'intelligent' exfoliation that removes T-zone oil while hydrating the cheeks." }
    ],
    concerns: [
      { id: 'acne', name: 'Acne Prone', icon: <Sparkles className="w-6 h-6" />, suggest: 'Salicylic Acid', diet: { eat: ['Pumpkin Seeds', 'Fatty Fish'], avoid: ['Skim Milk', 'Sugar'] } },
      { id: 'aging', name: 'Aging', icon: <Clock className="w-6 h-6" />, suggest: 'Retinol', diet: { eat: ['Walnuts', 'Bone Broth'], avoid: ['Fried Foods'] } },
      { id: 'darkspots', name: 'Dark Spots', icon: <Atom className="w-6 h-6" />, suggest: 'Vitamin C', diet: { eat: ['Tomatoes', 'Red Peppers'], avoid: ['Alcohol'] } }
    ]
  },
  hair: {
    types: [
      { id: 'hair_oily', name: 'Oily Scalp', icon: <Droplet className="w-8 h-8" />, effect: 'Clarifying', suggest: 'Apple Cider Vinegar', chemicals: ['Salicylic Acid', 'Tea Tree Oil'], diet: ['Spinach', 'Lentils', 'Citrus'], rationale: "Sebum buildup on the scalp can suffocate the follicle. Clarifying agents remove biofilm without stripping the shaft." },
      { id: 'hair_dry', name: 'Dry/Damaged', icon: <ZapOff className="w-8 h-8" />, effect: 'Restorative', suggest: 'Argan Oil', chemicals: ['Hydrolyzed Keratin', 'Amino Acids'], diet: ['Eggs', 'Avocado', 'Almonds'], rationale: "Damaged hair has a porous cuticle. Keratin fills the gaps in the protein structure to prevent further snapping." },
      { id: 'hair_thinning', name: 'Thinning', icon: <Dna className="w-8 h-8" />, effect: 'Growth Boost', suggest: 'Minoxidil/Redensyl', chemicals: ['Caffeine', 'Biotin'], diet: ['Oysters', 'Greek Yogurt', 'Berries'], rationale: "Caffeine stimulates micro-circulation to the dermal papilla, ensuring the follicle receives oxygenated blood." },
      { id: 'hair_curly', name: 'Curly/Coiled', icon: <RefreshCcw className="w-8 h-8" />, effect: 'Definition', suggest: 'Shea Butter', chemicals: ['Aloe Vera', 'Behentrimonium Chloride'], diet: ['Chia Seeds', 'Coconut Oil', 'Beans'], rationale: "Curly patterns prevent natural oils from traveling down the shaft. We need synthetic slip to prevent friction." }
    ],
    concerns: [
      { id: 'dandruff', name: 'Dandruff', icon: <Wind className="w-6 h-6" />, suggest: 'Ketoconazole', diet: { eat: ['Pumpkin Seeds', 'Yogurt'], avoid: ['Yeasty Breads', 'Dairy'] } },
      { id: 'frizz', name: 'Frizz Control', icon: <Zap className="w-6 h-6" />, suggest: 'Silicone/Oils', diet: { eat: ['Salmon', 'Walnuts'], avoid: ['Dehydrating Coffee'] } },
      { id: 'breakage', name: 'Breakage', icon: <Scissors className="w-6 h-6" />, suggest: 'Bond Builders', diet: { eat: ['Lean Poultry', 'Soy'], avoid: ['High Mercury Fish'] } }
    ]
  }
};

// Camera Scanner Component
const CameraScanner = ({ onCapture, isScanning, theme }: { onCapture: (base64: string) => void, isScanning: boolean, theme: any }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    };
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        onCapture(base64);
      }
    }
  };

  return (
    <div className="relative w-full aspect-video rounded-[3rem] overflow-hidden border-2 border-white/10 bg-black shadow-2xl">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className="w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Scanning Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className={`absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-${theme.primary}-400 to-transparent shadow-[0_0_15px_rgba(20,184,166,0.8)] z-10`}
        />
        <div className="absolute inset-0 border-[40px] border-black/20 rounded-[3rem]" />
      </div>

      <div className="absolute bottom-6 left-0 right-0 flex justify-center px-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={captureFrame}
          disabled={isScanning}
          className={`px-8 py-4 rounded-full flex items-center gap-3 font-black uppercase tracking-widest text-sm shadow-2xl ${isScanning ? 'bg-slate-800 text-slate-500' : `${theme.accent} text-white ${theme.neonShadow}`}`}
        >
          {isScanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {isScanning ? 'Analyzing Matrix...' : 'Capture & Analyze'}
        </motion.button>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'skin' | 'hair'>('skin'); 
  const [primarySelection, setPrimarySelection] = useState('normal');
  const [secondarySelection, setSecondarySelection] = useState('acne');
  const [showRoutine, setShowRoutine] = useState(false);
  
  // AI State
  const [aiInput, setAiInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isCameraMode, setIsCameraMode] = useState(false);

  const handleTabSwitch = (tab: 'skin' | 'hair') => {
    setActiveTab(tab);
    setShowRoutine(false);
    setAiResult(null);
    setAiInput("");
    if (tab === 'hair') {
      setPrimarySelection('hair_oily');
      setSecondarySelection('dandruff');
    } else {
      setPrimarySelection('normal');
      setSecondarySelection('acne');
    }
  };

  const theme = THEMES[primarySelection as keyof typeof THEMES] || THEMES.normal;

  const getSolution = useMemo(() => {
    const p = APP_DATA[activeTab].types.find(x => x.id === primarySelection) || APP_DATA[activeTab].types[0];
    const s = APP_DATA[activeTab].concerns.find(x => x.id === secondarySelection) || APP_DATA[activeTab].concerns[0];
    return { p, s };
  }, [activeTab, primarySelection, secondarySelection]);

  const toggleRoutine = () => setShowRoutine(!showRoutine);

  const getShoppingLink = (query: string, platform: 'amazon' | 'flipkart') => {
    const encoded = encodeURIComponent(query);
    return platform === 'amazon' 
      ? `https://www.amazon.in/s?k=${encoded}`
      : `https://www.flipkart.com/search?q=${encoded}`;
  };

  // AI Analysis using @google/genai
  const runAiAnalysis = async (imageData?: string) => {
    if (!aiInput.trim() && !imageData) return;
    setIsAiLoading(true);
    setAiError(null);

    try {
      const model = "gemini-3-flash-preview";
      const parts: any[] = [];
      
      if (aiInput.trim()) {
        parts.push({ text: aiInput });
      }
      
      if (imageData) {
        parts.push({
          inlineData: {
            data: imageData,
            mimeType: "image/jpeg"
          }
        });
      }

      const response = await genAI.models.generateContent({
        model,
        contents: { parts },
        config: {
          safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE }
          ],
          systemInstruction: `You are a clinical dermatological assistant. Analyze the user's description and/or image of their ${activeTab} concerns. 
          Format your response as a JSON object with these keys: 
          "diagnosis" (concise clinical term), 
          "explanation" (one sentence biological rationale), 
          "top_ingredient" (best active compound), 
          "safety_note" (one caution),
          "suggested_profile_id" (match one of these exactly: ${APP_DATA[activeTab].types.map(t => t.id).join(', ')})`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              diagnosis: { type: Type.STRING },
              explanation: { type: Type.STRING },
              top_ingredient: { type: Type.STRING },
              safety_note: { type: Type.STRING },
              suggested_profile_id: { type: Type.STRING }
            },
            required: ["diagnosis", "explanation", "top_ingredient", "safety_note", "suggested_profile_id"]
          }
        }
      });

      const resultText = response.text;
      if (resultText) {
        const parsed = JSON.parse(resultText);
        setAiResult(parsed);
        if (parsed.suggested_profile_id) {
          setPrimarySelection(parsed.suggested_profile_id);
        }
      }
    } catch (err: any) {
      console.error("Diagnostic Error:", err);
      // Detailed error message helps debug API Key or connection issues
      setAiError(err.message || "Analysis offline. Please check your API key.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} transition-colors duration-700 font-sans pb-20 text-slate-200`}>
      {/* Navbar */}
      <nav className="bg-slate-900/50 backdrop-blur-xl border-b border-white/10 px-6 h-16 flex items-center justify-between sticky top-0 z-50 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className={`${theme.accent} p-1.5 rounded-lg shadow-lg ${theme.neonShadow} transition-all duration-500`}
            >
              <ShieldCheck className="text-white w-5 h-5" />
            </motion.div>
            <span className={`text-xl font-black tracking-tight uppercase italic ${theme.text} font-display`}>GlowCode</span>
          </div>
          <div className="h-8 w-px bg-white/10 hidden md:block" />
          <div className="flex bg-white/5 p-1 rounded-xl">
            {(['skin', 'hair'] as const).map((tab) => (
              <button 
                key={tab}
                onClick={() => handleTabSwitch(tab)}
                className={`px-5 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === tab ? 'bg-white/10 shadow-md text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3">
           <div className={`flex items-center gap-1.5 text-[10px] font-bold ${theme.text} opacity-50 uppercase tracking-widest`}>
              <RefreshCcw className="w-3 h-3 animate-spin-slow" /> Clinical Matrix 4.0
           </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        <AnimatePresence mode="wait">
          {!showRoutine ? (
            <motion.div 
              key="diagnostic"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-10"
            >
              {/* Hero */}
              <header className="px-2 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
                 <div>
                   <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-3 leading-none font-display">
                     Precision {activeTab === 'skin' ? 'Skin' : 'Hair'} <span className={`${theme.text}`}>Diagnostic</span>
                   </h1>
                   <p className="text-slate-400 font-medium max-w-xl text-sm md:text-base">
                     Synthesizing chemical efficacy with bio-morphic diagnostics for localized cellular optimization.
                   </p>
                 </div>
                 
                 <div className="bg-white/5 border border-white/10 p-4 rounded-[2rem] flex items-center gap-4 backdrop-blur-md">
                   <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-lg`}>
                     <BrainCircuit className="w-5 h-5 text-white" />
                   </div>
                   <div className="text-left">
                     <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Powered by</p>
                     <p className="text-xs font-bold text-white uppercase">Gemini Flash 3.0</p>
                   </div>
                 </div>
              </header>

              {/* AI SCANNER SECTION */}
              <section className="relative group">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-3xl -z-10 group-hover:opacity-100 opacity-0 transition-opacity" />
                 <div className="glass-panel rounded-[3rem] p-6 md:p-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <Microscope className={`w-5 h-5 ${theme.text}`} />
                        <h2 className="text-sm font-black text-white uppercase tracking-widest">Intelligent Scan Input</h2>
                      </div>
                      <button 
                        onClick={() => setIsCameraMode(!isCameraMode)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${isCameraMode ? `${theme.border} ${theme.text} bg-white/5` : 'border-white/10 text-slate-500 hover:text-slate-300'}`}
                      >
                        {isCameraMode ? <Send className="w-3 h-3" /> : <Microscope className="w-3 h-3" />}
                        {isCameraMode ? 'Switch to Text' : 'Switch to Camera'}
                      </button>
                    </div>
                    
                    {isCameraMode ? (
                      <CameraScanner 
                        onCapture={(base64) => runAiAnalysis(base64)} 
                        isScanning={isAiLoading} 
                        theme={theme} 
                      />
                    ) : (
                      <div className="relative">
                        <textarea 
                          value={aiInput}
                          onChange={(e) => setAiInput(e.target.value)}
                          placeholder={`Describe your ${activeTab} texture, concerns, or recent changes (e.g., "My forehead feels oily but my cheeks are flaky and red after washing")...`}
                          className="w-full bg-black/40 border border-white/10 rounded-[2rem] p-6 text-sm text-slate-200 focus:outline-none focus:border-teal-500/50 transition-all min-h-[120px] resize-none pr-16"
                        />
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => runAiAnalysis()}
                          disabled={isAiLoading || !aiInput.trim()}
                          className={`absolute right-4 bottom-4 w-12 h-12 rounded-full flex items-center justify-center transition-all ${isAiLoading ? 'bg-slate-800' : `${theme.accent} shadow-lg ${theme.neonShadow}`}`}
                        >
                          {isAiLoading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <Send className="w-5 h-5 text-white" />}
                        </motion.button>
                      </div>
                    )}

                    {aiError && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mt-4 flex items-center gap-2 text-rose-400 text-[10px] font-black uppercase px-4 py-2 bg-rose-400/10 rounded-full w-fit"
                      >
                        <AlertCircle className="w-3 h-3" /> {aiError}
                      </motion.div>
                    )}

                    {aiResult && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 grid md:grid-cols-2 gap-6"
                      >
                        <div className={`p-6 rounded-[2rem] bg-white/5 border ${theme.border} flex items-start gap-4`}>
                          <div className={`p-3 rounded-2xl ${theme.accent} text-white shadow-lg`}>
                             <Zap className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">AI Diagnostic Result</p>
                            <h4 className="text-xl font-black text-white uppercase tracking-tight">{aiResult.diagnosis}</h4>
                            <p className="text-xs text-slate-400 mt-2 italic leading-relaxed">"{aiResult.explanation}"</p>
                          </div>
                        </div>
                        <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 flex items-start gap-4">
                          <div className="p-3 rounded-2xl bg-amber-500 text-white shadow-lg">
                             <ShieldAlert className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Clinical Protocol</p>
                            <h4 className="text-xl font-black text-white uppercase tracking-tight">{aiResult.top_ingredient}</h4>
                            <p className={`text-[10px] font-bold mt-2 uppercase text-amber-500`}>CAUTION: {aiResult.safety_note}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                 </div>
              </section>

              {/* Selection Grid */}
              <div className="grid lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-6">
                  <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2 px-2">
                    <LayoutGrid className="w-4 h-4" /> 01. Biological Base Profile
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {APP_DATA[activeTab].types.map((type) => (
                      <motion.button
                        key={type.id}
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPrimarySelection(type.id)}
                        className={`relative group rounded-[2.5rem] p-6 border-2 transition-all aspect-[3/4] flex flex-col justify-end overflow-hidden ${primarySelection === type.id ? `${theme.border} bg-white/5 ${theme.neonShadow} z-10` : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                        <div className={`mb-auto transition-all duration-500 ${primarySelection === type.id ? theme.text : 'text-slate-500'}`}>
                          {type.icon}
                        </div>
                        <div className="text-left relative z-10">
                          <h3 className={`font-black text-base leading-tight uppercase tracking-tighter ${primarySelection === type.id ? 'text-white' : 'text-slate-400'}`}>{type.name}</h3>
                          <p className={`text-[9px] font-bold uppercase tracking-wider ${theme.text}`}>{type.effect}</p>
                        </div>
                        {aiResult?.suggested_profile_id === type.id && (
                          <div className="absolute top-4 right-4">
                            <BrainCircuit className={`w-4 h-4 ${theme.text} animate-pulse`} />
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                  <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2 px-2">
                    <Activity className="w-4 h-4" /> 02. Targeted Concerns
                  </h2>
                  <div className="space-y-3">
                    {APP_DATA[activeTab].concerns.map((concern) => (
                      <motion.button
                        key={concern.id}
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSecondarySelection(concern.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-[2rem] border-2 transition-all ${secondarySelection === concern.id ? `${theme.border} bg-white/10 shadow-lg` : 'border-transparent bg-white/5 hover:bg-white/10'}`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${secondarySelection === concern.id ? `${theme.border} ${theme.text}` : 'border-white/10 text-slate-500'}`}>
                          {concern.icon}
                        </div>
                        <div className="text-left">
                          <h3 className="font-black text-white text-xs uppercase tracking-tight">{concern.name}</h3>
                          <p className={`text-[10px] font-bold uppercase ${theme.text} opacity-70`}>{concern.suggest}</p>
                        </div>
                        {secondarySelection === concern.id && (
                          <CheckCircle2 className={`w-4 h-4 ml-auto ${theme.text}`} />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="sticky bottom-8 z-40">
                <motion.button 
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={toggleRoutine}
                  className={`w-full bg-gradient-to-r ${theme.gradient} text-white p-6 rounded-[3rem] shadow-2xl flex items-center justify-between group transition-all ${theme.neonShadow}`}
                >
                  <div className="flex items-center gap-5">
                     <div className="w-14 h-14 rounded-full bg-black/20 flex items-center justify-center backdrop-blur-md border border-white/20">
                        <FlaskConical className="w-7 h-7" />
                     </div>
                     <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-0.5">Initialize Formulation</p>
                        <h4 className="text-2xl font-black uppercase tracking-tighter leading-none">{getSolution.p.name} × {getSolution.s.name}</h4>
                     </div>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-white text-slate-950 flex items-center justify-center group-hover:translate-x-1 transition-transform shadow-xl">
                     <ArrowLeft className="w-6 h-6 rotate-180" />
                  </div>
                </motion.button>
              </div>
            </motion.div>
          ) : (
            /* PROTOCOL VIEW */
            <motion.div 
              key="routine"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="space-y-12"
            >
               <div className="flex items-center justify-between bg-slate-900/50 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-sm">
                 <button onClick={toggleRoutine} className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest ${theme.text} hover:opacity-70 transition-opacity`}>
                   <ChevronLeft className="w-4 h-4" /> Reset Analysis
                 </button>
                 <div className="hidden md:flex items-center gap-3">
                    <div className={`px-4 py-2 rounded-full ${theme.accent} text-white text-[10px] font-black uppercase tracking-wider ${theme.neonShadow}`}>
                       Diagnostic Locked
                    </div>
                 </div>
               </div>

               {aiResult && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="bg-white/5 border border-teal-500/20 p-6 rounded-[2.5rem] flex items-center gap-6"
                 >
                    <div className={`p-4 rounded-full bg-teal-500/10 ${theme.text}`}>
                      <BrainCircuit className="w-8 h-8" />
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-teal-400 uppercase tracking-widest">AI Custom Insight</h5>
                      <p className="text-sm text-slate-300 font-medium">Your routine is optimized for {aiResult.diagnosis}. Suggested inclusion: <strong>{aiResult.top_ingredient}</strong>.</p>
                    </div>
                 </motion.div>
               )}

               {/* EXECUTION ROUTINE */}
               <section className="space-y-6">
                  <div className="flex items-center gap-4 px-2">
                     <div className={`w-12 h-12 rounded-full bg-white/5 border ${theme.border} flex items-center justify-center text-white`}>
                        <Calendar className="w-5 h-5" />
                     </div>
                     <div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter font-display">Execution Routine</h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Temporal markers for product application</p>
                     </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                     {/* Morning Phase */}
                     <motion.div 
                        whileHover={{ y: -5 }}
                        className="bg-slate-900/40 p-8 rounded-[3rem] border border-white/5 hover:border-amber-500/20 transition-all relative overflow-hidden group"
                      >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                           <Sun className="w-12 h-12 text-amber-400" />
                        </div>
                        <div className="flex items-center justify-between mb-6">
                          <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest bg-amber-400/10 px-3 py-1 rounded-full inline-block">AM CYCLE</span>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400/60 uppercase">
                            <Clock className="w-3 h-3" /> 07:00 - 08:30
                          </div>
                        </div>
                        <h4 className="text-xl font-black text-white uppercase tracking-tight mb-4">Prime & Protect</h4>
                        <ul className="space-y-4">
                           {[
                             { text: 'Cleanse (Water Only)', time: '07:00' },
                             { text: `Apply ${getSolution.p.chemicals[0]}`, time: '07:05' },
                             { text: 'Wait 2 mins for absorption', time: '07:10' },
                             { text: 'Moisturizer + SPF Seal', time: '07:15' }
                           ].map((step, i) => (
                             <li key={i} className="flex items-center justify-between text-sm text-slate-400 font-medium bg-white/5 p-3 rounded-2xl border border-white/5">
                                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> {step.text}</span>
                                <span className="text-[10px] font-black text-white/40">{step.time}</span>
                             </li>
                           ))}
                        </ul>
                     </motion.div>

                     {/* Night Phase */}
                     <motion.div 
                        whileHover={{ y: -5 }}
                        className="bg-slate-900/40 p-8 rounded-[3rem] border border-white/5 hover:border-indigo-500/20 transition-all relative overflow-hidden group"
                      >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                           <Moon className="w-12 h-12 text-indigo-400" />
                        </div>
                        <div className="flex items-center justify-between mb-6">
                          <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-400/10 px-3 py-1 rounded-full inline-block">PM CYCLE</span>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400/60 uppercase">
                            <Clock className="w-3 h-3" /> 21:00 - 22:30
                          </div>
                        </div>
                        <h4 className="text-xl font-black text-white uppercase tracking-tight mb-4">Cellular Repair</h4>
                        <ul className="space-y-4">
                           {[
                             { text: 'Double Cleanse (Oil/Gel)', time: '21:00' },
                             { text: `Target: ${getSolution.s.suggest}`, time: '21:10' },
                             { text: 'Absorption Buffer (5 mins)', time: '21:15' },
                             { text: 'Heavy Molecular Hydration', time: '21:20' }
                           ].map((step, i) => (
                             <li key={i} className="flex items-center justify-between text-sm text-slate-400 font-medium bg-white/5 p-3 rounded-2xl border border-white/5">
                                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> {step.text}</span>
                                <span className="text-[10px] font-black text-white/40">{step.time}</span>
                             </li>
                           ))}
                        </ul>
                     </motion.div>

                     {/* Weekly Maintenance */}
                     <motion.div 
                        whileHover={{ y: -5 }}
                        className="bg-slate-900/40 p-8 rounded-[3rem] border border-white/5 hover:border-emerald-500/20 transition-all relative overflow-hidden group"
                      >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                           <RefreshCcw className="w-12 h-12 text-emerald-400" />
                        </div>
                        <div className="flex items-center justify-between mb-6">
                          <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-3 py-1 rounded-full inline-block">PERIODIC</span>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400/60 uppercase">
                            <Clock className="w-3 h-3" /> SUN / WED
                          </div>
                        </div>
                        <h4 className="text-xl font-black text-white uppercase tracking-tight mb-4">Intense Reset</h4>
                        <ul className="space-y-4">
                           {[
                             { text: 'Weekly Chemical Peel', time: 'SUN PM' },
                             { text: '10 Min Contact Time', time: 'TIMED' },
                             { text: 'Deep Lipid Recovery Mask', time: 'WED PM' },
                             { text: 'Overnight Occlusive', time: 'SLEEP' }
                           ].map((step, i) => (
                             <li key={i} className="flex items-center justify-between text-sm text-slate-400 font-medium bg-white/5 p-3 rounded-2xl border border-white/5">
                                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {step.text}</span>
                                <span className="text-[10px] font-black text-white/40">{step.time}</span>
                             </li>
                           ))}
                        </ul>
                     </motion.div>
                  </div>
               </section>

               {/* CHEMICAL FORMULATION */}
               <section className="space-y-6">
                  <div className="flex items-center gap-4 px-2">
                     <div className={`w-12 h-12 rounded-full bg-white/5 border ${theme.border} flex items-center justify-center text-white`}>
                        <Beaker className="w-5 h-5" />
                     </div>
                     <div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter font-display">Molecular Formulation</h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Contact Duration & Acquisition Hub</p>
                     </div>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-8">
                     <div className={`p-10 rounded-[4rem] bg-white/5 border-2 ${theme.border} relative overflow-hidden group shadow-2xl`}>
                        <div className={`absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br ${theme.gradient} opacity-20 blur-3xl group-hover:opacity-40 transition-opacity`} />
                        <div className="flex justify-between items-start mb-8 relative z-10">
                           <div>
                              <span className={`text-[10px] font-black ${theme.text} uppercase tracking-widest border border-white/10 px-4 py-1.5 rounded-full`}>Primary Reagent</span>
                              <h4 className="text-4xl font-black text-white uppercase tracking-tighter mt-4">{getSolution.p.suggest}</h4>
                           </div>
                           <div className="p-4 bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center gap-1">
                              <Timer className={`w-6 h-6 ${theme.text}`} />
                              <span className="text-[8px] font-black text-white uppercase">2-3 Mins</span>
                           </div>
                        </div>
                        
                        {/* Shopping Links */}
                        <div className="relative z-10 mb-8 flex gap-3">
                          <a 
                            href={getShoppingLink(getSolution.p.suggest, 'amazon')} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex-1 bg-white/10 hover:bg-white/20 border border-white/10 p-3 rounded-2xl flex items-center justify-center gap-2 transition-all group/link"
                          >
                            <ShoppingBag className="w-4 h-4 text-white" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Amazon</span>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                          </a>
                          <a 
                            href={getShoppingLink(getSolution.p.suggest, 'flipkart')} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex-1 bg-white/10 hover:bg-white/20 border border-white/10 p-3 rounded-2xl flex items-center justify-center gap-2 transition-all group/link"
                          >
                            <ShoppingBag className="w-4 h-4 text-white" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Flipkart</span>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                          </a>
                        </div>

                        <p className="text-sm text-slate-400 leading-relaxed font-medium relative z-10 italic">
                          "{getSolution.p.rationale}"
                        </p>
                     </div>

                     <div className="grid grid-rows-2 gap-6">
                        <div className="bg-slate-900/40 p-8 rounded-[3rem] border border-white/5 flex items-center gap-6 group hover:bg-white/5 transition-colors">
                           <div className="w-20 h-20 rounded-full bg-slate-950 border border-white/10 flex flex-col items-center justify-center shrink-0">
                              <Hourglass className={`w-8 h-8 ${theme.text} animate-bounce-slow`} />
                              <span className="text-[7px] font-black text-white/40 uppercase">Buffer</span>
                           </div>
                           <div className="flex-1">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Synergist Timing</span>
                              <h4 className="text-2xl font-black text-white uppercase tracking-tighter">{getSolution.s.suggest}</h4>
                              <div className="mt-3 flex gap-2">
                                 <a 
                                   href={getShoppingLink(getSolution.s.suggest, 'amazon')} 
                                   target="_blank" 
                                   className={`text-[8px] font-black uppercase px-3 py-1 rounded-full border border-white/10 hover:${theme.accent} transition-colors`}
                                 >
                                   Amazon
                                 </a>
                                 <a 
                                   href={getShoppingLink(getSolution.s.suggest, 'flipkart')} 
                                   target="_blank" 
                                   className={`text-[8px] font-black uppercase px-3 py-1 rounded-full border border-white/10 hover:${theme.accent} transition-colors`}
                                 >
                                   Flipkart
                                 </a>
                              </div>
                           </div>
                        </div>

                        <div className="bg-slate-900/40 p-8 rounded-[3rem] border border-white/5 flex flex-wrap gap-3">
                           <div className="w-full mb-2">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                 <Timer className="w-3 h-3" /> Application Windows
                              </span>
                           </div>
                           {['Morning: 07:00', 'Night: 21:00', 'Interval: 14hrs'].map((window, i) => (
                              <div key={i} className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 text-xs font-black text-white uppercase tracking-tight flex items-center gap-3">
                                 <div className={`w-1.5 h-1.5 rounded-full ${theme.accent}`} />
                                 {window}
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </section>

               {/* LIFESTYLE DATA */}
               <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-emerald-500/5 p-10 rounded-[3.5rem] border border-emerald-500/10 relative overflow-hidden">
                     <div className="flex items-center gap-4 mb-8">
                        <Utensils className="w-8 h-8 text-emerald-400" />
                        <h4 className="text-xl font-black text-white uppercase tracking-tighter">Metabolic Sync</h4>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        {getSolution.p.diet.map((f, i) => (
                          <div key={i} className="p-4 bg-slate-950 rounded-2xl border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase text-center">
                             {f}
                          </div>
                        ))}
                     </div>
                  </div>

                  <div className="bg-rose-500/5 p-10 rounded-[3.5rem] border border-rose-500/10 relative overflow-hidden">
                     <div className="flex items-center gap-4 mb-8 text-rose-400">
                        <ShieldAlert className="w-8 h-8" />
                        <h4 className="text-xl font-black text-white uppercase tracking-tighter">System Hazards</h4>
                     </div>
                     <div className="flex flex-wrap gap-2">
                        {getSolution.s.diet.avoid.map((f, i) => (
                          <div key={i} className="px-4 py-2 bg-slate-950 rounded-xl border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase">
                             {f}
                          </div>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Footer */}
               <div className={`p-8 rounded-[2rem] bg-gradient-to-r ${theme.gradient} text-white flex items-center justify-between`}>
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-black/20 rounded-full flex items-center justify-center border border-white/20">
                        <Info className="w-6 h-6" />
                     </div>
                     <p className="text-xs font-black uppercase tracking-widest">Diagnostic profile matches high compatibility for {getSolution.p.name}</p>
                  </div>
                  <p className="text-[10px] font-black opacity-60">BUILD_V4.0.0_AI_READY</p>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <style>{`
        .animate-spin-slow { animation: spin 20s linear infinite; }
        .animate-bounce-slow { animation: bounce 3s infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        textarea::placeholder { color: #475569; }
      `}</style>
    </div>
  );
}
