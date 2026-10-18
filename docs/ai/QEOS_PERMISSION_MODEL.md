# QEOS Unified Permission Model

## Authorization: QEOS-AUTH-0089 Rev.2

## Core Rules
1. The AI Hub inherits the permissions of the authenticated user.
2. Centralized enforcement: The Hub rejects tool calls or knowledge queries outside the user's Organization, Branch, Role, or Permission scope.
3. Sensitive Data Protection: Audit policies and feature flags are evaluated before generating prompts or retrieving RAG context.
