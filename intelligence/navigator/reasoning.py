"""
Provides reasoning context for recommended support entities.
"""

REASON_TEMPLATES = {
    "police": "Recommended based on reported physical or safety concerns.",
    "counseling": "Recommended to provide psychological and emotional support.",
    "legal": "Recommended to assist with legal rights, protective orders, or reporting.",
    "shelter": "Recommended for immediate safe housing options.",
    "cyber_crime_cell": "Recommended due to digital harassment or online security breaches.",
    "financial_aid": "Recommended to assist with economic dependency or financial abuse recovery."
}

def generate_recommendation_reason(category: str, city: str | None = None) -> str:
    """
    Generates human-readable reasoning for why a resource was recommended.
    """
    base_reason = REASON_TEMPLATES.get(category, "Recommended based on your case profile.")
    if city:
        return f"{base_reason} Available in {city}."
    return base_reason