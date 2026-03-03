#!/usr/bin/env python3
"""
Clinical Case Scenario Generator
==================================
Generates realistic clinical case scenarios for medical education,
assessment, and simulation-based training. Cases follow a structured
clinical vignette format suitable for problem-based learning (PBL),
standardized patient encounters, and board-style practice.

Clinical Purpose:
    Creates structured clinical cases with presenting complaint, history,
    physical examination findings, diagnostic workup, and management
    decision points. Cases are designed to teach clinical reasoning,
    differential diagnosis development, and evidence-based management.

References:
    - Barrows HS, Tamblyn RM. Problem-Based Learning. Springer, 1980.
    - Eva KW. "What Every Teacher Needs to Know About Clinical Reasoning."
      Med Educ. 2005;39(1):98-106.
    - Kassirer JP. "Teaching Clinical Reasoning: Case-Based and Coached."
      Acad Med. 2010;85(7):1118-1124.

DISCLAIMER: Cases are for educational purposes only. Clinical details
are representative and should not be used for actual patient management.
"""

import json
import random
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


class Specialty(Enum):
    INTERNAL_MEDICINE = "internal_medicine"
    EMERGENCY = "emergency_medicine"
    PEDIATRICS = "pediatrics"
    SURGERY = "surgery"
    OBSTETRICS = "obstetrics_gynecology"
    PSYCHIATRY = "psychiatry"
    FAMILY_MEDICINE = "family_medicine"
    NEUROLOGY = "neurology"
    CARDIOLOGY = "cardiology"
    PULMONOLOGY = "pulmonology"


class Complexity(Enum):
    BASIC = "basic"          # Medical students, early clinical
    INTERMEDIATE = "intermediate"  # Advanced students, interns
    ADVANCED = "advanced"     # Residents, fellows


class CasePhase(Enum):
    PRESENTATION = "initial_presentation"
    HISTORY = "history_and_physical"
    WORKUP = "diagnostic_workup"
    MANAGEMENT = "management_decisions"
    OUTCOME = "outcome_and_followup"


@dataclass
class VitalSigns:
    temperature_f: float
    heart_rate: int
    blood_pressure_systolic: int
    blood_pressure_diastolic: int
    respiratory_rate: int
    spo2: int
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None

    def to_dict(self):
        return {
            "temperature": f"{self.temperature_f} F ({round((self.temperature_f-32)*5/9, 1)} C)",
            "heart_rate": f"{self.heart_rate} bpm",
            "blood_pressure": f"{self.blood_pressure_systolic}/{self.blood_pressure_diastolic} mmHg",
            "respiratory_rate": f"{self.respiratory_rate}/min",
            "spo2": f"{self.spo2}%",
            "weight": f"{self.weight_kg} kg" if self.weight_kg else None,
        }


@dataclass
class ClinicalCase:
    case_id: str
    title: str
    specialty: Specialty
    complexity: Complexity
    learning_objectives: list
    patient_demographics: dict
    chief_complaint: str
    history_of_present_illness: str
    past_medical_history: list
    medications: list
    allergies: list
    social_history: dict
    family_history: list
    review_of_systems: dict
    vital_signs: VitalSigns
    physical_exam: dict
    initial_labs: dict = field(default_factory=dict)
    imaging: dict = field(default_factory=dict)
    differential_diagnosis: list = field(default_factory=list)
    most_likely_diagnosis: str = ""
    key_findings: list = field(default_factory=list)
    management_plan: list = field(default_factory=list)
    teaching_points: list = field(default_factory=list)
    red_flags: list = field(default_factory=list)


