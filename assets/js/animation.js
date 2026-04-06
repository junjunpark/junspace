
// // ============================================
// // GSAP Plugin
// // ============================================
// gsap.registerPlugin(ScrollTrigger);

// // ============================================
// // Intro
// // ============================================
// const intro = document.querySelector("#intro");
// const path = intro?.querySelector(".path");

// if (intro && path) {
//     document.body.classList.add("scroll-lock");

//     const start = "M 0 100 V 50 Q 50 0 100 50 V 100 z";
//     const end   = "M 0 100 V 0 Q 50 0 100 0 V 100 z";

//     // 초기 상태 고정
//     gsap.set(intro, {
//         yPercent: 0,
//         force3D: false
//     });

//     const cleanup = () => {
//         intro.remove();
//         document.body.classList.remove("scroll-lock");

//         // 인트로 제거로 레이아웃 변경 → 재계산
//         ScrollTrigger.refresh();
//     };

//     gsap.timeline({
//         onComplete: cleanup,
//         onInterrupt: cleanup
//     })
//     .to(path, {
//         morphSVG: start,
//         ease: "power2.in",
//         duration: 0.8
//     })
//     .to(path, {
//         morphSVG: end,
//         ease: "power2.out",
//         duration: 0.6
//     })
//     .to(intro, {
//         yPercent: 110,
//         ease: "power2.in",
//         duration: 0.6
//     });
// }

// // ============================================
// // Split 영역
// // ============================================
// const splits = gsap.utils.toArray(".split");

// gsap.set(splits, { opacity: 0 });
// splits.forEach((el, i) => {
//     const fromX = (i % 2 === 0) ? 80 : -80;

//     gsap.fromTo(
//         el,
//         { x: fromX, opacity: 0 },
//         {
//             x: 0,
//             opacity: 1,
//             duration: 0.6,
//             ease: "power2.out",
//             scrollTrigger: {
//                 trigger: el,
//                 start: "top 85%",
//                 toggleActions: "play none none reverse",
//                 // once: true, // 한 번만 실행
//             }
//         }
//     );
// });

// // ============================================
// // profile-title 영역
// // ============================================
// ScrollTrigger.matchMedia({
//     "(min-width: 768px)": () => {
//     gsap.utils.toArray(".profile-title").forEach((el) => {
//         gsap.fromTo(el, { opacity: 0, y: 30 }, {
//                 opacity: 1,
//                 y: 0,
//                 ease: "none",
//                 scrollTrigger: { trigger: el, start: "top 50%", end: "top 40%", scrub: true }
//             });
//         });
//     },
//     "(max-width: 767px)": () => {
//         gsap.utils.toArray(".profile-title").forEach((el) => {
//                 gsap.fromTo(el, { opacity: 0, y: 40 }, {
//                 opacity: 1,
//                 y: 0,
//                 ease: "none",
//                 scrollTrigger: { trigger: el, start: "top 90%", end: "top 60%", scrub: true }
//             });
//         });
//     }
// });



