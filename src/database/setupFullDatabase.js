// src/database/setupFullDatabase.js
import pool from './db.js';

async function setupDatabase() {
    let conn;
    try {
        conn = await pool.getConnection();
        console.log('🚀 Starting database setup...');

        const queries = [
            // 1. auth_users (users of the system. Can be admin, supervisor, professor or aluno)
            `CREATE TABLE IF NOT EXISTS auth_users (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                nome VARCHAR(255) NOT NULL,
                identificacao VARCHAR(50),
                role ENUM('admin', 'supervisor', 'professor', 'aluno') DEFAULT 'aluno',
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
                ingresso VARCHAR(6),
                turno VARCHAR(20) NULL COMMENT 'DEPRECATED: Turno of the internship',
                turno_id INT NULL,
                registro VARCHAR(9) UNIQUE,
                telefone VARCHAR(15),
                celular VARCHAR(15),
                email VARCHAR(255),
                cpf VARCHAR(14),
                identidade VARCHAR(15),
                orgao VARCHAR(30),
                nascimento DATE,
                cep VARCHAR(9),
                endereco VARCHAR(50),
                municipio VARCHAR(30),
                bairro VARCHAR(30),
                observacoes TEXT
            )`,

            // 3. professores (university professors)
            `CREATE TABLE IF NOT EXISTS professores (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                cpf VARCHAR(14),
                siape VARCHAR(8) UNIQUE COMMENT 'SIAPE ID = 8 characters of numbers',
                cress VARCHAR(10) UNIQUE,
                regiao VARCHAR(2),
                telefone VARCHAR(20),
                celular VARCHAR(20),
                email VARCHAR(255),
                curriculolattes VARCHAR(16) COMMENT 'Lattes ID = 16 characters of numbers',
                atualizacaolattes DATE,
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
                cpf VARCHAR(14) NULL,
                email VARCHAR(255),
                telefone VARCHAR(20) COMMENT 'Deprecated: Phone number',
                celular VARCHAR(20),
                cress VARCHAR(10) UNIQUE,
                regiao VARCHAR(2) NULL,
                escola varchar(255) NULL, 
                ano_formacao INT NULL,
                cargo VARCHAR(30) NULL,
                observacoes TEXT
            )`,

            // 5. instituicoes (Institutions, places where the students can do the internship)
            `CREATE TABLE IF NOT EXISTS instituicoes (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                instituicao VARCHAR(255) NOT NULL,
                cnpj VARCHAR(18) NOT NULL,
                area_id INT NOT NULL,
                natureza VARCHAR(50) NOT NULL,
                email VARCHAR(255) NOT NULL,
                url VARCHAR(255) NOT NULL,
                endereco VARCHAR(255),
                bairro VARCHAR(100),
                municipio VARCHAR(100),
                cep VARCHAR(9),
                telefone VARCHAR(20),
                beneficios TEXT DEFAULT NULL,
                fim_de_semana BOOLEAN DEFAULT FALSE,
                convenio VARCHAR(255),
                expira DATE,
                seguro VARCHAR(255),
                observacoes TEXT
            )`,

            // 6. areas (areas of the institutions)
            `CREATE TABLE IF NOT EXISTS areas (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                area VARCHAR(90) NOT NULL
            )`,

            // 7. mural_estagio (internship board)
            `CREATE TABLE IF NOT EXISTS mural_estagios (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                instituicao_id INT NOT NULL,
                instituicao VARCHAR(255) NOT NULL,
                convenio char(1) NOT NULL DEFAULT '0',
                vagas INT DEFAULT NULL,
                beneficios TEXT DEFAULT NULL,
                final_de_semana BOOLEAN DEFAULT FALSE,
                carga_horaria CHAR(10) NOT NULL,
                requisitos TEXT,
                horario CHAR(1) COMMENT 'D, 'N', 'A',
                data_selecao DATE,
                horario_selecao TIME,
                data_inscricao DATE,
                horario_inscricao TIME,
                local_selecao VARCHAR(255),
                forma_selecao char(1) NOT NULL DEFAULT '0',
                contato TEXT,
                periodo VARCHAR(6) NOT NULL,
                local_inscricao char(1) COMMENT '0=Instituição, 1=Coordenação de Estágio',
                email VARCHAR(255),
                outras TEXT
            )`,

            // 8. inscricoes (registrations of interns to the internship board)
            `CREATE TABLE IF NOT EXISTS inscricoes (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                registro VARCHAR(9) NOT NULL,
                aluno_id INT NOT NULL,
                muralestagio_id INT NOT NULL,
                data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                timestamp timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                periodo VARCHAR(6) NOT NULL
            )`,

            // 9. estagiarios (students for each internship. Each student can have multiple internships)
            `CREATE TABLE IF NOT EXISTS estagiarios (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                aluno_id INT NOT NULL,
                registro VARCHAR(9) NOT NULL,
                nivel CHAR(1) NOT NULL,
                tc CHAR(1) DEFAULT NULL,
                tc_solicitacao DATE DEFAULT NULL,
                professor_id INT NULL,
                supervisor_id INT NULL,
                instituicao_id INT NOT NULL,
                periodo VARCHAR(6) NOT NULL,
                nota DECIMAL(10,2) DEFAULT NULL,
                ch smallint DEFAULT NULL,
                ajuste2020 BOOLEAN DEFAULT FALSE,
                complemento_id INT NULL,
                benetransporte tinyint DEFAULT NULL,
                benealimentacao tinyint DEFAULT NULL,
                benebolsa VARCHAR(5) DEFAULT NULL,
                observacoes TEXT
            )`,

            // 10. turma_estagios (groups of students for each professor by period)
            `CREATE TABLE IF NOT EXISTS turma_estagios (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                area VARCHAR(70) NOT NULL
            )`,

            // 11. folhadeatividades (internship activity sheet fill by the intern)
            `CREATE TABLE IF NOT EXISTS folhadeatividades (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                estagiario_id INT NOT NULL,
                dia DATE,
                inicio TIME,
                final TIME,
                horario TIME,
                atividade varchar(100) NOT NULL,
                periodo VARCHAR(6) NOT NULL
            )`,

            // 12. questionarios (questionnaires to evaluate the interns by the supervisor)
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

            // 13. questoes (questions to evaluate the interns by the supervisor)
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

            // 14. respostas (responses are the answers of the supervisor to the questions: what the supervisor evaluates about the intern)
            `CREATE TABLE IF NOT EXISTS respostas (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                questionario_id INT NOT NULL,
                estagiario_id INT NOT NULL,
                response JSON,
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )`,

            // 15. visitas (visit to the institution to evaluate if can receive interns)
            `CREATE TABLE IF NOT EXISTS visitas (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                instituicao_id INT NOT NULL,
                data DATE NOT NULL,
                responsavel VARCHAR(255) NOT NULL,
                motivo TEXT NOT NULL,
                avaliacao TEXT NOT NULL,
                descricao TEXT NOT NULL
            )`,

            // 16. configuracoes (configuration)
            `CREATE TABLE IF NOT EXISTS configuracoes (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                instituicao varchar(255) NOT NULL DEFAULT 'ESS/UFRJ',
                mural_periodo_atual CHAR(6) NOT NULL,
                curso_turma_atual SMALLINT NOT NULL,
                curso_abertura_inscricoes DATE,
                curso_encerramento_inscricoes DATE,
                termo_compromisso_periodo CHAR(6) NOT NULL,
                termo_compromisso_inicio DATE,
                termo_compromisso_final DATE,
                periodo_calendario_academico CHAR(6) NOT NULL
            )`,

            // 17. inst_super (Relationship Many-to-Many between institutions and supervisors)
            `CREATE TABLE IF NOT EXISTS inst_super (
                supervisor_id INT NOT NULL,
                instituicao_id INT NOT NULL,
                PRIMARY KEY (supervisor_id, instituicao_id)
            )`,

            // 18. Turno (turn of the internship)
            `CREATE TABLE IF NOT EXISTS turnos (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                turno VARCHAR(10) NOT NULL
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