# Case template database
CASE_TEMPLATES = {
    "chest_pain_acs": ClinicalCase(
        case_id="IM-001",
        title="Acute Chest Pain - Possible ACS",
        specialty=Specialty.INTERNAL_MEDICINE,
        complexity=Complexity.INTERMEDIATE,
        learning_objectives=[
            "Recognize classic and atypical presentations of acute coronary syndrome",
            "Apply HEART score for risk stratification",
            "Initiate appropriate initial management for NSTEMI",
            "Develop a differential diagnosis for acute chest pain",
        ],
        patient_demographics={
            "age": 62,
            "sex": "Male",
            "race": "Caucasian",
            "occupation": "Retired accountant",
        },
        chief_complaint="Crushing chest pressure for 2 hours",
        history_of_present_illness=(
            "62-year-old male presents to the ED with 2 hours of substernal chest "
            "pressure described as 'an elephant sitting on my chest.' Pain radiates "
            "to the left arm and jaw. Associated with diaphoresis and nausea. Pain "
            "began at rest while watching television. Patient took one aspirin at home "
            "before calling 911. No relief with position changes. Denies recent trauma, "
            "fever, or cough. No prior episodes of similar chest pain."
        ),
        past_medical_history=[
            "Hypertension x 15 years",
            "Type 2 diabetes mellitus x 10 years",
            "Hyperlipidemia",
            "Former smoker (40 pack-years, quit 2 years ago)",
        ],
        medications=[
            "Lisinopril 20 mg daily",
            "Metformin 1000 mg twice daily",
            "Atorvastatin 40 mg nightly",
            "Aspirin 81 mg daily",
        ],
        allergies=["NKDA"],
        social_history={
            "tobacco": "Former smoker, 40 pack-years, quit 2 years ago",
            "alcohol": "Social, 2-3 beers/week",
            "drugs": "Denies",
            "exercise": "Sedentary",
            "diet": "Western diet, high in processed foods",
        },
        family_history=[
            "Father: MI at age 58, died age 65",
            "Mother: Hypertension, alive age 84",
            "Brother: CABG at age 60",
        ],
        review_of_systems={
            "cardiovascular": "Chest pressure (see HPI), diaphoresis",
            "gastrointestinal": "Nausea, no vomiting",
            "respiratory": "Mild dyspnea",
            "neurological": "No syncope, dizziness, or headache",
            "musculoskeletal": "No reproducible chest wall tenderness",
        },
        vital_signs=VitalSigns(
            temperature_f=98.6, heart_rate=92,
            blood_pressure_systolic=158, blood_pressure_diastolic=94,
            respiratory_rate=20, spo2=96, weight_kg=95,
        ),
        physical_exam={
            "general": "Anxious-appearing male, diaphoretic, in moderate distress",
            "cardiovascular": "Regular rate and rhythm, no murmurs, rubs, or gallops. "
                              "JVP not elevated. Peripheral pulses intact bilaterally.",
            "respiratory": "Clear to auscultation bilaterally, no wheezes or crackles",
            "abdomen": "Soft, non-tender, non-distended, normal bowel sounds",
            "extremities": "No lower extremity edema, no calf tenderness",
            "skin": "Diaphoretic, no cyanosis",
        },
        initial_labs={
            "troponin_I": "0.45 ng/mL (normal < 0.04)",
            "BNP": "180 pg/mL",
            "CBC": "WBC 9.8, Hgb 14.2, Plt 220",
            "BMP": "Na 140, K 4.2, Cr 1.1, Glucose 188",
            "PT_INR": "INR 1.0",
            "lipid_panel": "Total cholesterol 242, LDL 162, HDL 38, TG 210",
        },
        imaging={
            "ECG": "Normal sinus rhythm, ST depression in V4-V6 and leads I, aVL. "
                   "No ST elevation. No pathological Q waves.",
            "CXR": "No cardiomegaly. Clear lung fields. No pleural effusion.",
        },
        differential_diagnosis=[
            {"diagnosis": "NSTEMI (acute coronary syndrome)", "likelihood": "highest",
             "supporting_evidence": "Troponin elevation, ST depression, risk factors, classic presentation"},
            {"diagnosis": "Unstable angina", "likelihood": "moderate",
             "supporting_evidence": "Would present similarly but troponin would be negative"},
            {"diagnosis": "Aortic dissection", "likelihood": "low",
             "supporting_evidence": "Acute onset, but tearing/ripping quality expected. Equal BPs bilaterally."},
            {"diagnosis": "Pulmonary embolism", "likelihood": "low",
             "supporting_evidence": "Chest pain and dyspnea, but presentation more typical of ACS"},
            {"diagnosis": "Pericarditis", "likelihood": "low",
             "supporting_evidence": "Would expect diffuse ST elevation, pleuritic quality, friction rub"},
        ],
        most_likely_diagnosis="NSTEMI (Non-ST Elevation Myocardial Infarction)",
        key_findings=[
            "Elevated troponin (0.45 ng/mL) confirms myocardial injury",
            "ST depression in lateral leads (V4-V6, I, aVL)",
            "Multiple cardiac risk factors (HTN, DM, HLD, smoking history, family history)",
            "Classic ACS presentation: substernal pressure, radiation, diaphoresis",
        ],
        management_plan=[
            "1. DUAL ANTIPLATELET THERAPY: Aspirin 325 mg + P2Y12 inhibitor (ticagrelor 180 mg load)",
            "2. ANTICOAGULATION: Heparin drip (60 units/kg bolus, 12 units/kg/hr infusion)",
            "3. ANTI-ISCHEMIC: Nitroglycerin SL or IV for ongoing pain, morphine if refractory",
            "4. BETA-BLOCKER: Metoprolol 25 mg PO if no contraindications (HR goal 50-60)",
            "5. HIGH-INTENSITY STATIN: Atorvastatin 80 mg",
            "6. SERIAL TROPONINS: Q6 hours x 3",
            "7. CARDIOLOGY CONSULT: Early invasive strategy (cath within 24 hours)",
            "8. CONTINUOUS TELEMETRY: Monitor for arrhythmias",
            "9. NPO for possible catheterization",
        ],
        teaching_points=[
            "HEART score: History (2) + ECG (2) + Age (2) + Risk factors (2) + Troponin (2) = 10 (high risk)",
            "Elevated troponin distinguishes NSTEMI from unstable angina",
            "NSTEMI = troponin positive without persistent ST elevation",
            "Early invasive strategy (cath within 24h) recommended for high-risk NSTEMI",
            "Dual antiplatelet therapy duration: typically 12 months post-ACS",
            "Always consider aortic dissection before initiating anticoagulation",
            "Diabetes and female sex are risk factors for atypical ACS presentations",
        ],
        red_flags=[
            "Hemodynamic instability (cardiogenic shock) - emergent cath",
            "Refractory chest pain despite medical therapy",
            "New-onset heart failure or mitral regurgitation",
            "Ventricular arrhythmias",
        ],
    ),
    "pediatric_fever": ClinicalCase(
        case_id="PED-001",
        title="Febrile Infant - Sepsis Workup",
        specialty=Specialty.PEDIATRICS,
        complexity=Complexity.INTERMEDIATE,
        learning_objectives=[
            "Apply age-based approach to febrile infants",
            "Determine appropriate sepsis workup for age group",
            "Recognize indications for empiric antibiotics in neonates",
            "Apply Rochester/Philadelphia/Boston criteria for low-risk stratification",
        ],
        patient_demographics={
            "age": 0.75,  # 3 weeks
            "age_display": "21 days",
            "sex": "Female",
            "weight_kg": 3.8,
        },
        chief_complaint="Fever of 100.8 F noted by parents 3 hours ago",
        history_of_present_illness=(
            "21-day-old female infant brought to the ED by parents after noting a "
            "rectal temperature of 100.8 F (38.2 C) at home. Parents report the baby "
            "has been slightly more fussy than usual over the past 6 hours and has "
            "had decreased feeding (usually breastfeeds every 2-3 hours, last fed "
            "5 hours ago and took only half the usual amount). No vomiting, diarrhea, "
            "or rash. No cough, congestion, or rhinorrhea. Born at 39 weeks via normal "
            "spontaneous vaginal delivery. Birth weight 3.4 kg. Maternal GBS status "
            "negative. No complications during delivery. Newborn screening normal."
        ),
        past_medical_history=[
            "Full-term birth, uncomplicated delivery",
            "Birth weight 3.4 kg",
            "Newborn screening: normal",
            "No prior hospitalizations",
        ],
        medications=["Vitamin D drops 400 IU daily"],
        allergies=["NKDA"],
        social_history={
            "home": "Lives with parents, no siblings",
            "exposures": "No known sick contacts",
            "feeding": "Exclusively breastfed, gaining well at 2-week visit",
        },
        family_history=[
            "No family history of immunodeficiency",
            "No recurrent infections in family",
        ],
        review_of_systems={
            "general": "Decreased feeding, increased fussiness",
            "gastrointestinal": "Last wet diaper 4 hours ago (usually every 2 hours)",
            "respiratory": "No cough, no noisy breathing",
            "skin": "No rash noted by parents",
        },
        vital_signs=VitalSigns(
            temperature_f=100.9, heart_rate=172,
            blood_pressure_systolic=72, blood_pressure_diastolic=45,
            respiratory_rate=48, spo2=98, weight_kg=3.8,
        ),
        physical_exam={
            "general": "Alert but fussy infant, cries with handling, consolable by parent",
            "HEENT": "Anterior fontanelle soft and flat, no bulging. TMs clear bilaterally.",
            "cardiovascular": "Tachycardic, regular rhythm, no murmur. Cap refill < 3 seconds.",
            "respiratory": "Clear, no retractions, no grunting, no nasal flaring",
            "abdomen": "Soft, non-distended, no hepatosplenomegaly",
            "skin": "No rash, no petechiae, no jaundice. Good skin turgor.",
            "neurological": "Active, symmetric movements, good tone, strong cry",
            "musculoskeletal": "Moving all extremities symmetrically",
        },
        initial_labs={
            "CBC": "WBC 16.2 (segs 55%, bands 8%, lymphs 30%), Hgb 15.1, Plt 285",
            "CRP": "1.8 mg/dL (normal < 0.5)",
            "procalcitonin": "0.6 ng/mL",
            "BMP": "Na 138, K 5.1, Glucose 72",
            "urinalysis": "Clear, negative leukocyte esterase, negative nitrites",
            "blood_culture": "Pending",
            "urine_culture": "Pending (catheterized specimen obtained)",
            "CSF_analysis": "WBC 5 (100% lymphocytes), RBC 0, Protein 85, Glucose 45",
            "CSF_culture": "Pending",
        },
        imaging={
            "CXR": "No infiltrates or effusions. Normal cardiac silhouette.",
        },
        differential_diagnosis=[
            {"diagnosis": "Early-onset neonatal sepsis (bacterial)", "likelihood": "must exclude",
             "supporting_evidence": "Age < 28 days, fever, elevated CRP and bands"},
            {"diagnosis": "Urinary tract infection", "likelihood": "moderate",
             "supporting_evidence": "Common in febrile infants, UA negative but culture pending"},
            {"diagnosis": "Viral illness", "likelihood": "moderate",
             "supporting_evidence": "Most fevers in this age group are viral, but must exclude bacterial"},
            {"diagnosis": "Meningitis", "likelihood": "low but must exclude",
             "supporting_evidence": "CSF appears reassuring but cultures pending"},
            {"diagnosis": "Herpes simplex virus", "likelihood": "low",
             "supporting_evidence": "No vesicles, no seizures, but consider in ill neonates"},
        ],
        most_likely_diagnosis="Neonatal fever requiring full sepsis evaluation",
        key_findings=[
            "Age < 28 days with fever >= 38.0 C = FULL SEPSIS WORKUP mandatory",
            "Elevated band count (8%) and CRP suggest possible bacterial infection",
            "CSF parameters within normal limits for age (neonatal CSF protein up to 150 mg/dL)",
            "Decreased feeding and fussiness are nonspecific but concerning in neonates",
        ],
        management_plan=[
            "1. ADMIT to hospital (all febrile neonates < 28 days require admission)",
            "2. EMPIRIC ANTIBIOTICS: Ampicillin 50 mg/kg IV Q8H + Gentamicin 4 mg/kg IV Q24H",
            "3. Consider adding Acyclovir 20 mg/kg IV Q8H if concern for HSV",
            "4. IV fluids: D10 1/4 NS at maintenance rate",
            "5. Serial clinical assessments Q4 hours",
            "6. Follow blood, urine, and CSF cultures at 24 and 48 hours",
            "7. Reassess antibiotic therapy based on culture results at 48 hours",
            "8. If cultures negative at 48 hours and clinically improved: consider discharge",
        ],
        teaching_points=[
            "ALL febrile infants < 28 days require full sepsis workup (blood, urine, CSF) and empiric antibiotics",
            "Infants 29-60 days: risk stratification using clinical criteria (Rochester, Step-by-Step)",
            "Neonatal meningitis pathogens: GBS, E. coli, Listeria (hence ampicillin coverage)",
            "Normal neonatal CSF: up to 25-30 WBCs, protein up to 100-150 mg/dL",
            "Procalcitonin > 0.5 ng/mL in neonates is a more specific marker for bacterial infection",
            "HSV must be considered in ill-appearing neonates, especially with seizures or vesicles",
            "Febrile neonates may present with subtle signs: irritability, poor feeding, or just 'not right'",
        ],
        red_flags=[
            "Ill appearance, lethargy, or poor perfusion = immediate resuscitation",
            "Seizures in febrile neonate = consider HSV meningitis (add acyclovir)",
            "Vesicular rash = high suspicion for HSV",
            "Bulging fontanelle = meningitis until proven otherwise",
        ],
    ),
}


