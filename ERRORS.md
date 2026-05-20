# ERRORS.md - Automatic Error Tracking & Learning

## [2026-05-18 16:47] - Nested Metadata Keys Mismatch on SignUp

- **Type**: Integration
- **Severity**: High
- **File**: `d:\SDN\backend\src\services\access.service.js:108` and `d:\SDN\frontend\src\store\useAuthStore.js:33`
- **Agent**: Long
- **Root Cause**: The backend `AccessService.signUp` returned `{ code: 201, metadata: { user, tokens } }`, which resulted in nested metadata when wrapped by the controller (`response.data.metadata.metadata`). However, the frontend auth store `useAuthStore` expected a flat structure (`response.data.metadata.tokens.accessToken`), causing a `TypeError` and throwing a "Registration failed" error even though the user was successfully created in MongoDB.
- **Error Message**: 
  ```
  TypeError: Cannot read properties of undefined (reading 'accessToken')
  ```
- **Fix Applied**: Flattened the backend return object in `AccessService.signUp` to return `{ user, tokens }` directly, matching the exact format of `AccessService.login` and resolving the integration mismatch.
- **Prevention**: Maintain a uniform structure for success responses across authentication operations (login, signup, password reset). Always match backend return schemas with frontend store extractions.
- **Status**: Fixed
