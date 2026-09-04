"""
Defines default routing rules and category inference logic based on incident tags.
"""

DEFAULT_CATEGORIES = ["police", "counseling", "legal"]

CATEGORY_MAPPINGS = {
    "physical": ["police", "medical", "counseling", "shelter"],
    "economic": ["legal", "financial_aid", "counseling"],
    "digital": ["cyber_crime_cell", "legal", "counseling"]
}

def infer_categories_from_tags(incident_tags: list[str]) -> list[str]:
    """
    Infers required support categories based on tags present in user's incidents.
    Returns safe defaults if no tags are present.
    """
    if not incident_tags:
        return DEFAULT_CATEGORIES

    inferred = set()
    for tag in incident_tags:
        if tag in CATEGORY_MAPPINGS:
            inferred.update(CATEGORY_MAPPINGS[tag])

    return list(inferred) if inferred else DEFAULT_CATEGORIES