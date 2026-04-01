// src/server.js
import express from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import mariadb, { SqlError } from "mariadb";
import 'dotenv/config.js';

import authRoutes from "./routers/authRoutes.js";
import alunoRoutes from "./routers/alunoRoutes.js";
import professorRoutes from "./routers/professorRoutes.js";
import instituicaoRoutes from "./routers/instituicaoRoutes.js";
import estagiarioRoutes from "./routers/estagiarioRoutes.js";
import muralRoutes from "./routers/muralRoutes.js";
import inscricaoRoutes from "./routers/inscricaoRoutes.js";
import supervisorRoutes from "./routers/supervisorRoutes.js";
import questionarioRoutes from "./routers/questionarioRoutes.js";
import questaoRoutes from "./routers/questaoRoutes.js";
import atividadesRoutes from "./routers/atividadesRoutes.js";
import visitaRoutes from "./routers/visitaRoutes.js";
import turmaRoutes from "./routers/turmaRoutes.js";
import areaRoutes from "./routers/areaRoutes.js";
import configuracaoRoutes from "./routers/configuracaoRoutes.js";
import respostaRoutes from "./routers/respostaRoutes.js";
import turnoRoutes from "./routers/turnoRoutes.js";

import * as estagiarioController from "./controllers/estagiarioController.js";
import * as inscricaoController from "./controllers/inscricaoController.js";
import * as alunoController from "./controllers/alunoController.js";
import * as turnoController from "./controllers/turnoController.js";
import * as supervisorController from "./controllers/supervisorController.js";
import * as professorController from "./controllers/professorController.js";
import * as instituicaoController from "./controllers/instituicaoController.js";
import * as areaController from "./controllers/areaController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware - MUST be before routes!
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// --- ROUTES ---
app.use("/auth", authRoutes);
app.use("/alunos", alunoRoutes);
app.use("/professores", professorRoutes);
app.use("/instituicoes", instituicaoRoutes);
app.use("/estagiarios", estagiarioRoutes);
app.use("/mural", muralRoutes);
app.use("/inscricoes", inscricaoRoutes);
app.use("/supervisores", supervisorRoutes);
app.use("/questionarios", questionarioRoutes);
app.use("/questoes", questaoRoutes);
app.use("/atividades", atividadesRoutes);
app.use("/visitas", visitaRoutes);
app.use("/turmaestagios", turmaRoutes);
app.use("/configuracoes", configuracaoRoutes);
app.use("/respostas", respostaRoutes);
app.use("/areas", areaRoutes);
app.use("/turnos", turnoRoutes);

// --- INDEX ENDPOINTS ---
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
