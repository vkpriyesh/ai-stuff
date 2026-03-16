# PRD to Architecture Skill

## Purpose
Convert a Product Requirement Document (PRD) into a technical architecture specification for mobile apps.

## When to Use
- When starting a new feature or app.
- When significant changes are made to an existing feature.

## Inputs
- `docs/prd/FEATURE_NAME.md` (or equivalent content).
- Existing `docs/architecture/` (context).

## Process
1.  **Entity Extraction**: Identify nouns and behaviors from the PRD.
2.  **Layer Assignment**:
    -   **Data**: what APIs are needed? What needs local storage?
    -   **Domain**: What represent the business rules?
    -   **UI**: What screens and states are described?
3.  **Data Flow Mapping**: specific sequence diagrams or flow descriptions.

## Output
- `docs/architecture/FEATURE_NAME_arch.md`
- List of new components (Repositories, UseCases, ViewModels).
- API requirements (endpoints, payloads).

## Guardrails
- **No God Objects**: Ensure responsibilities are split.
- **Offline Consideration**: Explicitly state offline behavior strategies.
- **Security**: call out PII or sensitive operations requiring auth.
- **Platform Specifics**: Note where Android and iOS implementation might diverge significantly (e.g. background processing).
