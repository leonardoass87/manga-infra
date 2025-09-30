// Admin Panel JavaScript (ajustes mínimos; fluxo de upload mantido)
if (window.AdminPanelLoaded) {
  console.log("⚠️ Script já carregado, pulando...");
} else {
  window.AdminPanelLoaded = true;

  const PLACEHOLDER_SRC = "asset/logo.png";
  if (!window.API_BASE_URL)
    window.API_BASE_URL = window.location.origin + "/api";
  if (!window.SERVER_BASE_URL) window.SERVER_BASE_URL = "http://localhost:4000";

  class AdminPanel {
    constructor() {
      this.mangas = [];
      this.currentManga = null;
      this.isEditing = false;
      this.chapters = [];
      this.chapterCounter = 0;
      this.selectedCoverFile = null;
      this.users = [];
      this.currentUser = null;
      this.currentSection = "mangas"; // 'mangas' ou 'users'
      this.init();
    }

    async init() {
      await this.checkAuth();
      this.bindEvents();
      this.loadMangas();
    }

    async checkAuth() {
      try {
        if (typeof authManager?.verifyToken === "function")
          await authManager.verifyToken();
      } catch (_) {}
      if (!authManager.isLoggedIn() || !authManager.isAdmin())
        window.location.href = "login.html";
    }

    bindEvents() {
      document
        .getElementById("add-manga-btn")
        ?.addEventListener("click", () => this.openModal());
      document
        .getElementById("modal-close")
        ?.addEventListener("click", () => this.closeModal());
      document
        .getElementById("cancel-btn")
        ?.addEventListener("click", () => this.closeModal());
      document
        .getElementById("confirm-close")
        ?.addEventListener("click", () => this.closeConfirmModal());
      document
        .getElementById("confirm-cancel")
        ?.addEventListener("click", () => this.closeConfirmModal());

      document
        .getElementById("manga-form")
        ?.addEventListener("submit", (e) => this.handleSubmit(e));

      document
        .getElementById("search-input")
        ?.addEventListener("input", (e) => this.handleSearch(e));
      document
        .querySelectorAll(".filter-btn")
        .forEach((btn) =>
          btn.addEventListener("click", (e) => this.handleFilter(e))
        );

      document
        .getElementById("logout-btn")
        ?.addEventListener("click", () => this.logout());

      document
        .getElementById("manga-cover-file")
        ?.addEventListener("change", (e) => this.handleCoverUpload(e));
      document
        .getElementById("remove-cover")
        ?.addEventListener("click", () => this.removeCoverFile());
      document
        .getElementById("add-chapter-btn")
        ?.addEventListener("click", () => this.addChapter());

      // User management events
      document
        .getElementById("manage-users-btn")
        ?.addEventListener("click", () => this.showUsersSection());
      document
        .getElementById("back-to-mangas-btn")
        ?.addEventListener("click", () => this.showMangasSection());
      document
        .getElementById("user-modal-close")
        ?.addEventListener("click", () => this.closeUserModal());
      document
        .getElementById("user-cancel-btn")
        ?.addEventListener("click", () => this.closeUserModal());
      document
        .getElementById("user-form")
        ?.addEventListener("submit", (e) => this.handleUserSubmit(e));
      document
        .getElementById("user-confirm-close")
        ?.addEventListener("click", () => this.closeUserConfirmModal());
      document
        .getElementById("user-confirm-cancel")
        ?.addEventListener("click", () => this.closeUserConfirmModal());

      window.addEventListener("click", (e) => {
        if (e.target.classList?.includes?.("modal")) {
          this.closeModal();
          this.closeConfirmModal();
          this.closeUserModal();
          this.closeUserConfirmModal();
        }
      });
    }

    async loadMangas() {
      const grid = document.getElementById("manga-grid");
      grid.innerHTML = `
          <div class="loading-state">
            <div class="loading-spinner"></div>
            <div class="loading-text">Carregando mangás...</div>
          </div>`;

      try {
        console.log("🔍 Carregando mangás...");
        console.log("API_BASE_URL:", window.API_BASE_URL);

        const token = authManager.getToken();
        console.log("Token:", token ? "Presente" : "Ausente");

        const url = `${window.API_BASE_URL}/mangas`;
        console.log("URL:", url);

        const res = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        console.log("Response status:", res.status);

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Erro na resposta:", errorText);
          throw new Error(`Erro ${res.status}: ${errorText}`);
        }

        const response = await res.json();
        console.log("Resposta da API:", response);  

        if (Array.isArray(response)) {
          this.mangas = response;
        } else if (response.success && response.data) {
          this.mangas = response.data;
        } else {
          this.mangas = [];
        }
        this.renderMangas();
        this.updateStats();        
      } catch (e) {
        console.error("Erro ao carregar mangás:", e);
        grid.innerHTML = `
            <div class="empty-state">
              <i class="fas fa-exclamation-triangle"></i>
              <h3>Erro ao carregar mangás</h3>
              <p>Não foi possível conectar com o servidor. Tente novamente.</p>
              <p><small>Erro: ${e.message}</small></p>
              <button class="btn btn-primary" onclick="adminPanel.loadMangas()">
                <i class="fas fa-redo"></i> Tentar Novamente
              </button>
            </div>`;
        this.showError("Erro de conexão com o servidor: " + e.message);
      }
    }

    renderMangas(list = null) {
      const grid = document.getElementById("manga-grid");
      if (!grid) return;
      const mangas = list || this.mangas || [];
      if (!Array.isArray(mangas) || !mangas.length) {
        grid.innerHTML = `
            <div class="empty-state">
              <h3>Nenhum mangá encontrado</h3>
              <p>Adicione seu primeiro mangá clicando no botão "Adicionar Mangá"</p>
            </div>`;
        return;
      }
      grid.innerHTML = mangas.map((m) => this.createMangaCard(m)).join("");
    }

    createMangaCard(m) {
      const statusClass = this.getStatusClass(m.status);
      const latest = m.isLatest ? '<span class="latest-badge">NOVO</span>' : "";
      const hasCover =
        m.cover &&
        String(m.cover).trim() &&
        m.cover !== "undefined" &&
        m.cover !== "null";
      let src = PLACEHOLDER_SRC;
      if (hasCover) {
        // Se a URL da capa começa com /uploads/, adiciona o SERVER_BASE_URL
        if (m.cover.startsWith("/uploads/")) {
          src = window.SERVER_BASE_URL + m.cover;
        } else {
          src = m.cover;
        }
      }
      return `
          <div class="manga-card" data-id="${m.id}">
            <div class="manga-thumb">
              ${latest}
              <img src="${src}" alt="${
        m.title
      }" class="manga-cover" loading="lazy"
                onerror="this.onerror=null; this.src='${PLACEHOLDER_SRC}';">
            </div>
            <div class="manga-info">
              <h3 class="manga-title">${m.title}</h3>
              <p class="manga-description">${m.description}</p>
              <div class="manga-meta">
                <span class="manga-chapters">${
                  m.chapters ? m.chapters.length : 0
                } capítulos</span>
                <span class="manga-status ${statusClass}">${m.status}</span>
              </div>
              <div class="manga-actions">
                <button class="action-btn edit-btn" onclick="adminPanel.editManga(${
                  m.id
                })">✏️ Editar</button>
                <button class="action-btn delete-btn" onclick="adminPanel.confirmDelete(${
                  m.id
                })">🗑️ Excluir</button>
              </div>
            </div>
          </div>`;
    }

    getStatusClass(s) {
      switch ((s || "").toLowerCase()) {
        case "em andamento":
          return "status-ongoing";
        case "finalizado":
          return "status-completed";
        case "pausado":
          return "status-paused";
        default:
          return "status-ongoing";
      }
    }

    updateStats() {
      // Garantir que this.mangas seja sempre um array
      const mangas = Array.isArray(this.mangas) ? this.mangas : [];

      const total = mangas.length;
      const chapters = mangas.reduce(
        (acc, m) => acc + (m.chapters ? m.chapters.length : 0),
        0
      );
      const latest = mangas.filter((m) => m.is_latest || m.isLatest).length;

      document.getElementById("total-mangas").textContent = total;
      document.getElementById("total-chapters").textContent = chapters;
      document.getElementById("latest-mangas").textContent = latest;
    }

    openModal(manga = null) {
      this.isEditing = !!manga;
      this.currentManga = manga;
      document.getElementById("modal-title").textContent = this.isEditing
        ? "Editar Mangá"
        : "Adicionar Mangá";
      this.resetUploads();
      if (this.isEditing) this.populateForm(manga);
      else document.getElementById("manga-form")?.reset();
      document.getElementById("manga-modal").style.display = "block";
    }

    populateForm(m) {
      document.getElementById("manga-title").value = m.title || "";
      document.getElementById("manga-description").value = m.description || "";
      document.getElementById("manga-status").value =
        m.status || "Em andamento";
      document.getElementById("manga-latest").checked = !!(
        m.is_latest || m.isLatest
      );
    }

    closeModal() {
      const modal = document.getElementById("manga-modal");
      if (modal) modal.style.display = "none";
      this.currentManga = null;
      this.isEditing = false;
      this.resetUploads();
    }

    async handleSubmit(e) {
      e.preventDefault();
      const isLogged = authManager.isLoggedIn();
      const token = authManager.getToken();
      if (!isLogged || !token) {
        this.showError("Você precisa estar logado para criar mangás.");
        setTimeout(() => (window.location.href = "login.html"), 1500);
        return;
      }

      const title = document.getElementById("manga-title").value.trim();
      const description = document
        .getElementById("manga-description")
        .value.trim();
      const status = document.getElementById("manga-status").value;

      if (!title) return this.showError("Título é obrigatório");
      if (!description) return this.showError("Descrição é obrigatória");
      if (!this.isEditing && !this.selectedCoverFile)
        return this.showError("Capa é obrigatória");
      if (!this.isEditing && this.chapters.length === 0)
        return this.showError("Pelo menos um capítulo é obrigatório");

      for (const ch of this.chapters) {
        if (ch.files.length === 0)
          return this.showError(
            `Capítulo ${ch.number} precisa ter pelo menos uma página`
          );
      }

      const fd = new FormData();
      fd.append("title", title);
      fd.append("description", description);
      fd.append("status", status);
      fd.append("is_latest", document.getElementById("manga-latest").checked);
      if (this.selectedCoverFile) fd.append("cover", this.selectedCoverFile);

      const chaptersData = this.chapters.map((ch) => ({
        number: ch.number,
        filesCount: ch.files.length,
      }));
      fd.append("chaptersData", JSON.stringify(chaptersData));
      this.chapters.forEach((ch) =>
        ch.files.forEach((file, i) =>
          fd.append(`chapter_${ch.number}_page_${i}`, file)
        )
      );

      try {
        const url = `${window.API_BASE_URL}/mangas`;
        const resp = await fetch(url, {
          method: this.isEditing ? "PUT" : "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        if (resp.status === 401) {
          this.showError("Sessão expirada. Redirecionando...");
          setTimeout(() => (window.location.href = "login.html"), 1500);
          return;
        }
        if (!resp.ok) {
          const ct = resp.headers.get("content-type") || "";
          let msg = `Erro HTTP ${resp.status}`;
          try {
            msg += ct.includes("json")
              ? `: ${(await resp.json()).message || resp.statusText}`
              : `: ${await resp.text()}`;
          } catch (_) {
            msg += `: ${resp.statusText}`;
          }
          throw new Error(msg);
        }
        await resp.json();
        this.closeModal();
        this.loadMangas();
        this.showSuccess(
          this.isEditing
            ? "Mangá atualizado com sucesso!"
            : "Mangá criado com sucesso!"
        );
      } catch (err) {
        this.showError(err.message || "Erro ao salvar mangá");
      }
    }

    editManga(id) {
      const m = this.mangas.find((x) => x.id === id);
      if (m) this.openModal(m);
    }

    confirmDelete(id) {
      this.currentManga = this.mangas.find((m) => m.id === id);
      document.getElementById("confirm-modal").style.display = "block";
    }

    closeConfirmModal() {
      document.getElementById("confirm-modal").style.display = "none";
      this.currentManga = null;
    }

    async deleteManga() {
      if (!this.currentManga) return;
      try {
        const token = authManager.getToken();
        const resp = await fetch(
          `${window.API_BASE_URL}/mangas/${this.currentManga.id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!resp.ok)
          throw new Error(
            (await resp.json()).message || "Erro ao excluir mangá"
          );
        this.closeConfirmModal();
        this.loadMangas();
        this.showSuccess("Mangá excluído com sucesso!");
      } catch (e) {
        this.showError(e.message || "Erro ao excluir mangá");
      }
    }

    handleSearch(e) {
      const q = (e.target.value || "").toLowerCase();
      this.renderMangas(
        this.mangas.filter(
          (m) =>
            (m.title || "").toLowerCase().includes(q) ||
            (m.description || "").toLowerCase().includes(q)
        )
      );
    }

    handleFilter(e) {
      document
        .querySelectorAll(".filter-btn")
        .forEach((btn) => btn.classList.remove("active"));
      e.target.classList.add("active");
      const f = e.target.dataset.filter;
      let list = this.mangas;
      if (f === "latest") list = this.mangas.filter((m) => m.isLatest);
      else if (f === "ongoing")
        list = this.mangas.filter(
          (m) => (m.status || "").toLowerCase() === "em andamento"
        );
      else if (f === "completed")
        list = this.mangas.filter(
          (m) => (m.status || "").toLowerCase() === "finalizado"
        );
      this.renderMangas(list);
    }

    logout() {
      if (typeof authManager !== "undefined" && authManager.logout) {
        authManager.logout();
      } else {
        // Fallback se authManager não estiver disponível
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "login.html";
      }
    }

    resetUploads() {
      this.selectedCoverFile = null;
      const input = document.getElementById("manga-cover-file");
      if (input) input.value = "";
      document.getElementById("cover-placeholder").style.display = "flex";
      document.getElementById("cover-preview").style.display = "none";
      const img = document.getElementById("cover-preview-img");
      if (img) img.src = "";
      this.chapters = [];
      this.chapterCounter = 0;
      const cont = document.getElementById("chapters-container");
      if (cont) cont.innerHTML = "";
    }

    handleCoverUpload(e) {
      const file = e.target.files[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        this.showError("Selecione apenas imagens.");
        e.target.value = "";
        return;
      }
      this.selectedCoverFile = file;
      this.showCoverPreview(file);
    }

    showCoverPreview(file) {
      const r = new FileReader();
      r.onload = (ev) => {
        document.getElementById("cover-placeholder").style.display = "none";
        document.getElementById("cover-preview").style.display = "block";
        document.getElementById("cover-preview-img").src = ev.target.result;
      };
      r.readAsDataURL(file);
    }

    addChapter() {
      this.chapterCounter++;
      const n = this.chapterCounter;
      const container = document.getElementById("chapters-container");
      const item = document.createElement("div");
      item.className = "chapter-item";
      item.dataset.chapterNumber = n;
      item.innerHTML = `
          <div class="chapter-header">
            <h4>Capítulo ${n}</h4>
            <button type="button" class="remove-chapter-btn" onclick="adminPanel.removeChapter(${n})"><i class="fas fa-times"></i></button>
          </div>
          <div class="chapter-files-container" data-chapter="${n}">
            <input type="file" id="chapter-${n}-files" multiple accept="image/*" onchange="adminPanel.handleChapterFiles(${n}, this)">
            <div class="files-placeholder">
              <i class="fas fa-images"></i>
              <span>Clique para selecionar as páginas do capítulo</span>
              <small>Selecione múltiplas imagens (JPG, PNG, WEBP, GIF)</small>
            </div>
            <div class="files-list" style="display: none;"></div>
          </div>`;
      container.appendChild(item);
      const cont = item.querySelector(".chapter-files-container");
      const inp = item.querySelector(`#chapter-${n}-files`);
      cont.addEventListener("click", (e) => {
        if (e.target !== inp) inp.click();
      });
      this.chapters.push({ number: n, files: [] });
    }

    removeChapter(n) {
      document.querySelector(`[data-chapter-number="${n}"]`)?.remove();
      this.chapters = this.chapters.filter((c) => c.number !== n);
    }

    handleChapterFiles(n, input) {
      const files = Array.from(input.files).filter((f) =>
        f.type.startsWith("image/")
      );
      const idx = this.chapters.findIndex((c) => c.number === n);
      if (idx !== -1) this.chapters[idx].files = files;
      this.showChapterFilesPreview(n, files);
    }

    showChapterFilesPreview(n, files) {
      const item = document.querySelector(`[data-chapter-number="${n}"]`);
      const placeholder = item.querySelector(".files-placeholder");
      const list = item.querySelector(".files-list");
      placeholder.style.display = "none";
      list.style.display = "block";
      list.innerHTML = "";
      files.forEach((f, i) => {
        const tag = document.createElement("div");
        tag.className = "file-tag";
        tag.innerHTML = `<span>Página ${i + 1}: ${f.name}</span>
            <button type="button" onclick="adminPanel.removeChapterFile(${n}, ${i})"><i class="fas fa-times"></i></button>`;
        list.appendChild(tag);
      });
    }

    removeChapterFile(n, i) {
      const idx = this.chapters.findIndex((c) => c.number === n);
      if (idx === -1) return;
      this.chapters[idx].files.splice(i, 1);
      const input = document.getElementById(`chapter-${n}-files`);
      const dt = new DataTransfer();
      this.chapters[idx].files.forEach((f) => dt.items.add(f));
      input.files = dt.files;
      if (this.chapters[idx].files.length)
        this.showChapterFilesPreview(n, this.chapters[idx].files);
      else {
        const item = document.querySelector(`[data-chapter-number="${n}"]`);
        item.querySelector(".files-placeholder").style.display = "block";
        item.querySelector(".files-list").style.display = "none";
      }
    }

    showSuccess(msg) {
      this.showNotification(msg, "success");
    }
    showError(msg) {
      this.showNotification(msg, "error");
    }
    showNotification(message, type) {
      const n = document.createElement("div");
      n.className = `notification notification-${type}`;
      n.textContent = message;
      Object.assign(n.style, {
        position: "fixed",
        top: "20px",
        right: "20px",
        padding: "1rem 1.5rem",
        borderRadius: "8px",
        color: "white",
        fontWeight: "600",
        zIndex: "3000",
        animation: "slideInRight 0.3s ease-out",
        backgroundColor: type === "success" ? "#10b981" : "#ef4444",
      });
      document.body.appendChild(n);
      setTimeout(() => {
        n.style.animation = "slideOutRight 0.3s ease-out";
        setTimeout(() => n.remove(), 300);
      }, 3000);
    }

    // ==================== USER MANAGEMENT ====================
    async showUsersSection() {
      this.currentSection = "users";
      document.getElementById("manga-section").style.display = "none";
      document.getElementById("users-section").style.display = "block";
      document.getElementById("search-input").placeholder =
        "Buscar usuários...";
      await this.loadUsers();
    }

    showMangasSection() {
      this.currentSection = "mangas";
      document.getElementById("users-section").style.display = "none";
      document.getElementById("manga-section").style.display = "block";
      document.getElementById("search-input").placeholder = "Buscar mangás...";
    }

    async loadUsers() {
      const grid = document.getElementById("users-grid");
      grid.innerHTML = `
          <div class="loading-state">
            <div class="loading-spinner"></div>
            <div class="loading-text">Carregando usuários...</div>
          </div>`;

      try {
        const token = authManager.getToken();
        const response = await fetch(`${window.API_BASE_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        this.users = data.users || [];
        this.renderUsers();
        this.updateUserStats();
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
        grid.innerHTML = `
            <div class="empty-state">
              <i class="fas fa-exclamation-triangle"></i>
              <h3>Erro ao carregar usuários</h3>
              <p>Não foi possível conectar com o servidor. Tente novamente.</p>
              <p><small>Erro: ${error.message}</small></p>
              <button class="btn btn-primary" onclick="adminPanel.loadUsers()">
                <i class="fas fa-redo"></i> Tentar Novamente
              </button>
            </div>`;
      }
    }

    renderUsers() {
      const grid = document.getElementById("users-grid");
      if (!grid) return;

      if (!Array.isArray(this.users) || !this.users.length) {
        grid.innerHTML = `
            <div class="empty-state">
              <h3>Nenhum usuário encontrado</h3>
              <p>Não há usuários cadastrados no sistema.</p>
            </div>`;
        return;
      }

      grid.innerHTML = this.users
        .map((user) => this.createUserCard(user))
        .join("");
    }

    createUserCard(user) {
      const isCurrentUser = user.id === authManager.getUser()?.id;
      const roleClass = user.role === "admin" ? "admin" : "user";
      const roleText = user.role === "admin" ? "Admin" : "Usuário";
      const avatar = user.name ? user.name.charAt(0).toUpperCase() : "U";

      return `
          <div class="user-card" data-id="${user.id}">
            <div class="user-header">
              <div class="user-avatar">${avatar}</div>
              <div class="user-info">
                <h3>${user.name || "Nome não informado"}</h3>
                <p class="user-username">@${user.username}</p>
              </div>
              <div class="user-role ${roleClass}">${roleText}</div>
            </div>
            <div class="user-email">${user.email || "Email não informado"}</div>
            <div class="user-actions">
              ${
                !isCurrentUser
                  ? `
                <button class="user-action-btn edit-user-btn" onclick="adminPanel.editUser(${user.id})">
                  ✏️ Editar
                </button>
                <button class="user-action-btn delete-user-btn" onclick="adminPanel.confirmDeleteUser(${user.id})">
                  🗑️ Excluir
                </button>
              `
                  : `
                <span class="current-user-badge">Usuário Atual</span>
              `
              }
            </div>
          </div>`;
    }

    updateUserStats() {
      const totalUsers = this.users.length;
      const adminCount = this.users.filter((u) => u.role === "admin").length;

      document.getElementById("total-users").textContent = totalUsers;
      document.getElementById("admin-count").textContent = adminCount;
    }

    editUser(userId) {
      const user = this.users.find((u) => u.id === userId);
      if (!user) return;

      this.currentUser = user;
      document.getElementById("user-name").value = user.name || "";
      document.getElementById("user-username").value = user.username || "";
      document.getElementById("user-email").value = user.email || "";
      document.getElementById("user-role").value = user.role || "user";

      document.getElementById("user-modal").style.display = "block";
    }

    closeUserModal() {
      document.getElementById("user-modal").style.display = "none";
      this.currentUser = null;
    }

    async handleUserSubmit(e) {
      e.preventDefault();

      if (!this.currentUser) return;

      const role = document.getElementById("user-role").value;

      try {
        const token = authManager.getToken();
        const response = await fetch(
          `${window.API_BASE_URL}/users/${this.currentUser.id}/role`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ role }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Erro ao alterar role");
        }

        const data = await response.json();
        this.showSuccess(data.message || "Role alterada com sucesso!");
        this.closeUserModal();
        this.loadUsers();
      } catch (error) {
        this.showError(error.message || "Erro ao alterar role do usuário");
      }
    }

    confirmDeleteUser(userId) {
      const user = this.users.find((u) => u.id === userId);
      if (!user) return;

      this.currentUser = user;
      document.getElementById("user-confirm-modal").style.display = "block";
    }

    closeUserConfirmModal() {
      document.getElementById("user-confirm-modal").style.display = "none";
      this.currentUser = null;
    }

    async deleteUser() {
      if (!this.currentUser) return;

      try {
        const token = authManager.getToken();
        const response = await fetch(
          `${window.API_BASE_URL}/users/${this.currentUser.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Erro ao deletar usuário");
        }

        const data = await response.json();
        this.showSuccess(data.message || "Usuário deletado com sucesso!");
        this.closeUserConfirmModal();
        this.loadUsers();
      } catch (error) {
        this.showError(error.message || "Erro ao deletar usuário");
      }
    }
  }

  if (!window.adminPanelInitialized) {
    document.addEventListener("DOMContentLoaded", () => {
      if (window.adminPanel) return;
      window.adminPanel = new AdminPanel();
      window.adminPanelInitialized = true;
      document
        .getElementById("confirm-delete")
        ?.addEventListener("click", () => window.adminPanel.deleteManga());
      document
        .getElementById("user-confirm-delete")
        ?.addEventListener("click", () => window.adminPanel.deleteUser());
    });
  }

  const adminStyles = document.createElement("style");
  adminStyles.textContent = `
      @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
    `;
  document.head.appendChild(adminStyles);
}
