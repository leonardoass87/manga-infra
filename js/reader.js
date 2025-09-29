// Script para página de leitura do mangá
// Configurar API_BASE_URL se não estiver definido
if (!window.API_BASE_URL) {
    window.API_BASE_URL = 'http://localhost:4000/api';
}

// Variáveis globais
let currentManga = null;
let currentChapter = null;
let chapters = [];
let currentPage = 0;
let totalPages = 0;
let zoomLevel = 1;
let fitMode = 'width'; // 'width', 'height', 'original'

// Mobile enhancements
let isMobile = window.innerWidth <= 768;
let progressBar = null;
let backToTopBtn = null;
let simpleMobileNav = null; // Navegação simples com tema premium

// Elementos DOM
let readerContent, mangaTitle, chapterTitle, chapterSelect, prevBtn, nextBtn;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM Content Loaded - Inicializando leitor...');
    initializeReader();
    initializeNavigation();
    initializeAuth();
    initializeMobileFeatures();
    
    // Garantir que o botão back-to-top seja inicializado mesmo se não for mobile
    setTimeout(() => {
        console.log('🔍 Verificando botão back-to-top após inicialização...');
        const backToTopBtn = document.getElementById('backToTop');
        console.log('⬆️ backToTopBtn encontrado:', backToTopBtn);
        
        if (backToTopBtn) {
            console.log('✅ Botão back-to-top encontrado, configurando scroll tracking...');
            setupScrollTracking();
            
            // Teste: mostrar o botão temporariamente para verificar se está funcionando
            console.log('🧪 Teste: mostrando botão por 3 segundos...');
            backToTopBtn.classList.add('visible');
            setTimeout(() => {
                console.log('🧪 Teste: escondendo botão...');
                backToTopBtn.classList.remove('visible');
            }, 3000);
        } else {
            console.log('❌ Botão back-to-top NÃO encontrado!');
        }
    }, 1000);
});

// Inicializar leitor
function initializeReader() {
    // Obter elementos DOM
    readerContent = document.getElementById('reader-content');
    mangaTitle = document.getElementById('manga-title');
    chapterTitle = document.getElementById('chapter-title');
    chapterSelect = document.getElementById('chapter-select');
    prevBtn = document.getElementById('prev-chapter');
    nextBtn = document.getElementById('next-chapter');

    // Obter parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    const mangaId = urlParams.get('manga');
    const chapterNumber = urlParams.get('chapter');

    if (!mangaId) {
        showError('ID do mangá não fornecido');
        return;
    }

    // Carregar dados
    loadMangaData(mangaId, chapterNumber);
    
    // Configurar event listeners
    setupEventListeners();
}

// Carregar dados do mangá
async function loadMangaData(mangaId, chapterNumber) {
    try {
        showLoading();
        
        // Carregar dados do mangá
        const mangaResponse = await fetch(`${API_BASE_URL}/mangas/${mangaId}`);
        if (!mangaResponse.ok) {
            throw new Error('Mangá não encontrado');
        }
        const mangaData = await mangaResponse.json();
        if (!mangaData.success) {
            throw new Error(mangaData.message || 'Erro ao carregar mangá');
        }
        currentManga = mangaData.data;

        // Carregar capítulos
        const chaptersResponse = await fetch(`${API_BASE_URL}/chapters/manga/${mangaId}`);
        if (!chaptersResponse.ok) {
            throw new Error('Capítulos não encontrados');
        }
        const chaptersData = await chaptersResponse.json();
        if (!chaptersData.success) {
            throw new Error(chaptersData.message || 'Erro ao carregar capítulos');
        }
        chapters = chaptersData.data;
        console.log('Capítulos carregados:', chapters);

        // Encontrar capítulo atual
        if (chapterNumber) {
            currentChapter = chapters.find(ch => ch.number === parseInt(chapterNumber));
        } else {
            currentChapter = chapters[0]; // Primeiro capítulo
        }

        if (!currentChapter) {
            throw new Error('Capítulo não encontrado');
        }

        console.log('Capítulo atual:', currentChapter);
        console.log('Dados do mangá:', currentManga);

        // Atualizar interface
        updateMangaInfo();
        updateChapterSelector();
        loadChapterPages();

    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showError('Erro ao carregar o mangá: ' + error.message);
    }
}

// Atualizar informações do mangá
function updateMangaInfo() {
    mangaTitle.textContent = currentManga.title;
    chapterTitle.textContent = `Capítulo ${currentChapter.number}`;
    document.title = `${currentManga.title} - Capítulo ${currentChapter.number} - SiteManga`;
}

