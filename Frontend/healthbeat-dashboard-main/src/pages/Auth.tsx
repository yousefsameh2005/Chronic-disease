import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCircle, Mail, Lock, User, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const Auth: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [fullName, setFullName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [registerEmail, setRegisterEmail] = useState<string>("");
  const [registerPassword, setRegisterPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((response) => response.json())
      .then((data) => console.log("IP:", data.ip))
      .catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        const token = data?.data?.token ?? data?.token ?? "";
        if (token) localStorage.setItem("token", token);
        toast({
          title: "تم تسجيل الدخول بنجاح",
        });
        setTimeout(() => {
          navigate("/");
        }, 300);
      } else {
        const message = data?.message ?? data?.detail ?? "فشل تسجيل الدخول";
        toast({
          title: "فشل تسجيل الدخول",
          description: String(message),
        });
      }
    } catch (err) {
      toast({
        title: "حدث خطأ",
        description: "تعذر الاتصال بالخادم. حاول مرة أخرى.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (registerPassword !== confirmPassword) {
      toast({
        title: "خطأ في كلمة المرور",
        description: "كلمتا المرور غير متطابقتين",
      });
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        fullName,
        phone,
        email: registerEmail,
        password: registerPassword,
        confirmPassword
      };

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        toast({
          title: "تم إنشاء الحساب بنجاح",
        });
        setFullName("");
        setPhone("");
        setRegisterEmail("");
        setRegisterPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          navigate("/");
        }, 300);
      } else {
        const message = data?.message ?? data?.detail ?? "فشل إنشاء الحساب";
        toast({
          title: "فشل إنشاء الحساب",
          description: String(message),
        });
      }
    } catch (err) {
      toast({
        title: "حدث خطأ",
        description: "تعذر الاتصال بالخادم. حاول مرة أخرى.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-card py-12 px-4">
      <div className="container mx-auto max-w-md">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-medical rounded-full flex items-center justify-center mb-4 shadow-medical">
            <UserCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">الملف الشخصي</h1>
          <p className="text-muted-foreground">سجل دخولك أو أنشئ حساباً جديداً للاستمتاع بجميع الخدمات</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle className="text-center text-primary">مرحباً بك</CardTitle>
              <CardDescription className="text-center">اختر تسجيل الدخول إذا كان لديك حساب، أو أنشئ حساباً جديد</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login" className="text-sm">تسجيل الدخول</TabsTrigger>
                  <TabsTrigger value="register" className="text-sm">إنشاء حساب</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-right">البريد الإلكتروني</Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          placeholder="ادخل بريدك الإلكتروني"
                          className="pr-10"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-right">كلمة المرور</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type="password"
                          placeholder="ادخل كلمة المرور"
                          className="pr-10"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    <Button type="submit" className="w-full bg-gradient-medical text-white shadow-medical hover:opacity-90" disabled={isLoading}>
                      {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                    </Button>

                    <div className="text-center">
                      <Button variant="link" className="text-primary text-sm">نسيت كلمة المرور؟</Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-right">الاسم الكامل</Label>
                      <div className="relative">
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="ادخل اسمك الكامل"
                          className="pr-10"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                        <User className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-right">رقم الهاتف</Label>
                      <div className="relative">
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="ادخل رقم هاتفك"
                          className="pr-10"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                        <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registerEmail" className="text-right">البريد الإلكتروني</Label>
                      <div className="relative">
                        <Input
                          id="registerEmail"
                          type="email"
                          placeholder="ادخل بريدك الإلكتروني"
                          className="pr-10"
                          required
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                        />
                        <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registerPassword" className="text-right">كلمة المرور</Label>
                      <div className="relative">
                        <Input
                          id="registerPassword"
                          type="password"
                          placeholder="ادخل كلمة المرور"
                          className="pr-10"
                          required
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                        />
                        <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-right">تأكيد كلمة المرور</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="أعد ادخال كلمة المرور"
                          className="pr-10"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    <Button type="submit" className="w-full bg-gradient-medical text-white shadow-medical hover:opacity-90" disabled={isLoading}>
                      {isLoading ? "جاري إنشاء الحساب..." : "إنشاء حساب جديد"}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      بإنشاء حساب، فإنك توافق على <Button variant="link" className="text-xs p-0 h-auto text-primary">الشروط والأحكام</Button> و <Button variant="link" className="text-xs p-0 h-auto text-primary">سياسة الخصوصية</Button>
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }} className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            تحتاج مساعدة؟ <Button variant="link" className="text-sm p-0 h-auto text-primary">تواصل معنا</Button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
