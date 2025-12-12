"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileBadge, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function DoctorSignup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    hospital_name: "",
    password: "",
    license_number: "PENDING-KYC", // Default for now
    specialization: "General Dentist" // Default or Add Dropdown later
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/register", {
        email: formData.email,
        password: formData.password,
        full_name: `${formData.firstName} ${formData.lastName}`,
        role: "doctor",
        hospital_name: formData.hospital_name,
        specialization: formData.specialization,
        license_number: formData.license_number
      });

      // Success -> Redirect to Login
      router.push("/auth/doctor/login");

    } catch (err: any) {
      console.error(err);
      if (err.response) {
        setError(err.response.data.detail || "Registration failed.");
      } else {
        setError("Server unavailable.");
      }
    } finally {
      setLoading(false);
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
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleRegister}>
            <div className="grid grid-cols-2 gap-4">
               <Input 
                 label="First Name" 
                 name="firstName" 
                 onChange={handleChange} 
                 required 
               />
               <Input 
                 label="Last Name" 
                 name="lastName" 
                 onChange={handleChange} 
                 required 
               />
            </div>
            <Input 
              label="Professional Email" 
              type="email" 
              name="email" 
              onChange={handleChange} 
              required 
            />
            <Input 
              label="Hospital/Clinic Name" 
              name="hospital_name" 
              placeholder="e.g. City Dental Care" 
              onChange={handleChange} 
              required 
            />
            
            {/* e-KYC Upload Section (Visual Only for now) */}
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

            <Input 
              label="Password" 
              type="password" 
              name="password" 
              onChange={handleChange} 
              required 
            />
            
            <Button variant="doctor" className="w-full mt-6" size="lg" disabled={loading}>
              {loading ? <Loader2 className="animate-spin h-5 w-5"/> : "Submit for Verification"}
            </Button>
          </form>
          
          <p className="mt-4 text-center text-xs text-slate-500">
            Already registered? <Link href="/auth/doctor/login" className="text-doctor font-bold underline">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}