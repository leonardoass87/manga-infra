// Script principal para a página inicial
document.addEventListener('DOMContentLoaded', function() {
    loadLatestMangas();
    loadCatalogMangas();
    setupScrollEffects();
    setupLancamentosLink();
    setupMobileMenu();
    setupCatalogFilters();
});

// Configurar menu mobile
function setupMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navList = document.querySelector('.nav-list');
    
    if (mobileToggle && navList) {
        mobileToggle.addEventListener('click', function() {
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
        document.addEventListener('click', function(e) {
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

// Carregar últimos lançamentos
async function loadLatestMangas() {
    const releasesSlider = document.getElementById('releases-slider');
    
    if (!releasesSlider) return;

    try {
        const response = await fetch(`${API_BASE_URL}/mangas/latest?limit=10`);
        
        if (!response.ok) {
            throw new Error('Erro ao carregar mangás');
        }

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Erro ao carregar mangás');
        }

        const latestMangas = data.data;
        
        // Limpar loading
        releasesSlider.innerHTML = '';

        if (latestMangas.length === 0) {
            releasesSlider.innerHTML = '<div class="no-results">Nenhum lançamento encontrado.</div>';
            return;
        }

        // Renderizar mangás no slider
        latestMangas.forEach((manga, index) => {
            const mangaCard = createMangaCard(manga);
            mangaCard.style.animationDelay = `${index * 0.1}s`;
            releasesSlider.appendChild(mangaCard);
        });

        // Inicializar slider
        initReleasesSlider(latestMangas.length);

    } catch (error) {
        console.error('Erro ao carregar últimos lançamentos:', error);
        releasesSlider.innerHTML = `
            <div class="error-message" style="
                text-align: center;
                padding: 2rem;
                color: var(--error-color);
                background-color: rgba(239, 68, 68, 0.1);
                border-radius: 8px;
                border: 1px solid var(--error-color);
            ">
                Erro ao carregar os últimos lançamentos. Tente novamente mais tarde.
            </div>
        `;
    }
}

// Criar card de mangá
function createMangaCard(manga) {
    const card = document.createElement('div');
    card.className = 'manga-card';
    card.setAttribute('data-manga-id', manga.id);
    
    // Corrigir URL da imagem para usar SERVER_BASE_URL
    let coverSrc = manga.cover;
    if (manga.cover && manga.cover.startsWith('/uploads/')) {
        coverSrc = window.SERVER_BASE_URL + manga.cover;
    }
    
    card.innerHTML = `
        <img src="${coverSrc}" alt="${manga.title}" class="manga-cover" loading="lazy">
        <div class="manga-info">
            <h3 class="manga-title">${manga.title}</h3>
            <p class="manga-description">${manga.description}</p>
            <div class="manga-meta">
                <span class="manga-chapters">${manga.chapters ? manga.chapters.length : 0} capítulos</span>
                <span class="manga-status ${manga.status === 'Em andamento' ? 'status-ongoing' : 'status-completed'}">
                    ${manga.status}
                </span>
            </div>
        </div>
    `;

    // Adicionar evento de clique
    card.addEventListener('click', () => {
        showMangaDetails(manga);
    });

    // Adicionar efeito hover
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px) scale(1.02)';
    });

    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });

    return card;
}

