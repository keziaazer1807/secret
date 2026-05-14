// --- CONFIGURATION ---
const CONFIG = {
    password: "27326",
    startDate: "2026-03-27T00:00:00", // Will be parsed to timestamp
    botToken: "8695950474:AAFfjg_3QJGQYYL-Ht45wElrlJ_S-q3eXDo",
    chatId: "6811358260"
};

// Start Date Object
const START_DATE = new Date(CONFIG.startDate).getTime();

// --- DOM ELEMENTS ---
const loginScreen = document.getElementById('login-screen');
const dashboard = document.getElementById('main-dashboard');
const passwordInput = document.getElementById('password-input');
const unlockBtn = document.getElementById('unlock-btn');
const errorMessage = document.getElementById('error-message');

const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const clockEl = document.getElementById('clock-display');

const callBoyBtn = document.getElementById('call-boy-btn');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');
const toastIcon = document.getElementById('toast-icon');

// --- AUTHENTICATION LOGIC ---
function attemptUnlock() {
    const val = passwordInput.value;
    if (val === CONFIG.password) {
        // Success
        errorMessage.style.opacity = '0';
        passwordInput.classList.remove('input-error');

        // GSAP Cinematic Transition
        gsap.to(loginScreen, {
            scale: 1.1,
            opacity: 0,
            duration: 0.6,
            ease: "power2.inOut",
            onComplete: () => {
                loginScreen.classList.add('hidden');
                dashboard.classList.remove('hidden');

                // Set Bar Fills to 0 initially
                document.querySelectorAll('.bar-fill').forEach(el => el.style.width = '0%');

                // Reveal Dashboard Elements
                gsap.fromTo(dashboard,
                    { opacity: 0 },
                    { opacity: 1, duration: 0.5 }
                );

                gsap.fromTo('.center-content',
                    { opacity: 0, y: -30 },
                    { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.2 }
                );

                gsap.fromTo('.profile-card',
                    { opacity: 0, y: 50 },
                    { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: "back.out(1.2)", delay: 0.4 }
                );

                // Animate bars
                setTimeout(() => {
                    document.querySelectorAll('.bar-fill').forEach(el => {
                        el.style.width = '100%';
                    });
                }, 1000);

                // Start Typing
                startTypingEffect();
            }
        });
    } else {
        // Error
        passwordInput.classList.add('input-error');
        errorMessage.textContent = "Mật khẩu không đúng rùi!";
        errorMessage.style.opacity = '1';

        // Remove class after animation ends to allow re-trigger
        setTimeout(() => {
            passwordInput.classList.remove('input-error');
        }, 400);
    }
}

unlockBtn.addEventListener('click', attemptUnlock);
passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') attemptUnlock();
});

// Focus glow effect
passwordInput.addEventListener('focus', () => {
    gsap.to('.glow-orb', { scale: 1.3, opacity: 0.9, duration: 0.3 });
});
passwordInput.addEventListener('blur', () => {
    gsap.to('.glow-orb', { scale: 1, opacity: 0.5, duration: 0.3 });
});

// --- REALTIME COUNTERS ---
function updateCounters() {
    const now = new Date().getTime();
    const diff = now - START_DATE;

    if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        daysEl.innerText = days;
        hoursEl.innerText = hours.toString().padStart(2, '0');
        minutesEl.innerText = minutes.toString().padStart(2, '0');
        secondsEl.innerText = seconds.toString().padStart(2, '0');
    }

    // Realtime Clock
    const d = new Date();
    clockEl.innerText = d.toLocaleTimeString('vi-VN', { hour12: false });
}

setInterval(updateCounters, 1000);
updateCounters(); // init immediately

// --- TELEGRAM BOT INTEGRATION ---
function showToast(message, isError = false, customIcon = null, isCenter = false) {
    toastMessage.innerText = message;

    if (isCenter) {
        toast.classList.add('center-toast');
    } else {
        toast.classList.remove('center-toast');
    }

    if (customIcon) {
        toastIcon.className = customIcon;
        toast.classList.remove('error');
    } else if (isError) {
        toastIcon.className = "ph-fill ph-warning-circle";
        toast.classList.add('error');
    } else {
        toastIcon.className = "ph-fill ph-check-circle";
        toast.classList.remove('error');
    }

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

callBoyBtn.addEventListener('click', async () => {
    // Prevent spam
    if (callBoyBtn.classList.contains('loading')) return;

    callBoyBtn.classList.add('loading');
    callBoyBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i><span>Đang gửi...</span>';

    try {
        const ua = navigator.userAgent;
        let device = "Desktop PC";
        if (/android/i.test(ua)) device = "Android";
        if (/iPad|iPhone|iPod/i.test(ua)) device = "iOS";

        let browserName = "Trình duyệt Web";
        if (ua.indexOf("Chrome") > -1) browserName = "Google Chrome";
        if (ua.indexOf("Safari") > -1 && ua.indexOf("Chrome") === -1) browserName = "Safari";
        if (ua.indexOf("Firefox") > -1) browserName = "Mozilla Firefox";

        const time = new Date().toLocaleString('vi-VN');

        const text = `❤️ **Có người đang nhớ anh từ Web Tình Yêu** ❤️\n\n🕒 Thời gian: ${time}\n📱 Thiết bị: ${device}\n🌐 Trình duyệt: ${browserName}`;

        const url = `https://api.telegram.org/bot${CONFIG.botToken}/sendMessage`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: CONFIG.chatId,
                text: text,
                parse_mode: "Markdown"
            })
        });

        if (response.ok) {
            showToast("Đã báo cho anh ấy biết rùi! ❤️");
        } else {
            throw new Error("API Error");
        }
    } catch (error) {
        console.error(error);
        showToast("Lỗi gửi tin nhắn mất rồi 😢", true);
    } finally {
        callBoyBtn.classList.remove('loading');
        callBoyBtn.innerHTML = '<i class="ph-fill ph-paper-plane-tilt"></i><span>Gọi Anh ❤️</span>';
    }
});

