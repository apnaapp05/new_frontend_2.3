import json
from datetime import date, datetime
from typing import List, Optional, Dict
from pydantic import BaseModel, Field

# --- 1. STRUCTURED I/O ---
class AgentInput(BaseModel):
    user_query: str
    patient_id: Optional[str] = None
    session_id: str

class AgentResponse(BaseModel):
    response_text: str
    action_taken: str  # "booked", "queried", "triaged", "none"
    data: Optional[Dict] = None

# --- 2. KNOWLEDGE GRAPH MEMORY (GraphRAG) ---
class DentalGraphRAG:
    def __init__(self):
        # Central Nodes: Patients | Satellite Nodes: History
        self.graph = {
            "PATIENT_89201": {
                "name": "Ali Khan",
                "history": [
                    {"date": "2024-12-01", "type": "Checkup", "doctor": "Dr. Sarah", "notes": "Sensitivity in molar"},
                    {"date": "2024-12-12", "type": "Root Canal", "doctor": "Dr. Bilal", "notes": "Completed successfully"}
                ]
            }
        }

    def query_history(self, patient_id: str, query_concept: str) -> str:
        if patient_id not in self.graph:
            return "No history found."
        
        patient_node = self.graph[patient_id]
        history_nodes = patient_node["history"]
        
        relevant_facts = []
        for event in history_nodes:
            # Semantic-like matching
            if query_concept.lower() in str(event).lower():
                relevant_facts.append(f"On {event['date']}, {event['type']} with {event['doctor']}: {event['notes']}")
        
        if not relevant_facts:
            # If no specific concept found, return latest event
            latest = history_nodes[-1]
            return f"I couldn't find '{query_concept}', but your last visit was on {latest['date']} for {latest['type']}."
            
        return "\n".join(relevant_facts)

# --- 3. THE AGENT CLASS (ReAct) ---
class AppointmentAgent:
    def __init__(self):
        self.name = "Scheduling Bot"
        self.memory = DentalGraphRAG()

    def _check_calendar(self, date_str: str):
        return ["10:00 AM", "02:00 PM", "04:30 PM"]

    def _triage_symptom(self, symptom: str):
        urgency = "Normal"
        if any(x in symptom.lower() for x in ["severe", "blood", "trauma", "broken", "pain"]):
            urgency = "Emergency"
        return urgency

    # --- REASONING ENGINE (Updated Logic) ---
    def process_request(self, input_data: AgentInput) -> AgentResponse:
        query = input_data.user_query.lower()
        patient_id = input_data.patient_id or "PATIENT_89201"

        # A. History Query (GraphRAG Trigger) - IMPROVED MATCHING
        # Now catches: "when was", "last time", "history", "previous", "record"
        if any(w in query for w in ["history", "last", "previous", "record", "when", "past", "done"]):
            concept = ""
            if "root canal" in query: concept = "root canal"
            elif "checkup" in query: concept = "checkup"
            elif "cleaning" in query: concept = "cleaning"
            
            observation = self.memory.query_history(patient_id, concept)
            return AgentResponse(
                response_text=f"According to your records: {observation}",
                action_taken="queried"
            )

        # B. New Booking & Triage
        if any(w in query for w in ["book", "appointment", "schedule", "visit", "pain", "see a doctor"]):
            urgency = self._triage_symptom(query)
            
            if urgency == "Emergency":
                return AgentResponse(
                    response_text="⚠️ I detect this is an Emergency. I have alerted Dr. Bilal. Please come in immediately at 10:00 AM.",
                    action_taken="triaged",
                    data={"priority": "high"}
                )
            
            slots = self._check_calendar("today")
            return AgentResponse(
                response_text=f"I can book you for a checkup. Available slots today: {', '.join(slots)}.",
                action_taken="none",
                data={"slots": slots}
            )

        # Fallback
        return AgentResponse(
            response_text="I can help you book an appointment or check your history. Try asking 'When was my last visit?'.",
            action_taken="none"
        )

# --- 4. TESTING ---
if __name__ == "__main__":
    agent = AppointmentAgent()
    print("🏥 Al-Shifa Scheduling Agent (v2) Online...")
    
    # Re-Testing the failed query
    print("\n--- Test 1: History Query (Retry) ---")
    req1 = AgentInput(user_query="When was my last root canal?", session_id="123")
    res1 = agent.process_request(req1)
    print(f"Agent: {res1.response_text}")