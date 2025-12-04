import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, AlertTriangle, Clock } from "lucide-react";

export default function DoctorDashboard() {
  return (
    <div className="space-y-6">
      
      {/* KPI Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-doctor">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Patients (Today)</CardTitle>
            <Users className="h-4 w-4 text-doctor" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-slate-500">+2 from yesterday</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Revenue (Month)</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$4,250</div>
            <p className="text-xs text-slate-500">+18% from last month</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pending Reports</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-slate-500">Needs review</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Critical Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-slate-500">Items below reorder level</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Left: Patient Queue */}
        <Card className="col-span-4 shadow-md">
          <CardHeader>
            <CardTitle>Today's Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Ali Khan", time: "10:00 AM", type: "Root Canal", status: "In Progress" },
                { name: "Fatima Bibi", time: "10:45 AM", type: "Checkup", status: "Waiting" },
                { name: "John Doe", time: "11:30 AM", type: "Extraction", status: "Confirmed" },
              ].map((patient, i) => (
                <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{patient.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{patient.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{patient.time}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      patient.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                      patient.status === 'Waiting' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {patient.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right: AI Insights Feed */}
        <Card className="col-span-3 bg-slate-50 border-dashed border-2 border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              AI Insights Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                <p className="text-sm text-slate-800 font-medium">⚠️ Inventory Alert</p>
                <p className="text-xs text-slate-500 mt-1">
                  Lidocaine stock is projected to run out by Tuesday based on current appointment volume.
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                <p className="text-sm text-slate-800 font-medium">🕒 Smart Reschedule</p>
                <p className="text-xs text-slate-500 mt-1">
                  Patient "Usman" cancelled. Suggest moving "Ahmed" to 02:00 PM slot?
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
