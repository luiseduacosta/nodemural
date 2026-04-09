// Test Impersonation Feature
import { getToken, getCurrentUser, authenticatedFetch } from './auth-utils.js';
import { getImpersonationButton } from './impersonation-utils.js';

$(document).ready(async function () {
    // Check if logged in and is admin
    const token = getToken();
    const user = getCurrentUser();

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    if (user.role !== 'admin') {
        alert('Apenas administradores podem acessar esta página');
        window.location.href = 'index.html';
        return;
    }

    // Load users
    await loadUsers();
    
    // Load impersonation history
    await loadImpersonationHistory();
});

async function loadUsers() {
    try {
        const response = await authenticatedFetch('/auth/users');
        const users = await response.json();
        
        const currentUser = getCurrentUser();
        const container = document.getElementById('usersContainer');
        
        if (users.length === 0) {
            container.innerHTML = '<p class="text-muted">No users found</p>';
            return;
        }
        
        let html = `
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        users.forEach(user => {
            html += `
                <tr>
                    <td>${user.nome}</td>
                    <td>${user.email}</td>
                    <td><span class="badge bg-${getRoleBadgeColor(user.role)}">${user.role}</span></td>
                    <td>
                        ${getImpersonationButton(currentUser, user)}
                    </td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading users:', error);
        document.getElementById('usersContainer').innerHTML = 
            '<p class="text-danger">Error loading users</p>';
    }
}

async function loadImpersonationHistory() {
    try {
        const response = await authenticatedFetch('/auth/admin/impersonations/history?limit=10');
        const history = await response.json();
        
        const container = document.getElementById('historyContainer');
        
        if (history.length === 0) {
            container.innerHTML = '<p class="text-muted">No impersonation history</p>';
            return;
        }
        
        let html = `
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>Started</th>
                        <th>Duration</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        history.forEach(record => {
            const started = new Date(record.started_at).toLocaleString('pt-BR');
            const duration = record.duration_minutes < 60 
                ? `${record.duration_minutes} min`
                : `${Math.floor(record.duration_minutes / 60)}h ${record.duration_minutes % 60}m`;
            
            html += `
                <tr>
                    <td>${record.impersonated_name}</td>
                    <td><span class="badge bg-${getRoleBadgeColor(record.impersonated_role)}">${record.impersonated_role}</span></td>
                    <td>${started}</td>
                    <td>${duration}</td>
                    <td>${record.is_active ? '<span class="badge bg-warning">Active</span>' : '<span class="badge bg-secondary">Ended</span>'}</td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading history:', error);
        document.getElementById('historyContainer').innerHTML = 
            '<p class="text-danger">Error loading history</p>';
    }
}

function getRoleBadgeColor(role) {
    switch (role) {
        case 'admin': return 'danger';
        case 'professor': return 'primary';
        case 'aluno': return 'success';
        case 'supervisor': return 'info';
        default: return 'secondary';
    }
}
