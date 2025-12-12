import json
from typing import List, Optional, Dict
from pydantic import BaseModel

# --- 1. STRUCTURED I/O ---
class CaseInput(BaseModel):
    user_query: str
    patient_id: Optional[str] = None

class CaseResponse(BaseModel):
    response_text: str
    case_status: str  # "Active", "Completed", "On Hold"
    next_step: Optional[str] = None

# --- 2. KNOWLEDGE GRAPH MEMORY (GraphRAG) ---
# Topology: Star Graph centered on TREATMENT_CASE nodes
class ClinicalGraph:
    def __init__(self):
        self.graph = {
            "PAT_89201": { # Ali Khan
                "name": "Ali Khan",
                "active_cases": [
                    {
                        "case_id": "CASE_501",
                        "type": "Ceramic Crown (Tooth 14)",
                        "stage": "Lab Processing",
                        "start_date": "2024-12-01",
                        "lab_order_id": "LAB_9901",
                        "next_milestone": "Cementation"
                    }
                ]
            },
            "PAT_89202": { # Sara Ahmed
                "name": "Sara Ahmed",
                "active_cases": [
                    {
                        "case_id": "CASE_502",
                        "type": "Orthodontic Aligners",
                        "stage": "Initial Impression",
                        "start_date": "2024-12-10",
                        "lab_order_id": "None",
                        "next_milestone": "Treatment Plan Review"
                    }
                ]
            }
        }

    def query_cases(self, patient_name_query: str) -> List[dict]:
        """
        Graph Traversal: Finds Patient Node -> Traverses to Active Case Nodes.
        """
        results = []
        for pat_id, data in self.graph.items():
            if patient_name_query.lower() in data["name"].lower():
                # Context Enrichment: Add patient name to case data
                for case in data["active_cases"]:
                    case_with_context = case.copy()
                    case_with_context["patient_name"] = data["name"]
                    results.append(case_with_context)
        return results

# --- 3. THE AGENT CLASS (ReAct Pattern) ---
class CaseTrackingAgent:
    def __init__(self):
        self.name = "Clinical Case Manager"
        self.memory = ClinicalGraph()

    # --- TOOLS ---
    def _check_lab_status(self, order_id: str) -> str:
        # Mock External Lab API
        mock_lab_db = {
            "LAB_9901": "Shipped (Arriving Tomorrow)",
            "LAB_9902": "Processing"
        }
        return mock_lab_db.get(order_id, "Order Not Found")

    # --- REASONING ENGINE ---
    def process_request(self, input_data: CaseInput) -> CaseResponse:
        query = input_data.user_query.lower()
        
        # Step 1: ENTITY EXTRACTION
        # Identify Patient Name from query
        target_patient = None
        if "ali" in query: target_patient = "Ali"
        elif "sara" in query: target_patient = "Sara"
        
        if not target_patient:
            return CaseResponse(
                response_text="Please specify a patient name. Example: 'Status of Ali's crown?'",
                case_status="Unknown"
            )

        # Step 2: GRAPH LOOKUP
        cases = self.memory.query_cases(target_patient)
        
        if not cases:
            return CaseResponse(
                response_text=f"No active medical cases found for {target_patient}.",
                case_status="None"
            )

        # Step 3: ANALYTICAL REASONING (Case Specific)
        response_lines = []
        overall_status = "Active"
        
        for case in cases:
            # Intent A: Lab Status Check
            if any(w in query for w in ["lab", "ready", "crown", "status", "where"]):
                lab_status = "N/A"
                if case['lab_order_id'] != "None":
                    lab_status = self._check_lab_status(case['lab_order_id'])
                
                response_lines.append(
                    f"**Case:** {case['type']}\n"
                    f"- Current Stage: {case['stage']}\n"
                    f"- Lab Status: {lab_status}\n"
                    f"- Next Step: {case['next_milestone']}"
                )

            # Intent B: General Progress
            elif any(w in query for w in ["progress", "stage", "step", "plan"]):
                response_lines.append(
                    f"Patient {case['patient_name']} is currently in the **{case['stage']}** stage for {case['type']}."
                )

        if not response_lines:
            # Default fallback if intent is unclear but patient found
            response_lines.append(f"Found active case: {cases[0]['type']}. Ask about 'lab status' or 'next steps'.")

        return CaseResponse(
            response_text="\n\n".join(response_lines),
            case_status=overall_status,
            next_step=cases[0]['next_milestone']
        )

# --- 4. TESTING BLOCK ---
if __name__ == "__main__":
    agent = CaseTrackingAgent()
    print("🦷 Al-Shifa Case Manager Agent Online...")
    
    # Test 1: Lab Status Check (Graph + External Tool)
    print("\n--- Test 1: Crown Status ---")
    req1 = CaseInput(user_query="Is Ali's crown ready from the lab?")
    res1 = agent.process_request(req1)
    print(f"Agent:\n{res1.response_text}")

    # Test 2: General Progress Check
    print("\n--- Test 2: Treatment Stage ---")
    req2 = CaseInput(user_query="What stage is Sara at?")
    res2 = agent.process_request(req2)
    print(f"Agent:\n{res2.response_text}")