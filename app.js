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
    
    // Smooth transition: brief fade out, swap, fade in
    sliderImg.style.opacity = 0;
    setTimeout(() => {
      sliderImg.src = current.url;
      sliderCategory.textContent = current.category;
      sliderIndicator.textContent = `${sliderIndex + 1} / ${featuredSliderImages.length}`;
      sliderImg.style.opacity = 1;
    }, 600);
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
    } else if (activeTab === 'shirt' && activeSubCategory !== 'all') {
      resultCountText.textContent = `Showing individual ${activeSubCategory} T-Shirt designs`;
    } else {
      resultCountText.textContent = `Showing all options for ${activeTab.toUpperCase()}`;
    }
    
    renderGrid(filteredKeys);
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
      const isJerseyPictureView = (activeTab === 'jersey' && activeColorFilter !== 'all');
      const isApparelPictureView = (activeTab === 'shirt' && activeSubCategory !== 'all');
      const isStandaloneType = ['logo', 'baseball', 'football', 'hoodie', 'poloshirt'].includes(activeTab);
  
      if (isJerseyPictureView || isApparelPictureView || isStandaloneType) {
        // Gather all individual matching pictures
        keys.forEach(key => {
          const originalCat = categoriesDb[key];
          
          originalCat.images.forEach((imgUrl) => {
            // Verify sub-category classification if on T-Shirt by checking the actual folder path in the URL
            let matchesSubCategory = true;
            if (activeTab === 'shirt') {
              if (activeSubCategory !== 'all') {
                const subStr = `/${activeSubCategory.toLowerCase()}/`;
                if (!imgUrl.toLowerCase().includes(subStr)) {
                  matchesSubCategory = false;
                }
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
              currentImageItems.push({
                url: imgUrl,
                categoryName: originalCat.name,
                type: originalCat.type
              });
            }
          });
        });
  
        if (currentImageItems.length === 0) {
          catalogueGrid.innerHTML = `
            <div class="grid-empty-state">
              <i class="fa-solid fa-folder-open"></i>
              <h3>No designs match your criteria</h3>
              <p>Try clearing your active filters or searching something else.</p>
            </div>
          `;
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
        <img class="tile-img" src="${safeFeaturedImg}" alt="${subCat.title}" loading="lazy">
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
        <img class="tile-img" src="${item.url}" alt="${titleStr}" loading="lazy">
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
        <img class="tile-img" src="${safeFeaturedImg}" alt="${titleStr}" loading="lazy">
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

  function openLightbox(index, categoryName) {
    lightboxActiveIndex = index;
    lightboxCategoryName = categoryName || 'Sportswear';
    
    const imageUrl = lightboxActiveList[lightboxActiveIndex];
    if (!imageUrl) return;

    lightboxImg.src = imageUrl;

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

      // Redirect directly to the user's Google Form in a new tab
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

  // Initialize Catalogue
  applyFilters();
});
