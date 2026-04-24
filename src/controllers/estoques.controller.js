const prisma = require("../config/prisma");

class EstoquesController {

  // GET /estoques
  static async listar(req, res) {
    try {
      const estoques = await prisma.estoque.findMany({
        orderBy: { id: "asc" },
        include: {
          produto: true,
          section: {
            include: {
              floor: {
                include: {
                  warehouse: true
                }
              }
            }
          }
        }
      });

      return res.send(200, estoques);
    } catch (error) {
      console.error(error);
      return res.send(500, { message: "Erro ao listar estoques." });
    }
  }

  // GET /estoques/:id
  static async buscarPorId(req, res) {
    try {
      const id = Number(req.params.id);

      const estoque = await prisma.estoque.findUnique({
        where: { id },
        include: {
          produto: true,
          section: {
            include: {
              floor: {
                include: {
                  warehouse: true
                }
              }
            }
          }
        }
      });

      if (!estoque) {
        return res.send(404, { message: "Estoque não encontrado." });
      }

      return res.send(200, estoque);

    } catch (error) {
      console.error(error);
      return res.send(500, { message: "Erro ao buscar estoque." });
    }
  }

  // GET /estoques/produto/:produtoId
  static async buscarPorProdutoId(req, res) {
    try {
      const produtoId = Number(req.params.produtoId);

      const produto = await prisma.produto.findUnique({
        where: { id: produtoId }
      });

      if (!produto) {
        return res.send(404, { message: "Produto não encontrado." });
      }

      const estoques = await prisma.estoque.findMany({
        where: { produtoId },
        include: {
          section: {
            include: {
              floor: {
                include: {
                  warehouse: true
                }
              }
            }
          }
        }
      });

      return res.send(200, estoques);

    } catch (error) {
      console.error(error);
      return res.send(500, { message: "Erro ao buscar estoque do produto." });
    }
  }

  // POST /estoques
  static async criar(req, res) {
    try {
      const {
        produtoId,
        sectionId,
        quantidade,
        quantidadeMinima,
        observacao
      } = req.body;

      if (!produtoId || !sectionId || quantidade == null) {
        return res.send(400, {
          message: "produtoId, sectionId e quantidade são obrigatórios."
        });
      }

      // valida produto
      const produto = await prisma.produto.findUnique({
        where: { id: Number(produtoId) }
      });

      if (!produto) {
        return res.send(404, { message: "Produto não encontrado." });
      }

      // valida section
      const section = await prisma.section.findUnique({
        where: { id: Number(sectionId) }
      });

      if (!section) {
        return res.send(404, { message: "Section não encontrada." });
      }

      const novoEstoque = await prisma.estoque.create({
        data: {
          produtoId: Number(produtoId),
          sectionId: Number(sectionId),
          quantidade,
          quantidadeMinima,
          observacao
        }
      });

      return res.send(201, novoEstoque);

    } catch (error) {
      console.error(error);

      // erro de duplicidade (unique produto + section)
      if (error.code === "P2002") {
        return res.send(400, {
          message: "Já existe esse produto nessa seção."
        });
      }

      return res.send(500, { message: "Erro ao cadastrar estoque." });
    }
  }

  // PATCH /estoques/:id
  static async atualizar(req, res) {
    try {
      const id = Number(req.params.id);

      const existe = await prisma.estoque.findUnique({
        where: { id }
      });

      if (!existe) {
        return res.send(404, { message: "Estoque não encontrado." });
      }

      // valida section se vier no body
      if (req.body.sectionId) {
        const section = await prisma.section.findUnique({
          where: { id: Number(req.body.sectionId) }
        });

        if (!section) {
          return res.send(404, { message: "Section não encontrada." });
        }
      }

      const estoque = await prisma.estoque.update({
        where: { id },
        data: req.body
      });

      return res.send(200, estoque);

    } catch (error) {
      console.error(error);
      return res.send(500, { message: "Erro ao atualizar estoque." });
    }
  }

  // DELETE /estoques/:id
  static async deletar(req, res) {
    try {
      const id = Number(req.params.id);

      const existe = await prisma.estoque.findUnique({
        where: { id }
      });

      if (!existe) {
        return res.send(404, { message: "Estoque não encontrado." });
      }

      await prisma.estoque.delete({
        where: { id }
      });

      return res.send(204);

    } catch (error) {
      console.error(error);
      return res.send(500, { message: "Erro ao deletar estoque." });
    }
  }

}

module.exports = EstoquesController;