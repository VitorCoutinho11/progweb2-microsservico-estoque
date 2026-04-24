const restify = require("restify"); 
const EstoquesController = require("./controllers/estoques.controller");

const server = restify.createServer({ 
  name: "api-usuarios-restify" 
}); 

server.use(restify.plugins.queryParser()); 
server.use(restify.plugins.bodyParser()); 

/* ROTAS DE ESTOQUES */
server.get("/estoques", EstoquesController.listar);
server.get("/estoques/:id", EstoquesController.buscarPorId);
server.get("/estoques/produto/:produtoId", EstoquesController.buscarPorProdutoId);

server.post("/estoques", EstoquesController.criar);
server.patch("/estoques/:id", EstoquesController.atualizar);
server.del("/estoques/:id", EstoquesController.deletar);

const PORT = 3003; 
server.listen(PORT, () => { 
    console.log(`${server.name} rodando em ${server.url}`); 
}); 