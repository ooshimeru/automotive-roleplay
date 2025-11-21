document.addEventListener("DOMContentLoaded", () => {
  // 1. COPY IP SYSTEM
  const ipBtn = document.getElementById("copy-ip");

  ipBtn.addEventListener("click", () => {
    const ip = ipBtn.getAttribute("data-ip");
    const originalText = ipBtn.innerHTML;

    navigator.clipboard.writeText(ip).then(() => {
      // Changement minimaliste du texte
      ipBtn.style.borderColor = "#8a2be2";
      ipBtn.style.color = "#8a2be2";
      ipBtn.innerHTML = "COPIED";

      setTimeout(() => {
        ipBtn.style.borderColor = "";
        ipBtn.style.color = "";
        ipBtn.innerHTML = originalText;
      }, 2000);
    });
  });

  // 2. SCROLL REVEAL (Apparition douce des éléments)
  const observerOptions = {
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Appliquer l'animation aux éléments clés
  const elementsToAnimate = document.querySelectorAll(
    ".col-right, .gallery-item",
  );

  elementsToAnimate.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)"; // Courbe fluide
    observer.observe(el);
  });

  // 3. HEADER PARALLAX EFFECT (Subtil)
  window.addEventListener("scroll", () => {
    const scrolled = window.scrollY;
    const heroImg = document.querySelector(".hero-image");
    // Bouge l'image doucement
    heroImg.style.transform = `translateY(${scrolled * 0.2}px)`;
  });
});

/* --- SERVER STATUS LOGIC --- */
document.addEventListener("DOMContentLoaded", () => {
  // Récupération des éléments
  const widget = document.getElementById("server-widget");
  const serverCode = widget.getAttribute("data-cfx"); // Récupère le code du HTML

  const statusEl = document.getElementById("server-status");
  const countEl = document.getElementById("player-count");
  const fillEl = document.getElementById("player-fill");
  const nameEl = document.getElementById("server-name");
  const pingEl = document.getElementById("server-ping");

  // Fonction de récupération des données
  async function fetchServerData() {
    const startTime = Date.now(); // Pour calculer le ping

    try {
      // URL de l'API FiveM FrontEnd
      const response = await fetch(
        `https://servers-frontend.fivem.net/api/servers/single/${serverCode}`,
      );

      if (!response.ok) throw new Error("Server not found");

      const data = await response.json();

      // Si le serveur est trouvé
      if (data && data.Data) {
        const serverData = data.Data;
        const players = serverData.clients;
        const maxPlayers = serverData.sv_maxclients;
        const endTime = Date.now();
        const latency = endTime - startTime;

        // 1. Mise à jour du Status
        statusEl.innerHTML = `ONLINE <span class="blink-dot"></span>`;
        statusEl.className = "t-value status-online";

        // 2. Mise à jour des Joueurs
        countEl.innerText = `${players} / ${maxPlayers}`;

        // 3. Barre de progression
        const percentage = (players / maxPlayers) * 100;
        fillEl.style.width = `${percentage}%`;

        // Couleur changeante si le serveur est plein
        if (percentage > 90) {
          fillEl.style.backgroundColor = "#ff003c"; // Rouge alerte
          fillEl.style.boxShadow = "0 0 10px #ff003c";
        } else {
          fillEl.style.backgroundColor = "#00ff88"; // Vert/Cyan normal
          fillEl.style.boxShadow = "0 0 10px #00ff88";
        }

        // 4. Ping API (Latence HTTP)
        pingEl.innerText = `${latency} ms`;

        // 5. Nom du serveur (Nettoyage des codes couleurs ^1, ^2...)
        // On coupe si c'est trop long pour le design
        let cleanName = serverData.hostname
          .replace(/\^[0-9]/g, "")
          .substring(0, 15);
        nameEl.innerText = cleanName.toUpperCase();
      } else {
        setOffline();
      }
    } catch (error) {
      console.error("Erreur API FiveM:", error);
      setOffline();
    }
  }

  function setOffline() {
    statusEl.innerHTML = `OFFLINE <span class="red-dot"></span>`;
    statusEl.className = "t-value status-offline";
    countEl.innerText = "0 / 0";
    fillEl.style.width = "0%";
    nameEl.innerText = "NO SIGNAL";
    pingEl.innerText = "-- ms";
  }

  // Lancer au chargement
  fetchServerData();

  // Actualiser toutes les 30 secondes (pour éviter de spammer l'API)
  setInterval(fetchServerData, 30000);
});

/* --- SYSTEME DE COMPARATEUR --- */

// 1. Bouger le slider
function moveSlider(e) {
  const clipper = document.getElementById("clipper");
  const btn = document.getElementById("sliderBtn");

  const val = e.value + "%";
  clipper.style.width = val;
  btn.style.left = val;
}

// 2. Fixer la taille des images (Solution au problème de zoom)
function fixImageSizes() {
  const container = document.getElementById("compareBox");
  const imgBefore = document.getElementById("imgBefore");
  const imgAfter = document.getElementById("imgAfter");

  if (container && imgBefore && imgAfter) {
    // On récupère la largeur exacte du cadre
    const width = container.offsetWidth + "px";

    // On force les DEUX images à avoir exactement cette largeur
    imgBefore.style.width = width;
    imgAfter.style.width = width;
  }
}

// Lancer au démarrage et au redimensionnement
window.addEventListener("load", fixImageSizes);
window.addEventListener("resize", fixImageSizes);

// --- COUNTDOWN TIMER ---
function startTimer() {
  // Date cible (par exemple : dans 4 heures)
  // Astuce : ici on remet 4h à chaque refresh pour la démo,
  // mais tu peux mettre une date fixe.
  let targetDate = new Date();
  targetDate.setHours(targetDate.getHours() + 4);

  function update() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      document.getElementById("countdown").innerHTML = "ARRIVED";
      return;
    }

    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Formatage avec des zéros (04:05:09)
    document.getElementById("countdown").innerHTML =
      (hours < 10 ? "0" + hours : hours) +
      ":" +
      (minutes < 10 ? "0" + minutes : minutes) +
      ":" +
      (seconds < 10 ? "0" + seconds : seconds);
  }

  setInterval(update, 1000);
  update(); // Lancer tout de suite
}

// Ajouter au chargement
window.addEventListener("load", startTimer);
