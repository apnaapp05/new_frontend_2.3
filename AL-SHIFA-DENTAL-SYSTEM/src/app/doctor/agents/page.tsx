import { Card, CardContent } from "@/components/ui/card";
import { Bot, Activity, BrainCircuit, Database, DollarSign, Clock } from "lucide-react";

export default function AgentsStatus() {
  const agents = [
    { name: "Appointment Agent", status: "Active", load: "Low", icon: Clock, color: "text-blue-600", desc: "Handling bookings & rescheduling." },
    { name: "Inventory Agent", status: "Processing", load: "High", icon: Database, color: "text-red-600", desc: "Analyzing stock levels." },
    { name: "Revenue Agent", status: "Active", load: "Medium", icon: DollarSign, color: "text-green-600", desc: "Tracking payments & invoices." },
    { name: "Case Tracking Agent", status: "Standby", load: "None", icon: BrainCircuit, color: "text-purple-600", desc: "Updating patient histories." },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">AI Agent Network Status</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        {agents.map((agent) => (
          <Card key={agent.name} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className={`h-14 w-14 rounded-xl bg-slate-50 flex items-center justify-center ${agent.color}`}>
                    <agent.icon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{agent.name}</h3>
                    <p className="text-sm text-slate-500">{agent.desc}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  agent.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 
                  agent.status === 'Processing' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                  'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {agent.status}
                </span>
              </div>
              
              <div className="mt-6 flex items-center justify-between text-sm">
                 <span className="text-slate-500">System Load: <span className="font-medium text-slate-900">{agent.load}</span></span>
                 <Activity className="h-4 w-4 text-slate-300 animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}