const API_BASE_URL = 'https://localhost:7223';
const API_PRODUTOS_URL = `${API_BASE_URL}/api/Produto`;
const API_PEDIDO_URL = `${API_BASE_URL}/api/Pedido`;
const CART_KEY = 'cartItems';

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
    
    // Botão de adicionar ao carrinho
    const btnComprar = document.createElement('button');
    btnComprar.className = 'btn-comprar';
    btnComprar.textContent = 'Adicionar ao carrinho';
    btnComprar.addEventListener('click', () => adicionarAoCarrinho(produto));
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
    const badgeCarrinho = document.getElementById('carrinhoCount');
    
    if (userEmail) {
        if (btnLoginHeader) btnLoginHeader.style.display = 'none';
        if (btnPerfil) btnPerfil.style.display = 'block';
        if (btnLogout) btnLogout.style.display = 'block';
    } else {
        if (btnLoginHeader) btnLoginHeader.style.display = 'block';
        if (btnPerfil) btnPerfil.style.display = 'none';
        if (btnLogout) btnLogout.style.display = 'none';
    }
    
    if (badgeCarrinho) {
        atualizarContadorCarrinho();
    }
}

function fazerLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userData');
    verificarEstadoLogin();
    window.location.href = 'login.html';
}

function carregarCarrinho() {
    try {
        const itens = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
        if (Array.isArray(itens)) {
            return itens;
        }
        return [];
    } catch (e) {
        return [];
    }
}

function salvarCarrinho(itens) {
    localStorage.setItem(CART_KEY, JSON.stringify(itens));
    atualizarContadorCarrinho();
}

function atualizarContadorCarrinho() {
    const itens = carregarCarrinho();
    const total = itens.reduce((acc, item) => acc + (item.quantidade || 0), 0);
    const badgeCarrinho = document.getElementById('carrinhoCount');
    if (badgeCarrinho) {
        badgeCarrinho.textContent = total;
    }
}

function mostrarNotificacao(mensagem) {
    // Remove notificação anterior se existir
    const notificacaoAnterior = document.getElementById('notificacaoCarrinho');
    if (notificacaoAnterior) {
        notificacaoAnterior.remove();
    }
    
    const notificacao = document.createElement('div');
    notificacao.id = 'notificacaoCarrinho';
    notificacao.className = 'notificacao-carrinho';
    notificacao.textContent = mensagem;
    
    document.body.appendChild(notificacao);
    
    // Animação de entrada
    setTimeout(() => {
        notificacao.classList.add('mostrar');
    }, 10);
    
    // Remove após 3 segundos
    setTimeout(() => {
        notificacao.classList.remove('mostrar');
        setTimeout(() => {
            notificacao.remove();
        }, 300);
    }, 3000);
}

function adicionarAoCarrinho(produto) {
    const produtoId = produto.Id || produto.id || produto.produtoId || produto.ProdutoId;
    const nomeProduto = produto.Nome || produto.nome || produto.nomeProduto || produto.NomeProduto || 'Produto';
    const preco = produto.Preco || produto.preco || produto.valor || produto.Valor || 0;
    
    if (!produtoId) return;
    
    const itens = carregarCarrinho();
    const existente = itens.find(item => item.id === produtoId);
    
    if (existente) {
        existente.quantidade += 1;
        mostrarNotificacao(`Quantidade de "${nomeProduto}" atualizada no carrinho!`);
    } else {
        itens.push({
            id: produtoId,
            nome: nomeProduto,
            preco: Number(preco) || 0,
            quantidade: 1
        });
        mostrarNotificacao(`"${nomeProduto}" adicionado ao carrinho!`);
    }
    
    salvarCarrinho(itens);
}

function alterarQuantidadeCarrinho(id, delta) {
    const itens = carregarCarrinho();
    const item = itens.find(i => i.id === id);
    if (!item) return;
    
    item.quantidade = Math.max(1, item.quantidade + delta);
    salvarCarrinho(itens);
    renderizarCarrinhoPopup();
}

