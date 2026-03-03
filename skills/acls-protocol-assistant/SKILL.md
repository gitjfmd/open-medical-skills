# ACLS Protocol Assistant

## Overview

The ACLS Protocol Assistant is a clinical decision support tool that provides structured, step-by-step guidance through Advanced Cardiac Life Support algorithms. Built on the American Heart Association (AHA) 2020 Guidelines for CPR and Emergency Cardiovascular Care, this skill assists clinicians during high-acuity resuscitation events where rapid, protocol-driven care saves lives.

## Clinical Context

Cardiac arrest remains the leading cause of death worldwide. Adherence to evidence-based ACLS algorithms has been shown to significantly improve survival-to-discharge and neurologically favorable outcomes. However, the stress and cognitive load of a resuscitation event can lead to protocol deviations, medication timing errors, and missed reversible causes.

This tool serves as a cognitive aid during resuscitation, similar to a code card but with dynamic, context-sensitive guidance.

## Algorithms Covered

- **Cardiac Arrest (VF/pVT):** Shockable rhythm pathway with defibrillation, epinephrine, and antiarrhythmic dosing
- **Cardiac Arrest (PEA/Asystole):** Non-shockable pathway with CPR emphasis and reversible cause identification
- **Bradycardia with Pulse:** Atropine, transcutaneous pacing, and vasopressor management
- **Tachycardia with Pulse:** Vagal maneuvers, adenosine, cardioversion, and antiarrhythmic selection
- **Post-Cardiac Arrest Care:** Targeted temperature management, hemodynamic optimization, and neuroprognostication

## Usage

Provide the detected cardiac rhythm, pulse status, heart rate, and hemodynamic stability. The tool returns the appropriate ACLS algorithm with drug dosages, energy levels, and clinical decision points.

## Safety Classification: CAUTION

This tool provides guidance for life-threatening emergencies. All clinical decisions must be made by qualified healthcare professionals. This tool does not replace ACLS certification, clinical training, or bedside judgment.

## References

- Panchal AR, et al. 2020 AHA Guidelines for CPR and ECC. *Circulation*. 2020;142(suppl 2):S366-S468.
- Merchant RM, et al. 2020 AHA Guidelines: Executive Summary. *Circulation*. 2020;142(suppl 2):S337-S357.
- Soar J, et al. 2021 ILCOR Advanced Life Support Consensus. *Resuscitation*. 2021;169:71-120.
