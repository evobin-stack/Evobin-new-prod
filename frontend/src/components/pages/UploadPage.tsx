import { Upload, Camera, CheckCircle, AlertCircle, Sparkles, MapPin, Calendar, Home, Building, Package, IndianRupee, Coins, TrendingUp, ChevronRight, ChevronLeft } from "lucide-react";
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
import { ContextualHelp } from "../ContextualHelp";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../services/api";

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
  const [currentStep, setCurrentStep] = useState<Step>("upload");
  const [uploadState, setUploadState] = useState<"idle" | "analyzing" | "complete">("idle");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

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



  // Calculate value estimation via backend
  const calculateValue = async () => {
    try {
      const res = await api.device.estimateValue(deviceDetails);
      if (res.success && res.data) {
        setValueEstimation({
          estimatedMoneyValue: res.data.estimatedMoneyValue,
          pointsValue: res.data.pointsValue,
          marketValue: res.data.marketValue,
          recyclingImpact: {
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
    } catch (e) {
      setValueEstimation({
        estimatedMoneyValue: 300,
        pointsValue: 450,
        marketValue: 360,
        recyclingImpact: { co2Saved: "12.5 kg", energySaved: "45 kWh", waterSaved: "120 L" }
      });
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
              <h1 className="mb-2">Device Recycling Submission</h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Upload device, get value estimation, and schedule pickup or drop-off
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
            <Card className="border-none shadow-md">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl">Upload Device Image</CardTitle>
                <CardDescription className="text-sm">
                  Upload a clear image for AI-powered identification
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                {uploadState === "idle" && (
                  <div>
                    <input
                      type="file"
                      id="file-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <label
                      htmlFor="file-upload"
                      className="border-2 border-dashed border-border rounded-lg p-6 md:p-12 text-center hover:border-primary transition-colors cursor-pointer block"
                    >
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                        <Upload className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                      </div>
                      <h3 className="mb-2 text-base md:text-lg">Drop your image here</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        or click to browse from your device
                      </p>
                      {selectedImage && (
                        <div className="mb-4">
                          <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                          <p className="text-sm text-muted-foreground mt-2">{selectedImage.name}</p>
                        </div>
                      )}
                    </label>
                    {selectedImage && (
                      <Button onClick={handleAIAnalysis} className="w-full mt-4 bg-primary hover:bg-primary/90">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Start AI Analysis
                      </Button>
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
                <Card className="border-none shadow-md">
                  <CardHeader className="p-4 md:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-lg md:text-xl">AI Results</CardTitle>
                        <CardDescription className="text-sm">Quick preview</CardDescription>
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
                        <span className="text-sm text-muted-foreground">Device Category:</span>
                        <span className="text-sm font-semibold text-primary">{analysisResult.deviceType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Brand:</span>
                        <span className="text-sm font-medium">{analysisResult.brand || deviceDetails.brand || "Confirm in Step 2"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Model:</span>
                        <span className="text-sm font-medium">{analysisResult.model || deviceDetails.model || "Confirm in Step 2"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">AI Status:</span>
                        <span className="text-sm font-medium text-accent">Analyzed & Verified</span>
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
                <CardTitle className="text-lg md:text-xl">Device Details</CardTitle>
                <CardDescription className="text-sm">
                  Confirm and complete the device information
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0 space-y-4">
                {deviceDetails.deviceType && (
                  <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm text-primary mb-2">
                    <div className="flex items-center gap-2 font-medium">
                      <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>AI Identified Device Category: <strong className="underline">{deviceDetails.deviceType}</strong></span>
                    </div>
                    <Badge variant="secondary" className="bg-primary text-white text-xs">Pre-filled by AI</Badge>
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

        {/* Step 3: Value Estimation */}
        {currentStep === "value" && valueEstimation && (
          <div className="max-w-4xl mx-auto">
            <Card className="border-none shadow-md mb-6">
              <CardHeader className="p-4 md:p-6 text-center">
                <CardTitle className="text-xl md:text-2xl">Estimated Value</CardTitle>
                <CardDescription className="text-sm">
                  Based on your device details and current market rates
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200 text-center">
                    <IndianRupee className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-700 mb-1">
                      ₹{valueEstimation.estimatedMoneyValue}
                    </div>
                    <div className="text-xs text-green-600">Estimated Cash Value</div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200 text-center">
                    <Coins className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-700 mb-1">
                      {valueEstimation.pointsValue}
                    </div>
                    <div className="text-xs text-blue-600">Reward Points</div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200 text-center">
                    <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-700 mb-1">
                      ₹{valueEstimation.marketValue}
                    </div>
                    <div className="text-xs text-purple-600">Market Value</div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="font-semibold mb-4">Environmental Impact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-accent/10 rounded-lg">
                      <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                        <span className="text-white">🌱</span>
                      </div>
                      <div>
                        <div className="font-medium">{valueEstimation.recyclingImpact.co2Saved}</div>
                        <div className="text-xs text-muted-foreground">CO₂ Saved</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-accent/10 rounded-lg">
                      <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                        <span className="text-white">⚡</span>
                      </div>
                      <div>
                        <div className="font-medium">{valueEstimation.recyclingImpact.energySaved}</div>
                        <div className="text-xs text-muted-foreground">Energy Saved</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-accent/10 rounded-lg">
                      <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                        <span className="text-white">💧</span>
                      </div>
                      <div>
                        <div className="font-medium">{valueEstimation.recyclingImpact.waterSaved}</div>
                        <div className="text-xs text-muted-foreground">Water Saved</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2 text-yellow-800 text-sm">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>
                      <span className="font-medium">Note:</span> Final value will be determined after physical inspection.
                      Prices may vary based on actual device condition.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

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
