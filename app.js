/**
 * James Mesa - Graphic Design Catalogue App Logic
 * Version: Particle Background & NEW DESIGN DROP Hero Slider & Resets
 */

document.addEventListener('DOMContentLoaded', () => {

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
  
  // Reset favorites to 0 once for clean setup
  if (!localStorage.getItem('jm_portfolio_fav_reset_v3')) {
    localStorage.setItem('jm_portfolio_favorites', '[]');
    localStorage.setItem('jm_portfolio_fav_reset_v3', 'true');
  }
  let favorites = JSON.parse(localStorage.getItem('jm_portfolio_favorites') || '[]');
  
  // Lightbox active navigation context
  let lightboxActiveList = [];
  let lightboxActiveIndex = 0;
  let lightboxCategoryName = '';

  // Get filename from path without extension
  function getFileNameWithoutExtension(path) {
    if (!path) return '';
    // If it is a web URL, try to extract filename or return fallback
    if (path.startsWith('http')) {
      const parts = path.split('/');
      const lastPart = parts[parts.length - 1].split('?')[0]; // Strip query parameters
      if (lastPart.match(/\.(jpg|jpeg|png|gif|svg|webp)/i)) {
        const lastDotIdx = lastPart.lastIndexOf('.');
        return lastPart.substring(0, lastDotIdx).replace(/[-_]/g, ' ');
      }
      return ''; // Fallback for Google Drive/Sites dynamic URLs
    }
    const parts = path.split('/');
    const filenameWithExt = parts[parts.length - 1];
    const lastDotIdx = filenameWithExt.lastIndexOf('.');
    if (lastDotIdx === -1) return filenameWithExt;
    // Replace hyphens/underscores with spaces for beautiful title display!
    const nameStr = filenameWithExt.substring(0, lastDotIdx);
    return nameStr.replace(/[-_]/g, ' ');
  }

  // ==========================================================================
  // DATA INGESTION & NORMALIZATION (Sorted: Newest designs at the top!)
  // ==========================================================================
  if (typeof PORTFOLIO_DATA !== 'undefined') {
    PORTFOLIO_DATA.forEach(category => {
      // Extract design categories
      if (category.IsDesignCategory) {
        const cleanCatName = category.Name.replace('Design - ', '');
        
        // Settle group details
        const isShirt = category.Name.toLowerCase().includes('tshirt') || category.Name.toLowerCase().includes('shirt') && !category.Name.toLowerCase().includes('polo');
        const isPolo = category.Name.toLowerCase().includes('polo');
        const isLogo = category.Name.toLowerCase().includes('logo');
        
        let typeGroup = 'jersey';
        if (isShirt) typeGroup = 'shirt';
        else if (isPolo) typeGroup = 'poloshirt';
        else if (isLogo) typeGroup = 'logo';

        // REVERSED the original image arrays so newest uploads show at the top!
        const sortedImages = [...category.Images].reverse();

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

  // Populate Hero Showcase Slider (NEW DESIGN DROP - Newest images from different categories)
  Object.keys(categoriesDb).forEach(key => {
    const catObj = categoriesDb[key];
    if (catObj.images && catObj.images.length > 0) {
      featuredSliderImages.push({
        url: catObj.images[0], // The newest image (first in reversed array)
        category: `NEW ${catObj.type.toUpperCase()} DROP: ${catObj.name}`
      });
    }
  });

  // Fallback for featured slider if no categories loaded
  if (featuredSliderImages.length === 0 && typeof PORTFOLIO_DATA !== 'undefined') {
    const homeCat = PORTFOLIO_DATA.find(c => c.Name === 'Home');
    if (homeCat) {
      homeCat.Images.forEach(img => {
        featuredSliderImages.push({ url: img, category: 'NEW DESIGN DROP' });
      });
    }
  }

  // ==========================================================================
  // CANVAS BACKGROUND (PARTICLE CONSTELLATION ENGINE - DARK MODE ALWAYS)
  // ==========================================================================
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null, radius: 150 };

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

  function updateSlider() {
    if (featuredSliderImages.length === 0) return;
    const current = featuredSliderImages[sliderIndex];
    
    sliderImg.style.opacity = 0;
    setTimeout(() => {
      sliderImg.src = current.url;
      sliderCategory.textContent = current.category;
      sliderIndicator.textContent = `${sliderIndex + 1} / ${featuredSliderImages.length}`;
      sliderImg.style.opacity = 1;
    }, 200);
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
    
    // Clicking the New Design Drop image opens it in the lightbox!
    if (sliderImg) {
      sliderImg.addEventListener('click', () => {
        const current = featuredSliderImages[sliderIndex];
        if (current) {
          lightboxActiveList = featuredSliderImages.map(img => img.url);
          openLightbox(sliderIndex, "New Drop");
        }
      });
      sliderImg.style.cursor = 'pointer';
    }

    updateSlider();
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

  // Configure sub-category filter lists dynamically
  const subCategoryOptions = {
    shirt: ['Sports', 'Event', 'Corporate'],
    poloshirt: ['Sports', 'Corporate']
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
    subCategoryLabel.textContent = `${activeTab === 'shirt' ? 'T-Shirt' : 'Polo Shirt'} Type`;

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

        // Render sub-category filters for Tshirt/Polo
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

  // Headbar Favorites Button Click
  if (headbarFavToggleBtn) {
    headbarFavToggleBtn.addEventListener('click', () => {
      showFavoritesOnly = !showFavoritesOnly;
      headbarFavToggleBtn.classList.toggle('active', showFavoritesOnly);
      if (filterFavToggle) filterFavToggle.classList.toggle('active', showFavoritesOnly);
      
      const target = document.getElementById('catalogue');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
      applyFilters();
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

  // Filter keys logic
  function applyFilters() {
    let filteredKeys = [];

    if (activeTab === 'jersey') {
      filteredKeys = jerseyCategoriesKeys.filter(key => {
        const cat = categoriesDb[key];
        
        if (activeColorFilter !== 'all' && cat.color !== activeColorFilter) {
          return false;
        }
        
        if (searchQuery.length > 0) {
          if (!cat.name.toLowerCase().includes(searchQuery)) return false;
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

        if (searchQuery.length > 0) {
          if (!cat.name.toLowerCase().includes(searchQuery)) return false;
        }

        if (showFavoritesOnly) {
          const hasFav = cat.images.some(img => favorites.includes(img));
          if (!hasFav) return false;
        }

        return true;
      });
    }

    const isFiltered = activeColorFilter !== 'all' || searchQuery.length > 0 || showFavoritesOnly || activeSubCategory !== 'all';
    resetFiltersBtn.style.display = isFiltered ? 'inline-block' : 'none';

    // Update results label description
    if (activeTab === 'jersey' && activeColorFilter !== 'all') {
      resultCountText.textContent = `Showing individual designs for ${activeColorFilter} jerseys`;
    } else if ((activeTab === 'shirt' || activeTab === 'poloshirt') && activeSubCategory !== 'all') {
      resultCountText.textContent = `Showing individual ${activeSubCategory} ${activeTab === 'shirt' ? 'T-Shirt' : 'Polo'} designs`;
    } else {
      resultCountText.textContent = `Showing all options for ${activeTab.toUpperCase()}`;
    }
    
    renderGrid(filteredKeys);
  }

  // Render Grid
  function renderGrid(keys) {
    if (!catalogueGrid) return;
    catalogueGrid.innerHTML = '';

    // Check if we are in individual picture mode or category type mode
    const isJerseyPictureView = (activeTab === 'jersey' && activeColorFilter !== 'all');
    const isApparelPictureView = ((activeTab === 'shirt' || activeTab === 'poloshirt') && activeSubCategory !== 'all');
    const isLogoPictureView = (activeTab === 'logo'); // Logo always shows individual pictures directly
    const isFavoritesOnlyView = showFavoritesOnly; // Favorites button bypasses category cards and displays favorited items directly

    if (isJerseyPictureView || isApparelPictureView || isLogoPictureView || isFavoritesOnlyView) {
      // Gather all individual matching pictures
      const imageItems = [];

      keys.forEach(key => {
        const originalCat = categoriesDb[key];
        
        originalCat.images.forEach((imgUrl) => {
          // Verify sub-category classification if on T-Shirt/Polo (Folder-based path checks)
          let matchesSubCategory = true;
          if (activeTab === 'shirt' || activeTab === 'poloshirt') {
            if (activeTab === 'shirt') {
              if (activeSubCategory === 'Sports' && !imgUrl.toLowerCase().includes('/sports/')) matchesSubCategory = false;
              if (activeSubCategory === 'Event' && !imgUrl.toLowerCase().includes('/event/')) matchesSubCategory = false;
              if (activeSubCategory === 'Corporate' && !imgUrl.toLowerCase().includes('/corporate/')) matchesSubCategory = false;
            } else if (activeTab === 'poloshirt') {
              if (activeSubCategory === 'Sports' && !imgUrl.toLowerCase().includes('/sports/')) matchesSubCategory = false;
              if (activeSubCategory === 'Corporate' && !imgUrl.toLowerCase().includes('/corporate/')) matchesSubCategory = false;
            }
          }

          // Verify favorites only
          if (showFavoritesOnly && !favorites.includes(imgUrl)) {
            matchesSubCategory = false;
          }

          // Verify search queries
          if (searchQuery.length > 0 && !originalCat.name.toLowerCase().includes(searchQuery)) {
            matchesSubCategory = false;
          }

          if (matchesSubCategory) {
            imageItems.push({
              url: imgUrl,
              categoryName: originalCat.name,
              type: originalCat.type
            });
          }
        });
      });

      if (imageItems.length === 0) {
        catalogueGrid.innerHTML = `
          <div class="grid-empty-state">
            <i class="fa-solid fa-folder-open"></i>
            <h3>No designs match your criteria</h3>
            <p>Try clearing your active filters or searching something else.</p>
          </div>
        `;
        return;
      }

      // Render all matching individual picture cards
      imageItems.forEach((item, index) => {
        const card = createIndividualPictureTile(item, index, imageItems.map(i => i.url));
        catalogueGrid.appendChild(card);
      });

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
      } else if (activeTab === 'poloshirt') {
        // Show 2 sub-category type cards for Polo Shirts: Sports, Corporate
        const originalCat = categoriesDb['Poloshirt'] || keys.map(k => categoriesDb[k])[0];
        if (originalCat) {
          const subs = [
            { name: 'Sports', title: 'Sports Polos' },
            { name: 'Corporate', title: 'Corporate Polos' }
          ];
          subs.forEach(sub => {
            const card = createSubCategoryCard(sub, originalCat, true);
            catalogueGrid.appendChild(card);
          });
        }
      } else {
        // Logo or other categories fallback
        keys.forEach(key => {
          const originalCat = categoriesDb[key];
          const card = createCategoryTileElement(originalCat);
          catalogueGrid.appendChild(card);
        });
      }
    }
  }

  // Create Sub-Category Card Tile (Sports, Event, Corporate)
  function createSubCategoryCard(subCat, originalCat, isPolo) {
    const matchKey = `/${subCat.name.toLowerCase()}/`;
    // Ingest subset of images based on path inclusion
    const subImages = originalCat.images.filter(img => img.toLowerCase().includes(matchKey));
    const featuredImg = subImages[0] || originalCat.featuredImage;

    const card = document.createElement('div');
    card.className = 'category-tile-card';
    
    card.innerHTML = `
      <div class="tile-img-wrap">
        <img class="tile-img" src="${featuredImg}" alt="${subCat.title}" loading="lazy">
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
      imgEl.src = featuredImg;
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
    
    const fileNameStr = getFileNameWithoutExtension(item.url);
    let titleStr = fileNameStr || `${item.categoryName} Template #${currentIndex + 1}`;
    
    card.innerHTML = `
      <div class="tile-img-wrap">
        <img class="tile-img" src="${item.url}" alt="${titleStr}" loading="lazy">
        <div class="tile-overlay">
          <div class="tile-bottom-info">
            <span class="tile-tag">${item.type.toUpperCase()} - ${item.categoryName}</span>
            <h4 class="tile-title">${titleStr}</h4>
          </div>
        </div>
      </div>
    `;

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
    
    card.innerHTML = `
      <div class="tile-img-wrap">
        <img class="tile-img" src="${cat.featuredImage}" alt="${titleStr}" loading="lazy">
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
      imgEl.src = cat.featuredImage;
    });

    card.addEventListener('click', () => {
      lightboxActiveList = cat.images;
      openLightbox(currentCycleIndex, cat.name);
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
    
    localStorage.setItem('jm_portfolio_favorites', JSON.stringify(favorites));
    
    const favCountBadge = document.getElementById('fav-count');
    if (favCountBadge) {
      favCountBadge.textContent = favorites.length;
    }
    
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
  const lightboxTag = document.getElementById('lightbox-tag');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxMeta = document.getElementById('lightbox-meta');
  const lightboxInquireBtn = document.getElementById('lightbox-inquire-btn');
  const lightboxFavActionBtn = document.getElementById('lightbox-fav-action-btn');
  
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
  const lightboxPrevBtn = document.getElementById('lightbox-prev-btn');
  const lightboxNextBtn = document.getElementById('lightbox-next-btn');
  const imgWrap = document.querySelector('.lightbox-image-wrap');

  function openLightbox(index, categoryName) {
    lightboxActiveIndex = index;
    lightboxCategoryName = categoryName || 'Sportswear';
    
    const imageUrl = lightboxActiveList[lightboxActiveIndex];
    if (!imageUrl) return;

    lightboxImg.src = imageUrl;
    
    const fileNameStr = getFileNameWithoutExtension(imageUrl);
    lightboxTag.textContent = `${lightboxCategoryName.toUpperCase()} COLLECTION`;
    lightboxTitle.textContent = fileNameStr || `${lightboxCategoryName} Design #${lightboxActiveIndex + 1}`;
    lightboxMeta.textContent = `Clean high-fidelity sportswear design concept, copyright of James Mesa. Ready for manufacturer sublimation setups. View design ${fileNameStr || '#' + (lightboxActiveIndex + 1)} of ${lightboxActiveList.length}.`;
    
    const isFavorited = favorites.includes(imageUrl);
    lightboxFavActionBtn.classList.toggle('favorited', isFavorited);
    lightboxFavActionBtn.innerHTML = isFavorited ? 
      `<i class="fa-solid fa-heart"></i> Favorited` : 
      `<i class="fa-regular fa-heart"></i> Favorite`;

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
    if (lightboxModal.style.display === 'block') {
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

      const subj = document.getElementById('form-subject');
      const msg = document.getElementById('form-message');
      
      if (subj && msg) {
        const fileNameStr = getFileNameWithoutExtension(url);
        subj.value = `Inquiry: Design - ${fileNameStr}`;
        msg.value = `Hi James,\n\nI am interested in your design template:\n${fileNameStr} (${url})\n\nPlease let me know the details for this layout!`;
        
        closeLightbox();
        document.getElementById('socials').scrollIntoView({ behavior: 'smooth' });
      }
    });
  }


  // ==========================================================================
  // SCROLL EFFECTS & NAVIGATION
  // ==========================================================================
  const header = document.querySelector('.main-header');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      header.classList.add('scroll-hidden');
    } else {
      header.classList.remove('scroll-hidden');
    }
    
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
    
    let currentId = 'catalogue';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      const height = sec.offsetHeight;
      if (window.scrollY >= top && window.scrollY < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinks.forEach(lnk => {
      lnk.classList.remove('active');
      if (lnk.getAttribute('href') === `#${currentId}`) {
        lnk.classList.add('active');
      }
    });
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

  // Contact form
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('form-name').value;
      const team = document.getElementById('form-team').value;
      const subject = document.getElementById('form-subject').value;
      const msg = document.getElementById('form-message').value;
      
      // Gather files info if present
      let fileAttachmentText = '';
      if (fileRealInput.files && fileRealInput.files.length > 0) {
        fileAttachmentText = `\nAttached file reference: ${fileRealInput.files[0].name}`;
      }
      
      const mailtoLink = `mailto:rj.bmesa@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        `Inquiry from: ${name}\nTeam/Organization: ${team}${fileAttachmentText}\n\nMessage:\n${msg}`
      )}`;
      
      window.location.href = mailtoLink;
    });
  }

  // Initialize Catalogue
  applyFilters();
});
