"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileBadge, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function DoctorSignup() {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side - Information */}
        <div className="bg-doctor p-8 md:w-1/3 text-white flex flex-col justify-between hidden md:flex">
          <div>
            <ShieldCheck className="h-12 w-12 mb-4" />
            <h3 className="text-xl font-bold">Partner with Al-Shifa</h3>
            <p className="mt-4 text-doctor-light text-sm">
              Join the most advanced dental AI network. We verify every practitioner to ensure patient trust.
            </p>
          </div>
          <div className="text-xs text-doctor-light/70">
            © 2025 Al-Shifa Clinical
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="p-8 md:w-2/3">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Doctor Registration</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <Input label="First Name" />
               <Input label="Last Name" />
            </div>
            <Input label="Professional Email" type="email" />
            <Input label="Hospital/Clinic Name" placeholder="e.g. City Dental Care" />
            
            {/* e-KYC Upload Section */}
            <div className="space-y-2 pt-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <FileBadge className="h-4 w-4 text-doctor" /> 
                Medical License (e-KYC)
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.png"
                />
                <Upload className="h-8 w-8 text-slate-400 mb-2" />
                <p className="text-sm text-slate-600 font-medium">
                  {fileName ? fileName : "Click to upload License"}
                </p>
                <p className="text-xs text-slate-400">PDF, JPG up to 5MB</p>
              </div>
            </div>

            <Input label="Password" type="password" />
            
            <Button variant="doctor" className="w-full mt-6" size="lg">
              Submit for Verification
            </Button>
          </form>
          
          <p className="mt-4 text-center text-xs text-slate-500">
            By registering, you agree to our strict <a href="#" className="underline">Professional Standards</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
