// Configuração da API
const API_BASE_URL = 'https://localhost:7223';
const API_CLIENTE_URL = `${API_BASE_URL}/api/Cliente`;

const nomePerfil = document.getElementById('nomePerfil');
const emailPerfil = document.getElementById('emailPerfil');
const mensagemErro = document.getElementById('mensagemErro');
const btnLogout = document.getElementById('btnLogout');

function carregarPerfil() {
    const userData = localStorage.getItem('userData');
    const userEmail = localStorage.getItem('userEmail');

    if (userData) {
        try {
            const data = JSON.parse(userData);
            nomePerfil.textContent = data.nome || data.Nome || 'Não informado';
            emailPerfil.textContent = data.email || data.Email || userEmail || 'Não informado';
        } catch (error) {
            nomePerfil.textContent = 'Não informado';
            emailPerfil.textContent = userEmail || 'Não informado';
        }
    } else if (userEmail) {
        nomePerfil.textContent = 'Não informado';
        emailPerfil.textContent = userEmail;
    } else {
        nomePerfil.textContent = 'Não informado';
        emailPerfil.textContent = 'Não informado';
    }
}

function fazerLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userData');
    window.location.href = 'login.html';
}

function verificarLogin() {
    const userEmail = localStorage.getItem('userEmail');
    
    if (!userEmail) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userData');
        window.location.href = 'login.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    verificarLogin();
    carregarPerfil();
    
    if (btnLogout) {
        btnLogout.addEventListener('click', fazerLogout);
    }
});
