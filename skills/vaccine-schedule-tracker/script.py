#!/usr/bin/env python3
"""
Immunization Schedule Tracker
===============================
CDC-recommended immunization schedule tracker for pediatric (birth-18 years)
and adult (19+ years) vaccinations. Identifies overdue immunizations,
generates catch-up schedules, and provides contraindication screening.

Clinical Purpose:
    Assists clinicians in determining which vaccines a patient is due for
    based on age and vaccination history, generating catch-up schedules
    for patients who are behind, and screening for contraindications.
    Follows the Advisory Committee on Immunization Practices (ACIP)
    recommended immunization schedules.

References:
    - CDC. "Recommended Child and Adolescent Immunization Schedule for
      ages 18 years or younger." ACIP, 2026.
    - CDC. "Recommended Adult Immunization Schedule for ages 19 years
      or older." ACIP, 2026.
    - Kroger A, et al. "General Best Practice Guidelines for
      Immunization." ACIP, Updated 2023.

DISCLAIMER: Immunization schedules are updated annually by ACIP. This
tool reflects guidelines current as of implementation. Always verify
against the most current CDC immunization schedule before administering
vaccines. Clinical judgment is required for patients with special
conditions or contraindications.
"""

import json
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Optional
from enum import Enum


class VaccineCategory(Enum):
    ROUTINE_PEDIATRIC = "routine_pediatric"
    ROUTINE_ADULT = "routine_adult"
    CATCH_UP = "catch_up"
    HIGH_RISK = "high_risk_groups"
    TRAVEL = "travel"
    PREGNANCY = "pregnancy"


class VaccineStatus(Enum):
    UP_TO_DATE = "up_to_date"
    DUE_NOW = "due_now"
    OVERDUE = "overdue"
    NOT_YET_DUE = "not_yet_due"
    SERIES_COMPLETE = "series_complete"
    CONTRAINDICATED = "contraindicated"


@dataclass
class Vaccine:
    """Vaccine definition with schedule parameters."""
    name: str
    abbreviation: str
    series_doses: int
    routine_schedule_months: list  # Ages in months for each dose
    minimum_ages_months: list  # Minimum age for each dose
    minimum_intervals_days: list  # Minimum interval between doses
    catch_up_max_age_months: Optional[int] = None
    contraindications: list = field(default_factory=list)
    precautions: list = field(default_factory=list)
    notes: list = field(default_factory=list)
    route: str = "IM"
    live_vaccine: bool = False


