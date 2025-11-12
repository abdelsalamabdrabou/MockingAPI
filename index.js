// index.js (Node 18+, ESM)
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());

const clientsPath = path.join(__dirname, "data", "clients.json");
const clients = JSON.parse(fs.readFileSync(clientsPath, "utf-8"));

// توقيع اختياري (مُعطّل)
function verifyRetellSignature(_req) { return true; }

app.get("/", (_req, res) => {
  res.json({ ok: true, service: "NFSC Mock API", endpoints: ["/retell/functions/get_portfolio_status"] });
});

// GET (query) + POST (args-only OR {parameters:{...}})
function resolveNameAndId(req) {
  if (req.method === "GET") {
    return {
      name: (req.query.name || "").toString().trim(),
      national_id: (req.query.national_id || "").toString().trim()
    };
  }
  const body = req.body || {};
  const p = (body.parameters ?? body) || {};
  return {
    name: (p.name || "").toString().trim(),
    national_id: (p.national_id || "").toString().trim()
  };
}

function handleLookup(req, res) {
  if (!verifyRetellSignature(req)) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const { name, national_id } = resolveNameAndId(req);
  console.log("[lookup]", req.method, "query=", req.query, "body=", req.body);

  if (!name || !national_id) {
    const where = req.method === "GET" ? "as query params" : "in parameters (or args)";
    return res.status(400).json({ error: `name and national_id are required ${where}` });
  }

  const hit = clients.find(c => c.name.trim() === name && c.national_id === national_id);

  res.set("Cache-Control", "no-store");

  if (!hit) {
    return res.json({ result: { found: false, message: "لا توجد محفظة مطابقة للاسم/الهوية." } });
  }

  return res.json({
    result: {
      found: true,
      name: hit.name,
      national_id: hit.national_id,
      portfolio_status: hit.status
    }
  });
}

app.get("/retell/functions/get_portfolio_status", handleLookup);
app.post("/retell/functions/get_portfolio_status", handleLookup);

const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`NFSC Mock API listening on port ${PORT}`));
}

export default app;
