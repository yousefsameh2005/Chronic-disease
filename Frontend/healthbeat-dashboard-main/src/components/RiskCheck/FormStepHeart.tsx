import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, Heart, HelpCircle, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { translations } from "./translations/ar";
import { calculateRiskContribution } from "./utils/calculations";

interface FormStepHeartProps {
  step: number;
  initialData?: any;
  basicInfo?: any;
  onComplete: (data: any) => void;
  onBack: () => void;
}

const FormStepHeart = ({ step, initialData, basicInfo, onComplete, onBack }: FormStepHeartProps) => {
  const [formData, setFormData] = useState(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
    
    // Set cigsPerDay to 0 if smoking is not "نعم"
    if (field === "smoking" && value !== "نعم") {
      setFormData((prev: any) => ({ ...prev, cigsPerDay: "0" }));
    }
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      // Lipid panel validation
      if (!formData.cholesterol && formData.cholesterol !== "unknown") {
        newErrors.cholesterol = translations.validation.required;
      } else if (formData.cholesterol !== "unknown") {
        const chol = parseFloat(formData.cholesterol);
        if (chol < 50 || chol > 500) {
          newErrors.cholesterol = "يجب أن يكون مستوى الكوليسترول بين 50 و 500 mg/dL";
        }
      }
      
      if (!formData.ldl && formData.ldl !== "unknown") {
        newErrors.ldl = translations.validation.required;
      } else if (formData.ldl !== "unknown") {
        const ldl = parseFloat(formData.ldl);
        if (ldl < 30 || ldl > 300) {
          newErrors.ldl = "يجب أن يكون مستوى LDL بين 30 و 300 mg/dL";
        }
      }
    } else if (step === 2) {
      // Lifestyle validation
      if (!formData.exercise) {
        newErrors.exercise = translations.validation.required;
      }
      if (!formData.diet) {
        newErrors.diet = translations.validation.required;
      }
      if (!formData.smoking) {
        newErrors.smoking = translations.validation.required;
      }
    } else if (step === 3) {
      // Medical history
      if (!formData.familyHistory) {
        newErrors.familyHistory = translations.validation.required;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateStep()) {
      onComplete(formData);
    }
  };

  const renderRiskIndicator = (value: string, normalRange: { min: number; max: number }, highThreshold: number) => {
    if (!value || value === "unknown") return null;
    
    const numValue = parseFloat(value);
    const risk = calculateRiskContribution(numValue, normalRange, highThreshold);
    
    return (
      <div className="mt-2 space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">مساهمة في الخطر</span>
          <span className={`font-medium ${risk.color}`}>{risk.percentage}%</span>
        </div>
        <Progress value={risk.percentage} className="h-1" />
        <Badge variant="outline" className={`text-xs ${risk.color}`}>
          {risk.status === "normal" ? "طبيعي" : 
           risk.status === "borderline" ? "حدودي" :
           risk.status === "high" ? "مرتفع" : "مرتفع جداً"}
        </Badge>
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Cholesterol */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Label htmlFor="cholesterol">
              {translations.forms.heart.step1.fields.cholesterol.label}
            </Label>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            id="cholesterol"
            type="number"
            placeholder={translations.forms.heart.step1.fields.cholesterol.placeholder}
            value={formData.cholesterol === "unknown" ? "" : formData.cholesterol}
            onChange={(e) => handleInputChange("cholesterol", e.target.value)}
            className={`text-right ${errors.cholesterol ? 'border-red-500' : ''}`}
            disabled={formData.cholesterol === "unknown"}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {translations.forms.heart.step1.fields.cholesterol.normalRange}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleInputChange("cholesterol", 
                formData.cholesterol === "unknown" ? "" : "unknown")}
            >
              {translations.ui.unknownOption}
            </Button>
          </div>
          {renderRiskIndicator(formData.cholesterol, { min: 100, max: 199 }, 240)}
          {errors.cholesterol && (
            <p className="text-sm text-red-500 mt-1">{errors.cholesterol}</p>
          )}
        </div>

        {/* LDL */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Label htmlFor="ldl">
              {translations.forms.heart.step1.fields.ldl.label}
            </Label>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            id="ldl"
            type="number"
            placeholder={translations.forms.heart.step1.fields.ldl.placeholder}
            value={formData.ldl === "unknown" ? "" : formData.ldl}
            onChange={(e) => handleInputChange("ldl", e.target.value)}
            className={`text-right ${errors.ldl ? 'border-red-500' : ''}`}
            disabled={formData.ldl === "unknown"}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {translations.forms.heart.step1.fields.ldl.normalRange}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleInputChange("ldl", 
                formData.ldl === "unknown" ? "" : "unknown")}
            >
              {translations.ui.unknownOption}
            </Button>
          </div>
          {renderRiskIndicator(formData.ldl, { min: 50, max: 99 }, 160)}
          {errors.ldl && (
            <p className="text-sm text-red-500 mt-1">{errors.ldl}</p>
          )}
        </div>

        {/* HDL */}
        <div>
          <Label htmlFor="hdl">
            {translations.forms.heart.step1.fields.hdl.label}
          </Label>
          <Input
            id="hdl"
            type="number"
            placeholder={translations.forms.heart.step1.fields.hdl.placeholder}
            value={formData.hdl || ""}
            onChange={(e) => handleInputChange("hdl", e.target.value)}
            className="text-right"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {translations.forms.heart.step1.fields.hdl.normalRange}
          </p>
        </div>

        {/* Triglycerides */}
        <div>
          <Label htmlFor="triglycerides">الدهون الثلاثية (mg/dL)</Label>
          <Input
            id="triglycerides"
            type="number"
            placeholder="أقل من 150"
            value={formData.triglycerides || ""}
            onChange={(e) => handleInputChange("triglycerides", e.target.value)}
            className="text-right"
          />
          <p className="text-xs text-muted-foreground mt-1">طبيعي: أقل من 150</p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>مستوى النشاط البدني</Label>
          <Select 
            value={formData.exercise} 
            onValueChange={(value) => handleInputChange("exercise", value)}
          >
            <SelectTrigger className={errors.exercise ? 'border-red-500' : ''}>
              <SelectValue placeholder="اختر مستوى النشاط" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="يومياً">يومياً (30+ دقيقة)</SelectItem>
              <SelectItem value="أسبوعياً">3-4 مرات أسبوعياً</SelectItem>
              <SelectItem value="نادراً">مرة أو مرتين أسبوعياً</SelectItem>
              <SelectItem value="لا أمارس">لا أمارس الرياضة</SelectItem>
            </SelectContent>
          </Select>
          {errors.exercise && (
            <p className="text-sm text-red-500 mt-1">{errors.exercise}</p>
          )}
        </div>

        <div>
          <Label>النظام الغذائي</Label>
          <Select 
            value={formData.diet} 
            onValueChange={(value) => handleInputChange("diet", value)}
          >
            <SelectTrigger className={errors.diet ? 'border-red-500' : ''}>
              <SelectValue placeholder="اختر نوع النظام الغذائي" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="صحي للقلب">صحي للقلب (قليل الدهون المشبعة)</SelectItem>
              <SelectItem value="متوازن">متوازن</SelectItem>
              <SelectItem value="عالي الدهون">عالي الدهون والكوليسترول</SelectItem>
            </SelectContent>
          </Select>
          {errors.diet && (
            <p className="text-sm text-red-500 mt-1">{errors.diet}</p>
          )}
        </div>

        <div>
          <Label>التدخين</Label>
          <Select 
            value={formData.smoking} 
            onValueChange={(value) => handleInputChange("smoking", value)}
          >
            <SelectTrigger className={errors.smoking ? 'border-red-500' : ''}>
              <SelectValue placeholder="اختر" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="نعم">نعم</SelectItem>
              <SelectItem value="لا">لا</SelectItem>
              <SelectItem value="أقلعت">أقلعت مؤخراً</SelectItem>
            </SelectContent>
          </Select>
          {errors.smoking && (
            <p className="text-sm text-red-500 mt-1">{errors.smoking}</p>
          )}
        </div>

        {/* Cigarettes per day - only visible if smoking = "نعم" */}
        {formData.smoking === "نعم" && (
          <div>
            <Label>عدد السجائر يومياً</Label>
            <Input
              type="number"
              placeholder="أدخل العدد"
              value={formData.cigsPerDay || ""}
              onChange={(e) => handleInputChange("cigsPerDay", e.target.value)}
              className={`text-center ${errors.cigsPerDay ? 'border-red-500' : ''}`}
            />
            <p className="text-xs text-muted-foreground mt-1">0 = غير مدخن</p>
            {errors.cigsPerDay && (
              <p className="text-sm text-red-500 mt-1">{errors.cigsPerDay}</p>
            )}
          </div>
        )}

        <div>
          <Label>مستوى التوتر</Label>
          <Select 
            value={formData.stress} 
            onValueChange={(value) => handleInputChange("stress", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر مستوى التوتر" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="منخفض">منخفض</SelectItem>
              <SelectItem value="متوسط">متوسط</SelectItem>
              <SelectItem value="عالي">عالي</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>التاريخ العائلي لأمراض القلب</Label>
          <Select 
            value={formData.familyHistory} 
            onValueChange={(value) => handleInputChange("familyHistory", value)}
          >
            <SelectTrigger className={errors.familyHistory ? 'border-red-500' : ''}>
              <SelectValue placeholder="اختر" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="نعم">نعم (أقارب درجة أولى)</SelectItem>
              <SelectItem value="بعيد">نعم (أقارب بعيدون)</SelectItem>
              <SelectItem value="لا">لا</SelectItem>
              <SelectItem value="غير متأكد">غير متأكد</SelectItem>
            </SelectContent>
          </Select>
          {errors.familyHistory && (
            <p className="text-sm text-red-500 mt-1">{errors.familyHistory}</p>
          )}
        </div>

        <div>
          <Label>أدوية ضغط الدم الحالية</Label>
          <Select 
            value={formData.bpMeds} 
            onValueChange={(value) => handleInputChange("bpMeds", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="نعم">نعم</SelectItem>
              <SelectItem value="لا">لا</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>تاريخ إصابة سابقة بسكتة</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-right font-normal",
                  !formData.prevalentStrokeDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="ml-2 h-4 w-4" />
                {formData.prevalentStrokeDate 
                  ? format(new Date(formData.prevalentStrokeDate), "dd/MM/yyyy")
                  : "اختر تاريخ الإصابة"
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.prevalentStrokeDate ? new Date(formData.prevalentStrokeDate) : undefined}
                onSelect={(date) => handleInputChange("prevalentStrokeDate", date ? date.toISOString() : "")}
                disabled={(date) => date > new Date()}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          <div className="flex items-center gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleInputChange("prevalentStroke", formData.prevalentStroke === "لا" ? "نعم" : "لا")}
            >
              {formData.prevalentStroke === "لا" ? "لا يوجد تاريخ إصابة" : "يوجد تاريخ إصابة"}
            </Button>
          </div>
        </div>

        <div>
          <Label>تاريخ الإصابة بارتفاع ضغط الدم</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-right font-normal",
                  !formData.prevalentHypDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="ml-2 h-4 w-4" />
                {formData.prevalentHypDate 
                  ? format(new Date(formData.prevalentHypDate), "dd/MM/yyyy")
                  : "اختر تاريخ التشخيص"
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.prevalentHypDate ? new Date(formData.prevalentHypDate) : undefined}
                onSelect={(date) => handleInputChange("prevalentHypDate", date ? date.toISOString() : "")}
                disabled={(date) => date > new Date()}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          <div className="flex items-center gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleInputChange("prevalentHyp", formData.prevalentHyp === "لا" ? "نعم" : "لا")}
            >
              {formData.prevalentHyp === "لا" ? "لا يوجد تاريخ مرضي" : "يوجد تاريخ مرضي"}
            </Button>
          </div>
        </div>

        <div>
          <Label>مستوى التعليم</Label>
          <Select 
            value={formData.education} 
            onValueChange={(value) => handleInputChange("education", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ابتدائي">ابتدائي</SelectItem>
              <SelectItem value="متوسط">متوسط</SelectItem>
              <SelectItem value="ثانوي">ثانوي</SelectItem>
              <SelectItem value="جامعي">جامعي</SelectItem>
              <SelectItem value="عليا">دراسات عليا</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Additional lifestyle inputs for future analysis */}
        <div>
          <Label>جودة النظام الغذائي</Label>
          <Select 
            value={formData.dietQuality} 
            onValueChange={(value) => handleInputChange("dietQuality", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ممتاز">ممتاز</SelectItem>
              <SelectItem value="جيد">جيد</SelectItem>
              <SelectItem value="متوسط">متوسط</SelectItem>
              <SelectItem value="ضعيف">ضعيف</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>مستوى التوتر</Label>
          <Select 
            value={formData.stressLevel} 
            onValueChange={(value) => handleInputChange("stressLevel", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="منخفض">منخفض</SelectItem>
              <SelectItem value="متوسط">متوسط</SelectItem>
              <SelectItem value="عالي">عالي</SelectItem>
              <SelectItem value="عالي جداً">عالي جداً</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const getStepTitle = () => {
    switch (step) {
      case 1: return translations.forms.heart.step1.title;
      case 2: return "نمط الحياة";
      case 3: return "التاريخ الطبي";
      default: return "";
    }
  };

  const renderCurrentStep = () => {
    switch (step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      default: return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-foreground">
            <Heart className="h-6 w-6 text-primary" />
            {getStepTitle()}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            الخطوة {step} من 3 - {translations.sections.heart.title}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {renderCurrentStep()}
          
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={onBack}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {translations.ui.previous}
            </Button>
            
            <Button
              onClick={handleSubmit}
              className="gap-2"
            >
              {step === 3 ? translations.ui.calculating : translations.ui.next}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FormStepHeart;