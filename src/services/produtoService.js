const axios = require('axios');

// Substitua pela URL real onde o serviço do seu amigo estiver rodando
const PRODUTO_API_BASE = 'http://localhost:3001'; 

class ProdutoService {
  static async buscarDadosProduto(id) {
    // Fingindo que o banco do amigo respondeu isso:
    if (id === 1) {
      return { id: 1, nome: "Produto de Teste", preco: 10.50 };
    }
    return null; 
  }
}

module.exports = ProdutoService;