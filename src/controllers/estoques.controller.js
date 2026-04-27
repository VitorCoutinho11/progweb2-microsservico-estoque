const prisma = require("../config/prisma");


class EstoquesController {

  // GET /estoques
  static async listar(req, res) {
    try {
      const estoques = await prisma.estoque.findMany({
        orderBy: { id: "asc" },
        include: {
          section: {
            include: { floor: { include: { warehouse: true } } }
          }
        }
      });

      const produtosExternos = await ProdutoService.buscarTodosProdutos();
      
      const response = estoques.map(item => {
        // Usando produtoId (CamelCase)
        const infoProduto = produtosExternos.find(p => p.id === item.produtoId);
        return {
          ...item,
          produto: infoProduto || { message: "Dados do produto indisponíveis" }
        };
      });

      return res.send(200, response);
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
          section: {
            include: { floor: { include: { warehouse: true } } }
          }
        }
      });

      if (!estoque) {
        return res.send(404, { message: "Estoque não encontrado." });
      }

      const dadosProduto = await ProdutoService.buscarDadosProduto(estoque.produtoId);
      
      return res.send(200, {
        ...estoque,
        produto: dadosProduto
      });

    } catch (error) {
      console.error(error);
      return res.send(500, { message: "Erro ao buscar estoque." });
    }
  }

  // GET /estoques/produto/:produtoId
  // ESTE MÉTODO RESOLVE O ERRO DE UNDEFINED NO SERVER.JS
  static async buscarPorProdutoId(req, res) {
    try {
      const produtoId = Number(req.params.produtoId);

      const estoques = await prisma.estoque.findMany({
        where: { produtoId },
        include: {
          section: {
            include: { floor: { include: { warehouse: true } } }
          }
        }
      });

      return res.send(200, estoques);
    } catch (error) {
      console.error(error);
      return res.send(500, { message: "Erro ao buscar estoque por produto." });
    }
  }

  // POST /estoques
  static async criar(req, res) {
    try {
      const { produtoId, sectionId, quantidade, quantidadeMinima, observacao } = req.body;

      if (!produtoId || !sectionId || quantidade == null) {
        return res.send(400, { message: "produtoId, sectionId e quantidade são obrigatórios." });
      }

      const produtoValido = await ProdutoService.buscarDadosProduto(Number(produtoId));

      if (!produtoValido) {
        return res.send(404, { message: "Produto inválido ou inexistente no catálogo." });
      }

      const section = await prisma.section.findUnique({
        where: { id: Number(sectionId) }
      });

      if (!section) {
        return res.send(404, { message: "Seção de estoque não encontrada." });
      }

      const novoEstoque = await prisma.estoque.create({
        data: {
          produtoId: Number(produtoId),
          sectionId: Number(sectionId),
          quantidade: Number(quantidade),
          quantidadeMinima: Number(quantidadeMinima || 0),
          observacao
        }
      });

      return res.send(201, novoEstoque);

    } catch (error) {
      if (error.code === "P2002") {
        return res.send(400, { message: "Já existe esse produto nessa seção." });
      }
      return res.send(500, { message: "Erro ao cadastrar estoque." });
    }
  }

  // PATCH /estoques/:id
  static async atualizar(req, res) {
    try {
      const id = Number(req.params.id);

      const existe = await prisma.estoque.findUnique({ where: { id } });
      if (!existe) return res.send(404, { message: "Estoque não encontrado." });

      if (req.body.sectionId) {
        const section = await prisma.section.findUnique({
          where: { id: Number(req.body.sectionId) }
        });
        if (!section) return res.send(404, { message: "Nova seção não encontrada." });
      }

      const estoque = await prisma.estoque.update({
        where: { id },
        data: req.body
      });

      return res.send(200, estoque);
    } catch (error) {
      return res.send(500, { message: "Erro ao atualizar estoque." });
    }
  }

  // DELETE /estoques/:id
  static async deletar(req, res) {
    try {
      const id = Number(req.params.id);
      const existe = await prisma.estoque.findUnique({ where: { id } });
      
      if (!existe) return res.send(404, { message: "Estoque não encontrado." });

      await prisma.estoque.delete({ where: { id } });
      return res.send(204);
    } catch (error) {
      return res.send(500, { message: "Erro ao deletar estoque." });
    }
  }
}

module.exports = EstoquesController;