// Atualizar seletor de capítulos
function updateChapterSelector() {
    chapterSelect.innerHTML = '<option value="">Selecionar Capítulo</option>';
    
    chapters.forEach(chapter => {
        const option = document.createElement('option');
        option.value = chapter.number;
        option.textContent = `Capítulo ${chapter.number}`;
        if (chapter.number === currentChapter.number) {
            option.selected = true;
        }
        chapterSelect.appendChild(option);
    });

    // Atualizar botões de navegação
    const currentIndex = chapters.findIndex(ch => ch.number === currentChapter.number);
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === chapters.length - 1;
}

// Carregar páginas do capítulo
async function loadChapterPages() {
    try {
        showLoading();
        
        // Tentar carregar páginas da API primeiro
        try {
            const response = await fetch(`${API_BASE_URL}/chapters/manga/${currentManga.id}/${currentChapter.number}/pages`);
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    const pages = data.data.pages || [];
                    console.log('Páginas carregadas da API:', pages);
                    totalPages = pages.length;
                    currentPage = 0;

                    if (totalPages > 0) {
                        renderRealPages(pages);
                    } else {
                        // Se não há páginas, mostrar placeholder
                        totalPages = 1;
                        renderMockPages();
                    }
                } else {
                    throw new Error(data.message || 'Erro ao carregar páginas');
                }
            } else {
                throw new Error(`API retornou status ${response.status}`);
            }
        } catch (apiError) {
            console.log('Erro na API, usando dados do mangá:', apiError.message);
            
            // Fallback: usar dados do mangá diretamente
            const pages = currentChapter.pages || [];
            console.log('Páginas do capítulo (fallback):', pages);
            totalPages = pages.length;
            currentPage = 0;

            if (totalPages === 0) {
                console.log('Nenhuma página encontrada, usando mock');
                // Simular páginas para demonstração
                totalPages = 5;
                renderMockPages();
            } else {
                console.log('Renderizando páginas reais:', totalPages);
                renderRealPages(pages);
            }
        }

        hideLoading();
        updatePageInfo();

    } catch (error) {
        console.error('Erro ao carregar páginas:', error);
        showError('Erro ao carregar as páginas do capítulo');
    }
}

// Renderizar páginas mock (para demonstração)
function renderMockPages() {
    readerContent.innerHTML = '';
    
    for (let i = 0; i < totalPages; i++) {
        const pageDiv = document.createElement('div');
        pageDiv.className = 'reader-page';
        pageDiv.innerHTML = `
            <div class="page-placeholder">
                <i class="fas fa-image"></i>
                <p>Página ${i + 1}</p>
                <small>Conteúdo do capítulo será carregado aqui</small>
            </div>
        `;
        readerContent.appendChild(pageDiv);
    }
}

// Renderizar páginas reais
function renderRealPages(pages) {
    readerContent.innerHTML = '';
    
    pages.forEach((page, index) => {
        const pageDiv = document.createElement('div');
        pageDiv.className = 'reader-page';
        
        // Verificar se a página tem URL ou é um caminho
        let pageUrl = page.url || page;
        if (pageUrl && !pageUrl.startsWith('http')) {
            // Se for um caminho relativo, adicionar SERVER_BASE_URL
            if (pageUrl.startsWith('/uploads/')) {
                pageUrl = window.SERVER_BASE_URL + pageUrl;
            } else {
                pageUrl = window.SERVER_BASE_URL + '/uploads/' + pageUrl;
            }
        }
        
        pageDiv.innerHTML = `
            <img src="${pageUrl}" alt="Página ${index + 1}" class="page-image" loading="lazy"
                 onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDgwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjMUYyOTM3Ii8+CjxwYXRoIGQ9Ik00MDAgMzAwTDUwMCAyMDBMNjAwIDMwMEw1MDAgNDAwTDQwMCAzMDBaIiBmaWxsPSIjREM2MjI2Ii8+CjxwYXRoIGQ9Ik0zMDAgNDAwSDUwMFY1MDBIMzAwVjQwMFoiIGZpbGw9IiNEQzYyMjYiLz4KPHR5cGUgZm9udC1mYW1pbHk9IkludGVyIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOUNBM0FGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiB4PSI0MDAiIHk9IjU1MCI+SW1hZ2VtIG7Do28gZW5jb250cmFkYTwvdGV4dD4KPC9zdmc+';">
        `;
        readerContent.appendChild(pageDiv);
    });
}

