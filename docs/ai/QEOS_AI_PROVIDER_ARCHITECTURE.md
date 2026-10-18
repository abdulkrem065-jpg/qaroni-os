# QEOS AI Provider Architecture

## Authorization: QEOS-AUTH-0089

## Overview
The AI architecture in QEOS is strictly provider-agnostic. It defines abstract interfaces (`AIProvider`, `AIModel`, `AIConversation`, `AIEmbeddingProvider`) that any vendor implementation (e.g., Gemini, OpenAI, Claude, DeepSeek, Local LLMs) must fulfill.

## Principle
No vendor-specific code shall leak into the business logic or UI. The system resolves the active provider through dependency injection based on organization configuration.
