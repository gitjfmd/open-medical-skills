#!/usr/bin/env python3
"""
Trauma Management Protocols (ATLS)
=====================================
Advanced Trauma Life Support protocol assistant implementing the systematic
ABCDE approach to initial trauma assessment and management per ACS-COT
ATLS 10th Edition guidelines.

Clinical Purpose:
    Provides structured guidance through primary and secondary trauma
    surveys, hemorrhage classification, fluid resuscitation, and critical
    intervention decision points. Designed to support systematic,
    reproducible trauma assessment in the emergency setting.

References:
    - American College of Surgeons Committee on Trauma. Advanced Trauma
      Life Support (ATLS) Student Course Manual. 10th Ed. 2018.
    - Galvagno SM, et al. "Prehospital Trauma Care." Crit Care Med. 2019.
    - Cannon JW. "Hemorrhagic Shock." N Engl J Med. 2018;378(4):370-379.
    - Tisherman SA, et al. "Clinical Practice Guideline: Endpoints of
      Resuscitation." J Trauma Acute Care Surg. 2018.

DISCLAIMER: This tool is for clinical decision support and education only.
Trauma management requires qualified physicians and surgeons at the point
of care. This tool does NOT replace ATLS training or certification.
"""

import json
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
from enum import Enum


class HemorrhageClass(Enum):
    CLASS_I = "class_I"
    CLASS_II = "class_II"
    CLASS_III = "class_III"
    CLASS_IV = "class_IV"


class TraumaSurveyPhase(Enum):
    PRIMARY = "primary_survey"
    ADJUNCTS_PRIMARY = "adjuncts_to_primary"
    SECONDARY = "secondary_survey"
    ADJUNCTS_SECONDARY = "adjuncts_to_secondary"
    REASSESSMENT = "continuous_reassessment"


@dataclass
class TraumaVitals:
    heart_rate: int
    systolic_bp: int
    respiratory_rate: int
    gcs_total: int
    gcs_eye: int = 4
    gcs_verbal: int = 5
    gcs_motor: int = 6
    spo2: int = 100
    temperature_c: float = 37.0
    urine_output_ml_hr: Optional[int] = None


# Hemorrhage Classification (ATLS 10th Edition)
HEMORRHAGE_CLASSES = {
    HemorrhageClass.CLASS_I: {
        "blood_loss_ml": "Up to 750",
        "blood_loss_percent": "Up to 15%",
        "heart_rate": "< 100",
        "blood_pressure": "Normal",
        "pulse_pressure": "Normal or increased",
        "respiratory_rate": "14-20",
        "urine_output": "> 30 mL/hr",
        "mental_status": "Slightly anxious",
        "fluid_replacement": "Crystalloid",
        "description": "Minimal blood loss. Equivalent to a blood donation.",
    },
    HemorrhageClass.CLASS_II: {
        "blood_loss_ml": "750-1500",
        "blood_loss_percent": "15-30%",
        "heart_rate": "100-120",
        "blood_pressure": "Normal",
        "pulse_pressure": "Decreased",
        "respiratory_rate": "20-30",
        "urine_output": "20-30 mL/hr",
        "mental_status": "Mildly anxious",
        "fluid_replacement": "Crystalloid",
        "description": "Uncomplicated hemorrhage. Tachycardia is earliest reliable sign.",
    },
    HemorrhageClass.CLASS_III: {
        "blood_loss_ml": "1500-2000",
        "blood_loss_percent": "30-40%",
        "heart_rate": "120-140",
        "blood_pressure": "Decreased",
        "pulse_pressure": "Decreased",
        "respiratory_rate": "30-40",
        "urine_output": "5-15 mL/hr",
        "mental_status": "Anxious, confused",
        "fluid_replacement": "Crystalloid + blood products",
        "description": "Complicated hemorrhage. First class with HYPOTENSION. Requires blood.",
    },
    HemorrhageClass.CLASS_IV: {
        "blood_loss_ml": "> 2000",
        "blood_loss_percent": "> 40%",
        "heart_rate": "> 140",
        "blood_pressure": "Decreased",
        "pulse_pressure": "Decreased",
        "respiratory_rate": "> 35",
        "urine_output": "Negligible",
        "mental_status": "Confused, lethargic",
        "fluid_replacement": "Massive transfusion protocol",
        "description": "Immediately life-threatening. Activate MTP. Surgical hemorrhage control.",
    },
}


