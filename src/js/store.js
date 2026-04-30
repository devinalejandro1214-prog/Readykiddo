class Store {
    constructor() {
        this.state = {
            currentStep: 0,
            config: {
                name: '',
                avatar: 'fox',
                interest: 'space',
                music: 'lo-fi',
                palette: 'pastel',
                vibe: 'cozy',
                guide: 'coach',
                sensory: 'balanced',
                victory: 'collector',
                navigation: 'buttons'
            },
            history: []
        };
        this.subscribers = [];
    }

    get() {
        return this.state;
    }

    set(patch) {
        this.state = { ...this.state, ...patch };
        this.notify();
    }

    updateConfig(key, value) {
        this.state.config[key] = value;
        this.notify();
    }

    subscribe(fn) {
        this.subscribers.push(fn);
        return () => {
            this.subscribers = this.subscribers.filter(s => s !== fn);
        };
    }

    notify() {
        this.subscribers.forEach(fn => fn(this.state));
        // Persist to local storage
        localStorage.setItem('readykiddo_master_state', JSON.stringify(this.state));
    }

    nextStep() {
        if (this.state.currentStep < 9) {
            this.state.currentStep++;
            this.notify();
        } else {
            // Completion logic handled by router/renderer
            this.notify();
        }
    }

    prevStep() {
        if (this.state.currentStep > 0) {
            this.state.currentStep--;
            this.notify();
        }
    }
}

export const store = new Store();
