import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mariadb from 'mariadb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const pool = mariadb.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'tccess'
});

// app.get('*', (req, res) => {
// res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// --- ALUNOS ENDPOINTS ---
// READ ONE
app.get('/alunos/:id', async (req, res) => {
  const alunoId = req.params.id;
  if (alunoId) {
    console.log('Aluno ID is ' + alunoId);
  } else {
    console.log('Falta o aluno ID');
    return res.status(400).json({ error: 'Falta o aluno ID' });
  }
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT id, nome, email FROM alunos WHERE id = ?', [alunoId]);
    if (rows.length === 0) {
      console.log('Aluno não encontrado');
      return res.status(404).json({ error: 'Aluno not found' });
    } else if (rows.length > 1) {
      console.log('Aluno encontrado');
      return res.status(500).json({ error: 'Aluno encontrado' });
    }
    console.log('Aluno encontrado');
    res.setHeader('Content-Type', 'application/json');
    return res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching aluno:', err);
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
    let query = 'SELECT id, nome, email, registro FROM alunos ORDER BY nome ASC';
    let params = [];

    if (req.query.search) {
      query += ' WHERE nome LIKE ? OR email LIKE ?';
      const searchTerm = `%${req.query.search}%`;
      params = [searchTerm, searchTerm];
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
      'INSERT INTO alunos (nome, email) VALUES (?, ?)',
      [req.body.nome, req.body.email]
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
      'UPDATE alunos SET nome = ?, email = ? WHERE id = ?',
      [req.body.nome, req.body.email, req.params.id]
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

// --- DOCENTES ENDPOINTS ---

// READ ALL DOCENTES
app.get('/docentes', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    let query = 'SELECT id, nome, email, celular FROM docentes';
    let params = [];

    if (req.query.search) {
      query += ' WHERE nome LIKE ? OR email LIKE ?';
      const searchTerm = `%${req.query.search}%`;
      params = [searchTerm, searchTerm];
    }

    query += ' ORDER BY nome ASC';

    console.log(query);
    console.log(params);
    console.log('Query executed successfully');

    const rows = await conn.query(query, params);
    console.log('Rows returned: ' + rows.length);
    console.log(rows);
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
    const rows = await conn.query('SELECT id, nome, email, celular FROM docentes WHERE id = ?', [req.params.id]);
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
      'INSERT INTO docentes (nome, email, celular) VALUES (?, ?, ?)',
      [req.body.nome, req.body.email, req.body.celular]
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
      'UPDATE docentes SET nome = ?, email = ?, celular = ? WHERE id = ?',
      [req.body.nome, req.body.email, req.body.celular, req.params.id]
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
    const rows = await conn.query('SELECT * FROM estagio');
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
    const rows = await conn.query('SELECT * FROM mural_estagio ORDER BY periodo DESC, instituicao ASC');
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
    const rows = await conn.query(
      `SELECT i.*, a.nome as aluno_nome, m.instituicao 
       FROM inscricoes i 
       LEFT JOIN alunos a ON i.aluno_id = a.id 
       LEFT JOIN mural_estagio m ON i.muralestagio_id = m.id 
       ORDER BY i.periodo DESC, a.nome ASC`
    );
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

app.listen(3333, () => console.log('Server running on port 3333'));
