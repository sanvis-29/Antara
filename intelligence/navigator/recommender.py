"""
Core recommendation engine for matching support services based on location and case profile.
"""

from typing import List, Dict, Any, Optional
from intelligence.navigator.rules import infer_categories_from_tags
from intelligence.navigator.reasoning import generate_recommendation_reason

# Mock database of support organizations
MOCK_SUPPORT_SERVICES = [
    {"id": "SUP101", "name": "Delhi Special Police Unit for Women & Children", "city": "Delhi", "category": "police", "contact": "1091"},
    {"id": "SUP102", "name": "National Legal Services Authority (NALSA)", "city": "Delhi", "category": "legal", "contact": "15100"},
    {"id": "SUP103", "name": "National Cyber Crime Reporting Portal", "city": "All", "category": "cyber_crime_cell", "contact": "1930"},
    {"id": "SUP104", "name": "iCall Psychosocial Helpline", "city": "All", "category": "counseling", "contact": "9152987821"},
]

def get_support_recommendations(
    user_incident_tags: List[str], 
    city: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Returns filtered and reasoned support service recommendations.
    """
    target_categories = infer_categories_from_tags(user_incident_tags)
    recommendations = []

    for service in MOCK_SUPPORT_SERVICES:
        # Category match check
        if service["category"] in target_categories:
            # City match check (matches specific city or nationwide services)
            if city is None or service["city"] in [city, "All"]:
                rec_item = service.copy()
                rec_item["reason"] = generate_recommendation_reason(service["category"], city)
                recommendations.append(rec_item)

    return recommendations