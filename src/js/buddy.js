export const buddy = {
    container: null,
    speech: null,
    text: null,

    init() {
        this.container = document.getElementById('buddy-container');
        this.speech = document.getElementById('buddy-speech');
        this.text = document.getElementById('buddy-text');
    },

    speak(message, duration = 5000) {
        if (!this.text) this.init();
        
        this.text.textContent = message;
        this.speech.classList.remove('hidden');
        
        // React with animation
        this.react('happy');

        if (this.speechTimer) clearTimeout(this.speechTimer);
        this.speechTimer = setTimeout(() => {
            this.speech.classList.add('hidden');
        }, duration);
    },

    react(emotion) {
        if (!this.container) this.init();
        
        // Simple animation classes for reactivity
        this.container.classList.remove('buddy-happy', 'buddy-thinking', 'buddy-celebrate');
        this.container.classList.add(`buddy-${emotion}`);
        
        // CSS handles the actual motion
        setTimeout(() => {
            this.container.classList.remove(`buddy-${emotion}`);
        }, 1000);
    }
};
