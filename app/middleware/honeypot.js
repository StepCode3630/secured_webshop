export default function MiddlePot(req, res, next) {
  console.log("HONEYPOT TRIGGERED");

  console.log({
    ip: req.ip,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get("User-Agent"),
    date: new Date().toISOString(),
  });

  // Petit delai artificiel
  setTimeout(() => {
    res.status(403).send(`
      <h1>Admin Panel</h1>
      <p>T'es cooked</p>
    `);
  }, 2000);
}