// Inicializar slider de lançamentos
function initReleasesSlider(totalItems) {
    const slider = document.getElementById('releases-slider');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const dotsContainer = document.getElementById('slider-dots');
    
    if (!slider || !prevBtn || !nextBtn || !dotsContainer) return;

    let currentIndex = 0;
    const itemsPerView = getItemsPerView();
    const maxIndex = Math.max(0, totalItems - itemsPerView);

    // Criar dots
    const totalDots = Math.ceil(totalItems / itemsPerView);
    dotsContainer.innerHTML = '';
    
    for (let i = 0; i < totalDots; i++) {
        const dot = document.createElement('button');
        dot.className = 'slider-dot';
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }

    // Função para obter quantos itens cabem na tela
    function getItemsPerView() {
        const width = window.innerWidth;
        if (width <= 480) return 1;
        if (width <= 768) return 2;
        if (width <= 1024) return 3;
        return 4;
    }

    // Função para ir para um slide específico
    function goToSlide(index) {
        currentIndex = Math.max(0, Math.min(index, maxIndex));
        updateSlider();
    }

    // Função para atualizar o slider
    function updateSlider() {
        const cardWidth = 280 + 16; // largura do card + gap
        const translateX = -currentIndex * cardWidth;
        slider.style.transform = `translateX(${translateX}px)`;

        // Atualizar botões
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= maxIndex;

        // Atualizar dots
        const dots = dotsContainer.querySelectorAll('.slider-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === Math.floor(currentIndex / itemsPerView));
        });
    }

    // Event listeners
    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex = Math.max(0, currentIndex - 1); // Avança 1 item por vez
            updateSlider();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentIndex < maxIndex) {
            currentIndex = Math.min(maxIndex, currentIndex + 1); // Avança 1 item por vez
            updateSlider();
        }
    });

    // Auto-play contínuo
    let autoPlayInterval;
    function startAutoPlay() {
        autoPlayInterval = setInterval(() => {
            if (currentIndex >= maxIndex) {
                currentIndex = 0;
            } else {
                currentIndex = Math.min(maxIndex, currentIndex + 1); // Avança 1 item por vez
            }
            updateSlider();
        }, 3000); // Reduzido para 3 segundos
    }

    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
        }
    }

    // Pausar auto-play ao interagir
    slider.addEventListener('mouseenter', stopAutoPlay);
    slider.addEventListener('mouseleave', startAutoPlay);
    prevBtn.addEventListener('mouseenter', stopAutoPlay);
    nextBtn.addEventListener('mouseenter', stopAutoPlay);

    // Iniciar auto-play
    startAutoPlay();

    // Atualizar ao redimensionar a janela
    window.addEventListener('resize', () => {
        const newItemsPerView = getItemsPerView();
        if (newItemsPerView !== itemsPerView) {
            // Recalcular maxIndex com o novo itemsPerView
            const newMaxIndex = Math.max(0, totalItems - newItemsPerView);
            currentIndex = Math.min(currentIndex, newMaxIndex);
            updateSlider();
        }
    });

    // Inicializar
    updateSlider();
}