# CDC Recommended Pediatric Immunization Schedule (simplified)
PEDIATRIC_VACCINES = {
    "HepB": Vaccine(
        name="Hepatitis B",
        abbreviation="HepB",
        series_doses=3,
        routine_schedule_months=[0, 1, 6],
        minimum_ages_months=[0, 1, 6],
        minimum_intervals_days=[0, 28, 56],  # Dose 2 >= 4 weeks after 1, dose 3 >= 8 weeks after 2
        notes=[
            "Birth dose: administer within 24 hours of birth",
            "Monovalent HepB for birth dose",
            "Final dose no earlier than age 24 weeks",
            "Minimum interval dose 1 to 3: 16 weeks",
        ],
    ),
    "RV": Vaccine(
        name="Rotavirus",
        abbreviation="RV",
        series_doses=3,  # RV5 (RotaTeq) = 3 doses; RV1 (Rotarix) = 2 doses
        routine_schedule_months=[2, 4, 6],
        minimum_ages_months=[1.5, 3, 5],  # 6 weeks, 10 weeks, 14 weeks
        minimum_intervals_days=[0, 28, 28],
        catch_up_max_age_months=8,  # Do not start after 15 weeks, do not finish after 8 months
        contraindications=["History of intussusception", "SCID"],
        notes=[
            "Do NOT initiate series after age 15 weeks 0 days",
            "Do NOT administer any dose after age 8 months 0 days",
            "RV1 (Rotarix): 2-dose series at 2 and 4 months",
            "RV5 (RotaTeq): 3-dose series at 2, 4, and 6 months",
        ],
        route="PO",
        live_vaccine=True,
    ),
    "DTaP": Vaccine(
        name="Diphtheria, Tetanus, Pertussis (acellular)",
        abbreviation="DTaP",
        series_doses=5,
        routine_schedule_months=[2, 4, 6, 15, 48],
        minimum_ages_months=[1.5, 3, 5, 12, 48],
        minimum_intervals_days=[0, 28, 28, 180, 180],
        notes=[
            "5th dose not needed if 4th dose given at >= 4 years",
            "Use DTaP for children < 7 years; Tdap for >= 7 years",
            "Dose 4: minimum age 12 months, minimum interval 6 months after dose 3",
        ],
    ),
    "Hib": Vaccine(
        name="Haemophilus influenzae type b",
        abbreviation="Hib",
        series_doses=4,  # PRP-T: 4 doses; PRP-OMP: 3 doses
        routine_schedule_months=[2, 4, 6, 12],
        minimum_ages_months=[1.5, 3, 5, 12],
        minimum_intervals_days=[0, 28, 28, 56],
        notes=[
            "PRP-OMP (PedvaxHIB): 2-dose primary + booster = 3 total (no 6-month dose)",
            "PRP-T (ActHIB, Hiberix): 3-dose primary + booster = 4 total",
            "Unvaccinated children >= 15 months need only 1 dose",
            "Not routinely recommended for healthy children >= 5 years",
        ],
    ),
    "PCV": Vaccine(
        name="Pneumococcal Conjugate (PCV15 or PCV20)",
        abbreviation="PCV",
        series_doses=4,
        routine_schedule_months=[2, 4, 6, 12],
        minimum_ages_months=[1.5, 3, 5, 12],
        minimum_intervals_days=[0, 28, 28, 56],
        notes=[
            "PCV20 preferred (covers 20 serotypes)",
            "If PCV15 used: follow with PPSV23 at >= 2 years for high-risk children",
            "Healthy children: 3 doses + booster standard schedule",
        ],
    ),
    "IPV": Vaccine(
        name="Inactivated Poliovirus",
        abbreviation="IPV",
        series_doses=4,
        routine_schedule_months=[2, 4, 6, 48],
        minimum_ages_months=[1.5, 3, 5, 48],
        minimum_intervals_days=[0, 28, 28, 180],
        notes=[
            "Final dose on or after age 4 years with >= 6 months since prior dose",
            "4th dose not needed if 3rd dose given at >= 4 years and >= 6 months since dose 2",
            "OPV not used in the United States since 2000",
        ],
    ),
    "MMR": Vaccine(
        name="Measles, Mumps, Rubella",
        abbreviation="MMR",
        series_doses=2,
        routine_schedule_months=[12, 48],
        minimum_ages_months=[12, 13],
        minimum_intervals_days=[0, 28],
        contraindications=[
            "Severe immunodeficiency (HIV with CD4 < 15%)",
            "Pregnancy",
            "History of anaphylaxis to neomycin or gelatin",
        ],
        notes=[
            "Dose 1 at 12-15 months, Dose 2 at 4-6 years",
            "Minimum interval between doses: 28 days",
            "May give as early as 6 months for international travel (dose does not count)",
            "MMRV (ProQuad): may be used for children 12 months-12 years",
        ],
        live_vaccine=True,
    ),
    "VAR": Vaccine(
        name="Varicella",
        abbreviation="VAR",
        series_doses=2,
        routine_schedule_months=[12, 48],
        minimum_ages_months=[12, 15],
        minimum_intervals_days=[0, 84],  # 3 months minimum between doses
        contraindications=[
            "Severe immunodeficiency",
            "Pregnancy",
            "Recent blood product receipt (varies by product)",
        ],
        notes=[
            "Dose 1 at 12-15 months, Dose 2 at 4-6 years",
            "Minimum interval: 3 months (if age < 13 years), 4 weeks (if >= 13 years)",
            "History of varicella disease = immune, no vaccine needed",
        ],
        live_vaccine=True,
    ),
    "HepA": Vaccine(
        name="Hepatitis A",
        abbreviation="HepA",
        series_doses=2,
        routine_schedule_months=[12, 18],
        minimum_ages_months=[12, 18],
        minimum_intervals_days=[0, 180],
        notes=[
            "2-dose series starting at 12 months",
            "Minimum interval between doses: 6 months",
            "Can be given to anyone >= 12 months wanting protection",
        ],
    ),
    "Influenza": Vaccine(
        name="Influenza (annual)",
        abbreviation="IIV/LAIV",
        series_doses=1,  # Annual; 2 doses first season if < 9 years
        routine_schedule_months=[6],  # Starting at 6 months, then annually
        minimum_ages_months=[6],
        minimum_intervals_days=[0],
        notes=[
            "Annual vaccination recommended for everyone >= 6 months",
            "Children 6 months - 8 years: 2 doses (4 weeks apart) in first season vaccinated",
            "LAIV (nasal spray): approved for ages 2-49 years, not severely immunocompromised",
            "IIV (injection): any age >= 6 months",
        ],
    ),
}


