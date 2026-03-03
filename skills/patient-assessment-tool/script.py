#!/usr/bin/env python3
"""
Nursing Patient Assessment Tool
=================================
Comprehensive nursing assessment tool implementing standardized assessment
scales for vital signs interpretation, early warning scores, pain assessment,
fall risk screening, and functional status evaluation.

Clinical Purpose:
    Provides a structured framework for systematic patient evaluation at
    the bedside. Integrates multiple validated assessment tools into a
    single workflow to support nursing clinical decision-making, early
    deterioration detection, and care prioritization.

References:
    - Smith GB, et al. "The Ability of the National Early Warning Score (NEWS)
      to Discriminate Patients at Risk." Resuscitation. 2013;84(4):465-470.
    - Morse JM. "Predicting Fall Risk." Can J Nurs Res. 1989;21(4):9-19.
    - Braden B, Bergstrom N. "Predictive Validity of the Braden Scale for
      Pressure Sore Risk." Res Nurs Health. 1994;17(6):459-470.
    - Katz S, et al. "Studies of Illness in the Aged." JAMA. 1963;185:914-919.

DISCLAIMER: This tool supports nursing assessment and does not replace
clinical judgment. All critical findings must be reported to the
responsible provider immediately.
"""

import json
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
from enum import Enum


class AlertLevel(Enum):
    NORMAL = "normal"
    LOW_RISK = "low_risk"
    MEDIUM_RISK = "medium_risk"
    HIGH_RISK = "high_risk"
    CRITICAL = "critical"


@dataclass
class VitalSigns:
    """Patient vital signs with automatic interpretation."""
    heart_rate: int
    systolic_bp: int
    diastolic_bp: int
    respiratory_rate: int
    temperature_c: float
    spo2: int
    consciousness: str = "A"  # AVPU: A=Alert, V=Voice, P=Pain, U=Unresponsive
    supplemental_o2: bool = False


# NEWS2 (National Early Warning Score 2) Parameters
# Royal College of Physicians, 2017
NEWS2_SCORING = {
    "respiratory_rate": [
        (0, 8, 3), (9, 11, 1), (12, 20, 0), (21, 24, 2), (25, 999, 3),
    ],
    "spo2_scale1": [
        (0, 91, 3), (92, 93, 2), (94, 95, 1), (96, 100, 0),
    ],
    "spo2_scale2": [  # For patients with hypercapnic respiratory failure target 88-92%
        (0, 83, 3), (84, 85, 2), (86, 87, 1), (88, 92, 0), (93, 94, 1), (95, 96, 2), (97, 100, 3),
    ],
    "supplemental_o2": {True: 2, False: 0},
    "systolic_bp": [
        (0, 90, 3), (91, 100, 2), (101, 110, 1), (111, 219, 0), (220, 999, 3),
    ],
    "heart_rate": [
        (0, 40, 3), (41, 50, 1), (51, 90, 0), (91, 110, 1), (111, 130, 2), (131, 999, 3),
    ],
    "consciousness": {"A": 0, "V": 3, "P": 3, "U": 3},
    "temperature": [
        (0, 35.0, 3), (35.1, 36.0, 1), (36.1, 38.0, 0), (38.1, 39.0, 1), (39.1, 100, 2),
    ],
}


def _score_range(value: float, ranges: list) -> int:
    """Score a value against a list of (low, high, score) ranges."""
    for low, high, score in ranges:
        if low <= value <= high:
            return score
    return 0