// --- CANVAS PARTICLES REMOVED FOR PERFORMANCE ---

// --- TYPEWRITER EFFECT ---
const quotes = [
    "Yêu không phải là nhìn nhau, mà là cùng nhau nhìn về một hướng.",
    "Trong mắt mình, bạn là cả một bầu trời.",
    "Gặp được bạn là điều may mắn nhất đời mình.",
    "Khoảng cách không quan trọng, quan trọng là trái tim luôn hướng về nhau."
];
const quoteEl = document.getElementById('love-quote');
let typeIndex = 0;
let currentQuote = quotes[Math.floor(Math.random() * quotes.length)];

function startTypingEffect() {
    quoteEl.innerHTML = '';
    typeIndex = 0;

    function typeWriter() {
        if (typeIndex < currentQuote.length) {
            quoteEl.innerHTML = currentQuote.substring(0, typeIndex + 1) + '<span class="cursor"></span>';
            typeIndex++;
            setTimeout(typeWriter, 80);
        } else {
            // Finished typing
            quoteEl.innerHTML = currentQuote + '<span class="cursor"></span>';
        }
    }

    setTimeout(typeWriter, 1200); // Wait for cards to animate in
}

// --- SECRET LETTER MODAL ---
const openLetterBtn = document.getElementById('open-letter-btn');
const closeLetterBtn = document.getElementById('close-letter-btn');
const letterModal = document.getElementById('letter-modal');
const secretMessageEl = document.getElementById('secret-message');

const secretMessages = [
    "Dù thời gian có trôi qua bao lâu đi chăng nữa, cảm giác của mình lúc này vẫn nguyên vẹn: bạn là người tuyệt vời nhất mà mình từng gặp. Cảm ơn bạn vì đã luôn ở đó. ❤️",
    "Có thể chúng ta chưa đi đến mọi nơi cùng nhau, nhưng mình luôn tin rằng quãng đường sắp tới sẽ chứa đầy những kỷ niệm đẹp nhất của hai đứa mình. ✨",
    "Có những ngày mệt mỏi, chỉ cần được trò chuyện và nhìn thấy nụ cười của bạn là mọi muộn phiền dường như tan biến hết. Mình mong sẽ được đồng hành cùng bạn thật dài lâu. 🥰",
    "Mỗi khoảnh khắc được ở cạnh bạn đối với mình đều rất quý giá. Mình luôn mong chờ những lời tâm sự, những câu chuyện và vô vàn kỷ niệm chúng ta sẽ tạo ra cùng nhau. 💌",
    "Bạn biết không, kể từ ngày có bạn, mỗi ngày của mình đều trở nên rực rỡ và ý nghĩa hơn rất nhiều. Mình thật sự rất trân trọng và biết ơn sự hiện diện của bạn. 💕",
    "Mình luôn muốn trở thành người có thể mang lại niềm vui cho bạn mỗi ngày. Chỉ cần thấy bạn cười, thế giới của mình dường như trọn vẹn hơn rất nhiều. 🌍❤️",
    "Ở cạnh bạn luôn mang lại cho mình một cảm giác bình yên đến lạ thường. Mong rằng dù là bây giờ hay nhiều năm sau nữa, chúng ta vẫn sẽ luôn hướng về nhau như thế này nhé. 🌟"
];

let letterTypingTimeout;

if (openLetterBtn) {
    openLetterBtn.addEventListener('click', () => {
        // Pick random message
        const randomMsg = secretMessages[Math.floor(Math.random() * secretMessages.length)];
        secretMessageEl.innerHTML = '';

        // Show modal
        letterModal.classList.remove('hidden');
        gsap.fromTo(letterModal,
            { opacity: 0 },
            { opacity: 1, duration: 0.4 }
        );
        gsap.fromTo('.letter-container',
            { y: 30, scale: 0.95, opacity: 0 },
            {
                y: 0, scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.5)", delay: 0.1, onComplete: () => {
                    // Typewriter effect
                    let i = 0;
                    function typeChar() {
                        if (i < randomMsg.length) {
                            secretMessageEl.innerHTML += randomMsg.charAt(i);
                            i++;
                            letterTypingTimeout = setTimeout(typeChar, 30); // fast typing speed
                        }
                    }
                    typeChar();
                }
            }
        );
    });
}

if (closeLetterBtn) {
    closeLetterBtn.addEventListener('click', () => {
        clearTimeout(letterTypingTimeout);
        gsap.to(letterModal, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                letterModal.classList.add('hidden');
            }
        });
    });
}
// --- GIRL CARD SEARCH BUTTON ---
const searchGirlBtn = document.getElementById('search-girl-btn');
if (searchGirlBtn) {
    searchGirlBtn.addEventListener('click', () => {
        showToast("Bạn đang ở trong tim mình ❤️", false, "ph-fill ph-heart", true);
    });
}

// --- PARALLAX REMOVED FOR PERFORMANCE ---