def generate_case(specialty: str = None, complexity: str = None) -> dict:
    """
    Generate a clinical case scenario.

    Args:
        specialty: Filter by medical specialty
        complexity: Filter by complexity level (basic, intermediate, advanced)

    Returns:
        Complete clinical case with all phases
    """
    available = list(CASE_TEMPLATES.values())

    if specialty:
        filtered = [c for c in available if c.specialty.value == specialty]
        if filtered:
            available = filtered

    if complexity:
        filtered = [c for c in available if c.complexity.value == complexity]
        if filtered:
            available = filtered

    if not available:
        return {"error": "No cases match the specified criteria",
                "available_specialties": [s.value for s in Specialty],
                "available_complexities": [c.value for c in Complexity]}

    case = available[0]  # In production, would randomly select or cycle

    return {
        "case_id": case.case_id,
        "title": case.title,
        "specialty": case.specialty.value,
        "complexity": case.complexity.value,
        "learning_objectives": case.learning_objectives,
        "presentation": {
            "demographics": case.patient_demographics,
            "chief_complaint": case.chief_complaint,
            "hpi": case.history_of_present_illness,
        },
        "history": {
            "past_medical_history": case.past_medical_history,
            "medications": case.medications,
            "allergies": case.allergies,
            "social_history": case.social_history,
            "family_history": case.family_history,
            "review_of_systems": case.review_of_systems,
        },
        "examination": {
            "vital_signs": case.vital_signs.to_dict(),
            "physical_exam": case.physical_exam,
        },
        "workup": {
            "labs": case.initial_labs,
            "imaging": case.imaging,
        },
        "clinical_reasoning": {
            "differential_diagnosis": case.differential_diagnosis,
            "most_likely_diagnosis": case.most_likely_diagnosis,
            "key_findings": case.key_findings,
        },
        "management": {
            "plan": case.management_plan,
            "red_flags": case.red_flags,
        },
        "education": {
            "teaching_points": case.teaching_points,
        },
        "disclaimer": "Fictional case for educational purposes only.",
    }


