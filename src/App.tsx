import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Droplets, Bell, Sparkles, Camera, Upload, Shirt, 
  Coffee, Wine, ChevronRight, ArrowLeft, Save, RotateCcw, 
  Bot, Home, History as HistoryIcon, Lightbulb, Settings as SettingsIcon, 
  MessageSquare, Search, User, Paperclip, Send, Rocket, AlertTriangle, 
  CheckCircle2, HelpCircle, Check, RefreshCw, Star, Info
} from "lucide-react";
import { DiagnosisResult, HistoryItem, ChatMessage } from "./types";
import { initialHistory, quickGuides, defaultDiagnosisOil } from "./data";

export default function App() {
  // Navigation & Screen states
  const [screen, setScreen] = useState<'onboarding' | 'home' | 'more' | 'analyzing' | 'result' | 'history' | 'chat' | 'settings'>('onboarding');
  
  // Custom diagnostic inputs
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedFabric, setSelectedFabric] = useState<string>("Cotton");
  const [selectedAge, setSelectedAge] = useState<string>("Today");
  const [additionalNotes, setAdditionalNotes] = useState<string>("");
  const [quickStainType, setQuickStainType] = useState<string | null>(null);

  // Drag and Drop & Camera States
  const [isDragging, setIsDragging] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Analysis result state
  const [currentDiagnosis, setCurrentDiagnosis] = useState<DiagnosisResult | null>(null);
  
  // History state
  const [historyList, setHistoryList] = useState<HistoryItem[]>(initialHistory);
  const [searchQuery, setSearchQuery] = useState("");
  const [historyFilter, setHistoryFilter] = useState<'All' | 'Success' | 'In Progress' | 'Garments'>('All');
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);

  // Chat/Tips states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      role: "model",
      text: "Hello! I'm your No Stain No Gain expert companion. I've analyzed countless garment rescues. What laundry or fabric emergency can I help you resolve today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInputText, setChatInputText] = useState("");
  const [isChatTyping, setIsChatTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatTyping]);

  // Handle Drag and Drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setQuickStainType(null); // Clear direct quick selection
        setScreen('more'); // Move to Tell Us More screen
      };
      reader.readAsDataURL(file);
    }
  };

  // Launch Camera with fallback
  const openCamera = async () => {
    setShowCameraModal(true);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn("Camera API failed or was blocked inside the iframe sandbox:", err);
      setCameraError("Webcam access restricted by browser or iframe sandbox rules. Use our high-fidelity Simulator below to snap an expert photo!");
    }
  };

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCameraModal(false);
    setCameraError(null);
  };

  // Take actual canvas snapshot of stream
  const captureSnapshot = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setUploadedImage(dataUrl);
        setQuickStainType(null);
        closeCamera();
        setScreen('more');
      }
    }
  };

  // Pre-load a sample stain photo immediately
  const selectDemoStainImage = (imageUrl: string, fabric: string, notes: string, stainName: string) => {
    setUploadedImage(imageUrl);
    setSelectedFabric(fabric);
    setAdditionalNotes(notes);
    setQuickStainType(stainName);
    closeCamera();
    setScreen('more');
  };

  // Contextual tips based on selected fabric
  const getContextualTip = (fabric: string) => {
    switch (fabric) {
      case "Cotton":
        return "Cotton is durable, but avoid hot water for fresh protein stains like milk, sweat, or blood! Heat bonds proteins directly to fibers.";
      case "Polyester":
        return "Polyester is synthetic and loves oil. Treat oil stains immediately before washing, or the fat will dissolve into the synthetic threads permanently.";
      case "Wool":
        return "Wool is highly sensitive to friction and high pH. Never scrub wool stains vigorously, and avoid harsh chlorine bleach which dissolves animal fibers.";
      case "Silk":
        return "Silk dyes can bleed. Always test a hidden seam before applying water. Use only pH-neutral delicate detergents and cold water.";
      case "Denim":
        return "Denim has tight weaves. Stains can get deeply trapped. Isolate the backside with a clean towel and flush from the inside out.";
      default:
        return "Always check the care label first! When in doubt, dab gently from the edges inward to avoid spreading the stain outline.";
    }
  };

  // Handle image upload / selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setQuickStainType(null); // Clear direct quick selection
        setScreen('more'); // Move to Tell Us More screen
      };
      reader.readAsDataURL(file);
    }
  };

  // Quick select a stain guide directly
  const handleQuickGuideClick = (guide: typeof quickGuides[number]) => {
    setQuickStainType(guide.stain);
    setUploadedImage(null);
    setScreen('more');
  };

  // Launch analysis
  const triggerAnalysis = async () => {
    setScreen('analyzing');
    
    // Call our Express endpoint to get a real Gemini analysis!
    try {
      const response = await fetch("/api/analyze-stain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: uploadedImage,
          fabricType: selectedFabric,
          stainAge: selectedAge,
          notes: additionalNotes,
          quickStainType: quickStainType
        })
      });

      if (!response.ok) {
        throw new Error("Analysis request failed");
      }

      const diagnosisResult: DiagnosisResult = await response.json();
      
      // Simulate scanning progress so user enjoys the premium WebGL scanning screen
      setTimeout(() => {
        setCurrentDiagnosis(diagnosisResult);
        setScreen('result');
      }, 3500); // Give 3.5 seconds to watch the gorgeous animations

    } catch (error) {
      console.error("Analysis failed, using high-quality local fallback:", error);
      // Fallback
      setTimeout(() => {
        setCurrentDiagnosis(defaultDiagnosisOil);
        setScreen('result');
      }, 3000);
    }
  };

  // Save Result to History
  const saveResultToHistory = () => {
    if (!currentDiagnosis) return;
    
    const newHistoryItem: HistoryItem = {
      id: `hist-${Date.now()}`,
      stainName: currentDiagnosis.stainName,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fabricType: selectedFabric,
      garmentType: "Garment",
      status: "Success",
      imageUrl: uploadedImage || "https://lh3.googleusercontent.com/aida-public/AB6AXuCm0QSpXYAK-89UlGN0S4BQG3LUf7vPwh0dnKsYGZ65GIgkAiOHEGi4bM73FUpmBIARZouCKeD67tBbGfdeB4rZCCWZZPgNOSS17hu5iOhPpcko6f0eAu_6Yj0ozLZIQpumBPSSn_DiSzaHdsm7tVGRRNgMqZEXMatDSQIaabK78BS2iuHIWAgHLoUy0m9ArJETYGBP-6GeC_MjUJ4ZWdlH2YdE4jP_92HydCc3b-TlljuhbpuEmTXGUw",
      diagnosis: currentDiagnosis
    };

    setHistoryList([newHistoryItem, ...historyList]);
    alert("Diagnosis saved to your laundry history!");
  };

  // Direct assistant question
  const askAssistant = async (questionText: string) => {
    if (!questionText.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: "user",
      text: questionText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInputText("");
    setIsChatTyping(true);

    try {
      const response = await fetch("/api/chat-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: questionText,
          history: chatMessages.map(m => ({ role: m.role, text: m.text }))
        })
      });

      if (!response.ok) {
        throw new Error("Assistant response failed");
      }

      const data = await response.json();
      
      const assistantMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: "model",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      // Fallback response
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          id: `msg-ai-fallback-${Date.now()}`,
          role: "model",
          text: `For a ${selectedFabric || 'cotton'} garment with that issue, I recommend checking if bleach-alternative oxygen powders are safe for your fabric dyes. Try mixing 1 tbsp into a cup of warm water and blotting. Avoid harsh rubbing as it can abrade fabric fibers. Let me know if that helps!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 1000);
    } finally {
      setIsChatTyping(false);
    }
  };

  // Jump to Chat from result with stain context
  const askAIChemicalQuery = () => {
    if (!currentDiagnosis) return;
    setScreen('chat');
    const systemPromptText = `I just ran a diagnostic on a ${selectedFabric} fabric with a ${currentDiagnosis.stainName}. What is the exact chemical reaction that helps lift this stain, and can you explain the process more?`;
    askAssistant(systemPromptText);
  };

  // Reset diagnostic inputs
  const resetDiagnosisFlow = () => {
    setUploadedImage(null);
    setSelectedFabric("Cotton");
    setSelectedAge("Today");
    setAdditionalNotes("");
    setQuickStainType(null);
    setCurrentDiagnosis(null);
    setScreen('home');
  };

  // Filter and Search history
  const filteredHistory = historyList.filter(item => {
    const matchesSearch = item.stainName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.fabricType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.garmentType.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (historyFilter === 'All') return matchesSearch;
    if (historyFilter === 'Success') return matchesSearch && item.status === 'Success';
    if (historyFilter === 'In Progress') return matchesSearch && item.status === 'Pending';
    if (historyFilter === 'Garments') return matchesSearch && item.garmentType === 'Shirt'; // Simple mock categorization
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center">
      
      {/* Dynamic Header */}
      <header className="sticky top-0 w-full z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 h-16 max-w-lg shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setScreen('home')}>
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#0061a4]">
            <Droplets className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-[#0061a4] tracking-tight">No Stain No Gain</span>
        </div>
        <div className="flex items-center gap-2">
          {screen !== 'onboarding' && (
            <button 
              onClick={() => setScreen('chat')}
              className="hover:bg-gray-100 p-2 rounded-full relative transition-colors"
            >
              <MessageSquare className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-blue-500 rounded-full ring-2 ring-white"></span>
            </button>
          )}
          <button className="hover:bg-gray-100 p-2 rounded-full transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      {/* Main Container sizing (Mobile-friendly width constraint) */}
      <main className="w-full max-w-lg flex-1 flex flex-col pb-28">
        
        <AnimatePresence mode="wait">
          
          {/* SCREEN: ONBOARDING */}
          {screen === 'onboarding' && (
            <motion.div 
              key="onboarding"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col items-center justify-between p-6 text-center"
            >
              <div className="w-full flex flex-col items-center mt-6">
                <div className="w-24 h-24 rounded-3xl bg-blue-50 shadow-md flex items-center justify-center mb-6">
                  <Droplets className="w-14 h-14 text-[#0061a4]" />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 leading-tight">
                  No Stain <span className="text-[#0061a4]">No Gain</span>
                </h1>
                <p className="text-sm font-medium text-[#0061a4] tracking-widest uppercase mt-1">
                  AI Fabric Care Companion
                </p>
              </div>

              {/* Central Illustration / Dynamic Mock Image */}
              <div className="relative my-8 w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-lg border border-gray-100">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBl10mo3pltBbDptWpGk2annYUUfhqBmUkzZenV52kzpWLA0_te_PTaZ6HKpCGAIm63Syog0DqjjqPTBfRPfp_-ORWfI2-KxsEmpURv1iH9JomF52tiNHrNl6qBvYDg8kVxejFlEKUiCKQVek3wU4yAqRfWSsCX9vzmspV1J28WKrcqYD8LfT1G4pcp74EzAq4hXs51scj3CM97VBMWb_0DGngR5eo9fBPI_FfE6lSIBC22P9lNGxKYwg" 
                  alt="Folded clothes" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-[#0061a4] uppercase tracking-wide">Community Milestone</p>
                    <p className="text-sm font-extrabold text-gray-800">84 Clothes Saved This Month</p>
                  </div>
                </div>
              </div>

              <div className="w-full space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Take a photo. Identify the stain. <span className="text-[#0061a4]">Save your clothes.</span>
                  </h2>
                  <p className="text-sm text-gray-500 mt-2 px-4">
                    Expert stain removal techniques powered by Gemini AI, tailored specifically for your garment's fabric.
                  </p>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={() => setScreen('home')}
                    className="w-full py-4 bg-[#0061a4] hover:bg-blue-800 text-white font-semibold text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-95"
                  >
                    Get Started <ChevronRight className="w-5 h-5" />
                  </button>
                  <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
                    QUICK &amp; SIMPLE STEP-BY-STEP GUIDANCE
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* SCREEN: HOME */}
          {screen === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-6 p-6"
            >
              {/* Welcome Header */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  What happened to your clothes today?
                </h2>
                <p className="text-xs text-gray-500 mt-1">Select an image, drag and drop, or use a preset demo stain to begin.</p>
              </div>

              {/* Main Capture Card with Drag & Drop events */}
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`bg-white rounded-3xl p-6 shadow-md border-2 transition-all duration-200 relative overflow-hidden ${
                  isDragging 
                  ? 'border-[#0061a4] bg-blue-50/50 scale-[1.02]' 
                  : 'border-gray-100'
                }`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
                
                {isDragging ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-[#0061a4] animate-bounce">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-blue-900">Drop your file here</p>
                      <p className="text-xs text-gray-500">Release to immediately start the diagnostic companion.</p>
                    </div>
                  </div>
                ) : uploadedImage ? (
                  /* HIGH FIDELITY UPLOADED PREVIEW WITH FEEDBACK */
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="bg-emerald-50 text-emerald-700 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider inline-block animate-pulse">
                          IMAGE READY
                        </span>
                        <h3 className="text-2xl font-bold text-gray-900 mt-2">Stain Photo Uploaded</h3>
                        <p className="text-xs text-gray-500 mt-1">Ready to run fabric diagnostic.</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          setUploadedImage(null);
                          setQuickStainType(null);
                        }}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-full transition-colors active:scale-90"
                        title="Remove image"
                      >
                        <RotateCcw className="w-4.5 h-4.5" />
                      </button>
                    </div>

                    <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-gray-100 shadow-inner bg-slate-50 flex items-center justify-center">
                      <img src={uploadedImage} alt="Uploaded Stain" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-black/5"></div>
                      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2.5 py-1 rounded flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active Scanner Target
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => setScreen('more')}
                        className="flex-1 py-3.5 bg-[#0061a4] hover:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        Continue to Analysis <ChevronRight className="w-4 h-4" />
                      </button>
                      <label
                        htmlFor="gallery-file-input"
                        className="py-3.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl active:scale-95 transition-all text-center cursor-pointer flex items-center justify-center"
                      >
                        Replace Photo
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="bg-blue-50 text-blue-700 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                          AI SCANNER
                        </span>
                        <h3 className="text-2xl font-bold text-gray-900 mt-2">Identify Stain</h3>
                        <p className="text-xs text-gray-500 mt-1">Get step-by-step chemical cleaning instructions in seconds.</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 animate-pulse">
                        <Sparkles className="w-6 h-6" />
                      </div>
                    </div>

                    {/* Dual Upload/Interactive Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Take Photo Button - Native Mobile Camera / Desktop File Trigger */}
                      <label 
                        htmlFor="camera-file-input"
                        className="flex flex-col items-center justify-center gap-2 bg-[#0061a4] hover:bg-blue-800 text-white rounded-2xl py-6 px-4 shadow-md cursor-pointer active:scale-95 transition-all duration-200 text-center"
                      >
                        <Camera className="w-10 h-10" />
                        <span className="font-bold text-sm">Take a Photo</span>
                        <span className="text-[10px] text-blue-100/80">Opens native device camera</span>
                      </label>

                      {/* Choose From Gallery - Native File Selector */}
                      <label 
                        htmlFor="gallery-file-input"
                        className="flex flex-col items-center justify-center gap-2 bg-blue-50 text-blue-900 hover:bg-blue-100 rounded-2xl py-6 px-4 border-2 border-dashed border-blue-200 cursor-pointer active:scale-95 transition-all duration-200 text-center"
                      >
                        <Upload className="w-10 h-10 text-blue-600" />
                        <span className="font-bold text-sm">Choose from Gallery</span>
                        <span className="text-[10px] text-blue-800/80">Upload PNG, JPG or HEIC</span>
                      </label>
                    </div>

                    {/* Desktop Webcam / Sandbox simulation trigger */}
                    <div className="text-center pt-2 border-t border-gray-50">
                      <button
                        type="button"
                        onClick={openCamera}
                        className="text-[11px] text-[#0061a4] hover:text-blue-800 font-semibold underline underline-offset-4 decoration-dashed flex items-center justify-center gap-1.5 mx-auto"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Can't upload? Open Webcam Sandbox & Simulator
                      </button>
                    </div>
                  </div>
                )}

                {/* Real File Inputs bound to IDs for 100% native activation */}
                <input 
                  id="camera-file-input"
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  onChange={handleImageChange}
                  className="hidden" 
                />

                <input 
                  id="gallery-file-input"
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="hidden" 
                />
              </div>

              {/* Demo Stain Sandbox slider */}
              <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">Demo Stain Sandbox</h4>
                  <p className="text-xs text-gray-500">Tap a preset photo below to test instantly inside the sandbox.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => selectDemoStainImage(
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuDNPs4lfVRNaz11hpWzpihFard226XVPuk68G-xsEgyPSPkyaoQfunPbTTt2DOqrE1cR3tgCzWk760udwhEVN3vCJWM-ErBaousL0K09Kh9Yn8k7ZIBQDYAD0ibBsrp-eEhZPcGD8wURT5k1XQebcFXJKDZf551UZ7YbMQJpBxk96ZliMQe0BKWGdPfLvdaRJ7k6AihjCXnlzLMsfu7pK5CIzP5pVhcQkv3ocTw97AxDoGiAIxiKyYIiA",
                      "Cotton",
                      "Splashed morning coffee on my white cotton dress shirt.",
                      "Coffee"
                    )}
                    className="flex items-center gap-3 p-2 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/20 text-left transition-all active:scale-95"
                  >
                    <img 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNPs4lfVRNaz11hpWzpihFard226XVPuk68G-xsEgyPSPkyaoQfunPbTTt2DOqrE1cR3tgCzWk760udwhEVN3vCJWM-ErBaousL0K09Kh9Yn8k7ZIBQDYAD0ibBsrp-eEhZPcGD8wURT5k1XQebcFXJKDZf551UZ7YbMQJpBxk96ZliMQe0BKWGdPfLvdaRJ7k6AihjCXnlzLMsfu7pK5CIzP5pVhcQkv3ocTw97AxDoGiAIxiKyYIiA" 
                      alt="Coffee" className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-bold text-xs text-gray-800">Coffee Stain</p>
                      <p className="text-[10px] text-gray-500">Cotton Shirt</p>
                    </div>
                  </button>

                  <button
                    onClick={() => selectDemoStainImage(
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuAX1HtwILbULqgmrFLasmVRUfCfJShW-mplQq9dNHSCgJyh8SUnxmQGJuyC8K6LRNwFD-CT-vQsTu_gLK2fvgP5q8wWNX-OEB8mg3mldiWQw2wqiA4eOb8LTNR_jgX_hiQkXMzkFoL4nkB6Yc7YMHZwogZ7CbwwGOEyiBo_vgn0LuY1DXt51TAiwsZGf73z1MDhUQzlk3dqNQolky1RphDt5ChTP0nO0R-3M_xibxI05dSiavl1lEQbJA",
                      "Denim",
                      "Ballpoint ink leaked in the back pocket of my jeans.",
                      "Ink"
                    )}
                    className="flex items-center gap-3 p-2 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/20 text-left transition-all active:scale-95"
                  >
                    <img 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAX1HtwILbULqgmrFLasmVRUfCfJShW-mplQq9dNHSCgJyh8SUnxmQGJuyC8K6LRNwFD-CT-vQsTu_gLK2fvgP5q8wWNX-OEB8mg3mldiWQw2wqiA4eOb8LTNR_jgX_hiQkXMzkFoL4nkB6Yc7YMHZwogZ7CbwwGOEyiBo_vgn0LuY1DXt51TAiwsZGf73z1MDhUQzlk3dqNQolky1RphDt5ChTP0nO0R-3M_xibxI05dSiavl1lEQbJA" 
                      alt="Ink" className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-bold text-xs text-gray-800">Ink Leak</p>
                      <p className="text-[10px] text-gray-500">Denim Jeans</p>
                    </div>
                  </button>

                  <button
                    onClick={() => selectDemoStainImage(
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuCjxLHkZollz60UMuNI0ZAb9lHEjZXeiXs74PSvZnrGBtZI100Q4KPw6nkmwaR39_9dJw9UOAf_4fBca_FqtgReJL5mcQSVrJjBnTgp7pBFlwSmR7f1AJK_4TuVLkkQ9WhP1yxoyEKXcnEYgWxAmIikQDt28TuJFwRC_GuF8z1_Momd1gSsvggO0e5KptP1dYBsXDrCVQacXkhjKjGq-XsCOa63N8A41Pet044xK0m-6RBQKHZh34-qPw",
                      "Polyester",
                      "Salad oil dripped directly onto my windbreaker.",
                      "Oil"
                    )}
                    className="flex items-center gap-3 p-2 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/20 text-left transition-all active:scale-95"
                  >
                    <img 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjxLHkZollz60UMuNI0ZAb9lHEjZXeiXs74PSvZnrGBtZI100Q4KPw6nkmwaR39_9dJw9UOAf_4fBca_FqtgReJL5mcQSVrJjBnTgp7pBFlwSmR7f1AJK_4TuVLkkQ9WhP1yxoyEKXcnEYgWxAmIikQDt28TuJFwRC_GuF8z1_Momd1gSsvggO0e5KptP1dYBsXDrCVQacXkhjKjGq-XsCOa63N8A41Pet044xK0m-6RBQKHZh34-qPw" 
                      alt="Oil" className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-bold text-xs text-gray-800">Oil Stain</p>
                      <p className="text-[10px] text-gray-500">Polyester Jacket</p>
                    </div>
                  </button>

                  <button
                    onClick={() => selectDemoStainImage(
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuBl10mo3pltBbDptWpGk2annYUUfhqBmUkzZenV52kzpWLA0_te_PTaZ6HKpCGAIm63Syog0DqjjqPTBfRPfp_-ORWfI2-KxsEmpURv1iH9JomF52tiNHrNl6qBvYDg8kVxejFlEKUiCKQVek3wU4yAqRfWSsCX9vzmspV1J28WKrcqYD8LfT1G4pcp74EzAq4hXs51scj3CM97VBMWb_0DGngR5eo9fBPI_FfE6lSIBC22P9lNGxKYwg",
                      "Wool",
                      "General organic smear on fine knit wool fibers.",
                      "Organic"
                    )}
                    className="flex items-center gap-3 p-2 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/20 text-left transition-all active:scale-95"
                  >
                    <img 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBl10mo3pltBbDptWpGk2annYUUfhqBmUkzZenV52kzpWLA0_te_PTaZ6HKpCGAIm63Syog0DqjjqPTBfRPfp_-ORWfI2-KxsEmpURv1iH9JomF52tiNHrNl6qBvYDg8kVxejFlEKUiCKQVek3wU4yAqRfWSsCX9vzmspV1J28WKrcqYD8LfT1G4pcp74EzAq4hXs51scj3CM97VBMWb_0DGngR5eo9fBPI_FfE6lSIBC22P9lNGxKYwg" 
                      alt="Wool" className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-bold text-xs text-gray-800">Organic stain</p>
                      <p className="text-[10px] text-gray-500">Knit Wool</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Quick Guides Section */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 tracking-tight">Quick Guides</h3>
                  <button onClick={() => setScreen('history')} className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
                    VIEW HISTORY <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-3 -mx-6 px-6">
                  {quickGuides.map((guide) => {
                    // Match icons
                    const getIcon = (stain: string) => {
                      if (stain === "Coffee") return <Coffee className="w-5 h-5 text-amber-800" />;
                      if (stain === "Wine") return <Wine className="w-5 h-5 text-red-700" />;
                      if (stain === "Ink") return <Shirt className="w-5 h-5 text-blue-900" />;
                      return <Droplets className="w-5 h-5 text-yellow-600" />;
                    };

                    return (
                      <div 
                        key={guide.id}
                        onClick={() => handleQuickGuideClick(guide)}
                        className="flex-none w-36 h-44 bg-white rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md border border-gray-100 cursor-pointer transition-all duration-200 active:scale-95"
                      >
                        <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center shadow-inner">
                          {getIcon(guide.stain)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 text-base">{guide.stain}</h4>
                          <p className="text-xs text-gray-500 mt-1">{guide.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stats / Fresh Banner Section */}
              <div className="bg-blue-50/50 rounded-3xl p-5 border border-blue-100 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden shadow border-2 border-white shrink-0">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBl10mo3pltBbDptWpGk2annYUUfhqBmUkzZenV52kzpWLA0_te_PTaZ6HKpCGAIm63Syog0DqjjqPTBfRPfp_-ORWfI2-KxsEmpURv1iH9JomF52tiNHrNl6qBvYDg8kVxejFlEKUiCKQVek3wU4yAqRfWSsCX9vzmspV1J28WKrcqYD8LfT1G4pcp74EzAq4hXs51scj3CM97VBMWb_0DGngR5eo9fBPI_FfE6lSIBC22P9lNGxKYwg" 
                    alt="Fabric fibers close up" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-blue-900 text-base">84 Clothes Saved</h4>
                  <p className="text-xs text-blue-800/80 mt-1">This month by the &quot;No Stain No Gain&quot; AI community rescue service.</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* SCREEN: TELL US MORE */}
          {screen === 'more' && (
            <motion.div 
              key="more"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-6 p-6"
            >
              {/* Back & header */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={resetDiagnosisFlow}
                  className="hover:bg-gray-100 p-2 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Tell us more</h2>
              </div>

              <p className="text-sm text-gray-500 -mt-2">
                Providing fabric and timing details helps Gemini AI construct the perfect chemical solution to lift the stain safely.
              </p>

              {/* Uploaded Preview State */}
              {uploadedImage && (
                <div className="w-full h-36 rounded-2xl overflow-hidden relative border border-gray-100 shadow-inner">
                  <img src={uploadedImage} alt="Stain Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/10"></div>
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-gray-800">
                    Uploaded Stain Photo
                  </span>
                </div>
              )}

              {quickStainType && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-900 uppercase">Selected Category</p>
                    <p className="text-sm font-bold text-gray-800">{quickStainType} Stain Guide</p>
                  </div>
                </div>
              )}

              {/* Fabric Type Grid */}
              <div className="space-y-3">
                <label className="font-bold text-base text-gray-800 block px-1">Fabric Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {["Cotton", "Polyester", "Wool", "Silk", "Denim", "Other"].map((fabric) => {
                    const isSelected = selectedFabric === fabric;
                    return (
                      <button
                        key={fabric}
                        type="button"
                        onClick={() => setSelectedFabric(fabric)}
                        className={`py-3 px-4 rounded-xl font-medium text-sm transition-all duration-150 active:scale-95 border-2 ${
                          isSelected 
                          ? 'border-blue-600 bg-blue-50/70 text-blue-700 font-bold' 
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {fabric}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stain Age selection */}
              <div className="space-y-3">
                <label className="font-bold text-base text-gray-800 block px-1">How old is the stain?</label>
                <div className="flex flex-wrap gap-2">
                  {["Just now", "1 hour", "Today", "Several days", "1 week+"].map((age) => {
                    const isSelected = selectedAge === age;
                    return (
                      <button
                        key={age}
                        type="button"
                        onClick={() => setSelectedAge(age)}
                        className={`py-2 px-4 rounded-full font-medium text-xs transition-all duration-150 active:scale-95 ${
                          isSelected 
                          ? 'bg-[#0061a4] text-white shadow-sm font-semibold' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {age}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes Input */}
              <div className="space-y-3">
                <label className="font-bold text-base text-gray-800 block px-1">Additional notes</label>
                <textarea 
                  className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-sm text-gray-800 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all resize-none shadow-sm"
                  rows={3}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Mention specific colors, laundry attempts, or any detergents already used..."
                />
              </div>

              {/* AI Helpful Context Tip */}
              <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-800">AI Quick Tip ({selectedFabric})</p>
                  <p className="text-xs text-amber-900/80 mt-1 leading-relaxed">
                    {getContextualTip(selectedFabric)}
                  </p>
                </div>
              </div>

              {/* Primary Action Button */}
              <button 
                onClick={triggerAnalysis}
                className="w-full py-4 mt-4 bg-[#0061a4] hover:bg-blue-800 text-white font-semibold text-lg rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                Analyze Stain <Sparkles className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* SCREEN: ANALYZING */}
          {screen === 'analyzing' && (
            <motion.div 
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-[70vh]"
            >
              <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Outer spinning dash circle */}
                <div className="absolute inset-0 border-4 border-dashed border-blue-500/30 rounded-full animate-[spin_12s_linear_infinite]"></div>
                
                {/* Glowing ring */}
                <div className="absolute w-52 h-52 bg-blue-100 rounded-full filter blur-2xl opacity-75 animate-pulse"></div>

                {/* AI Central Orb Card */}
                <div className="relative z-10 w-44 h-44 rounded-full bg-white/70 backdrop-blur-md shadow-lg border border-white flex flex-col items-center justify-center p-4">
                  <Droplets className="w-12 h-12 text-[#0061a4] mb-2 animate-bounce" />
                  <span className="font-extrabold text-2xl text-[#0061a4] tracking-wider">AI</span>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">SCANNING</p>
                  
                  {/* Vertical moving scanning line overlay */}
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent via-blue-500/20 to-transparent scanning-line pointer-events-none"></div>
                </div>

                {/* Floating Tags for High Tech Look */}
                <span className="absolute top-6 -right-4 bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[9px] font-bold text-blue-700 tracking-wider shadow border border-gray-100 uppercase">
                  Density Check
                </span>
                <span className="absolute bottom-6 -left-4 bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[9px] font-bold text-blue-700 tracking-wider shadow border border-gray-100 uppercase">
                  pH Level: 4.2
                </span>
              </div>

              {/* Progress Messages */}
              <div className="mt-12 w-full max-w-xs space-y-3">
                <h3 className="text-lg font-bold text-gray-800">Gemini is analyzing...</h3>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                  <RefreshCw className="w-4 h-4 text-[#0061a4] animate-spin" />
                  <span className="text-xs font-semibold text-gray-600 text-left">
                    Analyzing stain density and material fiber structures...
                  </span>
                </div>
              </div>

              <button 
                onClick={resetDiagnosisFlow}
                className="mt-12 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold text-sm rounded-full active:scale-95 transition-all"
              >
                Cancel Scan
              </button>
            </motion.div>
          )}

          {/* SCREEN: DIAGNOSIS RESULT */}
          {screen === 'result' && currentDiagnosis && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6 p-6"
            >
              {/* Back & header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={resetDiagnosisFlow}
                    className="hover:bg-gray-100 p-2 rounded-full transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Diagnosis Results</h2>
                </div>
                <button 
                  onClick={saveResultToHistory}
                  className="bg-blue-50 text-blue-700 p-2.5 rounded-full hover:bg-blue-100 transition-colors"
                  title="Save to History"
                >
                  <Save className="w-5 h-5" />
                </button>
              </div>

              {/* AI Diagnosis Card with Image Background overlay */}
              <div className="bg-white rounded-3xl overflow-hidden shadow-md border border-gray-100">
                <div className="relative h-48 w-full">
                  <img 
                    src={uploadedImage || "https://lh3.googleusercontent.com/aida-public/AB6AXuCm0QSpXYAK-89UlGN0S4BQG3LUf7vPwh0dnKsYGZ65GIgkAiOHEGi4bM73FUpmBIARZouCKeD67tBbGfdeB4rZCCWZZPgNOSS17hu5iOhPpcko6f0eAu_6Yj0ozLZIQpumBPSSn_DiSzaHdsm7tVGRRNgMqZEXMatDSQIaabK78BS2iuHIWAgHLoUy0m9ArJETYGBP-6GeC_MjUJ4ZWdlH2YdE4jP_92HydCc3b-TlljuhbpuEmTXGUw"} 
                    alt="Stain Close-up" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent"></div>
                  
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <div>
                      <span className="text-blue-300 font-bold text-xs uppercase tracking-wider block">AI ANALYSIS COMPLETE</span>
                      <h3 className="text-white font-extrabold text-2xl mt-1 leading-tight">
                        {currentDiagnosis.stainName}
                      </h3>
                    </div>
                    <div className="bg-blue-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {currentDiagnosis.confidence}% Confidence
                    </div>
                  </div>
                </div>

                {/* Sub-tags */}
                <div className="p-5 flex flex-wrap gap-2 border-t border-gray-50 bg-gray-50/50">
                  <span className="px-3 py-1 bg-white rounded-full text-xs font-bold text-gray-700 shadow-sm flex items-center gap-1.5">
                    <Shirt className="w-3.5 h-3.5 text-blue-600" /> {currentDiagnosis.fabricType}
                  </span>
                  <span className="px-3 py-1 bg-white rounded-full text-xs font-bold text-gray-700 shadow-sm flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-blue-600" /> {currentDiagnosis.absorbency}
                  </span>
                </div>
              </div>

              {/* Crucial Precaution Warning */}
              <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-r-2xl p-5 shadow-sm flex gap-3.5 items-start">
                <AlertTriangle className="w-6 h-6 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-yellow-800 uppercase tracking-wide">Crucial Precaution</h4>
                  <p className="text-xs text-yellow-900/90 mt-1 leading-relaxed">
                    {currentDiagnosis.precaution}
                  </p>
                </div>
              </div>

              {/* Recommended Solution Step List */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Step-by-Step Solution</h3>
                <div className="space-y-3">
                  {currentDiagnosis.steps.map((step, index) => (
                    <div key={index} className="flex gap-4 items-center group">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-md">
                        {index + 1}
                      </div>
                      <div className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm group-hover:border-blue-200 transition-colors">
                        <p className="font-bold text-sm text-gray-900">{step.title}</p>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Community Wisdom */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <h3 className="text-xl font-bold text-gray-900 tracking-tight">Community Wisdom</h3>
                  <button className="text-xs font-bold text-blue-600 hover:underline">VIEW ALL</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentDiagnosis.communityWisdom.map((wisdom, index) => (
                    <div key={index} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Bot className="w-4 h-4 text-orange-600" />
                          <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">{wisdom.source}</span>
                        </div>
                        <p className="text-xs font-bold text-gray-800 leading-relaxed italic">
                          &quot;{wisdom.text}&quot;
                        </p>
                      </div>
                      <p className="text-[10px] font-medium text-blue-600 mt-3 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-blue-600" /> {wisdom.subtext}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Action Stack */}
              <div className="flex flex-col gap-3 pt-4">
                <button 
                  onClick={saveResultToHistory}
                  className="w-full py-4 bg-[#0061a4] hover:bg-blue-800 text-white font-semibold text-base rounded-full shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Save className="w-5 h-5" /> Save Result
                </button>
                <div className="flex gap-3">
                  <button 
                    onClick={resetDiagnosisFlow}
                    className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-full flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" /> Try Another
                  </button>
                  <button 
                    onClick={askAIChemicalQuery}
                    className="flex-1 py-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-sm rounded-full flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-blue-600" /> Ask AI Expert
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* SCREEN: HISTORY */}
          {screen === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6 p-6"
            >
              {/* Header */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Search Scans</h2>
                <p className="text-xs text-gray-500 mt-1">Review your previously resolved and diagnosed fabric rescues.</p>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-white border-2 border-gray-100 rounded-full text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
                  placeholder="Search previous scans..."
                />
              </div>

              {/* Filter Row */}
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                {(['All', 'Success', 'In Progress', 'Garments'] as const).map((filter) => {
                  const isActive = historyFilter === filter;
                  return (
                    <button
                      key={filter}
                      onClick={() => setHistoryFilter(filter)}
                      className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                        isActive 
                        ? 'bg-[#0061a4] text-white shadow-sm' 
                        : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
                      }`}
                    >
                      {filter}
                    </button>
                  );
                })}
              </div>

              {/* History List */}
              <div className="space-y-4">
                {filteredHistory.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 space-y-2">
                    <Info className="w-10 h-10 mx-auto opacity-50" />
                    <p className="text-sm font-semibold">No history items found</p>
                    <p className="text-xs">Try starting a scan first to save some results.</p>
                  </div>
                ) : (
                  filteredHistory.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => {
                        setSelectedFabric(item.fabricType);
                        setCurrentDiagnosis(item.diagnosis);
                        setScreen('result');
                      }}
                      className="bg-white rounded-2xl p-5 shadow-sm hover:shadow flex items-center gap-4 border border-gray-100 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-100 bg-gray-50">
                        <img src={item.imageUrl} alt={item.stainName} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-gray-800 text-sm truncate pr-2">{item.stainName}</h4>
                          <span className="text-[10px] font-bold text-gray-400 shrink-0">{item.date}</span>
                        </div>
                        <div className="flex gap-1.5 mt-1.5">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[9px] font-bold">
                            {item.fabricType}
                          </span>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[9px] font-bold">
                            {item.garmentType}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-2.5">
                          <span className={`w-2 h-2 rounded-full ${item.status === 'Success' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                          <span className={`text-[10px] font-extrabold ${item.status === 'Success' ? 'text-green-700' : 'text-amber-700'}`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* SCREEN: CHAT / AI TIPS */}
          {screen === 'chat' && (
            <motion.div 
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col p-6 h-[72vh]"
            >
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-200">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvLKFec1OcYNc3xmJcjZl7O0SKV8k9Pf8-BXwBr0sxfx4WY3dGv4ETUgUoYEq8A1bU15J3CQqT1JSiw6_2a7djkguoNRIFPlzJvlTaV5UiMS6aQTJAtBN9P0O0oqp8TdSfJzu7IUJCznOW6zplpXrB_LvnMov9QrrSznppF0ku8ehnSxkiB8cNZ-iCnktxArJjWh4gh9RP9QtOnaJ9fuW7kwPDXc0BSl3KUV8nye1i8YoCuwgEsD-f5A" 
                    alt="AI Expert Assistant Portrait" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 leading-none">AI Fabric Care Assistant</h2>
                  <span className="text-[10px] font-bold text-green-600 tracking-wide uppercase mt-1 inline-block">Online Rescue Active</span>
                </div>
              </div>

              {/* Messages viewport */}
              <div className="flex-grow overflow-y-auto hide-scrollbar space-y-4 py-4 pr-1">
                {chatMessages.map((msg) => {
                  const isAI = msg.role === "model";
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex gap-3 items-start ${isAI ? 'justify-start' : 'justify-end'}`}
                    >
                      {isAI && (
                        <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 mt-1 shadow-sm">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}
                      
                      <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                        isAI 
                        ? 'bg-white text-gray-800 rounded-tl-none border border-gray-100' 
                        : 'bg-[#0061a4] text-white rounded-tr-none'
                      }`}>
                        <p className="text-xs leading-relaxed font-medium">{msg.text}</p>
                        
                        {/* Optional timing visual block if provided */}
                        {msg.estimatedTime && (
                          <div className={`mt-3 p-2.5 rounded-xl flex items-center gap-2 text-xs font-bold ${isAI ? 'bg-blue-50/50 text-[#0061a4]' : 'bg-blue-800 text-blue-100'}`}>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Estimated time: {msg.estimatedTime}</span>
                          </div>
                        )}
                        
                        {/* Optional soaking visual asset for extreme high fidelity */}
                        {msg.id === "msg-ai-bleach-soak" && (
                          <div className="mt-3 rounded-xl overflow-hidden border border-blue-100 shadow-inner">
                            <img 
                              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB12WeFZjxaw_LNzrkwRccFMS3_JR_GpzsjH_xIiDG73qtI15EfHM9bHznXtldD0o0kNLVUq4NKOOg-CbcohZG7JXYvN3ohmVXbw2gZP46-5HuAuQdj_tx3HOiF1FYV3kYJu2rWSoM2Bn9RKUJCbTEMSBBSXkEH90QG61iwM7Wc5SHIeL_TbqJaX-ra5kjQgoKG4f7Od-MGwm-gd2rdzgJjvTh7aas7G7sQMQppukPopsrmdhOiU-wgww" 
                              alt="Garment Soaking Example" 
                              className="w-full h-32 object-cover"
                            />
                            <div className="bg-gray-50 p-2.5 text-[10px] text-gray-500 italic">
                              Example of proper soaking depth for cotton blends.
                            </div>
                          </div>
                        )}

                        <span className={`text-[9px] block text-right mt-1.5 opacity-60 ${isAI ? 'text-gray-500' : 'text-blue-100'}`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {isChatTyping && (
                  <div className="flex gap-3 justify-start items-center">
                    <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl px-4 py-3 text-xs font-bold text-gray-500 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef}></div>
              </div>

              {/* Chat action footer chips */}
              <div className="flex flex-col gap-3 shrink-0 pt-2 border-t border-gray-100">
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                  {[
                    "Can I use bleach?",
                    "Is it machine washable?",
                    "Will the stain become permanent?"
                  ].map((chipText, idx) => {
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (chipText === "Can I use bleach?") {
                            // High fidelity specific sequence
                            setChatMessages(prev => [
                              ...prev,
                              {
                                id: `msg-chip-${Date.now()}`,
                                role: "user",
                                text: chipText,
                                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              },
                              {
                                id: "msg-ai-bleach-soak",
                                role: "model",
                                text: "Try soaking the fabric in warm water with oxygen bleach for 30 minutes. This helps break down organic stain molecules without damaging the delicate cotton fibers.",
                                estimatedTime: "30-45 mins",
                                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              }
                            ]);
                          } else {
                            askAssistant(chipText);
                          }
                        }}
                        className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full whitespace-nowrap active:scale-95 transition-all shadow-sm"
                      >
                        {chipText}
                      </button>
                    );
                  })}
                </div>

                {/* Input bar */}
                <div className="flex items-center gap-2 bg-white rounded-full p-1.5 border border-gray-200 shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
                  <button className="p-2.5 text-gray-500 hover:text-gray-700 rounded-full transition-colors">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <input 
                    type="text"
                    value={chatInputText}
                    onChange={(e) => setChatInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') askAssistant(chatInputText);
                    }}
                    placeholder="Ask about the stain..."
                    className="flex-grow bg-transparent text-sm text-gray-800 outline-none px-2"
                  />
                  <button 
                    onClick={() => askAssistant(chatInputText)}
                    className="bg-[#0061a4] hover:bg-blue-800 text-white p-2.5 rounded-full active:scale-90 transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* SCREEN: SETTINGS */}
          {screen === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6 p-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">App Settings</h2>
                <p className="text-xs text-gray-500 mt-1">Configure your AI preferences and local backup options.</p>
              </div>

              {/* Settings Items */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
                  <h3 className="font-bold text-sm text-gray-800 uppercase tracking-wide border-b border-gray-50 pb-2">AI Diagnostics</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-800">Advanced Material Scanning</p>
                      <p className="text-xs text-gray-500">Analyze micro-fiber structures with maximum token depth</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-800">Grounding via Google Search</p>
                      <p className="text-xs text-gray-500">Reference live community threads for fresh stains</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
                  <h3 className="font-bold text-sm text-gray-800 uppercase tracking-wide border-b border-gray-50 pb-2">Storage &amp; Sync</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-800">Local Cache Autoclean</p>
                      <p className="text-xs text-gray-500">Keep history cache safe and light</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                {/* Reset button */}
                <button 
                  onClick={() => {
                    setHistoryList(initialHistory);
                    alert("History has been reset successfully!");
                  }}
                  className="w-full py-4 border border-red-200 hover:bg-red-50 text-red-600 font-semibold text-sm rounded-full transition-all active:scale-95"
                >
                  Clear My History Cache
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* Floating Orb hint - appears on bottom right when scanning or in result or history */}
      {screen !== 'chat' && screen !== 'onboarding' && screen !== 'analyzing' && (
        <div 
          onClick={() => setScreen('chat')}
          className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-tr from-[#0061a4] to-[#2196f3] rounded-full shadow-lg flex items-center justify-center text-white cursor-pointer hover:scale-110 active:scale-90 transition-all z-40 ai-orb-pulse"
          title="Ask AI"
        >
          <Sparkles className="w-6 h-6" />
        </div>
      )}

      {/* Persistent Bottom Navigation Bar */}
      {screen !== 'onboarding' && screen !== 'analyzing' && (
        <nav className="fixed bottom-0 w-full z-40 rounded-t-3xl bg-white shadow-[0px_-10px_30px_rgba(33,150,243,0.06)] border-t border-gray-100 flex justify-around items-center h-20 px-4 pb-2 max-w-lg">
          
          {/* Nav: Home */}
          <button 
            onClick={() => { setScreen('home'); setSelectedHistoryItem(null); }}
            className={`flex flex-col items-center justify-center py-1.5 px-4 rounded-full transition-all ${
              screen === 'home' || screen === 'more' || screen === 'result'
              ? 'bg-blue-50 text-[#0061a4]' 
              : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-1">Home</span>
          </button>

          {/* Nav: History */}
          <button 
            onClick={() => setScreen('history')}
            className={`flex flex-col items-center justify-center py-1.5 px-4 rounded-full transition-all ${
              screen === 'history' 
              ? 'bg-blue-50 text-[#0061a4]' 
              : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <HistoryIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-1">History</span>
          </button>

          {/* Nav: AI Tips (Chat) */}
          <button 
            onClick={() => setScreen('chat')}
            className={`flex flex-col items-center justify-center py-1.5 px-4 rounded-full transition-all ${
              screen === 'chat' 
              ? 'bg-blue-50 text-[#0061a4]' 
              : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Lightbulb className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-1">AI Tips</span>
          </button>

          {/* Nav: Settings */}
          <button 
            onClick={() => setScreen('settings')}
            className={`flex flex-col items-center justify-center py-1.5 px-4 rounded-full transition-all ${
              screen === 'settings' 
              ? 'bg-blue-50 text-[#0061a4]' 
              : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <SettingsIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-1">Settings</span>
          </button>
        </nav>
      )}

      {/* CAMERA / SIMULATION MODAL */}
      <AnimatePresence>
        {showCameraModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-md flex flex-col border border-gray-100"
            >
              {/* Header */}
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#0061a4]">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Interactive Garment Scanner</h3>
                    <p className="text-[10px] text-gray-500">Keep stain flat and centered</p>
                  </div>
                </div>
                <button 
                  onClick={closeCamera}
                  className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>

              {/* Feed area */}
              <div className="relative aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
                {cameraStream && !cameraError ? (
                  <>
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full h-full object-cover"
                    />
                    {/* Crop target guides */}
                    <div className="absolute inset-8 border-2 border-dashed border-white/50 rounded-2xl pointer-events-none flex items-center justify-center">
                      <div className="w-8 h-8 border-t-2 border-l-2 border-blue-400 absolute top-0 left-0"></div>
                      <div className="w-8 h-8 border-t-2 border-r-2 border-blue-400 absolute top-0 right-0"></div>
                      <div className="w-8 h-8 border-b-2 border-l-2 border-blue-400 absolute bottom-0 left-0"></div>
                      <div className="w-8 h-8 border-b-2 border-r-2 border-blue-400 absolute bottom-0 right-0"></div>
                      <span className="text-[9px] text-white/70 tracking-widest uppercase bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs font-mono">
                        Center Stain Area
                      </span>
                    </div>
                  </>
                ) : (
                  /* Camera permission / environment fallback simulation */
                  <div className="absolute inset-0 p-6 flex flex-col justify-between bg-gradient-to-b from-slate-900 to-slate-950 text-white">
                    <div className="text-center py-4 space-y-2">
                      <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center text-red-400 mx-auto animate-pulse">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-xs text-red-400 uppercase tracking-wider">Webcam Sandbox Mode</h4>
                      <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                        Camera hardware is restricted inside the current sandbox iframe or requires user permission.
                      </p>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 space-y-2">
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wide">High-Fidelity Snapshot Simulator</p>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        Choose a real-world simulated photo angle to snap instantly:
                      </p>

                      <div className="grid grid-cols-3 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => selectDemoStainImage(
                            "https://lh3.googleusercontent.com/aida-public/AB6AXuDNPs4lfVRNaz11hpWzpihFard226XVPuk68G-xsEgyPSPkyaoQfunPbTTt2DOqrE1cR3tgCzWk760udwhEVN3vCJWM-ErBaousL0K09Kh9Yn8k7ZIBQDYAD0ibBsrp-eEhZPcGD8wURT5k1XQebcFXJKDZf551UZ7YbMQJpBxk96ZliMQe0BKWGdPfLvdaRJ7k6AihjCXnlzLMsfu7pK5CIzP5pVhcQkv3ocTw97AxDoGiAIxiKyYIiA",
                            "Cotton",
                            "Simulated close-up shot of dark morning coffee stain spilled on cotton.",
                            "Coffee"
                          )}
                          className="flex flex-col items-center gap-1.5 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 hover:border-blue-500 border border-transparent transition-all"
                        >
                          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNPs4lfVRNaz11hpWzpihFard226XVPuk68G-xsEgyPSPkyaoQfunPbTTt2DOqrE1cR3tgCzWk760udwhEVN3vCJWM-ErBaousL0K09Kh9Yn8k7ZIBQDYAD0ibBsrp-eEhZPcGD8wURT5k1XQebcFXJKDZf551UZ7YbMQJpBxk96ZliMQe0BKWGdPfLvdaRJ7k6AihjCXnlzLMsfu7pK5CIzP5pVhcQkv3ocTw97AxDoGiAIxiKyYIiA" className="w-full h-10 object-cover rounded" />
                          <span className="text-[9px] font-semibold text-slate-300">Coffee Close-up</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => selectDemoStainImage(
                            "https://lh3.googleusercontent.com/aida-public/AB6AXuAX1HtwILbULqgmrFLasmVRUfCfJShW-mplQq9dNHSCgJyh8SUnxmQGJuyC8K6LRNwFD-CT-vQsTu_gLK2fvgP5q8wWNX-OEB8mg3mldiWQw2wqiA4eOb8LTNR_jgX_hiQkXMzkFoL4nkB6Yc7YMHZwogZ7CbwwGOEyiBo_vgn0LuY1DXt51TAiwsZGf73z1MDhUQzlk3dqNQolky1RphDt5ChTP0nO0R-3M_xibxI05dSiavl1lEQbJA",
                            "Denim",
                            "Simulated detail scan of blue fountain pen ink spread in thick pocket weave.",
                            "Ink"
                          )}
                          className="flex flex-col items-center gap-1.5 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 hover:border-blue-500 border border-transparent transition-all"
                        >
                          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAX1HtwILbULqgmrFLasmVRUfCfJShW-mplQq9dNHSCgJyh8SUnxmQGJuyC8K6LRNwFD-CT-vQsTu_gLK2fvgP5q8wWNX-OEB8mg3mldiWQw2wqiA4eOb8LTNR_jgX_hiQkXMzkFoL4nkB6Yc7YMHZwogZ7CbwwGOEyiBo_vgn0LuY1DXt51TAiwsZGf73z1MDhUQzlk3dqNQolky1RphDt5ChTP0nO0R-3M_xibxI05dSiavl1lEQbJA" className="w-full h-10 object-cover rounded" />
                          <span className="text-[9px] font-semibold text-slate-300">Ink Pocket</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => selectDemoStainImage(
                            "https://lh3.googleusercontent.com/aida-public/AB6AXuCjxLHkZollz60UMuNI0ZAb9lHEjZXeiXs74PSvZnrGBtZI100Q4KPw6nkmwaR39_9dJw9UOAf_4fBca_FqtgReJL5mcQSVrJjBnTgp7pBFlwSmR7f1AJK_4TuVLkkQ9WhP1yxoyEKXcnEYgWxAmIikQDt28TuJFwRC_GuF8z1_Momd1gSsvggO0e5KptP1dYBsXDrCVQacXkhjKjGq-XsCOa63N8A41Pet044xK0m-6RBQKHZh34-qPw",
                            "Polyester",
                            "Simulated back-light fiber scan of oily cooking splatter on synthetic material.",
                            "Oil"
                          )}
                          className="flex flex-col items-center gap-1.5 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 hover:border-blue-500 border border-transparent transition-all"
                        >
                          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjxLHkZollz60UMuNI0ZAb9lHEjZXeiXs74PSvZnrGBtZI100Q4KPw6nkmwaR39_9dJw9UOAf_4fBca_FqtgReJL5mcQSVrJjBnTgp7pBFlwSmR7f1AJK_4TuVLkkQ9WhP1yxoyEKXcnEYgWxAmIikQDt28TuJFwRC_GuF8z1_Momd1gSsvggO0e5KptP1dYBsXDrCVQacXkhjKjGq-XsCOa63N8A41Pet044xK0m-6RBQKHZh34-qPw" className="w-full h-10 object-cover rounded" />
                          <span className="text-[9px] font-semibold text-slate-300">Oil Splatter</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer capture trigger */}
              <div className="p-5 bg-gray-50 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeCamera}
                  className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 font-semibold text-xs rounded-full border border-gray-200 transition-colors active:scale-95"
                >
                  Cancel
                </button>
                {cameraStream && !cameraError && (
                  <button
                    type="button"
                    onClick={captureSnapshot}
                    className="px-6 py-2 bg-[#0061a4] hover:bg-blue-800 text-white font-semibold text-xs rounded-full flex items-center gap-1.5 shadow active:scale-95 transition-all"
                  >
                    <Sparkles className="w-4 h-4" /> Capture Photo
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
