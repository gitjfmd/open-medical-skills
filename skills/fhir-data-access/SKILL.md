# FHIR Healthcare Data Access

Connect to FHIR-compliant electronic health record systems to query, retrieve, and analyze patient data using natural language. Supports full CRUD operations on FHIR resources with SMART-on-FHIR authentication.

> **Status:** In Development — Implementation in progress. Core functionality defined, full feature set coming soon.

## Quick Install

```bash
npx skills add gitjfmd/open-medical-skills --skill fhir-data-access
```

## What It Does

- Connect to FHIR-compliant electronic health record systems to query, retrieve, and analyze patient data using natural language. Supports full CRUD operations on FHIR resources with SMART-on-FHIR authentication.

## Clinical Use Cases

- Differential diagnosis generation from symptoms
- Evidence-based diagnostic workup planning
- Clinical decision support at the point of care

## Safety & Evidence

- **Safety Classification:** Restricted — This skill handles sensitive clinical data or influences treatment decisions. Requires physician oversight and institutional authorization.
- **Evidence Level:** High — Based on systematic reviews, randomized controlled trials, or authoritative clinical guidelines.

## Example Usage

```
Prompt: "45-year-old female with fatigue, weight gain, and cold intolerance. Generate differential diagnosis."
```

## Technical Details

- **Category:** diagnosis
- **Version:** 1.0.0
- **Author:** OMS Contributors
- **License:** Apache-2.0
- **Tags:** fhir, ehr, patient-data, smart-on-fhir

## References

- Evidence-based clinical guidelines
- Peer-reviewed medical literature

---

*Part of [Open Medical Skills](https://github.com/gitjfmd/open-medical-skills) — physician-curated AI skills for healthcare.*
