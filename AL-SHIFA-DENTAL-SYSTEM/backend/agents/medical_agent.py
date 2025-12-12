import random

class MedicalAgent:
    def __init__(self):
        self.name = "Dr. AI"
        
        # Knowledge Base (Simulating AI Brain)
        self.specialties = {
            "root canal": "Endodontist",
            "cavity": "Restorative Dentist",
            "implant": "Prosthodontist",
            "braces": "Orthodontist",
            "pain": "General Dentist",
            "cleaning": "Hygienist",
            "child": "Pediatric Dentist",
            "gum": "Periodontist"
        }

    def analyze_symptoms(self, user_text):
        """
        Patient ki baat sunkar sahi doctor aur department suggest karega.
        """
        user_text = user_text.lower()
        
        # 1. AI Logic (Simple Keyword Matching for now)
        detected_issue = None
        suggested_role = "General Dentist"
        
        for keyword, specialist in self.specialties.items():
            if keyword in user_text:
                detected_issue = keyword
                suggested_role = specialist
                break
        
        # 2. Response Formulation
        if detected_issue:
            response = f"Based on your mention of '{detected_issue}', I recommend seeing a **{suggested_role}**."
            confidence = 0.95
        else:
            response = "I couldn't detect a specific condition. I recommend a General Checkup first."
            suggested_role = "General Dentist"
            confidence = 0.50

        return {
            "agent_name": self.name,
            "analysis": response,
            "suggested_specialist": suggested_role,
            "confidence_score": confidence
        }

# --- TESTING AREA (Jab hum file direct run karein) ---
if __name__ == "__main__":
    agent = MedicalAgent()
    
    print("🤖 Dr. AI is listening... (Type 'exit' to stop)")
    while True:
        text = input("\nPatient: ")
        if text.lower() == "exit":
            break
        result = agent.analyze_symptoms(text)
        print(f"Dr. AI: {result['analysis']}")