// Atualizar informações da página
function updatePageInfo() {
    const pageInfo = document.getElementById('page-info');
    if (pageInfo) {
        pageInfo.textContent = `${currentPage + 1} de ${totalPages}`;
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Navegação de capítulos
    prevBtn.addEventListener('click', () => navigateChapter(-1));
    nextBtn.addEventListener('click', () => navigateChapter(1));
    chapterSelect.addEventListener('change', (e) => {
        const chapterNumber = parseInt(e.target.value);
        if (chapterNumber) {
            goToChapter(chapterNumber);
        }
    });

    // Voltar ao mangá
    document.getElementById('back-to-manga').addEventListener('click', () => {
        window.location.href = `manga-detail.html?id=${currentManga.id}`;
    });

    // Atalhos de teclado
    document.addEventListener('keydown', handleKeyboard);
}

// Navegar entre capítulos
function navigateChapter(direction) {
    const currentIndex = chapters.findIndex(ch => ch.number === currentChapter.number);
    const newIndex = currentIndex + direction;
    
    if (newIndex >= 0 && newIndex < chapters.length) {
        const newChapter = chapters[newIndex];
        goToChapter(newChapter.number);
    }
}

// Ir para capítulo específico
function goToChapter(chapterNumber) {
    const chapter = chapters.find(ch => ch.number === chapterNumber);
    if (chapter) {
        currentChapter = chapter;
        currentPage = 0;
        updateMangaInfo();
        updateChapterSelector();
        loadChapterPages();
    }
}

// Funções de zoom e ajuste removidas para simplificar

// Manipular teclado
function handleKeyboard(e) {
    switch(e.key) {
        case 'ArrowLeft':
            navigateChapter(-1);
            break;
        case 'ArrowRight':
            navigateChapter(1);
            break;
        case 'Escape':
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
            break;
    }
}

// Mostrar loading
function showLoading() {
    document.getElementById('loading-overlay').style.display = 'flex';
}

// Esconder loading
function hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
}

// Mostrar erro
function showError(message) {
    document.getElementById('error-message').textContent = message;
    document.getElementById('error-modal').style.display = 'flex';
}

// Esconder erro
function hideError() {
    document.getElementById('error-modal').style.display = 'none';
}

// Inicializar navegação mobile
function initializeNavigation() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navList = document.querySelector('.nav-list');
    
    if (mobileMenuToggle && navList) {
        mobileMenuToggle.addEventListener('click', function() {
            navList.classList.toggle('active');
        });
        
        // Fechar menu ao clicar em um link
        const navLinks = navList.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navList.classList.remove('active');
            });
        });
        
        // Fechar menu ao clicar fora
        document.addEventListener('click', function(e) {
            if (!mobileMenuToggle.contains(e.target) && !navList.contains(e.target)) {
                navList.classList.remove('active');
            }
        });
    }
}

// Inicializar autenticação
function initializeAuth() {
    // Aguardar um pouco para o authManager ser inicializado
    setTimeout(() => {
        console.log('Verificando autenticação...');
        console.log('AuthManager disponível:', !!window.authManager);
        
        if (window.authManager) {
            const token = window.authManager.getToken();
            const user = window.authManager.getUser();
            const isLoggedIn = window.authManager.isLoggedIn();
            
            console.log('Token:', token);
            console.log('Usuário:', user);
            console.log('Logado:', isLoggedIn);
            
            // Verificar se o token existe no localStorage também
            const localToken = localStorage.getItem('token');
            const localUser = localStorage.getItem('user');
            console.log('Token no localStorage:', localToken);
            console.log('Usuário no localStorage:', localUser);
            
            if (isLoggedIn && token && user) {
                console.log('Usuário logado, atualizando navegação');
                updateNavForLoggedUser();
            } else {
                console.log('Usuário não logado, navegação para visitante');
                updateNavForGuest();
            }
        } else {
            console.log('AuthManager não disponível, usando navegação padrão');
            updateNavForGuest();
        }
    }, 100);
}

// Atualizar navegação para usuário logado
function updateNavForLoggedUser() {
    const navList = document.querySelector('.nav-list');
    if (navList) {
        navList.innerHTML = `
            <li><a href="index.html" class="nav-link">Início</a></li>
            <li><a href="catalogo.html" class="nav-link">Catálogo</a></li>
            <li><a href="admin.html" class="nav-link">Admin</a></li>
            <li><a href="#" class="nav-link" onclick="logout()">Sair</a></li>
        `;
    }
}

