import express from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import mariadb, { SqlError } from 'mariadb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const pool = mariadb.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'tccess'
});

// --- INDEX ENDPOINTS ---
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// --- ALUNOS ENDPOINTS ---
// READ ONE
app.get('/alunos/:id', async (req, res) => {
  const alunoId = req.params.id;
  if (alunoId) {
    // console.log('Aluno ID is ' + alunoId);
  } else {
    // console.log('Falta o aluno ID');
    return res.status(400).json({ error: 'Falta o aluno ID' });
  }
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT id, nome, nomesocial, registro, email, ingresso, telefone, celular, cpf, identidade, orgao, nascimento, cep, endereco, municipio, bairro, observacoes FROM alunos WHERE id = ?', [alunoId]);
    if (rows.length === 0) {
      // console.log('Aluno não encontrado');
      return res.status(404).json({ error: 'Aluno not found' });
    } else if (rows.length > 1) {
      // console.log('Aluno encontrado');
      return res.status(500).json({ error: 'Aluno encontrado' });
    }
    // console.log('Aluno encontrado');
    res.setHeader('Content-Type', 'application/json');
    return res.json(rows[0]);
  } catch (err) {
    // console.error('Error fetching aluno:', err);
    return res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// READ ALL
app.get('/alunos', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    let query = 'SELECT id, nome, nomesocial, registro, email, ingresso, telefone, celular, cpf, identidade, orgao, nascimento, cep, endereco, municipio, bairro, observacoes FROM alunos ORDER BY nome ASC';
    let params = [];

    if (req.query.search) {
      query += ' WHERE nome LIKE ? OR nomesocial LIKE ? OR registro LIKE ? OR email LIKE ?';
      const searchTerm = `%${req.query.search}%`;
      params = [searchTerm, searchTerm, searchTerm, searchTerm];
    }

    const rows = await conn.query(query, params);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// CREATE
app.post('/alunos', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(
      'INSERT INTO alunos (nome, nomesocial, registro, email, ingresso, telefone, celular, cpf, identidade, orgao, nascimento, cep, endereco, municipio, bairro, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.body.nome, req.body.nomesocial, req.body.registro, req.body.email, req.body.ingresso, req.body.telefone, req.body.celular, req.body.cpf, req.body.identidade, req.body.orgao, req.body.nascimento, req.body.cep, req.body.endereco, req.body.municipio, req.body.bairro, req.body.observacoes]
    );
    res.status(201).json({ id: Number(result.insertId) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// UPDATE
app.put('/alunos/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(
      'UPDATE alunos SET nome = ?, nomesocial = ?, registro = ?, email = ?, ingresso = ?, telefone = ?, celular = ?, cpf = ?, identidade = ?, orgao = ?, nascimento = ?, cep = ?, endereco = ?, municipio = ?, bairro = ?, observacoes = ? WHERE id = ?',
      [req.body.nome, req.body.nomesocial, req.body.registro, req.body.email, req.body.ingresso, req.body.telefone, req.body.celular, req.body.cpf, req.body.identidade, req.body.orgao, req.body.nascimento, req.body.cep, req.body.endereco, req.body.municipio, req.body.bairro, req.body.observacoes, req.params.id]
    );
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// DELETE
app.delete('/alunos/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('DELETE FROM alunos WHERE id = ?', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// READ INSCRICOES OF A STUDENT
app.get('/alunos/:id/inscricoes', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(
      `SELECT i.*, m.instituicao 
       FROM inscricoes i 
       LEFT JOIN mural_estagio m ON i.muralestagio_id = m.id 
       WHERE i.aluno_id = ? 
       ORDER BY i.data DESC`,
      [req.params.id]
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// --- DOCENTES ENDPOINTS ---

// READ ALL DOCENTES
app.get('/docentes', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    let query = 'SELECT id, nome, siape, email, celular FROM docentes';
    let params = [];

    if (req.query.search) {
      query += ' WHERE nome LIKE ? OR siape LIKE ? OR email LIKE ? OR celular LIKE ?';
      const searchTerm = `%${req.query.search}%`;
      params = [searchTerm, searchTerm, searchTerm, searchTerm];
    }

    query += ' ORDER BY nome ASC';

    const rows = await conn.query(query, params);
    return res.json(rows);
  } catch (err) {
    console.error('Error fetching docentes:', err);
    return res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// READ ONE DOCENTE
app.get('/docentes/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT id, nome, siape, email, celular FROM docentes WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Docente not found' });
    }
    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// CREATE DOCENTE
app.post('/docentes', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(
      'INSERT INTO docentes (nome, siape, email, celular) VALUES (?, ?, ?, ?)',
      [req.body.nome, req.body.siape, req.body.email, req.body.celular]
    );
    res.status(201).json({ id: Number(result.insertId) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// UPDATE DOCENTE
app.put('/docentes/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(
      'UPDATE docentes SET nome = ?, siape = ?, email = ?, celular = ? WHERE id = ?',
      [req.body.nome, req.body.siape, req.body.email, req.body.celular, req.params.id]
    );
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// DELETE DOCENTE
app.delete('/docentes/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('DELETE FROM docentes WHERE id = ?', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// --- ESTAGIO ENDPOINTS ---

// READ ALL ESTAGIO
app.get('/estagio', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM estagio ORDER BY instituicao ASC');
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// READ ONE ESTAGIO
app.get('/estagio/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM estagio WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Estagio not found' });
    }
    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// READ SUPERVISORES DO ESTAGIO
app.get('/estagio/:id/supervisores', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM supervisores WHERE id IN (SELECT supervisor_id FROM inst_super WHERE instituicao_id = ?) ORDER BY nome ASC', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Supervisores not found' });
    }
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});


// GET MURAL BY INSTITUICAO
app.get('/estagio/:id/mural', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const query = `
      SELECT id, periodo, vagas 
      FROM mural_estagio 
      WHERE instituicao_id = ?
      ORDER BY periodo DESC
    `;
    const rows = await conn.query(query, [req.params.id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  } finally {
    if (conn) conn.end();
  }
});

// CREATE ESTAGIO
app.post('/estagio', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(
      'INSERT INTO estagio (instituicao, cnpj, beneficio) VALUES (?, ?, ?)',
      [req.body.instituicao, req.body.cnpj, req.body.beneficio]
    );
    res.status(201).json({ id: Number(result.insertId) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// UPDATE ESTAGIO
app.put('/estagio/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(
      'UPDATE estagio SET instituicao = ?, cnpj = ?, beneficio = ? WHERE id = ?',
      [req.body.instituicao, req.body.cnpj, req.body.beneficio, req.params.id]
    );
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// DELETE ESTAGIO
app.delete('/estagio/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('DELETE FROM estagio WHERE id = ?', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// --- SUPERVISORES ENDPOINTS ---

// READ ALL SUPERVISORES
app.get('/supervisores', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT id, nome, email, celular, cress FROM supervisores ORDER BY nome ASC');
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// READ ONE SUPERVISOR
app.get('/supervisores/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT id, nome, email, celular, cress FROM supervisores WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Supervisor not found' });
    }
    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// CREATE SUPERVISOR
app.post('/supervisores', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(
      'INSERT INTO supervisores (nome, email, celular, cress) VALUES (?, ?, ?, ?)',
      [req.body.nome, req.body.email, req.body.celular, req.body.cress]
    );
    res.status(201).json({ id: Number(result.insertId) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// UPDATE SUPERVISOR
app.put('/supervisores/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(
      'UPDATE supervisores SET nome = ?, email = ?, celular = ?, cress = ? WHERE id = ?',
      [req.body.nome, req.body.email, req.body.celular, req.body.cress, req.params.id]
    );
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// DELETE SUPERVISOR
app.delete('/supervisores/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    // First delete relationships
    await conn.query('DELETE FROM inst_super WHERE supervisor_id = ?', [req.params.id]);
    // Then delete supervisor
    await conn.query('DELETE FROM supervisores WHERE id = ?', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// GET INSTITUICOES FOR A SUPERVISOR
app.get('/supervisores/:id/instituicoes', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(
      `SELECT e.id as instituicao_id, e.instituicao 
       FROM estagio e 
       INNER JOIN inst_super i ON e.id = i.instituicao_id 
       WHERE i.supervisor_id = ? 
       ORDER BY e.instituicao ASC`,
      [req.params.id]
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// ADD INSTITUICAO TO SUPERVISOR
app.post('/supervisores/:id/instituicoes', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(
      'INSERT INTO inst_super (supervisor_id, instituicao_id) VALUES (?, ?)',
      [req.params.id, req.body.instituicao_id]
    );
    res.status(201).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// REMOVE INSTITUICAO FROM SUPERVISOR
app.delete('/supervisores/:id/instituicoes/:instituicaoId', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(
      'DELETE FROM inst_super WHERE supervisor_id = ? AND instituicao_id = ?',
      [req.params.id, req.params.instituicaoId]
    );
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// --- MURAL ENDPOINTS ---

// READ ALL MURAL
app.get('/mural', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    let query = 'SELECT * FROM mural_estagio';
    let params = [];

    // console.log(req.query.periodo);

    if (req.query.periodo) {
      query += ' WHERE periodo = ?';
      params.push(req.query.periodo);
    }

    query += ' ORDER BY periodo DESC, dataInscricao ASC';
    // console.log(query);

    const rows = await conn.query(query, params);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// GET DISTINCT PERIODOS
app.get('/mural/periodos', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    // Distinct periods from mural_estagio
    const rows = await conn.query('SELECT DISTINCT periodo FROM mural_estagio ORDER BY periodo DESC');
    // Row structure: [ { periodo: '2024-1' }, ... ]
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// READ ONE MURAL
app.get('/mural/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM mural_estagio WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Mural not found' });
    }
    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// CREATE MURAL
app.post('/mural', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(
      `INSERT INTO mural_estagio (instituicao_id, instituicao, convenio, vagas, beneficios, 
       final_de_semana, cargaHoraria, requisitos, turmaestagio_id, horario, professor_id, 
       dataSelecao, dataInscricao, horarioSelecao, localSelecao, formaSelecao, contato, 
       outras, periodo, datafax, localInscricao, email) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.body.instituicao_id, req.body.instituicao, req.body.convenio, req.body.vagas,
        req.body.beneficios, req.body.final_de_semana, req.body.cargaHoraria, req.body.requisitos,
        req.body.turmaestagio_id, req.body.horario, req.body.professor_id, req.body.dataSelecao,
        req.body.dataInscricao, req.body.horarioSelecao, req.body.localSelecao, req.body.formaSelecao,
        req.body.contato, req.body.outras, req.body.periodo, req.body.datafax, req.body.localInscricao,
        req.body.email
      ]
    );
    res.status(201).json({ id: Number(result.insertId) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// UPDATE MURAL
app.put('/mural/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(
      `UPDATE mural_estagio SET instituicao_id = ?, instituicao = ?, convenio = ?, vagas = ?, 
       beneficios = ?, final_de_semana = ?, cargaHoraria = ?, requisitos = ?, turmaestagio_id = ?, 
       horario = ?, professor_id = ?, dataSelecao = ?, dataInscricao = ?, horarioSelecao = ?, 
       localSelecao = ?, formaSelecao = ?, contato = ?, outras = ?, periodo = ?, datafax = ?, 
       localInscricao = ?, email = ? WHERE id = ?`,
      [
        req.body.instituicao_id, req.body.instituicao, req.body.convenio, req.body.vagas,
        req.body.beneficios, req.body.final_de_semana, req.body.cargaHoraria, req.body.requisitos,
        req.body.turmaestagio_id, req.body.horario, req.body.professor_id, req.body.dataSelecao,
        req.body.dataInscricao, req.body.horarioSelecao, req.body.localSelecao, req.body.formaSelecao,
        req.body.contato, req.body.outras, req.body.periodo, req.body.datafax, req.body.localInscricao,
        req.body.email, req.params.id
      ]
    );
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// DELETE MURAL
app.delete('/mural/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('DELETE FROM mural_estagio WHERE id = ?', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// --- INSCRICOES ENDPOINTS ---

// READ ALL INSCRICOES with JOIN
app.get('/inscricoes', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    let query = `SELECT i.*, a.nome as aluno_nome, m.instituicao 
       FROM inscricoes i 
       LEFT JOIN alunos a ON i.aluno_id = a.id 
       LEFT JOIN mural_estagio m ON i.muralestagio_id = m.id`;

    let params = [];
    if (req.query.periodo) {
      query += ' WHERE i.periodo = ?';
      params.push(req.query.periodo);
    }

    query += ' ORDER BY i.periodo DESC, a.nome ASC';

    const rows = await conn.query(query, params);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// GET DISTINCT PERIODOS FOR INSCRICOES
app.get('/inscricoes/periodos', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT DISTINCT periodo FROM inscricoes ORDER BY periodo DESC');
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// READ ONE INSCRICAO with JOIN
app.get('/inscricoes/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(
      `SELECT i.*, a.nome as aluno_nome, a.email as aluno_email, m.instituicao 
       FROM inscricoes i 
       LEFT JOIN alunos a ON i.aluno_id = a.id 
       LEFT JOIN mural_estagio m ON i.muralestagio_id = m.id 
       WHERE i.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Inscricao not found' });
    }
    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// READ INSCRICOES BY ALUNO ID AND MURALESTAGIO ID
app.get('/inscricoes/:aluno_id/:muralestagio_id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(
      'SELECT * FROM inscricoes WHERE aluno_id = ? AND muralestagio_id = ? LIMIT 1',
      [req.params.aluno_id, req.params.muralestagio_id]
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// GET INSCRICOES FOR A SPECIFIC MURAL
app.get('/mural/:id/inscricoes', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const query = `
      SELECT i.*, a.nome as aluno_nome, a.email as aluno_email, a.registro as aluno_registro
      FROM inscricoes i
      LEFT JOIN alunos a ON i.aluno_id = a.id
      WHERE i.muralestagio_id = ?
      ORDER BY i.data DESC
    `;
    const rows = await conn.query(query, [req.params.id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  } finally {
    if (conn) conn.end();
  }
});

// CREATE INSCRICAO
app.post('/inscricoes', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();

    // Check if student already registered for this mural in this period
    const existing = await conn.query(
      'SELECT id FROM inscricoes WHERE aluno_id = ? AND muralestagio_id = ? AND periodo = ?',
      [req.body.aluno_id, req.body.muralestagio_id, req.body.periodo]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Aluno já inscrito nesta vaga para este período' });
    }

    const result = await conn.query(
      'INSERT INTO inscricoes (registro, aluno_id, muralestagio_id, data, periodo) VALUES (?, ?, ?, ?, ?)',
      [req.body.registro || 0, req.body.aluno_id, req.body.muralestagio_id, req.body.data, req.body.periodo]
    );
    res.status(201).json({ id: Number(result.insertId) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// UPDATE INSCRICAO
app.put('/inscricoes/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();

    // Check if another student already registered for this mural in this period
    const existing = await conn.query(
      'SELECT id FROM inscricoes WHERE aluno_id = ? AND muralestagio_id = ? AND periodo = ? AND id != ?',
      [req.body.aluno_id, req.body.muralestagio_id, req.body.periodo, req.params.id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Aluno já inscrito nesta vaga para este período' });
    }

    await conn.query(
      'UPDATE inscricoes SET registro = ?, aluno_id = ?, muralestagio_id = ?, data = ?, periodo = ? WHERE id = ?',
      [req.body.registro || 0, req.body.aluno_id, req.body.muralestagio_id, req.body.data, req.body.periodo, req.params.id]
    );
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// DELETE INSCRICAO
app.delete('/inscricoes/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('DELETE FROM inscricoes WHERE id = ?', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// --- VISITAS ENDPOINTS ---

// READ ALL VISITAS
app.get('/visitas', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    let query = `SELECT v.*, e.instituicao 
                 FROM visita v 
                 LEFT JOIN estagio e ON v.instituicao_id = e.id`;
    let params = [];

    if (req.query.instituicao_id) {
      query += ' WHERE v.instituicao_id = ?';
      params.push(req.query.instituicao_id);
    }

    query += ' ORDER BY v.data DESC';

    const rows = await conn.query(query, params);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// READ ONE VISITA
app.get('/visitas/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT visita.*, estagio.instituicao FROM visita left join estagio on visita.instituicao_id = estagio.id WHERE visita.id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Visita not found' });
    }
    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// CREATE VISITA
app.post('/visitas', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(
      'INSERT INTO visita (instituicao_id, data, responsavel, motivo, avaliacao, descricao) VALUES (?, ?, ?, ?, ?, ?)',
      [req.body.instituicao_id, req.body.data, req.body.responsavel, req.body.motivo, req.body.avaliacao, req.body.descricao]
    );
    res.status(201).json({ id: Number(result.insertId) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// UPDATE VISITA
app.put('/visitas/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(
      'UPDATE visita SET instituicao_id = ?, data = ?, responsavel = ?, motivo = ?, avaliacao = ?, descricao = ? WHERE id = ?',
      [req.body.instituicao_id, req.body.data, req.body.responsavel, req.body.motivo, req.body.avaliacao, req.body.descricao, req.params.id]
    );
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// DELETE VISITA
app.delete('/visitas/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('DELETE FROM visita WHERE id = ?', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});


// --- ESTAGIARIOS ENDPOINTS ---

// GET DISTINCT PERIODOS
app.get('/estagiarios/periodos', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    // Distinct periods from mural_estagio
    const rows = await conn.query('SELECT DISTINCT periodo FROM estagiarios ORDER BY periodo DESC');
    // Row structure: [ { periodo: '2024-1' }, ... ]
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// READ ALL ESTAGIARIOS with JOIN
app.get('/estagiarios', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    let query = 'SELECT e.id as id, e.periodo as periodo, e.nivel as nivel, ';
    query += ' a.nome as aluno_nome, a.registro as aluno_registro, ';
    query += ' d.nome as professor_nome, ';
    query += ' s.nome as supervisor_nome, ';
    query += ' i.instituicao as instituicao_nome, ';
    query += ' t.area as turma_nome ';
    query += ' FROM estagiarios e ';
    query += ' LEFT JOIN alunos a ON e.aluno_id = a.id ';
    query += ' LEFT JOIN docentes d ON e.professor_id = d.id ';
    query += ' LEFT JOIN supervisores s ON e.supervisor_id = s.id ';
    query += ' LEFT JOIN estagio i ON e.instituicao_id = i.id ';
    query += ' LEFT JOIN turma_estagios t ON e.turmaestagio_id = t.id ';

    let params = [];

    // console.log(req.query.periodo);

    if (req.query.periodo) {
      query += ' WHERE e.periodo = ? ';
      params.push(req.query.periodo);
    }

    query += ' ORDER BY e.periodo DESC, a.nome ASC';
    // console.log(query);

    const rows = await conn.query(query, params);
    // console.log(rows);

    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// READ ONE ESTAGIARIO with JOIN
app.get('/estagiarios/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const query = `SELECT e.*, 
      e.ajuste2020 as estagiario_ajuste2020,
      a.nome as aluno_nome, a.registro as aluno_registro, 
      d.nome as professor_nome,
      s.nome as supervisor_nome,
      i.instituicao as instituicao_nome,
      t.area as turma_nome
      FROM estagiarios e
      LEFT JOIN alunos a ON e.aluno_id = a.id
      LEFT JOIN docentes d ON e.professor_id = d.id
      LEFT JOIN supervisores s ON e.supervisor_id = s.id
      LEFT JOIN estagio i ON e.instituicao_id = i.id
      LEFT JOIN turma_estagios t ON e.turmaestagio_id = t.id
      WHERE e.id = ?`;
    const rows = await conn.query(query, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Estagiario not found' });
    }
    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// GET ESTAGIARIOS BY ALUNO_ID
app.get('/alunos/:id/estagiarios', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const query = `SELECT e.*, 
      i.instituicao as instituicao_nome,
      d.nome as professor_nome,
      s.nome as supervisor_nome
      FROM estagiarios e
      LEFT JOIN estagio i ON e.instituicao_id = i.id
      LEFT JOIN docentes d ON e.professor_id = d.id
      LEFT JOIN supervisores s ON e.supervisor_id = s.id
      WHERE e.aluno_id = ?
      ORDER BY e.periodo DESC, e.nivel ASC`;
    const rows = await conn.query(query, [req.params.id]);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// GET ESTAGIARIOS BY SUPERVISOR_ID
app.get('/supervisores/:id/estagiarios', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const query = `SELECT e.id as estagiario_id, 
      a.id as aluno_id,
      a.registro as aluno_registro,
      a.nome as aluno_nome,
      e.nivel as estagiario_nivel,
      e.periodo as estagiario_periodo
      FROM estagiarios e
      LEFT JOIN alunos a ON e.aluno_id = a.id
      WHERE e.supervisor_id = ?
      ORDER BY e.periodo DESC, a.nome ASC`;
    const rows = await conn.query(query, [req.params.id]);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// GET ESTAGIARIOS BY PROFESSOR_ID (DOCENTE_ID)
app.get('/docentes/:id/estagiarios', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const query = `SELECT e.id as estagiario_id, 
      a.id as aluno_id,
      a.registro as aluno_registro,
      a.nome as aluno_nome,
      e.supervisor_id as estagiario_supervisor_id,
      s.nome as estagiario_supervisor_nome,
      e.professor_id as estagiario_professor_id,
      e.nivel as estagiario_nivel,
      e.periodo as estagiario_periodo
      FROM estagiarios e
      LEFT JOIN alunos a ON e.aluno_id = a.id
      LEFT JOIN supervisores s ON e.supervisor_id = s.id
      WHERE e.professor_id = ?
      ORDER BY e.periodo DESC, a.nome ASC`;
    const rows = await conn.query(query, [req.params.id]);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// GET NEXT NIVEL FOR A STUDENT
app.get('/estagiarios/:id/next-nivel', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    // Get student's ajuste2020 value order by nivel desc
    const estagiarioRows = await conn.query('SELECT ajuste2020, nivel, instituicao_id, professor_id, supervisor_id, turmaestagio_id, periodo FROM estagiarios WHERE aluno_id = ? ORDER BY nivel DESC LIMIT 1', [req.params.id]);
    if (estagiarioRows.length === 0) {
      return res.json({ next_nivel: 1, ajuste2020: 1, professor_id: null, supervisor_id: null, instituicao_id: null, turmaestagio_id: null, periodo: null });
    } else {
      const ajuste2020 = estagiarioRows[0].ajuste2020;
      const nivel = estagiarioRows[0].nivel;
      const instituicao_id = estagiarioRows[0].instituicao_id;
      const professor_id = estagiarioRows[0].professor_id;
      const supervisor_id = estagiarioRows[0].supervisor_id;
      const turmaestagio_id = estagiarioRows[0].turmaestagio_id;
      const periodo = estagiarioRows[0].periodo;

      // Get maximum nivel for this student
      const nivelRows = await conn.query(
        'SELECT MAX(nivel) as max_nivel FROM estagiarios WHERE aluno_id = ? AND nivel < 9',
        [req.params.id]
      );
      const maxNivel = nivelRows[0].max_nivel;

      let nextNivel = 1;
      if (nivel !== null) {
        // It is a number
        const maxNivel = Number(nivel);
        const maxAllowed = (ajuste2020 == 0) ? 4 : 3;

        if (maxNivel < maxAllowed) {
          nextNivel = Number(maxNivel) + 1;
        } else {
          nextNivel = 9; // Maximum nivel
        }
      }
      return res.json({ next_nivel: nextNivel, ajuste2020: ajuste2020, instituicao_id: instituicao_id, professor_id: professor_id, supervisor_id: supervisor_id, turmaestagio_id: turmaestagio_id, periodo: periodo });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// CREATE ESTAGIARIO
app.post('/estagiarios', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(
      `INSERT INTO estagiarios (aluno_id, professor_id, supervisor_id, instituicao_id, 
       turmaestagio_id, periodo, nivel, observacoes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.body.aluno_id, req.body.professor_id, req.body.supervisor_id,
        req.body.instituicao_id, req.body.turmaestagio_id, req.body.periodo,
        req.body.nivel, req.body.observacoes
      ]
    );
    res.status(201).json({ id: Number(result.insertId) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// UPDATE ESTAGIARIO
app.put('/estagiarios/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(
      `UPDATE estagiarios SET aluno_id = ?, professor_id = ?, supervisor_id = ?, 
       instituicao_id = ?, turmaestagio_id = ?, periodo = ?, nivel = ?, 
       observacoes = ? WHERE id = ?`,
      [
        req.body.aluno_id, req.body.professor_id, req.body.supervisor_id,
        req.body.instituicao_id, req.body.turmaestagio_id, req.body.periodo,
        req.body.nivel, req.body.observacoes,
        req.params.id
      ]
    );
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// DELETE ESTAGIARIO
app.delete('/estagiarios/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('DELETE FROM estagiarios WHERE id = ?', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});


// --- TURMA_ESTAGIO ENDPOINTS ---

// READ ALL TURMA_ESTAGIO
app.get('/turma_estagios', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM turma_estagios ORDER BY area ASC');
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// READ ONE TURMA_ESTAGIO
app.get('/turma_estagios/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM turma_estagios WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Turma de estágio not found' });
    }
    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// CREATE TURMA_ESTAGIO
app.post('/turma_estagios', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(
      'INSERT INTO turma_estagios (area) VALUES (?)',
      [req.body.area]
    );
    res.status(201).json({ id: Number(result.insertId) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// UPDATE TURMA_ESTAGIO
app.put('/turma_estagios/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(
      'UPDATE turma_estagios SET area = ? WHERE id = ?',
      [req.body.area, req.params.id]
    );
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// DELETE TURMA_ESTAGIO
app.delete('/turma_estagios/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('DELETE FROM turma_estagios WHERE id = ?', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// --- CONFIGURACOES ENDPOINTS ---

// READ CONFIGURATION (Singleton)
app.get('/configuracoes', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM configuracoes LIMIT 1');
    if (rows.length === 0) {
      // If table is empty, we might return 404 or a default object
      // For now, let's assume it should behave like a 404 if not found since user said "store only one record"
      return res.status(404).json({ error: 'Configuracoes not found' });
    }
    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// UPDATE CONFIGURATION (Singleton)
// We generally update the single row that exists. 
// We can use a specific ID if we know it (e.g. 1) or update "WHERE id = (SELECT id FROM configuracoes LIMIT 1)" logic 
// but safer is to update by ID passed in body or just update the first row if we are strict.
// Given strict strict constraints, let's accept PUT /configuracoes (no ID needed in URL technically if singleton, but RESTful usually expects resource).
// However, the user said "edit". Let's do PUT /configuracoes (updates the single record).
app.put('/configuracoes', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();

    // We update the single record. We assume ID 1 or just update the first found.
    // Let's rely on the body having the fields.
    // NOTE: The ID might be in the body, but we shouldn't update the ID.

    const {
      mural_periodo_atual,
      curso_turma_atual,
      curso_abertura_inscricoes,
      curso_encerramento_inscricoes,
      termo_compromisso_periodo,
      termo_compromisso_inicio,
      termo_compromisso_final,
      periodo_calendario_academico
    } = req.body;

    // We'll update the row with ID 1 (default) or we can fetch the ID first. 
    // Let's assume there is only one row and we update it.
    // A safe way is to update where id is not null order by id limit 1, or just hardcode ID 1 if we know it is 1.
    // Let's use logic: update the row that exists.

    // First get the ID
    const rows = await conn.query('SELECT id FROM configuracoes LIMIT 1');
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No configuration record to update' });
    }
    const id = rows[0].id;

    await conn.query(
      `UPDATE configuracoes SET 
        mural_periodo_atual = ?, 
        curso_turma_atual = ?, 
        curso_abertura_inscricoes = ?, 
        curso_encerramento_inscricoes = ?, 
        termo_compromisso_periodo = ?, 
        termo_compromisso_inicio = ?, 
        termo_compromisso_final = ?, 
        periodo_calendario_academico = ? 
      WHERE id = ?`,
      [
        mural_periodo_atual,
        curso_turma_atual,
        curso_abertura_inscricoes,
        curso_encerramento_inscricoes,
        termo_compromisso_periodo,
        termo_compromisso_inicio,
        termo_compromisso_final,
        periodo_calendario_academico,
        id
      ]
    );
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// --- FOLHA DE ATIVIDADES ENDPOINTS ---

// READ ALL ATIVIDADES WITH JOIN ESTAGIARIOS AND ALUNOS
app.get('/atividades', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    let query = `SELECT f.*, a.nome as aluno_nome, a.registro as aluno_registro 
                 FROM folhadeatividades f 
                 LEFT JOIN estagiarios e ON f.estagiario_id = e.id 
                 LEFT JOIN alunos a ON e.aluno_id = a.id`;

    // Optional: filter by estagiario_id if needed in future
    if (req.query.estagiario_id) {
      query += ' WHERE f.estagiario_id = ?';
    }

    query += ' ORDER BY f.dia DESC, f.inicio ASC';

    const params = req.query.estagiario_id ? [req.query.estagiario_id] : [];
    // console.log(params);
    const rows = await conn.query(query, params);
    // console.log(rows);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// READ ONE ATIVIDADE WITH JOIN ESTAGIARIOS AND ALUNOS
app.get('/atividades/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const query = `SELECT f.*, a.nome as aluno_nome, a.id as alunoId, a.registro as aluno_registro 
                 FROM folhadeatividades f 
                 LEFT JOIN estagiarios e ON f.estagiario_id = e.id 
                 LEFT JOIN alunos a ON e.aluno_id = a.id
                 WHERE f.id = ?`;
    const rows = await conn.query(query, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Atividade not found' });
    }
    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// CREATE ATIVIDADE
// Supports both POST /atividades and POST /atividades/:estagiario_id
app.post(['/atividades', '/atividades/:estagiario_id'], async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();

    // estagiario_id can be in body or params. Body takes precedence if present (though usually should match)
    // Or we prioritize params if we are calling that specific endpoint. 
    // The user JS uses URL param.
    const estagiario_id = req.params.estagiario_id || req.body.estagiario_id;

    const result = await conn.query(
      'INSERT INTO folhadeatividades (estagiario_id, dia, inicio, final, atividade) VALUES (?, ?, ?, ?, ?)',
      [estagiario_id, req.body.dia, req.body.inicio, req.body.final, req.body.atividade]
    );
    res.status(201).json({ id: Number(result.insertId) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// UPDATE ATIVIDADE
app.put('/atividades/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(
      'UPDATE folhadeatividades SET estagiario_id = ?, dia = ?, inicio = ?, final = ?, atividade = ? WHERE id = ?',
      [req.body.estagiario_id, req.body.dia, req.body.inicio, req.body.final, req.body.atividade, req.params.id]
    );
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});

// DELETE ATIVIDADE
app.delete('/atividades/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('DELETE FROM folhadeatividades WHERE id = ?', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.end();
  }
});
app.listen(3333, () => console.log('Server running on port 3333'));
