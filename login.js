// Configuração da API
const API_BASE_URL = 'https://localhost:7223/api';
const API_LOGIN_URL = `${API_BASE_URL}/Auth/login`; // Ajuste conforme sua API

// Elementos do formulário
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const btnLogin = document.getElementById('btnLogin');
const mensagemErro = document.getElementById('mensagemErro');
const linkCadastro = document.getElementById('linkCadastro');

/**
 * Exibe mensagem de erro
 */
function mostrarErro(mensagem) {
    mensagemErro.textContent = mensagem;
    mensagemErro.style.display = 'block';
    mensagemErro.className = 'mensagem-erro';
    
    // Remove a mensagem após 5 segundos
    setTimeout(() => {
        mensagemErro.style.display = 'none';
    }, 5000);
}

/**
 * Exibe mensagem de sucesso
 */
function mostrarSucesso(mensagem) {
    mensagemErro.textContent = mensagem;
    mensagemErro.style.display = 'block';
    mensagemErro.className = 'mensagem-sucesso';
}

/**
 * Valida o formulário antes de enviar
 */
function validarFormulario() {
    const email = emailInput.value.trim();
    const senha = senhaInput.value;

    if (!email) {
        mostrarErro('Por favor, digite seu email.');
        emailInput.focus();
        return false;
    }

    if (!email.includes('@') || !email.includes('.')) {
        mostrarErro('Por favor, digite um email válido.');
        emailInput.focus();
        return false;
    }

    if (!senha) {
        mostrarErro('Por favor, digite sua senha.');
        senhaInput.focus();
        return false;
    }

    if (senha.length < 4) {
        mostrarErro('A senha deve ter pelo menos 4 caracteres.');
        senhaInput.focus();
        return false;
    }

    return true;
}

/**
 * Realiza o login na API
 */
async function fazerLogin(email, senha) {
    try {
        console.log('Tentando fazer login...');
        
        const response = await fetch(API_LOGIN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                senha: senha
                // Ajuste os nomes dos campos conforme sua API
                // Pode ser: email/senha, username/password, etc.
            })
        });

        console.log('Resposta do servidor:', response.status, response.statusText);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Erro ao fazer login' }));
            throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Login bem-sucedido:', data);

        // Salva o token (se a API retornar)
        if (data.token) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userEmail', email);
        }

        // Salva informações do usuário (se retornadas)
        if (data.usuario) {
            localStorage.setItem('userData', JSON.stringify(data.usuario));
        }

        mostrarSucesso('Login realizado com sucesso! Redirecionando...');

        // Redireciona para a página principal após 1 segundo
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);

    } catch (error) {
        console.error('Erro ao fazer login:', error);
        mostrarErro(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
    }
}

/**
 * Manipula o envio do formulário
 */
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Esconde mensagens anteriores
    mensagemErro.style.display = 'none';

    // Valida o formulário
    if (!validarFormulario()) {
        return;
    }

    const email = emailInput.value.trim();
    const senha = senhaInput.value;

    // Desabilita o botão durante o login
    btnLogin.disabled = true;
    btnLogin.textContent = 'Entrando...';

    try {
        await fazerLogin(email, senha);
    } finally {
        // Reabilita o botão
        btnLogin.disabled = false;
        btnLogin.textContent = 'Entrar';
    }
});

/**
 * Link para cadastro (pode ser implementado depois)
 */
linkCadastro.addEventListener('click', (e) => {
    e.preventDefault();
    // Aqui você pode redirecionar para uma página de cadastro
    alert('Funcionalidade de cadastro em desenvolvimento.');
    // window.location.href = 'cadastro.html';
});

/**
 * Verifica se o usuário já está logado
 */
function verificarLogin() {
    const token = localStorage.getItem('authToken');
    if (token) {
        // Se já está logado, redireciona para a página principal
        window.location.href = 'index.html';
    }
}

// Verifica login ao carregar a página
document.addEventListener('DOMContentLoaded', verificarLogin);

