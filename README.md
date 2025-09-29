# 🎨 SiteManga Frontend

Interface web moderna e responsiva para o sistema de leitura de mangás SiteManga, desenvolvido com HTML5, CSS3 e JavaScript vanilla.

## ✨ Funcionalidades

- ✅ **Design Responsivo** - Mobile-first, adaptável a todos os dispositivos
- ✅ **Leitor de Mangás** - Interface otimizada para leitura
- ✅ **Sistema de Autenticação** - Login e registro de usuários
- ✅ **Catálogo de Mangás** - Navegação e busca
- ✅ **Painel Administrativo** - Gerenciamento completo
- ✅ **Upload de Arquivos** - Drag & drop para capas e páginas
- ✅ **Barra de Progresso** - Acompanhamento da leitura
- ✅ **Botão Back-to-Top** - Navegação facilitada
- ✅ **Animações Suaves** - Transições e efeitos visuais
- ✅ **PWA Ready** - Funciona offline

## 🛠️ Tecnologias

- **HTML5** - Estrutura semântica
- **CSS3** - Estilos modernos e responsivos
- **JavaScript ES6+** - Lógica da aplicação
- **Fetch API** - Comunicação com backend
- **Local Storage** - Persistência de dados
- **CSS Grid & Flexbox** - Layout responsivo
- **CSS Animations** - Transições suaves

## 🚀 Instalação

### Pré-requisitos

