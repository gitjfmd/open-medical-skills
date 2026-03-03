#!/usr/bin/env python3
"""
Generate skill and plugin directories from YAML content files.

Reads content/skills/*.yaml and content/plugins/*.yaml,
creates skills/{name}/ and plugins/{name}/ directories at repo root
with SKILL.md (or PLUGIN.md) and optional script files.
"""

import os
import sys
import yaml
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent


def read_yaml_files(directory: Path) -> list[dict]:
    """Read all YAML files in a directory and return parsed data."""
    results = []
    if not directory.exists():
        print(f"  Directory not found: {directory}")
        return results
    for yaml_file in sorted(directory.glob("*.yaml")):
        with open(yaml_file, "r", encoding="utf-8") as f:
            try:
                data = yaml.safe_load(f)
                if data:
                    data["_source_file"] = str(yaml_file)
                    results.append(data)
            except yaml.YAMLError as e:
                print(f"  ERROR parsing {yaml_file.name}: {e}")
    return results


def format_tags(tags) -> str:
    """Format tags list as comma-separated string."""
    if isinstance(tags, list):
        return ", ".join(str(t) for t in tags)
    return str(tags) if tags else "N/A"


def format_specialty(specialty) -> str:
    """Format specialty list as comma-separated string."""
    if isinstance(specialty, list):
        return ", ".join(str(s) for s in specialty)
    return str(specialty) if specialty else "N/A"


def safety_label(classification: str) -> str:
    """Return a human-readable safety label."""
    labels = {
        "safe": "Safe",
        "caution": "Caution",
        "restricted": "Restricted",
    }
    return labels.get(classification, classification or "N/A")


def evidence_label(level: str) -> str:
    """Return a human-readable evidence level label."""
    labels = {
        "high": "High",
        "moderate": "Moderate",
        "low": "Low",
        "expert-opinion": "Expert Opinion",
    }
    return labels.get(level, level or "N/A")


def generate_minimal_skill_md(data: dict) -> str:
    """Generate a minimal SKILL.md from YAML metadata."""
    display_name = data.get("display_name", data.get("name", "Unknown Skill"))
    description = data.get("description", "No description available.")
    category = data.get("category", "N/A")
    tags = format_tags(data.get("tags"))
    safety = safety_label(data.get("safety_classification"))
    evidence = evidence_label(data.get("evidence_level"))
    specialty = format_specialty(data.get("specialty"))
    author = data.get("author", "Unknown")
    version = data.get("version", "1.0.0")
    license_val = data.get("license", "MIT")
    repo = data.get("repository", "")

    md = f"""# {display_name}

{description}

## Category

{category}

## Specialty

{specialty}

## Tags

{tags}

## Safety Classification

{safety}

## Evidence Level

{evidence}

## Author

{author}

## Version

{version}

## License

{license_val}
"""
    if repo:
        md += f"""
## Repository

{repo}
"""

    # Add install instructions if available
    install = data.get("install", {})
    if install:
        md += "\n## Installation\n\n"
        if install.get("npx"):
            md += f"**npx:**\n```bash\n{install['npx']}\n```\n\n"
        if install.get("git"):
            md += f"**git:**\n```bash\n{install['git']}\n```\n\n"

    md += """---

*This skill is part of [Open Medical Skills](https://github.com/gitjfmd/open-medical-skills), a curated marketplace of medical AI skills maintained by physicians for physicians and the healthcare industry.*
"""
    return md


def generate_minimal_plugin_md(data: dict) -> str:
    """Generate a minimal PLUGIN.md from YAML metadata."""
    display_name = data.get("display_name", data.get("name", "Unknown Plugin"))
    description = data.get("description", "No description available.")
    category = data.get("category", "N/A")
    tags = format_tags(data.get("tags"))
    safety = safety_label(data.get("safety_classification"))
    evidence = evidence_label(data.get("evidence_level"))
    specialty = format_specialty(data.get("specialty"))
    author = data.get("author", "Unknown")
    version = data.get("version", "1.0.0")
    license_val = data.get("license", "MIT")
    repo = data.get("repository", "")
    plugin_type = data.get("plugin_type", "N/A")
    tools = data.get("tools", [])

    md = f"""# {display_name}

{description}

## Plugin Type

{plugin_type}

## Category

{category}

## Specialty

{specialty}

## Tags

{tags}

## Safety Classification

{safety}

## Evidence Level

{evidence}
"""

    if tools:
        md += "\n## Tools\n\n"
        for tool in tools:
            md += f"- {tool}\n"
        md += "\n"

    md += f"""## Author

{author}

## Version

{version}

## License

{license_val}
"""
    if repo:
        md += f"""
## Repository

{repo}
"""

    # Add install instructions if available
    install = data.get("install", {})
    if install:
        md += "\n## Installation\n\n"
        if install.get("npx"):
            md += f"**npx:**\n```bash\n{install['npx']}\n```\n\n"
        if install.get("git"):
            md += f"**git:**\n```bash\n{install['git']}\n```\n\n"

    md += """---

*This plugin is part of [Open Medical Skills](https://github.com/gitjfmd/open-medical-skills), a curated marketplace of medical AI skills maintained by physicians for physicians and the healthcare industry.*
"""
    return md