def calculate_news2(vitals: VitalSigns, use_scale2: bool = False) -> dict:
    """
    Calculate NEWS2 (National Early Warning Score 2).

    NEWS2 is validated for detecting clinical deterioration in hospitalized
    adults. A score >= 5 (or 3 in any single parameter) triggers urgent
    clinical response.

    Args:
        vitals: Patient vital signs
        use_scale2: Use SpO2 Scale 2 for patients with hypercapnic respiratory failure

    Returns:
        NEWS2 score with component breakdown and clinical response recommendation
    """
    scores = {}

    scores["respiratory_rate"] = _score_range(vitals.respiratory_rate,
                                               NEWS2_SCORING["respiratory_rate"])
    spo2_key = "spo2_scale2" if use_scale2 else "spo2_scale1"
    scores["spo2"] = _score_range(vitals.spo2, NEWS2_SCORING[spo2_key])
    scores["supplemental_o2"] = NEWS2_SCORING["supplemental_o2"][vitals.supplemental_o2]
    scores["systolic_bp"] = _score_range(vitals.systolic_bp, NEWS2_SCORING["systolic_bp"])
    scores["heart_rate"] = _score_range(vitals.heart_rate, NEWS2_SCORING["heart_rate"])
    scores["consciousness"] = NEWS2_SCORING["consciousness"].get(vitals.consciousness, 3)
    scores["temperature"] = _score_range(vitals.temperature_c, NEWS2_SCORING["temperature"])

    total = sum(scores.values())
    max_single = max(scores.values())

    # Determine clinical response level
    if total >= 7:
        risk = AlertLevel.CRITICAL
        response = ("EMERGENCY RESPONSE: Continuous monitoring, urgent clinical review "
                    "by critical care team. Consider ICU transfer.")
        frequency = "Continuous monitoring"
    elif total >= 5 or max_single == 3:
        risk = AlertLevel.HIGH_RISK
        response = ("URGENT RESPONSE: Increase monitoring frequency. Urgent review by "
                    "clinician with core competencies in acute illness. Assess for ICU.")
        frequency = "Minimum every 1 hour"
    elif total >= 1:
        risk = AlertLevel.MEDIUM_RISK if total >= 3 else AlertLevel.LOW_RISK
        response = ("WARD-BASED RESPONSE: Inform nurse in charge. Assess by competent "
                    "clinician to determine cause and plan." if total >= 3
                    else "LOW RISK: Continue routine monitoring.")
        frequency = "Minimum every 4-6 hours" if total >= 3 else "Minimum every 12 hours"
    else:
        risk = AlertLevel.NORMAL
        response = "Continue routine monitoring."
        frequency = "Minimum every 12 hours"

    return {
        "news2_total": total,
        "component_scores": scores,
        "risk_level": risk.value,
        "clinical_response": response,
        "monitoring_frequency": frequency,
        "single_parameter_alert": max_single == 3,
        "spo2_scale": "scale_2_hypercapnic" if use_scale2 else "scale_1_standard",
    }


# Morse Fall Scale (Morse, 1989)
MORSE_FALL_QUESTIONS = [
    {
        "item": "History of falling (within 3 months)",
        "options": {"No": 0, "Yes": 25},
    },
    {
        "item": "Secondary diagnosis (>= 2 medical diagnoses)",
        "options": {"No": 0, "Yes": 15},
    },
    {
        "item": "Ambulatory aid",
        "options": {"None/bed rest/nurse assist": 0, "Crutches/cane/walker": 15,
                    "Furniture for support": 30},
    },
    {
        "item": "IV therapy / heparin lock",
        "options": {"No": 0, "Yes": 20},
    },
    {
        "item": "Gait",
        "options": {"Normal/bed rest/wheelchair": 0, "Weak": 10, "Impaired": 20},
    },
    {
        "item": "Mental status",
        "options": {"Oriented to own ability": 0, "Overestimates or forgets limitations": 15},
    },
]


def calculate_morse_fall_scale(responses: dict) -> dict:
    """
    Calculate Morse Fall Scale score.

    Args:
        responses: Dict mapping item descriptions to selected option strings

    Returns:
        Fall risk score and category with interventions
    """
    total = 0
    item_scores = {}

    for question in MORSE_FALL_QUESTIONS:
        item = question["item"]
        selected = responses.get(item, list(question["options"].keys())[0])
        score = question["options"].get(selected, 0)
        item_scores[item] = {"selected": selected, "score": score}
        total += score

    if total >= 45:
        risk = AlertLevel.HIGH_RISK
        interventions = [
            "Implement standard fall prevention interventions PLUS:",
            "Consider 1:1 sitter or continuous monitoring",
            "Bed alarm and chair alarm activated",
            "Place fall risk signage at bedside and door",
            "Low bed position with mats on floor",
            "Hourly intentional rounding (pain, position, potty, proximity)",
            "Review and minimize sedating medications",
            "Physical therapy consultation for mobility assessment",
            "Non-skid footwear at all times when ambulating",
        ]
    elif total >= 25:
        risk = AlertLevel.MEDIUM_RISK
        interventions = [
            "Implement standard fall prevention interventions:",
            "Yellow fall risk wristband",
            "Call light within reach at all times",
            "Bed in lowest position with brakes locked",
            "Assist with ambulation and transfers",
            "Clear pathways of obstacles",
            "Adequate lighting (nightlight in bathroom)",
            "Toileting schedule to reduce urgency-related falls",
        ]
    else:
        risk = AlertLevel.LOW_RISK
        interventions = [
            "Standard safety measures:",
            "Orient patient to room and call light",
            "Keep frequently used items within reach",
            "Encourage patient to call for help if feeling unsteady",
        ]

    return {
        "morse_fall_scale_total": total,
        "risk_level": risk.value,
        "item_scores": item_scores,
        "interventions": interventions,
        "reassessment": "Reassess Q shift, with status change, after fall, and after procedure.",
    }


