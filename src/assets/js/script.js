// ============================================
// 전역 변수 및 DOM 요소
// ============================================
const header = document.getElementById('header');
const nav = document.getElementById('nav');
const navToggleBtn = document.querySelector('.nav-toggle-btn');
const navToggleText = navToggleBtn?.querySelector('.sr-only');
const gotopBtn = document.getElementById('gotop');

// header placeholder 생성
const headerPlaceholder = document.createElement('div');
headerPlaceholder.style.height = '0px';
header?.parentNode.insertBefore(headerPlaceholder, header.nextSibling);

let lockedScrollY = 0;
let realDocumentHeight = document.documentElement.scrollHeight;

// ============================================
// 이메일 복사 기능
// ============================================
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }

        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();

        const success = document.execCommand('copy');
        document.body.removeChild(textarea);

        return success;
    } catch (err) {
        console.error('복사 실패:', err);
        return false;
    }
}

document.addEventListener('click', async (e) => {
    const copyBtn = e.target.closest('[data-email]');
    if (!copyBtn) return;
    const email = copyBtn.dataset.email;

    if (!email) {
        console.warn('이메일 주소가 없습니다.');
        return;
    }

    const success = await copyToClipboard(email);

    if (success) {
        showToast('이메일 주소가 복사되었습니다.', 'success', 3000);
    } else {
        showToast('다시 한번 클릭해 주세요.', 'error', 4000);
    }
});

