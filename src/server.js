// src/server.js
import express from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import mariadb, { SqlError } from "mariadb";

import alunoRoutes from "./routers/alunoRoutes.js";
import docenteRoutes from "./routers/docenteRoutes.js";
import estagioRoutes from "./routers/estagioRoutes.js";
import estagiarioRoutes from "./routers/estagiarioRoutes.js";
import muralRoutes from "./routers/muralRoutes.js";
import inscricaoRoutes from "./routers/inscricaoRoutes.js";
import supervisorRoutes from "./routers/supervisorRoutes.js";
import questionarioRoutes from "./routers/questionarioRoutes.js";
import questaoRoutes from "./routers/questaoRoutes.js";
import atividadesRoutes from "./routers/atividadesRoutes.js";
import visitaRoutes from "./routers/visitaRoutes.js";
import turmaRoutes from "./routers/turmaRoutes.js";
import configuracaoRoutes from "./routers/configuracaoRoutes.js";
import respostaRoutes from "./routers/respostaRoutes.js";
import * as estagiarioController from "./controllers/estagiarioController.js";
import * as inscricaoController from "./controllers/inscricaoController.js";
import * as alunoController from "./controllers/alunoController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware - MUST be before routes!
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// --- ROUTES ---
app.use("/alunos", alunoRoutes);
app.use("/docentes", docenteRoutes);
app.use("/estagio", estagioRoutes);
app.use("/estagiarios", estagiarioRoutes);
app.use("/mural", muralRoutes);
app.use("/inscricoes", inscricaoRoutes);
app.use("/supervisores", supervisorRoutes);
app.use("/questionarios", questionarioRoutes);
app.use("/questoes", questaoRoutes);
app.use("/atividades", atividadesRoutes);
app.use("/visitas", visitaRoutes);
app.use("/turmas", turmaRoutes);
app.use("/configuracoes", configuracaoRoutes);
app.use("/respostas", respostaRoutes);

// --- NESTED ROUTES ---
// Nested estagiarios routes
app.get("/alunos/:id/estagiarios", estagiarioController.getEstagiariosByAlunoId);
app.get("/supervisores/:id/estagiarios", estagiarioController.getEstagiariosBySupervisorId);
app.get("/docentes/:id/estagiarios", estagiarioController.getEstagiariosByProfessorId);
// Nested inscricoes route
app.get("/mural/:id/inscricoes", inscricaoController.getInscricoesByMuralId);
app.get("/alunos/:id/inscricoes", alunoController.getInscricoesByAlunoId);

// --- DATABASE ---
const pool = mariadb.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "tccess",
});

// --- INDEX ENDPOINTS ---
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

// --- ESTAGIO ENDPOINTS ---

// --- SUPERVISORES ENDPOINTS ---

// --- MURAL ENDPOINTS ---

// --- INSCRICOES ENDPOINTS ---

// --- ESTAGIARIOS ENDPOINTS ---

// --- TURMA_ESTAGIO ENDPOINTS ---

// --- CONFIGURACOES ENDPOINTS ---

app.listen(3333, () => console.log("Server running on port 3333"));
