"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, User } from "lucide-react";

export default function PatientLogin() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-patient/10 flex items-center justify-center">
            <User className="h-6 w-6 text-patient" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
          Patient Portal
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Sign in to manage your appointments
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border-t-4 border-patient">
          <form className="space-y-6">
            <Input label="Email Address" type="email" placeholder="ali@example.com" />
            <Input label="Password" type="password" />

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link href="#" className="font-medium text-patient hover:text-patient-dark">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button variant="patient" className="w-full" size="lg">
              Sign In
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-slate-500">New here?</span>
              </div>
            </div>
            <div className="mt-6">
              <Link href="/auth/patient/signup">
                <Button variant="outline" className="w-full">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
