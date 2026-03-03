#!/usr/bin/env python3
"""
Outbreak Investigation Assistant
==================================
Systematic outbreak investigation tool implementing the CDC's 10-step
framework for investigating disease outbreaks in community and
healthcare settings.

Clinical Purpose:
    Guides public health professionals and infection preventionists
    through the structured process of outbreak detection, case
    definition, epidemic curve analysis, hypothesis generation,
    and control measure implementation.

References:
    - CDC. "Principles of Epidemiology in Public Health Practice." 3rd Ed.
      Self-Study Course SS1978.
    - Goodman RA, et al. "Field Epidemiology." 3rd Ed. Oxford, 2013.
    - Reingold AL. "Outbreak Investigations - A Perspective."
      Emerg Infect Dis. 1998;4(1):21-27.
    - WHO. "Foodborne Disease Outbreaks: Guidelines for Investigation
      and Control." 2008.

DISCLAIMER: This tool provides structured guidance for outbreak
investigation. All public health decisions should be made by qualified
epidemiologists in coordination with local, state, and federal health
authorities.
"""

import json
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from typing import Optional
import math
from collections import Counter


class OutbreakType(Enum):
    POINT_SOURCE = "point_source"
    CONTINUOUS_SOURCE = "continuous_source"
    PROPAGATED = "propagated"
    MIXED = "mixed"
    UNKNOWN = "unknown"


class TransmissionMode(Enum):
    FOODBORNE = "foodborne"
    WATERBORNE = "waterborne"
    AIRBORNE = "airborne"
    DROPLET = "droplet"
    CONTACT_DIRECT = "direct_contact"
    CONTACT_INDIRECT = "indirect_contact"
    VECTOR_BORNE = "vector_borne"
    FECAL_ORAL = "fecal_oral"
    BLOODBORNE = "bloodborne"
    UNKNOWN = "unknown"


class InvestigationStep(Enum):
    VERIFY_DIAGNOSIS = "1_verify_diagnosis_and_confirm_outbreak"
    DEFINE_CASE = "2_define_and_identify_cases"
    DESCRIBE_PERSON_PLACE_TIME = "3_descriptive_epidemiology"
    GENERATE_HYPOTHESES = "4_develop_hypotheses"
    EVALUATE_HYPOTHESES = "5_evaluate_hypotheses"
    REFINE_HYPOTHESES = "6_refine_hypotheses_and_conduct_studies"
    IMPLEMENT_CONTROL = "7_implement_control_measures"
    COMMUNICATE = "8_communicate_findings"
    MAINTAIN_SURVEILLANCE = "9_maintain_surveillance"
    FINAL_REPORT = "10_prepare_final_report"


@dataclass
class CaseDefinition:
    """Standardized case definition for outbreak investigation."""
    clinical_criteria: list  # Signs and symptoms required
    laboratory_criteria: list  # Lab confirmation criteria
    epidemiologic_criteria: list  # Time, place, person linkage
    confirmed_case: str  # Definition of confirmed case
    probable_case: str  # Definition of probable case
    suspect_case: str  # Definition of suspect case
    exclusion_criteria: list = field(default_factory=list)


@dataclass
class CaseData:
    """Individual case record."""
    case_id: str
    onset_date: str  # ISO format
    diagnosis_date: str = ""
    report_date: str = ""
    age: int = 0
    sex: str = ""
    location: str = ""
    classification: str = "suspect"  # confirmed, probable, suspect
    symptoms: list = field(default_factory=list)
    exposure_history: dict = field(default_factory=dict)
    lab_results: dict = field(default_factory=dict)
    outcome: str = "active"  # active, recovered, hospitalized, deceased


@dataclass
class OutbreakSummary:
    """Summary statistics for the outbreak."""
    total_cases: int = 0
    confirmed: int = 0
    probable: int = 0
    suspect: int = 0
    hospitalizations: int = 0
    deaths: int = 0
    attack_rate: float = 0.0
    case_fatality_rate: float = 0.0
    population_at_risk: int = 0


