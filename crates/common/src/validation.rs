type ValidationError = Result<(), &'static str>;

pub fn validate_email(email: &str) -> ValidationError {
    if email.is_empty() {
        return Err("Email is required");
    }

    let Some((local, domain)) = email.split_once('@') else {
        return Err("Email must contain @");
    };

    if local.is_empty() {
        return Err("Email must have a local part before @");
    }

    if !domain.contains('.') || domain.starts_with('.') || domain.ends_with('.') {
        return Err("Email must have a valid domain");
    }

    Ok(())
}

const MIN_PASSWORD_LENGTH: usize = 8;
const MAX_PASSWORD_LENGTH: usize = 128;

pub fn validate_password(password: &str) -> ValidationError {
    if password.len() < MIN_PASSWORD_LENGTH {
        return Err("Password must be at least 8 characters");
    }

    if password.len() > MAX_PASSWORD_LENGTH {
        return Err("Password must be at most 128 characters");
    }

    Ok(())
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_valid_emails() {
        assert!(validate_email("user@example.com").is_ok());
        assert!(validate_email("a@b.co").is_ok());
        assert!(validate_email("user+tag@domain.org").is_ok());
    }

    #[test]
    fn test_invalid_emails() {
        assert!(validate_email("").is_err());
        assert!(validate_email("noat").is_err());
        assert!(validate_email("@domain.com").is_err());
        assert!(validate_email("user@").is_err());
        assert!(validate_email("user@nodot").is_err());
        assert!(validate_email("user@.domain.com").is_err());
        assert!(validate_email("user@domain.").is_err());
    }

    #[test]
    fn test_valid_passwords() {
        assert!(validate_password("12345678").is_ok());
        assert!(validate_password("a".repeat(128).as_str()).is_ok());
    }

    #[test]
    fn test_invalid_passwords() {
        assert!(validate_password("").is_err());
        assert!(validate_password("1234567").is_err());
        assert!(validate_password("a".repeat(129).as_str()).is_err());
    }
}
