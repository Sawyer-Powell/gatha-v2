use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier, password_hash::SaltString};
use base64::{Engine, engine::general_purpose::URL_SAFE_NO_PAD};
use chacha20poly1305::{ChaCha20Poly1305, KeyInit, Nonce, aead::Aead};
use rand::RngCore;
use rand::rngs::OsRng;

use common::events::Auth;

use crate::error::AppResult;

const NONCE_LEN: usize = 12;

pub fn encrypt_auth(auth: &Auth, key: &[u8; 32]) -> AppResult<String> {
    let cipher = ChaCha20Poly1305::new(key.into());
    let plaintext = rmp_serde::to_vec(auth)?;

    let mut nonce_bytes = [0u8; NONCE_LEN];
    rand::thread_rng().fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let ciphertext = cipher
        .encrypt(nonce, plaintext.as_ref())
        .map_err(|e| anyhow::anyhow!("encryption failed: {}", e))?;

    // nonce || ciphertext
    let mut combined = Vec::with_capacity(NONCE_LEN + ciphertext.len());
    combined.extend_from_slice(&nonce_bytes);
    combined.extend_from_slice(&ciphertext);

    Ok(URL_SAFE_NO_PAD.encode(combined))
}

pub fn decrypt_auth(token: &str, key: &[u8; 32]) -> AppResult<Auth> {
    let combined = URL_SAFE_NO_PAD
        .decode(token)
        .map_err(|e| anyhow::anyhow!("invalid base64: {}", e))?;

    if combined.len() < NONCE_LEN {
        anyhow::bail!("token too short");
    }

    let (nonce_bytes, ciphertext) = combined.split_at(NONCE_LEN);
    let nonce = Nonce::from_slice(nonce_bytes);
    let cipher = ChaCha20Poly1305::new(key.into());

    let plaintext = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|e| anyhow::anyhow!("decryption failed: {}", e))?;

    let auth: Auth = rmp_serde::from_slice(&plaintext)?;
    Ok(auth)
}

/// Dummy hash used for constant-time verification when a user doesn't exist.
/// Generated once with default argon2 params so the work is identical.
const DUMMY_HASH: &str = "$argon2id$v=19$m=19456,t=2,p=1$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAaaA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

pub fn hash_password(password: &str) -> AppResult<String> {
    let salt = SaltString::generate(&mut OsRng);
    let hash = Argon2::default()
        .hash_password(password.as_bytes(), &salt)
        .map_err(|e| anyhow::anyhow!("failed to hash password: {}", e))?;
    Ok(hash.to_string())
}

pub fn verify_password(password: &str, hash: &str) -> AppResult<bool> {
    let parsed =
        PasswordHash::new(hash).map_err(|e| anyhow::anyhow!("invalid password hash: {}", e))?;
    Ok(Argon2::default()
        .verify_password(password.as_bytes(), &parsed)
        .is_ok())
}

/// Verify against a dummy hash so the timing is consistent
/// with a real verification. Always returns false.
pub fn verify_password_dummy(password: &str) -> AppResult<bool> {
    let _ = verify_password(password, DUMMY_HASH)?;
    Ok(false)
}
