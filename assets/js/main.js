document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.getElementById('startButton');

    if (startButton) {
        startButton.addEventListener('click', function() {
            // Navigate to onboarding page
            window.location.href = 'onboarding.html';
        });
    }
});
