// Script específico para a página de login
document.addEventListener('DOMContentLoaded', async function () {
    console.log('🚀 Login.js carregado - DOMContentLoaded');
    
    // Aguardar um pouco para garantir que o authManager seja carregado
    console.log('⏳ Aguardando 500ms para carregamento do authManager...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verificar se authManager está disponível
    console.log('🔍 Verificando authManager...');
    console.log('typeof authManager:', typeof authManager);
    console.log('authManager:', authManager);
    
    if (typeof authManager === 'undefined') {
        console.error('❌ AuthManager não está disponível. Verifique se auth.js foi carregado corretamente.');
        console.log('🔍 Verificando se auth.js foi carregado...');
        console.log('Scripts carregados:', document.querySelectorAll('script[src]'));
        return;
    }
    
    console.log('✅ AuthManager disponível!');
    const loginForm = document.getElementById('login-form');
    const formMessage = document.getElementById('form-message');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    // Configurar menu mobile
    setupMobileMenu();

    // 🔧 Aguarda verificação do token antes de decidir
    console.log('🔐 Verificando token...');
    try {
        // Aguardar até que authManager esteja disponível
        let attempts = 0;
        console.log('⏳ Aguardando authManager estar disponível...');
        while (typeof authManager === 'undefined' && attempts < 10) {
            console.log(`Tentativa ${attempts + 1}/10 - authManager ainda não disponível`);
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        console.log('🔍 AuthManager disponível:', typeof authManager !== 'undefined');
        console.log('🔍 verifyToken disponível:', typeof authManager.verifyToken === 'function');
        
        if (typeof authManager !== 'undefined' && typeof authManager.verifyToken === 'function') {
            console.log('✅ Chamando verifyToken...');
            await authManager.verifyToken();
            console.log('✅ verifyToken concluído');
        }
    } catch (e) {
        console.warn('⚠️ verifyToken falhou:', e);
    }

    // Se já estiver logado, decide destino por role
    if (typeof authManager !== 'undefined' && authManager.isLoggedIn && authManager.isLoggedIn()) {
        const isAdmin = authManager.isAdmin && authManager.isAdmin();
        showMessage('Você já está logado! Redirecionando...', 'success');
        setTimeout(() => {
            window.location.href = isAdmin ? 'admin.html' : 'index.html';
        }, 1200);
        return;
    }


    // Manipular envio do formulário
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        // Validação básica
        if (!username || !password) {
            showMessage('Por favor, preencha todos os campos.', 'error');
            return;
        }

        // Desabilitar botão durante o login
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Entrando...';

        try {
            console.log('🔐 Iniciando processo de login...');
            console.log('👤 Usuário:', username);
            console.log('🔑 Senha:', password ? '***' : 'vazia');
            
            // Aguardar até que authManager esteja disponível
            console.log('⏳ Aguardando authManager estar disponível...');
            let attempts = 0;
            while (typeof authManager === 'undefined' && attempts < 10) {
                console.log(`Tentativa ${attempts + 1}/10 - authManager ainda não disponível`);
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            console.log('🔍 AuthManager disponível:', typeof authManager !== 'undefined');
            console.log('🔍 login disponível:', typeof authManager.login === 'function');
            
            if (typeof authManager === 'undefined') {
                console.error('❌ AuthManager não está disponível após 1 segundo de espera');
                throw new Error('AuthManager não está disponível após 1 segundo de espera');
            }
            
            console.log('✅ Chamando authManager.login...');
            const result = await authManager.login(username, password);
            console.log('📋 Resultado do login:', result);

            if (result.success) {
                showMessage(`Bem-vindo, ${result.user?.name || username}!`, 'success');
                try { showNotification(`Login realizado com sucesso!`, 'success'); } catch {}

                // Decide destino por role (do payload ou do authManager)
                const isAdmin =
                    (result.user && result.user.role === 'admin') ||
                    (authManager.isAdmin && authManager.isAdmin());

                setTimeout(() => {
                    window.location.href = isAdmin ? 'admin.html' : 'index.html';
                }, 1200);
            } else {
                showMessage(result.message || 'Erro no login. Verifique suas credenciais.', 'error');

                // Limpar senha em caso de erro
                passwordInput.value = '';
                passwordInput.focus();
            }
        } catch (error) {
            console.error('Erro no login:', error);
            showMessage('Erro de conexão. Tente novamente.', 'error');
        } finally {
            // Reabilitar botão
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });

    // Função para mostrar mensagens no formulário
    function showMessage(message, type) {
        formMessage.textContent = message;
        formMessage.className = `form-message ${type}`;
        formMessage.style.display = 'block';

        // Esconder mensagem após 5 segundos
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 5000);
    }

    // Adicionar funcionalidade de "Enter" nos campos
    usernameInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            passwordInput.focus();
        }
    });

    passwordInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            loginForm.dispatchEvent(new Event('submit'));
        }
    });


    // Adicionar efeito de foco nos campos
    [usernameInput, passwordInput].forEach(input => {
        input.addEventListener('focus', function () {
            this.parentElement.style.transform = 'scale(1.02)';
            this.parentElement.style.transition = 'transform 0.2s ease';
        });

        input.addEventListener('blur', function () {
            this.parentElement.style.transform = 'scale(1)';
        });
    });

    // Adicionar validação em tempo real
    usernameInput.addEventListener('input', function () {
        this.style.borderColor = this.value.length > 0 ? 'var(--success-color)' : 'var(--border-color)';
    });

    passwordInput.addEventListener('input', function () {
        if (this.value.length >= 6) {
            this.style.borderColor = 'var(--success-color)';
        } else if (this.value.length > 0) {
            this.style.borderColor = 'var(--warning-color)';
        } else {
            this.style.borderColor = 'var(--border-color)';
        }
    });
});

// Configurar menu mobile
function setupMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navList = document.querySelector('.nav-list');

    if (mobileToggle && navList) {
        mobileToggle.addEventListener('click', function () {
            navList.classList.toggle('active');

            // Animar o ícone do hamburger
            const spans = mobileToggle.querySelectorAll('span');
            spans.forEach((span, index) => {
                if (navList.classList.contains('active')) {
                    if (index === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
                    if (index === 1) span.style.opacity = '0';
                    if (index === 2) span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
                } else {
                    span.style.transform = '';
                    span.style.opacity = '';
                }
            });
        });

        // Fechar menu ao clicar em um link
        const navLinks = navList.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navList.classList.remove('active');
                const spans = mobileToggle.querySelectorAll('span');
                spans.forEach(span => {
                    span.style.transform = '';
                    span.style.opacity = '';
                });
            });
        });

        // Fechar menu ao clicar fora
        document.addEventListener('click', function (e) {
            if (!mobileToggle.contains(e.target) && !navList.contains(e.target)) {
                navList.classList.remove('active');
                const spans = mobileToggle.querySelectorAll('span');
                spans.forEach(span => {
                    span.style.transform = '';
                    span.style.opacity = '';
                });
            }
        });
    }
}
