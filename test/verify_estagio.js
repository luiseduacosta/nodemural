const axios = require('axios');

const BASE_URL = 'http://localhost:3333/estagio';

async function verify() {
    try {
        console.log('1. Creating new estagio...');
        const createRes = await axios.post(BASE_URL, {
            instituicao: 'Test Corp',
            cnpj: '12345678000199',
            beneficio: 'Valuable Experience'
        });
        console.log('Status:', createRes.status);
        const newId = createRes.data.id;
        console.log('Created ID:', newId);

        console.log('\n2. Reading created estagio...');
        const readRes = await axios.get(`${BASE_URL}/${newId}`);
        console.log('Data:', readRes.data);
        if (readRes.data.instituicao !== 'Test Corp') throw new Error('Instituicao mismatch');

        console.log('\n3. Updating estagio...');
        await axios.put(`${BASE_URL}/${newId}`, {
            instituicao: 'Test Corp Updated',
            cnpj: '12345678000199',
            beneficio: 'More Experience'
        });
        const readUpdatedRes = await axios.get(`${BASE_URL}/${newId}`);
        console.log('Updated Data:', readUpdatedRes.data);
        if (readUpdatedRes.data.instituicao !== 'Test Corp Updated') throw new Error('Update failed');

        console.log('\n4. Deleting estagio...');
        await axios.delete(`${BASE_URL}/${newId}`);
        try {
            await axios.get(`${BASE_URL}/${newId}`);
        } catch (err) {
            if (err.response && err.response.status === 404) {
                console.log('Estagio correctly not found after delete.');
            } else {
                throw err;
            }
        }
        console.log('\nVerification Passed!');
    } catch (err) {
        console.error('Verification Failed:', err.message);
        if (err.response) console.error('Response data:', err.response.data);
        process.exit(1);
    }
}

verify();
