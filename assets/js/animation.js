
// ============================================
// GSAP Plugin
// ============================================
gsap.registerPlugin(ScrollTrigger);

// ============================================
// Intro
// ============================================
const intro = document.querySelector("#intro");
const path = intro?.querySelector(".path");

if (intro && path) {
    document.body.classList.add("scroll-lock");

    const start = "M 0 100 V 50 Q 50 0 100 50 V 100 z";
    const end   = "M 0 100 V 0 Q 50 0 100 0 V 100 z";

    // 초기 상태 고정
    gsap.set(intro, {
        yPercent: 0,
        force3D: false
    });

    const cleanup = () => {
        intro.remove();
        document.body.classList.remove("scroll-lock");

        // 인트로 제거로 레이아웃 변경 → 재계산
        ScrollTrigger.refresh();
    };

    gsap.timeline({
        onComplete: cleanup,
        onInterrupt: cleanup
    })
    .to(path, {
        morphSVG: start,
        ease: "power2.in",
        duration: 0.8
    })
    .to(path, {
        morphSVG: end,
        ease: "power2.out",
        duration: 0.6
    })
    .to(intro, {
        yPercent: 110,
        ease: "power2.in",
        duration: 0.6
    });
}

// ============================================
// Split 영역
// ============================================
const splits = gsap.utils.toArray(".split");

gsap.set(splits, { opacity: 0 });
splits.forEach((el, i) => {
    const fromX = (i % 2 === 0) ? 80 : -80;

    gsap.fromTo(
        el,
        { x: fromX, opacity: 0 },
        {
            x: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
                trigger: el,
                start: "top 85%",
                toggleActions: "play none none reverse",
                // once: true, // 한 번만 실행
            }
        }
    );
});

// ============================================
// profile-title 영역
// ============================================
ScrollTrigger.matchMedia({
    "(min-width: 768px)": () => {
    gsap.utils.toArray(".profile-title").forEach((el) => {
        gsap.fromTo(el, { opacity: 0, y: 70 }, {
                opacity: 1,
                y: 0,
                ease: "none",
                scrollTrigger: { trigger: el, start: "top 70%", end: "top 50%", scrub: true }
            });
        });
    },
    "(max-width: 767px)": () => {
        gsap.utils.toArray(".profile-title").forEach((el) => {
                gsap.fromTo(el, { opacity: 0, y: 40 }, {
                opacity: 1,
                y: 0,
                ease: "none",
                scrollTrigger: { trigger: el, start: "top 90%", end: "top 60%", scrub: true }
            });
        });
    }
});
