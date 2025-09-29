// Script para página de detalhes do mangá
// Configurar API_BASE_URL se não estiver definido
if (!window.API_BASE_URL) {
    window.API_BASE_URL = 'http://localhost:4000/api';
}

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const mangaId = urlParams.get('id');
    
    if (!mangaId) {
        showError('ID do mangá não fornecido');
        return;
    }
    
    loadMangaDetail(mangaId);
    setupEventListeners();
});

// Carregar detalhes do mangá
async function loadMangaDetail(mangaId) {
    const loadingState = document.getElementById('loading-state');
    const mangaContent = document.getElementById('manga-detail-content');
    const errorState = document.getElementById('error-state');
    
    try {
        // Mostrar loading
        loadingState.style.display = 'block';
        mangaContent.style.display = 'none';
        errorState.style.display = 'none';
        
        const response = await fetch(`${API_BASE_URL}/mangas/${mangaId}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Mangá não encontrado');
            }
            throw new Error('Erro ao carregar mangá');
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Erro ao carregar mangá');
        }
        
        const manga = data.data;
        
        // Renderizar informações do mangá
        renderMangaInfo(manga, manga.views || 0);
        
        // Carregar capítulos
        await loadChapters(mangaId);
        
        // Carregar mangás similares
        await loadSimilarMangas(manga);
        
        // Esconder loading e mostrar conteúdo
        loadingState.style.display = 'none';
        mangaContent.style.display = 'block';
        
    } catch (error) {
        console.error('Erro ao carregar detalhes do mangá:', error);
        loadingState.style.display = 'none';
        errorState.style.display = 'block';
    }
}

// Renderizar informações do mangá
function renderMangaInfo(manga, views) {
    // Corrigir URL da imagem
    let coverSrc = manga.cover;
    if (manga.cover && manga.cover.startsWith('/uploads/')) {
        coverSrc = window.SERVER_BASE_URL + manga.cover;
    }
    
    document.getElementById('manga-cover').src = coverSrc;
    document.getElementById('manga-cover').alt = manga.title;
    document.getElementById('manga-title').textContent = manga.title;
    document.getElementById('manga-description').textContent = manga.description;
    document.getElementById('manga-chapters-count').textContent = manga.chapters ? manga.chapters.length : 0;
    document.getElementById('manga-views-count').textContent = views.toLocaleString();
    document.getElementById('manga-status-text').textContent = manga.status;
    
    // Status badge
    const statusBadge = document.getElementById('manga-status-badge');
    statusBadge.textContent = manga.status;
    statusBadge.className = `manga-status-badge ${getStatusClass(manga.status)}`;
    
    // Atualizar título da página
    document.title = `${manga.title} - SiteManga`;
}

// Carregar capítulos
async function loadChapters(mangaId) {
    const chaptersList = document.getElementById('chapters-list');
    
    try {
        const response = await fetch(`${API_BASE_URL}/chapters/manga/${mangaId}`);
        
        if (!response.ok) {
            throw new Error('Erro ao carregar capítulos');
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Erro ao carregar capítulos');
        }
        
        const chapters = data.data;
        
        if (chapters.length === 0) {
            chaptersList.innerHTML = '<div class="no-chapters">Nenhum capítulo disponível.</div>';
            return;
        }
        
        // Ordenar capítulos por número
        chapters.sort((a, b) => a.number - b.number);
        
        // Renderizar capítulos
        chaptersList.innerHTML = chapters.map(chapter => `
            <div class="chapter-item" data-chapter-id="${chapter.id}">
                <div class="chapter-info">
                    <h3 class="chapter-title">Capítulo ${chapter.number}</h3>
                    <div class="chapter-meta">
                        <span class="chapter-views">
                            <i class="fas fa-eye"></i>
                            ${chapter.views || 0} visualizações
                        </span>
                        <span class="chapter-date">
                            <i class="fas fa-calendar"></i>
                            ${formatDate(chapter.createdAt)}
                        </span>
                    </div>
                </div>
                <div class="chapter-actions">
                    <button class="btn btn-primary btn-sm" onclick="startReadingChapter(${mangaId}, ${chapter.number})">
                        <i class="fas fa-play"></i>
                        Ler
                    </button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Erro ao carregar capítulos:', error);
        chaptersList.innerHTML = '<div class="error-message">Erro ao carregar capítulos.</div>';
    }
}

// Carregar mangás similares
async function loadSimilarMangas(currentManga) {
    const similarGrid = document.getElementById('similar-mangas-grid');
    
    try {
        const response = await fetch(`${API_BASE_URL}/mangas`);
        
        if (!response.ok) {
            throw new Error('Erro ao carregar mangás similares');
        }
        
        const allMangas = await response.json();
        
        // Filtrar mangás similares (excluir o atual e pegar até 4)
        const similarMangas = allMangas
            .filter(manga => manga.id !== currentManga.id)
            .slice(0, 4);
        
        if (similarMangas.length === 0) {
            similarGrid.innerHTML = '<div class="no-similar">Nenhum mangá similar encontrado.</div>';
            return;
        }
        
        // Renderizar mangás similares
        similarGrid.innerHTML = similarMangas.map(manga => {
            let coverSrc = manga.cover;
            if (manga.cover && manga.cover.startsWith('/uploads/')) {
                coverSrc = window.SERVER_BASE_URL + manga.cover;
            }
            
            return `
                <div class="similar-manga-card" onclick="goToMangaDetail(${manga.id})">
                    <img src="${coverSrc}" alt="${manga.title}" class="similar-manga-cover">
                    <div class="similar-manga-info">
                        <h4 class="similar-manga-title">${manga.title}</h4>
                        <p class="similar-manga-status ${getStatusClass(manga.status)}">${manga.status}</p>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Erro ao carregar mangás similares:', error);
        similarGrid.innerHTML = '<div class="error-message">Erro ao carregar mangás similares.</div>';
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Botão começar a ler
    document.getElementById('start-reading-btn').addEventListener('click', function() {
        const mangaId = new URLSearchParams(window.location.search).get('id');
        if (mangaId) {
            startReadingManga(mangaId);
        }
    });
    
    // Botão adicionar aos favoritos
    document.getElementById('add-favorite-btn').addEventListener('click', function() {
        const mangaId = new URLSearchParams(window.location.search).get('id');
        if (mangaId) {
            addToFavorites(mangaId);
        }
    });
}

// Começar a ler mangá (primeiro capítulo)
function startReadingManga(mangaId) {
    // Redirecionar para a página de leitura
    window.location.href = `reader.html?manga=${mangaId}`;
}

// Começar a ler capítulo específico
function startReadingChapter(mangaId, chapterNumber) {
    // Redirecionar para a página de leitura com capítulo específico
    window.location.href = `reader.html?manga=${mangaId}&chapter=${chapterNumber}`;
}

// Adicionar aos favoritos
async function addToFavorites(mangaId) {
    if (!authManager.isLoggedIn()) {
        showNotification('Faça login para adicionar aos favoritos!', 'error');
        return;
    }
    
    try {
        const token = authManager.getToken();
        const response = await fetch(`${API_BASE_URL}/favorites`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ mangaId })
        });
        
        if (response.ok) {
            showNotification('Mangá adicionado aos favoritos!', 'success');
        } else {
            throw new Error('Erro ao adicionar aos favoritos');
        }
    } catch (error) {
        console.error('Erro ao adicionar aos favoritos:', error);
        showNotification('Erro ao adicionar aos favoritos', 'error');
    }
}

// Ir para detalhes de outro mangá
function goToMangaDetail(mangaId) {
    window.location.href = `manga-detail.html?id=${mangaId}`;
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

// Formatar data
function formatDate(dateString) {
    if (!dateString) return 'Data não disponível';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Mostrar erro
function showError(message) {
    const errorState = document.getElementById('error-state');
    const loadingState = document.getElementById('loading-state');
    const mangaContent = document.getElementById('manga-detail-content');
    
    loadingState.style.display = 'none';
    mangaContent.style.display = 'none';
    errorState.style.display = 'block';
    
    const errorContent = errorState.querySelector('.error-content h3');
    if (errorContent) {
        errorContent.textContent = message;
    }
}

// Mostrar notificação
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '600',
        zIndex: '3000',
        animation: 'slideInRight 0.3s ease-out',
        backgroundColor: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'
    });
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Adicionar estilos para notificações
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(notificationStyles);