CDC_INVESTIGATION_STEPS = {
    InvestigationStep.VERIFY_DIAGNOSIS: {
        "description": "Verify the diagnosis and confirm that an outbreak exists",
        "key_actions": [
            "Review clinical findings and laboratory results of initial cases",
            "Determine whether the number of cases exceeds expected baseline",
            "Compare to historical data for the same time period",
            "Rule out laboratory or reporting errors",
            "Confirm that cases are not artifacts of enhanced surveillance",
        ],
        "tools": [
            "Review laboratory reports and clinical records",
            "Contact local/state health department for baseline data",
            "Consult with clinicians treating initial cases",
        ],
    },
    InvestigationStep.DEFINE_CASE: {
        "description": "Establish a case definition and systematically find cases",
        "key_actions": [
            "Develop case definition with clinical, lab, and epi criteria",
            "Define confirmed, probable, and suspect case categories",
            "Set time, place, and person restrictions",
            "Search actively for additional cases (hospital records, lab reports, surveys)",
            "Begin line listing of all identified cases",
        ],
        "tools": [
            "Line listing template (spreadsheet)",
            "Case report form",
            "Active case finding protocols",
        ],
    },
    InvestigationStep.DESCRIBE_PERSON_PLACE_TIME: {
        "description": "Characterize the outbreak by person, place, and time",
        "key_actions": [
            "PERSON: Describe demographics (age, sex, race, occupation)",
            "PERSON: Calculate attack rates by subgroup",
            "PLACE: Map case locations (spot map or geographic clustering)",
            "PLACE: Identify common exposures or venues",
            "TIME: Construct epidemic curve (epi curve) using onset dates",
            "TIME: Determine pattern (point source, propagated, continuous)",
            "Calculate incubation period range if exposure is known",
        ],
        "tools": [
            "Epidemic curve construction",
            "Attack rate calculation",
            "Spot mapping / GIS tools",
        ],
    },
    InvestigationStep.GENERATE_HYPOTHESES: {
        "description": "Develop hypotheses about source, mode, and vehicle of transmission",
        "key_actions": [
            "Review descriptive epidemiology results",
            "Interview cases about exposures (food, water, contacts, travel)",
            "Consider known biology of the pathogen",
            "Assess environmental factors",
            "Consult with microbiologists and environmental health specialists",
        ],
        "tools": [
            "Hypothesis-generating questionnaire (trawling questionnaire)",
            "Pathogen-specific incubation periods and transmission modes",
        ],
    },
    InvestigationStep.EVALUATE_HYPOTHESES: {
        "description": "Test hypotheses using analytic epidemiology",
        "key_actions": [
            "Design analytic study (cohort or case-control)",
            "Cohort study: calculate relative risk (RR) and attack rates",
            "Case-control study: calculate odds ratio (OR) and confidence intervals",
            "Perform chi-square test or Fisher exact test for significance",
            "Assess dose-response relationship if applicable",
        ],
        "tools": [
            "2x2 table analysis",
            "Relative risk and odds ratio calculation",
            "Chi-square test",
            "Confidence interval calculation",
        ],
    },
    InvestigationStep.IMPLEMENT_CONTROL: {
        "description": "Implement control and prevention measures",
        "key_actions": [
            "Control measures should begin as soon as source is suspected (do not wait for study results)",
            "Control at the SOURCE: remove contaminated product, close facility, treat reservoir",
            "Interrupt TRANSMISSION: isolation, quarantine, PPE, environmental cleaning",
            "Protect SUSCEPTIBLE hosts: vaccination, prophylaxis, education",
            "Evaluate effectiveness of control measures through continued surveillance",
        ],
        "tools": [
            "Infection control protocols",
            "Public health orders (recall, closure, quarantine)",
            "Risk communication materials",
        ],
    },
}


def calculate_attack_rate(cases: int, population: int) -> float:
    """Calculate the attack rate (cases per 100 population at risk)."""
    if population <= 0:
        return 0.0
    return round((cases / population) * 100, 2)


def calculate_case_fatality_rate(deaths: int, cases: int) -> float:
    """Calculate the case-fatality rate (percentage of cases that die)."""
    if cases <= 0:
        return 0.0
    return round((deaths / cases) * 100, 2)


