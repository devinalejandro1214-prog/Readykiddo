import { questions } from './data.js';
import { buddy } from './buddy.js';
import { store } from './store.js';

export const renderer = {
    renderLanding() {
        return `
            <div class="view-content landing-page" data-animate="fade-in">
                <h1>ReadyKiddo</h1>
                <p class="subtitle">A world that moves at your pace.</p>
                <button class="btn btn-primary" data-action="navigate" data-value="onboard">
                    Start Your Journey <span>→</span>
                </button>
            </div>
        `;
    },

    renderOnboarding(stepIndex) {
        const q = questions[stepIndex];
        const isLast = stepIndex === questions.length - 1;
        
        // Update buddy text
        buddy.speak(q.buddy);

        let optionsHtml = '';
        if (q.type === 'choice') {
            optionsHtml = q.options.map(opt => `
                <button class="btn choice-tile" data-action="select-option" data-key="${q.key}" data-value="${opt}">
                    ${opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
            `).join('');
        } else if (q.type === 'text') {
            optionsHtml = `
                <input type="text" id="name-input" class="readykiddo-input" placeholder="Enter your name..." value="${store.get().config.name}">
                <button class="btn btn-primary" id="save-name">Save Name</button>
            `;
        }

        return `
            <div class="view-content onboarding-step" data-step="${stepIndex}">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(stepIndex + 1) * 10}%"></div>
                </div>
                <h2>${q.title}</h2>
                <div class="options-container">
                    ${optionsHtml}
                </div>
                <div class="navigation-controls">
                    ${stepIndex > 0 ? '<button class="btn" data-action="prev-step">Back</button>' : ''}
                    <button class="btn btn-primary" data-action="${isLast ? 'finish-onboard' : 'next-step'}">
                        ${isLast ? 'Reveal My World' : 'Next'}
                    </button>
                </div>
            </div>
        `;
    },

    renderWorld() {
        const config = store.get().config;
        buddy.speak(`Welcome home, ${config.name}! Your ${config.interest} world is ready!`, 8000);
        
        return `
            <div class="view-content world-view" data-animate="world-reveal">
                <h1>Welcome to ${config.name}'s World</h1>
                <div class="game-grid">
                    <div class="game-tile" data-coming-soon="Dino Diggers - Coming Soon!">
                        <h3>Activity 1</h3>
                        <p>Theme: ${config.interest}</p>
                    </div>
                    <div class="game-tile" data-coming-soon="Robot Friends - Coming Soon!">
                        <h3>Activity 2</h3>
                    </div>
                    <div class="game-tile" data-coming-soon="StoryTime - Coming Soon!">
                        <h3>Activity 3</h3>
                    </div>
                </div>
                <button class="btn" data-action="navigate" data-value="landing">Start Over</button>
            </div>
        `;
    },

    updateTheme(state) {
        const root = document.documentElement;
        const config = state.config;

        // Apply theme based on config
        root.style.setProperty('--theme-accent', this.getColorForPalette(config.palette));
        root.className = `theme-${config.interest} vibe-${config.vibe} sensory-${config.sensory}`;
        
        if (config.sensory === 'low') {
            root.style.setProperty('--transition-butter', '0.2s ease-out');
            document.body.classList.add('no-animations');
        } else {
            root.style.setProperty('--transition-butter', '0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28)');
            document.body.classList.remove('no-animations');
        }
    },

    getColorForPalette(palette) {
        const colors = {
            pastel: '#7C6CFF',
            'high-contrast': '#000000',
            earth: '#4A7C44',
            neon: '#FF00FF'
        };
        return colors[palette] || '#7C6CFF';
    }
};