# Primary Survey: ABCDE
PRIMARY_SURVEY = {
    "A": {
        "name": "Airway with C-Spine Protection",
        "assessment": [
            "Assess airway patency: Can the patient speak clearly?",
            "Look for foreign bodies, facial/mandibular fractures, tracheal/laryngeal injury",
            "Listen for stridor, hoarseness, gurgling",
            "Maintain cervical spine immobilization (assume injury until cleared)",
        ],
        "interventions": [
            "Chin lift or jaw thrust (NOT head tilt in trauma)",
            "Suction airway if debris present",
            "Oropharyngeal or nasopharyngeal airway (if no midface fracture)",
            "Definitive airway (endotracheal intubation or surgical airway) if GCS <= 8 "
            "or unable to maintain airway",
            "Surgical cricothyrotomy if intubation not possible",
        ],
        "red_flags": [
            "GCS <= 8: definitive airway required",
            "Expanding neck hematoma: early intubation before airway compromise",
            "Inhalation injury (singed facial hair, carbonaceous sputum): early intubation",
        ],
    },
    "B": {
        "name": "Breathing and Ventilation",
        "assessment": [
            "Expose the chest completely",
            "Inspect for chest wall movement, symmetry, open wounds",
            "Auscultate lung sounds bilaterally",
            "Percuss for hyperresonance (pneumothorax) or dullness (hemothorax)",
            "Palpate for crepitus, flail segments, tracheal deviation",
        ],
        "interventions": [
            "Tension pneumothorax: needle decompression (2nd ICS midclavicular or "
            "5th ICS anterior axillary) then chest tube",
            "Open pneumothorax: 3-sided occlusive dressing then chest tube",
            "Massive hemothorax: chest tube (36-40 Fr) + prepare for thoracotomy",
            "Flail chest: intubation and positive pressure ventilation if respiratory failure",
            "High-flow oxygen (15L NRB) for all trauma patients initially",
        ],
        "red_flags": [
            "Tension pneumothorax: hypotension + absent breath sounds + tracheal deviation "
            "= IMMEDIATE needle decompression",
            "Massive hemothorax: > 1500 mL initial output or > 200 mL/hr for 2-4 hours "
            "= OR for thoracotomy",
            "Cardiac tamponade: Beck triad (hypotension, distended neck veins, muffled heart sounds)",
        ],
    },
    "C": {
        "name": "Circulation with Hemorrhage Control",
        "assessment": [
            "Assess skin color, pulse quality, capillary refill",
            "Identify and control external hemorrhage (direct pressure first)",
            "Assess for internal hemorrhage: chest, abdomen, pelvis, long bones, 'street'",
            "Obtain IV access (2 large-bore IVs, 16-gauge or larger)",
            "Draw blood for type & cross, CBC, BMP, coags, lactate, TEG if available",
        ],
        "interventions": [
            "Direct pressure for external hemorrhage; tourniquet for extremity arterial bleeding",
            "Crystalloid: 1L warm isotonic (LR or NS) bolus, assess response",
            "Massive transfusion protocol (MTP) for Class III-IV hemorrhage",
            "MTP ratio: 1:1:1 (pRBC : FFP : platelets)",
            "Tranexamic acid (TXA) 1g IV over 10 min if within 3 hours of injury",
            "Pelvic binder for suspected pelvic fracture with hemodynamic instability",
            "FAST exam (Focused Assessment with Sonography for Trauma)",
            "Resuscitative thoracotomy if traumatic arrest with penetrating chest trauma",
        ],
        "red_flags": [
            "Positive FAST + unstable = OR for exploratory laparotomy",
            "Pelvic fracture + unstable = pelvic binder, angioembolization, or preperitoneal packing",
            "Non-responder to 2L crystalloid + blood = likely surgical hemorrhage",
        ],
    },
    "D": {
        "name": "Disability (Neurological Evaluation)",
        "assessment": [
            "Glasgow Coma Scale (GCS): Eye + Verbal + Motor",
            "Pupil size and reactivity",
            "Lateralizing signs (unequal pupils, hemiparesis)",
            "Blood glucose (rule out hypoglycemia)",
            "Assess for spinal cord injury (motor/sensory level)",
        ],
        "interventions": [
            "GCS <= 8: secure airway (see A), consider head CT urgently",
            "Unilateral pupil dilation (blown pupil): impending herniation - "
            "elevate head 30 degrees, mannitol 1g/kg IV or 23.4% hypertonic saline 30 mL",
            "Treat hypoglycemia (D50 if glucose < 60 mg/dL)",
            "Spinal immobilization maintained until cleared",
        ],
        "red_flags": [
            "GCS drop of >= 2 points = immediate CT head",
            "Unilateral fixed dilated pupil = uncal herniation until proven otherwise",
            "Cushing triad (hypertension, bradycardia, irregular respirations) = increased ICP",
        ],
    },
    "E": {
        "name": "Exposure and Environmental Control",
        "assessment": [
            "Completely undress patient (cut clothing off)",
            "Log roll for posterior examination",
            "Assess for injuries: burns, wounds, deformities",
            "Rectal exam for GI bleed, prostate position, sphincter tone (if indicated)",
            "Core temperature measurement",
        ],
        "interventions": [
            "Warm blankets, warm IV fluids (38-40 C), warm environment",
            "Prevent hypothermia (part of lethal triad: hypothermia, acidosis, coagulopathy)",
            "Cover patient after thorough examination",
        ],
        "red_flags": [
            "Core temp < 35 C = active rewarming needed",
            "Lethal triad (hypothermia + acidosis + coagulopathy) = damage control surgery",
        ],
    },
}


