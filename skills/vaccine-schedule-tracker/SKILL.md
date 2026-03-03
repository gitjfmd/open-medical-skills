# Immunization Schedule Tracker

## Overview

The Immunization Schedule Tracker implements the CDC Advisory Committee on Immunization Practices (ACIP) recommended immunization schedules for pediatric and adult patients. It provides automated vaccine status assessment, overdue vaccine identification, catch-up schedule generation, and contraindication screening to support timely, complete immunization at every clinical encounter.

## Clinical Context

Immunization is one of the most effective public health interventions, preventing an estimated 4.4 million deaths worldwide each year. Despite this, immunization coverage gaps persist: approximately 25% of children in the US are not fully vaccinated by age 2. Missed opportunities to vaccinate at clinical encounters are a major contributor to under-immunization.

This tool helps clinicians identify which vaccines a patient is due for at each visit, enabling opportunistic immunization and reducing missed opportunities. The ACIP schedule is updated annually, and this tool reflects the recommended schedule structure.

## Features

- **Complete Immunization Report:** Assess all age-appropriate vaccines simultaneously, identifying which are up-to-date, due now, overdue, or not yet due
- **Individual Vaccine Status:** Check status for any specific vaccine against the patient's age and dose history
- **Contraindication Screening:** Screens patient conditions against known vaccine contraindications and precautions before administration
- **Catch-Up Scheduling:** Identifies overdue vaccines and provides minimum interval and minimum age guidance for catch-up immunization
- **Live Vaccine Spacing:** Alerts when multiple live injectable vaccines are due, ensuring appropriate 28-day spacing
- **Age-Appropriate Filtering:** Only displays vaccines applicable to the patient's current age

## Vaccines Covered (Pediatric)

Hepatitis B (HepB), Rotavirus (RV), DTaP, Hib, PCV15/PCV20, IPV, MMR, Varicella, Hepatitis A, and Influenza. Each vaccine includes full series schedule, minimum ages, minimum intervals, contraindications, and clinical notes.

## Usage

Provide the patient's date of birth and vaccination history. The tracker returns a comprehensive status report suitable for clinical documentation and patient/parent education.

## References

- CDC. "Recommended Immunization Schedule for Children and Adolescents Aged 18 Years or Younger." ACIP, 2026.
- CDC. "Recommended Adult Immunization Schedule for Ages 19 Years or Older." ACIP, 2026.
- Kroger A, et al. "General Best Practice Guidelines for Immunization." ACIP, Updated 2023.
- Whitney CG, et al. "Benefits from Immunization During the Vaccines for Children Program Era." *MMWR*. 2014;63(16):352-355.
