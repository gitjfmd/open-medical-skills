# Medical Board Exam Preparation Tool

## Overview

The Board Exam Prep tool is a comprehensive study assistant designed for medical students preparing for USMLE (Steps 1, 2 CK, 3) and COMLEX (Levels 1, 2-CE) board examinations. It combines evidence-based spaced repetition with performance analytics to create a personalized, efficient study experience.

## Features

- **Spaced Repetition Engine:** Implements the SM-2 algorithm to optimize review intervals, ensuring high-yield material is revisited at scientifically optimal times to maximize long-term retention.
- **Performance Analytics:** Tracks accuracy across all USMLE disciplines (anatomy, pathology, pharmacology, etc.) and organ systems (cardiovascular, renal, etc.), identifying weak areas that need focused review.
- **Adaptive Study Plans:** Generates structured study schedules based on exam type and time remaining, with daily structure recommendations for content review, question practice, and flashcard sessions.
- **High-Yield Topic Identification:** Prioritizes topics based on historical exam weighting and known high-yield associations.

## How It Works

1. **Set your target exam** (USMLE Step 1, Step 2 CK, etc.) and exam date
2. **Answer practice questions** across disciplines and organ systems
3. **Review performance analytics** to identify knowledge gaps
4. **Follow the adaptive study plan** that prioritizes your weak areas
5. **Complete daily spaced repetition reviews** to reinforce learned material

## Evidence Base

Spaced repetition has been shown to improve long-term retention by 200-400% compared to massed study. The SM-2 algorithm, originally developed for SuperMemo, dynamically adjusts review intervals based on recall quality, ensuring difficult material is reviewed more frequently while well-known material is spaced further apart (Deng et al., Med Educ 2015).

## Configuration

- `exam_type`: Target examination (step1, step2ck, step3, comlex1, comlex2ce)
- `weeks_until_exam`: Weeks remaining for study plan generation
- `daily_question_target`: Number of practice questions per day (default: 40)

## Limitations

This tool provides study structure and performance tracking. Question content is illustrative and does not represent actual NBME/NBOME examination material. Always supplement with official review resources (First Aid, UWorld, Amboss, Pathoma).

## References

- Deng F, et al. "Spaced Repetition for Medical Education." *Medical Education*. 2015;49(3):286-298.
- Augustin M. "How to Learn Effectively in Medical School." *Yale J Biol Med*. 2014;87(2):207-212.
- NBME Content Classification for USMLE Step Examinations.
