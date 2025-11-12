import app from "../index.js";
export default function handler(req, res) {
  return app(req, res); // يمرّر كل الطلبات لـExpress
}
