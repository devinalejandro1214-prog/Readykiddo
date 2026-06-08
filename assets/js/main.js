document.addEventListener('DOMContentLoaded', function () {
    // ── Smart router: check for active child session ──────────────
    const child = (function () {
        try { return JSON.parse(sessionStorage.getItem('rk_child')); } catch { return null; }
    })();

    const startButton        = document.getElementById('startButton');
    const resumeWorldButton  = document.getElementById('resumeWorldButton');
    const parentLoginLink    = document.getElementById('parentLoginLink');

    // Always hide old resume button (auth flow owns navigation now)
    if (resumeWorldButton) resumeWorldButton.hidden = true;

    if (child && child.name) {
        // ── Returning child session ── show personalised play button
        if (startButton) {
            const label = startButton.querySelector('.cta-label');
            if (label) label.textContent = `Play as ${child.name} 🎮`;
            startButton.addEventListener('click', function () {
                if (window.RKAudio) RKAudio.startTheme();
                window.location.href = 'child-home.html';
            });
        }
        // Show "Switch to parent" link when child session is active
        if (parentLoginLink) {
            parentLoginLink.textContent = '🔒 Parent Dashboard';
            parentLoginLink.href = 'dashboard.html';
            parentLoginLink.hidden = false;
        }
    } else {
        // ── No session ── new visitor or logged-out parent
        if (startButton) {
            startButton.addEventListener('click', function () {
                if (window.RKAudio) RKAudio.startTheme();
                window.location.href = 'auth.html';
            });
        }
        if (parentLoginLink) {
            parentLoginLink.textContent = 'Parent Login';
            parentLoginLink.href = 'auth.html';
            parentLoginLink.hidden = false;
        }
    }
});
