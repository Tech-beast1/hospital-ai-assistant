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
      sessionStorage.removeItem("voiceTranscription");
      
      // Set the extracted patient name
      if (extractedPatientName) {
        setPatientName(extractedPatientName);
        sessionStorage.removeItem("patientName");
      }
      
      // Trigger auto-analysis immediately
      setTimeout(() => {
        triggerAutoAnalysis(symptomData);
      }, 100);
    }
  }, []);
  
  // Auto-analysis function triggered by voice recording
  const triggerAutoAnalysis = async (symptomData: Array<{ name: string; duration: string; severity: number }>) => {
    try {
      setIsAnalyzing(true);
      setElapsedSeconds(0);
      const controller = new AbortController();
      setAbortController(controller);

      // Update medical history first
      await updateHistoryMutation.mutateAsync(medicalHistory);

      // Then analyze symptoms
      const result = await analyzeMutation.mutateAsync({
        symptoms: symptomData,
        symptomDuration: "as described",
        medicalHistory,
        language,
        patientName: patientName || "Patient",
        vitalSigns,
      });

      // Store the analysis data
      sessionStorage.setItem(
        `analysis_${result.interactionId}`,
        JSON.stringify({
          interactionId: result.interactionId,
          analysis: result.analysis,
          disclaimers: result.disclaimers,
        })
      );

      setIsAnalyzing(false);
      setLocation(`/results/${result.interactionId}`);
    } catch (error) {
      console.error("Auto-analysis error:", error);
      setIsAnalyzing(false);
    }
  }

  const handleAddSymptom = () => {
    if (currentSymptom.name.trim()) {
      setSymptoms([...symptoms, currentSymptom]);
      setCurrentSymptom({ name: "", duration: "", severity: 5 });
    }
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

  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      setMedicalHistory({
        ...medicalHistory,
        allergies: [...medicalHistory.allergies, newAllergy],
      });
      setNewAllergy("");
    }
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
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera. Please check permissions.");
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

    try {
      setIsAnalyzing(true);
      setElapsedSeconds(0);
      const controller = new AbortController();
      setAbortController(controller);

      // Update medical history first
      await updateHistoryMutation.mutateAsync(medicalHistory);

      // Then analyze symptoms
      const result = await analyzeMutation.mutateAsync({
        symptoms,
        symptomDuration: "as described",
        medicalHistory,
        language,
        patientName,
        vitalSigns,
      });

      // Store the analysis data in sessionStorage so the results page can access it
      sessionStorage.setItem(
        `analysis_${result.interactionId}`,
        JSON.stringify({
          interactionId: result.interactionId,
          analysis: result.analysis,
          disclaimers: result.disclaimers,
        })
      );

      setIsAnalyzing(false);
      // Navigate to results with the interaction ID
      setLocation(`/results/${result.interactionId}`);
    } catch (error) {
      console.error("Error submitting intake form:", error);
      setIsAnalyzing(false);
      if (error instanceof Error && error.name !== "AbortError") {
        alert("Error processing your information. Please try again.");
      }
    }
  };

  // Show loading screen during analysis
  if (isAnalyzing) {
    return (
      <AnalysisLoading
        isLoading={isAnalyzing}
        onCancel={handleCancel}
        elapsedSeconds={elapsedSeconds}
      />
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dramatic cinematic background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-950 via-slate-900 to-orange-950 opacity-90"></div>
        <div className="absolute inset-0 backdrop-blur-3xl"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
              Hospital AI Assistant
            </h1>
            <p className="text-xl text-cyan-200">
              Professional Medical Symptom Assessment
            </p>
          </div>

          {/* Medical Disclaimer */}
          <Card className="mb-8 border-orange-500/50 bg-slate-900/80 backdrop-blur">
            <div className="p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-300 mb-2">Medical Disclaimer</h3>
                <p className="text-sm text-gray-300">
                  This AI assistant provides informational support only and is NOT a substitute for professional medical advice. Always consult with a licensed healthcare provider for diagnosis and treatment. In medical emergencies, call 112/193 immediately.
                </p>
              </div>
            </div>
          </Card>

          {/* Step 0: Patient Name */}
          {step === 1 && (
            <Card className="border-teal-500/30 bg-slate-900/80 backdrop-blur p-6 mb-6">
              <h2 className="text-2xl font-bold text-white mb-6">Patient Information</h2>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-teal-300 font-semibold mb-2">
                    Full Name *
                  </label>
                  <Input
                    placeholder="Enter your full name"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="bg-slate-800/50 border-teal-500/30 text-white placeholder-gray-500"
                    required
                  />
                </div>
              </div>
              <div className="border-t border-teal-500/20 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Your Symptoms</h3>
              </div>
            </Card>
          )}

          {/* Step 1: Symptoms */}
          {step === 1 && (
            <Card className="border-cyan-500/30 bg-slate-900/80 backdrop-blur p-6 mb-6">
              <h2 className="text-2xl font-bold text-white mb-6">Step 1: Describe Your Symptoms</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-cyan-300 font-semibold mb-2">
                    Symptom Name
                  </label>
                  <Input
                    placeholder="e.g., Headache, Fever, Cough"
                    value={currentSymptom.name}
                    onChange={(e) =>
                      setCurrentSymptom({ ...currentSymptom, name: e.target.value })
                    }
                    className="bg-slate-800 border-cyan-500/30 text-white placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-cyan-300 font-semibold mb-2">
                    Duration
                  </label>
                  <Input
                    placeholder="e.g., 3 days, 1 week"
                    value={currentSymptom.duration}
                    onChange={(e) =>
                      setCurrentSymptom({ ...currentSymptom, duration: e.target.value })
                    }
                    className="bg-slate-800 border-cyan-500/30 text-white placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-cyan-300 font-semibold mb-2">
                    Severity (1-10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={currentSymptom.severity}
                    onChange={(e) =>
                      setCurrentSymptom({
                        ...currentSymptom,
                        severity: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                  <div className="text-center text-cyan-300 font-semibold mt-2">
                    {currentSymptom.severity}/10
                  </div>
                </div>

                <Button
                  onClick={handleAddSymptom}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
                >
                  Add Symptom
                </Button>
              </div>

              {symptoms.length > 0 && (
                <div className="bg-slate-800/50 p-4 rounded-lg mb-6">
                  <h3 className="text-cyan-300 font-semibold mb-3">Added Symptoms:</h3>
                  <div className="space-y-2">
                    {symptoms.map((sym, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-slate-700/50 p-3 rounded"
                      >
                        <div className="flex-1">
                          <p className="text-white font-semibold">{sym.name}</p>
                          <p className="text-sm text-gray-400">
                            Duration: {sym.duration} | Severity: {sym.severity}/10
                          </p>
                        </div>
                        <Button
                          onClick={() =>
                            setSymptoms(symptoms.filter((_, i) => i !== idx))
                          }
                          variant="destructive"
                          size="sm"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={() => setStep(2)}
                disabled={symptoms.length === 0 || !patientName.trim()}
                className="w-full bg-gradient-to-r from-cyan-500 to-orange-500 hover:from-cyan-600 hover:to-orange-600 text-white"
              >
                Next: Past Medical History
              </Button>
            </Card>
          )}

          {/* Step 2: Past Medical History */}
          {step === 2 && (
            <Card className="border-cyan-500/30 bg-slate-900/80 backdrop-blur p-6 mb-6">
              <h2 className="text-2xl font-bold text-white mb-6">Step 2: Past Medical History</h2>

              {/* Allergies */}
              <div className="mb-6">
                <label className="block text-cyan-300 font-semibold mb-2">
                  Allergies
                </label>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="e.g., Penicillin, Peanuts"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    className="bg-slate-800 border-cyan-500/30 text-white placeholder-gray-500"
                  />
                  <Button
                    onClick={handleAddAllergy}
                    className="bg-cyan-500 hover:bg-cyan-600"
                  >
                    Add
                  </Button>
                </div>
                {medicalHistory.allergies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {medicalHistory.allergies.map((allergy, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-700/50 px-3 py-1 rounded-full text-sm text-cyan-300 flex items-center gap-2"
                      >
                        {allergy}
                        <button
                          onClick={() =>
                            setMedicalHistory({
                              ...medicalHistory,
                              allergies: medicalHistory.allergies.filter(
                                (_, i) => i !== idx
                              ),
                            })
                          }
                          className="text-red-400 hover:text-red-300"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Chronic Conditions */}
              <div className="mb-6">
                <label className="block text-cyan-300 font-semibold mb-2">
                  Chronic Conditions
                </label>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="e.g., Diabetes, Hypertension"
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    className="bg-slate-800 border-cyan-500/30 text-white placeholder-gray-500"
                  />
                  <Button
                    onClick={handleAddCondition}
                    className="bg-cyan-500 hover:bg-cyan-600"
                  >
                    Add
                  </Button>
                </div>
                {medicalHistory.chronicConditions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {medicalHistory.chronicConditions.map((condition, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-700/50 px-3 py-1 rounded-full text-sm text-cyan-300 flex items-center gap-2"
                      >
                        {condition}
                        <button
                          onClick={() =>
                            setMedicalHistory({
                              ...medicalHistory,
                              chronicConditions:
                                medicalHistory.chronicConditions.filter(
                                  (_, i) => i !== idx
                                ),
                            })
                          }
                          className="text-red-400 hover:text-red-300"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Surgical History */}
              <div className="mb-6">
                <label className="block text-cyan-300 font-semibold mb-2">
                  Surgical History
                </label>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="e.g., Appendectomy, Knee surgery"
                    value={newSurgery}
                    onChange={(e) => setNewSurgery(e.target.value)}
                    className="bg-slate-800 border-cyan-500/30 text-white placeholder-gray-500"
                  />
                  <Button
                    onClick={handleAddSurgery}
                    className="bg-cyan-500 hover:bg-cyan-600"
                  >
                    Add
                  </Button>
                </div>
                {medicalHistory.surgicalHistory.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {medicalHistory.surgicalHistory.map((surgery, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-700/50 px-3 py-1 rounded-full text-sm text-cyan-300 flex items-center gap-2"
                      >
                        {surgery}
                        <button
                          onClick={() =>
                            setMedicalHistory({
                              ...medicalHistory,
                              surgicalHistory:
                                medicalHistory.surgicalHistory.filter(
                                  (_, i) => i !== idx
                                ),
                            })
                          }
                          className="text-red-400 hover:text-red-300"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Current Medications */}
              <div className="mb-6">
                <label className="block text-cyan-300 font-semibold mb-2">
                  Current Medications
                </label>
                <div className="space-y-3">
                  <Input
                    placeholder="Medication name"
                    value={currentMedication.name}
                    onChange={(e) =>
                      setCurrentMedication({
                        ...currentMedication,
                        name: e.target.value,
                      })
                    }
                    className="bg-slate-800 border-cyan-500/30 text-white placeholder-gray-500"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Dosage (e.g., 500mg)"
                      value={currentMedication.dosage}
                      onChange={(e) =>
                        setCurrentMedication({
                          ...currentMedication,
                          dosage: e.target.value,
                        })
                      }
                      className="bg-slate-800 border-cyan-500/30 text-white placeholder-gray-500"
                    />
                    <Input
                      placeholder="Frequency (e.g., 2x daily)"
                      value={currentMedication.frequency}
                      onChange={(e) =>
                        setCurrentMedication({
                          ...currentMedication,
                          frequency: e.target.value,
                        })
                      }
                      className="bg-slate-800 border-cyan-500/30 text-white placeholder-gray-500"
                    />
                  </div>
                  <Button
                    onClick={handleAddMedication}
                    className="w-full bg-cyan-500 hover:bg-cyan-600"
                  >
                    Add Medication
                  </Button>
                </div>
                {medicalHistory.currentMedications.length > 0 && (
                  <div className="space-y-2">
                    {medicalHistory.currentMedications.map((med, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-700/50 p-3 rounded flex items-center justify-between"
                      >
                        <div className="text-white">
                          <p className="font-semibold">{med.name}</p>
                          <p className="text-sm text-gray-400">
                            {med.dosage} - {med.frequency}
                          </p>
                        </div>
                        <Button
                          onClick={() =>
                            setMedicalHistory({
                              ...medicalHistory,
                              currentMedications:
                                medicalHistory.currentMedications.filter(
                                  (_, i) => i !== idx
                                ),
                            })
                          }
                          variant="destructive"
                          size="sm"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Family History */}
              <div className="mb-6">
                <label className="block text-cyan-300 font-semibold mb-2">
                  Family History (Optional)
                </label>
                <Textarea
                  placeholder="Any relevant family medical history..."
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
                      className="w-full h-80 rounded-lg mb-3 bg-black object-cover"
                      style={{ transform: "scaleX(-1)" }}
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
                    <SelectItem value="zh">中文</SelectItem>
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
                  disabled={analyzeMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-orange-500 hover:from-cyan-600 hover:to-orange-600 text-white"
                >
                  {analyzeMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Submit & Analyze"
                  )}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
