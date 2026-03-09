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

      // Navigate to results
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
            <div className="p-6">
              <div className="flex gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-orange-300 mb-2">Medical Disclaimer</h3>
                  <p className="text-sm text-gray-300">
                    This AI assistant provides clinical decision support only and is <strong>NOT a substitute for professional medical advice</strong>. 
                    All recommendations must be reviewed and approved by a licensed healthcare provider. In case of emergency, please call 911 or visit your nearest emergency room immediately.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Main Form Card */}
          <Card className="border-cyan-500/30 bg-slate-900/90 backdrop-blur-xl shadow-2xl">
            <div className="p-8">
              {/* Step Indicator */}
              <div className="flex justify-between mb-8">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                        step >= s
                          ? "bg-cyan-500 text-white"
                          : "bg-slate-700 text-gray-400"
                      }`}
                    >
                      {s}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {s === 1 ? "Symptoms" : s === 2 ? "History" : "Review"}
                    </p>
                  </div>
                ))}
              </div>

              {/* Step 1: Symptoms */}
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">Describe Your Symptoms</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-cyan-200 mb-2">
                        Symptom Name
                      </label>
                      <Input
                        placeholder="e.g., Chest pain, Fever, Headache"
                        value={currentSymptom.name}
                        onChange={(e) =>
                          setCurrentSymptom({ ...currentSymptom, name: e.target.value })
                        }
                        className="bg-slate-800 border-cyan-500/30 text-white placeholder-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-cyan-200 mb-2">
                        Duration
                      </label>
                      <Input
                        placeholder="e.g., 2 days, 1 week"
                        value={currentSymptom.duration}
                        onChange={(e) =>
                          setCurrentSymptom({ ...currentSymptom, duration: e.target.value })
                        }
                        className="bg-slate-800 border-cyan-500/30 text-white placeholder-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-cyan-200 mb-2">
                        Severity (1-10): {currentSymptom.severity}
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
                        className="w-full accent-cyan-500"
                      />
                    </div>

                    <Button
                      onClick={handleAddSymptom}
                      className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                    >
                      Add Symptom
                    </Button>
                  </div>

                  {/* Added Symptoms List */}
                  {symptoms.length > 0 && (
                    <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-cyan-500/20">
                      <h3 className="font-semibold text-cyan-200 mb-3">Added Symptoms:</h3>
                      {symptoms.map((sym, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center py-2 text-sm text-gray-300 border-b border-slate-700 last:border-b-0"
                        >
                          <span>
                            {sym.name} ({sym.severity}/10) - {sym.duration}
                          </span>
                          <button
                            onClick={() => setSymptoms(symptoms.filter((_, i) => i !== idx))}
                            className="text-orange-400 hover:text-orange-300"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-4 pt-6">
                    <Button
                      onClick={() => setStep(2)}
                      disabled={symptoms.length === 0}
                      className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                    >
                      Next: Medical History
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Medical History */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">Medical History</h2>

                  {/* Allergies */}
                  <div>
                    <label className="block text-sm font-medium text-cyan-200 mb-2">
                      Allergies
                    </label>
                    <div className="flex gap-2 mb-3">
                      <Input
                        placeholder="Add an allergy"
                        value={newAllergy}
                        onChange={(e) => setNewAllergy(e.target.value)}
                        className="bg-slate-800 border-cyan-500/30 text-white"
                      />
                      <Button
                        onClick={handleAddAllergy}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        Add
                      </Button>
                    </div>
                    {medicalHistory.allergies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {medicalHistory.allergies.map((allergy, idx) => (
                          <span
                            key={idx}
                            className="bg-orange-500/20 text-orange-200 px-3 py-1 rounded-full text-sm flex items-center gap-2"
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
                              className="hover:text-orange-100"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Chronic Conditions */}
                  <div>
                    <label className="block text-sm font-medium text-cyan-200 mb-2">
                      Chronic Conditions
                    </label>
                    <div className="flex gap-2 mb-3">
                      <Input
                        placeholder="e.g., Diabetes, Hypertension"
                        value={newCondition}
                        onChange={(e) => setNewCondition(e.target.value)}
                        className="bg-slate-800 border-cyan-500/30 text-white"
                      />
                      <Button
                        onClick={handleAddCondition}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        Add
                      </Button>
                    </div>
                    {medicalHistory.chronicConditions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {medicalHistory.chronicConditions.map((condition, idx) => (
                          <span
                            key={idx}
                            className="bg-cyan-500/20 text-cyan-200 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                          >
                            {condition}
                            <button
                              onClick={() =>
                                setMedicalHistory({
                                  ...medicalHistory,
                                  chronicConditions: medicalHistory.chronicConditions.filter(
                                    (_, i) => i !== idx
                                  ),
                                })
                              }
                              className="hover:text-cyan-100"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Current Medications */}
                  <div>
                    <label className="block text-sm font-medium text-cyan-200 mb-2">
                      Current Medications
                    </label>
                    <div className="space-y-2 mb-3">
                      <Input
                        placeholder="Medication name"
                        value={currentMedication.name}
                        onChange={(e) =>
                          setCurrentMedication({ ...currentMedication, name: e.target.value })
                        }
                        className="bg-slate-800 border-cyan-500/30 text-white"
                      />
                      <div className="flex gap-2">
                        <Input
                          placeholder="Dosage (e.g., 500mg)"
                          value={currentMedication.dosage}
                          onChange={(e) =>
                            setCurrentMedication({
                              ...currentMedication,
                              dosage: e.target.value,
                            })
                          }
                          className="bg-slate-800 border-cyan-500/30 text-white flex-1"
                        />
                        <Input
                          placeholder="Frequency (e.g., twice daily)"
                          value={currentMedication.frequency}
                          onChange={(e) =>
                            setCurrentMedication({
                              ...currentMedication,
                              frequency: e.target.value,
                            })
                          }
                          className="bg-slate-800 border-cyan-500/30 text-white flex-1"
                        />
                      </div>
                      <Button
                        onClick={handleAddMedication}
                        className="w-full bg-orange-600 hover:bg-orange-700"
                      >
                        Add Medication
                      </Button>
                    </div>
                    {medicalHistory.currentMedications.length > 0 && (
                      <div className="space-y-2">
                        {medicalHistory.currentMedications.map((med, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-800/50 p-3 rounded border border-cyan-500/20 flex justify-between items-start"
                          >
                            <div className="text-sm text-gray-300">
                              <p className="font-medium text-cyan-200">{med.name}</p>
                              <p className="text-xs text-gray-400">
                                {med.dosage} - {med.frequency}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                setMedicalHistory({
                                  ...medicalHistory,
                                  currentMedications: medicalHistory.currentMedications.filter(
                                    (_, i) => i !== idx
                                  ),
                                })
                              }
                              className="text-orange-400 hover:text-orange-300"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Family History */}
                  <div>
                    <label className="block text-sm font-medium text-cyan-200 mb-2">
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
                      className="bg-slate-800 border-cyan-500/30 text-white placeholder-gray-500"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-4 pt-6">
                    <Button
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="flex-1 border-cyan-500/30 text-cyan-200 hover:bg-slate-800"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                    >
                      Review & Submit
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">Review Your Information</h2>

                  <div className="space-y-4 bg-slate-800/50 p-4 rounded-lg border border-cyan-500/20">
                    <div>
                      <h3 className="font-semibold text-cyan-200 mb-2">Symptoms ({symptoms.length})</h3>
                      {symptoms.map((sym, idx) => (
                        <p key={idx} className="text-sm text-gray-300">
                          • {sym.name} - Severity {sym.severity}/10, Duration: {sym.duration}
                        </p>
                      ))}
                    </div>

                    {medicalHistory.allergies.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-orange-300 mb-2">Allergies</h3>
                        <p className="text-sm text-gray-300">
                          {medicalHistory.allergies.join(", ")}
                        </p>
                      </div>
                    )}

                    {medicalHistory.chronicConditions.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-cyan-300 mb-2">Chronic Conditions</h3>
                        <p className="text-sm text-gray-300">
                          {medicalHistory.chronicConditions.join(", ")}
                        </p>
                      </div>
                    )}

                    {medicalHistory.currentMedications.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-cyan-300 mb-2">Current Medications</h3>
                        {medicalHistory.currentMedications.map((med, idx) => (
                          <p key={idx} className="text-sm text-gray-300">
                            • {med.name} {med.dosage} - {med.frequency}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 pt-6">
                    <Button
                      onClick={() => setStep(2)}
                      variant="outline"
                      className="flex-1 border-cyan-500/30 text-cyan-200 hover:bg-slate-800"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={analyzeMutation.isPending}
                      className="flex-1 bg-gradient-to-r from-cyan-600 to-orange-600 hover:from-cyan-700 hover:to-orange-700"
                    >
                      {analyzeMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Submit for Analysis
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Footer */}
          <p className="text-center text-gray-400 text-sm mt-8">
            Your information is encrypted and stored securely in compliance with healthcare privacy standards.
          </p>
        </div>
      </div>
    </div>
  );
}
