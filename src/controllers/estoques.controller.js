const prisma = require("../config/prisma");

class EstoquesController {

  // GET /estoques
  static async listar(req, res) {
    try {
      const estoques = await prisma.estoque.findMany({
        orderBy: { id: "asc" }
      });

      res.send(200, estoques);
    } catch (error) {
      res.send(500, { message: "Erro ao listar estoques." });
    }
  }


  // GET /estoques/:id
  static async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      const estoque = await prisma.estoque.findUnique({
        where: { id: Number(id) }
      });

      if (!estoque) {
        return res.send(404, { message: "Estoque não encontrado." });
      }

      res.send(200, estoque);

    } catch (error) {
      res.send(500, { message: "Erro ao buscar estoque." });
    }
  }


  // GET /estoques/produto/:produtoId
  static async buscarPorProdutoId(req, res) {
    try {
      const { produtoId } = req.params;

      const produto = await prisma.produto.findUnique({
        where: { id: Number(produtoId) }
      });

      if (!produto) {
        return res.send(404, { message: "Produto não encontrado." });
      }

      const estoques = await prisma.estoque.findMany({
        where: { produtoId: Number(produtoId) }
      });

      res.send(200, estoques);

    } catch (error) {
      res.send(500, { message: "Erro ao buscar estoque do produto." });
    }
  }


  // POST /estoques
  static async criar(req, res) {
    try {
      const {
        produtoId,
        quantidade,
        quantidadeMinima,
        localizacao,
        observacao
      } = req.body;

      if (!produtoId || quantidade == null) {
        return res.send(400, {
          message: "produtoId e quantidade são obrigatórios."
        });
      }

      const produto = await prisma.produto.findUnique({
        where: { id: Number(produtoId) }
      });

      if (!produto) {
        return res.send(404, { message: "Produto não encontrado." });
      }

      const novoEstoque = await prisma.estoque.create({
        data: {
          produtoId: Number(produtoId),
          quantidade,
          quantidadeMinima,
          localizacao,
          observacao
        }
      });

      res.send(201, novoEstoque);

    } catch (error) {
      res.send(500, { message: "Erro ao cadastrar estoque." });
    }
  }


  // PATCH /estoques/:id
  static async atualizar(req, res) {
    try {
      const { id } = req.params;

      const estoque = await prisma.estoque.update({
        where: { id: Number(id) },
        data: req.body
      });

      res.send(200, estoque);

    } catch (error) {
      res.send(500, { message: "Erro ao atualizar estoque." });
    }
  }


  // DELETE /estoques/:id
  static async deletar(req, res) {
    try {
      const { id } = req.params;

      await prisma.estoque.delete({
        where: { id: Number(id) }
      });

      res.send(204);

    } catch (error) {
      res.send(500, { message: "Erro ao deletar estoque." });
    }
  }

}

module.exports = EstoquesController;