@dataclass
class PatientRecord:
    """Patient immunization record."""
    patient_id: str
    date_of_birth: str  # ISO format
    doses_received: dict = field(default_factory=dict)  # vaccine_abbrev -> [dates]
    contraindications: list = field(default_factory=list)
    special_conditions: list = field(default_factory=list)


def calculate_age_months(dob_str: str, reference_date: str = None) -> int:
    """Calculate age in months from date of birth."""
    dob = datetime.fromisoformat(dob_str)
    ref = datetime.fromisoformat(reference_date) if reference_date else datetime.now()
    months = (ref.year - dob.year) * 12 + (ref.month - dob.month)
    if ref.day < dob.day:
        months -= 1
    return max(0, months)


def check_vaccine_status(vaccine: Vaccine, age_months: int,
                         doses_received: list = None) -> dict:
    """
    Determine vaccine status for a patient.

    Args:
        vaccine: Vaccine definition
        age_months: Patient age in months
        doses_received: List of dates doses were given (ISO format)

    Returns:
        Status, next due date, and recommendations
    """
    doses_received = doses_received or []
    doses_given = len(doses_received)

    # Series complete check
    if doses_given >= vaccine.series_doses:
        return {
            "vaccine": vaccine.abbreviation,
            "status": VaccineStatus.SERIES_COMPLETE.value,
            "doses_given": doses_given,
            "doses_required": vaccine.series_doses,
            "message": f"{vaccine.name} series is complete.",
        }

    # Determine which dose number is next
    next_dose_num = doses_given  # 0-indexed into schedule
    if next_dose_num >= len(vaccine.routine_schedule_months):
        return {
            "vaccine": vaccine.abbreviation,
            "status": VaccineStatus.SERIES_COMPLETE.value,
            "doses_given": doses_given,
            "doses_required": vaccine.series_doses,
            "message": f"{vaccine.name} series appears complete.",
        }

    # Age-based assessment
    recommended_age = vaccine.routine_schedule_months[next_dose_num]
    minimum_age = vaccine.minimum_ages_months[next_dose_num]

    # Catch-up max age check
    if vaccine.catch_up_max_age_months and age_months > vaccine.catch_up_max_age_months:
        return {
            "vaccine": vaccine.abbreviation,
            "status": "aged_out",
            "doses_given": doses_given,
            "message": f"Patient has aged out of {vaccine.name} eligibility "
                       f"(max age: {vaccine.catch_up_max_age_months} months).",
        }

    if age_months < minimum_age:
        status = VaccineStatus.NOT_YET_DUE
        message = (f"Dose {next_dose_num + 1} of {vaccine.name} not yet due. "
                   f"Recommended at {recommended_age} months (minimum: {minimum_age} months).")
    elif age_months >= recommended_age + 2:  # > 2 months past recommended
        status = VaccineStatus.OVERDUE
        message = (f"Dose {next_dose_num + 1} of {vaccine.name} is OVERDUE. "
                   f"Was due at {recommended_age} months. Administer at next visit.")
    elif age_months >= recommended_age:
        status = VaccineStatus.DUE_NOW
        message = f"Dose {next_dose_num + 1} of {vaccine.name} is DUE NOW."
    else:
        status = VaccineStatus.NOT_YET_DUE
        message = (f"Dose {next_dose_num + 1} of {vaccine.name} recommended at "
                   f"{recommended_age} months.")

    return {
        "vaccine": vaccine.abbreviation,
        "vaccine_name": vaccine.name,
        "status": status.value,
        "doses_given": doses_given,
        "doses_required": vaccine.series_doses,
        "next_dose_number": next_dose_num + 1,
        "recommended_age_months": recommended_age,
        "minimum_age_months": minimum_age,
        "message": message,
        "route": vaccine.route,
        "live_vaccine": vaccine.live_vaccine,
        "notes": vaccine.notes,
    }


