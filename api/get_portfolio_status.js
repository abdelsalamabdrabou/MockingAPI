// Vercel Serverless Function alternative
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const payload = req.body || {};
  const params = payload.parameters || {};
  const name = (params.name || "").toString().trim();
  const national_id = (params.national_id || "").toString().trim();
  const clients = [
    { name: "عبدالله محمد الحربي", national_id: "1030764169", status: "متأخر" },
    { name: "فاطمة سالم العتيبي", national_id: "1000585735", status: "فترة سماح" },
    { name: "سلمان سعود الزهراني", national_id: "1006521874", status: "مغلقة" },
    { name: "نورة خالد الشمري",   national_id: "1009081082", status: "سارية" },
    { name: "يوسف حسن الشثري",    national_id: "1009297571", status: "متعثر" }
  ];
  if (!name || !national_id) return res.status(400).json({ error: "name and national_id required" });
  const hit = clients.find(c => c.name.trim() === name && c.national_id === national_id);
  if (!hit) return res.json({ result: { found: false, message: "لا توجد محفظة مطابقة للاسم/الهوية." } });
  return res.json({ result: { found: true, name: hit.name, national_id: hit.national_id, portfolio_status: hit.status } });
}
