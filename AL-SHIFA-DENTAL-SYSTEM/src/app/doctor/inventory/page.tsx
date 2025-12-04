import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, PackagePlus } from "lucide-react";

export default function InventoryPage() {
  const inventory = [
    { id: 1, name: "Lidocaine Injection", stock: 12, reorder: 20, status: "Critical" },
    { id: 2, name: "Dental Gloves (Box)", stock: 45, reorder: 10, status: "Good" },
    { id: 3, name: "Composite Resin", stock: 8, reorder: 15, status: "Low" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
        <Button variant="doctor">
          <PackagePlus className="mr-2 h-4 w-4" /> Add Stock
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-red-50 border-red-100">
           <CardContent className="pt-6 flex items-center gap-4">
             <AlertTriangle className="h-8 w-8 text-red-600" />
             <div>
               <p className="text-2xl font-bold text-red-700">2 Items</p>
               <p className="text-xs text-red-600">Critical Stock Level</p>
             </div>
           </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-100">
           <CardContent className="pt-6 flex items-center gap-4">
             <CheckCircle className="h-8 w-8 text-green-600" />
             <div>
               <p className="text-2xl font-bold text-green-700">45 Items</p>
               <p className="text-xs text-green-600">Healthy Stock</p>
             </div>
           </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Stock List</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3">Item Name</th>
                <th className="p-3">Current Stock</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="p-3 font-medium">{item.name}</td>
                  <td className="p-3">{item.stock}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      item.status === 'Critical' ? 'bg-red-100 text-red-700' :
                      item.status === 'Low' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <Button variant="ghost" size="sm" className="text-blue-600">Update</Button>
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
