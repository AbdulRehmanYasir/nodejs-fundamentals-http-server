module.exports = async (req, res) => {
  console.log("METHOD:", req.method);
  console.log("BODY:", req.body);
  console.log("HEADERS:", req.headers);

  res.statusCode = 200;
  res.end(JSON.stringify({
    method: req.method,
    body: req.body || null,
    headers: req.headers
  }));
};module.exports = async (req, res) => {
  console.log("METHOD:", req.method);
  console.log("BODY:", req.body);
  console.log("HEADERS:", req.headers);

  res.statusCode = 200;
  res.end(JSON.stringify({
    method: req.method,
    body: req.body || null,
    headers: req.headers
  }));
};