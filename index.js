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

// 🗂️ تحميل بيانات العملاء (Mock)
const clientsPath = path.join(__dirname, "data", "clients.json");
const clients = JSON.parse(fs.readFileSync(clientsPath, "utf-8"));

// (اختياري) التحقق من التوقيع — معطّل افتراضيًا
function verifyRetellSignature(req) {
  // مثال إن حبيت تفعل توقيع HMAC:
  // const sig = req.headers["x-retell-signature"];
  // const hmac = crypto.createHmac("sha256", process.env.RETELL_WEBHOOK_SECRET || "dev-secret");
  // hmac.update(JSON.stringify(req.body || {}));
  // const digest = "sha256=" + hmac.digest("hex");
  // return sig === digest;
  return true;
}

app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "NFSC Mock API",
    endpoints: ["/retell/functions/get_portfolio_status"],
  });
});

/**
 * ✅ GET: /retell/functions/get_portfolio_status?name=...&national_id=...
 * مفيد للاختبار السريع — خليك واخد بالك إن GET بيحط PII في URL/Logs
 */
app.get("/retell/functions/get_portfolio_status", (req, res) => {
  if (!verifyRetellSignature(req)) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const fullName = (req.query.name || "").toString().trim();
  const nationalId = (req.query.national_id || "").toString().trim();

  if (!fullName || !nationalId) {
    return res.status(400).json({
      error: "name and national_id are required as query params",
    });
  }

  const hit = clients.find(
    (c) => c.name.trim() === fullName && c.national_id === nationalId
  );

  res.set("Cache-Control", "no-store");

  if (!hit) {
    return res.json({
      result: { found: false, message: "لا توجد محفظة مطابقة للاسم/الهوية." },
    });
  }

  return res.json({
    result: {
      found: true,
      name: hit.name,
      national_id: hit.national_id,
      portfolio_status: hit.status,
    },
  });
});

// 🔌 تشغيل محليًا فقط (Vercel هتستخدم الـexport default app)
const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`NFSC Mock API listening on port ${PORT}`));
}

// لتشغيله كـ Serverless على Vercel
export default app;
