import { Upload, Camera, CheckCircle, AlertCircle, Sparkles, MapPin, Calendar, Home, Building, Package, IndianRupee, Coins, TrendingUp, ChevronRight, ChevronLeft, ShieldAlert, Wrench, Star, Lightbulb, Compass, RefreshCw, X, Check, FlipHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Separator } from "../ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { ContextualHelp } from "../ContextualHelp";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { api } from "../../services/api";
import { useLanguage } from "../../contexts/LanguageContext";

type Step = "upload" | "details" | "value" | "address" | "method" | "confirm";

interface DeviceDetails {
  deviceType: string;
  brand: string;
  model: string;
  yearOfPurchase: string;
  condition: string;
  functionalStatus: string;
  accessories: string[];
  additionalNotes: string;
}

interface Address {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  addressType: string;
}

export function UploadPage() {
  const { t, language } = useLanguage();
  const [currentStep, setCurrentStep] = useState<Step>("upload");
  const [uploadState, setUploadState] = useState<"idle" | "analyzing" | "complete">("idle");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Camera State and Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraLoading, setCameraLoading] = useState(false);

  // Stop camera when unmounting
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Camera Handlers
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    setIsCameraOpen(true);
    setCameraLoading(true);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraLoading(false);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraLoading(false);
      toast.error(language === 'hi' ? "कैमरा खोलने में असमर्थ। कृपया अनुमति दें।" : language === 'te' ? "కెమెరాను తెరవలేకపోయాము. దయచేసి అనుమతిని ఇవ్వండి." : "Could not open camera. Please check permissions or upload a file.");
      // Fallback: trigger native camera input
      const nativeCam = document.getElementById('native-camera-input') as HTMLInputElement | null;
      if (nativeCam) nativeCam.click();
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setImagePreview(dataUrl);

      // Convert dataUrl to File
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `camera_device_${Date.now()}.jpg`, { type: 'image/jpeg' });
          setSelectedImage(file);
        }
      }, 'image/jpeg', 0.9);

      stopCamera();
      toast.success(language === 'hi' ? "फ़ोटो सफलतापूर्वक ली गई!" : language === 'te' ? "ఫోటో విజయవంతంగా తీయబడింది!" : "Photo captured successfully!");
    }
  };

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const getTranslatedDeviceType = (type?: string) => {
    if (!type) return '';
    const norm = type.trim().toLowerCase();
    if (norm === 'mouse') return language === 'hi' ? 'माउस' : language === 'te' ? 'మౌస్' : 'Mouse';
    if (norm === 'keyboard') return language === 'hi' ? 'कीबोर्ड' : language === 'te' ? 'కీబోర్డ్' : 'Keyboard';
    if (norm === 'laptop') return language === 'hi' ? 'लैपटॉप' : language === 'te' ? 'ల్యాప్‌టాప్' : 'Laptop';
    if (norm === 'smartphone' || norm.includes('phone') || norm.includes('mobile')) return language === 'hi' ? 'स्मार्टफोन' : language === 'te' ? 'స్మార్ట్‌ఫోన్' : 'Smartphone';
    if (norm === 'desktop') return language === 'hi' ? 'डेस्कटॉप कंप्यूटर' : language === 'te' ? 'డెస్క్‌టాప్ కంప్యూటర్' : 'Desktop';
    if (norm === 'monitor' || norm.includes('screen')) return language === 'hi' ? 'मॉनिटर' : language === 'te' ? 'మానిటర్' : 'Monitor';
    if (norm === 'tablet') return language === 'hi' ? 'टैबलेट' : language === 'te' ? 'టాబ్లెట్' : 'Tablet';
    if (norm === 'printer') return language === 'hi' ? 'प्रिंटर' : language === 'te' ? 'ప్రింటర్' : 'Printer';
    if (norm === 'tv' || norm.includes('television')) return language === 'hi' ? 'टेलीविजन (TV)' : language === 'te' ? 'టెలివిజన్ (TV)' : 'Television';
    if (norm === 'microwave') return language === 'hi' ? 'माइक्रोवेव' : language === 'te' ? 'మైక్రోవేవ్' : 'Microwave';
    if (norm === 'refrigerator') return language === 'hi' ? 'फ्रिज / रेफ्रिजरेटर' : language === 'te' ? 'రిఫ్రిజిరేటర్' : 'Refrigerator';
    if (norm === 'washing machine') return language === 'hi' ? 'वाशिंग मशीन' : language === 'te' ? 'వాషింగ్ మెషీన్' : 'Washing Machine';
    if (norm === 'air conditioner') return language === 'hi' ? 'एयर कंडीशनर (AC)' : language === 'te' ? 'ఎయిర్ కండీషనర్ (AC)' : 'Air Conditioner';
    return type;
  };

  // Form Data
  const [deviceDetails, setDeviceDetails] = useState<DeviceDetails>({
    deviceType: "",
    brand: "",
    model: "",
    yearOfPurchase: "",
    condition: "",
    functionalStatus: "",
    accessories: [],
    additionalNotes: "",
  });

  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [valueEstimation, setValueEstimation] = useState<any>(null);
  const [recommendationsData, setRecommendationsData] = useState<any>(null);
  const [disassemblyGuide, setDisassemblyGuide] = useState<any>(null);
  const [isDisassemblyOpen, setIsDisassemblyOpen] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [impactScenario, setImpactScenario] = useState<"recycle" | "refurbish" | "landfill">("recycle");
  const [recommendationRating, setRecommendationRating] = useState<number>(0);
  const [recommendationFeedback, setRecommendationFeedback] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  const [address, setAddress] = useState<Address>({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    addressType: "Home",
  });

  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "dropoff">("pickup");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [selectedCenter, setSelectedCenter] = useState<string>("");
  const [specialInstructions, setSpecialInstructions] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Simulate AI analysis
  // const handleAIAnalysis = () => {
  //   setUploadState("analyzing");
    
  //   setTimeout(() => {
  //     const aiResult = {
  //       deviceType: "Smartphone",
  //       brand: "Generic Brand",
  //       model: "Model X Pro",
  //       condition: "Good",
  //       recyclable: true,
  //       estimatedValue: 150,
  //       materials: [
  //         { name: "Aluminum", percentage: 35, recyclable: true },
  //         { name: "Glass", percentage: 25, recyclable: true },
  //         { name: "Copper", percentage: 15, recyclable: true },
  //         { name: "Plastic", percentage: 20, recyclable: true },
  //         { name: "Lithium", percentage: 5, recyclable: true }
  //       ],
  //       recommendations: [
  //         "Remove SIM card and memory card before recycling",
  //         "Factory reset the device to protect personal data",
  //         "Battery should be handled separately"
  //       ],
  //       nearestCenters: 3,
  //       carbonImpact: "12.5 kg CO₂ saved"
  //     };

  //     setAnalysisResult(aiResult);
  //     setDeviceDetails({
  //       ...deviceDetails,
  //       deviceType: aiResult.deviceType,
  //       brand: aiResult.brand,
  //       model: aiResult.model,
  //       condition: aiResult.condition,
  //     });
  //     setUploadState("complete");
      
  //     toast.success("AI Analysis Complete!", {
  //       description: "Device identified successfully"
  //     });
  //   }, 2500);
  // };
  const handleAIAnalysis = async () => {
  if (!selectedImage) return;

  setUploadState("analyzing");

  try {
    const response = await api.device.uploadDevice({
      image: selectedImage,
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || "AI analysis failed");
    }

    const analysis = response.data;

    const normalizeDeviceType = (detected: string) => {
      if (!detected) return "Smartphone";
      const lower = detected.toLowerCase();
      if (lower.includes("mobile") || lower.includes("phone")) return "Smartphone";
      if (lower.includes("laptop")) return "Laptop";
      if (lower.includes("desktop") || lower.includes("computer")) return "Desktop";
      if (lower.includes("monitor")) return "Monitor";
      if (lower.includes("television") || lower.includes("tv")) return "TV";
      if (lower.includes("printer")) return "Printer";
      if (lower.includes("keyboard")) return "Keyboard";
      if (lower.includes("mouse")) return "Mouse";
      if (lower.includes("microwave")) return "Microwave";
      if (lower.includes("air conditioner")) return "Air Conditioner";
      if (lower.includes("refrigerator")) return "Refrigerator";
      if (lower.includes("washing machine")) return "Washing Machine";
      return detected.charAt(0).toUpperCase() + detected.slice(1);
    };

    const normalizedType = normalizeDeviceType(analysis.deviceType);

    setAnalysisResult({
      ...analysis,
      deviceType: normalizedType
    });

    setDeviceDetails(prev => ({
      ...prev,
      deviceType: normalizedType,
    }));

    setUploadState("complete");

    toast.success("AI Analysis Complete!", {
      description: `Detected: ${normalizedType}`,
    });

  } catch (error: any) {
    setUploadState("idle");
    toast.error("AI Analysis Failed", {
      description: error.message || "Please try again",
    });
  }
};



  // Calculate value estimation via backend & load personalized recommendations
  const calculateValue = async () => {
    try {
      const [valRes, recRes, guideRes] = await Promise.all([
        api.device.estimateValue(deviceDetails),
        api.device.getPersonalizedRecommendations({
          deviceType: deviceDetails.deviceType,
          condition: deviceDetails.condition,
          city: address.city || "Hyderabad",
        }),
        api.education.getDisassemblyGuide(deviceDetails.deviceType || "Smartphone")
      ]);

      if (valRes.success && valRes.data) {
        setValueEstimation({
          estimatedMoneyValue: valRes.data.estimatedMoneyValue,
          pointsValue: valRes.data.pointsValue,
          marketValue: valRes.data.marketValue,
          safetyAssessment: valRes.data.safetyAssessment,
          recyclingImpact: valRes.data.recyclingImpact || {
            co2Saved: "12.5 kg",
            energySaved: "45 kWh",
            waterSaved: "120 L"
          }
        });
      } else {
        setValueEstimation({
          estimatedMoneyValue: 300,
          pointsValue: 450,
          marketValue: 360,
          recyclingImpact: { co2Saved: "12.5 kg", energySaved: "45 kWh", waterSaved: "120 L" }
        });
      }

      if (recRes.success && recRes.data) {
        setRecommendationsData(recRes.data);
      }

      if (guideRes.success && guideRes.data) {
        setDisassemblyGuide(guideRes.data);
      }
    } catch (e) {
      setValueEstimation({
        estimatedMoneyValue: 300,
        pointsValue: 450,
        marketValue: 360,
        recyclingImpact: { co2Saved: "12.5 kg", energySaved: "45 kWh", waterSaved: "120 L" }
      });
    }
  };

  const handleToggleStep = (index: number) => {
    setCompletedSteps(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleSubmitRecommendationFeedback = async () => {
    if (recommendationRating === 0) {
      toast.error("Please select a star rating first.");
      return;
    }
    try {
      await api.center.submitFeedback({
        targetId: deviceDetails.deviceType,
        targetType: "recommendation",
        rating: recommendationRating,
        feedback: recommendationFeedback
      });
      setFeedbackSubmitted(true);
      toast.success("Thank you for your rating! It will help improve future AI recommendations.");
    } catch {
      setFeedbackSubmitted(true);
      toast.success("Feedback submitted!");
    }
  };

  // Handle step navigation
  const handleNext = async () => {
    if (currentStep === "upload" && uploadState === "complete") {
      setCurrentStep("details");
    } else if (currentStep === "details") {
      if (!deviceDetails.deviceType || !deviceDetails.condition || !deviceDetails.functionalStatus) {
        toast.error("Please fill all required fields");
        return;
      }
      await calculateValue();
      setCurrentStep("value");
    } else if (currentStep === "value") {
      setCurrentStep("address");
    } else if (currentStep === "address") {
      if (!address.fullName || !address.phone || !address.addressLine1 || !address.city || !address.state || !address.pincode) {
        toast.error("Please fill all required address fields");
        return;
      }
      setCurrentStep("method");
    } else if (currentStep === "method") {
      if (deliveryMethod === "pickup" && (!preferredDate || !preferredTime)) {
        toast.error("Please select pickup date and time");
        return;
      }
      if (deliveryMethod === "dropoff" && !selectedCenter) {
        toast.error("Please select a collection center");
        return;
      }
      setCurrentStep("confirm");
    }
  };

  const handleBack = () => {
    if (currentStep === "details") setCurrentStep("upload");
    else if (currentStep === "value") setCurrentStep("details");
    else if (currentStep === "address") setCurrentStep("value");
    else if (currentStep === "method") setCurrentStep("address");
    else if (currentStep === "confirm") setCurrentStep("method");
  };

  // Submit final request
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const res = await api.device.submitDeviceRecycling({
        deviceDetails,
        estimatedValue: valueEstimation?.estimatedMoneyValue || 300,
        address,
        deliveryMethod,
        preferredDate,
        preferredTime,
        selectedCenter,
        specialInstructions
      });
      
      if (!res.success) {
        throw new Error(res.error || "Submission failed");
      }

      toast.success("Submission Successful!", {
        description: deliveryMethod === "pickup" 
          ? `Pickup scheduled! Tracking ID: #${res.data?.trackingId || 'EVO-NEW'}`
          : `Device registered! Drop off code: #${res.data?.trackingId || 'EVO-NEW'}`
      });

      // Reset form
      setTimeout(() => {
        resetForm();
      }, 2000);
      
    } catch (error: any) {
      toast.error("Submission Failed", {
        description: error.message || "Please try again later"
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  const resetForm = () => {
    setCurrentStep("upload");
    setUploadState("idle");
    setSelectedImage(null);
    setImagePreview("");
    setDeviceDetails({
      deviceType: "",
      brand: "",
      model: "",
      yearOfPurchase: "",
      condition: "",
      functionalStatus: "",
      accessories: [],
      additionalNotes: "",
    });
    setAnalysisResult(null);
    setValueEstimation(null);
    setAddress({
      fullName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      landmark: "",
      addressType: "Home",
    });
    setDeliveryMethod("pickup");
    setPreferredDate("");
    setPreferredTime("");
    setSelectedCenter("");
    setSpecialInstructions("");
  };

  // Step progress calculation
  const steps = ["upload", "details", "value", "address", "method", "confirm"];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="w-full">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="mb-2">{t("Upload E-Waste") || "Device Recycling Submission"}</h1>
              <p className="text-muted-foreground text-sm md:text-base">
                {t("upload.subtitle") || "Upload images of your electronic waste for instant identification, valuation, and pickup"}
              </p>
            </div>
            <ContextualHelp page="upload" />
          </div>
        </div>

        {/* Progress Bar */}
        <Card className="border-none shadow-md mb-6">
          <CardContent className="p-4 md:p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Step {currentStepIndex + 1} of {steps.length}</span>
                <span className="text-sm">{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className={currentStep === "upload" ? "text-primary font-medium" : ""}>Upload</span>
              <span className={currentStep === "details" ? "text-primary font-medium" : ""}>Details</span>
              <span className={currentStep === "value" ? "text-primary font-medium" : ""}>Value</span>
              <span className={currentStep === "address" ? "text-primary font-medium" : ""}>Address</span>
              <span className={currentStep === "method" ? "text-primary font-medium" : ""}>Method</span>
              <span className={currentStep === "confirm" ? "text-primary font-medium" : ""}>Confirm</span>
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Upload & AI Analysis */}
        {currentStep === "upload" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-md notranslate" translate="no">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl">{t('upload.title', 'Upload Device Image')}</CardTitle>
                <CardDescription className="text-sm">
                  {t('upload.subtitle', 'Take a photo or upload an image for AI-powered identification')}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                {uploadState === "idle" && (
                  <div>
                    {/* Hidden Native File Inputs */}
                    <input
                      type="file"
                      id="file-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <input
                      type="file"
                      id="native-camera-input"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleFileSelect}
                    />

                    {/* Camera Live Viewfinder Dialog */}
                    {isCameraOpen ? (
                      <div className="border-2 border-primary/40 bg-black/90 rounded-2xl p-4 text-center relative overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="relative aspect-[4/3] max-h-[360px] mx-auto bg-black rounded-xl overflow-hidden flex items-center justify-center">
                          {cameraLoading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 text-white">
                              <RefreshCw className="h-8 w-8 animate-spin mb-2 text-primary" />
                              <p className="text-sm font-medium">{language === 'hi' ? "कैमरा लोड हो रहा है..." : language === 'te' ? "కెమెరా లోడ్ అవుతోంది..." : "Starting Camera..."}</p>
                            </div>
                          )}
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                          />
                          
                          {/* Framing Target Box */}
                          <div className="absolute inset-6 border-2 border-white/60 border-dashed rounded-lg pointer-events-none flex items-center justify-center">
                            <span className="text-xs bg-black/60 text-white/90 px-2 py-1 rounded backdrop-blur-sm">
                              {language === 'hi' ? "ई-कचरा डिवाइस को यहां रखें" : language === 'te' ? "ఇ-వ్యర్థ పరికరాన్ని ఇక్కడ అమర్చండి" : "Align e-waste device here"}
                            </span>
                          </div>

                          {/* Top controls */}
                          <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={toggleFacingMode}
                              className="bg-black/60 hover:bg-black/80 text-white border border-white/20 h-8 px-2.5 rounded-full"
                              title="Switch Camera"
                            >
                              <FlipHorizontal className="h-4 w-4 mr-1" />
                              <span className="text-xs">{facingMode === 'environment' ? 'Rear' : 'Front'}</span>
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              onClick={stopCamera}
                              className="h-8 w-8 rounded-full"
                              title="Close Camera"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Capture Shutter Button */}
                        <div className="flex items-center justify-center gap-4 mt-4">
                          <Button
                            type="button"
                            onClick={stopCamera}
                            size="lg"
                            className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600 px-6 rounded-full font-medium shadow-md transition-all"
                          >
                            <X className="h-4 w-4 mr-2 text-zinc-300" />
                            {language === 'hi' ? "रद्द करें (Cancel)" : language === 'te' ? "రద్దు చేయండి (Cancel)" : "Cancel"}
                          </Button>
                          <Button
                            type="button"
                            onClick={capturePhoto}
                            size="lg"
                            className="bg-gradient-to-r from-emerald-500 to-primary text-white hover:opacity-90 font-semibold px-7 shadow-lg shadow-primary/30 rounded-full transition-all"
                          >
                            <Camera className="h-5 w-5 mr-2" />
                            {language === 'hi' ? "फ़ोटो खींचें (Capture)" : language === 'te' ? "ఫోటో తీయండి (Capture)" : "Capture Photo"}
                          </Button>
                        </div>
                      </div>
                    ) : selectedImage ? (
                      /* Image Preview Container */
                      <div className="border-2 border-primary/30 bg-primary/5 rounded-2xl p-6 text-center space-y-4">
                        <div className="relative inline-block max-w-full">
                          <img
                            src={imagePreview}
                            alt="Selected E-Waste"
                            className="max-h-56 mx-auto rounded-xl shadow-md border border-border object-contain bg-background"
                          />
                          <Badge className="absolute top-2 right-2 bg-emerald-600 text-white shadow-sm">
                            <Check className="h-3 w-3 mr-1" /> {language === 'hi' ? "तैयार है" : language === 'te' ? "సిద్ధంగా ఉంది" : "Ready"}
                          </Badge>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-foreground truncate max-w-xs mx-auto">{selectedImage.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{(selectedImage.size / 1024).toFixed(1)} KB • Image Loaded</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => { setSelectedImage(null); setImagePreview(""); }}
                            className="w-full"
                          >
                            <RefreshCw className="h-4 w-4 mr-1.5" />
                            {language === 'hi' ? "दूसरी फ़ोटो चुनें" : language === 'te' ? "మరో ఫోటో ఎంచుకోండి" : "Change Photo"}
                          </Button>
                          <Button
                            type="button"
                            onClick={handleAIAnalysis}
                            className="w-full bg-primary hover:bg-primary/90 text-white shadow-md font-semibold"
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            {language === 'hi' ? "AI विश्लेषण शुरू करें" : language === 'te' ? "AI విశ్లేషణ ప్రారంభించండి" : "Start AI Analysis"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* Dual Options: Upload File OR Open Camera */
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Option 1: Live Camera Button */}
                          <button
                            type="button"
                            onClick={() => startCamera('environment')}
                            className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-primary/50 bg-primary/5 hover:bg-primary/10 hover:border-primary transition-all text-center group cursor-pointer"
                          >
                            <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition-transform">
                              <Camera className="h-7 w-7" />
                            </div>
                            <span className="font-semibold text-foreground text-sm sm:text-base">
                              {language === 'hi' ? "कैमरा खोलें" : language === 'te' ? "కెమెరాను తెరవండి" : "Open Camera"}
                            </span>
                            <span className="text-xs text-muted-foreground mt-1">
                              {language === 'hi' ? "लाइव फ़ोटो खींचें" : language === 'te' ? "లైవ్ ఫోటో తీయండి" : "Click live photo of device"}
                            </span>
                          </button>

                          {/* Option 2: File Browser */}
                          <label
                            htmlFor="file-upload"
                            className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-secondary/50 transition-all text-center cursor-pointer group"
                          >
                            <div className="w-14 h-14 bg-secondary text-foreground rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                              <Upload className="h-7 w-7 text-primary" />
                            </div>
                            <span className="font-semibold text-foreground text-sm sm:text-base">
                              {language === 'hi' ? "फ़ाइल अपलोड करें" : language === 'te' ? "ఫైల్ అప్‌లోడ్ చేయండి" : "Upload Image"}
                            </span>
                            <span className="text-xs text-muted-foreground mt-1">
                              {language === 'hi' ? "गैलरी या डिस्क से चुनें" : language === 'te' ? "గ్యాలరీ నుండి ఎంచుకోండి" : "Browse from device or gallery"}
                            </span>
                          </label>
                        </div>

                        {/* Drag & Drop Secondary Prompt */}
                        <label
                          htmlFor="file-upload"
                          className="border border-border rounded-xl p-4 text-center block hover:bg-secondary/40 transition-colors cursor-pointer text-xs text-muted-foreground"
                        >
                          {language === 'hi' 
                            ? "समर्थित प्रारूप: JPG, PNG, WebP (अधिकतम 10MB)" 
                            : language === 'te' 
                            ? "మద్దతు గల ఫార్మాట్లు: JPG, PNG, WebP (గరిష్టంగా 10MB)" 
                            : "Supported formats: JPG, PNG, WebP (Max 10MB)"}
                        </label>
                      </div>
                    )}
                  </div>
                )}

                {uploadState === "analyzing" && (
                  <div className="border-2 border-primary rounded-lg p-6 md:p-12 text-center bg-primary/5">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 animate-pulse">
                      <Sparkles className="h-8 w-8 md:h-10 md:w-10 text-white" />
                    </div>
                    <h3 className="mb-2 text-base md:text-lg">AI Analysis in Progress...</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Our AI is identifying and analyzing your device
                    </p>
                    <Progress value={65} className="h-2 mb-2" />
                    <p className="text-xs text-muted-foreground">Processing image...</p>
                  </div>
                )}

                {uploadState === "complete" && (
                  <div className="border-2 border-accent rounded-lg p-6 md:p-12 text-center bg-accent/5">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                      <CheckCircle className="h-8 w-8 md:h-10 md:w-10 text-white" />
                    </div>
                    <h3 className="mb-2 text-base md:text-lg">Analysis Complete!</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your device has been successfully identified
                    </p>
                    {imagePreview && (
                      <img src={imagePreview} alt="Device" className="max-h-32 mx-auto rounded-lg mb-4" />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <div>
              <Card className="border-none shadow-md mb-4">
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-lg md:text-xl">Tips for Best Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-4 md:p-6 pt-0">
                  <div className="flex items-start gap-3">
                    <Camera className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-sm md:text-base">Clear Image</div>
                      <div className="text-sm text-muted-foreground">
                        Ensure the device is well-lit and in focus
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-sm md:text-base">Full View</div>
                      <div className="text-sm text-muted-foreground">
                        Capture the entire device in frame
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-sm md:text-base">Multiple Angles</div>
                      <div className="text-sm text-muted-foreground">
                        Upload multiple images for better accuracy
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {analysisResult && (
                <Card className="border-none shadow-md notranslate" translate="no">
                  <CardHeader className="p-4 md:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-lg md:text-xl">{t('upload.aiResults', 'AI Results')}</CardTitle>
                        <CardDescription className="text-sm">{t('upload.quickPreview', 'Quick preview')}</CardDescription>
                      </div>
                      <Badge className="bg-accent text-xs">
                        {analysisResult.confidence 
                          ? `${Math.round(analysisResult.confidence > 1 ? analysisResult.confidence : analysisResult.confidence * 100)}% Match` 
                          : 'Identified'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{t('upload.deviceCategory', 'Device Category:')}</span>
                        <span className="text-sm font-semibold text-primary">{getTranslatedDeviceType(analysisResult.deviceType)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{t('upload.brand', 'Brand:')}</span>
                        <span className="text-sm font-medium">{analysisResult.brand || deviceDetails.brand || t('upload.confirmInStep2', 'Confirm in Step 2')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{t('upload.model', 'Model:')}</span>
                        <span className="text-sm font-medium">{analysisResult.model || deviceDetails.model || t('upload.confirmInStep2', 'Confirm in Step 2')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{t('upload.aiStatus', 'AI Status:')}</span>
                        <span className="text-sm font-medium text-accent">{t('upload.analyzedVerified', 'Analyzed & Verified')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Device Details Form */}
        {currentStep === "details" && (
          <div className="max-w-4xl mx-auto">
            <Card className="border-none shadow-md">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl">{t('upload.deviceDetails', 'Device Details')}</CardTitle>
                <CardDescription className="text-sm">
                  {t('upload.confirmSubtitle', 'Confirm and complete the device information')}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0 space-y-4">
                {deviceDetails.deviceType && (
                  <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm text-primary mb-2 notranslate" translate="no">
                    <div className="flex items-center gap-2 font-medium">
                      <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{t('upload.aiIdentifiedCategory', 'AI Identified Device Category:')} <strong className="underline">{getTranslatedDeviceType(deviceDetails.deviceType)}</strong></span>
                    </div>
                    <Badge variant="secondary" className="bg-primary text-white text-xs">{t('upload.prefilledByAi', 'Pre-filled by AI')}</Badge>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deviceType">Device Type *</Label>
                    <Select value={deviceDetails.deviceType} onValueChange={(val) => setDeviceDetails({...deviceDetails, deviceType: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select device type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Smartphone">Smartphone / Mobile</SelectItem>
                        <SelectItem value="Laptop">Laptop</SelectItem>
                        <SelectItem value="Tablet">Tablet</SelectItem>
                        <SelectItem value="Desktop">Desktop Computer</SelectItem>
                        <SelectItem value="Monitor">Monitor / Screen</SelectItem>
                        <SelectItem value="TV">Television</SelectItem>
                        <SelectItem value="Printer">Printer</SelectItem>
                        <SelectItem value="Keyboard">Keyboard</SelectItem>
                        <SelectItem value="Mouse">Mouse</SelectItem>
                        <SelectItem value="Microwave">Microwave</SelectItem>
                        <SelectItem value="Air Conditioner">Air Conditioner</SelectItem>
                        <SelectItem value="Refrigerator">Refrigerator</SelectItem>
                        <SelectItem value="Washing Machine">Washing Machine</SelectItem>
                        <SelectItem value="Other">Other Electronic Device</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand *</Label>
                    <Input
                      id="brand"
                      value={deviceDetails.brand}
                      onChange={(e) => setDeviceDetails({...deviceDetails, brand: e.target.value})}
                      placeholder="e.g., Apple, Samsung"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">Model *</Label>
                    <Input
                      id="model"
                      value={deviceDetails.model}
                      onChange={(e) => setDeviceDetails({...deviceDetails, model: e.target.value})}
                      placeholder="e.g., iPhone 12, Galaxy S21"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">Year of Purchase</Label>
                    <Select value={deviceDetails.yearOfPurchase} onValueChange={(val) => setDeviceDetails({...deviceDetails, yearOfPurchase: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({length: 15}, (_, i) => new Date().getFullYear() - i).map(year => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Physical Condition *</Label>
                    <Select value={deviceDetails.condition} onValueChange={(val) => setDeviceDetails({...deviceDetails, condition: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Excellent">Excellent - Like new</SelectItem>
                        <SelectItem value="Good">Good - Minor wear</SelectItem>
                        <SelectItem value="Fair">Fair - Visible wear</SelectItem>
                        <SelectItem value="Poor">Poor - Heavy wear</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Functional Status *</Label>
                    <Select value={deviceDetails.functionalStatus} onValueChange={(val) => setDeviceDetails({...deviceDetails, functionalStatus: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Working">Fully Working</SelectItem>
                        <SelectItem value="Partially Working">Partially Working</SelectItem>
                        <SelectItem value="Not Working">Not Working</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={deviceDetails.additionalNotes}
                    onChange={(e) => setDeviceDetails({...deviceDetails, additionalNotes: e.target.value})}
                    placeholder="Any additional information about the device, damages, or accessories..."
                    rows={3}
                  />
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2 text-blue-800 text-sm">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium mb-1">Before submitting:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Remove all personal data and factory reset the device</li>
                        <li>Remove SIM cards, memory cards, and accessories</li>
                        <li>Ensure battery is not swollen or damaged</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Value Estimation & Tailored Recommendations */}
        {currentStep === "value" && valueEstimation && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Value Highlights */}
            <Card className="border-none shadow-md">
              <CardHeader className="p-4 md:p-6 text-center">
                <CardTitle className="text-xl md:text-2xl">Estimated Value & AI Assessment</CardTitle>
                <CardDescription className="text-sm">
                  Transparent valuation and environmental calculation for your {deviceDetails.deviceType}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800 text-center">
                    <IndianRupee className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-700 dark:text-green-400 mb-1">
                      ₹{valueEstimation.estimatedMoneyValue}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-500">Estimated Cash Value</div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
                    <Coins className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-1">
                      {valueEstimation.pointsValue}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-500">Reward Points</div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800 text-center">
                    <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-400 mb-1">
                      ₹{valueEstimation.marketValue}
                    </div>
                    <div className="text-xs text-purple-600 dark:text-purple-500">Estimated Market Value</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature 5: Worker Safety Automation Card */}
            {valueEstimation.safetyAssessment && (
              <Card className="border-none shadow-md border-l-4 border-l-orange-500 bg-orange-500/5">
                <CardHeader className="p-4 md:p-6 pb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      <CardTitle className="text-base md:text-lg">Worker Safety Automation & Hazard Scan</CardTitle>
                    </div>
                    <Badge className={
                      valueEstimation.safetyAssessment.hazardLevel.includes("High")
                        ? "bg-red-600 text-white"
                        : valueEstimation.safetyAssessment.hazardLevel.includes("Medium")
                        ? "bg-orange-500 text-white"
                        : "bg-green-600 text-white"
                    }>
                      {valueEstimation.safetyAssessment.hazardLevel}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Automated pre-collection safety triage to protect handling workers and recycling technicians
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-2 space-y-3">
                  <div className="p-3 bg-background/80 rounded-lg border border-orange-200 dark:border-orange-900 text-xs md:text-sm space-y-1">
                    <div className="font-semibold text-foreground">Safety Protocol:</div>
                    <p className="text-muted-foreground">{valueEstimation.safetyAssessment.handlingProtocol}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs font-semibold text-muted-foreground">Required Worker PPE:</span>
                    {valueEstimation.safetyAssessment.requiredPPE?.map((ppe: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs bg-background">
                        🛡️ {ppe}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Feature 1: Personalized Recommendations */}
            <Card className="border-none shadow-md">
              <CardHeader className="p-4 md:p-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Compass className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base md:text-lg">Personalized Recycling Recommendations</CardTitle>
                  </div>
                  {recommendationsData?.suggestedPath && (
                    <Badge className="bg-primary text-white text-xs">
                      Recommended: {recommendationsData.suggestedPath}
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs">
                  Tailored recycling strategy generated from device category ({deviceDetails.deviceType}), condition ({deviceDetails.condition}), and your city
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0 space-y-4">
                <div className="space-y-2">
                  {(recommendationsData?.recommendations || [
                    `Perform NIST SP 800-88 cryptographic factory reset before handover of your ${deviceDetails.deviceType}.`,
                    "Bundle all matching cables and power bricks to recover copper and earn bonus points.",
                    "Remove SIM cards and SD cards; verify device battery is powered off."
                  ]).map((rec: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg text-xs md:text-sm">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center flex-shrink-0 text-xs">
                        {idx + 1}
                      </span>
                      <span className="text-foreground">{rec}</span>
                    </div>
                  ))}
                </div>

                {/* Safe Disassembly Guide Trigger (Feature 3) */}
                <div className="pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDisassemblyOpen(true)}
                    className="w-full flex items-center justify-center gap-2 border-primary/40 hover:bg-primary/5 text-primary"
                  >
                    <Wrench className="h-4 w-4" />
                    View Safe Disassembly & Preparation Guide for {deviceDetails.deviceType}
                  </Button>
                </div>

                {/* Nearby Specialized Facilities */}
                {recommendationsData?.matchingFacilities && recommendationsData.matchingFacilities.length > 0 && (
                  <div className="pt-2 space-y-2">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Specialized Matching Facilities
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {recommendationsData.matchingFacilities.map((fac: any, idx: number) => (
                        <div key={idx} className="p-3 bg-secondary/40 rounded-lg border border-border/50 text-xs space-y-1">
                          <div className="font-semibold text-foreground flex items-center justify-between">
                            <span>{fac.name}</span>
                            <span className="text-yellow-600 font-bold">⭐ {fac.rating}</span>
                          </div>
                          <div className="text-muted-foreground">{fac.address} • <span className="text-primary font-medium">{fac.distance}</span></div>
                          <div className="text-[11px] text-accent font-medium">Focus: {fac.specialization}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Feature 2: Environmental Impact Assessment Comparative Simulator */}
            <Card className="border-none shadow-md">
              <CardHeader className="p-4 md:p-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-accent" />
                    <CardTitle className="text-base md:text-lg">Environmental Impact Assessment</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs">Comparative Decision Simulator</Badge>
                </div>
                <CardDescription className="text-xs">
                  Compare the planetary impact of your choice vs municipal dumping
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0 space-y-4">
                {/* Choice Selector Tabs */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setImpactScenario("recycle")}
                    className={`p-2.5 rounded-lg text-xs font-semibold text-center transition-all ${
                      impactScenario === "recycle"
                        ? "bg-primary text-white shadow"
                        : "bg-secondary/40 text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    ♻️ Responsible Recycling
                  </button>
                  <button
                    type="button"
                    onClick={() => setImpactScenario("refurbish")}
                    className={`p-2.5 rounded-lg text-xs font-semibold text-center transition-all ${
                      impactScenario === "refurbish"
                        ? "bg-accent text-white shadow"
                        : "bg-secondary/40 text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    🌱 Refurbish & Extend
                  </button>
                  <button
                    type="button"
                    onClick={() => setImpactScenario("landfill")}
                    className={`p-2.5 rounded-lg text-xs font-semibold text-center transition-all ${
                      impactScenario === "landfill"
                        ? "bg-destructive text-white shadow"
                        : "bg-secondary/40 text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    ⚠️ Municipal Landfill
                  </button>
                </div>

                {/* Scenario Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-secondary/30 rounded-lg text-center">
                    <div className="text-xs text-muted-foreground">CO₂ Avoided</div>
                    <div className="text-base md:text-lg font-bold text-primary mt-1">
                      {impactScenario === "recycle" ? valueEstimation.recyclingImpact.co2Saved : (impactScenario === "refurbish" ? "24.0 kg" : "0.0 kg")}
                    </div>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-lg text-center">
                    <div className="text-xs text-muted-foreground">Water Conserved</div>
                    <div className="text-base md:text-lg font-bold text-blue-600 mt-1">
                      {impactScenario === "recycle" ? valueEstimation.recyclingImpact.waterSaved : (impactScenario === "refurbish" ? "250 L" : "0 L")}
                    </div>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-lg text-center">
                    <div className="text-xs text-muted-foreground">Energy Saved</div>
                    <div className="text-base md:text-lg font-bold text-accent mt-1">
                      {impactScenario === "recycle" ? valueEstimation.recyclingImpact.energySaved : (impactScenario === "refurbish" ? "90 kWh" : "0 kWh")}
                    </div>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-lg text-center">
                    <div className="text-xs text-muted-foreground">Circularity Score</div>
                    <div className={`text-base md:text-lg font-bold mt-1 ${impactScenario === "landfill" ? "text-destructive" : "text-green-600"}`}>
                      {impactScenario === "recycle" ? "92%" : (impactScenario === "refurbish" ? "98%" : "0% (Pollution)")}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground italic">
                  {impactScenario === "recycle" && "✅ Responsible recycling recovers rare earth elements, gold, and copper while preventing groundwater heavy metal contamination."}
                  {impactScenario === "refurbish" && "🌟 Refurbishment eliminates new manufacturing emissions entirely by keeping working components in circulation."}
                  {impactScenario === "landfill" && "❌ Discarding in standard trash leaks lead, mercury, and cadmium into local soil and waterways."}
                </p>
              </CardContent>
            </Card>

            {/* Feature 7: Recommendation Feedback & Rating System */}
            <Card className="border-none shadow-md">
              <CardHeader className="p-4 md:p-6 pb-2">
                <CardTitle className="text-base">Rate Recommendation Quality</CardTitle>
                <CardDescription className="text-xs">
                  Help our machine learning algorithms optimize recycling recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-2 space-y-3">
                {feedbackSubmitted ? (
                  <div className="flex items-center gap-2 text-xs md:text-sm text-green-600 font-semibold p-3 bg-green-500/10 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    Thank you! Your feedback has been recorded.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Rate accuracy:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRecommendationRating(star)}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`h-5 w-5 ${
                                star <= recommendationRating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground/40"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Optional feedback on this recommendation..."
                        value={recommendationFeedback}
                        onChange={(e) => setRecommendationFeedback(e.target.value)}
                        className="text-xs h-9 bg-input-background"
                      />
                      <Button
                        size="sm"
                        onClick={handleSubmitRecommendationFeedback}
                        disabled={recommendationRating === 0}
                        className="bg-primary text-xs flex-shrink-0"
                      >
                        Submit
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Device Summary */}
            <Card className="border-none shadow-md">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-lg">Device Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Device:</span>
                    <span className="ml-2 font-medium">{deviceDetails.deviceType}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Brand:</span>
                    <span className="ml-2 font-medium">{deviceDetails.brand}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Model:</span>
                    <span className="ml-2 font-medium">{deviceDetails.model}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Condition:</span>
                    <Badge variant="secondary" className="ml-2">{deviceDetails.condition}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature 3: Safe Disassembly & Preparation Guide Dialog Modal */}
            <Dialog open={isDisassemblyOpen} onOpenChange={setIsDisassemblyOpen}>
              <DialogContent className="sm:max-w-lg p-6 max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                    <Wrench className="h-5 w-5 text-primary" />
                    {disassemblyGuide?.title || `Safe Disassembly & Preparation for ${deviceDetails.deviceType}`}
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    Estimated Time: {disassemblyGuide?.estimatedMinutes || 15} mins • Difficulty: {disassemblyGuide?.difficulty || "Medium"}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                  {/* Hazards Warning */}
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-600 dark:text-red-400 space-y-1">
                    <div className="font-semibold flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4" /> Safety Hazards:
                    </div>
                    <ul className="list-disc list-inside space-y-0.5">
                      {(disassemblyGuide?.hazards || [
                        "Lithium battery puncture hazard",
                        "Sharp metal & glass fragments"
                      ]).map((h: string, idx: number) => (
                        <li key={idx}>{h}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Required Tools */}
                  {disassemblyGuide?.toolsRequired && (
                    <div className="p-3 bg-secondary/40 rounded-lg text-xs space-y-1">
                      <div className="font-semibold text-foreground">Recommended Tools:</div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {disassemblyGuide.toolsRequired.map((t: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs bg-background">
                            🔧 {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step by Step Checklist */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-foreground">Preparation Steps:</div>
                    {(disassemblyGuide?.steps || [
                      "Power down device completely and unplug from power outlets.",
                      "Eject removable SIM/SD cards and battery if accessible.",
                      "Clean surfaces and bundle charging cords.",
                      "Place in protective packing for collection agent."
                    ]).map((step: string, idx: number) => {
                      const isDone = completedSteps.includes(idx);
                      return (
                        <div
                          key={idx}
                          onClick={() => handleToggleStep(idx)}
                          className={`flex items-start gap-3 p-3 rounded-lg text-xs cursor-pointer transition-colors ${
                            isDone ? "bg-green-500/10 border border-green-500/20" : "bg-secondary/30 hover:bg-secondary/50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isDone}
                            onChange={() => {}}
                            className="mt-0.5 rounded text-primary focus:ring-0"
                          />
                          <span className={isDone ? "line-through text-muted-foreground" : "text-foreground font-medium"}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {disassemblyGuide?.safetyTips && (
                    <p className="text-[11px] text-muted-foreground italic border-t pt-2">
                      💡 <strong>Tip:</strong> {disassemblyGuide.safetyTips}
                    </p>
                  )}

                  <Button
                    className="w-full bg-primary text-xs mt-2"
                    onClick={() => setIsDisassemblyOpen(false)}
                  >
                    Done & Return to Submission
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Step 4: Address Entry */}
        {currentStep === "address" && (
          <div className="max-w-4xl mx-auto">
            <Card className="border-none shadow-md">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl">Pickup Address</CardTitle>
                <CardDescription className="text-sm">
                  Enter the address where we should collect the device
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={address.fullName}
                      onChange={(e) => setAddress({...address, fullName: e.target.value})}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={address.phone}
                      onChange={(e) => setAddress({...address, phone: e.target.value})}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine1">Address Line 1 *</Label>
                  <Input
                    id="addressLine1"
                    value={address.addressLine1}
                    onChange={(e) => setAddress({...address, addressLine1: e.target.value})}
                    placeholder="House No., Building Name, Street"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    value={address.addressLine2}
                    onChange={(e) => setAddress({...address, addressLine2: e.target.value})}
                    placeholder="Area, Locality"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={address.city}
                      onChange={(e) => setAddress({...address, city: e.target.value})}
                      placeholder="Enter city"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Select value={address.state} onValueChange={(val) => setAddress({...address, state: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Andhra Pradesh">Andhra Pradesh</SelectItem>
                        <SelectItem value="Telangana">Telangana</SelectItem>
                        <SelectItem value="Karnataka">Karnataka</SelectItem>
                        <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                        <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                        <SelectItem value="Delhi">Delhi</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      value={address.pincode}
                      onChange={(e) => setAddress({...address, pincode: e.target.value})}
                      placeholder="500001"
                      maxLength={6}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="landmark">Landmark (Optional)</Label>
                  <Input
                    id="landmark"
                    value={address.landmark}
                    onChange={(e) => setAddress({...address, landmark: e.target.value})}
                    placeholder="Near bus stop, park, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Address Type</Label>
                  <RadioGroup value={address.addressType} onValueChange={(val) => setAddress({...address, addressType: val})}>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Home" id="home" />
                        <Label htmlFor="home" className="cursor-pointer flex items-center gap-2">
                          <Home className="h-4 w-4" />
                          Home
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Office" id="office" />
                        <Label htmlFor="office" className="cursor-pointer flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Office
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Other" id="other" />
                        <Label htmlFor="other" className="cursor-pointer">
                          Other
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 5: Delivery Method Selection */}
        {currentStep === "method" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl">Select Delivery Method</CardTitle>
                <CardDescription className="text-sm">
                  Choose how you want to deliver your device
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    onClick={() => setDeliveryMethod("pickup")}
                    className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                      deliveryMethod === "pickup"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        deliveryMethod === "pickup" ? "bg-primary" : "bg-secondary"
                      }`}>
                        <Package className={`h-6 w-6 ${
                          deliveryMethod === "pickup" ? "text-white" : "text-muted-foreground"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">Schedule Pickup</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          We'll collect the device from your doorstep
                        </p>
                        <div className="flex items-center gap-2 text-xs text-accent">
                          <CheckCircle className="h-3 w-3" />
                          <span>Free pickup service</span>
                        </div>
                      </div>
                      <div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          deliveryMethod === "pickup" ? "border-primary" : "border-border"
                        }`}>
                          {deliveryMethod === "pickup" && (
                            <div className="w-3 h-3 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setDeliveryMethod("dropoff")}
                    className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                      deliveryMethod === "dropoff"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        deliveryMethod === "dropoff" ? "bg-primary" : "bg-secondary"
                      }`}>
                        <MapPin className={`h-6 w-6 ${
                          deliveryMethod === "dropoff" ? "text-white" : "text-muted-foreground"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">Drop-off at Center</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Visit nearest collection center
                        </p>
                        <div className="flex items-center gap-2 text-xs text-accent">
                          <CheckCircle className="h-3 w-3" />
                          <span>Instant processing</span>
                        </div>
                      </div>
                      <div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          deliveryMethod === "dropoff" ? "border-primary" : "border-border"
                        }`}>
                          {deliveryMethod === "dropoff" && (
                            <div className="w-3 h-3 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pickup Details */}
            {deliveryMethod === "pickup" && (
              <Card className="border-none shadow-md">
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-lg">Schedule Pickup</CardTitle>
                  <CardDescription className="text-sm">
                    Select your preferred date and time slot
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pickupDate">Preferred Date *</Label>
                      <Input
                        id="pickupDate"
                        type="date"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Preferred Time Slot *</Label>
                      <Select value={preferredTime} onValueChange={setPreferredTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time slot" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Morning (9AM-12PM)">Morning (9AM-12PM)</SelectItem>
                          <SelectItem value="Afternoon (12PM-3PM)">Afternoon (12PM-3PM)</SelectItem>
                          <SelectItem value="Evening (3PM-6PM)">Evening (3PM-6PM)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                    <Textarea
                      id="instructions"
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="Any specific instructions for the pickup agent..."
                      rows={3}
                    />
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2 text-blue-800 text-sm">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium mb-1">Pickup Guidelines:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>Please ensure someone is available at the selected time</li>
                          <li>Keep the device ready for pickup (powered off and packed if possible)</li>
                          <li>Our agent will verify the device condition</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Drop-off Details */}
            {deliveryMethod === "dropoff" && (
              <Card className="border-none shadow-md">
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-lg">Select Collection Center</CardTitle>
                  <CardDescription className="text-sm">
                    Choose a nearby center to drop off your device
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0 space-y-4">
                  <div className="space-y-3">
                    {[
                      { id: "1", name: "Green Recycle Hub - Hyderabad", distance: "2.3 km", rating: 4.8, address: "Banjara Hills, Hyderabad" },
                      { id: "2", name: "EcoTech Collection Center", distance: "3.7 km", rating: 4.6, address: "Jubilee Hills, Hyderabad" },
                      { id: "3", name: "Tech Waste Solutions", distance: "5.1 km", rating: 4.9, address: "Gachibowli, Hyderabad" },
                    ].map((center) => (
                      <div
                        key={center.id}
                        onClick={() => setSelectedCenter(center.id)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedCenter === center.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{center.name}</h4>
                              <Badge variant="secondary" className="text-xs">{center.distance}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{center.address}</p>
                            <div className="flex items-center gap-1 text-xs text-yellow-600">
                              <span>⭐</span>
                              <span>{center.rating}</span>
                            </div>
                          </div>
                          <div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedCenter === center.id ? "border-primary" : "border-border"
                            }`}>
                              {selectedCenter === center.id && (
                                <div className="w-3 h-3 rounded-full bg-primary" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full">
                    <MapPin className="h-4 w-4 mr-2" />
                    View All Centers on Map
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Step 6: Confirmation */}
        {currentStep === "confirm" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader className="p-4 md:p-6 text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl md:text-2xl">Review Your Submission</CardTitle>
                <CardDescription className="text-sm">
                  Please verify all details before confirming
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0 space-y-6">
                {/* Device Details */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Device Details
                  </h3>
                  <div className="bg-secondary/30 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Device Type:</span>
                      <span className="font-medium">{deviceDetails.deviceType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Brand & Model:</span>
                      <span className="font-medium">{deviceDetails.brand} {deviceDetails.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Condition:</span>
                      <Badge variant="secondary">{deviceDetails.condition}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium">{deviceDetails.functionalStatus}</span>
                    </div>
                  </div>
                </div>

                {/* Value Estimation */}
                {valueEstimation && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <IndianRupee className="h-5 w-5 text-primary" />
                      Estimated Value
                    </h3>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-green-700">Cash Value:</span>
                        <span className="text-xl font-bold text-green-700">₹{valueEstimation.estimatedMoneyValue}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-700">Reward Points:</span>
                        <span className="text-lg font-semibold text-green-700">{valueEstimation.pointsValue} pts</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Address */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    {deliveryMethod === "pickup" ? "Pickup Address" : "Your Details"}
                  </h3>
                  <div className="bg-secondary/30 rounded-lg p-4 space-y-2 text-sm">
                    <div><span className="font-medium">{address.fullName}</span></div>
                    <div className="text-muted-foreground">{address.phone}</div>
                    <div className="text-muted-foreground">
                      {address.addressLine1}, {address.addressLine2 && `${address.addressLine2}, `}
                      {address.city}, {address.state} - {address.pincode}
                    </div>
                    {address.landmark && (
                      <div className="text-muted-foreground text-xs">Landmark: {address.landmark}</div>
                    )}
                  </div>
                </div>

                {/* Delivery Method */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    {deliveryMethod === "pickup" ? <Calendar className="h-5 w-5 text-primary" /> : <MapPin className="h-5 w-5 text-primary" />}
                    Delivery Method
                  </h3>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    {deliveryMethod === "pickup" ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-700">Scheduled Pickup</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Date:</span>
                          <span className="font-medium text-blue-700">{new Date(preferredDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Time:</span>
                          <span className="font-medium text-blue-700">{preferredTime}</span>
                        </div>
                        {specialInstructions && (
                          <div className="pt-2 border-t border-blue-200">
                            <span className="text-blue-700 text-xs">Instructions: {specialInstructions}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-700">Drop-off at Collection Center</span>
                        </div>
                        <div className="text-blue-700">
                          Please visit the selected center during operating hours (9 AM - 6 PM)
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Terms & Conditions */}
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2 text-yellow-800 text-sm">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium mb-2">Important Notes:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Final value will be determined after physical inspection</li>
                        <li>Ensure all personal data is removed from the device</li>
                        <li>Device should be in the condition as described</li>
                        <li>You will receive payment/points within 5-7 business days after inspection</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="flex-1 bg-primary hover:bg-primary/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm Submission
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Buttons (for steps other than confirm) */}
        {currentStep !== "upload" && currentStep !== "confirm" && (
          <div className="max-w-4xl mx-auto mt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Continue
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Upload step next button */}
        {currentStep === "upload" && uploadState === "complete" && (
          <div className="max-w-4xl mx-auto mt-6">
            <Button
              onClick={handleNext}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Continue to Device Details
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
