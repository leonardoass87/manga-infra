// Script para a página de catálogo
document.addEventListener('DOMContentLoaded', function() {
    let allMangas = [];
    let filteredMangas = [];
    let currentView = 'grid';

    // Elementos do DOM
    const catalogContainer = document.getElementById('manga-catalog');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const statusFilter = document.getElementById('status-filter');
    const sortFilter = document.getElementById('sort-filter');
    const resultsCount = document.getElementById('results-count');
    const viewButtons = document.querySelectorAll('.view-btn');

    // Inicializar página
    init();
    setupMobileMenu();

    async function init() {
        await loadAllMangas();
        setupEventListeners();
        setupLancamentosLink();
    }

    // Carregar todos os mangás
    async function loadAllMangas() {
        try {
            showLoading();
            
            const response = await fetch(`${API_BASE_URL}/mangas`);
            
            if (!response.ok) {
                throw new Error('Erro ao carregar mangás');
            }

            allMangas = await response.json();
            filteredMangas = [...allMangas];
            
            renderMangas();
            updateResultsCount();

        } catch (error) {
            console.error('Erro ao carregar mangás:', error);
            showError('Erro ao carregar o catálogo. Tente novamente mais tarde.');
        }
    }

    // Configurar event listeners
    function setupEventListeners() {
        // Busca
        searchInput.addEventListener('input', debounce(handleSearch, 300));
        searchBtn.addEventListener('click', handleSearch);
        
        // Filtros
        statusFilter.addEventListener('change', applyFilters);
        sortFilter.addEventListener('change', applyFilters);
        
        // Visualização
        viewButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.getAttribute('data-view');
                setView(view);
            });
        });

        // Enter na busca
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }

    // Configurar link de lançamentos
    function setupLancamentosLink() {
        const lancamentosLink = document.getElementById('lancamentos-link');
        if (lancamentosLink) {
            lancamentosLink.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Filtrar apenas lançamentos
                statusFilter.value = '';
                searchInput.value = '';
                
                filteredMangas = allMangas.filter(manga => manga.isLatest);
                renderMangas();
                updateResultsCount();
                
                showNotification('Mostrando apenas os últimos lançamentos!', 'info');
            });
        }
    }

    // Manipular busca
    function handleSearch() {
        applyFilters();
    }

    // Aplicar filtros
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const statusValue = statusFilter.value;
        const sortValue = sortFilter.value;

        // Filtrar mangás
        filteredMangas = allMangas.filter(manga => {
            const matchesSearch = !searchTerm || 
                manga.title.toLowerCase().includes(searchTerm) ||
                manga.description.toLowerCase().includes(searchTerm);
            
            const matchesStatus = !statusValue || manga.status === statusValue;

            return matchesSearch && matchesStatus;
        });

        // Ordenar mangás
        sortMangas(sortValue);
        
        // Renderizar
        renderMangas();
        updateResultsCount();
    }

    // Ordenar mangás
    function sortMangas(sortBy) {
        switch (sortBy) {
            case 'title':
                filteredMangas.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'chapters':
                filteredMangas.sort((a, b) => b.chapters - a.chapters);
                break;
            case 'status':
                filteredMangas.sort((a, b) => a.status.localeCompare(b.status));
                break;
            default:
                break;
        }
    }

    // Renderizar mangás
    function renderMangas() {
        if (!catalogContainer) return;

        catalogContainer.innerHTML = '';

        if (filteredMangas.length === 0) {
            showNoResults();
            return;
        }

        // Aplicar classe de visualização
        catalogContainer.className = `manga-catalog view-${currentView}`;

        // Renderizar cada mangá
        filteredMangas.forEach((manga, index) => {
            const mangaElement = createMangaElement(manga, index);
            catalogContainer.appendChild(mangaElement);
        });
    }

    // Criar elemento de mangá
    function createMangaElement(manga, index) {
        const element = document.createElement('div');
        element.className = 'manga-card';
        element.setAttribute('data-manga-id', manga.id);
        element.style.animationDelay = `${index * 0.05}s`;

        if (currentView === 'list') {
            element.innerHTML = `
                <div class="manga-list-item">
                    <img src="${manga.cover}" alt="${manga.title}" class="manga-cover-small" loading="lazy">
                    <div class="manga-list-info">
                        <h3 class="manga-title">${manga.title}</h3>
                        <p class="manga-description">${manga.description}</p>
                        <div class="manga-meta">
                            <span class="manga-chapters">${manga.chapters} capítulos</span>
                            <span class="manga-status ${manga.status === 'Em andamento' ? 'status-ongoing' : 'status-completed'}">
                                ${manga.status}
                            </span>
                        </div>
                    </div>
                    <div class="manga-actions">
                        <button class="btn btn-primary btn-small" onclick="startReading(${manga.id})">
                            Ler
                        </button>
                    </div>
                </div>
            `;
        } else {
            element.innerHTML = `
                <img src="${manga.cover}" alt="${manga.title}" class="manga-cover" loading="lazy">
                <div class="manga-info">
                    <h3 class="manga-title">${manga.title}</h3>
                    <p class="manga-description">${manga.description}</p>
                    <div class="manga-meta">
                        <span class="manga-chapters">${manga.chapters} capítulos</span>
                        <span class="manga-status ${manga.status === 'Em andamento' ? 'status-ongoing' : 'status-completed'}">
                            ${manga.status}
                        </span>
                    </div>
                </div>
            `;
        }

        // Adicionar eventos
        element.addEventListener('click', () => {
            showMangaModal(manga);
        });

        // Efeitos hover
        element.addEventListener('mouseenter', function() {
            if (currentView === 'grid') {
                this.style.transform = 'translateY(-8px) scale(1.02)';
            } else {
                this.style.backgroundColor = 'rgba(220, 38, 38, 0.05)';
            }
        });

        element.addEventListener('mouseleave', function() {
            if (currentView === 'grid') {
                this.style.transform = 'translateY(0) scale(1)';
            } else {
                this.style.backgroundColor = '';
            }
        });

        return element;
    }

    // Mostrar modal do mangá
    function showMangaModal(manga) {
        const modal = document.getElementById('manga-modal');
        if (!modal) return;

        // Preencher dados do modal
        document.getElementById('modal-title').textContent = manga.title;
        document.getElementById('modal-cover').src = manga.cover;
        document.getElementById('modal-cover').alt = manga.title;
        document.getElementById('modal-description').textContent = manga.description;
        document.getElementById('modal-chapters').textContent = manga.chapters;
        document.getElementById('modal-status').textContent = manga.status;

        // Mostrar modal
        modal.style.display = 'block';

        // Event listeners do modal
        const closeBtn = document.getElementById('modal-close');
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };

        // Fechar ao clicar fora
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        };
    }

    // Definir visualização
    function setView(view) {
        currentView = view;
        
        // Atualizar botões
        viewButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-view') === view) {
                btn.classList.add('active');
            }
        });

        // Re-renderizar
        renderMangas();
    }

    // Atualizar contador de resultados
    function updateResultsCount() {
        if (resultsCount) {
            const total = allMangas.length;
            const filtered = filteredMangas.length;
            
            if (filtered === total) {
                resultsCount.textContent = `${total} mangás encontrados`;
            } else {
                resultsCount.textContent = `${filtered} de ${total} mangás`;
            }
        }
    }

    // Mostrar loading
    function showLoading() {
        if (catalogContainer) {
            catalogContainer.innerHTML = `
                <div class="loading-container" style="
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 4rem;
                ">
                    <div class="loading-spinner" style="
                        width: 50px;
                        height: 50px;
                        border: 3px solid var(--border-color);
                        border-top: 3px solid var(--primary-color);
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 1rem;
                    "></div>
                    <p style="color: var(--text-secondary);">Carregando catálogo...</p>
                </div>
            `;
        }
    }

    // Mostrar erro
    function showError(message) {
        if (catalogContainer) {
            catalogContainer.innerHTML = `
                <div class="error-container" style="
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 4rem;
                    color: var(--error-color);
                    background-color: rgba(239, 68, 68, 0.1);
                    border-radius: 12px;
                    border: 1px solid var(--error-color);
                ">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                    <h3 style="margin-bottom: 1rem;">Ops! Algo deu errado</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()" style="margin-top: 1rem;">
                        Tentar Novamente
                    </button>
                </div>
            `;
        }
    }

    // Mostrar "nenhum resultado"
    function showNoResults() {
        if (catalogContainer) {
            catalogContainer.innerHTML = `
                <div class="no-results-container" style="
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 4rem;
                    color: var(--text-secondary);
                ">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">📚</div>
                    <h3 style="margin-bottom: 1rem; color: var(--text-primary);">Nenhum mangá encontrado</h3>
                    <p>Tente ajustar os filtros ou termos de busca.</p>
                    <button class="btn btn-outline" onclick="clearFilters()" style="margin-top: 1rem;">
                        Limpar Filtros
                    </button>
                </div>
            `;
        }
    }

    // Função global para limpar filtros
    window.clearFilters = function() {
        searchInput.value = '';
        statusFilter.value = '';
        sortFilter.value = 'title';
        applyFilters();
    };

    // Função global para começar leitura
    window.startReading = function(mangaId) {
        showNotification('Funcionalidade de leitura em desenvolvimento!', 'info');
        console.log('Iniciando leitura do mangá:', mangaId);
    };

    // Função utilitária debounce
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
});

