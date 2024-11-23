document.addEventListener("DOMContentLoaded", () => {
    const posts = postsData;
    const postTitle = document.querySelector(".latestPost__title");
    const postContent = document.querySelector(".latestPost__content");
    const postThumbnail = document.querySelector(".latestPost__thumbnail");
    const postDate = document.querySelector(".latestPost__date");
    const categoryLabel = document.querySelector(".postCategory__title");
    const heroTag = document.querySelector(".hero__tag");
    const heroAvatar = document.querySelector(".hero__avatarImage");
    const prevButton = document.getElementById("prevPost");
    const nextButton = document.getElementById("nextPost");
    const tableOfContents = document.querySelector(".tableOfContents nav");

    // Variables pour la navigation
    let currentCategory = defaultCategory;
    let currentTag = defaultTag;
    let filteredPosts = posts.filter(
        (post) => post.Category === currentCategory && post.Tags.includes(currentTag)
    );
    let currentIndex = 0;

    // Fonction pour filtrer les posts selon la catégorie et le tag
    function filterPosts(category, tag) {
        currentCategory = category;
        currentTag = tag;
        filteredPosts = posts.filter(
            (post) => post.Category === category && post.Tags.includes(tag)
        );
        currentIndex = 0; // Reset index
    }

    // Fonction pour appliquer la couleur de surbrillance
    function applyHighlight(tag) {
        const body = document.body;
        body.classList.remove(
            "reverse-engineering-selection",
            "game-hacking-selection",
            "binary-exploitation-selection"
        );

        if (tag === "Reverse-Engineering") {
            body.classList.add("reverse-engineering-selection");
        } else if (tag === "Game-Hacking") {
            body.classList.add("game-hacking-selection");
        } else if (tag === "Binary-Exploitation") {
            body.classList.add("binary-exploitation-selection");
        }
    }

    // Fonction pour recalculer la hauteur de la ligne verticale
    function updateTocLineHeight() {
        const toc = document.querySelector(".tableOfContents");
        const lastLink = toc?.querySelector("nav ul li:last-child a");

        if (toc && lastLink) {
            const tocRect = toc.getBoundingClientRect();
            const lastLinkRect = lastLink.getBoundingClientRect();

            // Calcul de la hauteur dynamique
            const height = lastLinkRect.bottom - tocRect.top + 26;

            // Appliquer la hauteur calculée à la ligne verticale
            toc.style.setProperty("--toc-line-height", `${height}px`);
        }
    }

    // Fonction pour mettre en surbrillance la section active
    function highlightActiveSection(tocLinks) {
        let closestSection = null;
        let closestOffset = Number.POSITIVE_INFINITY;

        tocLinks.forEach((link) => {
            const targetId = link.getAttribute("href").substring(1);
            const section = document.getElementById(targetId);

            if (section) {
                const rect = section.getBoundingClientRect();
                const offset = Math.abs(rect.top); // Distance entre la section et le haut de la fenêtre

                if (rect.top >= 0 && offset < closestOffset) {
                    closestSection = link;
                    closestOffset = offset;
                }
            }
        });

        // Met à jour les classes actives
        tocLinks.forEach((link) => link.classList.remove("active"));
        if (closestSection) {
            closestSection.classList.add("active");
        }
    }
    
    // Fonction pour gérer les liens de la table des matières
    function setupTocLinks() {
        const tocLinks = tableOfContents.querySelectorAll("a");
    
        tocLinks.forEach((link) => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
    
                const targetId = link.getAttribute("href").substring(1);
                const targetElement = document.getElementById(targetId);
    
                if (targetElement) {
                    const targetPosition = targetElement.getBoundingClientRect().top;
                    const scrollPosition = window.scrollY + targetPosition - 20; // Ajuste le décalage ici (20px pour l'exemple)
    
                    // Utilise window.scrollTo pour un meilleur contrôle
                    window.scrollTo({
                        top: scrollPosition,
                        behavior: "smooth",
                    });
    
                    // Met le lien actif en gras
                    tocLinks.forEach((l) => l.classList.remove("active"));
                    link.classList.add("active");
                }
            });
        });
    
        // Surveiller la section active pendant le défilement
        window.addEventListener("scroll", () => {
            highlightActiveSection(tocLinks);
            updateTocLineHeight(); // Recalcule la ligne à chaque défilement
        });
    }    

    // Fonction pour mettre à jour la table des matières
    function updateTableOfContents(post) {
        const tocContainer = document.querySelector(".tableOfContents nav");
        if (!tocContainer) return;

        if (post.TableOfContents) {
            tocContainer.innerHTML = decodeURIComponent(post.TableOfContents);
        } else {
            tocContainer.innerHTML = "<p>No contents available</p>";
        }

        // Configure les liens pour défiler vers les sections
        setupTocLinks();

        // Recalcule la hauteur de la ligne
        updateTocLineHeight();
    }

    // Fonction pour charger un post
    function loadPost(index) {
        if (filteredPosts.length === 0) {
            // Aucun post disponible
            applyHighlight(currentTag);
            console.warn("No posts found for the current category and tag.");
            return;
        }

        if (index < 0 || index >= filteredPosts.length) {
            console.error("Invalid post index:", index);
            return;
        }

        const post = filteredPosts[index];
        currentIndex = index;

        // Met à jour le contenu dynamique
        if (postTitle) postTitle.textContent = post.Title;
        if (postDate) postDate.textContent = new Date(post.Date).toLocaleDateString();
        if (postContent) postContent.innerHTML = decodeURIComponent(post.Content);
        if (postThumbnail && post.Thumbnail) {
            postThumbnail.src = post.Thumbnail;
            postThumbnail.alt = `Thumbnail for ${post.Title}`;
        } else if (postThumbnail) {
            postThumbnail.src = "";
            postThumbnail.alt = "";
        }

        // Met à jour le tag et la catégorie
        if (heroTag) heroTag.textContent = post.Tags[0] || defaultTag;
        if (categoryLabel) categoryLabel.textContent = post.Category || defaultCategory;

        // Dynamically update the postCategory block's class
        const postCategoryBlock = document.querySelector(".postCategory");
        if (postCategoryBlock) {
            postCategoryBlock.className = "postCategory"; // Reset classes
            const tagClass = post.Tags[0].toLowerCase().replace(/\s+/g, "-"); // Format the tag
            postCategoryBlock.classList.add(tagClass); // Add the class dynamically
        }

        // Met à jour l'avatar
        const avatar = avatarMap[post.Tags[0]] || avatarMap[defaultTag];
        if (heroAvatar && avatar) {
            heroAvatar.src = avatar.image;
            heroAvatar.alt = avatar.alt;
        }

        // Applique la surbrillance en fonction du tag
        if (post.Tags && post.Tags.length > 0) {
            applyHighlight(post.Tags[0]);
        }

        // Met à jour la table des matières
        updateTableOfContents(post);

        // Met à jour l'URL dans la barre d'adresse
        history.pushState({ index, category: currentCategory, tag: currentTag }, post.Title, post.RelPermalink);

        // Met à jour les boutons
        updateNavigationButtons();
    }

    // Fonction pour mettre à jour les boutons de navigation
    function updateNavigationButtons() {
        prevButton.dataset.index = currentIndex - 1;
        nextButton.dataset.index = currentIndex + 1;
        prevButton.disabled = currentIndex <= 0;
        nextButton.disabled = currentIndex >= filteredPosts.length - 1;
    }

    // Gestion des clics sur les boutons Previous et Next
    prevButton?.addEventListener("click", () => loadPost(currentIndex - 1));
    nextButton?.addEventListener("click", () => loadPost(currentIndex + 1));

    // Gestion des clics sur les liens du carousel
    document.addEventListener("click", (e) => {
        const link = e.target.closest("a");
        if (!link || !link.href.includes("/posts/")) return;

        // Intercepte la navigation
        e.preventDefault();

        // Trouve le post correspondant
        const post = posts.find((p) => p.RelPermalink === link.pathname);
        if (post) {
            filterPosts(post.Category, post.Tags[0]);
            loadPost(filteredPosts.findIndex((p) => p.RelPermalink === post.RelPermalink));
        }
    });

    // Gestion du bouton "Retour" du navigateur
    window.addEventListener("popstate", (event) => {
        if (event.state) {
            filterPosts(event.state.category, event.state.tag);
            loadPost(event.state.index);
        }
    });

    // Charge le premier post ou applique le tag par défaut si aucun post
    if (filteredPosts.length > 0) {
        loadPost(0);
    } else {
        applyHighlight(currentTag);
    }

    // Initialisation de la ligne verticale
    updateTocLineHeight();
});

document.addEventListener("DOMContentLoaded", () => {
    // Sélection du bouton
    const switchLights = document.querySelector(".switchLights");
    
    // Vérifie si l'élément existe
    if (!switchLights) {
      console.warn("Le bouton switchLights n'a pas été trouvé.");
      return;
    }
  
    // Vérifie si un thème est enregistré dans localStorage
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      document.body.classList.toggle("light-theme", savedTheme === "light");
    }
  
    // Ajoute un gestionnaire de clic
    switchLights.addEventListener("click", () => {
      // Bascule entre les thèmes
      const isLight = document.body.classList.toggle("light-theme");
  
      // Enregistre le choix de l'utilisateur dans localStorage
      localStorage.setItem("theme", isLight ? "light" : "dark");
    });
  });

  