// ============================================
// Toast 알림
// ============================================
function showToast(message, type = 'success', duration = 3000) {
    const container = document.getElementById('toastContainer');

    if (!container) {
        console.error('토스트 컨테이너를 찾을 수 없습니다.');
        return;
    }

    container.innerHTML = '';
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    toast.innerHTML = `
        <span class="toast-message">${message}</span>
        <button type="button" class="btn sm toast-close" aria-label="알림 닫기">확인</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    const toastCloseBtn = toast.querySelector('.toast-close');
    toastCloseBtn.addEventListener('click', () => {
        hideToast(toast);
    });

    if (duration > 0) {
        setTimeout(() => {
            hideToast(toast);
        }, duration);
    }
}

function hideToast(toast) {
    toast.classList.remove('show');
    setTimeout(() => {
        toast.remove();
    }, 300);
}

// ============================================
// 네비게이션 토글
// ============================================
    if (nav && navToggleBtn) {
    navToggleBtn.addEventListener('click', () => {
        const isExpanded = navToggleBtn.getAttribute('aria-expanded') === 'true';
        const nextIsExpanded = !isExpanded;

        navToggleBtn.setAttribute('aria-expanded', String(nextIsExpanded));
        nav.classList.toggle('active', nextIsExpanded);

        if (nextIsExpanded) {
            // 메뉴 열기
            nav.removeAttribute('inert');

            lockedScrollY = window.scrollY;
            document.body.classList.add('scroll-lock');
            document.body.style.top = `-${lockedScrollY}px`;

            updateActiveNav(lockedScrollY);

            if (navToggleText) {
            navToggleText.textContent = '메뉴 닫기';
            }
        } else {
        // 메뉴 닫기
        nav.setAttribute('inert', '');

        document.body.classList.remove('scroll-lock');
        document.body.style.top = '';

        requestAnimationFrame(() => {
            window.scrollTo(0, lockedScrollY);
            handleScroll();
        });

        if (navToggleText) {
            navToggleText.textContent = '메뉴 열기';
        }
        }
    });
}

// ============================================
// 스크롤 이벤트 핸들러
// ============================================
function handleScroll() {
    const y = window.scrollY;

    // Top 버튼 표시/숨김
    if (gotopBtn) {
        gotopBtn.style.display = y > 200 ? 'inline-flex' : 'none';
    }

    const h = header?.offsetHeight || 0;

    if (y > 0) {
        header?.classList.add('fixed');
        if (headerPlaceholder) {
            headerPlaceholder.style.height = h + 'px';
        }
    } else {
        header?.classList.remove('fixed');
        if (headerPlaceholder) {
            headerPlaceholder.style.height = '0px';
        }
    }

    // 네비가 닫혀있을 때만 active 업데이트
    if (!document.body.classList.contains('scroll-lock')) {
        updateActiveNav();
        realDocumentHeight = document.documentElement.scrollHeight;
    }
}

handleScroll();
window.addEventListener('scroll', handleScroll);

// ============================================
// GNB Active 업데이트 (통합)
// ============================================
function updateActiveNav(scrollY = window.scrollY) {
    const sections = document.querySelectorAll('.section');
    const windowHeight = window.innerHeight;
    const documentHeight = realDocumentHeight;
    const headerHeight = header?.offsetHeight || 0;

    let currentIndex = 0;

    if (scrollY < 100) { // 맨 위면 첫 번째
        currentIndex = 0;
    } else if (scrollY + windowHeight >= documentHeight - 50) { // 페이지 최하단 근처면 마지막 섹션
        currentIndex = sections.length - 1;
    } else { // 각 섹션의 시작 지점 기준으로 판단
        sections.forEach((section, index) => {
            const sectionTop = section.offsetTop;
            const offset = headerHeight + 50;

            if (scrollY >= sectionTop - offset) {
                currentIndex = index;
            }
        });
    }

    // active 클래스 업데이트
    const gnbItems = document.querySelectorAll('.gnb li');
    gnbItems.forEach((item, index) => {
        item.classList.toggle('active', index === currentIndex);
    });
}

// ============================================
// GNB 클릭 시 섹션 스크롤
// ============================================
const gnbLinks = document.querySelectorAll('.gnb a');

if (gnbLinks.length > 0) {
    gnbLinks.forEach((link, index) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            const sections = document.querySelectorAll('.section');
            const targetSection = sections[index];

            // 모바일 네비 열려있으면 닫기
            if (nav?.classList.contains('active')) {
                navToggleBtn?.click();

                // 네비 닫힌 후 스크롤 이동
                setTimeout(() => {
                    scrollToSection(targetSection, index);
                }, 100);
            } else {
                scrollToSection(targetSection, index);
            }
        });
    });
}

function scrollToSection(section, index) {
    if (!section) return;

    const headerHeight = header?.offsetHeight || 0;
    let targetPosition;

    if (index === 0) {
        targetPosition = 0;
    } else {
        targetPosition = section.offsetTop - headerHeight;
    }

    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
}

// tab 영역
const tabContainers = document.querySelectorAll('.tab');
tabContainers.forEach(container => {
    const tabBtns = container.querySelectorAll('.tab-btn');
    const cards = container.querySelectorAll('.card-box');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');

            // 버튼 상태 업데이트
            tabBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            this.classList.add('active');
            this.setAttribute('aria-selected', 'true');

            // 필터링
            cards.forEach(card => {
                const category = card.getAttribute('data-category');

                if (filter === '*' || category === filter) {
                    card.classList.remove('hidden');
                    card.removeAttribute('aria-hidden');
                } else {
                    card.classList.add('hidden');
                    card.setAttribute('aria-hidden', 'true');
                }
            });
        });
    });
});

// ============================================
// Top 버튼
// ============================================
if (gotopBtn) {
    gotopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ============================================
// 윈도우 리사이즈
// ============================================
window.addEventListener('resize', () => {
    if (!document.body.classList.contains('scroll-lock')) {
    realDocumentHeight = document.documentElement.scrollHeight;
    }

    const isMobile = window.innerWidth < 768;

    if (!isMobile && nav?.classList.contains('active')) {
        nav.classList.remove('active');
        nav.removeAttribute('inert');

        if (navToggleBtn) {
            navToggleBtn.setAttribute('aria-expanded', 'false');

            if (navToggleText) {
                navToggleText.textContent = '메뉴 열기';
            }
        }

        if (document.body.classList.contains('scroll-lock')) {
            document.body.classList.remove('scroll-lock');
            document.body.style.top = '';
            window.scrollTo(0, lockedScrollY);
            handleScroll();
        }
    }
});
