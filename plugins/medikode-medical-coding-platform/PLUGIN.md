# Medikode AI Medical Coding Platform

AI-driven medical coding platform for CPT/ICD-10 validation, quality assurance, EOB parsing, and RAF score calculation. Five integrated tools providing code validation against clinical documentation, coding QA with gap identification, structured EOB data extraction, RAF/HCC scoring, and composite workflow validation. Requires API key from Medikode.

## Plugin Type

mcp-server

## Category

administrative

## Specialty

medical-coding, health-information-management, revenue-cycle

## Tags

mcp-plugin, medical-coding, cpt, icd-10, raf-score, hcc, billing

## Safety Classification

Safe

## Evidence Level

Moderate

## Tools

- Code Validation (CPT/ICD-10 against documentation)
- Quality Assurance (coding QA, gap identification)
- EOB Parsing (Explanation of Benefits structured data)
- RAF Score Calculation (HCC capture from encounters)
- Composite Workflow (validates chart coding + RAF in one step)

## Author

medikode-ai

## Version

1.0.0

## License

Commercial

## Repository

https://github.com/gitjfmd/open-medical-skills/tree/main/plugins/medikode-medical-coding-platform

## Installation

**npx:**
```bash
npx @medikode/mcp-server
```

**git:**
```bash
git clone https://github.com/gitjfmd/open-medical-skills.git && cp -r open-medical-skills/plugins/medikode-medical-coding-platform ~/.claude/plugins/
```

---

*This plugin is part of [Open Medical Skills](https://github.com/gitjfmd/open-medical-skills), a curated marketplace of medical AI skills maintained by physicians for physicians and the healthcare industry.*
