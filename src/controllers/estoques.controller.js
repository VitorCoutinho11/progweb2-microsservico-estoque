const prisma = require("../config/prisma");
const ProdutoService = require("../services/produtoService");

class EstoquesController {

  // GET /estoques
  static async listar(req, res) {
    try {
      // 1. Busca os estoques no SEU banco
      const estoques = await prisma.estoque.findMany({
        orderBy: { id: "asc" },
        include: {
          section: {
            include: { floor: { include: { warehouse: true } } }
          }
        }
      });

      // 2. Opcional: "Hidratar" os dados com nomes dos produtos vindos da API externa
      const produtosExternos = await ProdutoService.buscarTodosProdutos();
      
      const response = estoques.map(item => {
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

      // Busca dados do produto no microsserviço vizinho
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

  // POST /estoques
  static async criar(req, res) {
    try {
      const { produtoId, sectionId, quantidade, quantidadeMinima, observacao } = req.body;

      if (!produtoId || !sectionId || quantidade == null) {
        return res.send(400, { message: "produtoId, sectionId e quantidade são obrigatórios." });
      }

      // VALIDAÇÃO EXTERNA: Pergunta ao outro microsserviço se o produto existe
      const produtoValido = await ProdutoService.buscarDadosProduto(Number(produtoId));

      if (!produtoValido) {
        return res.send(404, { message: "Produto inválido ou inexistente no catálogo." });
      }

      // VALIDAÇÃO LOCAL: Section pertence a este microsserviço
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
          quantidade,
          quantidadeMinima,
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

      // Se tentar mudar a seção, valida se a nova seção existe
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