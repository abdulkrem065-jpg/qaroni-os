# QEOS Unified Memory Architecture

## Authorization: QEOS-AUTH-0089 Rev.2

## Structure
Memory belongs exclusively to the Enterprise AI Hub, never to individual modules.

1. **Session Memory:** Current conversation thread, seamlessly spanning context switches.
2. **Temporary Context Memory:** Transient data like the current dashboard filters or selected table row.
3. **Organization/Business Memory:** Long-term insights, financial state, organizational facts.
4. **Long-Term Knowledge:** Document stores and vector databases for RAG.