function removerDoCarrinho(id) {
    let itens = carregarCarrinho();
    itens = itens.filter(i => i.id !== id);
    salvarCarrinho(itens);
    renderizarCarrinhoPopup();
}

function calcularTotalCarrinho() {
    const itens = carregarCarrinho();
    return itens.reduce((acc, item) => acc + (item.preco || 0) * (item.quantidade || 0), 0);
}

function renderizarCarrinhoPopup() {
    const lista = document.getElementById('carrinhoLista');
    const totalEl = document.getElementById('carrinhoTotal');
    if (!lista || !totalEl) return;
    
    const itens = carregarCarrinho();
    
    if (itens.length === 0) {
        lista.innerHTML = '<p style="text-align:center; padding: 20px;">Carrinho vazio.</p>';
        totalEl.textContent = 'R$ 0,00';
        return;
    }
    
    lista.innerHTML = itens.map(item => `
        <div class="carrinho-item">
            <div class="carrinho-item-info">
                <div class="carrinho-item-nome">${item.nome}</div>
                <div class="carrinho-item-preco">R$ ${Number(item.preco).toFixed(2)}</div>
            </div>
            <div class="carrinho-controles">
                <button class="btn-quantidade" data-acao="menos" data-id="${item.id}">-</button>
                <input type="number" class="input-quantidade-lista" data-id="${item.id}" min="1" value="${item.quantidade}">
                <button class="btn-quantidade" data-acao="mais" data-id="${item.id}">+</button>
                <button class="btn-remover-item" data-acao="remover" data-id="${item.id}">&times;</button>
            </div>
        </div>
    `).join('');
    
    totalEl.textContent = `R$ ${calcularTotalCarrinho().toFixed(2)}`;
    
    lista.querySelectorAll('.btn-quantidade').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const acao = btn.getAttribute('data-acao');
            alterarQuantidadeCarrinho(id, acao === 'mais' ? 1 : -1);
        });
    });
    
    lista.querySelectorAll('.input-quantidade-lista').forEach(input => {
        input.addEventListener('change', () => {
            const id = input.getAttribute('data-id');
            const valor = Math.max(1, parseInt(input.value) || 1);
            const itens = carregarCarrinho();
            const item = itens.find(i => i.id === id);
            if (item) {
                item.quantidade = valor;
                salvarCarrinho(itens);
                renderizarCarrinhoPopup();
            }
        });
    });
    
    lista.querySelectorAll('.btn-remover-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            removerDoCarrinho(id);
        });
    });
}

function mostrarCarrinho() {
    const overlayExistente = document.getElementById('popupCarrinho');
    if (overlayExistente) overlayExistente.remove();
    
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    overlay.id = 'popupCarrinho';
    
    const popup = document.createElement('div');
    popup.className = 'popup-compra';
    
    popup.innerHTML = `
        <div class="popup-header">
            <h3>Seu Carrinho</h3>
            <button class="popup-fechar" id="btnFecharCarrinho">&times;</button>
        </div>
        <div class="popup-body">
            <div class="carrinho-lista" id="carrinhoLista"></div>
            <div class="carrinho-total">
                <span>Total</span>
                <span id="carrinhoTotal">R$ 0,00</span>
            </div>
            <button class="btn-finalizar" id="btnFinalizarCarrinho">Finalizar compra</button>
        </div>
    `;
    
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) fecharCarrinho();
    });
    
    document.getElementById('btnFecharCarrinho').addEventListener('click', fecharCarrinho);
    document.getElementById('btnFinalizarCarrinho').addEventListener('click', finalizarCarrinho);
    
    const fecharComESC = (e) => {
        if (e.key === 'Escape') {
            fecharCarrinho();
            document.removeEventListener('keydown', fecharComESC);
        }
    };
    document.addEventListener('keydown', fecharComESC);
    
    renderizarCarrinhoPopup();
}