def generate_immunization_report(dob: str, doses_received: dict = None,
                                  reference_date: str = None) -> dict:
    """
    Generate a complete immunization status report for a pediatric patient.

    Args:
        dob: Date of birth (ISO format)
        doses_received: Dict mapping vaccine abbreviation to list of dates
        reference_date: Reference date for age calculation (default: today)

    Returns:
        Complete immunization report with status for each vaccine
    """
    doses_received = doses_received or {}
    age_months = calculate_age_months(dob, reference_date)

    # Determine which vaccines apply to this age
    applicable_vaccines = {}
    for abbrev, vaccine in PEDIATRIC_VACCINES.items():
        first_dose_age = vaccine.routine_schedule_months[0]
        if age_months >= first_dose_age or (age_months >= first_dose_age - 1):
            applicable_vaccines[abbrev] = vaccine

    # Check status for each applicable vaccine
    vaccine_statuses = []
    due_now = []
    overdue = []

    for abbrev, vaccine in applicable_vaccines.items():
        patient_doses = doses_received.get(abbrev, [])
        status = check_vaccine_status(vaccine, age_months, patient_doses)
        vaccine_statuses.append(status)

        if status["status"] == VaccineStatus.DUE_NOW.value:
            due_now.append(status["vaccine_name"] if "vaccine_name" in status else abbrev)
        elif status["status"] == VaccineStatus.OVERDUE.value:
            overdue.append(status["vaccine_name"] if "vaccine_name" in status else abbrev)

    # Live vaccine spacing check
    live_vaccines_due = [s for s in vaccine_statuses
                         if s.get("live_vaccine") and s["status"] in ["due_now", "overdue"]]
    live_vaccine_note = None
    if len(live_vaccines_due) > 1:
        live_vaccine_note = ("Multiple live vaccines due. Live injectable vaccines not "
                             "given on the same day must be separated by >= 28 days.")

    return {
        "patient": {
            "date_of_birth": dob,
            "age_months": age_months,
            "age_display": f"{age_months // 12} years, {age_months % 12} months"
                           if age_months >= 12 else f"{age_months} months",
        },
        "assessment_date": reference_date or datetime.now().strftime("%Y-%m-%d"),
        "vaccines_due_now": due_now,
        "vaccines_overdue": overdue,
        "total_vaccines_assessed": len(vaccine_statuses),
        "vaccine_details": vaccine_statuses,
        "live_vaccine_spacing_note": live_vaccine_note,
        "next_well_child_visit": _next_visit_age(age_months),
        "disclaimer": "Verify against current ACIP schedule before administering. "
                      "Schedule updated annually.",
    }


def _next_visit_age(current_age_months: int) -> str:
    """Determine next recommended well-child visit age."""
    visit_ages = [1, 2, 4, 6, 9, 12, 15, 18, 24, 30, 36, 48, 60, 72,
                  84, 96, 108, 120, 132, 144, 156, 168, 180, 192, 204, 216]
    for age in visit_ages:
        if age > current_age_months:
            if age < 12:
                return f"{age} months"
            elif age < 24:
                return f"{age} months ({age // 12} year{'s' if age >= 24 else ''})"
            else:
                return f"{age // 12} years"
    return "Annual visit"


