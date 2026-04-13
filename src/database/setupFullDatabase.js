// src/database/setupFullDatabase.js
import pool from './db.js';

async function setupDatabase() {
    let conn;
    try {
        conn = await pool.getConnection();
        console.log('🚀 Starting database setup...');

        const queries = [

            // 1. configuracoes (configuration)
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

            // 2. areas (areas of the institutions)
            `CREATE TABLE IF NOT EXISTS areas (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                area VARCHAR(90) NOT NULL
            )`,

            // 3. instituicoes (Institutions, places where the students can do the internship)
            `CREATE TABLE IF NOT EXISTS instituicoes (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                instituicao VARCHAR(255) NOT NULL,
                cnpj VARCHAR(18) NOT NULL,
                area_id INT NOT NULL,
                natureza VARCHAR(50) NOT NULL,
                email VARCHAR(255) NOT NULL,
                url VARCHAR(255) NOT NULL,
                endereco VARCHAR(50),
                bairro VARCHAR(30),
                municipio VARCHAR(30),
                cep VARCHAR(9),
                telefone VARCHAR(20),
                beneficios TEXT DEFAULT NULL,
                fim_de_semana BOOLEAN DEFAULT FALSE,
                convenio VARCHAR(15),
                expira DATE,
                seguro CHAR(1) NOT NULL DEFAULT '0' COMMENT '0=Não, 1=Sim',
                observacoes TEXT
            )`,

            // 5. visitas (visit to the institution to evaluate if can receive interns)
            `CREATE TABLE IF NOT EXISTS visitas (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                instituicao_id INT NOT NULL,
                data DATE NOT NULL,
                responsavel VARCHAR(255) NOT NULL,
                motivo TEXT NOT NULL,
                avaliacao TEXT NOT NULL,
                descricao TEXT NOT NULL
            )`,

            // 6. mural_estagio (internship board)
            `CREATE TABLE IF NOT EXISTS mural_estagios (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                instituicao_id INT NOT NULL,
                instituicao VARCHAR(255) NOT NULL COMMENT 'value = instituicoes.instituicao',
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
                local_selecao VARCHAR(255),
                forma_selecao char(1) NOT NULL DEFAULT '0',
                contato TEXT,
                periodo VARCHAR(6) NOT NULL COMMENT 'value = configuracoes.mural_estagio_periodo',
                local_inscricao char(1) NOT NULL DEFAULT '0' COMMENT '0=Instituição, 1=Coordenação de Estágio',
                email VARCHAR(255),
                outras TEXT
            )`,

            // 7. auth_users (users of the system. Can be admin, supervisor, professor or aluno)
            `CREATE TABLE auth_users (
                id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
                email char(50) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
                password char(80) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
                categoria enum('1','2','3','4') CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL DEFAULT '2',
                role enum('admin','aluno','professor','supervisor') NOT NULL DEFAULT 'aluno',
                nome varchar(255) NOT NULL,
                identificacao varchar(15) NOT NULL COMMENT 'DRE, SIAPE, CRESS',
                entidade_id int(11) NOT NULL COMMENT 'aluno.id, professor.id, supervisor.id',
                criado_em timestamp NOT NULL DEFAULT current_timestamp(),
                atualizado_em timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                aluno_id int(11) DEFAULT NULL,
                supervisor_id int(11) DEFAULT NULL,
                professor_id int(11) DEFAULT NULL,
                ativo tinyint(1) NOT NULL DEFAULT 1
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='users atualizada'`,

            // 8. Turno (turn of the student)
            `CREATE TABLE IF NOT EXISTS turnos (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                turno VARCHAR(10) NOT NULL
            )`

            // 9. alunos (students of the university)
            `CREATE TABLE IF NOT EXISTS alunos (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                nomesocial VARCHAR(255),
                ingresso VARCHAR(6),
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

            // 10. inscricoes (registrations of interns to the internship board)
            `CREATE TABLE IF NOT EXISTS inscricoes (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                registro VARCHAR(9) NOT NULL,
                aluno_id INT NOT NULL,
                muralestagio_id INT NOT NULL,
                data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                timestamp timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                periodo VARCHAR(6) NOT NULL
            )`,

            // 11. professores (university professors)
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
                departamento VARCHAR(30),
                dataegresso DATE,
                motivoegresso TEXT,
                observacoes TEXT
            )`,

            // 12. supervisores (supervisors of the students at the institutions)
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

            // 13. inst_super (Relationship Many-to-Many between institutions and supervisors)
            `CREATE TABLE IF NOT EXISTS inst_super (
                supervisor_id INT NOT NULL,
                instituicao_id INT NOT NULL,
                PRIMARY KEY (supervisor_id, instituicao_id)
            )`,

            // 14. estagiarios (students for each internship. Each student can have multiple internships)
            `CREATE TABLE IF NOT EXISTS estagiarios (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                aluno_id INT NOT NULL,
                registro VARCHAR(9) NOT NULL,
                nivel CHAR(1) NOT NULL,
                periodo VARCHAR(6) NOT NULL,
                tc CHAR(1) DEFAULT NULL,
                tc_solicitacao DATE DEFAULT NULL,
                instituicao_id INT NOT NULL,
                supervisor_id INT NULL,
                professor_id INT NULL,
                nota DECIMAL(10,2) DEFAULT NULL,
                ch smallint DEFAULT NULL,
                ajuste2020 BOOLEAN DEFAULT FALSE,
                complemento_id INT NULL,
                benetransporte tinyint DEFAULT NULL COMMENT '0=Não, 1=Sim',
                benealimentacao tinyint DEFAULT NULL COMMENT '0=Não, 1=Sim',
                benebolsa VARCHAR(5) DEFAULT NULL COMMENT 'Velue in money of Brasil R$',
                observacoes TEXT
            )`,

            // 15. turma_estagios (groups of students for each professor by period)
            `CREATE TABLE IF NOT EXISTS turma_estagios (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                area VARCHAR(30) NOT NULL COMMENT 'Change area to turma',
            )`,

            // 16. folhadeatividades (internship activity sheet fill by the intern)
            `CREATE TABLE IF NOT EXISTS folhadeatividades (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                estagiario_id INT NOT NULL,
                dia DATE,
                inicio TIME,
                final TIME,
                horario TIME,
                atividade varchar(50) NOT NULL,
                periodo VARCHAR(6) NOT NULL
            )`,

            // 17. questionarios (questionnaires to evaluate the interns by the supervisor)
            `CREATE TABLE IF NOT EXISTS questionarios (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE,
                category VARCHAR(30),
                target_user_type VARCHAR(50)
            )`,

            // 18. questoes (questions to evaluate the interns by the supervisor)
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

            // 19. respostas (responses are the answers of the supervisor to the questions: what the supervisor evaluates about the intern)
            `CREATE TABLE IF NOT EXISTS respostas (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                questionario_id INT NOT NULL,
                estagiario_id INT NOT NULL,
                response JSON,
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )`,

            // 20. complementos (special academic periods; estagiarios.complemento_id)
            `CREATE TABLE IF NOT EXISTS complementos (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                periodo_especial VARCHAR(255) NOT NULL
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
