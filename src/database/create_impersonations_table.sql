-- Create impersonations table to track admin impersonation sessions
CREATE TABLE IF NOT EXISTS impersonations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    impersonated_user_id INT NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (impersonated_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_admin_active (admin_id, is_active),
    INDEX idx_impersonated_active (impersonated_user_id, is_active)
);
