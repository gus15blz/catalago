const API_BASE_URL = 'https://localhost:7223';
const API_PRODUTOS_URL = `${API_BASE_URL}/api/Produto`;
const API_PEDIDO_URL = `${API_BASE_URL}/api/Pedido`;

function encontrarCampoImagem(produto) {
    if (produto.imgLink) {
        return produto.imgLink;
    }
    
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

function normalizarUrlImagem(url, produtoId = null) {
    if (!url || typeof url !== 'string') {
        if (produtoId) {
            return `${API_BASE_URL}/api/Produto/${produtoId}/imagem`;
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
        return `${API_BASE_URL}${url}`;
    }
    
    const extensoesImagem = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    const temExtensao = extensoesImagem.some(ext => url.toLowerCase().includes(ext));
    
    if (temExtensao) {
        if (!url.startsWith('/')) {
            return `${API_BASE_URL}/${url}`;
        }
        return `${API_BASE_URL}${url}`;
    }
    
    if (produtoId) {
        return `${API_BASE_URL}/api/Produto/${produtoId}/imagem`;
    }
    
    return `${API_BASE_URL}/api/Imagem/${encodeURIComponent(url)}`;
}

async function carregarImagemProduto(produto) {
    const produtoId = produto.Id || produto.id || produto.produtoId || produto.ProdutoId;
    const campoImagem = encontrarCampoImagem(produto);
    
    if (campoImagem && campoImagem.startsWith('data:image/')) {
        return campoImagem;
    }
    
    if (campoImagem) {
        const urlNormalizada = normalizarUrlImagem(campoImagem, produtoId);
        if (urlNormalizada) {
            return urlNormalizada;
        }
    }
    
    if (produtoId) {
        return `${API_BASE_URL}/api/Produto/${produtoId}/imagem`;
    }
    
    return null;
}

function criarCardProduto(produto) {
    const card = document.createElement('div');
    card.className = 'card';
    
    const nome = produto.Nome || produto.nome || produto.nomeProduto || produto.NomeProduto || 'Produto sem nome';
    const preco = produto.Preco || produto.preco || produto.valor || produto.Valor;
    
    const imagemContainer = document.createElement('div');
    imagemContainer.className = 'sem-imagem';
    imagemContainer.textContent = 'Carregando imagem...';
    card.appendChild(imagemContainer);
    
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
    });
    
    const h3 = document.createElement('h3');
    h3.textContent = nome;
    card.appendChild(h3);
    
    if (preco !== undefined && preco !== null) {
        const pPreco = document.createElement('p');
        pPreco.className = 'preco';
        pPreco.textContent = `R$ ${Number(preco).toFixed(2)}`;
        card.appendChild(pPreco);
    }
    
    // Botão de comprar
    const btnComprar = document.createElement('button');
    btnComprar.className = 'btn-comprar';
    btnComprar.textContent = 'Comprar';
    btnComprar.addEventListener('click', () => comprarProduto(produto));
    card.appendChild(btnComprar);
    
    return card;
}

async function carregarProdutos() {
    const catalogo = document.getElementById('catalogo');
    
    catalogo.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 40px;">Carregando produtos...</p>';
    
    const response = await fetch(API_PRODUTOS_URL, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        mode: 'cors'
    });
    
    if (!response.ok) {
        catalogo.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; padding: 40px; color: red;">Erro ${response.status}</p>`;
        return;
    }
    
    const data = await response.json();
    const produtosArray = Array.isArray(data) ? data : (data.produtos || data.data || []);
    
    if (produtosArray.length === 0) {
        catalogo.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 40px;">Nenhum produto cadastrado ainda.</p>';
        return;
    }
    
    catalogo.innerHTML = '';
    
    produtosArray.forEach(produto => {
        const card = criarCardProduto(produto);
        catalogo.appendChild(card);
    });
}