def calculate_odds_ratio(a: int, b: int, c: int, d: int) -> dict:
    """
    Calculate odds ratio from a 2x2 table.

    Layout:
                Ill     Not Ill
    Exposed      a        b
    Not Exposed  c        d

    Returns OR with 95% confidence interval.
    """
    if b == 0 or c == 0:
        return {"odds_ratio": float("inf"), "ci_95": "Cannot compute (zero cell)",
                "interpretation": "Undefined due to zero cell. Consider Fisher exact test."}

    OR = (a * d) / (b * c)

    # 95% CI using Woolf's method
    ln_OR = math.log(OR)
    se_ln_OR = math.sqrt(1/max(a,1) + 1/max(b,1) + 1/max(c,1) + 1/max(d,1))
    ci_lower = math.exp(ln_OR - 1.96 * se_ln_OR)
    ci_upper = math.exp(ln_OR + 1.96 * se_ln_OR)

    significant = ci_lower > 1.0 or ci_upper < 1.0

    return {
        "odds_ratio": round(OR, 2),
        "ci_95_lower": round(ci_lower, 2),
        "ci_95_upper": round(ci_upper, 2),
        "statistically_significant": significant,
        "interpretation": (
            f"OR = {round(OR, 2)} (95% CI: {round(ci_lower, 2)}-{round(ci_upper, 2)}). "
            f"{'Statistically significant association.' if significant else 'Not statistically significant.'}"
        ),
    }


def calculate_relative_risk(a: int, b: int, c: int, d: int) -> dict:
    """
    Calculate relative risk from a 2x2 table (cohort study).

    Returns RR with 95% confidence interval.
    """
    exposed_total = a + b
    unexposed_total = c + d

    if exposed_total == 0 or unexposed_total == 0:
        return {"error": "Cannot compute RR with zero total in a group"}

    risk_exposed = a / exposed_total
    risk_unexposed = c / unexposed_total

    if risk_unexposed == 0:
        return {"relative_risk": float("inf"),
                "interpretation": "Risk in unexposed group is zero."}

    RR = risk_exposed / risk_unexposed

    # 95% CI
    ln_RR = math.log(RR)
    se_ln_RR = math.sqrt((1/max(a,1) - 1/exposed_total) +
                          (1/max(c,1) - 1/unexposed_total))
    ci_lower = math.exp(ln_RR - 1.96 * se_ln_RR)
    ci_upper = math.exp(ln_RR + 1.96 * se_ln_RR)

    significant = ci_lower > 1.0 or ci_upper < 1.0

    return {
        "relative_risk": round(RR, 2),
        "attack_rate_exposed": f"{round(risk_exposed * 100, 1)}%",
        "attack_rate_unexposed": f"{round(risk_unexposed * 100, 1)}%",
        "ci_95_lower": round(ci_lower, 2),
        "ci_95_upper": round(ci_upper, 2),
        "statistically_significant": significant,
        "interpretation": (
            f"RR = {round(RR, 2)} (95% CI: {round(ci_lower, 2)}-{round(ci_upper, 2)}). "
            f"Exposed group has {round(RR, 1)}x the risk of the unexposed group. "
            f"{'Statistically significant.' if significant else 'Not statistically significant.'}"
        ),
    }


