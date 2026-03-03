#!/usr/bin/env python3
"""
ACLS Protocol Assistant
=======================
Advanced Cardiac Life Support protocol guide implementing AHA 2020/2025
guidelines for cardiac arrest management, arrhythmia identification,
and post-cardiac arrest care.

Clinical Purpose:
    Provides structured, step-by-step guidance through ACLS algorithms
    including cardiac arrest (VF/pVT, PEA, Asystole), bradycardia,
    and tachycardia management pathways.

References:
    - AHA 2020 Guidelines for CPR and Emergency Cardiovascular Care
    - Panchal AR, et al. Circulation. 2020;142(suppl 2):S366-S468
    - Link MS, et al. Circulation. 2015;132(suppl 2):S444-S464

DISCLAIMER: This tool is for educational and clinical decision support only.
It does NOT replace clinical judgment. All treatment decisions must be made
by qualified healthcare professionals at the point of care.
"""

import json
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional
from datetime import datetime


class CardiacRhythm(Enum):
    VF = "ventricular_fibrillation"
    PVTACH = "pulseless_ventricular_tachycardia"
    PEA = "pulseless_electrical_activity"
    ASYSTOLE = "asystole"
    SINUS_BRADY = "sinus_bradycardia"
    SINUS_TACH = "sinus_tachycardia"
    AFIB_RVR = "atrial_fibrillation_rvr"
    SVT = "supraventricular_tachycardia"
    VTACH_WITH_PULSE = "ventricular_tachycardia_with_pulse"
    THIRD_DEGREE_BLOCK = "third_degree_heart_block"
    SECOND_DEGREE_TYPE2 = "second_degree_type_ii"
    ROSC = "return_of_spontaneous_circulation"


class ShockableRhythm(Enum):
    SHOCKABLE = "shockable"
    NON_SHOCKABLE = "non_shockable"


@dataclass
class PatientState:
    rhythm: CardiacRhythm
    has_pulse: bool = False
    heart_rate: Optional[int] = None
    systolic_bp: Optional[int] = None
    is_stable: bool = True
    symptoms: list = field(default_factory=list)
    epinephrine_doses: int = 0
    amiodarone_doses: int = 0
    defibrillation_count: int = 0
    cpr_cycles: int = 0
    iv_access: bool = False
    advanced_airway: bool = False
    time_started: str = field(default_factory=lambda: datetime.now().isoformat())


# AHA drug dosing constants
EPINEPHRINE_DOSE_MG = 1.0
EPINEPHRINE_INTERVAL_MIN = 3  # every 3-5 minutes
AMIODARONE_FIRST_DOSE_MG = 300
AMIODARONE_SECOND_DOSE_MG = 150
AMIODARONE_MAX_DOSES = 2
LIDOCAINE_FIRST_DOSE_MG_KG = 1.0
LIDOCAINE_SUBSEQUENT_MG_KG = 0.5
ATROPINE_DOSE_MG = 1.0
ATROPINE_MAX_DOSE_MG = 3.0
ADENOSINE_FIRST_DOSE_MG = 6
ADENOSINE_SECOND_DOSE_MG = 12
BIPHASIC_DEFIB_ENERGY_J = [200, 200, 200]  # escalate per manufacturer
SYNCHRONIZED_CARDIOVERSION_NARROW = [50, 100, 200, 300]
SYNCHRONIZED_CARDIOVERSION_WIDE = [100, 200, 300, 360]


# Reversible causes: H's and T's
HS_AND_TS = {
    "H": [
        "Hypovolemia",
        "Hypoxia",
        "Hydrogen ion (acidosis)",
        "Hypo-/Hyperkalemia",
        "Hypothermia",
    ],
    "T": [
        "Tension pneumothorax",
        "Tamponade (cardiac)",
        "Toxins",
        "Thrombosis (pulmonary)",
        "Thrombosis (coronary)",
    ],
}


def classify_rhythm(rhythm: CardiacRhythm) -> ShockableRhythm:
    """Classify cardiac rhythm as shockable or non-shockable per AHA guidelines."""
    shockable = {CardiacRhythm.VF, CardiacRhythm.PVTACH}
    if rhythm in shockable:
        return ShockableRhythm.SHOCKABLE
    return ShockableRhythm.NON_SHOCKABLE