// Mostrar detalhes do mangá (modal simples)
function showMangaDetails(manga) {
    // Criar modal se não existir
    let modal = document.getElementById('manga-details-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'manga-details-modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }

    // Corrigir URL da imagem para o modal
    let modalCoverSrc = manga.cover;
    if (manga.cover && manga.cover.startsWith('/uploads/')) {
        modalCoverSrc = window.SERVER_BASE_URL + manga.cover;
    }

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${manga.title}</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="modal-manga-info">
                    <img src="${modalCoverSrc}" alt="${manga.title}" class="modal-cover">
                    <div class="modal-details">
                        <p>${manga.description}</p>
                        <div class="modal-stats">
                            <div class="stat-item">
                                <strong>Capítulos:</strong> <span>${manga.chapters}</span>
                            </div>
                            <div class="stat-item">
                                <strong>Status:</strong> <span>${manga.status}</span>
                            </div>
                        </div>
                        <div class="modal-actions">
                            <button class="btn btn-primary" onclick="startReading(${manga.id})">
                                Começar a Ler
                            </button>
                            ${authManager.isLoggedIn() ? `
                                <button class="btn btn-secondary" onclick="addToFavorites(${manga.id})">
                                    Adicionar aos Favoritos
                                </button>
                            ` : `
                                <a href="login.html" class="btn btn-secondary">
                                    Login para Favoritar
                                </a>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Mostrar modal
    modal.style.display = 'block';

    // Adicionar eventos
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Fechar com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    });
}

// Função para começar a ler (placeholder)
function startReading(mangaId) {
    // Redirecionar para página de detalhes do mangá
    window.location.href = `manga-detail.html?id=${mangaId}`;
}

// Função para adicionar aos favoritos (placeholder)
function addToFavorites(mangaId) {
    if (!authManager.isLoggedIn()) {
        showNotification('Faça login para adicionar aos favoritos!', 'error');
        return;
    }
    
    showNotification('Mangá adicionado aos favoritos!', 'success');
    console.log('Adicionando aos favoritos:', mangaId);
}

// Configurar efeitos de scroll
function setupScrollEffects() {
    // Parallax effect no hero
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            hero.style.transform = `translateY(${rate}px)`;
        });
    }

    // Animação de entrada dos elementos
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observar elementos para animação
    const animatedElements = document.querySelectorAll('.feature-card, .section-title');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Configurar link de lançamentos
function setupLancamentosLink() {
    const lancamentosLink = document.getElementById('lancamentos-link');
    if (lancamentosLink) {
        lancamentosLink.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Scroll suave para a seção de lançamentos
            const latestSection = document.getElementById('latest');
            if (latestSection) {
                latestSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
}

// Função utilitária para smooth scroll
function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Adicionar efeito de loading nas imagens
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
        
        img.addEventListener('error', function() {
            this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDMwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMUYyOTM3Ii8+CjxwYXRoIGQ9Ik0xNTAgMTUwTDE3NSAxMjVMMjAwIDE1MEwxNzUgMTc1TDE1MCAxNTBaIiBmaWxsPSIjREM2MjI2Ii8+CjxwYXRoIGQ9Ik0xMjUgMjAwSDE3NVYyMjVIMTI1VjIwMFoiIGZpbGw9IiNEQzYyMjYiLz4KPHR5cGUgZm9udC1mYW1pbHk9IkludGVyIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOUNBM0FGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiB4PSIxNTAiIHk9IjI3MCI+SW1hZ2VtIG7Do28gZW5jb250cmFkYTwvdGV4dD4KPC9zdmc+';
            this.alt = 'Imagem não encontrada';
        });
    });
});

// Adicionar funcionalidade de busca rápida (se houver campo de busca)
const quickSearch = document.querySelector('.quick-search');
if (quickSearch) {
    let searchTimeout;
    
    quickSearch.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = this.value.trim();
            if (query.length > 2) {
                performQuickSearch(query);
            }
        }, 300);
    });
}

// Função de busca rápida (placeholder)
function performQuickSearch(query) {
    console.log('Buscando por:', query);
    // Implementar busca rápida aqui
}

// Variáveis globais para o catálogo
let allMangas = [];
let filteredMangas = [];
let currentPage = 1;
const itemsPerPage = 16; // 4x4 grid

// Carregar mangás do catálogo
async function loadCatalogMangas() {
    const catalogGrid = document.getElementById('catalog-grid');
    
    if (!catalogGrid) return;

    try {
        const response = await fetch(`${API_BASE_URL}/mangas`);
        
        if (!response.ok) {
            throw new Error('Erro ao carregar mangás');
        }

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Erro ao carregar mangás');
        }

        allMangas = data.data;
        filteredMangas = [...allMangas];
        
        // Limpar loading
        catalogGrid.innerHTML = '';

        if (allMangas.length === 0) {
            catalogGrid.innerHTML = '<div class="no-results">Nenhum mangá encontrado.</div>';
            return;
        }

        // Renderizar primeira página
        renderCatalogPage(1);

    } catch (error) {
        console.error('Erro ao carregar catálogo:', error);
        catalogGrid.innerHTML = `
            <div class="error-message" style="
                text-align: center;
                padding: 2rem;
                color: var(--error-color);
                background-color: rgba(239, 68, 68, 0.1);
                border-radius: 8px;
                border: 1px solid var(--error-color);
            ">
                Erro ao carregar o catálogo. Tente novamente mais tarde.
            </div>
        `;
    }
}

// Renderizar página do catálogo
function renderCatalogPage(page) {
    const catalogGrid = document.getElementById('catalog-grid');
    const paginationContainer = document.getElementById('pagination-container');
    
    if (!catalogGrid || !paginationContainer) return;

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageMangas = filteredMangas.slice(startIndex, endIndex);

    // Limpar grid
    catalogGrid.innerHTML = '';

    if (pageMangas.length === 0) {
        catalogGrid.innerHTML = '<div class="no-results">Nenhum mangá encontrado.</div>';
        return;
    }

    // Renderizar mangás da página
    pageMangas.forEach((manga, index) => {
        const mangaCard = createCatalogMangaCard(manga);
        mangaCard.style.animationDelay = `${index * 0.1}s`;
        catalogGrid.appendChild(mangaCard);
    });

    // Renderizar paginação
    renderPagination(page);
}

// Criar card de mangá para o catálogo
function createCatalogMangaCard(manga) {
    const card = document.createElement('div');
    card.className = 'manga-card';
    card.setAttribute('data-manga-id', manga.id);
    
    // Corrigir URL da imagem
    let coverSrc = manga.cover;
    if (manga.cover && manga.cover.startsWith('/uploads/')) {
        coverSrc = window.SERVER_BASE_URL + manga.cover;
    }
    
    const statusClass = getStatusClass(manga.status);
    
    card.innerHTML = `
        <img src="${coverSrc}" alt="${manga.title}" class="manga-cover" loading="lazy">
        <div class="manga-info">
            <h3 class="manga-title">${manga.title}</h3>
            <p class="manga-description">${manga.description}</p>
            <div class="manga-meta">
                <span class="manga-chapters">${manga.chapters ? manga.chapters.length : 0} capítulos</span>
                <span class="manga-status ${statusClass}">${manga.status}</span>
            </div>
        </div>
    `;

    // Adicionar evento de clique
    card.addEventListener('click', () => {
        showMangaDetails(manga);
    });

    // Adicionar efeito hover
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px) scale(1.02)';
    });

    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });

    return card;
}

// Obter classe de status
function getStatusClass(status) {
    switch ((status || '').toLowerCase()) {
        case 'em andamento': return 'status-ongoing';
        case 'finalizado': return 'status-completed';
        case 'pausado': return 'status-paused';
        default: return 'status-ongoing';
    }
}

// Renderizar paginação
function renderPagination(currentPageNum) {
    const paginationContainer = document.getElementById('pagination-container');
    if (!paginationContainer) return;

    const totalPages = Math.ceil(filteredMangas.length / itemsPerPage);
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let paginationHTML = '';
    
    // Botão anterior
    paginationHTML += `
        <button class="pagination-btn" ${currentPageNum === 1 ? 'disabled' : ''} onclick="goToPage(${currentPageNum - 1})">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;

    // Números das páginas
    const startPage = Math.max(1, currentPageNum - 2);
    const endPage = Math.min(totalPages, currentPageNum + 2);

    if (startPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="goToPage(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span class="pagination-info">...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="pagination-btn ${i === currentPageNum ? 'active' : ''}" onclick="goToPage(${i})">
                ${i}
            </button>
        `;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="pagination-info">...</span>`;
        }
        paginationHTML += `<button class="pagination-btn" onclick="goToPage(${totalPages})">${totalPages}</button>`;
    }

    // Botão próximo
    paginationHTML += `
        <button class="pagination-btn" ${currentPageNum === totalPages ? 'disabled' : ''} onclick="goToPage(${currentPageNum + 1})">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;

    // Informações da página
    const startItem = (currentPageNum - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPageNum * itemsPerPage, filteredMangas.length);
    
    paginationHTML += `
        <div class="pagination-info">
            Mostrando ${startItem}-${endItem} de ${filteredMangas.length} mangás
        </div>
    `;

    paginationContainer.innerHTML = paginationHTML;
}

// Ir para página específica
function goToPage(page) {
    const totalPages = Math.ceil(filteredMangas.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderCatalogPage(page);
    
    // Scroll suave para o topo do catálogo
    const catalogSection = document.getElementById('catalog');
    if (catalogSection) {
        catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Configurar filtros do catálogo
function setupCatalogFilters() {
    const statusFilter = document.getElementById('status-filter');
    const sortFilter = document.getElementById('sort-filter');
    const searchInput = document.getElementById('catalog-search');
    const searchBtn = document.getElementById('search-btn');

    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }

    if (sortFilter) {
        sortFilter.addEventListener('change', applyFilters);
    }

    if (searchInput) {
        searchInput.addEventListener('input', debounce(applyFilters, 300));
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', applyFilters);
    }
}

// Aplicar filtros
function applyFilters() {
    const statusFilter = document.getElementById('status-filter');
    const sortFilter = document.getElementById('sort-filter');
    const searchInput = document.getElementById('catalog-search');

    const status = statusFilter ? statusFilter.value : '';
    const sort = sortFilter ? sortFilter.value : 'newest';
    const search = searchInput ? searchInput.value.toLowerCase() : '';

    // Filtrar por status
    let filtered = allMangas.filter(manga => {
        if (status && manga.status !== status) return false;
        return true;
    });

    // Filtrar por busca
    if (search) {
        filtered = filtered.filter(manga => 
            manga.title.toLowerCase().includes(search) ||
            manga.description.toLowerCase().includes(search)
        );
    }

    // Ordenar
    switch (sort) {
        case 'newest':
            filtered.sort((a, b) => b.id - a.id);
            break;
        case 'oldest':
            filtered.sort((a, b) => a.id - b.id);
            break;
        case 'title':
            filtered.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'chapters':
            filtered.sort((a, b) => (b.chapters ? b.chapters.length : 0) - (a.chapters ? a.chapters.length : 0));
            break;
    }

    filteredMangas = filtered;
    currentPage = 1;
    renderCatalogPage(1);
}

// Função debounce para busca
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}