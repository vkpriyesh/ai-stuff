# Mobile API Integration Skill

## Purpose
Design and implement the networking layer for mobile apps, ensuring robustness and type safety.

## When to Use
- Adding new backing APIs.
- Refactoring network code.

## Inputs
- Swagger/OpenAPI spec or backend documentation.
- Architecture docs defining the data requirements.

## Implementation Guidelines
1.  **Contract Design**: Define Request/Response DTOs (Data Transfer Objects).
2.  **Client Setup**:
    -   **Android**: Retrofit interfaces, OkHttp interceptors.
    -   **iOS**: URLSession configuration, Codable structs, or Moya/Alamofire providers.
3.  **Error Handling**:
    -   Map HTTP codes to domain exceptions.
    -   Handle connectivity errors specifically (Timeout, No Internet).
4.  **Security**:
    -   Implement Auth header injection via interceptors/adapters.
    -   Ensure SSL pinning is configured if required.

## Checklist
- [ ] DTOs are nullable-safe / optional-safe.
- [ ] Base URL is configurable per environment (Staging vs Prod).
- [ ] Timeouts (Connect/Read/Write) are set explicitly.
- [ ] Logging is enabled for debug builds only.
- [ ] Authentication token refresh logic is handled seamlessly.