def classify_hemorrhage(heart_rate: int, systolic_bp: int,
                        respiratory_rate: int, mental_status: str = "",
                        urine_output: int = None) -> dict:
    """
    Classify hemorrhage severity based on ATLS parameters.

    Returns hemorrhage class with estimated blood loss and treatment.
    """
    # Simple classification based on vital signs pattern
    if systolic_bp < 90 and heart_rate > 140:
        hclass = HemorrhageClass.CLASS_IV
    elif systolic_bp < 90 or heart_rate > 120:
        hclass = HemorrhageClass.CLASS_III
    elif heart_rate > 100:
        hclass = HemorrhageClass.CLASS_II
    else:
        hclass = HemorrhageClass.CLASS_I

    class_info = HEMORRHAGE_CLASSES[hclass]

    return {
        "classification": hclass.value,
        "estimated_blood_loss": class_info["blood_loss_ml"],
        "percent_blood_volume": class_info["blood_loss_percent"],
        "expected_findings": {
            "heart_rate": class_info["heart_rate"],
            "blood_pressure": class_info["blood_pressure"],
            "respiratory_rate": class_info["respiratory_rate"],
            "urine_output": class_info["urine_output"],
            "mental_status": class_info["mental_status"],
        },
        "fluid_replacement": class_info["fluid_replacement"],
        "description": class_info["description"],
        "input_vitals": {
            "heart_rate": heart_rate,
            "systolic_bp": systolic_bp,
            "respiratory_rate": respiratory_rate,
        },
        "management": _hemorrhage_management(hclass),
    }


def _hemorrhage_management(hclass: HemorrhageClass) -> list:
    """Generate hemorrhage-specific management steps."""
    base = [
        "Establish 2 large-bore IV access (16-gauge or larger)",
        "Send type & screen/crossmatch, CBC, BMP, coags, lactate",
    ]

    if hclass == HemorrhageClass.CLASS_I:
        return base + [
            "Observe and reassess. Crystalloid replacement rarely needed.",
            "Continue monitoring vital signs Q15 minutes.",
        ]
    elif hclass == HemorrhageClass.CLASS_II:
        return base + [
            "1L warm crystalloid (LR preferred) bolus over 15-20 minutes",
            "Reassess after bolus. Most patients respond.",
            "Type and crossmatch 2 units pRBC (anticipatory)",
            "Identify source of hemorrhage",
        ]
    elif hclass == HemorrhageClass.CLASS_III:
        return base + [
            "1L warm crystalloid bolus immediately",
            "Activate massive transfusion protocol (MTP) or crossmatched blood STAT",
            "Transfuse pRBC (O-negative if type-specific not available)",
            "TXA 1g IV over 10 minutes (within 3 hours of injury)",
            "FAST exam or CT (if stable enough) to identify source",
            "Prepare for operative intervention",
            "Call surgery/trauma team STAT",
        ]
    else:  # CLASS_IV
        return base + [
            "ACTIVATE MASSIVE TRANSFUSION PROTOCOL IMMEDIATELY",
            "Transfuse O-negative pRBC (do not wait for crossmatch)",
            "MTP ratio: 1:1:1 (pRBC : FFP : platelets)",
            "TXA 1g IV over 10 minutes",
            "Surgical hemorrhage control (OR or interventional radiology)",
            "Damage control resuscitation: permissive hypotension (SBP 80-90) until surgical control",
            "Prevent/treat lethal triad (hypothermia, acidosis, coagulopathy)",
            "Consider resuscitative thoracotomy if traumatic arrest with penetrating injury",
            "Call trauma surgery, anesthesia, blood bank STAT",
        ]