// Atualizar navegação para visitante
function updateNavForGuest() {
    const navList = document.querySelector('.nav-list');
    if (navList) {
        navList.innerHTML = `
            <li><a href="index.html" class="nav-link">Início</a></li>
            <li><a href="catalogo.html" class="nav-link">Catálogo</a></li>
            <li><a href="login.html" class="nav-link">Login</a></li>
        `;
    }
}

// Função de logout
function logout() {
    console.log('Tentando fazer logout...');
    if (window.authManager) {
        console.log('AuthManager encontrado, fazendo logout');
        window.authManager.logout();
        updateNavForGuest();
        showNotification('Logout realizado com sucesso!', 'success');
    } else {
        console.log('AuthManager não encontrado');
        // Fallback: limpar localStorage manualmente
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        updateNavForGuest();
        showNotification('Logout realizado com sucesso!', 'success');
    }
}

// Função de notificação
function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        font-weight: 500;
        max-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    // Adicionar ao body
    document.body.appendChild(notification);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Adicionar estilos de animação
function addNotificationStyles() {
    // Verificar se os estilos já foram adicionados
    if (document.getElementById('notification-styles')) return;
    
    const notificationStyle = document.createElement('style');
    notificationStyle.id = 'notification-styles';
    notificationStyle.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(notificationStyle);
}

// ===== SIMPLE MOBILE ENHANCEMENTS =====

// Inicializar funcionalidades mobile simples
function initializeMobileFeatures() {
    console.log('🔍 Inicializando funcionalidades mobile...');
    console.log('📱 isMobile:', isMobile);
    console.log('📱 window.innerWidth:', window.innerWidth);
    
    // Obter elementos mobile
    progressBar = document.querySelector('.reader-progress-bar');
    backToTopBtn = document.getElementById('backToTop');
    simpleMobileNav = document.getElementById('simpleMobileNav'); // Navegação simples com tema premium
    
    console.log('🔍 Elementos encontrados:');
    console.log('📊 progressBar:', progressBar);
    console.log('⬆️ backToTopBtn:', backToTopBtn);
    console.log('📱 simpleMobileNav:', simpleMobileNav);
    
    // Configurar event listeners sempre (não apenas em mobile)
    setupSimpleMobileEvents();
    setupProgressTracking();
    setupScrollTracking();
    
    // Navegação mobile apenas em mobile
    if (isMobile) {
        setupSimpleNavigation();
    }
    
    console.log('📱 Funcionalidades mobile simples inicializadas');
}

// Configurar eventos mobile simples
function setupSimpleMobileEvents() {
    // Back to top
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', scrollToTop);
    }
    
    // Simple navigation (tema premium)
    const prevBtn = document.getElementById('simplePrevChapter');
    const nextBtn = document.getElementById('simpleNextChapter');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => goToPreviousPage());
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => goToNextPage());
    }
}

// Configurar tracking de progresso
function setupProgressTracking() {
    if (!progressBar) return;
    
    window.addEventListener('scroll', updateProgressBar);
    window.addEventListener('resize', updateProgressBar);
}

