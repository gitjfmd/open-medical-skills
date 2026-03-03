# Nursing Patient Assessment Tool

## Overview

The Nursing Patient Assessment Tool is a comprehensive bedside assessment framework integrating multiple validated clinical tools into a single workflow. It supports systematic patient evaluation using evidence-based screening instruments for clinical deterioration, fall risk, pressure injury risk, and pain assessment.

## Clinical Context

Timely recognition of clinical deterioration is a critical nursing competency. Studies have demonstrated that early warning score systems like NEWS2 can identify patients at risk of deterioration 12-24 hours before a critical event (Smith et al., Resuscitation 2013). Structured assessment tools enable nurses to quantify clinical status, communicate concerns objectively, and trigger appropriate clinical responses.

## Assessment Tools Included

- **NEWS2 (National Early Warning Score 2):** Validated aggregate score based on 7 physiological parameters (respiratory rate, SpO2, supplemental O2, systolic BP, heart rate, consciousness level, temperature). Triggers tiered clinical response: low (0), low-medium (1-4), medium (5-6 or 3 in any parameter), high (7+).

- **Morse Fall Scale:** Six-item fall risk assessment validated in acute care settings. Classifies patients as low risk (0-24), moderate risk (25-44), or high risk (45+) and generates corresponding prevention interventions.

- **Braden Scale for Pressure Injury Risk:** Six-subscale assessment (sensory perception, moisture, activity, mobility, nutrition, friction/shear) scoring 6-23. Lower scores indicate higher risk. Guides prevention interventions including repositioning schedules and support surface selection.

- **PQRST Pain Assessment:** Structured pain assessment framework (Provokes/Palliates, Quality, Region/Radiation, Severity, Timing) with numeric rating scale interpretation and multimodal management recommendations.

## Configuration

Each tool accepts the relevant assessment parameters and returns a scored result with risk classification, clinical interpretation, and evidence-based intervention recommendations.

## References

- Smith GB, et al. "The Ability of the NEWS to Discriminate Patients at Risk." *Resuscitation*. 2013;84(4):465-470.
- Royal College of Physicians. "NEWS2: National Early Warning Score 2." 2017.
- Morse JM. "Predicting Fall Risk." *Can J Nurs Res*. 1989;21(4):9-19.
- Braden B, Bergstrom N. "Predictive Validity of the Braden Scale." *Res Nurs Health*. 1994;17(6):459-470.