def calculate_gcs(eye: int, verbal: int, motor: int) -> dict:
    """Calculate Glasgow Coma Scale with interpretation."""
    if not (1 <= eye <= 4 and 1 <= verbal <= 5 and 1 <= motor <= 6):
        return {"error": "Invalid GCS components. Eye: 1-4, Verbal: 1-5, Motor: 1-6"}

    total = eye + verbal + motor

    if total <= 8:
        severity = "severe"
        actions = [
            "Secure definitive airway (intubation) - GCS <= 8",
            "Urgent CT head",
            "Neurosurgery consultation",
            "Elevate head of bed 30 degrees (if no spinal injury)",
            "Maintain MAP > 80 mmHg for adequate cerebral perfusion",
        ]
    elif total <= 12:
        severity = "moderate"
        actions = [
            "Close neurological monitoring (GCS Q1 hour)",
            "CT head recommended",
            "Consider neurosurgery consultation",
            "Reassess airway patency frequently",
        ]
    else:
        severity = "mild"
        actions = [
            "Monitor GCS Q1-2 hours for first 24 hours",
            "CT head if mechanism warrants (Canadian CT Head Rule)",
            "Watch for delayed deterioration",
        ]

    return {
        "gcs_total": total,
        "components": {
            "eye_opening": eye,
            "verbal_response": verbal,
            "motor_response": motor,
        },
        "severity": severity,
        "intubation_indicated": total <= 8,
        "actions": actions,
    }


def get_primary_survey(component: str = None) -> dict:
    """Get the complete ATLS primary survey or a specific component."""
    if component:
        comp = PRIMARY_SURVEY.get(component.upper())
        if comp:
            return comp
        return {"error": f"Unknown component: {component}",
                "valid_components": list(PRIMARY_SURVEY.keys())}
    return {
        "primary_survey_ABCDE": {
            letter: {
                "name": info["name"],
                "num_assessments": len(info["assessment"]),
                "num_interventions": len(info["interventions"]),
                "num_red_flags": len(info["red_flags"]),
            }
            for letter, info in PRIMARY_SURVEY.items()
        },
        "principle": "Assess and treat ABCDE in order. Address life threats "
                     "at each step BEFORE moving to the next.",
    }


def run_trauma_protocols(action: str, **kwargs) -> str:
    """
    Main entry point for the Trauma Management Protocols.

    Actions:
        primary_survey: Get ATLS primary survey (component: A/B/C/D/E)
        hemorrhage: Classify hemorrhage (heart_rate, systolic_bp, respiratory_rate)
        gcs: Calculate GCS (eye, verbal, motor)
        hemorrhage_reference: Get all hemorrhage class reference data
    """
    if action == "primary_survey":
        result = get_primary_survey(kwargs.get("component"))
    elif action == "hemorrhage":
        result = classify_hemorrhage(
            kwargs.get("heart_rate", 80),
            kwargs.get("systolic_bp", 120),
            kwargs.get("respiratory_rate", 16),
        )
    elif action == "gcs":
        result = calculate_gcs(
            kwargs.get("eye", 4),
            kwargs.get("verbal", 5),
            kwargs.get("motor", 6),
        )
    elif action == "hemorrhage_reference":
        result = {
            hc.value: info for hc, info in HEMORRHAGE_CLASSES.items()
        }
    else:
        result = {
            "error": f"Unknown action: {action}",
            "available_actions": ["primary_survey", "hemorrhage", "gcs", "hemorrhage_reference"],
        }

    return json.dumps(result, indent=2)


if __name__ == "__main__":
    print("=== ATLS Primary Survey ===")
    print(run_trauma_protocols("primary_survey"))
    print()
    print("=== Hemorrhage Classification (Class III) ===")
    print(run_trauma_protocols("hemorrhage", heart_rate=128, systolic_bp=85,
                                respiratory_rate=32))
    print()
    print("=== GCS Calculation ===")
    print(run_trauma_protocols("gcs", eye=3, verbal=3, motor=5))
