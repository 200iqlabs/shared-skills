## Purpose

Defines the environment-setup skill: a guided wizard that helps users create context files from templates after forking or installing shared-skills.

## Requirements

### Requirement: Environment setup skill exists
A skill at `skills/environment-setup/SKILL.md` SHALL guide users through creating all required context files for the shared-skills system.

#### Scenario: Skill is discoverable
- **WHEN** a user asks about setting up the environment, configuring the system, or preparing context
- **THEN** the environment-setup skill triggers and begins the guided workflow

### Requirement: Setup skill audits existing context
The environment-setup skill SHALL check which context files already exist and which are missing before starting the guided creation process.

#### Scenario: No context files exist
- **WHEN** running the setup skill on a fresh fork/install
- **THEN** it reports all context files as missing and offers to create them one by one

#### Scenario: Some context files exist
- **WHEN** running the setup skill with some context files already present
- **THEN** it reports which files exist (with status) and which are missing, and offers to create only the missing ones

### Requirement: Setup skill creates context files from templates
The environment-setup skill SHALL use templates from `context/templates/` as the starting structure and guide users through filling in each section.

#### Scenario: Guided creation of a context file
- **WHEN** the user agrees to create a missing context file
- **THEN** the skill reads the corresponding template, asks targeted questions for each section, and writes the completed file to `context/`

#### Scenario: User can skip optional context files
- **WHEN** the skill presents a recommended (not required) context file
- **THEN** the user can skip it without blocking the setup process

### Requirement: Setup skill shows completion summary
After creating context files, the skill SHALL show a summary of what was created and which skills are now fully configured.

#### Scenario: All required context created
- **WHEN** all required context files are created
- **THEN** the skill shows a summary listing each file created and confirms which skills are ready to use

#### Scenario: Partial setup
- **WHEN** the user skips some context files
- **THEN** the skill shows what was created, what was skipped, and which skills will have limited functionality
