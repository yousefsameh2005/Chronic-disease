export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message: string;
}

export interface FormField {
  name: string;
  rules: ValidationRule[];
}

export const validateField = (value: any, rules: ValidationRule[]): string | null => {
  for (const rule of rules) {
    if (rule.required && (!value || value === "")) {
      return rule.message;
    }
    
    if (value && rule.min !== undefined) {
      const numValue = parseFloat(value);
      if (numValue < rule.min) {
        return rule.message;
      }
    }
    
    if (value && rule.max !== undefined) {
      const numValue = parseFloat(value);
      if (numValue > rule.max) {
        return rule.message;
      }
    }
    
    if (value && rule.pattern && !rule.pattern.test(value)) {
      return rule.message;
    }
    
    if (value && rule.custom && !rule.custom(value)) {
      return rule.message;
    }
  }
  
  return null;
};

export const validateForm = (data: Record<string, any>, fields: FormField[]): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  fields.forEach(field => {
    const error = validateField(data[field.name], field.rules);
    if (error) {
      errors[field.name] = error;
    }
  });
  
  return errors;
};

// Common validation rules
export const commonRules = {
  required: (message: string = "هذا الحقل مطلوب"): ValidationRule => ({
    required: true,
    message
  }),
  
  numberRange: (min: number, max: number, message?: string): ValidationRule => ({
    min,
    max,
    message: message || `يجب أن تكون القيمة بين ${min} و ${max}`
  }),
  
  age: (): ValidationRule => ({
    required: true,
    min: 1,
    max: 120,
    message: "يجب أن يكون العمر بين 1 و 120 سنة"
  }),
  
  height: (): ValidationRule => ({
    required: true,
    min: 50,
    max: 250,
    message: "يجب أن يكون الطول بين 50 و 250 سم"
  }),
  
  weight: (): ValidationRule => ({
    required: true,
    min: 10,
    max: 500,
    message: "يجب أن يكون الوزن بين 10 و 500 كجم"
  }),
  
  bloodPressure: (): ValidationRule => ({
    pattern: /^\d{2,3}\/\d{2,3}$/,
    custom: (value: string) => {
      const parts = value.split('/');
      if (parts.length !== 2) return false;
      const systolic = parseInt(parts[0]);
      const diastolic = parseInt(parts[1]);
      return systolic >= 60 && systolic <= 300 && diastolic >= 40 && diastolic <= 200;
    },
    message: "يرجى إدخال ضغط الدم بالشكل الصحيح (مثال: 120/80)"
  }),
  
  glucose: (): ValidationRule => ({
    min: 20,
    max: 600,
    message: "يجب أن يكون مستوى السكر بين 20 و 600 mg/dL"
  }),
  
  hba1c: (): ValidationRule => ({
    min: 3.0,
    max: 15.0,
    message: "يجب أن يكون مستوى HbA1c بين 3.0 و 15.0%"
  }),
  
  cholesterol: (): ValidationRule => ({
    min: 50,
    max: 500,
    message: "يجب أن يكون مستوى الكوليسترول بين 50 و 500 mg/dL"
  }),
  
  heartRate: (): ValidationRule => ({
    min: 30,
    max: 220,
    message: "يجب أن يكون معدل ضربات القلب بين 30 و 220 bpm"
  }),
  
  cigsPerDay: (): ValidationRule => ({
    min: 0,
    max: 100,
    message: "يجب أن يكون عدد السجائر بين 0 و 100 يومياً"
  })
};

// Form schemas for different steps
export const formSchemas = {
  basicInfo: [
    { name: "age", rules: [commonRules.age()] },
    { name: "gender", rules: [commonRules.required("يرجى اختيار الجنس")] },
    { name: "height", rules: [commonRules.height()] },
    { name: "weight", rules: [commonRules.weight()] }
  ],
  
  diabetesStep1: [
    { name: "fastingGlucose", rules: [commonRules.glucose()] },
    { name: "hba1c", rules: [commonRules.hba1c()] }
  ],
  
  hypertensionStep1: [
    { name: "bpReading1", rules: [commonRules.bloodPressure()] }
  ],
  
  hypertensionStep2: [
    { name: "exercise", rules: [commonRules.required("يرجى اختيار مستوى النشاط البدني")] },
    { name: "diet", rules: [commonRules.required("يرجى اختيار نوع النظام الغذائي")] },
    { name: "smoking", rules: [commonRules.required("يرجى اختيار حالة التدخين")] },
    { name: "salt", rules: [commonRules.required("يرجى اختيار مستوى استهلاك الملح")] },
    { name: "cigsPerDay", rules: [commonRules.cigsPerDay()] }
  ],
  
  hypertensionStep3: [
    { name: "familyHistory", rules: [commonRules.required("يرجى اختيار التاريخ العائلي")] },
    { name: "totChol", rules: [commonRules.cholesterol()] },
    { name: "heartRate", rules: [commonRules.heartRate()] },
    { name: "glucose", rules: [commonRules.glucose()] }
  ],
  
  heartStep1: [
    { name: "cholesterol", rules: [commonRules.cholesterol()] },
    { name: "ldl", rules: [commonRules.numberRange(50, 300, "يجب أن يكون مستوى LDL بين 50 و 300 mg/dL")] }
  ],
  
  heartStep2: [
    { name: "exercise", rules: [commonRules.required("يرجى اختيار مستوى النشاط البدني")] },
    { name: "diet", rules: [commonRules.required("يرجى اختيار نوع النظام الغذائي")] },
    { name: "smoking", rules: [commonRules.required("يرجى اختيار حالة التدخين")] },
    { name: "cigsPerDay", rules: [commonRules.cigsPerDay()] }
  ],
  
  heartStep3: [
    { name: "familyHistory", rules: [commonRules.required("يرجى اختيار التاريخ العائلي")] }
  ]
};

// Validation helpers
export const isFormValid = (data: Record<string, any>, schema: FormField[]): boolean => {
  const errors = validateForm(data, schema);
  return Object.keys(errors).length === 0;
};

export const getFieldError = (fieldName: string, value: any, schema: FormField[]): string | null => {
  const field = schema.find(f => f.name === fieldName);
  if (!field) return null;
  
  return validateField(value, field.rules);
};