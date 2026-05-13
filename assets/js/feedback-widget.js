(function () {
    const endpoint = '/api/feedback';

    document.addEventListener('DOMContentLoaded', initFeedbackWidget);

    function initFeedbackWidget() {
        if (document.querySelector('[data-feedback-widget]')) return;

        const launcher = document.createElement('button');
        launcher.type = 'button';
        launcher.className = 'feedback-launcher';
        launcher.innerHTML = '<span aria-hidden="true" class="feedback-icon">💬</span><span class="feedback-text">Feedback</span>';
        launcher.setAttribute('aria-haspopup', 'dialog');
        launcher.setAttribute('aria-controls', 'feedbackDialog');

        const dialog = document.createElement('div');
        dialog.className = 'feedback-dialog';
        dialog.id = 'feedbackDialog';
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-modal', 'true');
        dialog.setAttribute('aria-labelledby', 'feedbackTitle');
        dialog.setAttribute('data-feedback-widget', 'true');
        dialog.innerHTML = `
            <form class="feedback-panel" id="feedbackForm">
                <div class="feedback-header">
                    <h2 class="feedback-title" id="feedbackTitle">Send feedback</h2>
                    <button class="feedback-close" type="button" aria-label="Close feedback form">&times;</button>
                </div>
                <label class="feedback-field">
                    Type
                    <select name="type">
                        <option value="idea">Idea</option>
                        <option value="bug">Bug</option>
                        <option value="content">Content</option>
                        <option value="accessibility">Accessibility</option>
                    </select>
                </label>
                <label class="feedback-field">
                    Feedback
                    <textarea name="message" required maxlength="2000" placeholder="What should we improve?"></textarea>
                </label>
                <label class="feedback-field">
                    Email, optional
                    <input name="email" type="email" maxlength="160" autocomplete="email" placeholder="you@example.com">
                </label>
                <label class="feedback-field feedback-hidden">
                    Leave this blank
                    <input name="company" type="text" tabindex="-1" autocomplete="off">
                </label>
                <button class="feedback-submit" type="submit">Submit feedback</button>
                <p class="feedback-status" id="feedbackStatus" aria-live="polite"></p>
            </form>
        `;

        document.body.appendChild(launcher);
        document.body.appendChild(dialog);

        const form = dialog.querySelector('#feedbackForm');
        const close = dialog.querySelector('.feedback-close');
        const status = dialog.querySelector('#feedbackStatus');

        launcher.addEventListener('click', () => openDialog(dialog));
        close.addEventListener('click', () => closeDialog(dialog, launcher));
        dialog.addEventListener('click', (event) => {
            if (event.target === dialog) closeDialog(dialog, launcher);
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && dialog.classList.contains('is-open')) {
                closeDialog(dialog, launcher);
            }
        });

        form.addEventListener('submit', (event) => submitFeedback(event, form, status));
    }

    function openDialog(dialog) {
        dialog.classList.add('is-open');
        const message = dialog.querySelector('textarea[name="message"]');
        if (message) message.focus();
    }

    function closeDialog(dialog, launcher) {
        dialog.classList.remove('is-open');
        launcher.focus();
    }

    async function submitFeedback(event, form, status) {
        event.preventDefault();
        const submit = form.querySelector('.feedback-submit');
        const data = new FormData(form);

        const payload = {
            type: data.get('type'),
            message: data.get('message'),
            email: data.get('email'),
            company: data.get('company'),
            page: window.location.pathname,
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        submit.disabled = true;
        status.textContent = 'Sending...';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(result.error || 'Feedback could not be sent.');
            }

            form.reset();
            status.textContent = 'Thanks. Your feedback was sent for review.';
        } catch (error) {
            status.textContent = error.message || 'Something went wrong. Please try again.';
        } finally {
            submit.disabled = false;
        }
    }
})();
