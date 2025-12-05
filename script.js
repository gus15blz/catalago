// Configuração da API
const API_BASE_URL = 'https://localhost:7223/api';
const API_PRODUTOS_URL = `${API_BASE_URL}/Produto`;

/**
 * Tenta encontrar o campo de imagem em um produto
 * Conforme o modelo C#: imgLink (string?, nullable)
 */
function encontrarCampoImagem(produto) {
    // Primeiro tenta imgLink (campo correto do modelo)
    if (produto.imgLink) {
        return produto.imgLink;
    }
    
    // Fallback para outros possíveis nomes (caso a API retorne em formato diferente)
    const camposPossiveis = [
        'imgLink', 'ImgLink', 'imagem', 'Imagem', 'imagemUrl', 'ImagemUrl', 
        'urlImagem', 'UrlImagem', 'foto', 'Foto', 'fotoUrl', 'FotoUrl',
        'image', 'Image', 'url', 'Url', 'imagemBase64', 'ImagemBase64',
        'caminhoImagem', 'CaminhoImagem', 'path', 'Path'
    ];
    
    for (const campo of camposPossiveis) {
        if (produto[campo]) {
            return produto[campo];
        }
    }
    
    return null;
}

/**
 * Normaliza a URL da imagem
 */
function normalizarUrlImagem(url, produtoId = null) {
    if (!url || typeof url !== 'string') {
        if (produtoId) {
            return `${API_BASE_URL}/Produto/${produtoId}/imagem`;
        }
        return null;
    }
    
    url = url.trim();
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    
    if (url.startsWith('//')) {
        return `https:${url}`;
    }
    
    if (url.startsWith('data:image/')) {
        return url;
    }
    
    if (url.startsWith('/')) {
        return `https://localhost:7223${url}`;
    }
    
    const extensoesImagem = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    const temExtensao = extensoesImagem.some(ext => url.toLowerCase().includes(ext));
    
    if (temExtensao) {
        if (!url.startsWith('/')) {
            return `https://localhost:7223/${url}`;
        }
        return `https://localhost:7223${url}`;
    }
    
    if (produtoId) {
        return `${API_BASE_URL}/Produto/${produtoId}/imagem`;
    }
    
    return `${API_BASE_URL}/Imagem/${encodeURIComponent(url)}`;
}

/**
 * Converte uma URL de imagem para base64
 */