def get_case_summary(case_id: str) -> dict:
    """Get a brief summary of a case without revealing the diagnosis."""
    for key, case in CASE_TEMPLATES.items():
        if case.case_id == case_id:
            return {
                "case_id": case.case_id,
                "chief_complaint": case.chief_complaint,
                "demographics": case.patient_demographics,
                "vital_signs": case.vital_signs.to_dict(),
                "hpi_preview": case.history_of_present_illness[:200] + "...",
                "instructions": "Review the presentation and develop your differential before proceeding.",
            }
    return {"error": f"Case {case_id} not found"}


def list_available_cases() -> dict:
    """List all available case scenarios."""
    cases = []
    for key, case in CASE_TEMPLATES.items():
        cases.append({
            "case_id": case.case_id,
            "title": case.title,
            "specialty": case.specialty.value,
            "complexity": case.complexity.value,
            "chief_complaint": case.chief_complaint,
        })
    return {
        "available_cases": cases,
        "total": len(cases),
        "specialties_covered": list(set(c.specialty.value for c in CASE_TEMPLATES.values())),
    }


def run_case_generator(action: str, **kwargs) -> str:
    """
    Main entry point for the Clinical Case Generator.

    Actions:
        generate: Generate a full clinical case (specialty, complexity)
        summary: Get case summary without diagnosis (case_id)
        list: List all available cases
    """
    if action == "generate":
        result = generate_case(kwargs.get("specialty"), kwargs.get("complexity"))
    elif action == "summary":
        result = get_case_summary(kwargs.get("case_id", ""))
    elif action == "list":
        result = list_available_cases()
    else:
        result = {
            "error": f"Unknown action: {action}",
            "available_actions": ["generate", "summary", "list"],
        }

    return json.dumps(result, indent=2)


if __name__ == "__main__":
    print("=== Available Cases ===")
    print(run_case_generator("list"))
    print()
    print("=== Internal Medicine Case ===")
    print(run_case_generator("generate", specialty="internal_medicine"))