// Adicionar estilos para visualização em lista e animações
const catalogStyles = document.createElement('style');
catalogStyles.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .manga-catalog.view-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .manga-catalog.view-list .manga-card {
        background-color: var(--card-bg);
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid var(--border-color);
        transition: all 0.3s ease;
    }

    .manga-list-item {
        display: grid;
        grid-template-columns: 120px 1fr auto;
        gap: 1.5rem;
        padding: 1.5rem;
        align-items: center;
    }

    .manga-cover-small {
        width: 100%;
        height: 160px;
        object-fit: cover;
        border-radius: 8px;
    }

    .manga-list-info {
        min-width: 0;
    }

    .manga-list-info .manga-title {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: var(--text-primary);
    }

    .manga-list-info .manga-description {
        color: var(--text-secondary);
        font-size: 0.9rem;
        line-height: 1.5;
        margin-bottom: 1rem;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .manga-actions {
        display: flex;
        gap: 0.5rem;
        flex-direction: column;
    }

    .btn-small {
        padding: 0.5rem 1rem;
        font-size: 0.85rem;
    }

    @media (max-width: 768px) {
        .manga-list-item {
            grid-template-columns: 80px 1fr;
            gap: 1rem;
        }

        .manga-actions {
            grid-column: 1 / -1;
            flex-direction: row;
            justify-content: center;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid var(--border-color);
        }

        .manga-cover-small {
            height: 120px;
        }
    }
`;
document.head.appendChild(catalogStyles);

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