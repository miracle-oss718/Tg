/* =========================================================
   NORTH BARBERSHOP
   Main JavaScript
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================
       SCROLL REVEAL ANIMATIONS
    ========================================================= */
    const revealElements = document.querySelectorAll(
        ".about-inner, .about-details, .services-header, .service-card, .booking-inner, .footer-main"
    );

    revealElements.forEach((el, i) => {
        el.classList.add("reveal");
        if (el.classList.contains("service-card")) {
            el.classList.add(`reveal-delay-${(i % 4) + 1}`);
        }
    });

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

    revealElements.forEach((el) => revealObserver.observe(el));

    /* =========================================================
       MOBILE NAVIGATION
    ========================================================= */
    const navToggle = document.querySelector(".nav-toggle");
    const mobileNavPanel = document.querySelector(".mobile-nav-panel");
    const mobileNavOverlay = document.querySelector(".mobile-nav-overlay");
    const mobileNavClose = document.querySelector(".mobile-nav-close");

    if (navToggle && mobileNavPanel && mobileNavOverlay) {
        const openMobileNav = () => {
            mobileNavPanel.classList.add("is-open");
            mobileNavOverlay.classList.add("is-open");
            navToggle.classList.add("is-active");
            navToggle.setAttribute("aria-expanded", "true");
            mobileNavPanel.setAttribute("aria-hidden", "false");
            document.documentElement.classList.add("nav-locked");
        };

        const closeMobileNav = () => {
            mobileNavPanel.classList.remove("is-open");
            mobileNavOverlay.classList.remove("is-open");
            navToggle.classList.remove("is-active");
            navToggle.setAttribute("aria-expanded", "false");
            mobileNavPanel.setAttribute("aria-hidden", "true");
            document.documentElement.classList.remove("nav-locked");
        };

        navToggle.addEventListener("click", () => {
            const isOpen = mobileNavPanel.classList.contains("is-open");
            isOpen ? closeMobileNav() : openMobileNav();
        });

        mobileNavOverlay.addEventListener("click", closeMobileNav);
        mobileNavClose && mobileNavClose.addEventListener("click", closeMobileNav);

        mobileNavPanel.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", closeMobileNav);
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closeMobileNav();
        });
    }

    /* =========================================================
       SERVICES CAROUSEL
    ========================================================= */
    const track = document.querySelector(".services-track");
    const cards = [...document.querySelectorAll(".service-card")];
    const images = [...document.querySelectorAll(".service-image")];
    const prevButton = document.querySelector(".carousel-prev");
    const nextButton = document.querySelector(".carousel-next");
    const dots = [...document.querySelectorAll(".dot")];

    let currentIndex = 0;

    function getCardWidth() {
        if (!cards.length) return 0;
        const style = window.getComputedStyle(track);
        const gap = parseFloat(style.columnGap || style.gap) || 0;
        return cards[0].offsetWidth + gap;
    }

    function updateDots(index) {
        dots.forEach((dot, i) => {
            dot.classList.toggle("active", i === index);
        });
    }

    function goToSlide(index) {
        const total = cards.length;
        if (!total) return;
        currentIndex = Math.max(0, Math.min(index, total - 1));
        const cardWidth = getCardWidth();
        track.scrollTo({ left: currentIndex * cardWidth, behavior: "smooth" });
        updateDots(currentIndex);
    }

    if (nextButton) {
        nextButton.addEventListener("click", () => goToSlide(currentIndex + 1));
    }

    if (prevButton) {
        prevButton.addEventListener("click", () => goToSlide(currentIndex - 1));
    }

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => goToSlide(index));
    });

    let scrollTimer;
    track.addEventListener("scroll", () => {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
            const cardWidth = getCardWidth();
            if (!cardWidth) return;
            const index = Math.round(track.scrollLeft / cardWidth);
            currentIndex = Math.max(0, Math.min(index, cards.length - 1));
            updateDots(currentIndex);
        }, 100);
    }, { passive: true });

    /* Card click interaction */
    images.forEach((image) => {
        image.addEventListener("click", () => {
            const wasActive = image.classList.contains("is-active");
            images.forEach((item) => item.classList.remove("is-active"));
            if (!wasActive) image.classList.add("is-active");
        });
    });

    document.addEventListener("click", (event) => {
        if (!event.target.closest(".service-image")) {
            images.forEach((image) => image.classList.remove("is-active"));
        }
    });

    /* =========================================================
       ABOUT STATISTICS COUNTER
    ========================================================= */
    const counters = document.querySelectorAll(".detail-number");

    function animateCounter(counter) {
        const target = Number(counter.dataset.target);
        const suffix = counter.dataset.suffix || "";
        const duration = 1800;
        const startTime = performance.now();

        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(target * easedProgress);
            counter.textContent = currentValue.toLocaleString() + suffix;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target.toLocaleString() + suffix;
            }
        }

        requestAnimationFrame(updateCounter);
    }

    const aboutDetails = document.querySelector(".about-details");
    if (aboutDetails && counters.length) {
        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                counters.forEach((counter, index) => {
                    setTimeout(() => animateCounter(counter), index * 150);
                });
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.4 });

        counterObserver.observe(aboutDetails);
    }

    /* =========================================================
       BOOKING CALENDAR
    ========================================================= */
    const calendarDays = document.querySelector("#calendarDays");
    const calendarMonth = document.querySelector("#calendarMonth");
    const calendarYear = document.querySelector("#calendarYear");
    const prevMonthBtn = document.querySelector("#prevMonth");
    const nextMonthBtn = document.querySelector("#nextMonth");
    const bookingDate = document.querySelector("#bookingDate");
    const branchButtons = document.querySelectorAll(".branch-btn");
    const bookingForm = document.querySelector("#bookingForm");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let calendarDate = new Date(today.getFullYear(), today.getMonth(), 1);
    let selectedDate = null;
    let selectedBranch = "lekki";

    const branchData = {
        lekki: { name: "Lekki" },
        surulere: { name: "Surulere" }
    };

    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function renderCalendar() {
        if (!calendarDays) return;

        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();

        calendarMonth.textContent = new Intl.DateTimeFormat("en-US", { month: "long" }).format(calendarDate);
        calendarYear.textContent = year;
        calendarDays.innerHTML = "";

        const firstDay = new Date(year, month, 1);
        let startingDay = firstDay.getDay();
        startingDay = startingDay === 0 ? 6 : startingDay - 1;

        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < startingDay; i++) {
            const empty = document.createElement("span");
            calendarDays.appendChild(empty);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "calendar-day";
            button.textContent = day;

            const date = new Date(year, month, day);
            date.setHours(0, 0, 0, 0);

            if (date < today) {
                button.classList.add("disabled");
                button.disabled = true;
            }

            if (date.getTime() === today.getTime()) {
                button.classList.add("today");
            }

            if (selectedDate && date.getTime() === selectedDate.getTime()) {
                button.classList.add("selected");
            }

            if (date >= today) {
                button.addEventListener("click", () => {
                    selectedDate = new Date(date);
                    bookingDate.value = formatDate(selectedDate);
                    renderCalendar();
                });
            }

            calendarDays.appendChild(button);
        }
    }

    if (prevMonthBtn) {
        prevMonthBtn.addEventListener("click", () => {
            const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const previousMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1);
            if (previousMonth >= currentMonth) {
                calendarDate = previousMonth;
                renderCalendar();
            }
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener("click", () => {
            calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1);
            renderCalendar();
        });
    }

    branchButtons.forEach((button) => {
        button.addEventListener("click", () => {
            branchButtons.forEach((item) => item.classList.remove("active"));
            button.classList.add("active");
            selectedBranch = button.dataset.branch;
        });
    });

    /* =========================================================
       SUCCESS MODAL
    ========================================================= */
    const successModal = document.querySelector("#bookingSuccessModal");
    const successBranch = document.querySelector("#successBranch");
    const successDate = document.querySelector("#successDate");
    const successTime = document.querySelector("#successTime");
    const successService = document.querySelector("#successService");

    const serviceNames = {
        haircut: "Signature Haircut",
        "haircut-beard": "Haircut + Beard",
        beard: "Beard Grooming",
        kids: "Kids Cut",
        premium: "Premium Grooming"
    };

    function openModal(booking) {
        const readableDate = new Date(`${booking.date}T00:00:00`).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric"
        });

        successBranch.textContent = branchData[selectedBranch].name;
        successDate.textContent = readableDate;
        successTime.textContent = new Date(`2000-01-01T${booking.time}`).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit"
        });
        successService.textContent = serviceNames[booking.service] || booking.service;

        successModal.classList.add("is-visible");
        successModal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
    }

    function closeModal() {
        successModal.classList.remove("is-visible");
        successModal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
    }

    document.querySelectorAll("[data-close-modal]").forEach((element) => {
        element.addEventListener("click", closeModal);
    });

    /* =========================================================
       FORM SUBMISSION
    ========================================================= */
    if (bookingForm) {
        bookingForm.addEventListener("submit", (event) => {
            event.preventDefault();

            if (!selectedDate) {
                alert("Please select an appointment date.");
                return;
            }

            const formData = new FormData(bookingForm);
            const booking = {
                branch: selectedBranch,
                name: formData.get("name"),
                phone: formData.get("phone"),
                service: formData.get("service"),
                date: formData.get("date"),
                time: formData.get("time")
            };

            console.log("Booking:", booking);
            openModal(booking);
        });
    }

    /* =========================================================
       INITIALIZE
    ========================================================= */
    renderCalendar();
});
