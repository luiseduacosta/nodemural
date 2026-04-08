// Impersonation utilities for admin users

/**
 * Start impersonating a user (admin only)
 * @param {number} userId - The ID of the user to impersonate
 */
export async function impersonateUser(userId) {
    if (!confirm('Tem certeza que deseja impersonar este usuário? Você verá o sistema exatamente como este usuário vê.')) {
        return;
    }

    try {
        const response = await fetch(`/auth/admin/impersonate/${userId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            alert(`Erro: ${error.error}`);
            return;
        }

        const data = await response.json();
        
        // Store new token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Show impersonation banner
        showImpersonationBanner();
        
        // Reload to apply new permissions
        window.location.reload();
        
    } catch (error) {
        console.error('Error impersonating user:', error);
        alert('Erro ao iniciar impersonação');
    }
}

/**
 * Stop impersonation and return to admin account
 */
export async function stopImpersonation() {
    if (!confirm('Deseja parar de impersonar e retornar à sua conta de administrador?')) {
        return;
    }

    try {
        const response = await fetch('/auth/admin/stop-impersonate', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            alert(`Erro: ${error.error}`);
            return;
        }

        const data = await response.json();
        
        // Restore admin token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Reload to restore admin permissions
        window.location.reload();
        
    } catch (error) {
        console.error('Error stopping impersonation:', error);
        alert('Erro ao parar impersonação');
    }
}

/**
 * Show impersonation warning banner at the top of the page
 */
export function showImpersonationBanner() {
    const user = getCurrentUser();
    
    if (!user || !user.isImpersonating) {
        return;
    }

    // Check if banner already exists
    if (document.getElementById('impersonation-banner')) {
        return;
    }

    // Create banner
    const banner = document.createElement('div');
    banner.id = 'impersonation-banner';
    banner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 10000;
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
        color: white;
        padding: 12px 20px;
        text-align: center;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        font-family: Arial, sans-serif;
        font-size: 14px;
    `;

    banner.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 15px; flex-wrap: wrap;">
            <span style="font-size: 18px;">⚠️</span>
            <strong style="font-size: 15px;">MODO IMPERSONAÇÃO</strong>
            <span>Você está vendo o sistema como: <strong>${user.nome}</strong> (${user.role})</span>
            <button id="stop-impersonation-btn" style="
                background: white;
                color: #ee5a6f;
                border: none;
                padding: 6px 16px;
                border-radius: 4px;
                font-weight: bold;
                cursor: pointer;
                font-size: 13px;
                transition: all 0.2s;
            ">
                ← Voltar para Admin
            </button>
        </div>
    `;

    // Add to beginning of body
    document.body.insertBefore(banner, document.body.firstChild);

    // Add padding to body to prevent content from being hidden
    document.body.style.paddingTop = '60px';

    // Add event listener to stop button
    document.getElementById('stop-impersonation-btn').addEventListener('click', stopImpersonation);
}

/**
 * Get impersonation button HTML for user list
 * @param {object} user - The current user object
 * @param {object} targetUser - The user to potentially impersonate
 * @returns {string} HTML string or empty string
 */
export function getImpersonationButton(user, targetUser) {
    // Only admin can impersonate, and cannot impersonate themselves or other admins
    if (!user || user.role !== 'admin') {
        return '';
    }

    if (user.id === targetUser.id || targetUser.role === 'admin') {
        return '';
    }

    return `
        <button 
            onclick="impersonateUser(${targetUser.id})" 
            class="btn btn-sm btn-warning"
            title="Impersonar este usuário"
            style="margin-left: 5px;"
        >
            👤 Impersonar
        </button>
    `;
}

// Helper function to get current user
function getCurrentUser() {
    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        return JSON.parse(userStr);
    } catch (error) {
        return null;
    }
}

// Make functions available globally for onclick handlers
if (typeof window !== 'undefined') {
    window.impersonateUser = impersonateUser;
    window.stopImpersonation = stopImpersonation;
}
