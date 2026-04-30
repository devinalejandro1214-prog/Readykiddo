import { store } from './store.js';
import { buddy } from './buddy.js';
import { ui } from './ui.js';
import { renderer } from './renderer.js';

class App {
    constructor() {
        this.viewContainer = document.getElementById('main-view');
        this.init();
    }

    async init() {
        console.log('ReadyKiddo Master Vision: Initializing...');
        
        // Hide loading overlay
        setTimeout(() => {
            document.body.classList.remove('loading');
        }, 800);

        // Initial Buddy Greeting
        buddy.speak("Welcome to your magical learning world! I'm your guide. Let's build something amazing together!");

        // Start with the Landing Page
        this.navigate('landing');
        
        // Listen for store updates
        store.subscribe((state) => {
            renderer.updateTheme(state);
        });

        // Global click handler for "Coming Soon" tooltips
        document.addEventListener('click', (e) => {
            if (e.target.dataset?.comingSoon) {
                ui.showTooltip(e.clientX, e.clientY, e.target.dataset.comingSoon);
            }
        });
    }

    async navigate(view) {
        // Use View Transitions API if available
        if (!document.startViewTransition) {
            this.renderView(view);
            return;
        }

        document.startViewTransition(() => {
            this.renderView(view);
        });
    }

    renderView(view) {
        this.viewContainer.innerHTML = '';
        
        switch(view) {
            case 'landing':
                this.viewContainer.innerHTML = renderer.renderLanding();
                break;
            case 'onboard':
                this.viewContainer.innerHTML = renderer.renderOnboarding(store.get().currentStep);
                break;
            case 'world':
                this.viewContainer.innerHTML = renderer.renderWorld();
                break;
            default:
                this.viewContainer.innerHTML = renderer.renderLanding();
        }

        // Re-attach event listeners for the new view
        ui.attachListeners(this.navigate.bind(this));
    }
}

window.ReadyKiddo = new App();
export const app = window.ReadyKiddo;