def script_extension(language: str) -> str:
    """Return appropriate file extension for a script language."""
    extensions = {
        "python": ".py",
        "javascript": ".js",
        "typescript": ".ts",
        "bash": ".sh",
        "shell": ".sh",
        "r": ".R",
    }
    return extensions.get(language.lower(), ".py") if language else ".py"


def process_skills(content_dir: Path, output_dir: Path):
    """Process all skill YAML files and create skill directories."""
    print(f"\nProcessing skills from: {content_dir}")
    print(f"Output directory: {output_dir}")

    skills = read_yaml_files(content_dir)
    print(f"Found {len(skills)} skill YAML files")

    created = 0
    for skill in skills:
        name = skill.get("name")
        if not name:
            print(f"  SKIP: No 'name' field in {skill.get('_source_file', 'unknown')}")
            continue

        skill_dir = output_dir / name
        skill_dir.mkdir(parents=True, exist_ok=True)

        # Write SKILL.md
        skill_md_content = skill.get("skill_md")
        if skill_md_content:
            # Use the embedded skill_md content directly
            md_path = skill_dir / "SKILL.md"
            with open(md_path, "w", encoding="utf-8") as f:
                f.write(skill_md_content)
            print(f"  Created {name}/SKILL.md (from skill_md field)")
        else:
            # Generate minimal SKILL.md from metadata
            md_path = skill_dir / "SKILL.md"
            with open(md_path, "w", encoding="utf-8") as f:
                f.write(generate_minimal_skill_md(skill))
            print(f"  Created {name}/SKILL.md (generated from metadata)")

        # Write script file if script_content exists
        script_content = skill.get("script_content")
        if script_content:
            lang = skill.get("script_language", "python")
            ext = script_extension(lang)
            script_path = skill_dir / f"script{ext}"
            with open(script_path, "w", encoding="utf-8") as f:
                f.write(script_content)
            print(f"  Created {name}/script{ext}")

        created += 1

    print(f"\nSkills processed: {created}/{len(skills)}")
    return created


def process_plugins(content_dir: Path, output_dir: Path):
    """Process all plugin YAML files and create plugin directories."""
    print(f"\nProcessing plugins from: {content_dir}")
    print(f"Output directory: {output_dir}")

    plugins = read_yaml_files(content_dir)
    print(f"Found {len(plugins)} plugin YAML files")

    created = 0
    for plugin in plugins:
        name = plugin.get("name")
        if not name:
            print(f"  SKIP: No 'name' field in {plugin.get('_source_file', 'unknown')}")
            continue

        plugin_dir = output_dir / name
        plugin_dir.mkdir(parents=True, exist_ok=True)

        # Write PLUGIN.md
        plugin_md_content = plugin.get("skill_md") or plugin.get("plugin_md")
        if plugin_md_content:
            md_path = plugin_dir / "PLUGIN.md"
            with open(md_path, "w", encoding="utf-8") as f:
                f.write(plugin_md_content)
            print(f"  Created {name}/PLUGIN.md (from embedded field)")
        else:
            md_path = plugin_dir / "PLUGIN.md"
            with open(md_path, "w", encoding="utf-8") as f:
                f.write(generate_minimal_plugin_md(plugin))
            print(f"  Created {name}/PLUGIN.md (generated from metadata)")

        # Write script file if script_content exists
        script_content = plugin.get("script_content")
        if script_content:
            lang = plugin.get("script_language", "python")
            ext = script_extension(lang)
            script_path = plugin_dir / f"script{ext}"
            with open(script_path, "w", encoding="utf-8") as f:
                f.write(script_content)
            print(f"  Created {name}/script{ext}")

        created += 1

    print(f"\nPlugins processed: {created}/{len(plugins)}")
    return created


def main():
    skills_content = REPO_ROOT / "content" / "skills"
    plugins_content = REPO_ROOT / "content" / "plugins"
    skills_output = REPO_ROOT / "skills"
    plugins_output = REPO_ROOT / "plugins"

    print("=" * 60)
    print("Open Medical Skills - Directory Generator")
    print("=" * 60)

    skill_count = process_skills(skills_content, skills_output)
    plugin_count = process_plugins(plugins_content, plugins_output)

    print("\n" + "=" * 60)
    print(f"DONE: {skill_count} skill directories, {plugin_count} plugin directories")
    print("=" * 60)


if __name__ == "__main__":
    main()
