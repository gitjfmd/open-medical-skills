# AWS HealthLake FHIR Platform

Official AWS MCP server for HealthLake FHIR operations with 11 tools, automatic datastore discovery, and read-only security mode. Supports advanced search with chained parameters, patient-everything operations, and FHIR job management (import/export). 96% test coverage with SigV4 authentication.

## Plugin Type

mcp-server

## Category

administrative

## Specialty

health-informatics, enterprise-health-it

## Tags

mcp-plugin, aws, fhir, ehr, enterprise, cloud

## Safety Classification

Restricted

## Evidence Level

High

## Tools

- 6 read-only FHIR tools
- 5 write FHIR tools
- Automatic datastore discovery
- Advanced search (chained parameters, _include, _revinclude)
- Patient-everything operations
- FHIR job management (import/export)

## Author

AWS Labs

## Version

1.0.0

## License

Apache-2.0

## Repository

https://github.com/gitjfmd/open-medical-skills/tree/main/plugins/aws-healthlake-fhir

## Installation

**npx:**
```bash
npx skills add gitjfmd/open-medical-skills --skill aws-healthlake-fhir
```

**git:**
```bash
git clone https://github.com/gitjfmd/open-medical-skills.git && cp -r open-medical-skills/plugins/aws-healthlake-fhir ~/.claude/plugins/
```

---

*This plugin is part of [Open Medical Skills](https://github.com/gitjfmd/open-medical-skills), a curated marketplace of medical AI skills maintained by physicians for physicians and the healthcare industry.*