def cardiac_arrest_algorithm(patient: PatientState) -> dict:
    """
    Execute the AHA cardiac arrest algorithm.

    Returns a structured action plan based on rhythm analysis.
    High-quality CPR is emphasized throughout (rate 100-120/min,
    depth >= 2 inches, full chest recoil, minimal interruptions).
    """
    actions = []
    warnings = []

    # Step 1: Confirm cardiac arrest, activate emergency response
    actions.append("1. Confirm unresponsiveness and absence of pulse (< 10 seconds)")
    actions.append("2. Activate emergency response system / call code team")
    actions.append("3. Begin HIGH-QUALITY CPR immediately")
    actions.append("   - Rate: 100-120 compressions/min")
    actions.append("   - Depth: at least 2 inches (5 cm) in adults")
    actions.append("   - Allow full chest recoil between compressions")
    actions.append("   - Minimize interruptions (< 10 seconds for rhythm checks)")
    actions.append("   - Compression-to-ventilation ratio: 30:2 (if no advanced airway)")
    actions.append("4. Attach defibrillator/monitor as soon as available")

    rhythm_class = classify_rhythm(patient.rhythm)

    if rhythm_class == ShockableRhythm.SHOCKABLE:
        actions.append(f"\n=== SHOCKABLE RHYTHM DETECTED: {patient.rhythm.value.upper()} ===")
        actions.append(f"5. Deliver shock: {BIPHASIC_DEFIB_ENERGY_J[0]}J biphasic (or equivalent)")
        actions.append("6. Resume CPR immediately for 2 minutes")
        actions.append("7. Establish IV/IO access during CPR")

        # Epinephrine timing: after 2nd shock
        actions.append(f"8. After 2nd shock: Epinephrine {EPINEPHRINE_DOSE_MG} mg IV/IO")
        actions.append(f"   - Repeat every {EPINEPHRINE_INTERVAL_MIN}-5 minutes")

        # Antiarrhythmic after 3rd shock
        actions.append(f"9. After 3rd shock: Amiodarone {AMIODARONE_FIRST_DOSE_MG} mg IV/IO bolus")
        actions.append(f"   - Second dose: {AMIODARONE_SECOND_DOSE_MG} mg IV/IO if needed")
        actions.append(f"   - Alternative: Lidocaine {LIDOCAINE_FIRST_DOSE_MG_KG} mg/kg IV/IO")

        warnings.append("Refractory VF/pVT: consider double sequential defibrillation")
        warnings.append("Consider reversible causes (H's and T's) throughout resuscitation")

    else:
        actions.append(f"\n=== NON-SHOCKABLE RHYTHM: {patient.rhythm.value.upper()} ===")
        actions.append("5. Continue high-quality CPR for 2 minutes")
        actions.append("6. Establish IV/IO access")
        actions.append(f"7. Epinephrine {EPINEPHRINE_DOSE_MG} mg IV/IO as soon as feasible")
        actions.append(f"   - Repeat every {EPINEPHRINE_INTERVAL_MIN}-5 minutes")
        actions.append("8. Consider advanced airway (do not delay CPR)")
        actions.append("9. Check rhythm every 2 minutes")

        if patient.rhythm == CardiacRhythm.ASYSTOLE:
            warnings.append("Confirm asystole in multiple leads")
            warnings.append("Asystole is NOT a shockable rhythm - do NOT defibrillate")
        elif patient.rhythm == CardiacRhythm.PEA:
            warnings.append("PEA: aggressively search for and treat reversible causes")
            warnings.append("Narrow-complex PEA may indicate pseudo-PEA - consider ultrasound")

    # H's and T's reminder
    actions.append("\n=== SEARCH FOR REVERSIBLE CAUSES (H's and T's) ===")
    for category, causes in HS_AND_TS.items():
        for cause in causes:
            actions.append(f"  [{category}] {cause}")

    return {
        "algorithm": "cardiac_arrest",
        "rhythm": patient.rhythm.value,
        "rhythm_classification": rhythm_class.value,
        "actions": actions,
        "warnings": warnings,
        "disclaimer": "Clinical decision support only. Does not replace physician judgment.",
    }