// Atualizar barra de progresso
function updateProgressBar() {
    if (!progressBar) return;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / scrollHeight) * 100;
    
    // Atualizar largura com animação suave
    progressBar.style.width = Math.min(scrollPercent, 100) + '%';
    
    // Atualizar indicador de progresso
    const progressIndicator = document.getElementById('progressIndicator');
    if (progressIndicator) {
        const roundedPercent = Math.round(scrollPercent);
        progressIndicator.textContent = roundedPercent + '%';
        
        // Mostrar indicador quando começar a rolar
        if (scrollPercent > 5) {
            progressIndicator.classList.add('show');
        } else {
            progressIndicator.classList.remove('show');
        }
    }
    
    // Efeito especial aos 70%
    if (scrollPercent >= 70 && !progressBar.classList.contains('milestone-reached')) {
        console.log('🎯 Marco de 70% atingido na barra de progresso!');
        progressBar.classList.add('milestone');
        progressBar.classList.add('milestone-reached');
        
        // Efeito no indicador
        if (progressIndicator) {
            progressIndicator.classList.add('milestone');
            setTimeout(() => {
                progressIndicator.classList.remove('milestone');
            }, 600);
        }
        
        // Remover animação após completar
        setTimeout(() => {
            progressBar.classList.remove('milestone');
        }, 800);
    }
    
    // Efeito especial aos 50%
    if (scrollPercent >= 50 && !progressBar.classList.contains('halfway-reached')) {
        console.log('🎯 Marco de 50% atingido na barra de progresso!');
        progressBar.classList.add('halfway-reached');
        
        // Adicionar efeito de brilho
        progressBar.style.boxShadow = `
            0 0 15px rgba(220, 38, 38, 0.7),
            0 0 25px rgba(220, 38, 38, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.3)
        `;
    }
    
    // Efeito especial aos 90%
    if (scrollPercent >= 90 && !progressBar.classList.contains('almost-done')) {
        console.log('🎯 Marco de 90% atingido na barra de progresso!');
        progressBar.classList.add('almost-done');
        
        // Efeito de pulso contínuo
        progressBar.style.animation = 'progressGlow 1s ease-in-out infinite';
    }
    
    // Reset para próxima leitura
    if (scrollPercent < 10) {
        progressBar.classList.remove('milestone-reached', 'halfway-reached', 'almost-done');
        progressBar.style.animation = '';
        progressBar.style.boxShadow = `
            0 0 12px rgba(220, 38, 38, 0.6),
            0 0 20px rgba(220, 38, 38, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2)
        `;
        
        if (progressIndicator) {
            progressIndicator.classList.remove('show', 'milestone');
        }
    }
}

// Configurar tracking de scroll
function setupScrollTracking() {
    console.log('🔍 Configurando scroll tracking...');
    console.log('⬆️ backToTopBtn:', backToTopBtn);
    
    if (!backToTopBtn) {
        console.log('❌ backToTopBtn não encontrado!');
        return;
    }
    
    let hasShownButton = false; // Para controlar se já mostrou o botão
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / scrollHeight) * 100;
        
        console.log('📊 Scroll:', {
            scrollTop,
            scrollHeight,
            scrollPercent: scrollPercent.toFixed(2) + '%',
            shouldShow: scrollPercent > 70
        });
        
        if (scrollPercent > 70) {
            console.log('✅ Mostrando botão back-to-top');
            backToTopBtn.classList.add('visible');
            
            // Adicionar animação de entrada suave apenas na primeira vez
            if (!hasShownButton) {
                hasShownButton = true;
                backToTopBtn.style.animation = 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                
                // Remover animação após completar
                setTimeout(() => {
                    backToTopBtn.style.animation = '';
                }, 600);
            }
        } else {
            console.log('❌ Escondendo botão back-to-top');
            backToTopBtn.classList.remove('visible');
            hasShownButton = false; // Reset para próxima vez
        }
    });
}

// Scroll para o topo
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Configurar navegação simples (tema premium)
function setupSimpleNavigation() {
    if (!simpleMobileNav) return;
    
    // Mostrar navegação quando chegar no final
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / scrollHeight) * 100;
        
        if (scrollPercent > 80) {
            simpleMobileNav.classList.add('visible');
        } else {
            simpleMobileNav.classList.remove('visible');
        }
    });
    
    // Atualizar estado dos botões
    updateSimpleNavigationButtons();
}

// Atualizar botões de navegação simples (tema premium)
function updateSimpleNavigationButtons() {
    if (!simpleMobileNav) return;
    
    const prevBtn = document.getElementById('simplePrevChapter');
    const nextBtn = document.getElementById('simpleNextChapter');
    
    if (prevBtn) {
        prevBtn.disabled = currentPage === 0;
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPages - 1;
    }
}

// Ir para página anterior
function goToPreviousPage() {
    if (currentPage > 0) {
        currentPage--;
        loadCurrentPage();
        updateSimpleNavigationButtons();
    }
}

// Ir para próxima página
function goToNextPage() {
    if (currentPage < totalPages - 1) {
        currentPage++;
        loadCurrentPage();
        updateSimpleNavigationButtons();
    } else {
        // Ir para próximo capítulo
        const currentChapterIndex = chapters.findIndex(ch => ch.id === currentChapter.id);
        if (currentChapterIndex < chapters.length - 1) {
            const nextChapter = chapters[currentChapterIndex + 1];
            loadChapter(nextChapter.number);
        }
    }
}

// Detectar mudanças de tamanho da tela
window.addEventListener('resize', () => {
    const wasMobile = isMobile;
    isMobile = window.innerWidth <= 768;
    
    if (isMobile && !wasMobile) {
        initializeMobileFeatures();
    }
});

// Inicializar estilos
addNotificationStyles();
