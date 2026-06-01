import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle, CheckCircle2, Thermometer, Heart, Camera, Upload, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Streamdown } from "streamdown";
import { AnalysisLoading } from "./AnalysisLoading";

export default function PatientIntake() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [patientName, setPatientName] = useState("");
  const [language, setLanguage] = useState("en");
  const [symptoms, setSymptoms] = useState<Array<{ name: string; duration: string; severity: number }>>([]);
  const [currentSymptom, setCurrentSymptom] = useState({ name: "", duration: "", severity: 5 });
  const [medicalHistory, setMedicalHistory] = useState({
    allergies: [] as string[],
    chronicConditions: [] as string[],
    surgicalHistory: [] as string[],
    familyHistory: "",
    currentMedications: [] as Array<{ name: string; dosage: string; frequency: string }>,
  });
  const [currentMedication, setCurrentMedication] = useState({ name: "", dosage: "", frequency: "" });
  const [newAllergy, setNewAllergy] = useState("");
  const [newCondition, setNewCondition] = useState("");
  const [newSurgery, setNewSurgery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [vitalSigns, setVitalSigns] = useState({
    temperature: "",
    systolic: "",
    diastolic: "",
  });
  const [symptomPhotos, setSymptomPhotos] = useState<Array<{ file: File; preview: string }>>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeMutation = trpc.symptoms.analyzeSymptoms.useMutation();
  const updateHistoryMutation = trpc.patient.updateMedicalHistory.useMutation();

  // Pre-fill form with voice transcription if available and trigger auto-analysis
  useEffect(() => {
    const voiceTranscription = sessionStorage.getItem("voiceTranscription");
    const extractedPatientName = sessionStorage.getItem("patientName");
    
    if (voiceTranscription) {
      const symptomData = [{ name: voiceTranscription, duration: "today", severity: 5 }];
      setSymptoms(symptomData);
      setStep(2);
      sessionStorage.removeItem("voiceTranscription");
    }

    if (extractedPatientName) {
      setPatientName(extractedPatientName);
      sessionStorage.removeItem("patientName");
    }
  }, []);

  const handleAddSymptom = () => {
    if (currentSymptom.name.trim()) {
      setSymptoms([...symptoms, currentSymptom]);
      setCurrentSymptom({ name: "", duration: "", severity: 5 });
    }
  };

  const handleRemoveSymptom = (index: number) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  const handleAddMedication = () => {
    if (currentMedication.name.trim()) {
      setMedicalHistory({
        ...medicalHistory,
        currentMedications: [...medicalHistory.currentMedications, currentMedication],
      });
      setCurrentMedication({ name: "", dosage: "", frequency: "" });
    }
  };

  const handleRemoveMedication = (index: number) => {
    setMedicalHistory({
      ...medicalHistory,
      currentMedications: medicalHistory.currentMedications.filter((_, i) => i !== index),
    });
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      setMedicalHistory({
        ...medicalHistory,
        allergies: [...medicalHistory.allergies, newAllergy],
      });
      setNewAllergy("");
    }
  };

  const handleRemoveAllergy = (index: number) => {
    setMedicalHistory({
      ...medicalHistory,
      allergies: medicalHistory.allergies.filter((_, i) => i !== index),
    });
  };

  const handleAddCondition = () => {
    if (newCondition.trim()) {
      setMedicalHistory({
        ...medicalHistory,
        chronicConditions: [...medicalHistory.chronicConditions, newCondition],
      });
      setNewCondition("");
    }
  };

  const handleRemoveCondition = (index: number) => {
    setMedicalHistory({
      ...medicalHistory,
      chronicConditions: medicalHistory.chronicConditions.filter((_, i) => i !== index),
    });
  };

  const handleAddSurgery = () => {
    if (newSurgery.trim()) {
      setMedicalHistory({
        ...medicalHistory,
        surgicalHistory: [...medicalHistory.surgicalHistory, newSurgery],
      });
      setNewSurgery("");
    }
  };

  // Timer for elapsed seconds
  useEffect(() => {
    if (!isAnalyzing) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Camera functions
  const startCamera = async () => {
    try {
      console.log("Starting camera...");
      const constraints = {
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("Stream obtained:", stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        console.log("Camera active set to true");
        
        // Ensure video plays
        videoRef.current.play().catch(e => {
          console.error("Play error:", e);
        });
      } else {
        console.error("videoRef.current is null");
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      alert(`Unable to access camera: ${errorMsg}. Please check permissions.`);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.scale(-1, 1);
        context.drawImage(videoRef.current, -canvasRef.current.width, 0);
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `symptom-${Date.now()}.jpg`, { type: "image/jpeg" });
            const preview = canvasRef.current!.toDataURL("image/jpeg");
            setSymptomPhotos([...symptomPhotos, { file, preview }]);
            stopCamera();
          }
        }, "image/jpeg", 0.9);
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      setCameraActive(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const preview = event.target?.result as string;
            setSymptomPhotos([...symptomPhotos, { file, preview }]);
          };
          reader.readAsDataURL(file);
        }
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (index: number) => {
    setSymptomPhotos(symptomPhotos.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    if (abortController) {
      abortController.abort();
    }
    setIsAnalyzing(false);
    setElapsedSeconds(0);
    setAbortController(null);
  };

  const handleSubmit = async () => {
    if (symptoms.length === 0) {
      alert("Please add at least one symptom");
      return;
    }

    setIsAnalyzing(true);
    setElapsedSeconds(0);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const response = await analyzeMutation.mutateAsync({
        symptoms,
        symptomDuration: "recent",
        medicalHistory: {
          allergies: medicalHistory.allergies,
          chronicConditions: medicalHistory.chronicConditions,
          surgicalHistory: medicalHistory.surgicalHistory,
          familyHistory: medicalHistory.familyHistory,
          currentMedications: medicalHistory.currentMedications,
        },
        language,
        patientName,
        vitalSigns: {
          temperature: vitalSigns.temperature || undefined,
          systolic: vitalSigns.systolic || undefined,
          diastolic: vitalSigns.diastolic || undefined,
        },
      });

      if (patientName) {
        await updateHistoryMutation.mutateAsync({
          allergies: medicalHistory.allergies,
          chronicConditions: medicalHistory.chronicConditions,
          surgicalHistory: medicalHistory.surgicalHistory,
          familyHistory: medicalHistory.familyHistory,
          currentMedications: medicalHistory.currentMedications,
        });
      }

      sessionStorage.setItem("analysisResult", JSON.stringify(response));
      setLocation("/symptom-results");
    } catch (error) {
      console.error("Error analyzing symptoms:", error);
      if (error instanceof Error && error.message !== "The operation was aborted") {
        alert("Error analyzing symptoms. Please try again.");
      }
    } finally {
      setIsAnalyzing(false);
      setAbortController(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Patient Assessment</h1>
          <p className="text-gray-400">Step {step} of 3</p>
        </div>

        {/* Step 1: Symptoms */}
        {step === 1 && (
          <Card className="border-cyan-500/30 bg-slate-900/80 backdrop-blur p-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-6">Step 1: Symptoms</h2>

            {/* Patient Name */}
            <div className="mb-6">
              <label className="block text-cyan-300 font-semibold mb-2">Patient Name (Optional)</label>
              <Input
                type="text"
                placeholder="Enter patient name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="bg-slate-800 border-cyan-500/30 text-white placeholder-gray-500"
              />
            </div>

            {/* Add Symptom */}
            <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-cyan-500/20">
              <h3 className="text-cyan-300 font-semibold mb-4">Add a Symptom</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Symptom Name</label>
                  <Input
                    type="text"
                    placeholder="e.g., Headache, Cough, Fever"
                    value={currentSymptom.name}
                    onChange={(e) => setCurrentSymptom({ ...currentSymptom, name: e.target.value })}
                    className="bg-slate-700 border-cyan-500/30 text-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Duration</label>
                  <Input
                    type="text"
                    placeholder="e.g., 2 days, 1 week"
                    value={currentSymptom.duration}
                    onChange={(e) => setCurrentSymptom({ ...currentSymptom, duration: e.target.value })}
                    className="bg-slate-700 border-cyan-500/30 text-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Severity (1-10)</label>
                  <Input
                    type="range"
                    min="1"
                    max="10"
                    value={currentSymptom.severity}
                    onChange={(e) => setCurrentSymptom({ ...currentSymptom, severity: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="text-center text-cyan-300 font-semibold mt-2">{currentSymptom.severity}/10</div>
                </div>
                <Button
                  onClick={handleAddSymptom}
                  className="w-full bg-gradient-to-r from-cyan-500 to-orange-500 hover:from-cyan-600 hover:to-orange-600 text-white"
                >
                  Add Symptom
                </Button>
              </div>
            </div>

            {/* Symptoms List */}
            {symptoms.length > 0 && (
              <div className="mb-6">
                <h3 className="text-cyan-300 font-semibold mb-3">Your Symptoms</h3>
                <div className="space-y-2">
                  {symptoms.map((symptom, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-cyan-500/20">
                      <div>
                        <p className="text-white font-medium">{symptom.name}</p>
                        <p className="text-sm text-gray-400">Duration: {symptom.duration} | Severity: {symptom.severity}/10</p>
                      </div>
                      <Button
                        onClick={() => handleRemoveSymptom(idx)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:bg-red-500/10"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={() => setStep(2)}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-orange-500 hover:from-cyan-600 hover:to-orange-600 text-white"
                disabled={symptoms.length === 0}
              >
                Next: Medical History
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Medical History */}
        {step === 2 && (
          <Card className="border-cyan-500/30 bg-slate-900/80 backdrop-blur p-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-6">Step 2: Past Medical History</h2>
            <p className="text-gray-300 mb-6">Please provide your medical history for more accurate analysis. (Optional)</p>

            {/* Allergies */}
            <div className="mb-6">
              <label className="block text-cyan-300 font-semibold mb-2">Allergies</label>
              <div className="flex gap-2 mb-3">
                <Input
                  type="text"
                  placeholder="e.g., Penicillin"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  className="bg-slate-800 border-cyan-500/30 text-white placeholder-gray-500 flex-1"
                />
                <Button onClick={handleAddAllergy} className="bg-cyan-500 hover:bg-cyan-600 text-white">
                  Add
                </Button>
              </div>
              {medicalHistory.allergies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {medicalHistory.allergies.map((allergy, idx) => (
                    <div key={idx} className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full flex items-center gap-2">
                      {allergy}
                      <button onClick={() => handleRemoveAllergy(idx)} className="text-cyan-400 hover:text-cyan-200">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chronic Conditions */}
            <div className="mb-6">
              <label className="block text-cyan-300 font-semibold mb-2">Chronic Conditions</label>
              <div className="flex gap-2 mb-3">
                <Input
                  type="text"
                  placeholder="e.g., Diabetes, Hypertension"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  className="bg-slate-800 border-cyan-500/30 text-white placeholder-gray-500 flex-1"
                />
                <Button onClick={handleAddCondition} className="bg-cyan-500 hover:bg-cyan-600 text-white">
                  Add
                </Button>
              </div>
              {medicalHistory.chronicConditions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {medicalHistory.chronicConditions.map((condition, idx) => (
                    <div key={idx} className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full flex items-center gap-2">
                      {condition}
                      <button onClick={() => handleRemoveCondition(idx)} className="text-cyan-400 hover:text-cyan-200">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Surgical History */}
            <div className="mb-6">
              <label className="block text-cyan-300 font-semibold mb-2">Surgical History</label>
              <div className="flex gap-2 mb-3">
                <Input
                  type="text"
                  placeholder="e.g., Appendectomy"
                  value={newSurgery}
                  onChange={(e) => setNewSurgery(e.target.value)}
                  className="bg-slate-800 border-cyan-500/30 text-white placeholder-gray-500 flex-1"
                />
                <Button onClick={handleAddSurgery} className="bg-cyan-500 hover:bg-cyan-600 text-white">
                  Add
                </Button>
              </div>
              {medicalHistory.surgicalHistory.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {medicalHistory.surgicalHistory.map((surgery, idx) => (
                    <div key={idx} className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full flex items-center gap-2">
                      {surgery}
                      <button onClick={() => handleRemoveAllergy(idx)} className="text-cyan-400 hover:text-cyan-200">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Family History */}
            <div className="mb-6">
              <label className="block text-cyan-300 font-semibold mb-2">Family History</label>
              <Textarea
                placeholder="e.g., Father had heart disease, Mother has diabetes"
                value={medicalHistory.familyHistory}
                onChange={(e) =>
                  setMedicalHistory({
                    ...medicalHistory,
                    familyHistory: e.target.value,
                  })
                }
                className="bg-slate-800 border-cyan-500/30 text-white placeholder-gray-500 min-h-24"
              />
            </div>

            {/* Current Medications */}
            <div className="mb-6">
              <label className="block text-cyan-300 font-semibold mb-2">Current Medications</label>
              <div className="space-y-3 mb-3">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Medication name"
                    value={currentMedication.name}
                    onChange={(e) => setCurrentMedication({ ...currentMedication, name: e.target.value })}
                    className="bg-slate-800 border-cyan-500/30 text-white placeholder-gray-500 flex-1"
                  />
                  <Input
                    type="text"
                    placeholder="Dosage"
                    value={currentMedication.dosage}
                    onChange={(e) => setCurrentMedication({ ...currentMedication, dosage: e.target.value })}
                    className="bg-slate-800 border-cyan-500/30 text-white placeholder-gray-500 flex-1"
                  />
                  <Input
                    type="text"
                    placeholder="Frequency"
                    value={currentMedication.frequency}
                    onChange={(e) => setCurrentMedication({ ...currentMedication, frequency: e.target.value })}
                    className="bg-slate-800 border-cyan-500/30 text-white placeholder-gray-500 flex-1"
                  />
                </div>
                <Button onClick={handleAddMedication} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white">
                  Add Medication
                </Button>
              </div>
              {medicalHistory.currentMedications.length > 0 && (
                <div className="space-y-2">
                  {medicalHistory.currentMedications.map((med, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-cyan-500/20">
                      <div>
                        <p className="text-white font-medium">{med.name}</p>
                        <p className="text-sm text-gray-400">{med.dosage} - {med.frequency}</p>
                      </div>
                      <Button
                        onClick={() => handleRemoveMedication(idx)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:bg-red-500/10"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="flex-1 border-cyan-500 text-cyan-300 hover:bg-cyan-500/10"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-orange-500 hover:from-cyan-600 hover:to-orange-600 text-white"
              >
                Next: Vital Signs
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Vital Signs */}
        {step === 3 && (
          <Card className="border-cyan-500/30 bg-slate-900/80 backdrop-blur p-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Thermometer className="h-6 w-6 text-orange-400" />
              <Heart className="h-6 w-6 text-red-400" />
              Step 3: Vital Signs
            </h2>
            <p className="text-gray-300 mb-6">Please provide your current vital signs for more accurate analysis. (Optional)</p>

            {/* Temperature */}
            <div className="mb-6">
              <label className="block text-cyan-300 font-semibold mb-2">
                Temperature (°C or °F)
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="e.g., 37.5 or 98.6"
                  value={vitalSigns.temperature}
                  onChange={(e) =>
                    setVitalSigns({ ...vitalSigns, temperature: e.target.value })
                  }
                  className="bg-slate-800 border-cyan-500/30 text-white placeholder-gray-500 flex-1"
                  step="0.1"
                />
                <span className="text-gray-400 flex items-center px-3 bg-slate-800 border border-cyan-500/30 rounded">°</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Normal: 36.5-37.5°C (97.7-99.5°F)</p>
            </div>

            {/* Blood Pressure */}
            <div className="mb-6">
              <label className="block text-cyan-300 font-semibold mb-2">
                Blood Pressure (Systolic/Diastolic)
              </label>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  placeholder="Systolic (e.g., 120)"
                  value={vitalSigns.systolic}
                  onChange={(e) =>
                    setVitalSigns({ ...vitalSigns, systolic: e.target.value })
                  }
                  className="bg-slate-800 border-cyan-500/30 text-white placeholder-gray-500 flex-1"
                />
                <span className="text-cyan-300 font-semibold">/</span>
                <Input
                  type="number"
                  placeholder="Diastolic (e.g., 80)"
                  value={vitalSigns.diastolic}
                  onChange={(e) =>
                    setVitalSigns({ ...vitalSigns, diastolic: e.target.value })
                  }
                  className="bg-slate-800 border-cyan-500/30 text-white placeholder-gray-500 flex-1"
                />
                <span className="text-gray-400 flex items-center px-3 bg-slate-800 border border-cyan-500/30 rounded">mmHg</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Normal: 120/80 mmHg</p>
            </div>

            {/* Optional note */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-6">
              <p className="text-sm text-blue-200">
                💡 Tip: If you don't have access to a thermometer or blood pressure monitor, you can skip these fields and continue with the analysis.
              </p>
            </div>

            {/* Symptom Photos */}
            <div className="mb-6">
              <label className="block text-cyan-300 font-semibold mb-2">
                <Camera className="h-4 w-4 inline mr-2" />
                Symptom Photos (Optional)
              </label>
              <p className="text-sm text-gray-400 mb-3">Upload or capture photos of your symptoms to help with diagnosis</p>
              
              {/* Camera Preview */}
              {cameraActive && (
                <div className="mb-4 bg-slate-800 rounded-lg p-4">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: "100%",
                      height: "400px",
                      backgroundColor: "#000",
                      borderRadius: "0.5rem",
                      marginBottom: "0.75rem",
                      transform: "scaleX(-1)",
                      objectFit: "cover",
                      display: "block"
                    }}
                  />
                  <canvas ref={canvasRef} style={{ display: "none" }} />
                  <div className="flex gap-2">
                    <Button
                      onClick={capturePhoto}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                    >
                      Capture Photo
                    </Button>
                    <Button
                      onClick={stopCamera}
                      variant="outline"
                      className="flex-1 border-red-500 text-red-400 hover:bg-red-500/10"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Upload/Camera Buttons */}
              {!cameraActive && (
                <div className="flex gap-2 mb-4">
                  <Button
                    onClick={startCamera}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white flex items-center justify-center gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    Take Photo
                  </Button>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white flex items-center justify-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Photo
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              )}

              {/* Photo Gallery */}
              {symptomPhotos.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {symptomPhotos.map((photo, idx) => (
                    <div key={idx} className="relative bg-slate-800 rounded-lg overflow-hidden">
                      <img
                        src={photo.preview}
                        alt={`Symptom ${idx + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      <button
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 rounded-full p-1"
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Language Selection */}
            <div className="mb-6">
              <label className="block text-cyan-300 font-semibold mb-2">
                Preferred Language
              </label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="bg-slate-800 border-cyan-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-cyan-500/30">
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="it">Italiano</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="hi">हिन्दी</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setStep(2)}
                variant="outline"
                className="flex-1 border-cyan-500 text-cyan-300 hover:bg-cyan-500/10"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isAnalyzing || symptoms.length === 0}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-orange-500 hover:from-cyan-600 hover:to-orange-600 text-white disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing ({elapsedSeconds}s)
                  </>
                ) : (
                  "Submit & Analyze"
                )}
              </Button>
              {isAnalyzing && (
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="border-red-500 text-red-400 hover:bg-red-500/10"
                >
                  Cancel
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Loading State */}
        {isAnalyzing && <AnalysisLoading isLoading={isAnalyzing} />}
      </div>
    </div>
  );
}
