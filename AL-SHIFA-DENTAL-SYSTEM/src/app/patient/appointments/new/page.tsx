"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Check, Building2, MapPin, ChevronRight, ArrowLeft, Calendar, Search, Bot, Loader2, Send, User, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function NewAppointment() {
  const router = useRouter();
  const [mode, setMode] = useState<"selection" | "ai" | "manual">("selection");
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [countdown, setCountdown] = useState({ days: 0, hours: 2, mins: 45, secs: 0 });
  
  // Real Data States (Manual Mode)
  const [doctorList, setDoctorList] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  // Selection States (Manual Mode)
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedHospital, setSelectedHospital] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- AI CHAT STATES ---
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "agent", text: string, isUrgent?: boolean }[]>([
    { role: "agent", text: "Salam! I am Dr. AI. Please describe your symptoms or what you need help with." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Doctors from API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.get("/doctors");
        setDoctorList(response.data);
      } catch (error) {
        console.error("Failed to load doctors", error);
      } finally {
        setLoadingDocs(false);
      }
    };
    fetchDoctors();
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Filter Logic (Manual Mode)
  const locations = [...new Set(doctorList.map(d => d.location))]; 
  const hospitals = [...new Set(doctorList.filter(d => !selectedLocation || d.location === selectedLocation).map(d => d.hospital_name))];
  const filteredDoctors = doctorList.filter(d => 
    (!selectedLocation || d.location === selectedLocation) &&
    (!selectedHospital || d.hospital_name === selectedHospital) &&
    (d.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || d.specialization.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // --- API CALL: MANUAL BOOKING ---
  const handleConfirm = async () => {
    setIsSubmitting(true);
    const token = localStorage.getItem("token");
    
    if (!token) {
      alert("Please login first.");
      router.push("/auth/patient/login");
      return;
    }

    try {
      await api.post("/appointments", {
        doctor_id: selectedDoctor.id, 
        date: selectedDate, 
        time: selectedTime,
        reason: "Regular Checkup",
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const appointmentData = {
        doctor: selectedDoctor.full_name,
        treatment: "Dental Checkup",
        date: selectedDate,
        time: selectedTime,
      };
      localStorage.setItem("latestAppointment", JSON.stringify(appointmentData));
      setStep(6);

    } catch (error: any) {
      alert("Failed to book. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- API CALL: AI CHAT ---
  const handleChatSend = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput;
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setChatLoading(true);

    try {
      // Call the Appointment Agent
      const response = await api.post("/agent/appointment", {
        user_query: userMsg,
        session_id: "PATIENT_SESSION" // In real app, use actual session ID
      });

      const agentData = response.data;
      const isUrgent = agentData.action_taken === "triaged";

      setChatMessages(prev => [...prev, { 
        role: "agent", 
        text: agentData.response_text,
        isUrgent: isUrgent
      }]);

    } catch (error) {
      setChatMessages(prev => [...prev, { role: "agent", text: "I'm having trouble connecting to the clinic server. Please try manual booking." }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Countdown Timer
  useEffect(() => {
    if (step === 6) {
      const timer = setInterval(() => {
        setCountdown((prev) => ({ ...prev, secs: prev.secs === 0 ? 59 : prev.secs - 1 }));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step]);

  // Components
  const BackButton = ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} className="group flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm hover:border-patient hover:text-patient">
      <ArrowLeft className="h-5 w-5" />
    </button>
  );

  const Stepper = () => (
    <div className="w-full max-w-4xl mx-auto mb-12 px-4 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-10 rounded-full"></div>
        <div className="absolute top-1/2 left-0 h-1 bg-patient -z-10 rounded-full transition-all duration-500" style={{ width: `${((step - 1) / 5) * 100}%` }}></div>
        <div className="flex justify-between">
          {["Loc", "Hosp", "Doc", "Date", "Slot", "Done"].map((label, idx) => (
            <div key={idx} className={`flex flex-col items-center ${step > idx + 1 ? "text-patient" : "text-slate-300"}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 bg-white ${step === idx + 1 ? "border-patient text-patient" : step > idx + 1 ? "bg-patient border-patient text-white" : "border-slate-200"}`}>
                {step > idx + 1 ? <Check className="h-4 w-4"/> : idx + 1}
              </div>
            </div>
          ))}
        </div>
    </div>
  );

  // --- SCREEN 1: SELECTION MODE ---
  if (mode === "selection") {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center">
        <div className="max-w-4xl w-full grid md:grid-cols-2 gap-6">
           <div onClick={() => setMode("ai")} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl cursor-pointer border border-slate-200 hover:border-purple-500 transition-all text-center">
             <Bot className="h-12 w-12 mx-auto text-purple-600 mb-4" />
             <h3 className="text-xl font-bold">AI Match</h3>
             <p className="text-sm text-slate-500 mt-2">Describe symptoms, get matched.</p>
           </div>
           <div onClick={() => setMode("manual")} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl cursor-pointer border border-slate-200 hover:border-blue-500 transition-all text-center">
             <Calendar className="h-12 w-12 mx-auto text-blue-600 mb-4" />
             <h3 className="text-xl font-bold">Manual Booking</h3>
             <p className="text-sm text-slate-500 mt-2">Browse doctors & schedule.</p>
           </div>
        </div>
      </div>
    );
  }

  // --- SCREEN 2: AI CHAT (INTEGRATED) ---
  if (mode === "ai") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10 flex items-center gap-4">
          <BackButton onClick={() => setMode("selection")} />
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Bot className="h-5 w-5 text-purple-600" /> Dr. AI Assistant
            </h2>
            <p className="text-xs text-slate-500">Powered by Agentic AI</p>
          </div>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatScrollRef}>
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === "user" 
                  ? "bg-patient text-white rounded-br-none" 
                  : msg.isUrgent 
                    ? "bg-red-50 text-red-800 border border-red-200 rounded-bl-none" 
                    : "bg-white text-slate-700 border border-slate-200 rounded-bl-none"
              }`}>
                {msg.isUrgent && (
                  <div className="flex items-center gap-2 font-bold mb-2 text-red-600">
                    <AlertTriangle className="h-4 w-4" /> EMERGENCY ALERT
                  </div>
                )}
                {msg.text}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-slate-200 shadow-sm">
                <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white border-t border-slate-200">
          <div className="flex gap-2 max-w-4xl mx-auto">
            <input 
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              placeholder="Type your symptoms (e.g., 'Severe toothache')..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
            />
            <Button onClick={handleChatSend} className="h-12 w-12 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200" disabled={chatLoading}>
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- SCREEN 3: MANUAL WIZARD (UNCHANGED DESIGN) ---
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-20 bg-slate-50/90 backdrop-blur-sm px-6 py-4 border-b">
        <div className="max-w-3xl mx-auto flex gap-4 items-center">
          <BackButton onClick={() => step > 1 ? setStep(step-1) : setMode("selection")} />
          <h1 className="text-lg font-bold">New Appointment</h1>
        </div>
      </div>

      <div className="px-6 py-8">
        <Stepper />
        <div className="max-w-2xl mx-auto">
          
          {/* STEP 1: LOCATION */}
          {step === 1 && (
            <div className="space-y-4 animate-in slide-in-from-right">
               <h2 className="text-xl font-bold">Select Location</h2>
               {locations.length === 0 ? <p>No locations found.</p> : locations.map((loc: any) => (
                 <div key={loc} onClick={() => { setSelectedLocation(loc); setStep(2); }} className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border hover:border-patient cursor-pointer">
                   <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center"><MapPin className="h-5 w-5 text-slate-500"/></div>
                   <span className="font-bold flex-1">{loc}</span>
                   <ChevronRight className="text-slate-300"/>
                 </div>
               ))}
            </div>
          )}

          {/* STEP 2: HOSPITAL */}
          {step === 2 && (
            <div className="space-y-4 animate-in slide-in-from-right">
               <h2 className="text-xl font-bold">Select Hospital</h2>
               {hospitals.map((h: any) => (
                 <div key={h} onClick={() => { setSelectedHospital(h); setStep(3); }} className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border hover:border-patient cursor-pointer">
                   <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center"><Building2 className="h-5 w-5 text-slate-500"/></div>
                   <span className="font-bold flex-1">{h}</span>
                   <ChevronRight className="text-slate-300"/>
                 </div>
               ))}
            </div>
          )}

          {/* STEP 3: DOCTOR (REAL DATA) */}
          {step === 3 && (
            <div className="space-y-4 animate-in slide-in-from-right">
               <h2 className="text-xl font-bold">Select Specialist</h2>
               
               {/* Search Bar */}
               <div className="relative mb-4">
                 <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                 <input 
                   type="text" 
                   placeholder="Search doctor name..." 
                   className="w-full pl-10 p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-patient"
                   onChange={(e) => setSearchQuery(e.target.value)}
                 />
               </div>

               {loadingDocs ? <div className="text-center py-10"><Loader2 className="animate-spin h-8 w-8 mx-auto text-patient"/></div> : 
                filteredDoctors.length === 0 ? <div className="text-center p-4 text-slate-500">No doctors found here.</div> :
                filteredDoctors.map((d) => (
                 <div key={d.id} onClick={() => { setSelectedDoctor(d); setStep(4); }} className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border hover:border-blue-500 cursor-pointer group">
                   <div className="h-14 w-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl group-hover:scale-110 transition-transform">
                     {d.full_name.charAt(0)}
                   </div>
                   <div className="flex-1">
                     <div className="font-bold text-lg">{d.full_name}</div>
                     <div className="text-sm text-blue-600 font-medium">{d.specialization}</div>
                   </div>
                   <ChevronRight className="text-slate-300 group-hover:text-blue-600"/>
                 </div>
               ))}
            </div>
          )}

          {/* STEP 4: DATE */}
          {step === 4 && (
            <div className="text-center space-y-6 animate-in slide-in-from-right pt-4">
               <div className="h-20 w-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-600"><Calendar className="h-10 w-10"/></div>
               <h2 className="text-2xl font-bold">Pick a Date</h2>
               <input type="date" className="w-full p-4 text-xl text-center border rounded-2xl outline-none focus:border-patient" onChange={(e) => setSelectedDate(e.target.value)} />
               <Button className="w-full h-12 text-lg bg-patient hover:bg-patient-dark" onClick={() => selectedDate ? setStep(5) : alert("Select date")}>Continue</Button>
            </div>
          )}

          {/* STEP 5: SLOT */}
          {step === 5 && (
             <div className="space-y-6 animate-in slide-in-from-right">
               <h2 className="text-xl font-bold">Select Time</h2>
               <div className="grid grid-cols-3 gap-3">
                 {["10:00 AM", "11:30 AM", "01:00 PM", "02:30 PM", "04:00 PM"].map(t => (
                   <button key={t} disabled={isSubmitting} onClick={() => { setSelectedTime(t); handleConfirm(); }} className="p-4 rounded-xl border hover:bg-patient hover:text-white transition-all font-medium disabled:opacity-50">
                     {isSubmitting && selectedTime === t ? <Loader2 className="animate-spin mx-auto"/> : t}
                   </button>
                 ))}
               </div>
             </div>
          )}

          {/* STEP 6: SUCCESS */}
          {step === 6 && (
            <div className="text-center py-10 animate-in zoom-in">
              <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600"><Check className="h-12 w-12"/></div>
              <h2 className="text-3xl font-bold text-slate-900">Booked!</h2>
              <p className="text-slate-500 mt-2">Appointment confirmed with {selectedDoctor?.full_name}</p>
              <Button onClick={() => router.push('/patient/dashboard')} variant="outline" className="mt-8">Go to Dashboard</Button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}