def bradycardia_algorithm(patient: PatientState) -> dict:
    """
    AHA Bradycardia with Pulse Algorithm.
    Heart rate < 60 bpm with signs/symptoms of poor perfusion.
    """
    actions = []
    warnings = []

    actions.append("1. Assess airway, breathing, circulation")
    actions.append("2. Obtain 12-lead ECG if available")
    actions.append("3. Identify and treat underlying cause")

    hr = patient.heart_rate or 0
    unstable_signs = ["hypotension", "altered_mental_status", "chest_pain",
                      "acute_heart_failure", "syncope"]
    has_unstable_signs = any(s in patient.symptoms for s in unstable_signs)

    if hr < 50 or has_unstable_signs:
        actions.append(f"\n=== SYMPTOMATIC BRADYCARDIA (HR: {hr} bpm) ===")
        actions.append(f"4. Atropine {ATROPINE_DOSE_MG} mg IV bolus")
        actions.append(f"   - May repeat every 3-5 min (max {ATROPINE_MAX_DOSE_MG} mg)")
        actions.append("5. If atropine ineffective:")
        actions.append("   - Transcutaneous pacing (set rate ~60 bpm, increase mA until capture)")
        actions.append("   - Dopamine infusion 5-20 mcg/kg/min")
        actions.append("   - Epinephrine infusion 2-10 mcg/min")
        actions.append("6. Prepare for transvenous pacing if needed")

        if patient.rhythm in [CardiacRhythm.THIRD_DEGREE_BLOCK, CardiacRhythm.SECOND_DEGREE_TYPE2]:
            warnings.append("Atropine may be ineffective in high-degree AV block")
            warnings.append("Proceed directly to pacing for Mobitz Type II or 3rd degree block")
    else:
        actions.append(f"\n=== MONITOR (HR: {hr} bpm, hemodynamically stable) ===")
        actions.append("4. Monitor and observe")
        actions.append("5. Identify and treat reversible causes")

    return {
        "algorithm": "bradycardia",
        "heart_rate": hr,
        "actions": actions,
        "warnings": warnings,
        "disclaimer": "Clinical decision support only. Does not replace physician judgment.",
    }


def tachycardia_algorithm(patient: PatientState) -> dict:
    """
    AHA Tachycardia with Pulse Algorithm.
    Heart rate > 150 bpm typically causes hemodynamic instability.
    """
    actions = []
    warnings = []
    hr = patient.heart_rate or 0

    actions.append("1. Assess airway, breathing, circulation")
    actions.append("2. Obtain 12-lead ECG")
    actions.append("3. Determine if QRS is narrow (< 0.12s) or wide (>= 0.12s)")

    if not patient.is_stable:
        actions.append(f"\n=== UNSTABLE TACHYCARDIA (HR: {hr} bpm) ===")
        actions.append("4. Immediate synchronized cardioversion")
        actions.append("   - Sedate if possible (do not delay cardioversion)")
        if patient.rhythm in [CardiacRhythm.SVT, CardiacRhythm.AFIB_RVR]:
            energies = SYNCHRONIZED_CARDIOVERSION_NARROW
        else:
            energies = SYNCHRONIZED_CARDIOVERSION_WIDE
        actions.append(f"   - Energy sequence: {energies} J")
        warnings.append("Ensure synchronization is ON before delivering shock")
    else:
        if patient.rhythm == CardiacRhythm.SVT:
            actions.append(f"\n=== STABLE NARROW-COMPLEX TACHYCARDIA / SVT (HR: {hr}) ===")
            actions.append("4. Attempt vagal maneuvers (carotid sinus massage, Valsalva)")
            actions.append(f"5. Adenosine {ADENOSINE_FIRST_DOSE_MG} mg rapid IV push")
            actions.append(f"   - If no conversion: {ADENOSINE_SECOND_DOSE_MG} mg IV push")
            actions.append("   - Follow each dose with 20 mL NS rapid flush")
            actions.append("6. If refractory: consider calcium channel blocker or beta-blocker")
        elif patient.rhythm == CardiacRhythm.AFIB_RVR:
            actions.append(f"\n=== ATRIAL FIBRILLATION WITH RVR (HR: {hr}) ===")
            actions.append("4. Rate control: diltiazem 0.25 mg/kg IV over 2 min")
            actions.append("   - Or metoprolol 5 mg IV every 5 min (max 3 doses)")
            actions.append("5. Assess for anticoagulation need (CHA2DS2-VASc)")
        elif patient.rhythm == CardiacRhythm.VTACH_WITH_PULSE:
            actions.append(f"\n=== STABLE WIDE-COMPLEX TACHYCARDIA (HR: {hr}) ===")
            actions.append("4. If regular and monomorphic: consider antiarrhythmic")
            actions.append(f"   - Amiodarone 150 mg IV over 10 min, may repeat")
            actions.append(f"   - Or procainamide 20-50 mg/min IV (max 17 mg/kg)")
            actions.append("5. Prepare for cardioversion if deteriorates")
            warnings.append("Wide-complex tachycardia of uncertain type: treat as VT")

    return {
        "algorithm": "tachycardia",
        "heart_rate": hr,
        "rhythm": patient.rhythm.value,
        "stable": patient.is_stable,
        "actions": actions,
        "warnings": warnings,
        "disclaimer": "Clinical decision support only. Does not replace physician judgment.",
    }


