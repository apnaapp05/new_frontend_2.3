import json
from datetime import date, timedelta
from typing import List, Optional, Dict
from pydantic import BaseModel

# --- 1. STRUCTURED I/O (Pydantic Models) ---
class InventoryInput(BaseModel):
    user_query: str
    item_id: Optional[str] = None

class InventoryResponse(BaseModel):
    response_text: str
    alert_level: str  # "Critical", "Warning", "Stable"
    action_suggested: str # "Reorder", "None", "Check Expiry"

# --- 2. KNOWLEDGE GRAPH MEMORY (GraphRAG) ---
# Implementing Star Graph Topology for high-precision retrieval
class SupplyChainGraph:
    def __init__(self):
        # Central Nodes: Inventory Items
        # Satellite Nodes: Suppliers, Batches, Usage Stats
        self.graph = {
            "ITEM_001": {
                "name": "Lidocaine Injection",
                "stock": 12,
                "threshold": 20,
                "supplier": "MediSupply Corp",
                "batches": [
                    {"batch_id": "B-901", "expiry": "2024-12-30", "qty": 2},
                    {"batch_id": "B-905", "expiry": "2025-06-01", "qty": 10}
                ],
                "usage_rate": 2.5 # units per day (avg)
            },
            "ITEM_002": {
                "name": "Dental Gloves (Box)",
                "stock": 45,
                "threshold": 10,
                "supplier": "SafeHands Ltd",
                "batches": [
                    {"batch_id": "G-202", "expiry": "2026-01-01", "qty": 45}
                ],
                "usage_rate": 1.0
            }
        }

    def query_graph(self, item_name_query: str) -> dict:
        """
        Graph Traversal: Finds the node where 'name' matches the query.
        Returns the full star cluster (Central Node + Satellites).
        """
        for item_id, data in self.graph.items():
            if item_name_query.lower() in data["name"].lower():
                return data
        return None

# --- 3. THE AGENT CLASS (ReAct Pattern) ---
class InventoryAgent:
    def __init__(self):
        self.name = "SupplyChain Bot"
        self.memory = SupplyChainGraph()

    # --- TOOLS ---
    def _calculate_runout_days(self, stock: int, rate: float) -> int:
        if rate == 0: return 999
        return int(stock / rate)

    # --- REASONING ENGINE ---
    def process_request(self, input_data: InventoryInput) -> InventoryResponse:
        query = input_data.user_query.lower()
        
        # Step 1: ENTITY EXTRACTION (Simulated)
        # Identify which item the user is talking about
        target_item = None
        if "lidocaine" in query: target_item = "Lidocaine"
        elif "gloves" in query: target_item = "Gloves"
        
        # Step 2: GRAPH LOOKUP (Information Retrieval)
        if target_item:
            node_data = self.memory.query_graph(target_item)
            if not node_data:
                return InventoryResponse(response_text=f"Item '{target_item}' not found in Knowledge Graph.", alert_level="Stable", action_suggested="None")
            
            # Context Enrichment (from GraphRAG logic)
            stock = node_data["stock"]
            supplier = node_data["supplier"]
            threshold = node_data["threshold"]
            
            # Step 3: ANALYTICAL REASONING
            
            # Scenario A: Stock Check / Alert
            if any(w in query for w in ["stock", "have", "check", "status", "inventory"]):
                status = "Stable"
                action = "None"
                msg = f"We have {stock} units of {node_data['name']}."
                
                if stock < threshold:
                    status = "Critical"
                    action = "Reorder"
                    msg += f" ⚠️ WARNING: This is below the reorder level of {threshold}."
                
                return InventoryResponse(response_text=msg, alert_level=status, action_suggested=action)

            # Scenario B: Supplier/Batch Query (Graph Specific)
            if any(w in query for w in ["supplier", "who", "from", "batch", "expiry"]):
                msg = f"{node_data['name']} is supplied by **{supplier}**."
                if "expiry" in query or "batch" in query:
                    batches = ", ".join([f"{b['batch_id']} (Exp: {b['expiry']})" for b in node_data['batches']])
                    msg += f" Current batches: {batches}."
                return InventoryResponse(response_text=msg, alert_level="Stable", action_suggested="None")

            # Scenario C: Predictive Analysis (Agentic Feature)
            if any(w in query for w in ["last", "enough", "predict", "run out", "days"]):
                days_left = self._calculate_runout_days(stock, node_data["usage_rate"])
                msg = f"At current usage rate ({node_data['usage_rate']}/day), {node_data['name']} will run out in approx **{days_left} days**."
                if days_left < 7:
                    msg += " You should reorder this week."
                return InventoryResponse(response_text=msg, alert_level="Warning" if days_left < 7 else "Stable", action_suggested="Check")

        # Fallback
        return InventoryResponse(
            response_text="I can track inventory, suppliers, and predict shortages. Ask me 'Do we have enough Lidocaine?'",
            alert_level="Stable",
            action_suggested="None"
        )

# --- 4. TESTING BLOCK ---
if __name__ == "__main__":
    agent = InventoryAgent()
    print("📦 Al-Shifa Supply Chain Agent (GraphRAG Enabled) Online...")
    
    # Test 1: Critical Stock Alert
    print("\n--- Test 1: Stock Check ---")
    req1 = InventoryInput(user_query="Check status of Lidocaine")
    res1 = agent.process_request(req1)
    print(f"Agent: {res1.response_text}")

    # Test 2: Predictive Analysis
    print("\n--- Test 2: Prediction ---")
    req2 = InventoryInput(user_query="Do we have enough Lidocaine for the next week?")
    res2 = agent.process_request(req2)
    print(f"Agent: {res2.response_text}")

    # Test 3: Graph Traversal (Supplier Info)
    print("\n--- Test 3: Supplier Lookup ---")
    req3 = InventoryInput(user_query="Who is the supplier for Gloves?")
    res3 = agent.process_request(req3)
    print(f"Agent: {res3.response_text}")