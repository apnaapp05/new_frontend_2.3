"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, User, ChevronLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

// Mock Data
const doctors = [
  { id: 1, name: "Dr. Sarah Ahmed", spec: "Orthodontist", exp: "8 Yrs" },
  { id: 2, name: "Dr. Bilal Karim", spec: "Surgeon", exp: "12 Yrs" },
];
const slots = ["10:00 AM", "10:30 AM", "11:00 AM", "02:00 PM", "02:30 PM"];

export default function NewAppointment() {
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col">
      
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/patient/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">New Appointment</h1>
          <p className="text-xs text-slate-500">Step {step} of 3</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-slate-200 rounded-full mb-8">
        <div 
          className="h-full bg-patient rounded-full transition-all duration-300" 
          style={{ width: `${(step / 3) * 100}%` }}
        ></div>
      </div>

      <div className="flex-1">
        
        {/* STEP 1: Select Doctor */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-lg font-semibold mb-4">Select a Specialist</h2>
            {doctors.map((doc) => (
              <Card 
                key={doc.id}
                onClick={() => setSelectedDoctor(doc.id)}
                className={`cursor-pointer transition-all p-4 flex items-center gap-4 hover:shadow-md ${selectedDoctor === doc.id ? 'border-patient ring-1 ring-patient bg-patient/5' : 'border-slate-200'}`}
              >
                <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center">
                  <User className="h-6 w-6 text-slate-500" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{doc.name}</h3>
                  <p className="text-xs text-slate-500">{doc.spec} • {doc.exp} Experience</p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* STEP 2: Date & Time */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div>
               <h2 className="text-lg font-semibold mb-2">Select Date</h2>
               <input 
                 type="date" 
                 className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-patient outline-none"
                 onChange={(e) => setSelectedDate(e.target.value)}
               />
            </div>
            
            <div>
               <h2 className="text-lg font-semibold mb-2">Available Slots</h2>
               <div className="grid grid-cols-3 gap-3">
                 {slots.map((slot) => (
                   <button
                     key={slot}
                     onClick={() => setSelectedSlot(slot)}
                     className={`py-2 px-1 text-sm rounded-lg border ${selectedSlot === slot ? 'bg-patient text-white border-patient' : 'bg-white text-slate-700 border-slate-200 hover:border-patient'}`}
                   >
                     {slot}
                   </button>
                 ))}
               </div>
            </div>
          </div>
        )}

        {/* STEP 3: Summary */}
        {step === 3 && (
          <div className="text-center animate-in fade-in zoom-in-95 space-y-6">
            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Confirm Booking?</h2>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 text-left space-y-3 shadow-sm">
               <div className="flex justify-between">
                 <span className="text-slate-500 text-sm">Doctor</span>
                 <span className="font-medium">{doctors.find(d => d.id === selectedDoctor)?.name}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-slate-500 text-sm">Date</span>
                 <span className="font-medium">{selectedDate}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-slate-500 text-sm">Time</span>
                 <span className="font-medium">{selectedSlot}</span>
               </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer Navigation */}
      <div className="pt-6 mt-4 border-t border-slate-100">
        <Button 
          className="w-full" 
          variant="patient" 
          size="lg"
          disabled={
            (step === 1 && !selectedDoctor) || 
            (step === 2 && (!selectedDate || !selectedSlot))
          }
          onClick={() => {
            if (step < 3) setStep(step + 1);
            else alert("Booking Confirmed! (Backend to be connected)");
          }}
        >
          {step === 3 ? "Confirm Appointment" : "Continue"}
        </Button>
      </div>

    </div>
  );
}
