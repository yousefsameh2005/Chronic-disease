import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Clock, Phone } from "lucide-react";
import { useState } from "react";

const Doctors = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("الكل");

  const specialties = [
    "الكل", "القلب", "الأطفال", "النساء والولادة", "العظام", "الجلدية", "العيون", "الأنف والأذن"
  ];

  const doctors = [
    {
      id: 1,
      name: "د. أحمد محمد علي",
      specialty: "أخصائي القلب",
      location: "القاهرة - مدينة نصر",
      rating: 4.9,
      reviews: 150,
      price: "300 جنيه",
      nextAvailable: "اليوم 4:00 م",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400"
    },
    {
      id: 2,
      name: "د. فاطمة حسن",
      specialty: "أخصائية الأطفال",
      location: "الجيزة - الدقي",
      rating: 4.8,
      reviews: 200,
      price: "250 جنيه",
      nextAvailable: "غداً 10:00 ص",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400"
    },
    {
      id: 3,
      name: "د. محمود السيد",
      specialty: "أخصائي العظام",
      location: "الإسكندرية - سيدي جابر",
      rating: 4.7,
      reviews: 120,
      price: "400 جنيه",
      nextAvailable: "اليوم 6:00 م",
      image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400"
    },
    {
      id: 4,
      name: "د. نورا إبراهيم",
      specialty: "أخصائية النساء والولادة",
      location: "القاهرة - مصر الجديدة",
      rating: 4.9,
      reviews: 180,
      price: "350 جنيه",
      nextAvailable: "غداً 2:00 م",
      image: "https://plus.unsplash.com/premium_photo-1661685745163-eddd0d1da80d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      id: 5,
      name: "د. خالد عبدالله",
      specialty: "أخصائي الجلدية",
      location: "الجيزة - المهندسين",
      rating: 4.6,
      reviews: 90,
      price: "280 جنيه",
      nextAvailable: "اليوم 8:00 م",
      image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400"
    },
    {
      id: 6,
      name: "د. سارة أحمد",
      specialty: "أخصائية العيون",
      location: "القاهرة - الزمالك",
      rating: 4.8,
      reviews: 160,
      price: "320 جنيه",
      nextAvailable: "غداً 11:00 ص",
      image: "https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=400"
    }
  ];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.includes(searchTerm) || 
                         doctor.specialty.includes(searchTerm) ||
                         doctor.location.includes(searchTerm);
    const matchesSpecialty = selectedSpecialty === "الكل" || 
                            doctor.specialty.includes(selectedSpecialty);
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="min-h-screen bg-gradient-card">
      {/* Header */}
      <section className="bg-gradient-medical text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">أطباؤنا المتخصصون</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              احجز موعدك مع أفضل الأطباء المتخصصين في مختلف المجالات الطبية
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <Card className="p-6 shadow-card">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="ابحث عن طبيب أو تخصص أو منطقة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-12 text-right"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {specialties.map(specialty => (
                  <Button
                    key={specialty}
                    variant={selectedSpecialty === specialty ? "default" : "outline"}
                    onClick={() => setSelectedSpecialty(specialty)}
                    className={selectedSpecialty === specialty ? "bg-primary" : ""}
                  >
                    {specialty}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Doctors Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredDoctors.map((doctor, index) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full shadow-card hover:shadow-hover transition-all duration-300 overflow-hidden group">
                <div className="relative">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-primary text-white">
                      {doctor.specialty}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {doctor.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{doctor.location}</span>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{doctor.rating}</span>
                      <span className="text-sm text-muted-foreground">({doctor.reviews})</span>
                    </div>
                    <div className="text-lg font-bold text-primary">
                      {doctor.price}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-accent mb-6">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      متاح: {doctor.nextAvailable}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1 bg-gradient-medical text-white">
                      احجز موعد
                    </Button>
                    <Button variant="outline" size="icon">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* No Results */}
        {filteredDoctors.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              لم نجد أطباء مطابقين لبحثك
            </h3>
            <p className="text-muted-foreground mb-6">
              جرب البحث بكلمات مختلفة أو تغيير التخصص
            </p>
            <Button 
              onClick={() => {
                setSearchTerm("");
                setSelectedSpecialty("الكل");
              }}
              variant="outline"
            >
              إعادة تعيين البحث
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Doctors;