function fecharCarrinho() {
    const overlay = document.getElementById('popupCarrinho');
    if (overlay) overlay.remove();
}

function mostrarMetodosPagamento() {
    const itens = carregarCarrinho();
    if (itens.length === 0) {
        fecharCarrinho();
        return;
    }
    
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
        fecharCarrinho();
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 100);
        return;
    }
    
    const total = calcularTotalCarrinho();
    
    // Fecha o carrinho primeiro
    fecharCarrinho();
    
    // Cria overlay de pagamento
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    overlay.id = 'popupPagamento';
    
    const popup = document.createElement('div');
    popup.className = 'popup-compra';
    
    popup.innerHTML = `
        <div class="popup-header">
            <h3>Método de Pagamento</h3>
            <button class="popup-fechar" id="btnFecharPagamento">&times;</button>
        </div>
        <div class="popup-body">
            <p class="popup-total-pagamento">Total: R$ ${total.toFixed(2)}</p>
            <div class="metodos-pagamento">
                <label class="metodo-pagamento-item">
                    <input type="radio" name="metodoPagamento" value="cartao-credito" checked>
                    <span class="metodo-pagamento-label">
                        <span class="metodo-icone">💳</span>
                        <span>Cartão de Crédito</span>
                    </span>
                </label>
                <label class="metodo-pagamento-item">
                    <input type="radio" name="metodoPagamento" value="cartao-debito">
                    <span class="metodo-pagamento-label">
                        <span class="metodo-icone">💳</span>
                        <span>Cartão de Débito</span>
                    </span>
                </label>
                <label class="metodo-pagamento-item">
                    <input type="radio" name="metodoPagamento" value="pix">
                    <span class="metodo-pagamento-label">
                        <span class="metodo-icone">📱</span>
                        <span>PIX</span>
                    </span>
                </label>
                <label class="metodo-pagamento-item">
                    <input type="radio" name="metodoPagamento" value="boleto">
                    <span class="metodo-pagamento-label">
                        <span class="metodo-icone">📄</span>
                        <span>Boleto Bancário</span>
                    </span>
                </label>
            </div>
            <div id="areaQrCode" class="area-qrcode" style="display: none;">
                <p class="qrcode-titulo">Escaneie o QR Code para pagar</p>
                <div id="qrcodeContainer" class="qrcode-container"></div>
                <p class="qrcode-valor">Valor: R$ ${total.toFixed(2)}</p>
                <p class="qrcode-chave">Chave PIX: origem-natural@pix.com</p>
            </div>
        </div>
        <div class="popup-footer">
            <button class="btn-popup-cancelar" id="btnCancelarPagamento">Cancelar</button>
            <button class="btn-popup-confirmar" id="btnConfirmarPagamento">Confirmar Pagamento</button>
        </div>
    `;
    
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    // Fecha popup ao clicar no overlay
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            fecharPagamento();
        }
    });
    
    // Botão fechar
    document.getElementById('btnFecharPagamento').addEventListener('click', fecharPagamento);
    
    // Botão cancelar
    document.getElementById('btnCancelarPagamento').addEventListener('click', fecharPagamento);
    
    // Botão confirmar
    document.getElementById('btnConfirmarPagamento').addEventListener('click', () => {
        const metodoSelecionado = document.querySelector('input[name="metodoPagamento"]:checked');
        if (metodoSelecionado) {
            processarPagamento(metodoSelecionado.value);
        }
    });
    
    // Listener para mudança de método de pagamento
    document.querySelectorAll('input[name="metodoPagamento"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'pix') {
                gerarQrCodePix(total);
            } else {
                esconderQrCode();
            }
        });
    });
    
    // Fecha com ESC
    const fecharComESC = (e) => {
        if (e.key === 'Escape') {
            fecharPagamento();
            document.removeEventListener('keydown', fecharComESC);
        }
    };
    document.addEventListener('keydown', fecharComESC);
}

