import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Download } from "lucide-react";

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Financial Overview</h1>
      
      {/* Revenue Card */}
      <Card className="bg-slate-900 text-white">
        <CardContent className="pt-6">
           <div className="flex justify-between items-start">
             <div>
               <p className="text-slate-400 text-sm">Total Revenue (Dec)</p>
               <h2 className="text-4xl font-bold mt-2">$12,450</h2>
             </div>
             <div className="bg-white/10 p-3 rounded-full">
               <DollarSign className="h-6 w-6 text-green-400" />
             </div>
           </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Invoices</CardTitle></CardHeader>
        <CardContent>
           <table className="w-full text-sm text-left">
             <thead className="text-slate-500">
               <tr>
                 <th className="p-2">Invoice ID</th>
                 <th className="p-2">Patient</th>
                 <th className="p-2">Amount</th>
                 <th className="p-2">Status</th>
                 <th className="p-2">Action</th>
               </tr>
             </thead>
             <tbody className="divide-y">
               <tr className="py-2">
                 <td className="p-2 font-mono">#INV-001</td>
                 <td className="p-2">Ali Khan</td>
                 <td className="p-2 font-bold">$150.00</td>
                 <td className="p-2 text-green-600">Paid</td>
                 <td className="p-2"><Download className="h-4 w-4 text-slate-400 cursor-pointer" /></td>
               </tr>
               <tr className="py-2">
                 <td className="p-2 font-mono">#INV-002</td>
                 <td className="p-2">Sara Ahmed</td>
                 <td className="p-2 font-bold">$80.00</td>
                 <td className="p-2 text-yellow-600">Pending</td>
                 <td className="p-2"><Download className="h-4 w-4 text-slate-400 cursor-pointer" /></td>
               </tr>
             </tbody>
           </table>
        </CardContent>
      </Card>
    </div>
  );
}
