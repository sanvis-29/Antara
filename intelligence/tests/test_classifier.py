"""
Run with: pytest intelligence/tests/test_classifier.py -v
(run from the repo root, with intelligence/ importable -- see intelligence/README.md)
"""
import pytest

from intelligence.case_engine.classifier import classify_text, classify_incident


def test_milestone_sentence_tags_all_three_categories():
    """The exact sentence from the team's first integration milestone."""
    result = classify_text(
        "My husband hit me, took my card and threatened to share our private video."
    )
    assert set(result.tags) == {"physical", "economic", "digital"}
    assert result.confidence > 0.5


def test_empty_description_returns_no_tags():
    result = classify_text("")
    assert result.tags == []
    assert result.confidence == 0.0


def test_physical_only_description():
    result = classify_text("He slapped me and pushed me against the wall.")
    assert "physical" in result.tags
    assert "economic" not in result.tags
    assert "digital" not in result.tags


def test_economic_only_description():
    result = classify_text("He took my debit card and won't let me access our bank account.")
    assert "economic" in result.tags
    assert "physical" not in result.tags


def test_digital_only_description():
    result = classify_text("He keeps messaging me threats on WhatsApp and posted my photos online.")
    assert "digital" in result.tags


def test_classify_incident_agrees_with_explicit_categories():
    incident = {
        "description": "My husband hit me, took my card and threatened to share our private video.",
        "categories": {"physical": True, "economic": True, "digital": True},
    }
    result = classify_incident(incident)
    assert set(result["tags"]) == {"physical", "economic", "digital"}
    assert result["disagreements"] == []
    # Agreement between explicit ticks and text should push confidence high.
    assert result["confidence"] >= 0.8


def test_classify_incident_flags_disagreement():
    """Survivor ticked 'digital' but description doesn't mention anything digital."""
    incident = {
        "description": "He hit me and took my money.",
        "categories": {"physical": True, "economic": True, "digital": True},
    }
    result = classify_incident(incident)
    assert any("digital" in note for note in result["disagreements"])


def test_classify_incident_with_no_explicit_categories_still_infers_from_text():
    incident = {
        "description": "He hit me repeatedly last night.",
        "categories": {"physical": False, "economic": False, "digital": False},
    }
    result = classify_incident(incident)
    assert "physical" in result["tags"]
    assert any("physical" in note for note in result["disagreements"])


if __name__ == "__main__":
    import sys
    sys.exit(pytest.main([__file__, "-v"]))
