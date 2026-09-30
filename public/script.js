document.getElementById('healthBtn')?.addEventListener('click', async () => {
  const box = document.getElementById('statusBox');

  try {
    const response = await fetch('/health');
    const data = await response.json();

    box.textContent = `Health check passed: ${data.message}`;
    box.style.borderColor = 'rgba(34, 197, 94, 0.8)';
    box.style.color = '#bbf7d0';
  } catch (error) {
    box.textContent = 'Health check failed. Please verify the deployment.';
    box.style.borderColor = 'rgba(239, 68, 68, 0.8)';
    box.style.color = '#fecaca';
  }
});
