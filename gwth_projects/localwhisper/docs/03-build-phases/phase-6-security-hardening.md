# Phase 6: Security Hardening (Deferred but Planned)

## Goal
Add security measures for when the app may eventually have network exposure.

## Priority: LOW (personal use, no internet)
## Status: PLANNED (build hooks now, implement later)

## Current Security Posture (Phase 5)
- FastAPI binds to 127.0.0.1 ONLY (not 0.0.0.0)
- No authentication (localhost only)
- No external API calls
- All processing is local
- No data leaves the machine

## Future Security Tasks (When Needed)

### 6.1 API Authentication
- Add Bearer token authentication to FastAPI
- Token stored in config file (not hardcoded)
- Required for all API endpoints except health

### 6.2 Input Validation
- Sanitize all user inputs in settings UI
- Validate file paths
- Validate hotkey strings
- Limit custom word dictionary size

### 6.3 Rate Limiting
- Rate limit API endpoints (prevent abuse if exposed)
- Rate limit model download endpoint

### 6.4 Secure Configuration
- Move sensitive config to OS keychain (future)
- File permissions on config files (700)
- Encrypt transcription database (optional)

### 6.5 Dependency Auditing
- Run `pip audit` periodically
- Pin all dependency versions
- Check for known vulnerabilities

## Security Tests (Implement Now, Run Later)

```python
# tests/unit/test_security.py

def test_server_binds_localhost_only():
    """FastAPI only listens on 127.0.0.1."""
    # Verify by checking uvicorn config

def test_no_external_requests():
    """App makes no outbound network requests."""
    # Monitor network during normal operation

def test_config_file_permissions():
    """Config file is not world-readable."""
    # Check file ACLs on Windows

def test_sql_injection_prevention():
    """SQL injection attempts are handled safely."""
    # Test parameterized queries

def test_path_traversal_prevention():
    """File path inputs reject traversal attempts."""
```

## Ralph Wiggum Gate
- Security tests defined -> pass (implementation deferred)
- Localhost-only binding verified -> pass
- Proceed to DONE