def screen_contraindications(vaccine_abbrev: str,
                              patient_conditions: list) -> dict:
    """
    Screen for vaccine contraindications.

    Args:
        vaccine_abbrev: Vaccine abbreviation
        patient_conditions: List of patient conditions/allergies

    Returns:
        Contraindication screening results
    """
    vaccine = PEDIATRIC_VACCINES.get(vaccine_abbrev)
    if not vaccine:
        return {"error": f"Unknown vaccine: {vaccine_abbrev}"}

    found_contraindications = []
    found_precautions = []

    for condition in patient_conditions:
        condition_lower = condition.lower()
        for ci in vaccine.contraindications:
            if any(word in condition_lower for word in ci.lower().split()):
                found_contraindications.append({
                    "condition": condition,
                    "contraindication": ci,
                })
        for prec in vaccine.precautions:
            if any(word in condition_lower for word in prec.lower().split()):
                found_precautions.append({
                    "condition": condition,
                    "precaution": prec,
                })

    can_administer = len(found_contraindications) == 0

    return {
        "vaccine": vaccine.abbreviation,
        "vaccine_name": vaccine.name,
        "can_administer": can_administer,
        "contraindications_found": found_contraindications,
        "precautions_found": found_precautions,
        "all_contraindications": vaccine.contraindications,
        "all_precautions": vaccine.precautions,
        "recommendation": (
            "No contraindications identified. Safe to administer per routine schedule."
            if can_administer
            else "CONTRAINDICATION IDENTIFIED. Do NOT administer. Consult immunization guidelines."
        ),
    }


def run_vaccine_tracker(action: str, **kwargs) -> str:
    """
    Main entry point for the Immunization Schedule Tracker.

    Actions:
        report: Full immunization report (dob, doses_received)
        check: Check single vaccine status (vaccine, dob, doses_received)
        screen: Screen contraindications (vaccine, conditions)
        schedule: Get recommended schedule for age group
    """
    if action == "report":
        result = generate_immunization_report(
            kwargs.get("dob", ""),
            kwargs.get("doses_received"),
            kwargs.get("reference_date"),
        )
    elif action == "check":
        vaccine = PEDIATRIC_VACCINES.get(kwargs.get("vaccine", ""))
        if not vaccine:
            result = {
                "error": "Unknown vaccine",
                "available": list(PEDIATRIC_VACCINES.keys()),
            }
        else:
            age = calculate_age_months(kwargs.get("dob", datetime.now().isoformat()))
            result = check_vaccine_status(
                vaccine, age, kwargs.get("doses", []),
            )
    elif action == "screen":
        result = screen_contraindications(
            kwargs.get("vaccine", ""),
            kwargs.get("conditions", []),
        )
    elif action == "schedule":
        result = {
            "pediatric_schedule": {
                abbrev: {
                    "name": v.name,
                    "doses": v.series_doses,
                    "schedule_months": v.routine_schedule_months,
                    "route": v.route,
                    "live_vaccine": v.live_vaccine,
                }
                for abbrev, v in PEDIATRIC_VACCINES.items()
            },
        }
    else:
        result = {
            "error": f"Unknown action: {action}",
            "available_actions": ["report", "check", "screen", "schedule"],
        }

    return json.dumps(result, indent=2)


if __name__ == "__main__":
    print("=== 12-Month Immunization Report ===")
    print(run_vaccine_tracker("report", dob="2025-03-03", doses_received={
        "HepB": ["2025-03-03", "2025-04-03", "2025-09-03"],
        "RV": ["2025-05-03", "2025-07-03", "2025-09-03"],
        "DTaP": ["2025-05-03", "2025-07-03", "2025-09-03"],
        "Hib": ["2025-05-03", "2025-07-03", "2025-09-03"],
        "PCV": ["2025-05-03", "2025-07-03", "2025-09-03"],
        "IPV": ["2025-05-03", "2025-07-03", "2025-09-03"],
    }))
