// Configuração da API
const API_BASE_URL = 'https://localhost:7223';
const API_CLIENTE_URL = `${API_BASE_URL}/api/Cliente`;

// Elementos do formulário
const cadastroForm = document.getElementById('cadastroForm');
const nomeInput = document.getElementById('nome');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const confirmarSenhaInput = document.getElementById('confirmarSenha');
const btnCadastro = document.getElementById('btnCadastro');
const mensagemErro = document.getElementById('mensagemErro');

function mostrarErro(mensagem) {
    mensagemErro.textContent = mensagem;
    mensagemErro.style.display = 'block';
    mensagemErro.className = 'mensagem-erro';
    
    setTimeout(() => {
        mensagemErro.style.display = 'none';
    }, 5000);
}

function mostrarSucesso(mensagem) {
    mensagemErro.textContent = mensagem;
    mensagemErro.style.display = 'block';
    mensagemErro.className = 'mensagem-sucesso';
}

function validarFormulario() {
    const nome = nomeInput.value.trim();
    const email = emailInput.value.trim();
    const senha = senhaInput.value;
    const confirmarSenha = confirmarSenhaInput.value;

    if (!nome) {
        mostrarErro('Por favor, digite seu nome completo.');
        nomeInput.focus();
        return false;
    }

    if (nome.length < 3) {
        mostrarErro('O nome deve ter pelo menos 3 caracteres.');
        nomeInput.focus();
        return false;
    }

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

    if (senha !== confirmarSenha) {
        mostrarErro('As senhas não coincidem. Por favor, verifique.');
        confirmarSenhaInput.focus();
        return false;
    }

    return true;
}

async function fazerCadastro(nome, email, senha) {
    const response = await fetch(API_CLIENTE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            nome: nome,
            email: email,
            senha: senha
        }),
        mode: 'cors'
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro ao fazer cadastro' }));
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    mostrarSucesso('Cadastro realizado com sucesso! Redirecionando para login...');

    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2000);
}

cadastroForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    mensagemErro.style.display = 'none';

    if (!validarFormulario()) {
        return;
    }

    const nome = nomeInput.value.trim();
    const email = emailInput.value.trim();
    const senha = senhaInput.value;

    btnCadastro.disabled = true;
    btnCadastro.textContent = 'Cadastrando...';

    try {
        await fazerCadastro(nome, email, senha);
    } catch (error) {
        mostrarErro(error.message || 'Erro ao fazer cadastro. Tente novamente.');
    } finally {
        btnCadastro.disabled = false;
        btnCadastro.textContent = 'Cadastrar';
    }
});

function verificarLogin() {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
        window.location.href = 'index.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    verificarLogin();
    
    // Botão para mostrar/ocultar senha
    const btnMostrarSenha = document.getElementById('btnMostrarSenha');
    const senhaInput = document.getElementById('senha');
    const iconeSenha = document.getElementById('iconeSenha');
    
    if (btnMostrarSenha && senhaInput) {
        btnMostrarSenha.addEventListener('click', () => {
            if (senhaInput.type === 'password') {
                senhaInput.type = 'text';
                iconeSenha.innerHTML = `
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                `;
            } else {
                senhaInput.type = 'password';
                iconeSenha.innerHTML = `
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                `;
            }
        });
    }
    
    // Botão para mostrar/ocultar confirmar senha
    const btnMostrarConfirmarSenha = document.getElementById('btnMostrarConfirmarSenha');
    const confirmarSenhaInput = document.getElementById('confirmarSenha');
    const iconeConfirmarSenha = document.getElementById('iconeConfirmarSenha');
    
    if (btnMostrarConfirmarSenha && confirmarSenhaInput) {
        btnMostrarConfirmarSenha.addEventListener('click', () => {
            if (confirmarSenhaInput.type === 'password') {
                confirmarSenhaInput.type = 'text';
                iconeConfirmarSenha.innerHTML = `
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                `;
            } else {
                confirmarSenhaInput.type = 'password';
                iconeConfirmarSenha.innerHTML = `
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                `;
            }
        });
    }
});

