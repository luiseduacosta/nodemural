// src/database/setupFullDatabase.js
import pool from './db.js';

async function setupDatabase() {
    let conn;
    try {
        conn = await pool.getConnection();
        console.log('🚀 Starting database setup...');

        const queries = [
            // 1. auth_users (users of the system. Can be admin, supervisor, docente or aluno)
            `CREATE TABLE IF NOT EXISTS auth_users (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                nome VARCHAR(255) NOT NULL,
                identificacao VARCHAR(50),
                role ENUM('admin', 'supervisor', 'docente', 'aluno') DEFAULT 'aluno',
                entidade_id INT,
                ativo BOOLEAN DEFAULT TRUE,
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )`,

            // 2. alunos (students of the university)
            `CREATE TABLE IF NOT EXISTS alunos (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                nomesocial VARCHAR(255),
                ingresso VARCHAR(10),
                turno VARCHAR(20),
                registro VARCHAR(50) UNIQUE,
                telefone VARCHAR(20),
                celular VARCHAR(20),
                email VARCHAR(255),
                cpf VARCHAR(20),
                identidade VARCHAR(50),
                orgao VARCHAR(50),
                nascimento DATE,
                cep VARCHAR(10),
                endereco VARCHAR(255),
                municipio VARCHAR(100),
                bairro VARCHAR(100),
                observacoes TEXT
            )`,

            // 3. docentes (university professors)
            `CREATE TABLE IF NOT EXISTS docentes (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                cpf VARCHAR(20),
                siape VARCHAR(50) UNIQUE,
                datanascimento DATE,
                localnascimento VARCHAR(100),
                sexo VARCHAR(20),
                telefone VARCHAR(20),
                celular VARCHAR(20),
                email VARCHAR(255),
                curriculolattes VARCHAR(255),
                atualizacaolattes DATE,
                formacaoprofissional VARCHAR(255),
                universidadedegraduacao VARCHAR(255),
                anoformacao INT,
                dataingresso DATE,
                departamento VARCHAR(100),
                dataegresso DATE,
                motivoegresso TEXT,
                observacoes TEXT
            )`,

            // 4. supervisores (supervisors of the students at the institutions)
            `CREATE TABLE IF NOT EXISTS supervisores (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                celular VARCHAR(20),
                cress VARCHAR(50) UNIQUE
            )`,

            // 5. area_instituicoes (areas of the institutions)
            `CREATE TABLE IF NOT EXISTS area_instituicoes (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                area VARCHAR(255) NOT NULL
            )`,

            // 6. estagio (Institutions, places where the students can do the internship)
            `CREATE TABLE IF NOT EXISTS estagio (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                instituicao VARCHAR(255) NOT NULL,
                cnpj VARCHAR(20),
                beneficio TEXT,
                areainstituicoes_id INT,
                url VARCHAR(255),
                endereco VARCHAR(255),
                bairro VARCHAR(100),
                municipio VARCHAR(100),
                cep VARCHAR(10),
                telefone VARCHAR(20),
                fim_de_semana BOOLEAN,
                convenio VARCHAR(255),
                expira DATE,
                seguro VARCHAR(255),
                avaliacao TEXT,
                observacoes TEXT
            )`,

            // 7. turma_estagios (groups of students for each professor by period)
            `CREATE TABLE IF NOT EXISTS turma_estagios (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                area VARCHAR(255) NOT NULL
            )`,

            // 8. estagiarios (students for each internship. Each student can have multiple internships)
            `CREATE TABLE IF NOT EXISTS estagiarios (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                aluno_id INT,
                professor_id INT,
                supervisor_id INT,
                instituicao_id INT,
                turmaestagio_id INT,
                periodo VARCHAR(20),
                turno VARCHAR(20),
                nivel INT,
                ajuste2020 BOOLEAN,
                nota DECIMAL(10,2),
                ch smallint,
                observacoes TEXT
            )`,

            // 9. mural_estagio (internship board)
            `CREATE TABLE IF NOT EXISTS mural_estagio (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                instituicao_id INT,
                instituicao VARCHAR(255),
                convenio VARCHAR(255),
                vagas INT,
                beneficios TEXT,
                final_de_semana BOOLEAN,
                cargaHoraria VARCHAR(50),
                requisitos TEXT,
                turmaestagio_id INT,
                horario VARCHAR(255),
                professor_id INT,
                dataSelecao DATE,
                dataInscricao DATE,
                horarioSelecao TIME,
                localSelecao VARCHAR(255),
                formaSelecao TEXT,
                contato TEXT,
                outras TEXT,
                periodo VARCHAR(20),
                datafax DATE,
                localInscricao VARCHAR(255),
                email VARCHAR(255)
            )`,

            // 10. inscricoes (registrations of interns to the internship board)
            `CREATE TABLE IF NOT EXISTS inscricoes (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                registro VARCHAR(50),
                aluno_id INT,
                muralestagio_id INT,
                data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                periodo VARCHAR(20)
            )`,

            // 11. questionarios (questionnaires to evaluate the interns by the supervisor)
            `CREATE TABLE IF NOT EXISTS questionarios (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE,
                category VARCHAR(100),
                target_user_type VARCHAR(50)
            )`,

            // 12. questoes (questions to evaluate the interns by the supervisor)
            `CREATE TABLE IF NOT EXISTS questoes (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                questionario_id INT,
                text TEXT NOT NULL,
                type ENUM('radio', 'checkbox', 'select', 'short_text', 'long_text') DEFAULT 'short_text',
                options TEXT,
                ordem INT,
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )`,

            // 13. respostas (responses are the answers of the supervisor to the questions: what the supervisor evaluates about the intern)
            `CREATE TABLE IF NOT EXISTS respostas (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                questionario_id INT,
                estagiario_id INT,
                response JSON,
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )`,

            // 14. folhadeatividades (internship activity sheet fill by the intern)
            `CREATE TABLE IF NOT EXISTS folhadeatividades (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                estagiario_id INT,
                dia DATE,
                inicio TIME,
                final TIME,
                horario TIME,
                atividade varchar(100),
            `,

            // 15. visita (visit to the institution to evaluate if can receive interns)
            `CREATE TABLE IF NOT EXISTS visita (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                instituicao_id INT,
                data DATE,
                responsavel VARCHAR(255),
                motivo TEXT,
                avaliacao TEXT,
                descricao TEXT
            )`,

            // 16. configuracoes (configuration)
            `CREATE TABLE IF NOT EXISTS configuracoes (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                mural_periodo_atual VARCHAR(20),
                curso_turma_atual VARCHAR(100),
                curso_abertura_inscricoes DATE,
                curso_encerramento_inscricoes DATE,
                termo_compromisso_periodo VARCHAR(20),
                termo_compromisso_inicio DATE,
                termo_compromisso_final DATE,
                periodo_calendario_academico VARCHAR(50)
            )`,

            // 17. inst_super (Relationship Many-to-Many between institutions and supervisors)
            `CREATE TABLE IF NOT EXISTS inst_super (
                supervisor_id INT NOT NULL,
                instituicao_id INT NOT NULL,
                PRIMARY KEY (supervisor_id, instituicao_id)
            )`
        ];

        for (const query of queries) {
            await conn.query(query);
        }

        console.log('✅ All tables created successfully!');

        // Insert initial configuration if empty
        const configRows = await conn.query('SELECT COUNT(*) as count FROM configuracoes');
        if (configRows[0].count === 0) {
            await conn.query('INSERT INTO configuracoes (mural_periodo_atual) VALUES ("2026-1")');
            console.log('📝 Initial configuration inserted.');
        }

    } catch (error) {
        console.error('❌ Error setting up database:', error);
    } finally {
        if (conn) {
            await conn.release();
            await pool.end();
        }
    }
}

setupDatabase();
