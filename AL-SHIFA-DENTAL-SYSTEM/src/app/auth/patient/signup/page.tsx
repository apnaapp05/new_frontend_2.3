"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function PatientSignup() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold text-slate-900">Create Patient Account</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border-t-4 border-patient">
          <form className="space-y-4">
            <Input label="Full Name" placeholder="John Doe" />
            <Input label="Email" type="email" />
            <div className="grid grid-cols-2 gap-4">
               <Input label="Age" type="number" placeholder="25" />
               <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700">Gender</label>
                 <select className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-patient/50 focus:outline-none">
                   <option>Male</option>
                   <option>Female</option>
                   <option>Other</option>
                 </select>
               </div>
            </div>
            <Input label="Password" type="password" />
            
            <Button variant="patient" className="w-full mt-4" size="lg">
              Register
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account? <Link href="/auth/patient/login" className="text-patient font-bold">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
