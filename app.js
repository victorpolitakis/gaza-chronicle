// Gaza Chronicle - Frontend JavaScript

// ========================================
// Tab Navigation
// ========================================
const navTabs = document.querySelectorAll('.nav-tab');
const tabPanels = document.querySelectorAll('.tab-panel');

navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;

        // Update nav tabs
        navTabs.forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        // Update panels
        tabPanels.forEach(panel => {
            panel.classList.remove('active');
            panel.hidden = true;
        });

        const targetPanel = document.getElementById(`panel-${targetTab}`);
        if (targetPanel) {
            targetPanel.classList.add('active');
            targetPanel.hidden = false;

            // Update Page Title
            const titles = {
                overview: 'Gaza Chronicle - Overview',
                timeline: 'Gaza Chronicle - Historical Timeline',
                context: 'Gaza Chronicle - Context & Analysis',
                news: 'Gaza Chronicle - Live News'
            };
            document.title = titles[targetTab] || 'Gaza Chronicle';

            // If switching to news tab, fetch news if not already loaded
            if (targetTab === 'news' && allArticles.length === 0) {
                fetchNews();
            }
        }
    });
});

// Keyboard navigation for tabs
document.querySelector('.nav-tabs').addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const tabs = Array.from(navTabs);
        const currentIndex = tabs.findIndex(t => t.classList.contains('active'));
        let nextIndex;

        if (e.key === 'ArrowRight') {
            nextIndex = (currentIndex + 1) % tabs.length;
        } else {
            nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        }

        tabs[nextIndex].click();
        tabs[nextIndex].focus();
    }
});

// ========================================
// News Tab Functionality
// ========================================
let allArticles = [];
let currentSection = 'all';

// SVG Icons
const Icons = {
    calendar: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    arrow: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
    newspaper: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>`,
    empty: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>`
};

// DOM Elements
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const gridEl = document.getElementById('headlines-grid');
const articleCountEl = document.getElementById('article-count');
const lastUpdatedEl = document.getElementById('last-updated');
const filtersEl = document.getElementById('section-filters');
const refreshBtn = document.getElementById('refresh-btn');

// Fetch news from backend API
// Client-side fetch using CORS proxy (for GitHub Pages compatibility)
async function fetchNews() {
    showLoading();

    try {
        // Use a different topic ID if needed, defaults to Israel-Gaza war
        const topicId = 'c2vdnvdg6xxt';

        // Use allorigins.win as a CORS proxy to fetch the BBC page
        // accessing the API directly won't work due to CORS
        // Switching to 'corsproxy.io' as it is often more reliable
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(`https://www.bbc.com/news/topics/${topicId}`)}`;

        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error('Failed to fetch from proxy');

        // corsproxy.io returns the raw HTML text directly, not wrapped in JSON
        const html = await response.text();

        // Extract JSON data from the script tag (same logic as the backend script)
        const jsonMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);

        if (!jsonMatch) {
            throw new Error('Could not parse BBC data');
        }

        const fullData = JSON.parse(jsonMatch[1]);
        const pageProps = fullData.props?.pageProps;
        const pageKey = Object.keys(pageProps.page)[0];
        const pageData = pageProps.page[pageKey];

        if (!pageData) {
            throw new Error('Could not extract page data');
        }

        // Process articles
        const sections = pageData.sections || [];
        const articles = [];

        for (const section of sections) {
            const sectionTitle = section.title || 'Untitled Section';

            if (section.content) {
                for (const item of section.content) {
                    articles.push({
                        section: sectionTitle,
                        title: item.title,
                        description: item.description,
                        href: item.href ? `https://www.bbc.com${item.href}` : '#',
                        // Enhance image quality
                        image: item.image?.model?.blocks?.src?.replace('/480/', '/1024/') || null,
                        imageAlt: item.image?.model?.blocks?.altText || null,
                        contentType: item.metadata?.contentType,
                        lastUpdated: item.metadata?.lastUpdated ? new Date(item.metadata.lastUpdated).toISOString() : null,
                        topics: item.metadata?.topics || [],
                        isLive: item.isLiveNow || false
                    });
                }
            }
        }

        allArticles = articles;

        // Calculate section counts
        const sectionCounts = sections.map(s => ({
            title: s.title,
            count: s.content?.length || 0
        }));

        // Update stats with animation
        animateNumber(articleCountEl, allArticles.length);
        lastUpdatedEl.textContent = formatTime(new Date());

        // Build section filters
        buildFilters(sectionCounts);

        // Render articles
        renderArticles(allArticles);

        hideLoading();
    } catch (error) {
        console.error('Error fetching news:', error);
        showError();
    }
}

// Animate number counting
function animateNumber(element, target) {
    const duration = 600;
    const start = parseInt(element.textContent) || 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (target - start) * easeOut);
        element.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// Show/Hide states
function showLoading() {
    loadingEl.classList.remove('hidden');
    errorEl.classList.add('hidden');
    gridEl.innerHTML = '';
    refreshBtn.classList.add('loading');
}

function hideLoading() {
    loadingEl.classList.add('hidden');
    refreshBtn.classList.remove('loading');
}

