const restify = require("restify"); 
const EstoquesController = require("./controllers/estoques.controller");

const server = restify.createServer({ 
  name: "api-estoques-restify" 
}); 

server.use(restify.plugins.queryParser()); 
server.use(restify.plugins.bodyParser()); 

/* ROTAS DE ESTOQUES */
server.get("/estoques", EstoquesController.listar);

// rota específica primeiro
server.get("/estoques/produto/:produtoId", EstoquesController.buscarPorProdutoId);
server.get("/estoques/:id", EstoquesController.buscarPorId);

server.post("/estoques", EstoquesController.criar);
server.patch("/estoques/:id", EstoquesController.atualizar);
server.del("/estoques/:id", EstoquesController.deletar);

// tratamento global de erro
server.on("restifyError", (req, res, err, callback) => {
  console.error(err);
  return callback();
});

const PORT = 3003; 
server.listen(PORT, () => { 
  console.log(`${server.name} rodando em ${server.url}`); 
});