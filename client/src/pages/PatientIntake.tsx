import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Streamdown } from "streamdown";

export default function PatientIntake() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
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

  const analyzeMutation = trpc.symptoms.analyzeSymptoms.useMutation();
  const updateHistoryMutation = trpc.patient.updateMedicalHistory.useMutation();

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

  const handleSubmit = async () => {
    if (symptoms.length === 0) {
      alert("Please add at least one symptom");
      return;
    }

    try {
      // Update medical history first
      await updateHistoryMutation.mutateAsync(medicalHistory);

      // Then analyze symptoms
      const result = await analyzeMutation.mutateAsync({
        symptoms,
        symptomDuration: "as described",
        medicalHistory,
        language,
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

      // Navigate to results with the interaction ID
      setLocation(`/results/${result.interactionId}`);
    } catch (error) {
      console.error("Error submitting intake form:", error);
      alert("Error processing your information. Please try again.");
    }
  };

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
                  This AI assistant provides informational support only and is NOT a substitute for professional medical advice. Always consult with a licensed healthcare provider for diagnosis and treatment. In medical emergencies, call 911 immediately.
                </p>
              </div>
            </div>
          </Card>

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
                disabled={symptoms.length === 0}
                className="w-full bg-gradient-to-r from-cyan-500 to-orange-500 hover:from-cyan-600 hover:to-orange-600 text-white"
              >
                Next: Medical History
              </Button>
            </Card>
          )}

          {/* Step 2: Medical History */}
          {step === 2 && (
            <Card className="border-cyan-500/30 bg-slate-900/80 backdrop-blur p-6 mb-6">
              <h2 className="text-2xl font-bold text-white mb-6">Step 2: Medical History</h2>

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
                        className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
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
                          className="hover:text-red-200"
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
                        className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
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
                          className="hover:text-yellow-200"
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
                <div className="space-y-2 mb-3">
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
                  onClick={() => setStep(1)}
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