# Braden Scale for Pressure Injury Risk
BRADEN_CATEGORIES = {
    "sensory_perception": {
        "description": "Ability to respond to pressure-related discomfort",
        "options": {
            "Completely limited": 1,
            "Very limited": 2,
            "Slightly limited": 3,
            "No impairment": 4,
        },
    },
    "moisture": {
        "description": "Degree to which skin is exposed to moisture",
        "options": {
            "Constantly moist": 1,
            "Very moist": 2,
            "Occasionally moist": 3,
            "Rarely moist": 4,
        },
    },
    "activity": {
        "description": "Degree of physical activity",
        "options": {
            "Bedfast": 1,
            "Chairfast": 2,
            "Walks occasionally": 3,
            "Walks frequently": 4,
        },
    },
    "mobility": {
        "description": "Ability to change and control body position",
        "options": {
            "Completely immobile": 1,
            "Very limited": 2,
            "Slightly limited": 3,
            "No limitations": 4,
        },
    },
    "nutrition": {
        "description": "Usual food intake pattern",
        "options": {
            "Very poor": 1,
            "Probably inadequate": 2,
            "Adequate": 3,
            "Excellent": 4,
        },
    },
    "friction_and_shear": {
        "description": "Degree of friction and shear skin is exposed to",
        "options": {
            "Problem": 1,
            "Potential problem": 2,
            "No apparent problem": 3,
        },
    },
}


def calculate_braden_scale(responses: dict) -> dict:
    """
    Calculate Braden Scale for Predicting Pressure Sore Risk.

    Total score range: 6-23. Lower scores indicate higher risk.

    Args:
        responses: Dict mapping category name to selected option string

    Returns:
        Braden score with risk level and prevention interventions
    """
    total = 0
    category_scores = {}

    for category, info in BRADEN_CATEGORIES.items():
        selected = responses.get(category, list(info["options"].keys())[-1])
        score = info["options"].get(selected, 3)
        category_scores[category] = {"selected": selected, "score": score}
        total += score

    if total <= 9:
        risk = AlertLevel.CRITICAL
        risk_label = "Very High Risk"
    elif total <= 12:
        risk = AlertLevel.HIGH_RISK
        risk_label = "High Risk"
    elif total <= 14:
        risk = AlertLevel.MEDIUM_RISK
        risk_label = "Moderate Risk"
    elif total <= 18:
        risk = AlertLevel.LOW_RISK
        risk_label = "Mild Risk"
    else:
        risk = AlertLevel.NORMAL
        risk_label = "No Risk"

    interventions = []
    if total <= 18:
        interventions.extend([
            "Reposition patient at least every 2 hours",
            "Use pressure-redistribution mattress/surface",
            "Keep skin clean and dry; apply moisture barrier cream",
            "Perform daily comprehensive skin assessment",
            "Float heels off bed surface (pillow under calves)",
            "Minimize head-of-bed elevation (< 30 degrees when possible)",
            "Optimize nutrition (dietitian consult if needed)",
            "Use lifting devices to reduce friction and shear during repositioning",
        ])
    if total <= 12:
        interventions.extend([
            "Consider advanced pressure-redistribution surface (alternating pressure, low-air-loss)",
            "Increase repositioning frequency to every 1-2 hours",
            "Wound care nurse consultation",
        ])

    return {
        "braden_total": total,
        "risk_level": risk.value,
        "risk_label": risk_label,
        "category_scores": category_scores,
        "interventions": interventions if interventions else ["Continue standard skin care"],
        "reassessment": "Reassess Q 48-72 hours (acute care) or weekly (long-term care)",
    }


