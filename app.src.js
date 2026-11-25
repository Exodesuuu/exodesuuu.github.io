/**
 * James Mesa - Graphic Design Catalogue App Logic
 * Version: Particle Background & NEW DESIGN DROP Hero Slider & Resets
 */

document.addEventListener('DOMContentLoaded', () => {

  // Auto-clone marquee content to ensure seamless loop on ultra-wide screens
  const marqueeWrap = document.querySelector('.marquee-wrap');
  if (marqueeWrap) {
    const marqueeContent = document.querySelector('.marquee-content');
    if (marqueeContent) {
      for (let i = 0; i < 4; i++) {
        const clone = marqueeContent.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        marqueeWrap.appendChild(clone);
      }
    }
  }

  // Global State
  let activeTab = 'jersey'; // jersey, shirt, poloshirt, logo
  let activeColorFilter = 'all';
  let activeSubCategory = 'all';
  let searchQuery = '';
  let showFavoritesOnly = false;
  
  // Categorized database
  const categoriesDb = {};
  const jerseyCategoriesKeys = []; // Black, White, Blue, etc.
  const apparelCategoriesKeys = []; // Shirt, Poloshirt, Logo
  const featuredSliderImages = [];
  
  let favorites = [];
  try {
    favorites = JSON.parse(localStorage.getItem('jm_portfolio_favorites') || '[]');
  } catch (e) {
    console.warn('Could not access localStorage. Favorites will not be saved.', e);
  }
  
  // Lightbox active navigation context
  let lightboxActiveList = [];
  let lightboxActiveIndex = 0;
  let lightboxCategoryName = '';

  // ==========================================================================
  // DATA INGESTION & NORMALIZATION (Sorted: Newest designs at the top!)
  // ==========================================================================
  if (typeof PORTFOLIO_DATA !== 'undefined') {
    PORTFOLIO_DATA.forEach(category => {
      // Extract design categories
      if (category.IsDesignCategory) {
        if (category.Name.toLowerCase().includes('new drop')) return;
        const cleanCatName = category.Name.replace('Design - ', '');
        
        // Settle group details
        const isShirt = category.Name.toLowerCase().includes('tshirt') || category.Name.toLowerCase().includes('shirt') && !category.Name.toLowerCase().includes('polo');
        const isPolo = category.Name.toLowerCase().includes('polo');
        const isLogo = category.Name.toLowerCase().includes('logo');
        const isBaseball = category.Name.toLowerCase().includes('baseball');
        const isFootball = category.Name.toLowerCase().includes('football');
        const isHoodie = category.Name.toLowerCase().includes('hoodie');
        
        let typeGroup = 'jersey';
        if (isShirt) typeGroup = 'shirt';
        else if (isPolo) typeGroup = 'poloshirt';
        else if (isBaseball) typeGroup = 'baseball';
        else if (isFootball) typeGroup = 'football';
        else if (isHoodie) typeGroup = 'hoodie';
        else if (isLogo) typeGroup = 'logo';

        // Ensure manual sorting allows images to be shown exactly as in data.js
        const sortedImages = [...category.Images];

        categoriesDb[cleanCatName] = {
          name: cleanCatName,
          type: typeGroup,
          color: cleanCatName.toLowerCase(),
          images: sortedImages,
          featuredImage: sortedImages[0]
        };
        
        // Separate key lists for the tabs
        if (typeGroup === 'jersey') {
          jerseyCategoriesKeys.push(cleanCatName);
        } else {
          apparelCategoriesKeys.push(cleanCatName);
        }
      }
    });
  }

  // Populate Hero Showcase Slider (NEW DESIGN DROP - Only show images from dedicated 'New Drop' category)
  let hasNewDrop = false;
  if (typeof PORTFOLIO_DATA !== 'undefined') {
    const newDropCat = PORTFOLIO_DATA.find(c => c.Name.toLowerCase().includes('new drop'));
    if (newDropCat && newDropCat.Images && newDropCat.Images.length > 0) {
      hasNewDrop = true;
      newDropCat.Images.forEach(img => {
        featuredSliderImages.push({
          url: img,
          category: 'NEW DESIGN DROP'
        });
      });
    }
  }

  // Fallback: If no dedicated 'New Drop' category is found, fall back to taking the first image from each category
  if (!hasNewDrop) {
    Object.keys(categoriesDb).forEach(key => {
      const catObj = categoriesDb[key];
      if (catObj.images && catObj.images.length > 0) {
        featuredSliderImages.push({
          url: catObj.images[0],
          category: `NEW ${catObj.type.toUpperCase()} DROP: ${catObj.name}`
        });
      }
    });
  }

  // ==========================================================================
  // CANVAS BACKGROUND (PARTICLE CONSTELLATION ENGINE - DARK MODE ALWAYS)
  // ==========================================================================
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let burstParticles = [];
    let mouse = { x: null, y: null, radius: 150 };

    class BurstParticle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.radius = Math.random() * 2 + 1;
        this.alpha = 1.0;
        this.decay = Math.random() * 0.02 + 0.015;
        this.color = Math.random() > 0.5 ? 'rgba(0, 240, 255, ' : 'rgba(157, 0, 255, ';
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.alpha -= this.decay;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color + this.alpha + ')';
        ctx.fill();
      }
    }

    function generateBurst(x, y) {
      for (let i = 0; i < 15; i++) {
        burstParticles.push(new BurstParticle(x, y));
      }
    }

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    }

    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 1.5 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x -= dx / dist * force * 0.8;
            this.y -= dy / dist * force * 0.8;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fill();
      }
    }

    function initParticles() {
      particles = [];
      const count = Math.min(100, Math.floor((canvas.width * canvas.height) / 11000));
      for (let i = 0; i < count; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        particles.push(new Particle(x, y));
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      // Update and draw click burst particles
      for (let i = burstParticles.length - 1; i >= 0; i--) {
        const bp = burstParticles[i];
        bp.update();
        bp.draw();
        if (bp.alpha <= 0) {
          burstParticles.splice(i, 1);
        }
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const alpha = (110 - dist) / 110 * 0.12;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      if (mouse.x !== null && mouse.y !== null) {
        particles.forEach(p => {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            const alpha = (130 - dist) / 130 * 0.15;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        });
      }

      requestAnimationFrame(animate);
    }

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mousedown', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      generateBurst(e.clientX, e.clientY);
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();
  }


  // ==========================================================================
  // HERO SHOWCASE SLIDER (NEW DESIGN DROP)
  // ==========================================================================
  let sliderIndex = 0;
  const sliderImg = document.getElementById('hero-slider-img');
  const sliderCategory = document.getElementById('hero-slider-category');
  const sliderIndicator = document.getElementById('hero-slider-indicator');
  const sliderPrevBtn = document.getElementById('slider-prev');
  const sliderNextBtn = document.getElementById('slider-next');
  let sliderTimer;

  function updateSlider(immediate = false) {
    if (featuredSliderImages.length === 0 || !sliderImg) return;
    const current = featuredSliderImages[sliderIndex];
    
    if (immediate) {
      sliderImg.src = current.url;
      sliderCategory.textContent = current.category;
      sliderIndicator.textContent = `${sliderIndex + 1} / ${featuredSliderImages.length}`;
      sliderImg.style.opacity = 1;
      return;
    }

    // Smooth transition: brief fade out, swap, fade in
    sliderImg.style.opacity = 0;
    setTimeout(() => {
      sliderImg.src = current.url;
      sliderCategory.textContent = current.category;
      sliderIndicator.textContent = `${sliderIndex + 1} / ${featuredSliderImages.length}`;
      sliderImg.style.opacity = 1;
    }, 350);
  }

  function nextSliderImage() {
    sliderIndex = (sliderIndex + 1) % featuredSliderImages.length;
    updateSlider();
    resetSliderTimer();
  }

  function prevSliderImage() {
    sliderIndex = (sliderIndex - 1 + featuredSliderImages.length) % featuredSliderImages.length;
    updateSlider();
    resetSliderTimer();
  }

  function resetSliderTimer() {
    clearInterval(sliderTimer);
    sliderTimer = setInterval(nextSliderImage, 5000);
  }

  if (sliderPrevBtn && sliderNextBtn) {
    sliderPrevBtn.addEventListener('click', prevSliderImage);
    sliderNextBtn.addEventListener('click', nextSliderImage);
    updateSlider(true);
    resetSliderTimer();
  }


  // ==========================================================================
  // INFINITE MARQUEE WAVY BOB ENGINE (antigravity.google style)
  // ==========================================================================
  function animateMarqueeWave() {
    const badges = document.querySelectorAll('.marquee-badge');
    badges.forEach(badge => {
      const rect = badge.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const waveY = Math.sin((centerX / window.innerWidth) * Math.PI * 2.5) * 28;
      badge.style.transform = `translateY(${waveY}px)`;
    });
    requestAnimationFrame(animateMarqueeWave);
  }
  
  requestAnimationFrame(animateMarqueeWave);


  // ==========================================================================
  // INQUIRY FORM ATTACHMENT CONTROLLER
  // ==========================================================================
  const fileMockBtn = document.getElementById('file-mock-btn');
  const fileRealInput = document.getElementById('form-attachment');
  const fileNameDisplay = document.getElementById('file-name-display');

  if (fileMockBtn && fileRealInput && fileNameDisplay) {
    fileMockBtn.addEventListener('click', () => {
      fileRealInput.click();
    });

    fileRealInput.addEventListener('change', () => {
      if (fileRealInput.files && fileRealInput.files.length > 0) {
        fileNameDisplay.textContent = fileRealInput.files[0].name;
      } else {
        fileNameDisplay.textContent = 'No file selected';
      }
    });
  }


  // ==========================================================================
  // DYNAMIC CATEGORY TABS, SUB-CATEGORIES & FILTER ENGINE
  // ==========================================================================
  const catalogueGrid = document.getElementById('catalogue-grid-container');
  const searchInput = document.getElementById('catalogue-search');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const filterFavToggle = document.getElementById('filter-fav-toggle');
  const resetFiltersBtn = document.getElementById('reset-filters-btn');
  const resultCountText = document.getElementById('result-count');
  
  const categoryTabs = document.getElementById('category-tabs');
  const colorFilters = document.getElementById('color-filters');
  const colorFiltersWrapper = document.getElementById('color-filters-wrapper');
  
  const subCategoryFiltersWrapper = document.getElementById('sub-category-filters-wrapper');
  const subCategoryLabel = document.getElementById('sub-category-label');
  const subCategoryFiltersContainer = document.getElementById('sub-category-filters');
  const headbarFavToggleBtn = document.getElementById('favorites-toggle-btn');
  
  // Favorites Drawer DOM Elements
  const favoritesDrawer = document.getElementById('favorites-drawer');
  const drawerCloseBtn = document.getElementById('drawer-close-btn');
  const drawerOverlay = document.getElementById('drawer-overlay');
  const drawerItemsContainer = document.getElementById('drawer-items-container');
  const drawerCount = document.getElementById('drawer-count');
  const drawerShareBtn = document.getElementById('drawer-share-btn');
  const drawerClearBtn = document.getElementById('drawer-clear-btn');
  const drawerInquireBtn = document.getElementById('drawer-inquire-btn');

  // Configure sub-category filter lists dynamically
  const subCategoryOptions = {
    shirt: ['Sports', 'Event', 'Corporate']
  };

  function updateSubCategoryUI() {
    if (!subCategoryFiltersContainer) return;
    subCategoryFiltersContainer.innerHTML = '';
    activeSubCategory = 'all';

    const options = subCategoryOptions[activeTab];
    if (!options) {
      subCategoryFiltersWrapper.classList.add('hidden');
      return;
    }

    subCategoryFiltersWrapper.classList.remove('hidden');
    subCategoryLabel.textContent = `T-Shirt Type`;

    // Render "All" option
    const allBtn = document.createElement('button');
    allBtn.className = 'sub-cat-btn active';
    allBtn.textContent = 'All';
    allBtn.setAttribute('data-subcat', 'all');
    subCategoryFiltersContainer.appendChild(allBtn);

    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'sub-cat-btn';
      btn.textContent = opt;
      btn.setAttribute('data-subcat', opt);
      subCategoryFiltersContainer.appendChild(btn);
    });
  }

  // Handle sub-category click selections
  if (subCategoryFiltersContainer) {
    subCategoryFiltersContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.sub-cat-btn');
      if (btn) {
        subCategoryFiltersContainer.querySelectorAll('.sub-cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeSubCategory = btn.getAttribute('data-subcat');
        applyFilters();
      }
    });
  }

  // Category Icon Tab switches
  if (categoryTabs) {
    categoryTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.cat-tab-btn');
      if (btn) {
        categoryTabs.querySelectorAll('.cat-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeTab = btn.getAttribute('data-category');
        
        // AUTO-RESET SEARCH AND FILTERS WHEN TAB SWITCHED
        searchQuery = '';
        if (searchInput) {
          searchInput.value = '';
          searchClearBtn.style.display = 'none';
        }
        showFavoritesOnly = false;
        if (filterFavToggle) filterFavToggle.classList.remove('active');
        if (headbarFavToggleBtn) headbarFavToggleBtn.classList.remove('active');
        
        // Show color theme ONLY on 'jersey' tab (first option)
        if (activeTab === 'jersey') {
          colorFiltersWrapper.classList.remove('hidden');
        } else {
          colorFiltersWrapper.classList.add('hidden');
        }

        // Reset color swatch
        activeColorFilter = 'all';
        if (colorFilters) {
          colorFilters.querySelectorAll('.color-swatch').forEach(sw => sw.classList.remove('active'));
          colorFilters.querySelector('[data-color="all"]').classList.add('active');
        }

        // Render sub-category filters for Tshirt
        updateSubCategoryUI();
        applyFilters();
      }
    });
  }

  // Search input listeners
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      searchClearBtn.style.display = searchQuery.length > 0 ? 'block' : 'none';
      applyFilters();
    });
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      searchClearBtn.style.display = 'none';
      applyFilters();
    });
  }

  // Filter Fav Toggle (In Catalogue panel)
  if (filterFavToggle) {
    filterFavToggle.addEventListener('click', () => {
      showFavoritesOnly = !showFavoritesOnly;
      filterFavToggle.classList.toggle('active', showFavoritesOnly);
      if (headbarFavToggleBtn) headbarFavToggleBtn.classList.toggle('active', showFavoritesOnly);
      applyFilters();
    });
  }

  // Open/Close and Render Drawer Functions
  function openDrawer() {
    if (favoritesDrawer) favoritesDrawer.classList.add('open');
    if (drawerOverlay) drawerOverlay.classList.add('open');
    renderDrawerItems();
  }

  function closeDrawer() {
    if (favoritesDrawer) favoritesDrawer.classList.remove('open');
    if (drawerOverlay) drawerOverlay.classList.remove('open');
  }

  function renderDrawerItems() {
    if (!drawerItemsContainer) return;
    drawerItemsContainer.innerHTML = '';
    
    if (favorites.length === 0) {
      drawerItemsContainer.innerHTML = `
        <div class="drawer-empty-state">
          <i class="fa-regular fa-heart"></i>
          <p>Your shortlist is empty.<br>Click the heart icon on any design to add it!</p>
        </div>
      `;
      if (drawerCount) drawerCount.textContent = '0';
      return;
    }
    
    if (drawerCount) drawerCount.textContent = favorites.length;
    
    favorites.forEach((url) => {
      let rawFileName = url.split('/').pop() || '';
      rawFileName = rawFileName.replace(/\.(jpg|jpeg|png|webp|gif|svg)$/i, '');
      
      const card = document.createElement('div');
      card.className = 'drawer-item-card';
      card.innerHTML = `
        <img src="${url}" alt="${rawFileName}" class="drawer-item-img">
        <div class="drawer-item-info">
          <h4 class="drawer-item-title">${rawFileName}</h4>
        </div>
        <button class="drawer-item-remove" aria-label="Remove template"><i class="fa-solid fa-trash"></i></button>
      `;
      
      card.querySelector('.drawer-item-remove').addEventListener('click', () => {
        toggleFavorite(url);
      });
      
      drawerItemsContainer.appendChild(card);
    });
  }

  // Headbar Favorites Button Click -> Open Drawer
  if (headbarFavToggleBtn) {
    headbarFavToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openDrawer();
    });
  }

  // Bind Drawer Close actions
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

  if (drawerClearBtn) {
    drawerClearBtn.addEventListener('click', () => {
      favorites = [];
      try {
        localStorage.setItem('jm_portfolio_favorites', JSON.stringify(favorites));
      } catch (e) {
        console.warn('Could not save to localStorage.', e);
      }
      
      renderDrawerItems();
      
      // Update count badge
      const favCountBadge = document.getElementById('fav-count');
      if (favCountBadge) {
        favCountBadge.textContent = '0';
      }
      
      // Update grid tiles
      const activeTiles = document.querySelectorAll('.category-tile-card');
      activeTiles.forEach(tile => {
        const tileFavBtn = tile.querySelector('.tile-fav-btn');
        if (tileFavBtn) {
          tileFavBtn.innerHTML = `<i class="fa-regular fa-heart"></i>`;
        }
      });
      
      // Update lightbox
      if (lightboxFavActionBtn) {
        lightboxFavActionBtn.classList.remove('favorited');
        lightboxFavActionBtn.innerHTML = `<i class="fa-regular fa-heart"></i> Favorite`;
      }
      
      if (showFavoritesOnly) {
        applyFilters();
      }
    });
  }

  if (drawerShareBtn) {
    drawerShareBtn.addEventListener('click', async () => {
      if (favorites.length === 0) {
        showToast('Add at least one design to your shortlist first.');
        return;
      }
      const baseUrl = window.location.protocol.startsWith('http')
        ? `${window.location.origin}${window.location.pathname}`
        : 'https://www.jamesmesa.online/';
      const shareUrl = `${baseUrl}?shortlist=${encodeURIComponent(favorites.join('|'))}`;
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(shareUrl);
          showToast('Shortlist link copied! Share it with your team.');
        } else if (navigator.share) {
          await navigator.share({ title: 'Jersey Design Shortlist', url: shareUrl });
        }
      } catch (e) {
        showToast('Ready to share: ' + shareUrl);
      }
    });
  }

  if (drawerInquireBtn) {
    drawerInquireBtn.addEventListener('click', () => {
      closeDrawer();
      openQuoteModal({
        packageName: favorites.length > 1 ? 'Bulk Team Package (10+ Units)' : 'Single Pre-Made Design',
        designs: favorites.length > 0 ? [...favorites] : []
      });
    });
  }

  // Color Swatch buttons
  if (colorFilters) {
    colorFilters.addEventListener('click', (e) => {
      if (e.target.classList.contains('color-swatch')) {
        colorFilters.querySelectorAll('.color-swatch').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        activeColorFilter = e.target.getAttribute('data-color');
        applyFilters();
      }
    });
  }

  // Reset Filters Button
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      searchClearBtn.style.display = 'none';
      
      showFavoritesOnly = false;
      if (filterFavToggle) filterFavToggle.classList.remove('active');
      if (headbarFavToggleBtn) headbarFavToggleBtn.classList.remove('active');
      
      activeColorFilter = 'all';
      if (colorFilters) {
        colorFilters.querySelectorAll('.color-swatch').forEach(swatch => swatch.classList.remove('active'));
        colorFilters.querySelector('[data-color="all"]').classList.add('active');
      }

      // Reset sub-category
      activeSubCategory = 'all';
      const activeSubBtn = subCategoryFiltersContainer?.querySelector('[data-subcat="all"]');
      if (activeSubBtn) {
        subCategoryFiltersContainer.querySelectorAll('.sub-cat-btn').forEach(b => b.classList.remove('active'));
        activeSubBtn.classList.add('active');
      }

      applyFilters();
    });
  }

  // Helper: extract clean design title from path
  function getDesignTitleFromUrl(url) {
    const rawFileName = (url.split('/').pop() || '').replace(/\.(jpg|jpeg|png|webp|gif|svg)$/i, '');
    return rawFileName || 'Sportswear Design';
  }

  // Sync URL query params for shareable / crawlable category & search views
  function syncUrlParams() {
    try {
      const params = new URLSearchParams();
      if (activeTab && activeTab !== 'jersey') params.set('tab', activeTab);
      if (activeTab === 'jersey' && activeColorFilter !== 'all') params.set('color', activeColorFilter);
      if (activeTab === 'shirt' && activeSubCategory !== 'all') params.set('subcat', activeSubCategory);
      if (searchQuery) params.set('q', searchQuery);
      if (showFavoritesOnly && favorites.length > 0) params.set('shortlist', favorites.join('|'));
      const queryStr = params.toString();
      const nextUrl = queryStr ? `${window.location.pathname}?${queryStr}${window.location.hash}` : `${window.location.pathname}${window.location.hash}`;
      window.history.replaceState(null, '', nextUrl);
    } catch (e) {
      // Ignore history errors in restricted contexts
    }
  }

  // Filter keys logic
  function applyFilters() {
    let filteredKeys = [];

    // When search query is active, search across ALL design filenames and categories!
    if (searchQuery.length > 0) {
      filteredKeys = Object.keys(categoriesDb).filter(key => {
        const cat = categoriesDb[key];
        const catMatches = cat.name.toLowerCase().includes(searchQuery) || cat.type.toLowerCase().includes(searchQuery);
        const imageMatches = cat.images.some(img => getDesignTitleFromUrl(img).toLowerCase().includes(searchQuery) || img.toLowerCase().includes(searchQuery));
        if (!catMatches && !imageMatches) return false;
        if (showFavoritesOnly && !cat.images.some(img => favorites.includes(img))) return false;
        return true;
      });
    } else if (activeTab === 'jersey') {
      filteredKeys = jerseyCategoriesKeys.filter(key => {
        const cat = categoriesDb[key];
        
        if (activeColorFilter !== 'all' && cat.color !== activeColorFilter) {
          return false;
        }

        if (showFavoritesOnly) {
          const hasFav = cat.images.some(img => favorites.includes(img));
          if (!hasFav) return false;
        }

        return true;
      });
    } else {
      filteredKeys = apparelCategoriesKeys.filter(key => {
        const cat = categoriesDb[key];
        
        if (cat.type !== activeTab) return false;

        if (showFavoritesOnly) {
          const hasFav = cat.images.some(img => favorites.includes(img));
          if (!hasFav) return false;
        }

        return true;
      });
    }

    const isFiltered = activeColorFilter !== 'all' || searchQuery.length > 0 || showFavoritesOnly || activeSubCategory !== 'all';
    if (resetFiltersBtn) resetFiltersBtn.style.display = isFiltered ? 'inline-block' : 'none';

    syncUrlParams();
    renderGrid(filteredKeys);

    // Update results label description with accurate counts
    if (resultCountText) {
      if (searchQuery.length > 0) {
        resultCountText.textContent = `Found ${currentImageItems.length} design${currentImageItems.length === 1 ? '' : 's'} matching "${searchQuery}"`;
      } else if (showFavoritesOnly) {
        resultCountText.textContent = `Showing ${currentImageItems.length} favorited design${currentImageItems.length === 1 ? '' : 's'}`;
      } else if (activeTab === 'jersey' && activeColorFilter !== 'all') {
        resultCountText.textContent = `Showing ${currentImageItems.length} ${activeColorFilter} jersey designs`;
      } else if (activeTab === 'shirt' && activeSubCategory !== 'all') {
        resultCountText.textContent = `Showing ${currentImageItems.length} ${activeSubCategory} T-Shirt designs`;
      } else if (['logo', 'baseball', 'football', 'hoodie', 'poloshirt'].includes(activeTab)) {
        resultCountText.textContent = `Showing ${currentImageItems.length} ${activeTab} designs`;
      } else {
        resultCountText.textContent = `Showing ${filteredKeys.length} categories (${activeTab.toUpperCase()})`;
      }
    }
  }

  // Render Grid
    const ITEMS_PER_PAGE = 12;
    let renderedCount = 0;
    let currentImageItems = [];
    let scrollObserver = null;

    function renderImageBatch() {
      const itemsToRender = currentImageItems.slice(renderedCount, renderedCount + ITEMS_PER_PAGE);
      const allUrls = currentImageItems.map(i => i.url);
      
      itemsToRender.forEach((item, index) => {
        const card = createIndividualPictureTile(item, renderedCount + index, allUrls);
        catalogueGrid.appendChild(card);
      });
      
      renderedCount += itemsToRender.length;
    }

    // Render Grid
    function renderGrid(keys) {
      if (!catalogueGrid) return;
      catalogueGrid.innerHTML = '';
      
      // Reset Infinite Scroll
      if (scrollObserver) {
        scrollObserver.disconnect();
        scrollObserver = null;
      }
      renderedCount = 0;
      currentImageItems = [];
  
      // Check if we are in individual picture mode or category type mode
      const isSearchOrFavView = searchQuery.length > 0 || showFavoritesOnly;
      const isJerseyPictureView = (activeTab === 'jersey' && activeColorFilter !== 'all');
      const isApparelPictureView = (activeTab === 'shirt' && activeSubCategory !== 'all');
      const isStandaloneType = ['logo', 'baseball', 'football', 'hoodie', 'poloshirt'].includes(activeTab);
  
      if (isSearchOrFavView || isJerseyPictureView || isApparelPictureView || isStandaloneType) {
        // Gather all individual matching pictures
        keys.forEach(key => {
          const originalCat = categoriesDb[key];
          
          originalCat.images.forEach((imgUrl) => {
            let matches = true;
            if (!isSearchOrFavView && activeTab === 'shirt' && activeSubCategory !== 'all') {
              const subStr = `/${activeSubCategory.toLowerCase()}/`;
              if (!imgUrl.toLowerCase().includes(subStr)) {
                matches = false;
              }
            }
  
            // Verify favorites only
            if (showFavoritesOnly && !favorites.includes(imgUrl)) {
              matches = false;
            }
  
            // Verify search queries against design filename OR category name
            if (searchQuery.length > 0) {
              const titleLower = getDesignTitleFromUrl(imgUrl).toLowerCase();
              const catLower = originalCat.name.toLowerCase();
              const typeLower = originalCat.type.toLowerCase();
              const urlLower = imgUrl.toLowerCase();
              if (!titleLower.includes(searchQuery) && !catLower.includes(searchQuery) && !typeLower.includes(searchQuery) && !urlLower.includes(searchQuery)) {
                matches = false;
              }
            }
  
            if (matches) {
              currentImageItems.push({
                url: imgUrl,
                categoryName: originalCat.name,
                type: originalCat.type
              });
            }
          });
        });
  
        if (currentImageItems.length === 0) {
          const isCustomTab = (activeTab === 'football' || activeTab === 'logo') && searchQuery.length === 0 && !showFavoritesOnly;
          const label = activeTab === 'football' ? 'Football / Soccer Kits' : activeTab === 'logo' ? 'Team Logos & Crests' : 'Matching Designs';
          catalogueGrid.innerHTML = isCustomTab ? `
            <div class="grid-empty-state">
              <i class="fa-solid fa-pen-ruler"></i>
              <h3>Custom ${label} Available</h3>
              <p>I design custom ${label.toLowerCase()} from scratch with 24–48h 3D mockups and print-ready .AI/.EPS vectors. Request a custom concept for your team!</p>
              <button type="button" class="btn btn-primary open-empty-quote-btn">Request Custom ${activeTab === 'logo' ? 'Logo' : 'Football Kit'}</button>
            </div>
          ` : `
            <div class="grid-empty-state">
              <i class="fa-solid fa-folder-open"></i>
              <h3>No designs match your criteria</h3>
              <p>Try a different team name or keyword, clear your active filters, or request a custom design built from scratch.</p>
            </div>
          `;
          const customBtn = catalogueGrid.querySelector('.open-empty-quote-btn');
          if (customBtn) {
            customBtn.addEventListener('click', () => {
              openQuoteModal({
                packageName: 'Custom Commission',
                garmentType: activeTab === 'logo' ? 'Team Logo / Branding' : 'Football / Soccer Kit'
              });
            });
          }
          return;
        }
  
        // Render first batch
        renderImageBatch();
        
        // Setup Observer
        const sentinel = document.getElementById('scroll-sentinel');
        if (sentinel) {
          scrollObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && renderedCount < currentImageItems.length) {
              renderImageBatch();
            }
          }, { rootMargin: '400px' });
          scrollObserver.observe(sentinel);
        }
  
      } else {
        // Render Category Type Tiles ONLY (ALL is active)
        if (keys.length === 0) {
          catalogueGrid.innerHTML = `
            <div class="grid-empty-state">
              <i class="fa-solid fa-folder-open"></i>
              <h3>No categories match your criteria</h3>
              <p>Try clearing your active filters or searching something else.</p>
            </div>
          `;
          return;
        }
  
        if (activeTab === 'jersey') {
          // Show color category type cards
          keys.forEach(key => {
            const originalCat = categoriesDb[key];
            const card = createCategoryTileElement(originalCat);
            catalogueGrid.appendChild(card);
          });
        } else if (activeTab === 'shirt') {
          // Show 3 sub-category type cards for T-Shirts: Sports, Event, Corporate
          const originalCat = categoriesDb['Tshirt'] || keys.map(k => categoriesDb[k])[0];
          if (originalCat) {
            const subs = [
              { name: 'Sports', title: 'Sports T-Shirts' },
              { name: 'Event', title: 'Event T-Shirts' },
              { name: 'Corporate', title: 'Corporate T-Shirts' }
            ];
            subs.forEach(sub => {
              const card = createSubCategoryCard(sub, originalCat, false);
              catalogueGrid.appendChild(card);
            });
          }
        } else {
          // Logo, baseball, football, hoodie or other categories fallback
          keys.forEach(key => {
            const originalCat = categoriesDb[key];
            const card = createCategoryTileElement(originalCat);
            catalogueGrid.appendChild(card);
          });
        }
      }
    }
  function createSubCategoryCard(subCat, originalCat, isPolo) {
    const subStr = `/${subCat.name.toLowerCase()}/`;
    // Ingest subset of images matching the subcategory folder
    const subImages = originalCat.images.filter(img => img.toLowerCase().includes(subStr));
    const safeFeaturedImg = (subImages.length > 0 ? subImages[0] : originalCat.featuredImage) || 'https://placehold.co/600x600/1a1a1a/ffffff?text=Coming+Soon';

    const card = document.createElement('div');
    card.className = 'category-tile-card';
    
    card.innerHTML = `
      <div class="tile-img-wrap">
        <img class="tile-img" src="${safeFeaturedImg}" alt="${subCat.title} - Custom Sublimation Sportswear Templates by James Mesa" loading="lazy">
        <div class="tile-overlay">
          <div class="tile-bottom-info">
            <span class="tile-tag">${originalCat.type.toUpperCase()}</span>
            <h4 class="tile-title">${subCat.title}</h4>
            <span class="tile-count">${subImages.length} designs</span>
          </div>
        </div>
      </div>
    `;

    let cycleTimer;
    let currentCycleIndex = 0;
    const imgEl = card.querySelector('.tile-img');

    card.addEventListener('mouseenter', () => {
      if (subImages.length <= 1) return;
      
      cycleTimer = setInterval(() => {
        currentCycleIndex = (currentCycleIndex + 1) % subImages.length;
        
        imgEl.style.opacity = 0.5;
        setTimeout(() => {
          imgEl.src = subImages[currentCycleIndex];
          imgEl.style.opacity = 1;
        }, 150);
        
      }, 1000);
    });

    card.addEventListener('mouseleave', () => {
      clearInterval(cycleTimer);
      currentCycleIndex = 0;
      imgEl.src = safeFeaturedImg;
    });

    // Clicking the sub-category tile triggers Picture View!
    card.addEventListener('click', () => {
      activeSubCategory = subCat.name;
      
      // Highlight matching button in the sub-category filter bar
      if (subCategoryFiltersContainer) {
        subCategoryFiltersContainer.querySelectorAll('.sub-cat-btn').forEach(btn => {
          btn.classList.toggle('active', btn.getAttribute('data-subcat') === subCat.name);
        });
      }
      
      applyFilters();
    });

    return card;
  }

  // Create Individual Picture Tile
  function createIndividualPictureTile(item, currentIndex, fullImageList) {
    const card = document.createElement('div');
    card.className = 'category-tile-card individual-photo-card';
    
    // Use the exact photo name (file name) as requested by the user, minus the extension
    let rawFileName = item.url.split('/').pop() || '';
    rawFileName = rawFileName.replace(/\.(jpg|jpeg|png|webp|gif|svg)$/i, '');
    let titleStr = rawFileName || `${item.categoryName} Template #${currentIndex + 1}`;
    
    const isFav = favorites.includes(item.url);
    
    card.innerHTML = `
      <div class="tile-img-wrap">
        <button class="tile-fav-btn" aria-label="Favorite" title="Add to Favorites">
          <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
        </button>
        <img class="tile-img" src="${item.url}" alt="${titleStr} - Custom ${item.categoryName} Sublimated Jersey Design Layout by James Mesa" loading="lazy">
        <div class="tile-overlay">
          <div class="tile-bottom-info">
            <h4 class="tile-title">${titleStr}</h4>
          </div>
        </div>
      </div>
    `;

    // Favorite Button Logic
    const favBtn = card.querySelector('.tile-fav-btn');
    favBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Don't trigger the lightbox click
      toggleFavorite(item.url);
      
      const newIsFav = favorites.includes(item.url);
      favBtn.innerHTML = `<i class="${newIsFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>`;
      
      // If viewing favorites only, re-apply filters to remove it from the grid instantly
      if (showFavoritesOnly) {
        applyFilters();
      }
    });

    // Lightbox Logic
    card.addEventListener('click', () => {
      lightboxActiveList = fullImageList;
      openLightbox(currentIndex, item.categoryName);
    });

    return card;
  }

  // Create Category Tile (Hover Cycling)
  function createCategoryTileElement(cat) {
    const card = document.createElement('div');
    card.className = 'category-tile-card';
    
    let titleStr = `${cat.name} Sportswear`;
    if (cat.type === 'logo') titleStr = `${cat.name} Branding Logos`;
    else if (cat.type === 'shirt') titleStr = `${cat.name} Custom T-Shirts`;
    else if (cat.type === 'poloshirt') titleStr = `${cat.name} Custom Polos`;
    else if (cat.type === 'baseball') titleStr = `${cat.name} Baseball Jerseys`;
    else if (cat.type === 'football') titleStr = `${cat.name} Football Jerseys`;
    else if (cat.type === 'hoodie') titleStr = `${cat.name} Custom Hoodies`;
    
    const safeFeaturedImg = cat.featuredImage || 'https://placehold.co/600x600/1a1a1a/ffffff?text=Coming+Soon';
    
    card.innerHTML = `
      <div class="tile-img-wrap">
        <img class="tile-img" src="${safeFeaturedImg}" alt="${titleStr} - Custom Sportswear and Uniform Designs by James Mesa" loading="lazy">
        <div class="tile-overlay">
          <div class="tile-bottom-info">
            <span class="tile-tag">${cat.type.toUpperCase()}</span>
            <h4 class="tile-title">${titleStr}</h4>
            <span class="tile-count">${cat.images.length} designs</span>
          </div>
        </div>
      </div>
    `;

    let cycleTimer;
    let currentCycleIndex = 0;
    const imgEl = card.querySelector('.tile-img');

    card.addEventListener('mouseenter', () => {
      if (cat.images.length <= 1) return;
      
      cycleTimer = setInterval(() => {
        currentCycleIndex = (currentCycleIndex + 1) % cat.images.length;
        
        imgEl.style.opacity = 0.5;
        setTimeout(() => {
          imgEl.src = cat.images[currentCycleIndex];
          imgEl.style.opacity = 1;
        }, 150);
        
      }, 1000);
    });

    card.addEventListener('mouseleave', () => {
      clearInterval(cycleTimer);
      currentCycleIndex = 0;
      imgEl.src = safeFeaturedImg;
    });

    card.addEventListener('click', () => {
      if (cat.type === 'jersey' && cat.color) {
        // Change filter to the color to mimic clicking the nav filter
        activeColorFilter = cat.color;
        
        // Update the UI buttons
        const colorFiltersElement = document.getElementById('color-filters');
        if (colorFiltersElement) {
          colorFiltersElement.querySelectorAll('.color-swatch').forEach(sw => sw.classList.remove('active'));
          const matchingBtn = colorFiltersElement.querySelector(`[data-color="${cat.color}"]`);
          if (matchingBtn) matchingBtn.classList.add('active');
        }
        
        applyFilters();
      } else {
        if (cat.images && cat.images.length > 0) {
          lightboxActiveList = cat.images;
          openLightbox(currentCycleIndex, cat.name);
        }
      }
    });

    return card;
  }

  // Toggle favorite logic
  function toggleFavorite(url) {
    const index = favorites.indexOf(url);
    if (index === -1) {
      favorites.push(url);
    } else {
      favorites.splice(index, 1);
    }
    
    try {
      localStorage.setItem('jm_portfolio_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.warn('Could not save to localStorage.', e);
    }
    
    const favCountBadge = document.getElementById('fav-count');
    if (favCountBadge) {
      favCountBadge.textContent = favorites.length;
    }
    
    // Keep shortlist drawer in sync
    renderDrawerItems();
    
    // Toggle active styles on headbar if showing favorites only
    if (showFavoritesOnly) {
      applyFilters();
    }
  }


  // ==========================================================================
  // FULLSCREEN LIGHTBOX MODAL
  // ==========================================================================
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
  const lightboxPrevBtn = document.getElementById('lightbox-prev-btn');
  const lightboxNextBtn = document.getElementById('lightbox-next-btn');
  const imgWrap = document.querySelector('.lightbox-image-wrap');
  const lightboxFavActionBtn = document.getElementById('lightbox-fav-btn');
  const lightboxInquireBtn = document.getElementById('lightbox-inquire-btn');
  const lightboxCaption = document.getElementById('lightbox-caption');

  function syncLightboxFavBtn(imageUrl) {
    if (!lightboxFavActionBtn) return;
    const isFavorited = favorites.includes(imageUrl);
    lightboxFavActionBtn.classList.toggle('favorited', isFavorited);
    lightboxFavActionBtn.innerHTML = isFavorited ? 
      `<i class="fa-solid fa-heart"></i> Favorited` : 
      `<i class="fa-regular fa-heart"></i> Favorite`;
  }

  function openLightbox(index, categoryName) {
    lightboxActiveIndex = index;
    lightboxCategoryName = categoryName || 'Sportswear';
    
    const imageUrl = lightboxActiveList[lightboxActiveIndex];
    if (!imageUrl) return;

    lightboxImg.src = imageUrl;
    if (lightboxCaption) {
      lightboxCaption.innerHTML = `${getDesignTitleFromUrl(imageUrl)} <span>${lightboxCategoryName}</span>`;
    }
    syncLightboxFavBtn(imageUrl);

    lightboxModal.style.display = 'block';
    document.body.style.overflow = 'hidden'; 
    if (imgWrap) imgWrap.classList.remove('zoomed');
  }

  function closeLightbox() {
    lightboxModal.style.display = 'none';
    document.body.style.overflow = '';
  }

  function nextLightboxImage() {
    if (lightboxActiveList.length <= 1) return;
    lightboxActiveIndex = (lightboxActiveIndex + 1) % lightboxActiveList.length;
    openLightbox(lightboxActiveIndex, lightboxCategoryName);
  }

  function prevLightboxImage() {
    if (lightboxActiveList.length <= 1) return;
    lightboxActiveIndex = (lightboxActiveIndex - 1 + lightboxActiveList.length) % lightboxActiveList.length;
    openLightbox(lightboxActiveIndex, lightboxCategoryName);
  }

  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
  if (lightboxPrevBtn) lightboxPrevBtn.addEventListener('click', prevLightboxImage);
  if (lightboxNextBtn) lightboxNextBtn.addEventListener('click', nextLightboxImage);

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal || e.target.classList.contains('lightbox-nav-area')) {
        closeLightbox();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && quoteModal && quoteModal.classList.contains('open')) {
      closeQuoteModal();
      return;
    }
    if (lightboxModal && lightboxModal.style.display === 'block') {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextLightboxImage();
      if (e.key === 'ArrowLeft') prevLightboxImage();
    }
  });

  if (imgWrap) {
    imgWrap.addEventListener('dblclick', () => {
      imgWrap.classList.toggle('zoomed');
    });
  }

  if (lightboxFavActionBtn) {
    lightboxFavActionBtn.addEventListener('click', () => {
      const url = lightboxActiveList[lightboxActiveIndex];
      if (!url) return;
      
      toggleFavorite(url);
      
      const isFavorited = favorites.includes(url);
      lightboxFavActionBtn.classList.toggle('favorited', isFavorited);
      lightboxFavActionBtn.innerHTML = isFavorited ? 
        `<i class="fa-solid fa-heart"></i> Favorited` : 
        `<i class="fa-regular fa-heart"></i> Favorite`;
    });
  }

  if (lightboxInquireBtn) {
    lightboxInquireBtn.addEventListener('click', () => {
      const url = lightboxActiveList[lightboxActiveIndex];
      if (!url) return;
      closeLightbox();
      openQuoteModal({
        packageName: 'Single Pre-Made Design',
        designs: [url]
      });
    });
  }

  // ==========================================================================
  // INTERACTIVE QUOTE MODAL (PRE-FILLED WHATSAPP / EMAIL / GOOGLE FORM)
  // ==========================================================================
  const quoteModal = document.getElementById('quote-modal');
  const quoteCloseBtn = document.getElementById('quote-close-btn');
  const quoteSelectedWrap = document.getElementById('quote-selected-wrap');
  const quoteSelectedList = document.getElementById('quote-selected-list');
  const quoteNameInput = document.getElementById('quote-name');
  const quoteCountrySelect = document.getElementById('quote-country');
  const quotePackageSelect = document.getElementById('quote-package');
  const quoteGarmentSelect = document.getElementById('quote-garment');
  const quoteQtySelect = document.getElementById('quote-qty');
  const quoteNotesInput = document.getElementById('quote-notes');
  const quoteWhatsappBtn = document.getElementById('quote-whatsapp-btn');
  const quoteEmailBtn = document.getElementById('quote-email-btn');
  const quoteGformBtn = document.getElementById('quote-gform-btn');
  const appToast = document.getElementById('app-toast');

  let quoteAttachedDesigns = [];

  function showToast(msg) {
    if (!appToast) return;
    appToast.textContent = msg;
    appToast.classList.add('show');
    setTimeout(() => appToast.classList.remove('show'), 3000);
  }

  function renderQuoteDesigns() {
    if (!quoteSelectedWrap || !quoteSelectedList) return;
    quoteSelectedList.innerHTML = '';
    if (quoteAttachedDesigns.length === 0) {
      quoteSelectedWrap.classList.add('hidden');
      return;
    }
    quoteSelectedWrap.classList.remove('hidden');
    quoteAttachedDesigns.forEach((url, idx) => {
      const title = getDesignTitleFromUrl(url);
      const chip = document.createElement('div');
      chip.className = 'quote-design-chip';
      chip.innerHTML = `
        <img src="${url}" alt="${title}">
        <span>${title}</span>
        <button type="button" aria-label="Remove design">&times;</button>
      `;
      chip.querySelector('button').addEventListener('click', () => {
        quoteAttachedDesigns.splice(idx, 1);
        renderQuoteDesigns();
      });
      quoteSelectedList.appendChild(chip);
    });
  }

  function openQuoteModal(opts = {}) {
    if (!quoteModal) return;
    if (opts.packageName && quotePackageSelect) {
      quotePackageSelect.value = opts.packageName;
    }
    if (opts.garmentType && quoteGarmentSelect) {
      quoteGarmentSelect.value = opts.garmentType;
    }
    if (Array.isArray(opts.designs)) {
      quoteAttachedDesigns = [...opts.designs];
    } else if (quoteAttachedDesigns.length === 0 && favorites.length > 0) {
      quoteAttachedDesigns = [...favorites];
    }
    renderQuoteDesigns();
    quoteModal.classList.add('open');
    quoteModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeQuoteModal() {
    if (!quoteModal) return;
    quoteModal.classList.remove('open');
    quoteModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function buildQuoteSummaryText() {
    const client = (quoteNameInput?.value || '').trim() || 'Prospective Client';
    const country = quoteCountrySelect?.value || 'Not specified';
    const pkg = quotePackageSelect?.value || 'Custom Commission';
    const garment = quoteGarmentSelect?.value || 'Sportswear';
    const qty = quoteQtySelect?.value || 'TBD';
    const notes = (quoteNotesInput?.value || '').trim();

    const lines = [
      `Hi James! I'd like to request a quote from www.jamesmesa.online:`,
      `• Client / Team: ${client}`,
      `• Country / Region: ${country}`,
      `• Package: ${pkg}`,
      `• Garment Type: ${garment}`,
      `• Estimated Quantity: ${qty}`
    ];

    if (quoteAttachedDesigns.length > 0) {
      lines.push(`• Selected Design(s):`);
      quoteAttachedDesigns.forEach(url => {
        const cleanUrl = `https://www.jamesmesa.online/${url.replace(/ /g, '%20')}`;
        lines.push(`  - ${getDesignTitleFromUrl(url)} (${cleanUrl})`);
      });
    }
    if (notes) {
      lines.push(`• Notes: ${notes}`);
    }
    return lines.join('\n');
  }

  document.querySelectorAll('.open-quote-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      openQuoteModal({
        packageName: btn.getAttribute('data-package') || 'Custom Commission',
        designs: favorites.length > 0 ? [...favorites] : []
      });
    });
  });

  if (quoteCloseBtn) quoteCloseBtn.addEventListener('click', closeQuoteModal);
  if (quoteModal) {
    quoteModal.addEventListener('click', (e) => {
      if (e.target === quoteModal) closeQuoteModal();
    });
  }

  if (quoteWhatsappBtn) {
    quoteWhatsappBtn.addEventListener('click', () => {
      const msg = encodeURIComponent(buildQuoteSummaryText());
      window.open(`https://wa.me/639531658294?text=${msg}`, '_blank');
    });
  }

  if (quoteEmailBtn) {
    quoteEmailBtn.addEventListener('click', () => {
      const pkg = quotePackageSelect?.value || 'Design Inquiry';
      const subject = encodeURIComponent(`Sportswear Design Inquiry - ${pkg}`);
      const body = encodeURIComponent(buildQuoteSummaryText());
      window.location.href = `mailto:rj.bmesa@gmail.com?subject=${subject}&body=${body}`;
    });
  }

  if (quoteGformBtn) {
    quoteGformBtn.addEventListener('click', async () => {
      const summary = buildQuoteSummaryText();
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(summary);
          showToast('Quote details & design names copied! Opening form...');
        }
      } catch (e) {
        showToast('Opening project form...');
      }
      window.open('https://forms.gle/Jr83hkyqjNx4mRbPA', '_blank');
    });
  }


  // ==========================================================================
  // SCROLL EFFECTS & NAVIGATION
  // ==========================================================================
  const header = document.querySelector('.main-header');
  
  let lastScrollY = window.scrollY;
  
  window.addEventListener('scroll', () => {
    // Smart header hiding (hide on scroll down, show on scroll up)
    if (window.scrollY > lastScrollY && window.scrollY > 80) {
      header.classList.add('scroll-hidden');
    } else {
      header.classList.remove('scroll-hidden');
    }
    lastScrollY = window.scrollY;
    
    // Scrolled style (glass effect)
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    highlightNavOnScroll();
  });

  function highlightNavOnScroll() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-lnk');
    
    let currentId = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120; // Offset for header
      const height = sec.offsetHeight;
      if (window.scrollY >= top && window.scrollY < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    if (currentId) {
      navLinks.forEach(lnk => {
        lnk.classList.remove('active');
        if (lnk.getAttribute('href') === `#${currentId}`) {
          lnk.classList.add('active');
        }
      });
    }
  }

  // Initialize favorites count
  const favCountBadge = document.getElementById('fav-count');
  if (favCountBadge) {
    favCountBadge.textContent = favorites.length;
  }


  // ==========================================================================
  // MOBILE MENU TOGGLER & CONTACT FORM SUBMIT
  // ==========================================================================
  const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
  const mobileNavMenu = document.querySelector('.mobile-nav-menu');
  const contactForm = document.getElementById('contact-form');

  if (mobileNavToggle && mobileNavMenu) {
    mobileNavToggle.addEventListener('click', () => {
      mobileNavMenu.classList.toggle('open');
      const icon = mobileNavToggle.querySelector('i');
      icon.className = mobileNavMenu.classList.contains('open') ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
    });
    
    document.querySelectorAll('.mobile-link').forEach(link => {
      if (!link.classList.contains('mobile-dropdown-trigger')) {
        link.addEventListener('click', () => {
          mobileNavMenu.classList.remove('open');
          mobileNavToggle.querySelector('i').className = 'fa-solid fa-bars';
        });
      }
    });
  }

  // Scroll Reveal Observer for Section Headers
  const revealHeaders = document.querySelectorAll('.section-header');
  if ('IntersectionObserver' in window) {
    const headerObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
          observer.unobserve(entry.target); // Trigger only once when entering view
        }
      });
    }, { threshold: 0.15 });
    
    revealHeaders.forEach(header => {
      headerObserver.observe(header);
    });
  } else {
    // Fallback for older browsers
    revealHeaders.forEach(header => header.classList.add('reveal-active'));
  }

  // Typewriter Hero Animation (Scroll-sensitive to prevent lag when scrolled away)
  const typewriterElement = document.getElementById('typewriter-text');
  const heroSection = document.getElementById('hero');
  
  if (typewriterElement && heroSection) {
    const words = ["Precise Design.", "Elite Sportswear.", "Factory-Ready Prints.", "Athletic Identity."];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    let isHeroVisible = true;
    let typingTimeout = null;
    
    function type() {
      if (!isHeroVisible) return; // Pause running if scrolled out of view
      
      const currentWord = words[wordIndex];
      
      if (isDeleting) {
        typewriterElement.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
      } else {
        typewriterElement.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 100;
      }
      
      if (!isDeleting && charIndex === currentWord.length) {
        typingSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typingSpeed = 500;
      }
      
      typingTimeout = setTimeout(type, typingSpeed);
    }
    
    // Observer to toggle active state when hero is in/out of the viewport
    if ('IntersectionObserver' in window) {
      const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isHeroVisible = entry.isIntersecting;
          if (isHeroVisible) {
            clearTimeout(typingTimeout);
            type(); // Resume
          }
        });
      }, { threshold: 0.05 });
      heroObserver.observe(heroSection);
    } else {
      type(); // Fallback
    }
  }

  // Apply URL deep-link parameters (?tab=..., ?color=..., ?subcat=..., ?q=..., ?shortlist=...) on load
  let openedSharedShortlist = false;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const paramShortlist = urlParams.get('shortlist');
    const paramTab = urlParams.get('tab');
    const paramColor = urlParams.get('color');
    const paramSubcat = urlParams.get('subcat');
    const paramQ = urlParams.get('q');

    if (paramShortlist) {
      const validCatalogSet = new Set();
      Object.keys(categoriesDb).forEach(k => {
        categoriesDb[k].images.forEach(img => validCatalogSet.add(img));
      });
      const sharedItems = paramShortlist.split('|').map(s => s.trim()).filter(s => validCatalogSet.has(s));
      if (sharedItems.length > 0) {
        sharedItems.forEach(item => {
          if (!favorites.includes(item)) favorites.push(item);
        });
        try {
          localStorage.setItem('jm_portfolio_favorites', JSON.stringify(favorites));
        } catch (e) {}
        if (favCountBadge) favCountBadge.textContent = favorites.length;
        showFavoritesOnly = true;
        if (filterFavToggle) filterFavToggle.classList.add('active');
        if (headbarFavToggleBtn) headbarFavToggleBtn.classList.add('active');
        openedSharedShortlist = true;
      }
    }

    if (paramTab && categoryTabs) {
      const targetTab = categoryTabs.querySelector(`[data-category="${paramTab}"]`);
      if (targetTab) {
        categoryTabs.querySelectorAll('.cat-tab-btn').forEach(b => b.classList.remove('active'));
        targetTab.classList.add('active');
        activeTab = paramTab;
        if (activeTab === 'jersey') colorFiltersWrapper.classList.remove('hidden');
        else colorFiltersWrapper.classList.add('hidden');
        updateSubCategoryUI();
      }
    }
    if (paramColor && activeTab === 'jersey' && colorFilters) {
      const targetColor = colorFilters.querySelector(`[data-color="${paramColor}"]`);
      if (targetColor) {
        colorFilters.querySelectorAll('.color-swatch').forEach(sw => sw.classList.remove('active'));
        targetColor.classList.add('active');
        activeColorFilter = paramColor;
      }
    }
    if (paramSubcat && activeTab === 'shirt' && subCategoryFiltersContainer) {
      const targetSub = subCategoryFiltersContainer.querySelector(`[data-subcat="${paramSubcat}"]`);
      if (targetSub) {
        subCategoryFiltersContainer.querySelectorAll('.sub-cat-btn').forEach(b => b.classList.remove('active'));
        targetSub.classList.add('active');
        activeSubCategory = paramSubcat;
      }
    }
    if (paramQ && searchInput) {
      searchInput.value = paramQ;
      searchQuery = paramQ.toLowerCase().trim();
      if (searchClearBtn) searchClearBtn.style.display = 'block';
    }
  } catch (e) {
    // Ignore malformed query strings
  }

  // Initialize Catalogue
  applyFilters();
  if (openedSharedShortlist) {
    const catSec = document.getElementById('catalogue');
    if (catSec) catSec.scrollIntoView({ behavior: 'smooth' });
    showToast('Loaded shared team shortlist!');
  }
});
