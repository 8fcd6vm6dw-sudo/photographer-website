// 从图片提取主色调
function getAverageColor(imageSrc, callback) {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 50;
        canvas.height = 50;

        ctx.drawImage(img, 0, 0, 50, 50);
        const imageData = ctx.getImageData(0, 0, 50, 50).data;

        let r = 0, g = 0, b = 0;
        const pixelCount = imageData.length / 4;

        for (let i = 0; i < imageData.length; i += 4) {
            r += imageData[i];
            g += imageData[i + 1];
            b += imageData[i + 2];
        }

        r = Math.floor(r / pixelCount);
        g = Math.floor(g / pixelCount);
        b = Math.floor(b / pixelCount);

        const darkR = Math.floor(r * 0.6);
        const darkG = Math.floor(g * 0.6);
        const darkB = Math.floor(b * 0.6);

        const lightR = Math.min(255, Math.floor(r * 1.3));
        const lightG = Math.min(255, Math.floor(g * 1.3));
        const lightB = Math.min(255, Math.floor(b * 1.3));

        callback({
            main: `rgb(${r}, ${g}, ${b})`,
            dark: `rgb(${darkR}, ${darkG}, ${darkB})`,
            light: `rgb(${lightR}, ${lightG}, ${lightB})`,
            gradient: `linear-gradient(135deg, rgb(${darkR}, ${darkG}, ${darkB}) 0%, rgb(${r}, ${g}, ${b}) 50%, rgb(${lightR}, ${lightG}, ${lightB}) 100%)`
        });
    };
    img.onerror = function() {
        callback({
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        });
    };
    img.src = imageSrc;
}

// 动态加载首页轮播图
function loadHeroSlider() {
    const heroSlider = document.getElementById('heroSlider');
    const heroSection = document.getElementById('home');
    if (!heroSlider || !heroSection) return;

    fetch('images.json')
        .then(res => res.json())
        .then(data => {
            const heroImages = data.hero || [];
            if (heroImages.length === 0) {
                heroSection.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                return;
            }

            heroSlider.innerHTML = heroImages.map((src, index) => `
                <img src="${src}" alt="首页背景${index + 1}" class="hero-slide ${index === 0 ? 'active' : ''}">
            `).join('');

            const colorPromises = heroImages.map(src => {
                return new Promise(resolve => {
                    getAverageColor(src, resolve);
                });
            });

            Promise.all(colorPromises).then(colors => {
                heroSection.style.background = colors[0].gradient;

                const slides = heroSlider.querySelectorAll('.hero-slide');
                let currentSlide = 0;

                function nextSlide() {
                    if (slides.length <= 1) return;
                    slides[currentSlide].classList.remove('active');
                    currentSlide = (currentSlide + 1) % slides.length;
                    slides[currentSlide].classList.add('active');
                    heroSection.style.background = colors[currentSlide].gradient;
                }

                setInterval(nextSlide, 5000);
            });
        })
        .catch(() => {
            heroSection.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        });
}

// 导航栏滚动效果
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

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

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// 预约表单提交
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const serviceSelect = document.getElementById('service');
        const service = serviceSelect.options[serviceSelect.selectedIndex].text;
        const date = document.getElementById('date').value;
        const message = document.getElementById('message').value;

        const submitBtn = contactForm.querySelector('.btn-submit');
        submitBtn.textContent = '提交中...';
        submitBtn.disabled = true;

        try {
            const configRes = await fetch('site-config.json');
            const config = await configRes.json();

            // 通过 Web3Forms 发送预约通知
            if (config.web3formsKey) {
                await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        access_key: config.web3formsKey,
                        subject: `📩 新预约 - ${name}`,
                        姓名: name,
                        电话: phone,
                        服务类型: service || '未选择',
                        期望日期: date || '未填写',
                        备注: message || '无'
                    })
                });
            }

            alert('预约提交成功！我们会尽快与您联系。');
            contactForm.reset();
        } catch (err) {
            alert('预约提交成功！我们会尽快与您联系。');
            contactForm.reset();
        }

        submitBtn.textContent = '提交预约';
        submitBtn.disabled = false;
    });
}

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
    .stat, .contact-item {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.6s ease;
    }
    .stat.animate, .contact-item.animate {
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

// 导航高亮当前区域
const sections = document.querySelectorAll('section');
const navLinksAll = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    navLinksAll.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// 滚动动画观察
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            scrollObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.stat, .contact-item').forEach(el => {
    scrollObserver.observe(el);
});

