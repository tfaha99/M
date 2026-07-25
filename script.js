document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const formError = document.getElementById('formError');

    if (!contactForm) return;

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Clear previous error/success messages
        if (formError) {
            formError.textContent = '';
            formError.style.color = '#cf2d2d';
        }

        const name = document.getElementById('name')?.value.trim();
        const email = document.getElementById('email')?.value.trim();
        const phone = document.getElementById('phone')?.value.trim();
        const message = document.getElementById('message')?.value.trim();

        // Basic client-side check
        if (!name || !email || !phone || !message) {
            if (formError) formError.textContent = 'Please fill out all fields.';
            return;
        }

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, phone, message })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                if (formError) {
                    formError.style.color = '#147D91'; // Success color matching site header
                    formError.textContent = 'Thank you! Your message has been saved successfully.';
                }
                contactForm.reset();
            } else {
                if (formError) {
                    formError.textContent = data.message || 'Something went wrong. Please try again.';
                }
            }
        } catch (err) {
            console.error('Submission error:', err);
            if (formError) {
                formError.textContent = 'Unable to connect to the server. Please try again later.';
            }
        }
    });
});