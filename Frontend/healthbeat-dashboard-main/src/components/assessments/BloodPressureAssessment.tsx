import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Activity, ArrowRight, ArrowLeft as ArrowLeftIcon, FileDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface FormData {
  sysBP: string;
  diaBP: string;
  morningReading: string;
  eveningReading: string;
  frequencyCheck: string;
  saltIntake: string;
  physicalActivity: string;
  stress: string;
  smoking: string;
  alcohol: string;
  familyHistory: string;
  age: string;
  gender: string;
  weight: string;
  height: string;
  medications: string;
  totChol: string;
  glucose: string;
  heartRate: string;
  cigsPerDay: string;
  currentSmoker: string;
}

interface Result {
  probability: number;
  risk_level: string;
  avg_group_probability: number;
  difference: number;
}

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const BloodPressureAssessment: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    sysBP: "",
    diaBP: "",
    morningReading: "",
    eveningReading: "",
    frequencyCheck: "",
    saltIntake: "low",
    physicalActivity: "moderate",
    stress: "low",
    smoking: "no",
    alcohol: "none",
    familyHistory: "no",
    age: "",
    gender: "male",
    weight: "",
    height: "",
    medications: "no",
    totChol: "",
    glucose: "",
    heartRate: "",
    cigsPerDay: "",
    currentSmoker: "0",
  });
  const [result, setResult] = useState<Result | null>(null);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const mapPhysActivity = (v: string) => {
    if (v === "high") return 2;
    if (v === "moderate") return 1;
    return 0;
  };

  const mapSaltIntake = (v: string) => {
    if (v === "low") return 2;
    if (v === "moderate") return 1;
    return 0;
  };

  const mapDietQuality = (v: string) => {
    if (v === "excellent") return 3;
    if (v === "good") return 2;
    if (v === "average") return 1;
    return 0;
  };

  const buildPayload = () => {
    return {
      age: Number.parseInt(formData.age || "0"),
      weight: Number.parseFloat(formData.weight || "0"),
      height: Number.parseFloat(formData.height || "0"),
      glucose: formData.glucose !== "" ? Number.parseFloat(formData.glucose) : 0,
      male: formData.gender === "male" ? 1 : 0,
      sysBP: formData.sysBP !== "" ? Number.parseFloat(formData.sysBP) : 0,
      diaBP: formData.diaBP !== "" ? Number.parseFloat(formData.diaBP) : 0,
      physicalActivity: mapPhysActivity(formData.physicalActivity),
      DietQuality: mapSaltIntake(formData.saltIntake),
      currentSmoker: formData.currentSmoker === "1" ? 1 : 0,
      cigsPerDay: formData.cigsPerDay ? Number.parseInt(formData.cigsPerDay) : null,
      SaltIntake: mapSaltIntake(formData.saltIntake),
      FamilyHistoryBP: formData.familyHistory === "yes" ? 1 : 0,
      BPMeds: formData.medications === "yes" ? 1 : 0,
      diabetes: 0,
      totChol: formData.totChol !== "" ? Number.parseFloat(formData.totChol) : 0,
      heartRate: formData.heartRate !== "" ? Number.parseFloat(formData.heartRate) : 0,
      notes: JSON.stringify({
        morningReading: formData.morningReading || null,
        eveningReading: formData.eveningReading || null,
        frequencyCheck: formData.frequencyCheck || null,
        stress: formData.stress || null,
        alcohol: formData.alcohol || null
      })
    };
  };

  const calculateRisk = async () => {
    setIsLoading(true);
    try {
      const payload = buildPayload();
      const resp = await fetch(`${API_BASE}/predict_bp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const txt = await resp.text().catch(() => "");
        throw new Error(txt || "server error");
      }
      const data: Result = await resp.json();
      setResult(data);
      toast.success("تم حساب تقييم مخاطر ضغط الدم بنجاح");
    } catch (e) {
      toast.error("حدث خطأ أثناء حساب المخاطر");
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(prev => prev + 1);
    } else {
      calculateRisk();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const resetAssessment = () => {
    setCurrentStep(0);
    setResult(null);
    setFormData({
      sysBP: "",
      diaBP: "",
      morningReading: "",
      eveningReading: "",
      frequencyCheck: "",
      saltIntake: "low",
      physicalActivity: "moderate",
      stress: "low",
      smoking: "no",
      alcohol: "none",
      familyHistory: "no",
      age: "",
      gender: "male",
      weight: "",
      height: "",
      medications: "no",
      totChol: "",
      glucose: "",
      heartRate: "",
      cigsPerDay: "",
      currentSmoker: "0",
    });
  };

  const downloadReport = () => {
    toast.success("تم تحميل تقرير ضغط الدم بصيغة PDF!");
  };

  const bookDoctor = () => {
    toast.info("سيتم توجيهك لحجز موعد لمتابعة ضغط الدم");
  };

  if (result) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Activity className="h-8 w-8 text-medical-warning" />
              نتائج تقييم مخاطر ارتفاع ضغط الدم
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <h3 className="text-3xl font-bold mb-2">
                مستوى الخطر: <span className="text-medical-warning">{result.risk_level}</span>
              </h3>
              <p className="text-muted-foreground">نسبة الخطر: {result.probability}%</p>
              <p className="text-muted-foreground">متوسط الفئة العمرية: {result.avg_group_probability}%</p>
              <p className="text-muted-foreground">الفرق عن المتوسط: {result.difference}%</p>
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={downloadReport} className="flex-1 gap-2" type="button">
                <FileDown className="h-4 w-4" />
                تحميل تقرير ضغط الدم
              </Button>
              <Button onClick={bookDoctor} variant="outline" className="flex-1" type="button">
                حجز موعد للمتابعة
              </Button>
              <Button onClick={resetAssessment} variant="secondary" type="button">
                إجراء تقييم جديد
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Activity className="h-12 w-12 text-medical-warning" />
              <div>
                <h3 className="text-2xl font-bold text-foreground">فحص مخاطر ارتفاع ضغط الدم</h3>
                <p className="text-muted-foreground">أدخل بياناتك وسنرسلها للخادم ليتم تقييمها بواسطة النموذج.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">الخطوة {currentStep + 1} من 3</span>
            <span className="text-sm text-muted-foreground">
              {currentStep === 0 && "قياسات ضغط الدم"}
              {currentStep === 1 && "عوامل الخطر"}
              {currentStep === 2 && "المعلومات الشخصية"}
            </span>
          </div>
          <Progress value={(currentStep + 1) * 33.33} className="h-2" />
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
              {currentStep === 0 && (
                <div className="space-y-4">
                  <h4 className="text-xl font-semibold">قياسات ضغط الدم</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sysBP">ضغط الدم الانقباضي الحالي (mmHg)</Label>
                      <Input id="sysBP" type="number" placeholder="مثال: 120" value={formData.sysBP} onChange={(e) => handleInputChange("sysBP", e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="diaBP">ضغط الدم الانبساطي الحالي (mmHg)</Label>
                      <Input id="diaBP" type="number" placeholder="مثال: 80" value={formData.diaBP} onChange={(e) => handleInputChange("diaBP", e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="morningReading">قراءة الصباح المعتادة (الانقباضي)</Label>
                      <Input id="morningReading" type="number" placeholder="قياس الصباح" value={formData.morningReading} onChange={(e) => handleInputChange("morningReading", e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="eveningReading">قراءة المساء المعتادة (الانقباضي)</Label>
                      <Input id="eveningReading" type="number" placeholder="قياس المساء" value={formData.eveningReading} onChange={(e) => handleInputChange("eveningReading", e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                      <Label>كم مرة تقيس ضغط الدم؟</Label>
                      <Select value={formData.frequencyCheck} onValueChange={(value: string) => handleInputChange("frequencyCheck", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر التكرار" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">يومياً</SelectItem>
                          <SelectItem value="weekly">أسبوعياً</SelectItem>
                          <SelectItem value="monthly">شهرياً</SelectItem>
                          <SelectItem value="rarely">نادراً</SelectItem>
                          <SelectItem value="never">لا أقيس</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <h4 className="text-xl font-semibold">عوامل الخطر</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>تناول الملح يومياً</Label>
                      <Select value={formData.saltIntake} onValueChange={(value: string) => handleInputChange("saltIntake", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="كمية الملح" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">قليل (أتجنب الملح)</SelectItem>
                          <SelectItem value="moderate">معتدل (ملح طبيعي)</SelectItem>
                          <SelectItem value="high">كثير (أحب الطعام المالح)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>مستوى النشاط البدني</Label>
                      <Select value={formData.physicalActivity} onValueChange={(value: string) => handleInputChange("physicalActivity", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="مستوى النشاط" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">عالي (رياضة منتظمة)</SelectItem>
                          <SelectItem value="moderate">متوسط (نشاط خفيف)</SelectItem>
                          <SelectItem value="low">منخفض (قليل الحركة)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>مستوى التوتر</Label>
                      <Select value={formData.stress} onValueChange={(value: string) => handleInputChange("stress", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="مستوى التوتر" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">منخفض</SelectItem>
                          <SelectItem value="moderate">متوسط</SelectItem>
                          <SelectItem value="high">مرتفع</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>التدخين</Label>
                      <Select value={formData.currentSmoker} onValueChange={(value: string) => { handleInputChange("currentSmoker", value); handleInputChange("smoking", value === "1" ? "yes" : "no"); }}>
                        <SelectTrigger>
                          <SelectValue placeholder="هل تدخن؟" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">لا</SelectItem>
                          <SelectItem value="1">نعم</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="cigsPerDay">عدد السجائر يومياً (إن وُجد)</Label>
                      <Input id="cigsPerDay" type="number" value={formData.cigsPerDay} onChange={(e) => handleInputChange("cigsPerDay", e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="totChol">الكوليسترول الكلي (mg/dL)</Label>
                      <Input id="totChol" type="number" value={formData.totChol} onChange={(e) => handleInputChange("totChol", e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="glucose">مستوى السكر (mg/dL)</Label>
                      <Input id="glucose" type="number" value={formData.glucose} onChange={(e) => handleInputChange("glucose", e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="heartRate">معدل ضربات القلب (bpm)</Label>
                      <Input id="heartRate" type="number" value={formData.heartRate} onChange={(e) => handleInputChange("heartRate", e.target.value)} />
                    </div>
                    <div>
                      <Label>شرب الكحول</Label>
                      <Select value={formData.alcohol} onValueChange={(value: string) => handleInputChange("alcohol", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="استهلاك الكحول" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">لا أشرب</SelectItem>
                          <SelectItem value="moderate">معتدل</SelectItem>
                          <SelectItem value="high">كثير</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <h4 className="text-xl font-semibold">المعلومات الشخصية</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="age">العمر (بالسنوات)</Label>
                      <Input id="age" type="number" value={formData.age} onChange={(e) => handleInputChange("age", e.target.value)} />
                    </div>
                    <div>
                      <Label>الجنس</Label>
                      <Select value={formData.gender} onValueChange={(value: string) => handleInputChange("gender", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الجنس" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">ذكر</SelectItem>
                          <SelectItem value="female">أنثى</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="weight">الوزن (كيلوغرام)</Label>
                      <Input id="weight" type="number" value={formData.weight} onChange={(e) => handleInputChange("weight", e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="height">الطول (سنتيمتر)</Label>
                      <Input id="height" type="number" value={formData.height} onChange={(e) => handleInputChange("height", e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                      <Label>هل تتناول أدوية لضغط الدم؟</Label>
                      <Select value={formData.medications} onValueChange={(value: string) => handleInputChange("medications", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="الأدوية الحالية" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no">لا</SelectItem>
                          <SelectItem value="yes">نعم</SelectItem>
                          <SelectItem value="sometimes">أحياناً</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>هل لدى عائلتك تاريخ مرضي لضغط الدم؟</Label>
                      <Select value={formData.familyHistory} onValueChange={(value: string) => handleInputChange("familyHistory", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="تاريخ عائلي" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no">لا يوجد</SelectItem>
                          <SelectItem value="yes">نعم (أقارب مباشرين)</SelectItem>
                          <SelectItem value="distant">تاريخ عائلي بعيد</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between pt-6">
            <Button onClick={prevStep} disabled={currentStep === 0} variant="outline" className="gap-2" type="button">
              <ArrowRight className="h-4 w-4" />
              السابق
            </Button>
            <Button onClick={nextStep} disabled={isLoading} className="gap-2" type="button">
              {isLoading ? "جاري التحليل..." : currentStep === 2 ? "احسب مخاطر ضغط الدم" : (<><ArrowLeftIcon className="h-4 w-4" />التالي</>)}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BloodPressureAssessment;
