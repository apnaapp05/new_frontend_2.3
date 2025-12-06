"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Stethoscope } from "lucide-react";

export default function DoctorLogin() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-doctor flex items-center justify-center">
            <Stethoscope className="h-6 w-6 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
          Doctor Portal
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Secure access for medical staff
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border-t-4 border-doctor">
          <form className="space-y-6">
            <Input label="Professional Email" type="email" placeholder="dr.name@clinic.com" />
            <Input label="Password" type="password" />

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-doctor focus:ring-doctor"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                {/* --- UPDATED LINK HERE --- */}
                <Link 
                  href="/auth/doctor/forgot-password" 
                  className="font-medium text-doctor hover:text-doctor-dark hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Link href="/doctor/dashboard">
              <Button variant="doctor" className="w-full" size="lg">
                Sign In
              </Button>
            </Link>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-slate-500">Not registered?</span>
              </div>
            </div>
            <div className="mt-6">
              <Link href="/auth/doctor/signup">
                <Button variant="outline" className="w-full">
                  Apply for Verification
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}