async function converterUrlParaBase64(url) {
    try {
        console.log('Tentando converter URL para base64:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'image/*'
            },
            mode: 'cors'
        });
        
        console.log('Resposta do fetch:', response.status, response.statusText);
        
        if (!response.ok) {
            console.error('Resposta não OK:', response.status, response.statusText);
            return null;
        }
        
        const blob = await response.blob();
        console.log('Blob criado, tamanho:', blob.size, 'tipo:', blob.type);
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result;
                console.log('Base64 gerado, tamanho:', base64 ? base64.length : 0);
                resolve(base64);
            };
            reader.onerror = (error) => {
                console.error('Erro no FileReader:', error);
                reject(error);
            };
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Erro ao converter imagem para base64:', error);
        return null;
    }
}

/**
 * Testa se uma URL de imagem funciona
 */
function testarUrl(url) {
    return new Promise((resolve) => {
        const img = new Image();
        const timeout = setTimeout(() => {
            resolve(false);
        }, 5000);
        
        img.onload = () => {
            clearTimeout(timeout);
            resolve(true);
        };
        
        img.onerror = () => {
            clearTimeout(timeout);
            resolve(false);
        };
        
        img.src = url;
    });
}

/**
 * Carrega a imagem de um produto
 */
async function carregarImagemProduto(produto) {
    // Conforme o modelo C#: Id (int)
    const produtoId = produto.Id || produto.id || produto.produtoId || produto.ProdutoId;
    const campoImagem = encontrarCampoImagem(produto);
    
    console.log('=== Carregando imagem ===');
    console.log('Produto:', produto);
    console.log('Campo de imagem encontrado:', campoImagem);
    
    // Se já é base64, retorna diretamente
    if (campoImagem && campoImagem.startsWith('data:image/')) {
        console.log('Imagem já é base64');
        return campoImagem;
    }
    
    if (campoImagem) {
        const urlNormalizada = normalizarUrlImagem(campoImagem, produtoId);
        console.log('URL normalizada:', urlNormalizada);
        
        if (urlNormalizada) {
            // Tenta usar URL diretamente primeiro
            console.log('Testando URL diretamente...');
            const urlFunciona = await testarUrl(urlNormalizada);
            if (urlFunciona) {
                console.log('URL funciona diretamente');
                return urlNormalizada;
            }
            
            // Se não funcionou, converte para base64
            console.log('URL não funcionou, convertendo para base64...');
            const base64 = await converterUrlParaBase64(urlNormalizada);
            if (base64) {
                console.log('Base64 gerado com sucesso');
                return base64;
            }
        }
    }
    
    // Se tem ID, tenta buscar pela API
    if (produtoId) {
        console.log('Tentando buscar imagem pela API com ID:', produtoId);
        const urlApi = `${API_BASE_URL}/Produto/${produtoId}/imagem`;
        const base64 = await converterUrlParaBase64(urlApi);
        if (base64) {
            return base64;
        }
    }
    
    return null;
}

/**
 * Cria um card de produto
 */
function criarCardProduto(produto) {
    const card = document.createElement('div');
    card.className = 'card';
    
    // Conforme o modelo C#: Nome (string)
    const nome = produto.Nome || produto.nome || produto.nomeProduto || produto.NomeProduto || 'Produto sem nome';
    
    // Conforme o modelo C#: Preco (decimal)
    const preco = produto.Preco || produto.preco || produto.valor || produto.Valor;
    
    // Nota: O modelo não tem campo Descricao, então removemos essa parte
    
    // Cria elemento de imagem (será preenchido depois)
    const imagemContainer = document.createElement('div');
    imagemContainer.className = 'sem-imagem';
    imagemContainer.textContent = 'Carregando imagem...';
    card.appendChild(imagemContainer);
    
    // Carrega a imagem
    carregarImagemProduto(produto).then(imagemSrc => {
        if (imagemSrc) {
            const img = document.createElement('img');
            img.src = imagemSrc;
            img.alt = nome;
            img.onerror = () => {
                imagemContainer.textContent = 'Imagem não disponível';
                imagemContainer.className = 'sem-imagem';
            };
            imagemContainer.replaceWith(img);
        } else {
            imagemContainer.textContent = 'Sem imagem';
        }
    }).catch(error => {
        console.error('Erro ao carregar imagem:', error);
        imagemContainer.textContent = 'Erro ao carregar imagem';
    });
    
    // Título - Conforme o modelo C#: Nome (string)
    const h3 = document.createElement('h3');
    h3.textContent = nome;
    card.appendChild(h3);
    
    // Preço - Conforme o modelo C#: Preco (decimal)
    if (preco !== undefined && preco !== null) {
        const pPreco = document.createElement('p');
        pPreco.className = 'preco';
        pPreco.textContent = `R$ ${Number(preco).toFixed(2)}`;
        card.appendChild(pPreco);
    }
    
    return card;
}

/**
 * Carrega os produtos da API
 */
async function carregarProdutos() {
    const catalogo = document.getElementById('catalogo');
    
    try {
        catalogo.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 40px;">Carregando produtos...</p>';
        
        const response = await fetch(API_PRODUTOS_URL);
        
        if (!response.ok) {
            throw new Error(`Erro ao buscar produtos: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('=== DADOS RECEBIDOS DA API ===');
        console.log('Tipo:', typeof data, Array.isArray(data) ? 'Array' : 'Objeto');
        console.log('Dados completos:', data);
        
        const produtosArray = Array.isArray(data) ? data : (data.produtos || data.data || []);
        
        console.log('Produtos extraídos:', produtosArray.length);
        if (produtosArray.length > 0) {
            console.log('=== PRIMEIRO PRODUTO (EXEMPLO) ===');
            console.log('Produto completo:', produtosArray[0]);
            console.log('Chaves do produto:', Object.keys(produtosArray[0]));
        }
        
        if (produtosArray.length === 0) {
            catalogo.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 40px;">Nenhum produto cadastrado ainda.</p>';
            return;
        }
        
        // Limpa o catálogo
        catalogo.innerHTML = '';
        
        // Cria os cards
        produtosArray.forEach(produto => {
            const card = criarCardProduto(produto);
            catalogo.appendChild(card);
        });
        
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        catalogo.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; padding: 40px; color: red;">Erro ao carregar produtos: ${error.message}</p>`;
    }
}

/**
 * Verifica se o usuário está logado e atualiza o header
 */
function verificarEstadoLogin() {
    const token = localStorage.getItem('authToken');
    const btnLoginHeader = document.getElementById('btnLoginHeader');
    const btnLogout = document.getElementById('btnLogout');
    
    if (token) {
        // Usuário está logado
        if (btnLoginHeader) btnLoginHeader.style.display = 'none';
        if (btnLogout) btnLogout.style.display = 'block';
    } else {
        // Usuário não está logado
        if (btnLoginHeader) btnLoginHeader.style.display = 'block';
        if (btnLogout) btnLogout.style.display = 'none';
    }
}

/**
 * Realiza logout
 */
function fazerLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userData');
    verificarEstadoLogin();
    window.location.href = 'login.html';
}

// Adiciona evento ao botão de logout
document.addEventListener('DOMContentLoaded', () => {
    verificarEstadoLogin();
    carregarProdutos();
    
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', fazerLogout);
    }
});

