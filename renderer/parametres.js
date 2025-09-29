async function loadSmtpSettings() {
    const params = await window.api.fetchAll(`SELECT cle, valeur FROM parametres`);
    console.log(params)
    const map = {};
    params.forEach(p => map[p.cle] = p.valeur);
  
    document.getElementById('email_smtp').value = map.email_smtp || '';
    document.getElementById('pass_smtp').value = map.pass_smtp || '';
    document.getElementById('smtp_host').value = map.smtp_host || '';
    document.getElementById('smtp_port').value = map.smtp_port || '';
    document.getElementById('smtp_secure').value = map.smtp_secure || '';

    document.getElementById('btnSave').style.display = 'none';
  }
loadSmtpSettings()

function activerEdition() {
    document.getElementById('email_smtp').disabled = false;
    document.getElementById('pass_smtp').disabled = false;
    document.getElementById('smtp_host').disabled = false;
    document.getElementById('smtp_port').disabled = false;
    document.getElementById('smtp_secure').disabled = false;
    document.getElementById('btnUpdate').style.display = 'none';
    document.getElementById('btnSave').style.display = 'block';
  }

async function saveSmtpSettings() {
    const email = document.getElementById('email_smtp').value;
    const pass = document.getElementById('pass_smtp').value;
    const host = document.getElementById('smtp_host').value;
    const port = document.getElementById('smtp_port').value;
    const secure = document.getElementById('smtp_secure').value;
  
    // Récupère les valeurs actuelles en base
    const currentParams = await window.api.fetchAll(`SELECT * FROM parametres`);
    console.log(currentParams)
    const paramMap = {};
    currentParams.forEach(p => paramMap[p.cle] = p.valeur);
  
    // Fonction utilitaire pour insérer ou garder l'existant
    async function updateIfNotEmpty(cle, valeur) {
      const finalValue = valeur.trim() !== '' ? valeur : paramMap[cle] || '';
      await window.api.eQuery(`INSERT OR REPLACE INTO parametres (cle, valeur) VALUES (?, ?)`, [cle, finalValue]);
    }
  
    await updateIfNotEmpty('email_smtp', email);
    await updateIfNotEmpty('pass_smtp', pass);
    await updateIfNotEmpty('smtp_host', host);
    await updateIfNotEmpty('smtp_port', port);
    await updateIfNotEmpty('smtp_secure', secure);
  
    notifier('Paramètres SMTP enregistrés');
  }