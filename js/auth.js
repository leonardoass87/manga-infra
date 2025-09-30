// ==============================
// Configuração da API
// ==============================
const API_BASE_URL = 'http://localhost:4000/api';
const SERVER_BASE_URL = 'http://localhost:4000';
window.API_BASE_URL = API_BASE_URL;
window.SERVER_BASE_URL = SERVER_BASE_URL;

// ==============================
// Classe para gerenciar autenticação
// ==============================
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
        this.init();
    }

    init() {
        this.updateAuthUI();
        this.setupMobileMenu();

        // Verificar token ao carregar a página
        if (this.token) {
            this.verifyToken();
        }
    }

    setupMobileMenu() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const navList = document.querySelector('.nav-list');

        if (mobileToggle && navList) {
            mobileToggle.addEventListener('click', () => {
                navList.classList.toggle('mobile-active');
                mobileToggle.classList.toggle('active');
            });
        }
    }

    // ------------------------------
    // LOGIN
    // ------------------------------
    async login(username, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (data.success) {
                this.token = data.token;
                this.user = data.user;

                localStorage.setItem('token', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));

                this.updateAuthUI();
                return { success: true, user: this.user };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Erro no login:', error);
            return { success: false, message: 'Erro de conexão com o servidor' };
        }
    }

    // ------------------------------
    // REGISTER
    // ------------------------------
    async register(name, username, email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, username, email, password }),
            });

            const data = await response.json();

            if (data.success) {
                this.token = data.token;
                this.user = data.user;

                localStorage.setItem('token', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));

                this.updateAuthUI();
                return { success: true, user: this.user };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Erro no registro:', error);
            return { success: false, message: 'Erro de conexão com o servidor' };
        }
    }

    // ------------------------------
    // VERIFY TOKEN
    // ------------------------------
    async verifyToken() {
        if (!this.token) return false;

        try {
            const response = await fetch(`${API_BASE_URL}/verify`, {
                headers: { 'Authorization': `Bearer ${this.token}` },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.user = data.user;
                    localStorage.setItem('user', JSON.stringify(this.user));
                    this.updateAuthUI();
                    return true;
                } else {
                    this.logout();
                    return false;
                }
            } else {
                this.logout();
                return false;
            }
        } catch (error) {
            console.error('Erro na verificação do token:', error);
            this.logout();
            return false;
        }
    }

    // ------------------------------
    // LOGOUT
    // ------------------------------
    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.updateAuthUI();

        // Redirecionar para home se estiver em página protegida
        if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
            window.location.href = 'index.html';
        }
    }

    // ------------------------------
    // ATUALIZAÇÃO DE UI
    // ------------------------------
    updateAuthUI() {
        const authLink = document.getElementById('auth-link');
        const adminLink = document.getElementById('admin-link');

        if (authLink) {
            if (this.isLoggedIn()) {
                authLink.textContent = 'Logout';
                authLink.href = '#';
                authLink.onclick = (e) => {
                    e.preventDefault();
                    this.logout();
                };
            } else {
                authLink.textContent = 'Login';
                authLink.href = 'login.html';
                authLink.onclick = null;
            }
        }

        if (adminLink) {
            if (this.isLoggedIn() && this.isAdmin()) {
                adminLink.style.display = 'block';
            } else {
                adminLink.style.display = 'none';
            }
        }

        this.showWelcomeMessage();
    }

    showWelcomeMessage() {
        const existingWelcome = document.querySelector('.welcome-message');
        if (existingWelcome) {
            existingWelcome.remove();
        }

        if (this.isLoggedIn()) {
            const header = document.querySelector('.header .container');
            if (header) {
                const welcomeDiv = document.createElement('div');
                welcomeDiv.className = 'welcome-message';
                welcomeDiv.innerHTML = `
                    <div style="background-color: var(--primary-color); color: white; padding: 0.5rem 1rem; text-align: center; font-size: 0.9rem;">
                        Bem-vindo, ${this.user.name}!
                        <span style="margin-left: 1rem; opacity: 0.8;">${this.user.role === 'admin' ? '👑 Admin' : '👤 Usuário'}</span>
                    </div>
                `;
                header.appendChild(welcomeDiv);
            }
        }
    }

    // ------------------------------
    // HELPERS
    // ------------------------------
    isLoggedIn() {
        return this.token && this.user;
    }

    getToken() {
        return this.token;
    }

    getUser() {
        return this.user;
    }

    isAdmin() {
        return this.user && this.user.role === 'admin';
    }
}

// ==============================
// Função utilitária para requisições autenticadas
// ==============================
async function authenticatedFetch(url, options = {}) {
    const token = authManager.getToken();

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
        },
    };

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, mergedOptions);

        if (response.status === 401 || response.status === 403) {
            authManager.logout();
            throw new Error('Sessão expirada. Faça login novamente.');
        }

        return response;
    } catch (error) {
        console.error('Erro na requisição:', error);
        throw error;
    }
}

// ==============================
// Função para mostrar notificações
// ==============================
function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: ${type === 'error' ? 'var(--error-color)' : type === 'success' ? 'var(--success-color)' : 'var(--primary-color)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            z-index: 9999;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
        ">
            ${message}
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// ==============================
// Estilos extras para animações
// ==============================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    .nav-list.mobile-active {
        display: flex !important;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background-color: var(--background-darker);
        flex-direction: column;
        padding: 1rem;
        border-top: 1px solid var(--border-color);
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    }
    .mobile-menu-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    .mobile-menu-toggle.active span:nth-child(2) {
        opacity: 0;
    }
    .mobile-menu-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
    @media (max-width: 768px) {
        .nav-list { display: none; }
    }
`;
document.head.appendChild(style);

// ==============================
// Instanciar globalmente
// ==============================
const authManager = new AuthManager();
window.authManager = authManager;
