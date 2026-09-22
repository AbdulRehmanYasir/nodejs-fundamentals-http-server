const {
  handleGetAll,
  handleCreate,
  handleGetOne,
  handleDelete
} = require("../routes/notes");


module.exports = async (req, res) => {

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;


  if (pathname === "/api/notes" && req.method === "GET") {
    return handleGetAll(req, res);
  }


  if (pathname === "/api/notes" && req.method === "POST") {
    return handleCreate(req, res);
  }


  const match = pathname.match(/^\/api\/notes\/([^/]+)$/);


  if (match && req.method === "GET") {
    return handleGetOne(req, res, match[1]);
  }


  if (match && req.method === "DELETE") {
    return handleDelete(req, res, match[1]);
  }


  res.statusCode = 404;
  res.end(JSON.stringify({
    error: "Not found"
  }));
};