import { useState, useRef, useEffect } from "react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const analyzeMutation = trpc.symptoms.analyzeSymptoms.useMutation();
  const updateHistoryMutation = trpc.patient.updateMedicalHistory.useMutation();

  // Pre-fill form with voice transcription if available and trigger auto-analysis
  useEffect(() => {
    const transcribedText = sessionStorage.getItem("transcribedText");
    if (transcribedText) {
      sessionStorage.removeItem("transcribedText");
    }
  }, []);

  // Timer for analysis
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Camera functions - use native file input with camera capture
  const startCamera = () => {
    // Trigger native camera input
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const preview = event.target?.result as string;
        setSymptomPhotos([...symptomPhotos, { file, preview }]);
        console.log("Photo captured:", file.name);
      };
      reader.readAsDataURL(file);
      // Reset input so same file can be selected again
      e.target.value = "";
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const preview = event.target?.result as string;
          setSymptomPhotos((prev) => [...prev, { file, preview }]);
        };
        reader.readAsDataURL(file);
      });
    }
    // Reset input
    e.target.value = "";
  };

  const removePhoto = (index: number) => {
    setSymptomPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Add symptom
  const addSymptom = () => {
    if (currentSymptom.name.trim()) {
      setSymptoms([...symptoms, currentSymptom]);
      setCurrentSymptom({ name: "", duration: "", severity: 5 });
    }
  };

  // Remove symptom
  const removeSymptom = (index: number) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  // Add allergy
  const addAllergy = () => {
    if (newAllergy.trim()) {
      setMedicalHistory({
        ...medicalHistory,
        allergies: [...(medicalHistory.allergies || []), newAllergy],
      });
      setNewAllergy("");
    }
  };

  // Remove allergy
  const removeAllergy = (index: number) => {
    setMedicalHistory({
      ...medicalHistory,
      allergies: medicalHistory.allergies?.filter((_, i) => i !== index) || [],
    });
  };

  // Add chronic condition
  const addCondition = () => {
    if (newCondition.trim()) {
      setMedicalHistory({
        ...medicalHistory,
        chronicConditions: [...(medicalHistory.chronicConditions || []), newCondition],
      });
      setNewCondition("");
    }
  };

  // Remove chronic condition
  const removeCondition = (index: number) => {
    setMedicalHistory({
      ...medicalHistory,
      chronicConditions: medicalHistory.chronicConditions?.filter((_, i) => i !== index) || [],
    });
  };

  // Add surgical history
  const addSurgery = () => {
    if (newSurgery.trim()) {
      setMedicalHistory({
        ...medicalHistory,
        surgicalHistory: [...(medicalHistory.surgicalHistory || []), newSurgery],
      });
      setNewSurgery("");
    }
  };

  // Remove surgical history
  const removeSurgery = (index: number) => {
    setMedicalHistory({
      ...medicalHistory,
      surgicalHistory: medicalHistory.surgicalHistory?.filter((_, i) => i !== index) || [],
    });
  };

  // Add medication
  const addMedication = () => {
    if (currentMedication.name.trim()) {
      setMedicalHistory({
        ...medicalHistory,
        currentMedications: [...(medicalHistory.currentMedications || []), currentMedication],
      });
      setCurrentMedication({ name: "", dosage: "", frequency: "" });
    }
  };

  // Remove medication
  const removeMedication = (index: number) => {
    setMedicalHistory({
      ...medicalHistory,
      currentMedications: medicalHistory.currentMedications?.filter((_, i) => i !== index) || [],
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (symptoms.length === 0) {
      alert("Please add at least one symptom");
      return;
    }

    setIsAnalyzing(true);
    setElapsedSeconds(0);

    try {
      const result = await analyzeMutation.mutateAsync({
        symptoms,
        symptomDuration: "varies",
        medicalHistory,
        language,
        patientName: patientName || "Anonymous",
        vitalSigns,
      });

      // Store result in sessionStorage for the results page
      sessionStorage.setItem(`analysis_${result.interactionId}`, JSON.stringify(result));

      // Navigate to results page
      setLocation(`/results/${result.interactionId}`);
    } catch (error) {
      console.error("Analysis error:", error);
      alert("Failed to analyze symptoms. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Render different steps
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">Patient Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Patient Name (Optional)</label>
              <Input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Enter patient name"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="pt">Portuguese</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Symptoms</label>
              <div className="space-y-3">
                <div>
                  <Input
                    type="text"
                    value={currentSymptom.name}
                    onChange={(e) => setCurrentSymptom({ ...currentSymptom, name: e.target.value })}
                    placeholder="e.g., Headache, Fever, Cough"
                    className="bg-slate-800 border-slate-700 text-white mb-2"
                  />
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <Input
                      type="text"
                      value={currentSymptom.duration}
                      onChange={(e) => setCurrentSymptom({ ...currentSymptom, duration: e.target.value })}
                      placeholder="e.g., 2 days, 1 week"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                    <div>
                      <label className="text-xs text-gray-400">Severity: {currentSymptom.severity}/10</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={currentSymptom.severity}
                        onChange={(e) => setCurrentSymptom({ ...currentSymptom, severity: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <Button onClick={addSymptom} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white">
                    Add Symptom
                  </Button>
                </div>

                {symptoms.length > 0 && (
                  <div className="bg-slate-800/50 rounded-lg p-3 space-y-2">
                    {symptoms.map((symptom, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-700/50 p-2 rounded">
                        <span className="text-gray-300">
                          {symptom.name} ({symptom.duration}, severity {symptom.severity}/10)
                        </span>
                        <Button
                          onClick={() => removeSymptom(idx)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={symptoms.length === 0}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              Next: Medical History
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">Past Medical History</h2>

            {/* Allergies */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Allergies</label>
              <div className="flex gap-2 mb-2">
                <Input
                  type="text"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  placeholder="e.g., Penicillin, Peanuts"
                  className="bg-slate-800 border-slate-700 text-white"
                />
                <Button onClick={addAllergy} className="bg-cyan-500 hover:bg-cyan-600">
                  Add
                </Button>
              </div>
              {medicalHistory.allergies && medicalHistory.allergies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {medicalHistory.allergies.map((allergy, idx) => (
                    <div key={idx} className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full flex items-center gap-2">
                      {allergy}
                      <button onClick={() => removeAllergy(idx)} className="text-orange-400 hover:text-orange-300">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chronic Conditions */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Chronic Conditions</label>
              <div className="flex gap-2 mb-2">
                <Input
                  type="text"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  placeholder="e.g., Diabetes, Hypertension"
                  className="bg-slate-800 border-slate-700 text-white"
                />
                <Button onClick={addCondition} className="bg-cyan-500 hover:bg-cyan-600">
                  Add
                </Button>
              </div>
              {medicalHistory.chronicConditions && medicalHistory.chronicConditions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {medicalHistory.chronicConditions.map((condition, idx) => (
                    <div key={idx} className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full flex items-center gap-2">
                      {condition}
                      <button onClick={() => removeCondition(idx)} className="text-blue-400 hover:text-blue-300">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Surgical History */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Surgical History</label>
              <div className="flex gap-2 mb-2">
                <Input
                  type="text"
                  value={newSurgery}
                  onChange={(e) => setNewSurgery(e.target.value)}
                  placeholder="e.g., Appendectomy, Knee surgery"
                  className="bg-slate-800 border-slate-700 text-white"
                />
                <Button onClick={addSurgery} className="bg-cyan-500 hover:bg-cyan-600">
                  Add
                </Button>
              </div>
              {medicalHistory.surgicalHistory && medicalHistory.surgicalHistory.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {medicalHistory.surgicalHistory.map((surgery, idx) => (
                    <div key={idx} className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full flex items-center gap-2">
                      {surgery}
                      <button onClick={() => removeSurgery(idx)} className="text-purple-400 hover:text-purple-300">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Family History */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Family History (Optional)</label>
              <Textarea
                value={medicalHistory.familyHistory || ""}
                onChange={(e) => setMedicalHistory({ ...medicalHistory, familyHistory: e.target.value })}
                placeholder="e.g., Father had heart disease, mother has diabetes"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            {/* Current Medications */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Current Medications</label>
              <div className="space-y-2 mb-2">
                <Input
                  type="text"
                  value={currentMedication.name}
                  onChange={(e) => setCurrentMedication({ ...currentMedication, name: e.target.value })}
                  placeholder="Medication name"
                  className="bg-slate-800 border-slate-700 text-white"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="text"
                    value={currentMedication.dosage}
                    onChange={(e) => setCurrentMedication({ ...currentMedication, dosage: e.target.value })}
                    placeholder="Dosage"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                  <Input
                    type="text"
                    value={currentMedication.frequency}
                    onChange={(e) => setCurrentMedication({ ...currentMedication, frequency: e.target.value })}
                    placeholder="Frequency"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <Button onClick={addMedication} className="w-full bg-cyan-500 hover:bg-cyan-600">
                  Add Medication
                </Button>
              </div>
              {medicalHistory.currentMedications && medicalHistory.currentMedications.length > 0 && (
                <div className="bg-slate-800/50 rounded-lg p-3 space-y-2">
                  {medicalHistory.currentMedications.map((med, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-700/50 p-2 rounded">
                      <span className="text-gray-300">
                        {med.name} - {med.dosage} ({med.frequency})
                      </span>
                      <Button
                        onClick={() => removeMedication(idx)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                Back
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white">
                Next: Vital Signs
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">Vital Signs & Symptom Photos</h2>

            {/* Vital Signs */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-cyan-500/30">
              <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Vital Signs (Optional)
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Temperature</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={vitalSigns.temperature}
                      onChange={(e) => setVitalSigns({ ...vitalSigns, temperature: e.target.value })}
                      placeholder="e.g., 37.5"
                      step="0.1"
                      className="bg-slate-800 border-slate-700 text-white flex-1"
                    />
                    <Select defaultValue="celsius">
                      <SelectTrigger className="w-24 bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="celsius">°C</SelectItem>
                        <SelectItem value="fahrenheit">°F</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Normal: 36.5-37.5°C (97.7-99.5°F)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Blood Pressure</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Input
                        type="number"
                        value={vitalSigns.systolic}
                        onChange={(e) => setVitalSigns({ ...vitalSigns, systolic: e.target.value })}
                        placeholder="Systolic"
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                      <p className="text-xs text-gray-400 mt-1">Systolic (top)</p>
                    </div>
                    <div>
                      <Input
                        type="number"
                        value={vitalSigns.diastolic}
                        onChange={(e) => setVitalSigns({ ...vitalSigns, diastolic: e.target.value })}
                        placeholder="Diastolic"
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                      <p className="text-xs text-gray-400 mt-1">Diastolic (bottom)</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Normal: 120/80 mmHg</p>
                </div>
              </div>
            </div>

            {/* Symptom Photos */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-cyan-500/30">
              <label className="text-lg font-semibold text-cyan-300 mb-3 flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Symptom Photos (Optional)
              </label>
              <p className="text-sm text-gray-400 mb-3">Upload or capture photos of your symptoms to help with diagnosis</p>

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
                  variant="outline"
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Photo
                </Button>
              </div>

              {/* Photo Gallery */}
              {symptomPhotos.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {symptomPhotos.map((photo, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={photo.preview}
                        alt={`Symptom ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-cyan-500/30"
                      />
                      <button
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Hidden file inputs */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCameraCapture}
                className="hidden"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isAnalyzing || symptoms.length === 0}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing... ({elapsedSeconds}s)
                  </>
                ) : (
                  "Analyze Symptoms"
                )}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isAnalyzing) {
    return <AnalysisLoading elapsedSeconds={elapsedSeconds} isLoading={true} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-orange-900 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Symptom Assessment</h1>
          <p className="text-cyan-300">Step {step} of 3</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 bg-slate-800/50 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-orange-500 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>

        {/* Form */}
        <Card className="bg-slate-900/50 border-cyan-500/30 backdrop-blur p-6">
          {renderStep()}
        </Card>
      </div>
    </div>
  );
}
