// 动态加载作品展示
function loadPortfolio() {
    const portfolioGrid = document.getElementById('portfolioGrid');
    if (!portfolioGrid) return;

    fetch('images.json')
        .then(res => res.json())
        .then(data => {
            const portfolioImages = data.portfolio || [];
            if (portfolioImages.length === 0) {
                portfolioGrid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: #999;">
                        <p style="font-size: 1.2rem;">暂无作品图片</p>
                    </div>
                `;
                return;
            }

            const layoutClasses = ['large', '', '', 'tall', '', 'wide', '', '', 'large'];
            const categoryNames = {
                'anime': '二次元外景',
                'wide': '广角',
                'scene': '场照',
                'art': '艺术照'
            };

            portfolioGrid.innerHTML = portfolioImages.map((img, index) => {
                const layoutClass = layoutClasses[index % layoutClasses.length];
                const category = img.category || 'anime';
                const categoryName = categoryNames[category] || '未分类';

                return `
                    <div class="portfolio-item ${layoutClass}" data-category="${category}">
                        <img src="${img.src}" alt="${img.name}">
                        <div class="portfolio-overlay">
                            <span class="category">${categoryName}</span>
                            <h3>${img.name}</h3>
                        </div>
                    </div>
                `;
            }).join('');

            initPortfolioFeatures();
        })
        .catch(() => {
            portfolioGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: #999;">
                    <p style="font-size: 1.2rem;">图片加载失败</p>
                </div>
            `;
        });
}

// 初始化作品相关功能
function initPortfolioFeatures() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.dataset.filter;

            portfolioItems.forEach(item => {
                if (filterValue === 'all' || item.dataset.category === filterValue) {
                    item.style.display = 'block';
                    item.style.animation = 'fadeIn 0.5s ease';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox.querySelector('img');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');

    let currentImageIndex = 0;
    let visibleItems = [];

    portfolioItems.forEach((item) => {
        item.addEventListener('click', () => {
            visibleItems = Array.from(portfolioItems).filter(
                item => item.style.display !== 'none'
            );
            currentImageIndex = visibleItems.indexOf(item);
            openLightbox(item.querySelector('img').src);
        });
    });

    function openLightbox(src) {
        lightboxImg.src = src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    lightboxPrev.addEventListener('click', () => {
        currentImageIndex = (currentImageIndex - 1 + visibleItems.length) % visibleItems.length;
        lightboxImg.src = visibleItems[currentImageIndex].querySelector('img').src;
    });

    lightboxNext.addEventListener('click', () => {
        currentImageIndex = (currentImageIndex + 1) % visibleItems.length;
        lightboxImg.src = visibleItems[currentImageIndex].querySelector('img').src;
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    portfolioItems.forEach(el => observer.observe(el));
}

// 移动端导航菜单
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    navToggle.classList.toggle('active');
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// 键盘控制灯箱
document.addEventListener('keydown', (e) => {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox || !lightbox.classList.contains('active')) return;

    switch (e.key) {
        case 'Escape':
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            break;
        case 'ArrowLeft':
            document.querySelector('.lightbox-prev')?.click();
            break;
        case 'ArrowRight':
            document.querySelector('.lightbox-next')?.click();
            break;
    }
});

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .portfolio-item {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.6s ease;
    }
    .portfolio-item.animate {
        opacity: 1;
        transform: translateY(0);
    }
    .nav-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    .nav-toggle.active span:nth-child(2) {
        opacity: 0;
    }
    .nav-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
`;
document.head.appendChild(style);

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    loadPortfolio();
});