// 加载网站配置
function loadSiteConfig() {
    fetch('site-config.json')
        .then(res => res.json())
        .then(config => {
            // 导航品牌
            const navBrand = document.querySelector('.nav-brand');
            if (navBrand && config.brand) navBrand.textContent = config.brand;

            // 首页标题
            const heroTitle = document.querySelector('.hero-title');
            if (heroTitle && config.heroTitle) {
                const lines = config.heroTitle.split('\n');
                heroTitle.innerHTML = lines.map(l => `<span class="title-line">${l}</span>`).join('');
            }

            // 首页副标题
            const heroSub = document.querySelector('.hero-subtitle');
            if (heroSub && config.heroSubtitle) heroSub.textContent = config.heroSubtitle;

            // 关于标题
            const aboutTitle = document.querySelector('.about-content h2');
            if (aboutTitle && config.aboutTitle) aboutTitle.textContent = config.aboutTitle;

            // 关于照片
            const aboutImg = document.querySelector('.about-image img');
            if (aboutImg && config.aboutImage) aboutImg.src = config.aboutImage;

            // 关于简介
            const aboutIntro = document.querySelector('.about-intro');
            if (aboutIntro && config.aboutIntro) aboutIntro.textContent = config.aboutIntro;

            // 关于描述
            const aboutPs = document.querySelectorAll('.about-content > p:not(.about-intro)');
            if (aboutPs[0] && config.aboutDesc) aboutPs[0].textContent = config.aboutDesc;
            if (aboutPs[1] && config.aboutDesc2) aboutPs[1].textContent = config.aboutDesc2;

            // 统计数据
            const statNums = document.querySelectorAll('.stat-number');
            const statLabels = document.querySelectorAll('.stat-label');
            if (statNums[0] && config.statClients) statNums[0].textContent = config.statClients;
            if (statLabels[0] && config.statClientsLabel) statLabels[0].textContent = config.statClientsLabel;
            if (statNums[1] && config.statYears) statNums[1].textContent = config.statYears;
            if (statLabels[1] && config.statYearsLabel) statLabels[1].textContent = config.statYearsLabel;

            // 服务项目
            const serviceList = document.querySelector('.about-services ul');
            if (serviceList && config.services) {
                serviceList.innerHTML = config.services.map(s => `<li>${s}</li>`).join('');
            }

            // 联系区域
            const contactTitle = document.querySelector('.contact-info h2');
            if (contactTitle && config.contactTitle) contactTitle.textContent = config.contactTitle;

            const contactDesc = document.querySelector('.contact-info > p');
            if (contactDesc && config.contactDesc) contactDesc.textContent = config.contactDesc;

            // 联系方式
            const contactItems = document.querySelectorAll('.contact-item p');
            if (contactItems[0] && config.phone) contactItems[0].textContent = config.phone;
            if (contactItems[1] && config.email) contactItems[1].textContent = config.email;
            if (contactItems[2] && config.wechat) contactItems[2].textContent = config.wechat;
            if (contactItems[3] && config.workHours) contactItems[3].textContent = config.workHours;

            // 页脚
            const footerBrand = document.querySelector('.footer-brand');
            if (footerBrand && config.brand) footerBrand.textContent = config.brand;

            const footerP = document.querySelector('.footer-content > p:not(.copyright)');
            if (footerP && config.footerText) footerP.textContent = config.footerText;

            const copyright = document.querySelector('.copyright');
            if (copyright && config.copyright) copyright.textContent = config.copyright;

            // 页面标题
            if (config.brand) document.title = config.brand + ' | 人像婚纱摄影';
        })
        .catch(() => {});
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    loadSiteConfig();
    loadHeroSlider();
});
