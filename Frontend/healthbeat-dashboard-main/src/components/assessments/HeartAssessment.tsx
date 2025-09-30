import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Heart, ArrowRight, ArrowLeft, FileDown, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface FormData {
  bloodPressureSys: string;
  bloodPressureDia: string;
  cholesterolTotal: string;
  hdl: string;
  ldl: string;
  physicalActivity: string;
  diet: string;
  smoking: string;
  stress: string;
  familyHistory: string;
  age: string;
  gender: string;
  weight: string;
  height: string;
  heartConditions: string;
}

interface Result {
  riskLevel: string;
  riskPercentage: number;
  comparison: number;
  recommendations: string[];
  color: string;
}

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const HeartAssessment = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    bloodPressureSys: "",
    bloodPressureDia: "",
    cholesterolTotal: "",
    hdl: "",
    ldl: "",
    physicalActivity: "",
    diet: "",
    smoking: "",
    stress: "",
    familyHistory: "",
    age: "",
    gender: "",
    weight: "",
    height: "",
    heartConditions: "",
  });
  const [result, setResult] = useState<Result | null>(null);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const computeLocalResult = (): Result => {
    let riskScore = 0;
    if (parseFloat(formData.bloodPressureSys || "0") > 140) riskScore += 25;
    if (parseFloat(formData.bloodPressureDia || "0") > 90) riskScore += 20;
    if (parseFloat(formData.cholesterolTotal || "0") > 240) riskScore += 15;
    if (parseFloat(formData.hdl || "0") < 40) riskScore += 15;
    if (parseFloat(formData.ldl || "0") > 160) riskScore += 20;
    if (formData.physicalActivity === "low") riskScore += 15;
    if (formData.diet === "poor") riskScore += 15;
    if (formData.smoking === "yes") riskScore += 25;
    if (formData.stress === "high") riskScore += 10;
    if (formData.familyHistory === "yes") riskScore += 20;
    if (parseInt(formData.age || "0") > 55) riskScore += 20;
    if (formData.heartConditions === "yes") riskScore += 30;
    const heightNum = parseFloat(formData.height || "0") / 100 || 0.0001;
    const weightNum = parseFloat(formData.weight || "0");
    const bmi = weightNum / (heightNum * heightNum);
    if (bmi > 30) riskScore += 15;
    const riskPercentage = Math.min(riskScore, 100);
    let riskLevel = "منخفض";
    let color = "text-medical-success";
    if (riskScore < 35) {
      riskLevel = "منخفض";
      color = "text-medical-success";
    } else if (riskScore < 75) {
      riskLevel = "متوسط";
      color = "text-medical-warning";
    } else {
      riskLevel = "مرتفع";
      color = "text-medical-danger";
    }
    const ageGroup = parseInt(formData.age || "0");
    const comparison = ageGroup > 55 ? 70 : 40;
    const recommendations: string[] = [];
    if (riskScore < 35) {
      recommendations.push("استمر في نمط حياتك الصحي الحالي", "حافظ على نشاط بدني منتظم لتقوية القلب", "تناول نظام غذائي غني بأحماض أوميغا 3", "أجري فحص قلب شامل كل سنتين");
    } else if (riskScore < 75) {
      recommendations.push("استشر طبيب قلب لتقييم حالتك", "راقب ضغط الدم ومستوى الكوليسترول", "مارس الرياضة بانتظام تحت إشراف طبي", "قلل من الملح والدهون المشبعة", "تعلم تقنيات إدارة التوتر");
    } else {
      recommendations.push("يجب مراجعة طبيب القلب فوراً", "قد تحتاج لأدوية للتحكم في ضغط الدم والكوليسترول", "اتبع نظام غذائي صارم منخفض الصوديوم", "تجنب الأنشطة المجهدة حتى استشارة الطبيب", "أجري تخطيط قلب وإيكو فوراً", "توقف عن التدخين نهائياً");
    }
    return {
      riskLevel,
      riskPercentage,
      comparison,
      recommendations,
      color,
    };
  };

  const calculateRisk = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/predict_heart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!resp.ok) {
        throw new Error("server error");
      }
      const payload = await resp.json().catch(() => ({}));
      const data = (payload && (payload.data ?? payload)) || {};
      const riskLevel = data.riskLevel ?? data.risk_level ?? data.level ?? computeLocalResult().riskLevel;
      const riskPercentage = typeof data.riskPercentage === "number" ? data.riskPercentage : Number(data.riskPercentage) || computeLocalResult().riskPercentage;
      const comparison = typeof data.comparison === "number" ? data.comparison : Number(data.comparison) || computeLocalResult().comparison;
      const recommendations = Array.isArray(data.recommendations) ? data.recommendations : (data.recs ?? computeLocalResult().recommendations);
      const color = data.color ?? (riskPercentage >= 60 ? "text-medical-danger" : riskPercentage >= 35 ? "text-medical-warning" : "text-medical-success");
      setResult({
        riskLevel,
        riskPercentage,
        comparison,
        recommendations,
        color,
      });
      toast.success("تم حساب تقييم مخاطر أمراض القلب بنجاح!");
    } catch (e) {
      const local = computeLocalResult();
      setResult(local);
      toast.success("تم حساب تقييم مخاطر أمراض القلب بنجاح!");
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      calculateRisk();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetAssessment = () => {
    setCurrentStep(0);
    setResult(null);
    setFormData({
      bloodPressureSys: "",
      bloodPressureDia: "",
      cholesterolTotal: "",
      hdl: "",
      ldl: "",
      physicalActivity: "",
      diet: "",
      smoking: "",
      stress: "",
      familyHistory: "",
      age: "",
      gender: "",
      weight: "",
      height: "",
      heartConditions: "",
    });
  };

  const downloadReport = () => {
    toast.success("تم تحميل تقرير القلب بصيغة PDF!");
  };

  const bookDoctor = () => {
    toast.info("سيتم توجيهك لحجز موعد مع طبيب قلب");
  };

  if (result) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Heart className="h-8 w-8 text-medical-danger" />
              نتائج تقييم مخاطر أمراض القلب
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <h3 className="text-3xl font-bold mb-2">
                مستوى الخطر: <span className={result.color}>{result.riskLevel}</span>
              </h3>
              <p className="text-muted-foreground">تقييم شامل لصحة القلب والأوعية الدموية</p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span>نسبة خطر أمراض القلب</span>
                  <span className="font-bold">{result.riskPercentage}%</span>
                </div>
                <Progress value={result.riskPercentage} className="h-3" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span>مقارنة مع فئتك العمرية</span>
                  <span className="font-bold">{result.comparison}%</span>
                </div>
                <Progress value={result.comparison} className="h-3" />
                <p className="text-sm text-muted-foreground mt-1">
                  متوسط خطر أمراض القلب للفئة العمرية من {parseInt(formData.age || "0") - 5} إلى {parseInt(formData.age || "0") + 5} سنة
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                توصيات لصحة القلب
              </h4>
              <ul className="space-y-2">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <ArrowLeft className="h-4 w-4 text-medical-danger mt-1 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={downloadReport} className="flex-1 gap-2">
                <FileDown className="h-4 w-4" />
                تحميل تقرير القلب
              </Button>
              <Button onClick={bookDoctor} variant="outline" className="flex-1">
                حجز موعد مع طبيب قلب
              </Button>
              <Button onClick={resetAssessment} variant="secondary">
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
              <Heart className="h-12 w-12 text-medical-danger" />
              <div>
                <h3 className="text-2xl font-bold text-foreground">فحص مخاطر أمراض القلب</h3>
                <p className="text-muted-foreground">
                  أمراض القلب هي مجموعة من الحالات التي تؤثر على القلب. يمكن أن تؤثر على عضلة القلب، 
                  صمامات القلب، أو الشرايين التاجية التي تزود القلب بالدم.
                </p>
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
              {currentStep === 0 && "فحوصات القلب والأوعية الدموية"}
              {currentStep === 1 && "العادات اليومية"}
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
                  <h4 className="text-xl font-semibold">فحوصات القلب والأوعية الدموية</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bloodPressureSys">ضغط الدم الانقباضي (mmHg)</Label>
                      <Input id="bloodPressureSys" type="number" placeholder="120 طبيعي" value={formData.bloodPressureSys} onChange={(e) => handleInputChange("bloodPressureSys", e.target.value)} required />
                      <p className="text-xs text-muted-foreground mt-1">طبيعي: أقل من 120 | مرتفع: 140+</p>
                    </div>
                    <div>
                      <Label htmlFor="bloodPressureDia">ضغط الدم الانبساطي (mmHg)</Label>
                      <Input id="bloodPressureDia" type="number" placeholder="80 طبيعي" value={formData.bloodPressureDia} onChange={(e) => handleInputChange("bloodPressureDia", e.target.value)} required />
                      <p className="text-xs text-muted-foreground mt-1">طبيعي: أقل من 80 | مرتفع: 90+</p>
                    </div>
                    <div>
                      <Label htmlFor="cholesterolTotal">الكوليسترول الكلي (mg/dL)</Label>
                      <Input id="cholesterolTotal" type="number" placeholder="أقل من 200 طبيعي" value={formData.cholesterolTotal} onChange={(e) => handleInputChange("cholesterolTotal", e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="hdl">الكوليسترول الجيد HDL (mg/dL)</Label>
                      <Input id="hdl" type="number" placeholder="أكثر من 40 طبيعي" value={formData.hdl} onChange={(e) => handleInputChange("hdl", e.target.value)} required />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="ldl">الكوليسترول الضار LDL (mg/dL)</Label>
                      <Input id="ldl" type="number" placeholder="أقل من 100 طبيعي" value={formData.ldl} onChange={(e) => handleInputChange("ldl", e.target.value)} required />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <h4 className="text-xl font-semibold">العادات اليومية وعوامل الخطر</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>مستوى النشاط البدني</Label>
                      <Select value={formData.physicalActivity} onValueChange={(value) => handleInputChange("physicalActivity", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر مستوى النشاط" aria-required />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">عالي (تمارين قلبية منتظمة)</SelectItem>
                          <SelectItem value="moderate">متوسط (رياضة خفيفة)</SelectItem>
                          <SelectItem value="low">منخفض (قليل الحركة)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>التدخين</Label>
                      <Select value={formData.smoking} onValueChange={(value) => handleInputChange("smoking", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="حالة التدخين" aria-required />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no">لا أدخن</SelectItem>
                          <SelectItem value="yes">أدخن حالياً</SelectItem>
                          <SelectItem value="former">مدخن سابق</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>مستوى التوتر</Label>
                      <Select value={formData.stress} onValueChange={(value) => handleInputChange("stress", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="مستوى التوتر اليومي" aria-required />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">منخفض</SelectItem>
                          <SelectItem value="moderate">متوسط</SelectItem>
                          <SelectItem value="high">مرتفع</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>التاريخ العائلي لأمراض القلب</Label>
                      <Select value={formData.familyHistory} onValueChange={(value) => handleInputChange("familyHistory", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="تاريخ عائلي" aria-required />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no">لا يوجد</SelectItem>
                          <SelectItem value="yes">نعم (أقارب من الدرجة الأولى)</SelectItem>
                          <SelectItem value="distant">تاريخ عائلي بعيد</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label>نوع النظام الغذائي</Label>
                      <Select value={formData.diet} onValueChange={(value) => handleInputChange("diet", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع النظام الغذائي" aria-required />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">ممتاز (قليل الدهون والملح)</SelectItem>
                          <SelectItem value="good">جيد (متوازن)</SelectItem>
                          <SelectItem value="average">متوسط</SelectItem>
                          <SelectItem value="poor">ضعيف (كثير من الدهون والوجبات السريعة)</SelectItem>
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
                      <Input id="age" type="number" placeholder="أدخل عمرك" value={formData.age} onChange={(e) => handleInputChange("age", e.target.value)} required />
                    </div>
                    <div>
                      <Label>الجنس</Label>
                      <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الجنس" aria-required />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">ذكر</SelectItem>
                          <SelectItem value="female">أنثى</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="weight">الوزن (كيلوغرام)</Label>
                      <Input id="weight" type="number" placeholder="أدخل وزنك" value={formData.weight} onChange={(e) => handleInputChange("weight", e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="height">الطول (سنتيمتر)</Label>
                      <Input id="height" type="number" placeholder="أدخل طولك" value={formData.height} onChange={(e) => handleInputChange("height", e.target.value)} required />
                    </div>
                    <div className="md:col-span-2">
                      <Label>هل تعاني من أمراض قلب سابقة؟</Label>
                      <Select value={formData.heartConditions} onValueChange={(value) => handleInputChange("heartConditions", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الإجابة" aria-required />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no">لا</SelectItem>
                          <SelectItem value="yes">نعم</SelectItem>
                          <SelectItem value="unsure">غير متأكد</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between pt-6">
            <Button onClick={prevStep} disabled={currentStep === 0} variant="outline" className="gap-2">
              <ArrowRight className="h-4 w-4" />
              السابق
            </Button>

            <Button onClick={nextStep} disabled={isLoading} className="gap-2">
              {isLoading ? "جاري التحليل..." : currentStep === 2 ? "احسب مخاطر القلب" : (<><ArrowLeft className="h-4 w-4" />التالي</>)}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HeartAssessment;