def assess_pain(pain_score: int, location: str, quality: str,
                 onset: str, duration: str, aggravating: list = None,
                 alleviating: list = None) -> dict:
    """
    Structured pain assessment using PQRST framework.

    Args:
        pain_score: Numeric Rating Scale 0-10
        location: Location of pain
        quality: Description of pain quality
        onset: When pain started
        duration: How long pain lasts
        aggravating: Factors that worsen pain
        alleviating: Factors that relieve pain
    """
    aggravating = aggravating or []
    alleviating = alleviating or []

    if pain_score <= 3:
        severity = "Mild"
        recommendation = "Non-pharmacological interventions first. PRN analgesics as ordered."
    elif pain_score <= 6:
        severity = "Moderate"
        recommendation = ("Administer prescribed analgesics. Implement non-pharmacological "
                          "interventions concurrently. Reassess in 30-60 minutes.")
    else:
        severity = "Severe"
        recommendation = ("Administer prescribed analgesics promptly. Notify provider if "
                          "pain not controlled. Reassess in 15-30 minutes after intervention.")

    return {
        "pain_assessment": {
            "numeric_rating": pain_score,
            "severity": severity,
            "location": location,
            "quality": quality,
            "onset": onset,
            "duration": duration,
            "aggravating_factors": aggravating,
            "alleviating_factors": alleviating,
        },
        "recommendation": recommendation,
        "reassessment_timing": {
            "after_IV_medication": "15-30 minutes",
            "after_PO_medication": "30-60 minutes",
            "after_non_pharmacological": "30 minutes",
            "routine": "Every 4 hours and with vital signs",
        },
        "non_pharmacological_options": [
            "Repositioning and comfort measures",
            "Ice or heat application (per order)",
            "Deep breathing and relaxation techniques",
            "Distraction (music, conversation, guided imagery)",
            "Massage (if appropriate for condition)",
        ],
    }


def run_assessment(tool: str, **kwargs) -> str:
    """
    Main entry point for the Patient Assessment Tool.

    Tools:
        news2: Calculate NEWS2 early warning score
        morse: Calculate Morse Fall Scale
        braden: Calculate Braden Pressure Injury Risk Scale
        pain: Structured pain assessment (PQRST)
        vitals: Interpret vital signs with alerts
    """
    if tool == "news2":
        vitals = VitalSigns(
            heart_rate=kwargs.get("heart_rate", 80),
            systolic_bp=kwargs.get("systolic_bp", 120),
            diastolic_bp=kwargs.get("diastolic_bp", 80),
            respiratory_rate=kwargs.get("respiratory_rate", 16),
            temperature_c=kwargs.get("temperature_c", 37.0),
            spo2=kwargs.get("spo2", 97),
            consciousness=kwargs.get("consciousness", "A"),
            supplemental_o2=kwargs.get("supplemental_o2", False),
        )
        result = calculate_news2(vitals, kwargs.get("use_scale2", False))
    elif tool == "morse":
        result = calculate_morse_fall_scale(kwargs.get("responses", {}))
    elif tool == "braden":
        result = calculate_braden_scale(kwargs.get("responses", {}))
    elif tool == "pain":
        result = assess_pain(
            kwargs.get("pain_score", 0),
            kwargs.get("location", ""),
            kwargs.get("quality", ""),
            kwargs.get("onset", ""),
            kwargs.get("duration", ""),
            kwargs.get("aggravating"),
            kwargs.get("alleviating"),
        )
    else:
        result = {
            "error": f"Unknown tool: {tool}",
            "available_tools": ["news2", "morse", "braden", "pain"],
        }

    return json.dumps(result, indent=2)


if __name__ == "__main__":
    print("=== NEWS2 Score (Deteriorating Patient) ===")
    print(run_assessment("news2", heart_rate=115, systolic_bp=95,
                         diastolic_bp=60, respiratory_rate=26,
                         temperature_c=38.5, spo2=91,
                         consciousness="V", supplemental_o2=True))
    print()
    print("=== Pain Assessment ===")
    print(run_assessment("pain", pain_score=7, location="Right lower quadrant",
                         quality="Sharp, cramping", onset="3 hours ago",
                         duration="Constant with intermittent worsening",
                         aggravating=["movement", "coughing"],
                         alleviating=["lying still", "ice"]))