def analyze_epidemic_curve(onset_dates: list) -> dict:
    """
    Analyze onset dates to characterize the epidemic curve.

    Args:
        onset_dates: List of onset date strings (ISO format, e.g. "2026-01-15")

    Returns:
        Epidemic curve analysis with pattern identification
    """
    if not onset_dates:
        return {"error": "No onset dates provided"}

    dates = sorted([datetime.fromisoformat(d) for d in onset_dates])
    n = len(dates)

    first_case = dates[0]
    last_case = dates[-1]
    duration_days = (last_case - first_case).days

    # Count cases by day
    day_counts = Counter()
    for d in dates:
        day_key = d.strftime("%Y-%m-%d")
        day_counts[day_key] += 1

    peak_day = max(day_counts, key=day_counts.get)
    peak_count = day_counts[peak_day]

    # Determine outbreak pattern
    if duration_days <= 2:
        pattern = OutbreakType.POINT_SOURCE
        pattern_description = ("Sharp rise and fall suggesting a single, brief exposure. "
                               "Consistent with point-source outbreak.")
    elif n > 5 and duration_days > 14:
        # Check for wave pattern (propagated)
        daily = [day_counts.get((first_case + timedelta(days=i)).strftime("%Y-%m-%d"), 0)
                 for i in range(duration_days + 1)]
        peaks = sum(1 for i in range(1, len(daily)-1)
                    if daily[i] > daily[i-1] and daily[i] > daily[i+1] and daily[i] > 0)
        if peaks >= 2:
            pattern = OutbreakType.PROPAGATED
            pattern_description = ("Multiple peaks separated by approximately one incubation "
                                   "period suggest person-to-person (propagated) transmission.")
        else:
            pattern = OutbreakType.CONTINUOUS_SOURCE
            pattern_description = ("Prolonged, relatively flat curve suggests ongoing "
                                   "exposure to a continuous common source.")
    else:
        pattern = OutbreakType.UNKNOWN
        pattern_description = "Insufficient data to clearly classify the outbreak pattern."

    # Estimate incubation period (if point source)
    median_onset = dates[n // 2]

    return {
        "total_cases": n,
        "first_case_onset": first_case.strftime("%Y-%m-%d"),
        "last_case_onset": last_case.strftime("%Y-%m-%d"),
        "duration_days": duration_days,
        "peak_date": peak_day,
        "peak_case_count": peak_count,
        "outbreak_pattern": pattern.value,
        "pattern_description": pattern_description,
        "median_onset_date": median_onset.strftime("%Y-%m-%d"),
        "daily_case_counts": dict(sorted(day_counts.items())),
        "next_steps": [
            "Compare pattern to known incubation periods for suspected pathogen",
            "If point source: work backwards from median onset using incubation period to estimate exposure date",
            "If propagated: identify generation intervals and chains of transmission",
            "If continuous: identify and eliminate ongoing exposure source",
        ],
    }


def get_investigation_guide(step: str = None) -> dict:
    """Get the CDC 10-step outbreak investigation guide."""
    if step:
        for s, info in CDC_INVESTIGATION_STEPS.items():
            if step in s.value:
                return {
                    "step": s.value,
                    "description": info["description"],
                    "key_actions": info["key_actions"],
                    "tools": info["tools"],
                }
        return {"error": f"Step not found. Available steps: {[s.value for s in InvestigationStep]}"}

    return {
        "cdc_outbreak_investigation_steps": {
            s.value: {
                "description": info["description"],
                "num_actions": len(info["key_actions"]),
            }
            for s, info in CDC_INVESTIGATION_STEPS.items()
        },
        "note": "Request specific step for detailed actions and tools.",
    }


def run_outbreak_investigation(action: str, **kwargs) -> str:
    """
    Main entry point for the Outbreak Investigation Assistant.

    Actions:
        guide: Get investigation step guide (step=optional filter)
        epi_curve: Analyze epidemic curve (onset_dates)
        attack_rate: Calculate attack rate (cases, population)
        odds_ratio: Calculate OR (a, b, c, d from 2x2 table)
        relative_risk: Calculate RR (a, b, c, d from 2x2 table)
    """
    if action == "guide":
        result = get_investigation_guide(kwargs.get("step"))
    elif action == "epi_curve":
        result = analyze_epidemic_curve(kwargs.get("onset_dates", []))
    elif action == "attack_rate":
        cases = kwargs.get("cases", 0)
        population = kwargs.get("population", 0)
        rate = calculate_attack_rate(cases, population)
        result = {
            "cases": cases,
            "population_at_risk": population,
            "attack_rate_percent": rate,
            "interpretation": f"{rate}% of the population at risk became ill.",
        }
    elif action == "odds_ratio":
        result = calculate_odds_ratio(
            kwargs.get("a", 0), kwargs.get("b", 0),
            kwargs.get("c", 0), kwargs.get("d", 0),
        )
    elif action == "relative_risk":
        result = calculate_relative_risk(
            kwargs.get("a", 0), kwargs.get("b", 0),
            kwargs.get("c", 0), kwargs.get("d", 0),
        )
    else:
        result = {
            "error": f"Unknown action: {action}",
            "available_actions": ["guide", "epi_curve", "attack_rate",
                                  "odds_ratio", "relative_risk"],
        }

    return json.dumps(result, indent=2)


if __name__ == "__main__":
    print("=== Epidemic Curve Analysis ===")
    print(run_outbreak_investigation("epi_curve", onset_dates=[
        "2026-01-10", "2026-01-10", "2026-01-11", "2026-01-11",
        "2026-01-11", "2026-01-12", "2026-01-12", "2026-01-13",
    ]))
    print()
    print("=== Odds Ratio (Case-Control Study) ===")
    print(run_outbreak_investigation("odds_ratio", a=30, b=20, c=10, d=40))
