"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Plus, FileText, Phone } from "lucide-react";

export default function PatientDashboard() {
  // Mock Data: In Phase B (Backend), this will come from API
  const nextAppointment = {
    doctor: "Dr. Sarah Ahmed",
    treatment: "Root Canal Follow-up",
    date: "Tomorrow",
    time: "10:30 AM"
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-patient p-6 pb-12 text-white rounded-b-3xl shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-patient-light text-sm font-medium">As-salāmu ʿalaykum,</p>
            <h1 className="text-2xl font-bold">Ali Khan</h1>
          </div>
          <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
             <span className="font-bold">AK</span>
          </div>
        </div>
      </header>

      <div className="px-6 -mt-8 space-y-6">
        
        {/* Hero Card: Next Appointment */}
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-slate-500 text-xs uppercase tracking-wider">Up Next</CardTitle>
          </CardHeader>
          <CardContent>
            {nextAppointment ? (
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{nextAppointment.treatment}</h3>
                  <div className="flex items-center text-slate-500 text-sm mt-1">
                    <Calendar className="h-3 w-3 mr-1" /> {nextAppointment.date}
                    <span className="mx-2">•</span>
                    <Clock className="h-3 w-3 mr-1" /> {nextAppointment.time}
                  </div>
                  <p className="text-xs text-patient font-medium mt-2">{nextAppointment.doctor}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-patient/10 flex items-center justify-center text-patient font-bold">
                  24h
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-slate-500">No upcoming appointments.</p>
                <Button variant="link" className="text-patient">Book Now</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Grid */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/patient/appointments/new">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-2 hover:border-patient transition-colors cursor-pointer h-32">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Plus className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-slate-700">Book Appt</span>
              </div>
            </Link>
            
            <Link href="#">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-2 hover:border-patient transition-colors cursor-pointer h-32">
                <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                  <FileText className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-slate-700">My Records</span>
              </div>
            </Link>

            <Link href="#">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-2 hover:border-patient transition-colors cursor-pointer h-32">
                <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <Phone className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-slate-700">Call Clinic</span>
              </div>
            </Link>
          </div>
        </div>

        {/* AI Health Tip */}
        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
          <div className="flex gap-3">
             <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">AI</div>
             <div>
               <h4 className="text-sm font-bold text-indigo-900">Did you know?</h4>
               <p className="text-xs text-indigo-700 mt-1">
                 You haven't had a cleaning in 6 months. Regular cleaning prevents 90% of gum diseases.
               </p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
