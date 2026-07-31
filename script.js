const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            const intro = document.querySelector(".intro-screen");
            const introStart = document.querySelector(".intro-start");
            const header = document.querySelector(".header");
            const main = document.querySelector("main");
            const footer = document.querySelector(".footer");
            const menuButton = document.querySelector(".menu-toggle");
            const nav = document.querySelector(".nav");
            const backTop = document.querySelector(".back-top");
            const cursorGlow = document.querySelector(".cursor-glow");
            const siteRegions = [header, main, footer];

            siteRegions.forEach((region) => region?.setAttribute("inert", ""));

            const startExperience = () => {
                if (intro.classList.contains("intro-exiting")) return;

                introStart.disabled = true;
                intro.classList.add("intro-exiting");

                window.setTimeout(() => {
                    intro.classList.add("is-hidden");
                    intro.setAttribute("aria-hidden", "true");
                    document.body.classList.remove("intro-active");
                    siteRegions.forEach((region) => region?.removeAttribute("inert"));
                    window.scrollTo({ top: 0, behavior: "auto" });
                }, reducedMotion ? 50 : 1080);
            };

            introStart.addEventListener("click", startExperience);

            const closeMenu = () => {
                menuButton.classList.remove("active");
                nav.classList.remove("open");
                document.body.classList.remove("menu-open");
                menuButton.setAttribute("aria-expanded", "false");
                menuButton.setAttribute("aria-label", "Abrir menu");
            };

            menuButton.addEventListener("click", () => {
                const isOpen = nav.classList.toggle("open");
                menuButton.classList.toggle("active", isOpen);
                document.body.classList.toggle("menu-open", isOpen);
                menuButton.setAttribute("aria-expanded", String(isOpen));
                menuButton.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
            });

            nav.querySelectorAll("a").forEach((link) => {
                link.addEventListener("click", closeMenu);
            });

            window.addEventListener("resize", () => {
                if (window.innerWidth > 780) closeMenu();
            });

            const updateHeader = () => {
                const scrolled = window.scrollY > 36;
                header.classList.toggle("scrolled", scrolled);
                backTop.classList.toggle("visible", window.scrollY > 620);
            };

            updateHeader();
            window.addEventListener("scroll", updateHeader, { passive: true });

            backTop.addEventListener("click", () => {
                window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
            });

            document.querySelectorAll(".faq-question").forEach((button) => {
                button.addEventListener("click", () => {
                    const item = button.closest(".faq-item");
                    const alreadyOpen = item.classList.contains("open");

                    document.querySelectorAll(".faq-item").forEach((faqItem) => {
                        faqItem.classList.remove("open");
                        faqItem.querySelector(".faq-question").setAttribute("aria-expanded", "false");
                    });

                    if (!alreadyOpen) {
                        item.classList.add("open");
                        button.setAttribute("aria-expanded", "true");
                    }
                });
            });

            const counters = document.querySelectorAll("[data-count]");

            const animateCounter = (element) => {
                if (element.dataset.animated) return;
                element.dataset.animated = "true";

                const target = Number(element.dataset.count);
                const decimal = element.dataset.decimal === "true";
                const suffix = element.dataset.suffix || "";
                const duration = reducedMotion ? 1 : 1400;
                const start = performance.now();

                const tick = (now) => {
                    const progress = Math.min((now - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const current = Math.round(target * eased);
                    const displayValue = decimal
                        ? (current / 10).toFixed(1).replace(".", ",")
                        : current.toLocaleString("pt-BR");

                    element.textContent = `${displayValue}${suffix}`;

                    if (progress < 1) requestAnimationFrame(tick);
                };

                requestAnimationFrame(tick);
            };

            if ("IntersectionObserver" in window && !reducedMotion) {
                const revealObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach((entry) => {
                        if (!entry.isIntersecting) return;

                        entry.target.classList.add("in-view");

                        if (entry.target.matches(".stat")) {
                            const counter = entry.target.querySelector("[data-count]");
                            if (counter) animateCounter(counter);
                        }

                        observer.unobserve(entry.target);
                    });
                }, {
                    threshold: 0.14,
                    rootMargin: "0px 0px -5% 0px"
                });

                document.querySelectorAll(".animate-on-scroll").forEach((element) => {
                    revealObserver.observe(element);
                });
            } else {
                document.querySelectorAll(".animate-on-scroll").forEach((element) => {
                    element.classList.add("in-view");
                });
                counters.forEach(animateCounter);
            }

            if (window.matchMedia("(pointer: fine)").matches && !reducedMotion) {
                window.addEventListener("pointermove", (event) => {
                    cursorGlow.style.opacity = "1";
                    cursorGlow.style.left = `${event.clientX}px`;
                    cursorGlow.style.top = `${event.clientY}px`;
                }, { passive: true });

                document.documentElement.addEventListener("mouseleave", () => {
                    cursorGlow.style.opacity = "0";
                });
            }

            document.querySelector(".newsletter").addEventListener("submit", (event) => {
                event.preventDefault();
            });