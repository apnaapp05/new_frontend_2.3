import json
from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel

# --- 1. STRUCTURED I/O ---
class FinanceInput(BaseModel):
    user_query: str
    role: str = "doctor"  # Security: Only doctors/admins can access

class FinanceResponse(BaseModel):
    response_text: str
    data: Optional[Dict] = None
    action_taken: str

# --- 2. KNOWLEDGE GRAPH MEMORY (GraphRAG) ---
# Topology: Star Graph centered on INVOICE nodes
class FinancialGraph:
    def __init__(self):
        self.graph = {
            "INV_1001": {
                "id": "INV_1001",
                "patient_id": "PAT_89201",
                "patient_name": "Ali Khan",
                "procedure": "Root Canal",
                "amount": 5000,
                "status": "Paid",
                "date": "2024-12-01"
            },
            "INV_1002": {
                "id": "INV_1002",
                "patient_id": "PAT_89202",
                "patient_name": "Sara Ahmed",
                "procedure": "Scaling",
                "amount": 2000,
                "status": "Pending",
                "date": "2024-12-05"
            },
            "INV_1003": {
                "id": "INV_1003",
                "patient_id": "PAT_89203",
                "patient_name": "Usman Ghani",
                "procedure": "Root Canal",
                "amount": 5000,
                "status": "Pending",
                "date": "2024-12-10"
            }
        }

    def query_invoices(self, status: Optional[str] = None, procedure: Optional[str] = None) -> List[dict]:
        """
        Graph Traversal: Filters invoice nodes based on connected attributes.
        """
        results = []
        for inv_id, data in self.graph.items():
            match = True
            if status and data["status"].lower() != status.lower():
                match = False
            if procedure and procedure.lower() not in data["procedure"].lower():
                match = False
            
            if match:
                results.append(data)
        return results

# --- 3. THE AGENT CLASS (ReAct Pattern) ---
class RevenueAgent:
    def __init__(self):
        self.name = "Finance Controller"
        self.memory = FinancialGraph()

    # --- TOOLS ---
    def _calculate_total(self, invoices: List[dict]) -> int:
        return sum(item['amount'] for item in invoices)

    # --- REASONING ENGINE ---
    def process_request(self, input_data: FinanceInput) -> FinanceResponse:
        query = input_data.user_query.lower()
        
        # Security Check
        if input_data.role != "doctor":
            return FinanceResponse(response_text="⛔ Access Denied. Financial data is restricted.", action_taken="blocked")

        # Intent A: Revenue Reports (Total Earned)
        if any(w in query for w in ["revenue", "earned", "income", "total", "made"]):
            # Filter logic (GraphRAG can filter by procedure too)
            target_proc = "root canal" if "root canal" in query else None
            
            # 1. Fetch Paid Invoices
            paid_invoices = self.memory.query_invoices(status="Paid", procedure=target_proc)
            
            # 2. Calculate
            total = self._calculate_total(paid_invoices)
            
            context = f" from {target_proc}s" if target_proc else ""
            return FinanceResponse(
                response_text=f"💰 Total Revenue Collected{context}: **Rs. {total}**.",
                action_taken="report_generated",
                data={"total": total, "count": len(paid_invoices)}
            )

        # Intent B: Outstanding / Pending Bills
        if any(w in query for w in ["pending", "unpaid", "due", "owe", "outstanding"]):
            # 1. Fetch Pending
            pending_invoices = self.memory.query_invoices(status="Pending")
            
            # 2. Format Response
            if not pending_invoices:
                return FinanceResponse(response_text="✅ No pending invoices. All clear.", action_taken="lookup")
            
            total_pending = self._calculate_total(pending_invoices)
            details = "\n".join([f"- {inv['patient_name']}: Rs. {inv['amount']} ({inv['procedure']})" for inv in pending_invoices])
            
            return FinanceResponse(
                response_text=f"⚠️ **Pending Invoices:**\n{details}\n\n**Total Outstanding:** Rs. {total_pending}",
                action_taken="alert",
                data={"pending_list": pending_invoices}
            )

        # Fallback
        return FinanceResponse(
            response_text="I can track Revenue and Pending Invoices. Try asking 'Who has unpaid bills?'.",
            action_taken="none"
        )

# --- 4. TESTING BLOCK ---
if __name__ == "__main__":
    agent = RevenueAgent()
    print("💰 Al-Shifa Finance Agent Online...")
    
    # Test 1: Pending Bills
    print("\n--- Test 1: Pending Lookup ---")
    req1 = FinanceInput(user_query="Who has pending bills?")
    res1 = agent.process_request(req1)
    print(f"Agent: {res1.response_text}")

    # Test 2: Specific Revenue Query (Graph Logic)
    print("\n--- Test 2: Revenue from Root Canals ---")
    req2 = FinanceInput(user_query="How much revenue made from Root Canals?")
    res2 = agent.process_request(req2)
    print(f"Agent: {res2.response_text}")