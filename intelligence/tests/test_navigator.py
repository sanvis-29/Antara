"""
Run with: pytest intelligence/tests/test_navigator.py -v
"""
import pytest

from intelligence.navigator.rules import (
    provider_types_for_categories,
    is_urgent,
    urgency_level,
)
from intelligence.navigator.reasoning import explain_recommendation, build_navigator_summary
from intelligence.navigator.recommender import recommend


SAMPLE_PROVIDERS = [
    {"id": "SVC1", "name": "City Police Helpline", "category": "police", "verified": True, "is_24x7": True, "city": "Delhi"},
    {"id": "SVC2", "name": "Legal Aid Clinic", "category": "legal", "verified": True, "is_24x7": False, "city": "Delhi"},
    {"id": "SVC3", "name": "Cyber Crime Cell", "category": "cyber", "verified": True, "is_24x7": True, "city": "Delhi"},
    {"id": "SVC4", "name": "Unverified Hotline", "category": "police", "verified": False, "is_24x7": True, "city": "Delhi"},
    {"id": "SVC5", "name": "Mumbai Legal Aid", "category": "legal", "verified": True, "is_24x7": False, "city": "Mumbai"},
]


def test_provider_types_for_no_categories_returns_default():
    types = provider_types_for_categories(set())
    assert types == ["police", "counseling", "legal"]


def test_provider_types_for_physical_includes_police_and_shelter():
    types = provider_types_for_categories({"physical"})
    assert "police" in types
    assert "shelter" in types
    assert "counseling" in types  # always included


def test_provider_types_for_digital_includes_cyber():
    types = provider_types_for_categories({"digital"})
    assert "cyber" in types


def test_is_urgent_detects_danger_language():
    assert is_urgent("He said he would kill me if I left.")
    assert not is_urgent("He took my card last month.")


def test_urgency_level_across_incidents():
    incidents = [
        {"description": "He took my card."},
        {"description": "He said he has a knife and will use it tonight."},
    ]
    assert urgency_level(incidents) == "urgent"


def test_explain_recommendation_mentions_matching_category():
    explanation = explain_recommendation({"economic"}, "legal")
    assert "economic control" in explanation.lower() or "legal" in explanation.lower()


def test_build_navigator_summary_no_incidents():
    summary = build_navigator_summary([])
    assert summary["urgency"] == "standard"
    assert summary["categories_present"] == []


def test_build_navigator_summary_flags_urgent_incident():
    incidents = [{"incident_id": "INC1", "description": "He has a gun and said tonight.", "categories": {"physical": True}}]
    summary = build_navigator_summary(incidents)
    assert summary["urgency"] == "urgent"
    assert "INC1" in summary["urgent_incident_ids"]


def test_recommend_excludes_unverified_providers():
    incidents = [{"incident_id": "INC1", "description": "He hit me.", "categories": {"physical": True}}]
    result = recommend(incidents, SAMPLE_PROVIDERS)
    provider_ids = [r["provider"]["id"] for r in result["recommendations"]]
    assert "SVC4" not in provider_ids  # unverified, must never appear


def test_recommend_filters_by_city():
    incidents = [{"incident_id": "INC1", "description": "He took my card.", "categories": {"economic": True}}]
    result = recommend(incidents, SAMPLE_PROVIDERS, city="Mumbai")
    provider_ids = [r["provider"]["id"] for r in result["recommendations"]]
    assert "SVC5" in provider_ids
    assert "SVC2" not in provider_ids  # Delhi provider excluded by city filter


def test_recommend_includes_reasoning_per_provider():
    incidents = [{"incident_id": "INC1", "description": "He hit me.", "categories": {"physical": True}}]
    result = recommend(incidents, SAMPLE_PROVIDERS)
    assert all("reason" in r and isinstance(r["reason"], str) for r in result["recommendations"])


if __name__ == "__main__":
    import sys
    sys.exit(pytest.main([__file__, "-v"]))
