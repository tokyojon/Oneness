import React, { useState, useRef, useEffect } from 'react';
import { generateCharacterAnalysis, estimateAge, generateAvatar } from '../lib/gemini';
import { supabase } from '../src/lib/supabase';
import { Button } from './ui/Button';
import { 
  MapPin, 
  Heart, 
  Users, 
  BookOpen, 
  PartyPopper, 
  Tv, 
  Palmtree, 
  Tent, 
  Home,
  CalendarDays,
  Sparkles,
  Gift,
  Palette,
  Calculator,
  Hammer,
  Wine,
  Frown,
  Smile,
  Check,
  ChevronRight,
  Loader2,
  X,
  Shield,
  Zap,
  Brain,
  Compass,
  Coffee,
  Anchor,
  Camera,
  Upload,
  RefreshCw,
  AlertTriangle,
  Save
} from 'lucide-react';

interface OnboardingModalProps {
  onClose: () => void;
  userName: string;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose, userName }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingText, setLoadingText] = useState("Processing...");
  const [analysis, setAnalysis] = useState<string | null>(null);
  
  // Selfie & Avatar State
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Age Verification State
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [birthYear, setBirthYear] = useState("");
  const [isMinor, setIsMinor] = useState(false);
  const [ageCheckComplete, setAgeCheckComplete] = useState(false);

  const [formData, setFormData] = useState({
    relationship: '',
    location: '',
    friendsDescription: [] as string[],
    social: '',
    vacation: '',
    planning: '',
    hobby: '',
    outlook: ''
  });

  const handleMultiSelect = (field: string, value: string) => {
    setFormData(prev => {
      const current = prev.friendsDescription;
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, friendsDescription: updated };
    });
  };

  const handleSingleSelect = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = async () => {
    if (step < 3) {
      setStep(prev => prev + 1);
    } else if (step === 3) {
      setStep(4); // Go to Selfie Step
    }
  };

  const startCamera = async () => {
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const processSelfieAndGenerate = async () => {
    if (!capturedImage) return;

    setStep(5); // Move to Processing/Result step
    setIsLoading(true);
    
    // Rotate loading texts
    const loadingMessages = [
      "Analyzing cuteness levels...",
      "Teaching AI to draw anime...",
      "Applying chibi filter...",
      "Polishing pixels...",
      "Almost ready..."
    ];
    let msgIndex = 0;
    setLoadingText(loadingMessages[0]);
    const textInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % loadingMessages.length;
      setLoadingText(loadingMessages[msgIndex]);
    }, 2000);

    try {
      // Clean base64 string
      const base64Data = capturedImage.split(',')[1];

      // Parallel execution for Text Analysis, Age Check, Avatar Gen
      const analysisPromise = generateCharacterAnalysis(formData);
      const agePromise = estimateAge(base64Data);
      const avatarPromise = generateAvatar(base64Data);

      // Handle Age Check first to prompt if needed
      const age = await agePromise;
      if (age !== null && age < 18) {
        setShowAgeVerification(true);
        // We pause here visually, but promises continue in background.
        // The UI will show the age form overlay.
      } else {
        setAgeCheckComplete(true);
      }

      const [textResult, avatarResult] = await Promise.all([analysisPromise, avatarPromise]);
      
      setAnalysis(textResult);
      if (avatarResult) {
        setAvatarImage(`data:image/jpeg;base64,${avatarResult}`);
      }
      
    } catch (error) {
      console.error("Processing error:", error);
    } finally {
      clearInterval(textInterval);
      setIsLoading(false);
    }
  };

  const verifyAge = () => {
    const year = parseInt(birthYear);
    const currentYear = new Date().getFullYear();
    if (year && (currentYear - year) < 18) {
      setIsMinor(true);
    }
    setShowAgeVerification(false);
    setAgeCheckComplete(true);
  };

  const handleComplete = async () => {
    setIsSaving(true);
    
    try {
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // 1. Save Profile Data first (without base64 avatar)
          const profileData = {
            id: user.id,
            relationship_status: formData.relationship,
            location: formData.location,
            friends_description: formData.friendsDescription,
            weekend_preference: formData.social,
            vacation_preference: formData.vacation,
            planning_style: formData.planning,
            primary_interest: formData.hobby,
            life_outlook: formData.outlook,
            birth_year: birthYear ? parseInt(birthYear) : null,
            is_minor: isMinor,
            character_analysis: analysis,
            // We do NOT save avatar_image as base64 anymore.
            // The Edge Function will handle uploading and updating the URL.
            updated_at: new Date().toISOString()
          };

          const { error: dbError } = await supabase
            .from('user_profiles')
            .upsert(profileData);

          if (dbError) {
            console.error('Error saving profile:', dbError);
          } else if (avatarImage) {
            // 2. Invoke Edge Function to upload avatar
            // The function expects a JSON payload with the avatar
            // We pass the full base64 string (including data prefix if present)
            const { error: funcError } = await supabase.functions.invoke('upload-avatar', {
              body: { avatar: avatarImage }
            });

            if (funcError) {
              console.error('Error invoking upload-avatar function:', funcError);
            }
          }
        }
      }
    } catch (err) {
      console.error('Unexpected error saving profile:', err);
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  const renderStepper = () => {
    const steps = [
      { num: 1, label: 'Basics' },
      { num: 2, label: 'Lifestyle' },
      { num: 3, label: 'Outlook' },
      { num: 4, label: 'Avatar' },
    ];

    return (
      <div className="flex items-center">
        {steps.map((s, index) => {
          const isActive = step === s.num;
          const isCompleted = step > s.num;
          const isLast = index === steps.length - 1;

          return (
            <div key={s.num} className="flex items-center">
              <div 
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300
                  ${isActive 
                    ? 'border-brand-500 bg-brand-500/20 text-brand-400 shadow-[0_0_10px_rgba(14,165,233,0.3)]' 
                    : isCompleted
                      ? 'border-brand-500 bg-brand-500 text-white'
                      : 'border-slate-700 bg-slate-800/50 text-slate-500'
                  }
                `}
              >
                {isCompleted ? <Check size={14} strokeWidth={3} /> : s.num}
              </div>
              
              <span className={`
                ml-2 text-xs font-medium transition-colors duration-300 hidden sm:block
                ${isActive ? 'text-white' : isCompleted ? 'text-slate-300' : 'text-slate-600'}
              `}>
                {s.label}
              </span>

              {!isLast && (
                <div className={`
                  w-4 sm:w-6 h-0.5 mx-1 sm:mx-2 rounded transition-colors duration-300
                  ${isCompleted ? 'bg-brand-500' : 'bg-slate-800'}
                `} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Step 1: Basics
  const renderStep1 = () => {
    const traits = [
      { label: 'Funny', icon: Smile },
      { label: 'Loyal', icon: Shield },
      { label: 'Intelligent', icon: Brain },
      { label: 'Adventurous', icon: Compass },
      { label: 'Quiet', icon: Coffee },
      { label: 'Energetic', icon: Zap },
      { label: 'Reliable', icon: Anchor },
      { label: 'Creative', icon: Palette }
    ];

    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-300">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">Let's get to know you</h3>
          <p className="text-slate-400">Basic details to start your profile.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Relationship Status</label>
            <select 
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none"
              value={formData.relationship}
              onChange={(e) => handleSingleSelect('relationship', e.target.value)}
            >
              <option value="">Select status</option>
              <option value="Single">Single</option>
              <option value="In a relationship">In a relationship</option>
              <option value="Married">Married</option>
              <option value="It's complicated">It's complicated</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Where do you live?</label>
            <select 
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none"
              value={formData.location}
              onChange={(e) => handleSingleSelect('location', e.target.value)}
            >
              <option value="">Select location</option>
              <option value="Tokyo">Tokyo</option>
              <option value="Kanagawa (Yokohama)">Kanagawa (Yokohama)</option>
              <option value="Osaka">Osaka</option>
              <option value="Kyoto">Kyoto</option>
              <option value="Hyogo (Kobe)">Hyogo (Kobe)</option>
              <option value="Saitama">Saitama</option>
              <option value="Chiba">Chiba</option>
              <option value="Aichi (Nagoya)">Aichi (Nagoya)</option>
              <option value="Hokkaido (Sapporo)">Hokkaido (Sapporo)</option>
              <option value="Fukuoka">Fukuoka</option>
              <option value="Okinawa">Okinawa</option>
              <option value="Hiroshima">Hiroshima</option>
              <option value="Miyagi (Sendai)">Miyagi (Sendai)</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">How would friends describe you?</label>
            <div className="flex flex-wrap gap-2">
              {traits.map((trait) => (
                <button
                  key={trait.label}
                  onClick={() => handleMultiSelect('friendsDescription', trait.label)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
                    formData.friendsDescription.includes(trait.label)
                      ? 'bg-brand-500/20 border-brand-500 text-brand-300'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <trait.icon size={14} />
                  {trait.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Step 2: Preferences
  const renderStep2 = () => (
    <div className="space-y-8 animate-in slide-in-from-right duration-300">
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white">Lifestyle Choices</h3>
        <p className="text-slate-400">There are no wrong answers.</p>
      </div>

      <div className="space-y-6">
        {/* Social */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-300">Would you rather spend your weekend...</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'Party', label: 'Lively Party', icon: PartyPopper },
              { id: 'TV', label: 'Binge TV', icon: Tv },
              { id: 'Reading', label: 'Quiet Book', icon: BookOpen },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSingleSelect('social', opt.id)}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  formData.social === opt.id
                    ? 'bg-brand-500/20 border-brand-500 text-brand-300'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <opt.icon size={20} />
                <span className="text-xs text-center">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Vacation */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-300">Your ideal vacation is...</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'Home', label: 'Home w/ Friends', icon: Home },
              { id: 'Mountain', label: 'Cabin Adventure', icon: Tent },
              { id: 'Beach', label: 'Beach Resort', icon: Palmtree },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSingleSelect('vacation', opt.id)}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  formData.vacation === opt.id
                    ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <opt.icon size={20} />
                <span className="text-xs text-center">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Step 3: Deep Dive
  const renderStep3 = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white">Personality & Outlook</h3>
        <p className="text-slate-400">Almost there.</p>
      </div>

      <div className="space-y-6">
        {/* Planning */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-300">Trip planning style?</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'Detailed', label: 'Detailed Itinerary', icon: CalendarDays },
              { id: 'Spontaneous', label: 'Spontaneous', icon: Sparkles },
              { id: 'Surprises', label: 'Sudden Surprises', icon: Gift },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSingleSelect('planning', opt.id)}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  formData.planning === opt.id
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <opt.icon size={18} />
                <span className="text-xs text-center">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Hobby */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-300">What draws you more?</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'ArtMusic', label: 'Art & Music', icon: Palette },
              { id: 'MathScience', label: 'Math & Science', icon: Calculator },
              { id: 'Building', label: 'Building Projects', icon: Hammer },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSingleSelect('hobby', opt.id)}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  formData.hobby === opt.id
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <opt.icon size={18} />
                <span className="text-xs text-center">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Outlook */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-300">Is the glass...</p>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleSingleSelect('outlook', 'Half-full')}
              className={`p-4 rounded-xl border flex items-center justify-center gap-3 transition-all ${
                formData.outlook === 'Half-full'
                  ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Smile size={20} />
              <span className="text-sm">Half Full</span>
            </button>
            <button
              onClick={() => handleSingleSelect('outlook', 'Half-empty')}
              className={`p-4 rounded-xl border flex items-center justify-center gap-3 transition-all ${
                formData.outlook === 'Half-empty'
                  ? 'bg-slate-600/30 border-slate-500 text-slate-300'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Frown size={20} />
              <span className="text-sm">Half Empty</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 4: Selfie Input
  const renderStep4 = () => (
    <div className="space-y-8 animate-in slide-in-from-right duration-300">
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white">Create Your Avatar</h3>
        <p className="text-slate-400">Take a selfie to generate your anime alter-ego.</p>
      </div>

      <div className="bg-slate-900/50 border-2 border-dashed border-slate-700 rounded-2xl h-80 flex flex-col items-center justify-center relative overflow-hidden group">
        
        {capturedImage ? (
          <div className="relative w-full h-full">
            <img src={capturedImage} alt="Selfie" className="w-full h-full object-cover" />
            <button 
              onClick={() => setCapturedImage(null)}
              className="absolute top-4 right-4 p-2 bg-slate-900/80 text-white rounded-full hover:bg-red-500/80 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        ) : cameraActive ? (
          <div className="relative w-full h-full">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform -scale-x-100" />
            <canvas ref={canvasRef} className="hidden" />
            <button 
              onClick={capturePhoto}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 transition-transform"
            >
              <div className="w-12 h-12 bg-white rounded-full" />
            </button>
             <button 
              onClick={stopCamera}
              className="absolute top-4 right-4 p-2 bg-slate-900/80 text-white rounded-full"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 p-6 w-full max-w-sm">
            <button 
              onClick={startCamera}
              className="w-full py-4 bg-brand-600 hover:bg-brand-500 rounded-xl text-white font-medium flex items-center justify-center gap-3 transition-colors shadow-lg shadow-brand-500/20"
            >
              <Camera size={24} />
              Take Selfie
            </button>
            
            <div className="flex items-center w-full gap-4">
              <div className="h-px bg-slate-700 flex-1" />
              <span className="text-slate-500 text-sm">OR</span>
              <div className="h-px bg-slate-700 flex-1" />
            </div>

            <label className="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-slate-200 font-medium flex items-center justify-center gap-3 cursor-pointer transition-colors">
              <Upload size={24} />
              Upload Photo
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={processSelfieAndGenerate}
          disabled={!capturedImage}
          className="w-full sm:w-auto px-8"
        >
          Generate Avatar <Sparkles className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  // Step 5: Final Result (Avatar + Analysis)
  const renderStep5 = () => {
    // If we are waiting for age verification, show that overlay
    if (showAgeVerification) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center space-y-6 animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mb-2">
            <Shield className="text-amber-400 h-10 w-10" />
          </div>
          <h3 className="text-2xl font-bold text-white">One quick check!</h3>
          <p className="text-slate-400 max-w-xs mx-auto">
            You have a youthful glow! To ensure the best experience, please tell us your birth year.
          </p>
          <div className="flex gap-2 w-full max-w-xs">
            <input 
              type="number" 
              placeholder="YYYY" 
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white text-center tracking-widest outline-none focus:border-brand-500"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
            />
            <Button onClick={verifyAge} disabled={birthYear.length !== 4}>
              Verify
            </Button>
          </div>
        </div>
      );
    }

    // Loading State
    if (isLoading && (!analysis || !avatarImage)) {
      return (
        <div className="space-y-6 text-center animate-in zoom-in duration-500 flex flex-col items-center justify-center h-full min-h-[400px]">
          <div className="relative w-32 h-32 mx-auto">
            {/* Fancy spinner */}
            <div className="absolute inset-0 border-4 border-transparent border-t-brand-500 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-transparent border-r-purple-500 rounded-full animate-spin reverse" style={{ animationDuration: '1.5s' }}></div>
            <div className="absolute inset-4 border-4 border-transparent border-b-pink-500 rounded-full animate-spin delay-150" style={{ animationDuration: '2s' }}></div>
            
            {/* Center Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="text-white/50 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">{loadingText}</h3>
            <p className="text-slate-500 text-sm">This magic takes a few seconds.</p>
          </div>
        </div>
      );
    }

    // Results State
    return (
      <div className="space-y-6 animate-in zoom-in duration-500 h-full flex flex-col">
        <div className="text-center space-y-2">
           <h2 className="text-2xl font-bold text-white">Your Anime Persona</h2>
           <p className="text-slate-400">Welcome to the Nexus, traveler.</p>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
          {/* Avatar Display */}
          <div className="relative w-48 h-48 mx-auto rounded-full p-1 bg-gradient-to-tr from-brand-500 via-purple-500 to-pink-500 shadow-2xl shadow-purple-500/20">
            <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 relative">
               {avatarImage ? (
                 <img src={avatarImage} alt="Anime Avatar" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                   <span className="text-xs">Image Error</span>
                 </div>
               )}
            </div>
            <div className="absolute bottom-2 right-2 bg-slate-900 rounded-full p-2 border border-slate-700 shadow-lg">
               <Sparkles size={16} className="text-yellow-400" />
            </div>
          </div>
          
          {/* Minor Warning */}
          {isMinor && (
            <div className="bg-amber-900/20 border border-amber-500/30 p-4 rounded-xl flex gap-3 items-start">
               <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
               <div className="space-y-1">
                 <h4 className="text-amber-200 font-medium text-sm">Restricted Access</h4>
                 <p className="text-amber-400/80 text-xs leading-relaxed">
                   Based on your age verification, you are not permitted to interact with others directly. You may enjoy roaming the world, watching, and learning in observer mode.
                 </p>
               </div>
            </div>
          )}

          {/* Analysis Card */}
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl relative">
            <div className="absolute -top-3 -left-3 text-6xl text-brand-500/20 font-serif">"</div>
            <p className="text-slate-200 text-lg italic leading-relaxed relative z-10">
              {analysis}
            </p>
             <div className="absolute -bottom-6 -right-3 text-6xl text-brand-500/20 font-serif transform rotate-180">"</div>
          </div>
        </div>

        <div className="pt-2">
            <Button onClick={handleComplete} isLoading={isSaving} className="w-full">
              Enter Dashboard <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
        </div>
      </div>
    );
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return formData.relationship && formData.location && formData.friendsDescription.length > 0;
      case 2: return formData.social && formData.vacation;
      case 3: return formData.planning && formData.hobby && formData.outlook;
      case 4: return !!capturedImage;
      default: return true;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Progress Bar */}
        <div className="h-1 bg-slate-800 w-full">
          <div 
            className="h-full bg-gradient-to-r from-brand-500 to-purple-500 transition-all duration-500"
            style={{ width: `${(step / 5) * 100}%` }}
          ></div>
        </div>

        {/* Header (Steps 1-4) */}
        {step < 5 && (
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            {renderStepper()}
            
            {/* Optional Skip button */}
            <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
              <X size={20} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderStep5()}
        </div>

        {/* Footer Navigation (Steps 1-3 only) - Step 4 has its own action button */}
        {step < 4 && (
          <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center">
            {step > 1 ? (
              <button 
                onClick={() => setStep(prev => prev - 1)}
                className="text-slate-400 hover:text-white text-sm font-medium px-4 py-2"
              >
                Back
              </button>
            ) : (
               <div></div> // Spacer
            )}
            
            <Button 
              onClick={nextStep} 
              disabled={!isStepValid()}
              className="w-auto px-8"
            >
              Next Step
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};