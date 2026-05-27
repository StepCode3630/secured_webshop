// Navigation commune à toutes les pages
// Pour modifier le menu, éditer uniquement ce fichier
document.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("topbar");
  if (!nav) return;

  nav.innerHTML = `
        <header class="topbar">
            <div class="container">
                <div class="brand">Secure Shop</div>
                <nav class="menu">
                    <a href="/">Accueil</a>
                    <a href="/profile">Profil</a>
                    <a href="/login">Connexion</a>
                    <a href="/register">Inscription</a>
                </nav>
            </div>
        </header>
    `;

  const menu = nav.querySelector(".menu");
  if (!menu) return;

  const adminLinkSelector = "a.admin-link";

  function addAdminLink() {
    if (menu.querySelector(adminLinkSelector)) return;
    const link = document.createElement("a");
    link.className = "admin-link";
    link.href = "/admin";
    link.textContent = "Admin";
    const loginLink = menu.querySelector("a[href='/login']");
    menu.insertBefore(link, loginLink || null);
  }

  if (window.user && window.user.role === "admin") {
    addAdminLink();
    return;
  }

  fetch("/api/profile", {
    credentials: "include",
  })
    .then((res) => {
      if (!res.ok) return null;
      return res.json();
    })
    .then((user) => {
      if (user && user.role === "admin") {
        addAdminLink();
      }
    })
    .catch(() => {
      // Silencie les erreurs pour les pages sans authentification.
    });
});
