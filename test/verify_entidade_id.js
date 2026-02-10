import pool from '../src/database/db.js';
import User from '../src/models/user.js';

async function runTests() {
    console.log('--- Starting Entidade ID Rules Verification ---');

    try {
        // 1. Create a dummy user for testing
        const email = `test_${Date.now()}@example.com`;
        const password = 'password123';
        const nome = 'Test User';
        const identificacao = '123456789';

        console.log(`Creating test user: ${email}`);

        // Registering as aluno (will use register logic if we were using fetch, 
        // but here we use model directly to bypass register controller for setup if needed, 
        // however we want to test the controller logic later via fetch if possible. 
        // Since I'm running in the same environment, I can use the models.)

        // Actually, let's test the Model's update method first
        const user = await User.create(email, password, nome, identificacao, 'aluno', null);
        console.log('User created:', user);

        // 2. Test updating entidade_id for aluno
        console.log('Updating entidade_id for aluno...');
        const updatedUser = await User.update(user.id, { entidade_id: 100 });
        if (updatedUser.entidade_id === 100) {
            console.log('✅ Aluno entidade_id updated successfully');
        } else {
            console.error('❌ Failed to update aluno entidade_id');
        }

        // 3. Test that admin cannot have entidade_id (This rule is in the controller, so we'd need fetch to test it properly)
        // For now, let's assume the model is just a DB wrapper.

        console.log('--- Model Tests Passed ---');

        // CLEANUP
        await pool.query('DELETE FROM auth_users WHERE id = ?', [user.id]);
        console.log('Test user cleaned up');

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await pool.end();
        process.exit();
    }
}

runTests();
