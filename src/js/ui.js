import { store } from './store.js';
import { buddy } from './buddy.js';

export const ui = {
    attachListeners(navigate) {
        // Universal action listeners
        document.querySelectorAll('[data-action]').forEach(el => {
            el.addEventListener('click', (e) => {
                const action = el.dataset.action;
                const value = el.dataset.value;

                if (action === 'navigate') navigate(value);
                if (action === 'next-step') {
                    store.nextStep();
                    navigate('onboard');
                }
                if (action === 'prev-step') {
                    store.prevStep();
                    navigate('onboard');
                }
                if (action === 'select-option') {
                    const key = el.dataset.key;
                    store.updateConfig(key, value);
                    
                    // Visual feedback on the button
                    document.querySelectorAll('.choice-tile').forEach(b => b.classList.remove('selected'));
                    el.classList.add('selected');
                    
                    buddy.react('happy');
                }
                if (action === 'finish-onboard') {
                    navigate('world');
                }
            });
        });

        // Name input handling
        const nameInput = document.getElementById('name-input');
        const saveName = document.getElementById('save-name');
        if (nameInput && saveName) {
            saveName.onclick = () => {
                store.updateConfig('name', nameInput.value);
                buddy.speak(`Nice to meet you, ${nameInput.value}!`);
                store.nextStep();
                navigate('onboard');
            };
        }

        // Pointer Events for Drag and Drop
        const draggable = document.querySelector('.draggable');
        if (draggable) this.initDrag(draggable);
    },

    initDrag(el) {
        let isDragging = false;
        let startX, startY;

        el.onpointerdown = (e) => {
            isDragging = true;
            el.setPointerCapture(e.pointerId);
            startX = e.clientX - el.offsetLeft;
            startY = e.clientY - el.offsetTop;
            el.classList.add('dragging');
        };

        el.onpointermove = (e) => {
            if (!isDragging) return;
            const x = e.clientX - startX;
            const y = e.clientY - startY;
            el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        };

        el.onpointerup = (e) => {
            isDragging = false;
            el.releasePointerCapture(e.pointerId);
            el.classList.remove('dragging');
            
            const dropZones = document.querySelectorAll('.drop-zone');
            let dropped = false;
            dropZones.forEach(zone => {
                const rect = zone.getBoundingClientRect();
                if (e.clientX > rect.left && e.clientX < rect.right && 
                    e.clientY > rect.top && e.clientY < rect.bottom) {
                    this.onDrop(el, zone);
                    dropped = true;
                }
            });

            if (!dropped) {
                el.style.transition = 'transform 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28)';
                el.style.transform = 'translate3d(0,0,0)';
                setTimeout(() => el.style.transition = '', 500);
            }
        };
    },

    onDrop(el, zone) {
        const key = zone.dataset.key;
        const value = el.dataset.value;
        store.updateConfig(key, value);
        buddy.speak(`Perfect! You chose ${value}!`);
        zone.classList.add('filled');
    },

    showTooltip(x, y, text) {
        const tip = document.getElementById('tooltip');
        const tipText = document.getElementById('tooltip-text');
        
        tipText.textContent = text;
        tip.style.left = `${x}px`;
        tip.style.top = `${y - 40}px`;
        tip.classList.remove('hidden');

        setTimeout(() => tip.classList.add('hidden'), 2000);
    }
};
