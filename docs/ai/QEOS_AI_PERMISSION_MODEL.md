# QEOS AI Permission Model

## Authorization: QEOS-AUTH-0089

## Core Rules
1. The AI inherits the permissions of the authenticated user.
2. It cannot access data outside the user's Organization and Branch scope.
3. Tool execution is authorized against the user's role.
4. Sensitive data is masked or filtered before reaching external AI providers depending on organizational audit policies.