document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const nav = document.getElementById('nav');
    const navToggleBtn = document.querySelector('.nav-toggle-btn');
    const navLinks = document.querySelectorAll('.gnb a');
    const sections = document.querySelectorAll('.section');
    const logoLink = document.querySelector('.logo a');

    function isMobile() {
        return window.innerWidth < 768;
    }

    // ============================================
    // 섹션 위치
    // ============================================
    let cachedTops = [];

    function cacheSectionTops() {
        if (isMobile()) return;
        const saved = window.scrollY;
        window.scrollTo({ top: 0, behavior: 'instant' });
        cachedTops = Array.from(sections).map(
        section => section.getBoundingClientRect().top
        );
        window.scrollTo({ top: saved, behavior: 'instant' });
    }

    function getMobileSectionTops() {
        return Array.from(sections).map(section => section.offsetTop);
    }

    cacheSectionTops();
    window.addEventListener('load', cacheSectionTops);

    // ============================================
    // 윈도우 리사이즈
    // ============================================
    window.addEventListener('resize', () => {
        cacheSectionTops();

        // PC로 전환 시 nav가 열려있으면 닫기
        if (!isMobile() && nav.classList.contains('active')) {
            closeNav();
        }
    });

    // ============================================
    // 모바일 메뉴
    // ============================================
    let scrollLockY = 0;
    let isNavOpen = false;

    function openNav() {
        isNavOpen = true;
        scrollLockY = window.scrollY;
        nav.classList.add('active');
        navToggleBtn.setAttribute('aria-expanded', 'true');
        const textEl = navToggleBtn.querySelector('.sr-only');
        if (textEl) textEl.textContent = '메뉴 닫기';
        if (isMobile()) {
            body.classList.add('scroll-lock');
            body.style.top = `-${scrollLockY}px`;
        }
    }

    function closeNav() {
        nav.classList.remove('active');
        navToggleBtn.setAttribute('aria-expanded', 'false');
        const textEl = navToggleBtn.querySelector('.sr-only');
        if (textEl) textEl.textContent = '메뉴 열기';
        body.classList.remove('scroll-lock');
        body.style.top = '';
        if (isMobile()) {
            window.scrollTo({ top: scrollLockY, behavior: 'instant' });
        }
        isNavOpen = false;
    }

    if (nav && navToggleBtn) {
        navToggleBtn.addEventListener('click', () => {
        const isExpanded = navToggleBtn.getAttribute('aria-expanded') === 'true';
        isExpanded ? closeNav() : openNav();
        });
    }

    // ============================================
    // 로고 클릭 → sec01 이동
    // ============================================
    if (logoLink) {
        logoLink.addEventListener('click', (e) => {
            e.preventDefault();
            closeNav();
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            });
        });
    }

    // ============================================
    // 네비게이션 클릭 → 섹션 이동
    // ============================================
    navLinks.forEach((link, index) => {
        link.addEventListener('click', (e) => {
        e.preventDefault();
        closeNav();

        const tops = isMobile() ? getMobileSectionTops() : cachedTops;
        const top = tops[index];
        if (top === undefined) return;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
            window.scrollTo({ top, behavior: 'smooth' });
            });
        });
        });
    });

    // ============================================
    // 스크롤 → active 메뉴 업데이트
    // ============================================
    function updateActiveNav() {
        if (isNavOpen) return;

        const scrollY = window.scrollY;
        const tops = isMobile()
        ? getMobileSectionTops()
        : Array.from(sections).map(section => {
            let top = 0;
            let el = section;
            while (el && el !== body) {
                top += el.offsetTop;
                el = el.offsetParent;
            }
            return top;
            });

        let currentIndex = 0;
        tops.forEach((sectionTop, index) => {
            if (scrollY >= sectionTop - 5) currentIndex = index;
        });

        navLinks.forEach((link, index) => {
            link.closest('li').classList.toggle('active', index === currentIndex);
        });
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();
});

// font effect
Splitting();

gsap.registerPlugin(ScrollTrigger);

// // sec01
const matchMedia = gsap.matchMedia();

matchMedia.add({
    isMobile: "(max-width: 768px)",
    isDesktop: "(min-width: 769px)"
}, (context) => {

  const { isMobile } = context.conditions;

  const subTitleY = isMobile ? -100 : -240;
  const subTextY = isMobile ? -80 : -200;

  gsap.timeline({
    scrollTrigger: {
      trigger: '.sec01',
      start: '30% 20%',
      end: '60% 50%',
      scrub: 2,
    }
  })
  .fromTo('.sec01 .main-text',
    { opacity: 1 },
    { opacity: 0 }
  )
  .fromTo('.sec01 .sub-title',
    { opacity: 0, y: 0 },
    { opacity: 1, y: subTitleY }
  )
  .fromTo('.sec01 .body3',
    { opacity: 0, y: 0 },
    { opacity: 0.5, y: subTextY }
  );

});

// // sec02
gsap.timeline({
  scrollTrigger: {
    trigger: '.sec02',
    start: 'top 30%',
    end: '40% 30%',
    scrub: 2,
    //markers: true,
  }
})
.fromTo('.sec02 .sub-text',
    { opacity: 0, x: 30 },
    { opacity: 1, x: 0 }
)
.fromTo('.sec02 .img',
    { opacity: 0, x: -30 },
    { opacity: 1, x: 0 }
)
.fromTo('.sec02 .tool-list',
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0 }
);

// sec04
gsap.timeline({
  scrollTrigger: {
    trigger: '.sec04',
    start: 'top 30%',
    end: '40% 30%',
    scrub: 2,
    //markers: true,
  }
})
.fromTo('.sec04 .text',
    { opacity: 0, y: -30 },
    { opacity: 1, y: 0 }
)
.fromTo('.sec04 .mail',
    { opacity: 0.5, scale: 0.5 },
    { opacity: 1, scale: 1 }
);

const swiper = new Swiper(".project-list .swiper-container", {
    loop: false,
    slidesPerView: 1.1,
    spaceBetween: 16,
    centeredSlides: true,
    allowTouchMove: true,
    simulateTouch: true,
    grabCursor: true,

    breakpoints: {
        768: {
            slidesPerView: 2,
            spaceBetween: 20,
            centeredSlides: false
        },
        980: {
            slidesPerView: 3,
            spaceBetween: 30,
            centeredSlides: false
        }
    },

  navigation: {
        nextEl: ".project-list .swiper-button-next",
        prevEl: ".project-list .swiper-button-prev"
  }
});
