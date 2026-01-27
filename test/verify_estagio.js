// Test script for estagio CRUD operations
// Note: The estagio table requires several fields to be NOT NULL:
// endereco, bairro, municipio, cep, telefone
// These must be provided even as empty strings

import axios from 'axios';

const BASE_URL = 'http://localhost:3333/estagio';

async function verify() {
    try {
        console.log('1. Creating new estagio...');
        const createPayload = {
            instituicao: 'Test Corp',
            cnpj: '12345678000199',
            beneficio: 'Valuable Experience',
            url: '',
            endereco: 'Test Address',  // Cannot be null
            bairro: 'Test Neighborhood',  // Cannot be null
            municipio: 'Test City',  // Cannot be null
            cep: '12345678',  // Cannot be null
            telefone: '123456789',  // Cannot be null
            fim_de_semana: 0,
            convenio: 0,
            expira: null,
            seguro: 0,
            avaliacao: [3],
            observacoes: 'Test observation'
        };
        
        console.log('Sending payload:', JSON.stringify(createPayload, null, 2));
        
        const createRes = await axios.post(BASE_URL, createPayload);
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
            beneficio: 'More Experience',
            url: '',
            endereco: 'Updated Address',
            bairro: 'Updated Neighborhood',
            municipio: 'Updated City',
            cep: '87654321',
            telefone: '987654321',
            fim_de_semana: 1,
            convenio: 1,
            expira: null,
            seguro: 1,
            avaliacao: [4],
            observacoes: 'Updated observation'
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
        console.log('\n✅ Verification Passed!');
    } catch (err) {
        console.error('\n❌ Verification Failed:', err.message);
        if (err.response) {
            console.error('Response status:', err.response.status);
            console.error('Response data:', err.response.data);
            console.error('Response headers:', err.response.headers);
        }
        console.error('Stack trace:', err.stack);
        process.exit(1);
    }
}

verify();
