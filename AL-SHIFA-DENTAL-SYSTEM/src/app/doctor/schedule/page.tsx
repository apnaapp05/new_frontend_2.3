import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function SchedulePage() {
  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "01:00", "02:00", "03:00", "04:00"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Weekly Schedule</h1>
        <Button variant="doctor">
          <Plus className="mr-2 h-4 w-4" /> Block Slot
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monday, 12th Dec</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {timeSlots.map((time) => (
              <div key={time} className="flex border-b border-slate-100 last:border-0 h-16 group hover:bg-slate-50 transition-colors">
                <div className="w-24 border-r border-slate-100 p-4 text-sm text-slate-500 font-mono">
                  {time}
                </div>
                <div className="flex-1 p-2">
                  {/* Mock Logic for filled slots */}
                  {time === "10:00" ? (
                    <div className="bg-blue-100 border-l-4 border-blue-500 p-2 rounded text-sm text-blue-700 w-full h-full flex items-center justify-between">
                      <span className="font-bold">Root Canal - Ali Khan</span>
                      <span className="text-xs bg-white/50 px-2 py-1 rounded">Confirmed</span>
                    </div>
                  ) : time === "01:00" ? (
                     <div className="bg-gray-100 border-l-4 border-gray-400 p-2 rounded text-sm text-gray-600 w-full h-full flex items-center">
                      <span className="font-bold">Lunch Break</span>
                    </div>
                  ) : (
                    <div className="w-full h-full opacity-0 group-hover:opacity-100 flex items-center justify-center">
                       <Button variant="ghost" size="sm" className="text-slate-400">+ Add</Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
