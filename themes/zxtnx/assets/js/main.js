(() => {
    // Exécuter le code après le chargement complet du DOM
    document.addEventListener("DOMContentLoaded", () => {
      // Récupération des éléments DOM nécessaires
      const elements = {
        postTitle: document.querySelector(".latestPost__title"),
        postContent: document.querySelector(".latestPost__content"),
        postThumbnail: document.querySelector(".latestPost__thumbnail"),
        postDate: document.querySelector(".latestPost__date"),
        categoryLabel: document.querySelector(".postCategory__title"),
        heroTag: document.querySelector(".hero__tag"),
        heroAvatar: document.querySelector(".hero__avatarImage"),
        prevButton: document.getElementById("prevPost"),
        nextButton: document.getElementById("nextPost"),
        tocNav: document.querySelector(".tableOfContents nav"),
        switchLights: document.querySelector(".switchLights"),
        carouselContainer: document.querySelector(".postsCarousel"),
      };
  
      const posts = postsData || [];
      let currentCategory = defaultCategory || "Default";
      let currentTag = defaultTag || "Default";
      let currentIndex = 0;
      let filteredPosts = [];
  
      // Fonction pour filtrer les posts selon la catégorie et le tag
      const filterPosts = (posts, category, tag) =>
        posts.filter((post) => post.Category === category && post.Tags.includes(tag));
  
      // Met à jour les posts filtrés
      const updateFilteredPosts = () => {
        filteredPosts = filterPosts(posts, currentCategory, currentTag);
      };
  
      // Fonction pour mettre à jour les classes du body selon le tag
      const updateBodyHighlight = (tag) => {
        document.body.classList.remove(
          "reverse-engineering-selection",
          "game-hacking-selection",
          "binary-exploitation-selection"
        );
  
        const tagClassMap = {
          "Reverse-Engineering": "reverse-engineering-selection",
          "Game-Hacking": "game-hacking-selection",
          "Binary-Exploitation": "binary-exploitation-selection",
        };
  
        if (tagClassMap[tag]) document.body.classList.add(tagClassMap[tag]);
      };
  
      // Fonction pour charger un post à un index donné
      const loadPost = (index) => {
        if (!filteredPosts.length) {
          console.warn("Aucun post disponible.");
          return;
        }
  
        if (index < 0 || index >= filteredPosts.length) {
          console.error("Index de post invalide :", index);
          return;
        }
  
        const post = filteredPosts[index];
        currentIndex = index;
  
        // Mise à jour des éléments DOM dynamiques
        if (elements.postTitle) elements.postTitle.textContent = post.Title;
        if (elements.postDate) elements.postDate.textContent = new Date(post.Date).toLocaleDateString();
        if (elements.postContent) elements.postContent.innerHTML = post.Content || "Contenu indisponible";
  
        if (elements.postThumbnail) {
          elements.postThumbnail.src = post.Thumbnail || "";
          elements.postThumbnail.alt = post.Thumbnail ? `Thumbnail for ${post.Title}` : "No thumbnail";
        }
  
        if (elements.heroTag) elements.heroTag.textContent = post.Tags[0] || defaultTag;
        if (elements.categoryLabel) elements.categoryLabel.textContent = post.Category || defaultCategory;
  
        // Mise à jour dynamique de la classe du bloc postCategory
        const postCategoryBlock = document.querySelector(".postCategory");
        if (postCategoryBlock) {
            // Réinitialise la classe et ajoute la classe correspondant au tag
            postCategoryBlock.className = "postCategory";
            const tagClass = post.Tags[0]?.toLowerCase().replace(/\s+/g, "-"); // Convertit le tag en classe CSS
            if (tagClass) {
            postCategoryBlock.classList.add(tagClass);
            }
        }

        updateTableOfContents(post);
        updateBodyHighlight(post.Tags[0]);
        updateNavigationButtons();
  
        // Mise à jour de l'URL dans la barre d'adresse
        history.pushState(
          { index, category: currentCategory, tag: currentTag },
          post.Title,
          post.RelPermalink
        );
      };
  
      // Fonction pour mettre à jour la Table of Contents
      const updateTableOfContents = (post) => {
        if (!elements.tocNav) return;
  
        elements.tocNav.innerHTML = post.TableOfContents || "<p>No contents available</p>";
        setupTocLinks();
        updateTocLineHeight();
      };
  
      // Fonction pour gérer les clics sur les liens de la Table of Contents
      const setupTocLinks = () => {
        const tocLinks = elements.tocNav?.querySelectorAll("a");
        if (!tocLinks) return;
  
        tocLinks.forEach((link) =>
          link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = link.getAttribute("href")?.substring(1);
            const targetElement = document.getElementById(targetId);
  
            if (targetElement) {
              window.scrollTo({
                top: targetElement.offsetTop - 20,
                behavior: "smooth",
              });
  
              tocLinks.forEach((l) => l.classList.remove("active"));
              link.classList.add("active");
            }
          })
        );
      };
  
      // Fonction pour calculer la hauteur de la ligne verticale
      const updateTocLineHeight = () => {
        const toc = document.querySelector(".tableOfContents");
        const lastLink = toc?.querySelector("nav ul li:last-child a");
  
        if (toc && lastLink) {
          const height = Math.max(
            0,
            lastLink.getBoundingClientRect().bottom - toc.getBoundingClientRect().top + 26
          );
          toc.style.setProperty("--toc-line-height", `${height}px`);
        }
      };
  
      // Fonction pour mettre à jour les boutons de navigation
      const updateNavigationButtons = () => {
        if (elements.prevButton) {
          elements.prevButton.dataset.index = currentIndex - 1;
          elements.prevButton.disabled = currentIndex <= 0;
        }
  
        if (elements.nextButton) {
          elements.nextButton.dataset.index = currentIndex + 1;
          elements.nextButton.disabled = currentIndex >= filteredPosts.length - 1;
        }
      };
  
      // Gestion des clics sur les boutons "Précédent" et "Suivant"
      elements.prevButton?.addEventListener("click", () => loadPost(currentIndex - 1));
      elements.nextButton?.addEventListener("click", () => loadPost(currentIndex + 1));
  
      // Gestion des clics sur les éléments du carousel
      const setupCarouselClicks = () => {
        if (!elements.carouselContainer) return;
  
        elements.carouselContainer.addEventListener("click", (e) => {
          const link = e.target.closest("a");
          if (!link) return;
  
          e.preventDefault();
          const targetPost = posts.find((p) => p.RelPermalink === link.pathname);
          if (targetPost) {
            currentCategory = targetPost.Category;
            currentTag = targetPost.Tags[0];
            updateFilteredPosts();
            const newIndex = filteredPosts.findIndex((p) => p.RelPermalink === targetPost.RelPermalink);
            if (newIndex !== -1) loadPost(newIndex);
          }
        });
      };
  
      // Fonction pour initialiser le switch de thème (sombre/clair)
      const initThemeSwitcher = () => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) document.body.classList.toggle("light-theme", savedTheme === "light");
  
        elements.switchLights?.addEventListener("click", () => {
          const isLight = document.body.classList.toggle("light-theme");
          localStorage.setItem("theme", isLight ? "light" : "dark");
        });
      };
  
      // Initialisation des données filtrées
      updateFilteredPosts();
  
      // Chargement initial
      if (filteredPosts.length > 0) {
        loadPost(0);
      } else {
        updateBodyHighlight(currentTag);
      }
  
      // Gestion du bouton "Retour" dans l'historique du navigateur
      window.addEventListener("popstate", ({ state }) => {
        if (state) {
          currentCategory = state.category;
          currentTag = state.tag;
          updateFilteredPosts();
          loadPost(state.index);
        }
      });
  
      // Initialisation des événements
      initThemeSwitcher();
      setupCarouselClicks();

      let sliderWrap = document.querySelector('.postsCarousel__track');
      let wrapper = document.querySelector('.postsCarousel__wrapper');
      let items = [...document.querySelectorAll('.postsCarousel__post')];
      let currentTranslate = 0;
      const defaultSpeed = 0.33;
      let scrollSpeed = defaultSpeed;
      let isDragging = false;
      let startY = 0;
      let lastY = 0;

      function createClones() {
        for (let i = 0; i < 3; i++) {
          items.forEach(item => {
            const clone = item.cloneNode(true);
            clone.classList.add('js-clone');
            sliderWrap.appendChild(clone);
          });
        }
        
        items.forEach(item => {
          const clone = item.cloneNode(true);
          clone.classList.add('js-clone');
          sliderWrap.insertBefore(clone, sliderWrap.firstChild);
        });
      }

      function getContentHeight() {
        const singleSetHeight = items.reduce((total, item) => {
          return total + item.offsetHeight + 60;
        }, 0);
        return singleSetHeight;
      }

      function resetPosition() {
        const contentHeight = getContentHeight();
        if (Math.abs(currentTranslate) >= contentHeight * 2) {
          currentTranslate = -contentHeight;
        } else if (currentTranslate > 0) {
          currentTranslate = -contentHeight;
        }
      }

      function animate() {
        if (!isDragging) {
          currentTranslate -= scrollSpeed;
        }
        resetPosition();
        sliderWrap.style.transform = `translateY(${currentTranslate}px)`;
        requestAnimationFrame(animate);
      }

      function handleMouseDown(e) {
        isDragging = true;
        startY = e.clientY;
        lastY = e.clientY;
        wrapper.style.cursor = 'grabbing';
        scrollSpeed = 0;
      }

      function handleMouseMove(e) {
        if (!isDragging) return;
        
        const deltaY = e.clientY - lastY;
        currentTranslate += deltaY;
        lastY = e.clientY;
      }

      function handleMouseUp() {
        isDragging = false;
        wrapper.style.cursor = 'grab';

        // Réinitialise la vitesse à la valeur de base
        scrollSpeed = defaultSpeed; // Même valeur que celle définie au début
      }

      function initCarousel() {
        currentTranslate = -getContentHeight();
        sliderWrap.style.transform = `translateY(${currentTranslate}px)`;
        
        createClones();
        
        // Événements déplacés sur le wrapper
        wrapper.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        // Style du curseur sur le wrapper
        wrapper.style.cursor = 'grab';
        
        wrapper.addEventListener('mouseenter', () => {
          if (!isDragging) scrollSpeed = 0;
        });

        wrapper.addEventListener('mouseleave', () => {
          if (!isDragging) scrollSpeed = defaultSpeed;
          if (isDragging) {
            handleMouseUp();
          }
        });

        wrapper.addEventListener('selectstart', e => e.preventDefault());
        
        requestAnimationFrame(animate);
      }

      initCarousel();
    });
  })();

  