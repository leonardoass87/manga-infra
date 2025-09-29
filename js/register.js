// Script específico para a página de cadastro
document.addEventListener('DOMContentLoaded', async function () {
    console.log('🚀 Register.js carregado - DOMContentLoaded');
    
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
    const registerForm = document.getElementById('register-form');
    const formMessage = document.getElementById('form-message');
    const nameInput = document.getElementById('name');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    // Configurar menu mobile
    setupMobileMenu();

    // Se já estiver logado, redirecionar
    if (typeof authManager !== 'undefined' && authManager.isLoggedIn && authManager.isLoggedIn()) {
        const isAdmin = authManager.isAdmin && authManager.isAdmin();
        showMessage('Você já está logado! Redirecionando...', 'success');
        setTimeout(() => {
            window.location.href = isAdmin ? 'admin.html' : 'index.html';
        }, 1200);
        return;
    }

    // Manipular envio do formulário
    registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const name = nameInput.value.trim();
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        // Validação básica
        if (!name || !username || !email || !password || !confirmPassword) {
            showMessage('Por favor, preencha todos os campos.', 'error');
            return;
        }

        // Validação de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage('Por favor, insira um e-mail válido.', 'error');
            return;
        }

        // Validação de senha
        if (password.length < 6) {
            showMessage('A senha deve ter pelo menos 6 caracteres.', 'error');
            return;
        }

        // Validação de confirmação de senha
        if (password !== confirmPassword) {
            showMessage('As senhas não coincidem.', 'error');
            return;
        }

        // Validação de nome de usuário
        if (username.length < 3) {
            showMessage('O nome de usuário deve ter pelo menos 3 caracteres.', 'error');
            return;
        }

        // Desabilitar botão durante o cadastro
        const submitButton = registerForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Criando conta...';

        try {
            console.log('🔐 Iniciando processo de cadastro...');
            console.log('👤 Nome:', name);
            console.log('👤 Usuário:', username);
            console.log('📧 E-mail:', email);
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
            console.log('🔍 register disponível:', typeof authManager.register === 'function');
            
            if (typeof authManager === 'undefined') {
                console.error('❌ AuthManager não está disponível após 1 segundo de espera');
                throw new Error('AuthManager não está disponível após 1 segundo de espera');
            }
            
            console.log('✅ Chamando authManager.register...');
            const result = await authManager.register(name, username, email, password);
            console.log('📋 Resultado do cadastro:', result);

            if (result.success) {
                showMessage(`Conta criada com sucesso! Bem-vindo, ${name}!`, 'success');
                try { showNotification(`Cadastro realizado com sucesso!`, 'success'); } catch {}

                // Redirecionar para login após cadastro bem-sucedido
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                showMessage(result.message || 'Erro no cadastro. Tente novamente.', 'error');

                // Limpar senhas em caso de erro
                passwordInput.value = '';
                confirmPasswordInput.value = '';
                passwordInput.focus();
            }
        } catch (error) {
            console.error('Erro no cadastro:', error);
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
    [nameInput, usernameInput, emailInput, passwordInput, confirmPasswordInput].forEach((input, index, array) => {
        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                if (index < array.length - 1) {
                    array[index + 1].focus();
                } else {
                    registerForm.dispatchEvent(new Event('submit'));
                }
            }
        });
    });

    // Adicionar efeito de foco nos campos
    [nameInput, usernameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => {
        input.addEventListener('focus', function () {
            this.parentElement.style.transform = 'scale(1.02)';
            this.parentElement.style.transition = 'transform 0.2s ease';
        });

        input.addEventListener('blur', function () {
            this.parentElement.style.transform = 'scale(1)';
        });
    });

    // Adicionar validação em tempo real
    nameInput.addEventListener('input', function () {
        this.style.borderColor = this.value.length > 0 ? 'var(--success-color)' : 'var(--border-color)';
    });

    usernameInput.addEventListener('input', function () {
        if (this.value.length >= 3) {
            this.style.borderColor = 'var(--success-color)';
        } else if (this.value.length > 0) {
            this.style.borderColor = 'var(--warning-color)';
        } else {
            this.style.borderColor = 'var(--border-color)';
        }
    });

    emailInput.addEventListener('input', function () {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(this.value)) {
            this.style.borderColor = 'var(--success-color)';
        } else if (this.value.length > 0) {
            this.style.borderColor = 'var(--warning-color)';
        } else {
            this.style.borderColor = 'var(--border-color)';
        }
    });

    passwordInput.addEventListener('input', function () {
        if (this.value.length >= 6) {
            this.style.borderColor = 'var(--success-color)';
        } else if (this.value.length > 0) {
            this.style.borderColor = 'var(--warning-color)';
        } else {
            this.style.borderColor = 'var(--border-color)';
        }
        
        // Verificar confirmação de senha em tempo real
        if (confirmPasswordInput.value.length > 0) {
            if (this.value === confirmPasswordInput.value) {
                confirmPasswordInput.style.borderColor = 'var(--success-color)';
            } else {
                confirmPasswordInput.style.borderColor = 'var(--error-color)';
            }
        }
    });

    confirmPasswordInput.addEventListener('input', function () {
        if (this.value === passwordInput.value && this.value.length > 0) {
            this.style.borderColor = 'var(--success-color)';
        } else if (this.value.length > 0) {
            this.style.borderColor = 'var(--error-color)';
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