def post_cardiac_arrest_care(patient: PatientState) -> dict:
    """
    Post-cardiac arrest care bundle per AHA guidelines.
    Initiated after return of spontaneous circulation (ROSC).
    """
    actions = [
        "=== POST-CARDIAC ARREST CARE (ROSC ACHIEVED) ===",
        "",
        "1. AIRWAY & VENTILATION",
        "   - Secure advanced airway if not already placed",
        "   - Target SpO2 92-98% (avoid hyperoxia)",
        "   - Target PaCO2 35-45 mmHg (avoid hyperventilation)",
        "   - Waveform capnography to confirm and monitor ET tube placement",
        "",
        "2. HEMODYNAMIC OPTIMIZATION",
        "   - Target SBP >= 90 mmHg, MAP >= 65 mmHg",
        "   - IV fluid bolus for hypotension",
        "   - Vasopressors/inotropes as needed (norepinephrine, epinephrine)",
        "   - 12-lead ECG: emergent cath lab if STEMI or high suspicion for ACS",
        "",
        "3. TARGETED TEMPERATURE MANAGEMENT (TTM)",
        "   - Select and maintain constant temperature 32-36 C for >= 24 hours",
        "   - Begin cooling as soon as feasible after ROSC",
        "   - Prevent and treat shivering",
        "   - Avoid fever (> 37.7 C) for at least 72 hours after ROSC",
        "",
        "4. NEUROLOGIC ASSESSMENT",
        "   - Serial neurologic exams",
        "   - Avoid prognostication before 72 hours post-ROSC (or 72 hours after rewarming)",
        "   - Consider EEG, somatosensory evoked potentials, brain MRI",
        "",
        "5. METABOLIC OPTIMIZATION",
        "   - Blood glucose 140-180 mg/dL (avoid hypoglycemia)",
        "   - Electrolyte monitoring and correction",
        "   - Treat seizures aggressively",
    ]

    return {
        "algorithm": "post_cardiac_arrest_care",
        "actions": actions,
        "disclaimer": "Clinical decision support only. Does not replace physician judgment.",
    }


def run_acls_protocol(rhythm_str: str, has_pulse: bool = False,
                      heart_rate: int = None, stable: bool = True,
                      symptoms: list = None) -> str:
    """
    Main entry point for the ACLS Protocol Assistant.

    Args:
        rhythm_str: String identifier for cardiac rhythm
        has_pulse: Whether patient has a palpable pulse
        heart_rate: Heart rate in bpm (if applicable)
        stable: Whether patient is hemodynamically stable
        symptoms: List of current symptoms

    Returns:
        JSON string with protocol guidance
    """
    try:
        rhythm = CardiacRhythm(rhythm_str)
    except ValueError:
        return json.dumps({
            "error": f"Unknown rhythm: {rhythm_str}",
            "valid_rhythms": [r.value for r in CardiacRhythm],
        }, indent=2)

    patient = PatientState(
        rhythm=rhythm,
        has_pulse=has_pulse,
        heart_rate=heart_rate,
        is_stable=stable,
        symptoms=symptoms or [],
    )

    # Route to appropriate algorithm
    if not has_pulse:
        result = cardiac_arrest_algorithm(patient)
    elif rhythm == CardiacRhythm.ROSC:
        result = post_cardiac_arrest_care(patient)
    elif heart_rate and heart_rate < 60:
        result = bradycardia_algorithm(patient)
    elif heart_rate and heart_rate > 100:
        result = tachycardia_algorithm(patient)
    else:
        result = {
            "algorithm": "monitoring",
            "actions": ["Patient has pulse and stable vital signs. Continue monitoring."],
            "disclaimer": "Clinical decision support only. Does not replace physician judgment.",
        }

    return json.dumps(result, indent=2)


if __name__ == "__main__":
    # Example: VF cardiac arrest
    print("=== VF Cardiac Arrest ===")
    print(run_acls_protocol("ventricular_fibrillation", has_pulse=False))
    print()

    # Example: Symptomatic bradycardia
    print("=== Symptomatic Bradycardia ===")
    print(run_acls_protocol("sinus_bradycardia", has_pulse=True,
                            heart_rate=38, stable=False,
                            symptoms=["hypotension", "syncope"]))
