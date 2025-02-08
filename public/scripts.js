// Contact form submission
document.getElementById('contactForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formMessage = document.getElementById('formMessage');
    const submitButton = this.querySelector('button[type="submit"]');
    
    try {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        
        const formData = new FormData(this);
        const fileUpload = document.getElementById('fileUpload').files[0];
        if (fileUpload) {
            formData.append('file', fileUpload);
        }
        
        // Correct Render app URL
        const response = await fetch('https://lonk.onrender.com/api/submit-form', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            formMessage.textContent = 'Thank you for your submission! We will get back to you soon.';
            formMessage.style.color = 'green';
            this.reset();
        } else {
            throw new Error('Form submission failed');
        }
    } catch (error) {
        console.error('Error:', error);
        formMessage.textContent = 'Something went wrong. Please try again later.';
        formMessage.style.color = 'red';
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit';
    }
});