function showError() {
    loadingEl.classList.add('hidden');
    errorEl.classList.remove('hidden');
    refreshBtn.classList.remove('loading');
}

// Build section filter buttons
function buildFilters(sections) {
    const validSections = sections.filter(s => s.title && s.count > 0);

    filtersEl.innerHTML = `
        <button class="filter-btn ${currentSection === 'all' ? 'active' : ''}" data-section="all">
            All (${allArticles.length})
        </button>
        ${validSections.map(s => `
            <button class="filter-btn ${currentSection === s.title ? 'active' : ''}" data-section="${s.title}">
                ${s.title} (${s.count})
            </button>
        `).join('')}
    `;

    // Add click handlers
    filtersEl.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentSection = btn.dataset.section;
            filtersEl.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterArticles();
        });
    });
}

// Filter articles by section
function filterArticles() {
    const filtered = currentSection === 'all'
        ? allArticles
        : allArticles.filter(a => a.section === currentSection);
    renderArticles(filtered);
}

// Render article cards with stagger animation
function renderArticles(articles) {
    if (articles.length === 0) {
        gridEl.innerHTML = `
            <div class="error" style="grid-column: 1 / -1;">
                <div class="error-icon">${Icons.empty}</div>
                <p>No articles found in this section.</p>
            </div>
        `;
        return;
    }

    gridEl.innerHTML = articles.map((article, index) => createCard(article, index)).join('');

    // Add stagger animation
    const cards = gridEl.querySelectorAll('.headline-card');
    cards.forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, i * 50);
    });
}

// Create a single card
function createCard(article, index) {
    const imageHtml = article.image
        ? `<div class="card-image-wrapper">
             <img class="card-image" src="${article.image}" alt="${escapeHtml(article.imageAlt || article.title)}" loading="${index < 3 ? 'eager' : 'lazy'}">
           </div>`
        : `<div class="card-image placeholder">${Icons.newspaper}</div>`;

    const topicsHtml = article.topics.length > 0
        ? article.topics.slice(0, 2).map(t => `<span class="topic-tag">${escapeHtml(t)}</span>`).join('')
        : '';

    const liveBadge = article.isLive
        ? `<span class="live-badge">LIVE</span>`
        : '';

    const contentType = article.contentType || 'article';
    const typeLabel = contentType.charAt(0).toUpperCase() + contentType.slice(1);

    return `
        <article class="headline-card">
            ${imageHtml}
            <div class="card-content">
                <div class="card-meta">
                    ${liveBadge}
                    <span class="card-type">${typeLabel}</span>
                    ${article.section && article.section !== 'Untitled Section' ? `<span class="card-section">${escapeHtml(article.section)}</span>` : ''}
                </div>
                <h2 class="card-title">
                    <a href="${article.href}" target="_blank" rel="noopener noreferrer">
                        ${escapeHtml(article.title)}
                    </a>
                </h2>
                ${article.description ? `<p class="card-description">${escapeHtml(article.description)}</p>` : ''}
                <div class="card-footer">
                    <div>
                        ${article.lastUpdated ? `
                            <span class="card-date">
                                ${Icons.calendar}
                                ${formatDate(article.lastUpdated)}
                            </span>
                        ` : ''}
                        <div class="card-topics">${topicsHtml}</div>
                    </div>
                    <a href="${article.href}" target="_blank" rel="noopener noreferrer" class="read-more">
                        Read more
                        ${Icons.arrow}
                    </a>
                </div>
            </div>
        </article>
    `;
}

// Helper: Format date (relative time)
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return `${diffMins}m ago`;
    } else if (diffHours < 24) {
        return `${diffHours}h ago`;
    } else if (diffDays < 7) {
        return `${diffDays}d ago`;
    }

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
}

// Helper: Format time
function formatTime(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Helper: Escape HTML
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Event Listeners
refreshBtn.addEventListener('click', fetchNews);

// Share functionality
document.querySelector('.nav-share')?.addEventListener('click', async () => {
    const shareData = {
        title: 'Gaza Chronicle',
        text: 'A historical chronicle of the Gaza conflict',
        url: window.location.href
    };

    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            await navigator.clipboard.writeText(window.location.href);
            // Could add a toast notification here
        }
    } catch (err) {
        console.log('Share failed:', err);
    }
});

// ========================================
// Initialize Map
// ========================================
// ========================================
// Initialize Map
// ========================================
function initMap() {
    const mapElement = document.getElementById('gaza-map-interactive');
    if (!mapElement || typeof L === 'undefined') return;

    // Center on Gaza Strip
    const map = L.map('gaza-map-interactive', {
        center: [31.4, 34.38], // Approximately center of Gaza Strip
        zoom: 9,
        scrollWheelZoom: false, // Prevent page scroll hijack
        zoomControl: false // Custom placement below
    });

    // Add Esri World Topo Map tiles (More realistic, traditional map style)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
        maxZoom: 19
    }).addTo(map);

    // Add zoom control to bottom right
    L.control.zoom({
        position: 'bottomright'
    }).addTo(map);
}

// Initialize
// Don't auto-fetch news on load - wait until user clicks News tab
document.addEventListener('DOMContentLoaded', () => {
    initMap();
});