function verificarEstadoLogin() {
    const userEmail = localStorage.getItem('userEmail');
    const btnLoginHeader = document.getElementById('btnLoginHeader');
    const btnPerfil = document.getElementById('btnPerfil');
    const btnLogout = document.getElementById('btnLogout');
    
    if (userEmail) {
        if (btnLoginHeader) btnLoginHeader.style.display = 'none';
        if (btnPerfil) btnPerfil.style.display = 'block';
        if (btnLogout) btnLogout.style.display = 'block';
    } else {
        if (btnLoginHeader) btnLoginHeader.style.display = 'block';
        if (btnPerfil) btnPerfil.style.display = 'none';
        if (btnLogout) btnLogout.style.display = 'none';
    }
}

function fazerLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userData');
    verificarEstadoLogin();
    window.location.href = 'login.html';
}

/**
 * Cria e exibe popup de confirmação de compra
 */
function mostrarPopupCompra(produto, callbackConfirmar) {
    const produtoId = produto.Id || produto.id || produto.produtoId || produto.ProdutoId;
    const nomeProduto = produto.Nome || produto.nome || produto.nomeProduto || produto.NomeProduto || 'Produto';
    const preco = produto.Preco || produto.preco || produto.valor || produto.Valor;
    
    // Cria overlay
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    overlay.id = 'popupCompraOverlay';
    
    // Cria popup
    const popup = document.createElement('div');
    popup.className = 'popup-compra';
    
    popup.innerHTML = `
        <div class="popup-header">
            <h3>Confirmar Compra</h3>
            <button class="popup-fechar" id="btnFecharPopup">&times;</button>
        </div>
        <div class="popup-body">
            <p class="popup-produto-nome">${nomeProduto}</p>
            <p class="popup-produto-preco">R$ ${Number(preco).toFixed(2)}</p>
            <div class="popup-quantidade">
                <label for="quantidadeCompra">Quantidade:</label>
                <input type="number" id="quantidadeCompra" min="1" value="1" class="input-quantidade">
            </div>
        </div>
        <div class="popup-footer">
            <button class="btn-popup-cancelar" id="btnCancelarCompra">Cancelar</button>
            <button class="btn-popup-confirmar" id="btnConfirmarCompra">Confirmar Compra</button>
        </div>
    `;
    
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    // Fecha popup ao clicar no overlay
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            fecharPopupCompra();
        }
    });
    
    // Botão fechar
    document.getElementById('btnFecharPopup').addEventListener('click', fecharPopupCompra);
    
    // Botão cancelar
    document.getElementById('btnCancelarCompra').addEventListener('click', fecharPopupCompra);
    
    // Botão confirmar
    document.getElementById('btnConfirmarCompra').addEventListener('click', () => {
        const quantidade = parseInt(document.getElementById('quantidadeCompra').value) || 1;
        fecharPopupCompra();
        callbackConfirmar(produto, quantidade);
    });
    
    // Fecha com ESC
    const fecharComESC = (e) => {
        if (e.key === 'Escape') {
            fecharPopupCompra();
            document.removeEventListener('keydown', fecharComESC);
        }
    };
    document.addEventListener('keydown', fecharComESC);
}

/**
 * Fecha o popup de compra
 */
function fecharPopupCompra() {
    const overlay = document.getElementById('popupCompraOverlay');
    if (overlay) {
        overlay.remove();
    }
}

/**
 * Realiza a compra de um produto
 */
async function comprarProduto(produto) {
    const userEmail = localStorage.getItem('userEmail');
    
    if (!userEmail) {
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 100);
        return;
    }
    
    const produtoId = produto.Id || produto.id || produto.produtoId || produto.ProdutoId;
    
    if (!produtoId) {
        return;
    }
    
    // Mostra popup de confirmação
    mostrarPopupCompra(produto, async (produtoConfirmado, quantidade) => {
        try {
            await fetch(API_PEDIDO_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    clienteEmail: userEmail,
                    produtoId: produtoId,
                    quantidade: quantidade
                }),
                mode: 'cors'
            });
        } catch (error) {
            // Não exibe erros conforme solicitado
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    verificarEstadoLogin();
    carregarProdutos();
    
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', fazerLogout);
    }
});
