const prisma = require("../config/prisma");


class EstoquesController {

  // GET /estoques
  static async listar(req, res) {
    try {
      console.log("--- Buscando estoques com relacionamentos completos ---");
      
      const estoques = await prisma.estoque.findMany({
        orderBy: { id: "asc" }, // Organiza por ordem de criação
        include: {
          section: {
            include: {
              floor: {
                include: {
                  warehouse: true // Traz os dados do Armazém, Andar e Seção
                }
              }
            }
          }
        }
      });

      return res.send(200, estoques);
    } catch (error) {
      console.error("DETALHE DO ERRO PRISMA NO LISTAR:", error);
      return res.send(500, { 
        message: "Erro ao listar estoques.", 
        erroReal: error.message 
      });
    }
  }

  // GET /estoques/:id
  static async buscarPorId(req, res) {
    try {
      const id = Number(req.params.id);
      
      console.log(`--- Buscando estoque ID: ${id} ---`);

      const estoque = await prisma.estoque.findUnique({
        where: { id },
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

      if (!estoque) {
        return res.send(404, { message: "Estoque não encontrado." });
      }

      return res.send(200, estoque);
    } catch (error) {
      console.error("ERRO AO BUSCAR POR ID:", error);
      return res.send(500, { message: "Erro ao buscar estoque.", erroReal: error.message });
    }
  }

  // GET /estoques/produto/:produtoId
  static async buscarPorProdutoId(req, res) {
    try {
      const produtoId = Number(req.params.produtoId);
      
      console.log(`--- Buscando localizações para o Produto ID: ${produtoId} ---`);

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

      if (estoques.length === 0) {
        return res.send(404, { message: "Nenhum estoque encontrado para este produto." });
      }

      return res.send(200, estoques);
    } catch (error) {
      console.error("ERRO AO BUSCAR POR PRODUTO ID:", error);
      return res.send(500, { message: "Erro na busca por produto.", erroReal: error.message });
    }
  }
  // POST /estoques
  static async criar(req, res) {
    try {
      const { produtoId, sectionId, quantidade, quantidadeMinima, observacao } = req.body;

      // 1. Validação de campos obrigatórios
      if (!produtoId || !sectionId || quantidade == null) {
        return res.send(400, { message: "produtoId, sectionId e quantidade são obrigatórios." });
      }

      const section = await prisma.section.findUnique({
        where: { id: Number(sectionId) }
      });

      if (!section) {
        return res.send(404, { message: "Seção de estoque não encontrada no seu banco." });
      }

      // 3. Criação do registro
      const novoEstoque = await prisma.estoque.create({
        data: {
          produtoId: Number(produtoId),
          sectionId: Number(sectionId),
          quantidade: Number(quantidade),
          quantidadeMinima: Number(quantidadeMinima || 0),
          observacao
        }
      });

      console.log("Estoque criado com sucesso!");
      return res.send(201, novoEstoque);

    } catch (error) {
      console.error("ERRO NO POST:", error);
      if (error.code === "P2002") {
        return res.send(400, { message: "Já existe esse produto nessa seção." });
      }
      return res.send(500, { message: "Erro ao cadastrar estoque.", detalhe: error.message });
    }
  }

  // PATCH /estoques/:id
  static async atualizar(req, res) {
    try {
      const id = Number(req.params.id);
      const dadosParaAtualizar = req.body;

      // 1. Verifica se o item existe
      const existe = await prisma.estoque.findUnique({ where: { id } });
      if (!existe) return res.send(404, { message: "Estoque não encontrado." });

      // 2. Garantir que campos numéricos sejam convertidos (se vierem no body)
      if (dadosParaAtualizar.quantidade !== undefined) dadosParaAtualizar.quantidade = Number(dadosParaAtualizar.quantidade);
      if (dadosParaAtualizar.quantidadeMinima !== undefined) dadosParaAtualizar.quantidadeMinima = Number(dadosParaAtualizar.quantidadeMinima);
      if (dadosParaAtualizar.sectionId !== undefined) dadosParaAtualizar.sectionId = Number(dadosParaAtualizar.sectionId);
      if (dadosParaAtualizar.produtoId !== undefined) dadosParaAtualizar.produtoId = Number(dadosParaAtualizar.produtoId);

      // 3. Executa a atualização
      const estoqueAtualizado = await prisma.estoque.update({
        where: { id },
        data: dadosParaAtualizar,
        include: { section: true } // Opcional: traz a seção para confirmar
      });

      console.log(`Estoque ${id} atualizado com sucesso!`);
      return res.send(200, estoqueAtualizado);
    } catch (error) {
      console.error("ERRO NO PATCH:", error);
      return res.send(500, { message: "Erro ao atualizar estoque.", detalhe: error.message });
    }
  }

  // DELETE /estoques/:id
  static async deletar(req, res) {
    try {
      const id = Number(req.params.id);

      // 1. Primeiro verificamos se o registro existe
      const existe = await prisma.estoque.findUnique({ where: { id } });
      
      if (!existe) {
        return res.send(404, { message: "Estoque não encontrado ou já foi deletado." });
      }

      // 2. Se existe, deletamos
      await prisma.estoque.delete({ where: { id } });
      
      return res.send(204); // Sucesso total
    } catch (error) {
      console.error("ERRO AO DELETAR:", error);
      return res.send(500, { message: "Erro ao processar a exclusão." });
    }
  }
}

module.exports = EstoquesController;