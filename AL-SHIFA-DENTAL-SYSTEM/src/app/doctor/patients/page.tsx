"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, FileText, ChevronRight } from "lucide-react";

export default function PatientList() {
  const patients = [
    { id: 1, name: "Ali Khan", age: 34, lastVisit: "12 Dec 2024", condition: "Root Canal", status: "Active" },
    { id: 2, name: "Sara Ahmed", age: 28, lastVisit: "10 Nov 2024", condition: "Scaling", status: "Completed" },
    { id: 3, name: "Usman Ghani", age: 45, lastVisit: "05 Oct 2024", condition: "Extraction", status: "Active" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Patient Directory</h1>
        <Button variant="doctor">
          <Plus className="mr-2 h-4 w-4" /> New Patient
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input placeholder="Search by name, phone, or MRN..." className="pl-10" />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      {/* Patients Table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-medium text-slate-600">Name</th>
                <th className="p-4 font-medium text-slate-600">Age</th>
                <th className="p-4 font-medium text-slate-600">Last Visit</th>
                <th className="p-4 font-medium text-slate-600">Condition</th>
                <th className="p-4 font-medium text-slate-600">Status</th>
                <th className="p-4 font-medium text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-4 font-medium text-slate-900">{p.name}</td>
                  <td className="p-4 text-slate-500">{p.age}</td>
                  <td className="p-4 text-slate-500">{p.lastVisit}</td>
                  <td className="p-4 text-slate-500">{p.condition}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      p.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <Link href={`/doctor/patients/${p.id}`}>
                      <Button variant="ghost" size="sm" className="text-doctor">
                        View <ChevronRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