- Servidor web (Apache, Nginx, ou servidor local)
- Backend API rodando (veja [sitemanga-backend](https://github.com/leonardoass87/sitemanga-backend))

### Instalação Local

```bash
# 1. Clone o repositório
git clone https://github.com/leonardoass87/sitemanga-frontend.git
cd sitemanga-frontend

# 2. Configure a API
# Edite o arquivo js/config.js com a URL do seu backend
const API_BASE_URL = 'http://localhost:4000/api';

# 3. Sirva os arquivos
# Use qualquer servidor web local
python -m http.server 8000
# ou
npx serve .
```

### Instalação com Docker

```bash
# 1. Clone o repositório
git clone https://github.com/leonardoass87/sitemanga-frontend.git
cd sitemanga-frontend

# 2. Build da imagem
docker build -t sitemanga-frontend .

# 3. Execute o container
docker run -p 80:80 sitemanga-frontend
```

## 📱 Páginas

### Páginas Principais
- **`index.html`** - Página inicial com hero section
- **`login.html`** - Autenticação de usuários
- **`catalogo.html`** - Catálogo de mangás
- **`manga-detail.html`** - Detalhes do mangá
- **`reader.html`** - Leitor de mangás
- **`admin.html`** - Painel administrativo

### Componentes
- **Header** - Navegação principal
- **Footer** - Informações e links
- **Sidebar** - Menu lateral (mobile)
- **Modal** - Popups e confirmações
- **Toast** - Notificações

## 🎨 Design System

### Cores
```css
:root {
  --primary: #dc2626;      /* Vermelho principal */
  --secondary: #1f2937;    /* Cinza escuro */
  --accent: #f59e0b;       /* Amarelo accent */
  --success: #10b981;      /* Verde sucesso */
  --warning: #f59e0b;      /* Amarelo aviso */
  --error: #ef4444;        /* Vermelho erro */
  --text: #ffffff;        /* Texto branco */
  --bg: #111827;           /* Fundo escuro */
}
```

### Tipografia
- **Font Family**: Inter, system-ui, sans-serif
- **Tamanhos**: 12px, 14px, 16px, 18px, 24px, 32px, 48px
- **Pesos**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Componentes
- **Botões**: Primário, secundário, outline, ghost
- **Cards**: Mangá, capítulo, usuário
- **Forms**: Input, textarea, select, checkbox
- **Navigation**: Header, sidebar, breadcrumb
- **Feedback**: Toast, modal, loading

## 📱 Responsividade

### Breakpoints
```css
/* Mobile First */
@media (max-width: 480px) { /* Mobile */ }
@media (max-width: 768px) { /* Tablet */ }
@media (max-width: 1024px) { /* Desktop */ }
@media (min-width: 1025px) { /* Large */ }
```

### Grid System
- **Mobile**: 1 coluna
- **Tablet**: 2 colunas
- **Desktop**: 3-4 colunas
- **Large**: 5+ colunas

## 🎯 Funcionalidades Detalhadas

### Leitor de Mangás
- ✅ **Zoom** - Ampliar/reduzir páginas
- ✅ **Navegação** - Próxima/anterior página
- ✅ **Progresso** - Barra de progresso visual
- ✅ **Back-to-Top** - Botão para voltar ao topo
- ✅ **Fullscreen** - Modo tela cheia
- ✅ **Teclado** - Atalhos de teclado

### Sistema de Autenticação
- ✅ **Login** - Autenticação segura
- ✅ **Registro** - Criação de conta
- ✅ **Logout** - Encerramento de sessão
- ✅ **Persistência** - Manter login ativo
- ✅ **Validação** - Validação de formulários

### Painel Administrativo
- ✅ **Dashboard** - Visão geral do sistema
- ✅ **CRUD Mangás** - Gerenciar mangás
- ✅ **CRUD Capítulos** - Gerenciar capítulos
- ✅ **Upload** - Upload de arquivos
- ✅ **Usuários** - Gerenciar usuários

## 🔧 Configuração

### API Configuration
```javascript
// js/config.js
const CONFIG = {
  API_BASE_URL: 'http://localhost:4000/api',
  UPLOAD_URL: 'http://localhost:4000/api/upload',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
};
```

### Local Storage
```javascript
// Chaves utilizadas
const STORAGE_KEYS = {
  TOKEN: 'sitemanga_token',
  USER: 'sitemanga_user',
  THEME: 'sitemanga_theme',
  SETTINGS: 'sitemanga_settings'
};
```

## 🎨 Customização

### Temas
```css
/* Tema claro */
[data-theme="light"] {
  --bg: #ffffff;
  --text: #1f2937;
  --card: #f9fafb;
}

/* Tema escuro */
[data-theme="dark"] {
  --bg: #111827;
  --text: #ffffff;
  --card: #1f2937;
}
```

### Animações
```css
/* Transições suaves */
.transition {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Animações de entrada */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

## 📊 Performance

### Otimizações
- ✅ **Lazy Loading** - Carregamento sob demanda
- ✅ **Image Optimization** - Imagens otimizadas
- ✅ **CSS Minification** - Estilos minificados
- ✅ **JS Bundling** - JavaScript otimizado
- ✅ **Caching** - Cache de recursos

### Métricas
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.0s

## 🧪 Testes

### Testes Manuais
```bash
# Teste de responsividade
# Abra o DevTools e teste em diferentes resoluções

# Teste de funcionalidades
# Teste login, navegação, leitor, admin
```

### Testes Automatizados
```bash
# Instalar dependências de teste
npm install --save-dev jest puppeteer

# Executar testes
npm test
```

## 🚀 Deploy

### Deploy Estático
```bash
# Build para produção
npm run build

# Deploy para servidor
rsync -av dist/ user@server:/var/www/sitemanga/
```

### Deploy com Docker
```bash
# Build da imagem
docker build -t sitemanga-frontend .

# Deploy
docker run -d -p 80:80 sitemanga-frontend
```

### Deploy com Nginx
```nginx
server {
    listen 80;
    server_name sitemanga.com;
    root /var/www/sitemanga;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    }
}
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Leonardo Assis**
- GitHub: [@leonardoass87](https://github.com/leonardoass87)

## 📞 Suporte

Se você encontrar algum problema ou tiver dúvidas, abra uma [issue](https://github.com/leonardoass87/sitemanga-frontend/issues).

---

**🎨 SiteManga Frontend - Interface moderna para leitura de mangás!**