function gerarQrCodePix(valor) {
    const areaQrCode = document.getElementById('areaQrCode');
    const qrcodeContainer = document.getElementById('qrcodeContainer');
    
    if (!areaQrCode || !qrcodeContainer) return;
    
    // Mostra a área do QR code
    areaQrCode.style.display = 'block';
    
    // Limpa o container anterior
    qrcodeContainer.innerHTML = '';
    
    // Gera um código PIX dinâmico (EMV QR Code format)
    const chavePix = 'origem-natural@pix.com';
    const nomeBeneficiario = 'Origem Natural';
    const cidade = 'São Paulo';
    const identificador = '***';
    
    // Formato EMV para PIX (simplificado)
    const qrCodeData = `00020126${String(chavePix.length).padStart(2, '0')}${chavePix}5204000053039865802BR59${String(nomeBeneficiario.length).padStart(2, '0')}${nomeBeneficiario}60${String(cidade.length).padStart(2, '0')}${cidade}62070503***6304`;
    
    // Adiciona o valor ao QR code
    const valorFormatado = valor.toFixed(2).replace('.', '');
    const qrCodeCompleto = qrCodeData.replace('5802BR', `54${String(valorFormatado.length).padStart(2, '0')}${valorFormatado}5802BR`);
    
    // Gera o QR code usando a biblioteca
    if (typeof QRCode !== 'undefined') {
        QRCode.toCanvas(qrcodeContainer, qrCodeCompleto, {
            width: 200,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        }, (error) => {
            if (error) {
                console.error('Erro ao gerar QR code:', error);
                // Fallback: gera QR code simples com texto
                QRCode.toCanvas(qrcodeContainer, `PIX: ${chavePix}\nValor: R$ ${valor.toFixed(2)}`, {
                    width: 200,
                    margin: 2
                });
            }
        });
    } else {
        // Fallback se a biblioteca não carregou
        qrcodeContainer.innerHTML = `
            <div style="padding: 20px; text-align: center; border: 2px dashed #ccc; border-radius: 8px;">
                <p style="margin: 0; color: #666;">QR Code</p>
                <p style="margin: 5px 0; font-weight: 600;">R$ ${valor.toFixed(2)}</p>
                <p style="margin: 0; font-size: 12px; color: #999;">${chavePix}</p>
            </div>
        `;
    }
}

function esconderQrCode() {
    const areaQrCode = document.getElementById('areaQrCode');
    if (areaQrCode) {
        areaQrCode.style.display = 'none';
    }
}

function fecharPagamento() {
    const overlay = document.getElementById('popupPagamento');
    if (overlay) overlay.remove();
}

async function processarPagamento(metodoPagamento) {
    const itens = carregarCarrinho();
    const userEmail = localStorage.getItem('userEmail');
    
    if (!userEmail || itens.length === 0) {
        fecharPagamento();
        return;
    }
    
    // Fecha o popup de pagamento
    fecharPagamento();
    
    try {
        for (const item of itens) {
            await fetch(API_PEDIDO_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    clienteEmail: userEmail,
                    produtoId: item.id,
                    quantidade: item.quantidade,
                    metodoPagamento: metodoPagamento
                }),
                mode: 'cors'
            });
        }
    } catch (e) {
        // Não exibe erros
    }
    
    salvarCarrinho([]);
    atualizarContadorCarrinho();
}

async function finalizarCarrinho() {
    mostrarMetodosPagamento();
}

document.addEventListener('DOMContentLoaded', () => {
    verificarEstadoLogin();
    atualizarContadorCarrinho();
    carregarProdutos();
    
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', fazerLogout);
    }
    
    const btnCarrinho = document.getElementById('btnCarrinho');
    if (btnCarrinho) {
        btnCarrinho.addEventListener('click', mostrarCarrinho);
    }
});
