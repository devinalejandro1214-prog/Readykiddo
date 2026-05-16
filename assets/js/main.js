document.addEventListener('DOMContentLoaded', function () {
    const startButton = document.getElementById('startButton');
    if (startButton) {
        startButton.addEventListener('click', function () {
            // Start theme song immediately on first user tap — browser always
            // allows audio that's triggered directly inside a click handler
            if (window.RKAudio) {
                RKAudio.startTheme();
            }
            window.location.href = 'onboarding.html';
        });
    }

    const resumeWorldButton = document.getElementById('resumeWorldButton');
    const savedProfile = getSavedProfile();
    if (resumeWorldButton && savedProfile) {
        resumeWorldButton.hidden = false;
        resumeWorldButton.querySelector('span').textContent = `Resume ${savedProfile.theme || 'World'}`;
        resumeWorldButton.addEventListener('click', function () {
            if (window.RKAudio) RKAudio.startTheme();
            window.location.href = 'world-reveal.html';
        });
    }
});

function getSavedProfile() {
    try {
        const profile = JSON.parse(localStorage.getItem('userProfile') || 'null');
        if (!profile || !profile.theme || !profile.character) return null;
        return profile;
    } catch (e) {
        return null;
    }
}
