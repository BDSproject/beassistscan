// Vérifie si on est connecté en regardant le paramètre 'connected' dans l'URL
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('connected') === 'true') {
  document.getElementById('stepConnect').classList.add('hidden');
  document.getElementById('stepReport').classList.remove('hidden');
  // Nettoyer l'URL pour éviter de le refaire au refresh
  window.history.replaceState({}, document.title, window.location.pathname);
}

// Gestion du formulaire
document.getElementById('reportForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const btn = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  const spinner = document.getElementById('btnSpinner');
  const resultArea = document.getElementById('resultArea');

  btn.disabled = true;
  btnText.textContent = 'Analyse en cours...';
  spinner.classList.remove('hidden');
  resultArea.classList.add('hidden');

  const storeName = document.getElementById('storeName').value;
  const email = document.getElementById('email').value;

  try {
    const response = await fetch('/api/ebay/generate-report-ebay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, storeName, lang: navigator.language || 'fr' }),
    });

    const data = await response.json();

    btn.disabled = false;
    btnText.textContent = '✨ Analyser mes frais';
    spinner.classList.add('hidden');

    if (response.ok && data.success) {
      resultArea.classList.remove('hidden');
      resultArea.innerHTML = `
        <div class="bg-white border border-green-200 rounded-xl p-6 shadow-sm">
          <div class="flex items-center text-green-700 font-bold text-lg mb-2">
            <svg class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
            Rapport envoye avec succes !
          </div>
          <p class="text-sm text-gray-600 mt-3 text-center">Votre rapport a bien ete envoye par email.</p>
        </div>
      `;
    } else {
      throw new Error(data.error || 'Une erreur est survenue.');
    }
  } catch (error) {
    btn.disabled = false;
    btnText.textContent = '✨ Analyser mes frais';
    spinner.classList.add('hidden');

    resultArea.classList.remove('hidden');
    resultArea.innerHTML = `
      <div class="bg-red-50 border border-red-300 rounded-lg p-4 text-red-800">
        <p class="font-bold">⚠️ Erreur</p>
        <p>${error.message || 'Impossible de traiter votre demande. Veuillez réessayer.'}</p>
      </div>
    `;
  }
});