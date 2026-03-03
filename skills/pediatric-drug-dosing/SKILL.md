# Pediatric Drug Dosing Calculator

## Overview

The Pediatric Drug Dosing Calculator provides weight-based and body-surface-area-based medication dosing for common pediatric drugs. It incorporates maximum dose limits, age-appropriate validation, contraindication screening, and safety alerts to reduce medication errors in pediatric patients.

## Clinical Context

Medication errors are three times more common in pediatric patients than adults, primarily due to the need for individual weight-based dose calculations, the lack of standard dosing, and the wide range of patient sizes from premature neonates to adolescents (Kaushal et al., JAMA 2001). Dosing errors, particularly 10-fold overdoses, are a well-documented preventable source of pediatric morbidity.

This calculator enforces multiple safety layers: weight-based dose ranges, absolute maximum dose caps, age category validation, and contraindication flags.

## Features

- **Weight-Based Dosing:** Calculates mg/kg dose ranges with frequency and route recommendations
- **BSA-Based Dosing:** Mosteller formula for body surface area calculation and BSA-based drug dosing
- **Maximum Dose Enforcement:** Automatic capping at maximum single and daily dose limits
- **Age Validation:** Flags medications with age restrictions (e.g., ibuprofen < 6 months, ceftriaxone in neonates)
- **Contraindication Alerts:** Checks for known contraindications and generates alerts
- **Clinical Notes:** Indication-specific dosing guidance, common formulations, and practical administration tips

## Medications Included

Amoxicillin, amoxicillin-clavulanate, acetaminophen, ibuprofen, ceftriaxone, prednisolone, ondansetron, albuterol, and more. Database covers the most commonly prescribed pediatric outpatient and emergency department medications.

## Safety Classification: CAUTION

All calculated doses MUST be independently verified by a licensed pharmacist or physician before administration. This tool is intended as a clinical decision support aid and does not replace professional judgment or current drug reference resources.

## References

- Taketomo CK, et al. *Pediatric & Neonatal Dosage Handbook*. Lexicomp, Latest Edition.
- Kaushal R, et al. "Medication Errors and Adverse Drug Events in Pediatric Inpatients." *JAMA*. 2001;285(16):2114-2120.
- Mosteller RD. "Simplified Calculation of BSA." *N Engl J Med*. 1987;317:1098.
