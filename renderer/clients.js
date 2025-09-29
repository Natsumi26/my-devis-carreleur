window.addEventListener('DOMContentLoaded', () => {

    //Fonction pour le search
    window.Search = async function(){
        // Declare variables
        let input, filter, table, tr, td, i, txtValue;
        input = document.getElementById("search");
        filter = input.value.toUpperCase();
        table = document.getElementById("myTable");
        tr = table.getElementsByTagName("tr");

        for (i = 0; i < tr.length; i++) {
            td = tr[i].getElementsByTagName("td")[1];
            if (td) {
                txtValue = td.textContent || td.innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    tr[i].style.display = "";
                } else {
                    tr[i].style.display = "none";
                }
            }
        }
    }

    //Function pour tri par ordre alphabet
const sortDirections = {}; // clé : index de colonne, valeur : 'asc' ou 'desc'

window.sortTable = function(colIndex) {
  const table = document.getElementById("myTable");
  let shouldSwitch = true;
  let i;
  let switching = true;
  let switchcount = 0;

  // Définir la direction initiale si elle n'existe pas
  if (!sortDirections[colIndex]) {
    sortDirections[colIndex] = "asc";
  }

  while (switching) {
    switching = false;
    const rows = table.rows;

    for (i = 1; i < rows.length - 1; i++) {
      shouldSwitch = false;
      const x = rows[i].getElementsByTagName("TD")[colIndex];
      const y = rows[i + 1].getElementsByTagName("TD")[colIndex];

      let xContent = x.innerText.trim();
      let yContent = y.innerText.trim();

      // Si c’est une date en format fr (jj/mm/aaaa)
      if (colIndex === 1) {
        xContent = xContent.toLowerCase();
        yContent = yContent.toLowerCase();
      }

      if (
        (sortDirections[colIndex] === "asc" && xContent > yContent) ||
        (sortDirections[colIndex] === "desc" && xContent < yContent)
      ) {
        shouldSwitch = true;
        break;
      }
    }
    if (shouldSwitch) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
        switchcount++;
    } else {
      if (switchcount === 0) {
        // Inverser la direction
        sortDirections[colIndex] = sortDirections[colIndex] === "asc" ? "desc" : "asc";
        switching = true;
      }
    }
    // Mise à jour visuelle des flèches
    const headers = document.querySelectorAll("#myTable th");
    headers.forEach((th, i) => {
    th.classList.remove("sorted-asc", "sorted-desc");
    if (i === colIndex) {
        th.classList.add(`sorted-${sortDirections[colIndex]}`);
    }
    });
  }
};
//------------fucntion pour autogenerer le code------------------------
async function genererCodeClients() {
    try {
      const rows= await window.api.fetchAll(
        `SELECT code FROM clients ORDER BY id DESC LIMIT 1`
        ); 
        console.log(rows) 

        let nouveauCode = 'REF001';

        if (rows.length > 0 && rows[0].code) {
            const match = rows[0].code.match(/REF(\d+)/);
            if (match) {
                const numero = parseInt(match[1], 10) + 1;
                nouveauCode = `REF${numero.toString().padStart(3, '0')}`;
            }
        }

        return nouveauCode;
        } catch (error) {
          console.error('Erreur lors de la génération du code clients :', error);
          return 'REF001'; // Valeur par défaut en cas d'erreur
        }
      }
  
//------------------------------------------------
document.getElementById('addClientModal').addEventListener('show.bs.modal', () => {
    document.getElementById('addClientForm').reset();
});

async function getClients() {
    const clients = await window.api.fetchAll("SELECT * FROM clients");
    const tbody = document.getElementById('bodyTable')
    tbody.innerHTML='';
    clients.forEach(client => {
        tbody.innerHTML +=`
            <tr data-id="${client.id}">
                <td class="w-10">${client.code}</td>
                <td class="w-25">${client.nom}</td>
                <td class="w-20">${client.telephone}</td>
                <td class="w-20">${client.email}</td>
                <td class="w-25">${client.adresse}</td>
            </tr>
        `;
    });
}
getClients();

//ajouter un client

async function addClient() {
    const code =  await genererCodeClients();
    const nom =  document.getElementById('nom').value;
    const telephone = document.getElementById('telephone').value;
    const email =  document.getElementById('email').value;
    const adresse = document.getElementById('adresse').value;
    
    // Convertir l'objet en tableau dans le bon ordre
    const values = [code, nom, telephone, email, adresse];
    await window.api.eQuery("INSERT INTO clients (code, nom, telephone, email, adresse) VALUES (?, ?, ?, ?, ?)", values);
    notifier("Client créé avec succès", "Clients");
    getClients();

    // Réinitialiser le formulaire
        document.getElementById('typeForm').value = "add";
        document.getElementById('nom').value = "";
        document.getElementById('telephone').value = "";
        document.getElementById('email').value = "";
        document.getElementById('adresse').value = "";
}
//------------------Import d'excel---------------------------------
document.getElementById('importBtn').addEventListener('click', async () => {
    const data = await window.excelAPI.importTable('clients', 'code');
    if (data) {
        console.log('Données importées :', data);
      // Tu peux les afficher dans ton interface ici
    }
    getClients();
});
//-----------------------Export d'excel--------------------------------------
// Export avec modèle Excel
document.getElementById('exportBtn').addEventListener('click', async () => {
  const template = 'model/modele_export_clients.xlsx'; // chemin vers ton modèle
  const success = await window.excelAPI.exportTable('clients', template);
  if (success) alert('Clients exportées avec modèle 🎉');
});


//supprimer un clients
window.deleteClient = async function(id) {
    await window.api.eQuery("DELETE FROM clients WHERE id=?", [id]);
    notifier("Client supprimé avec succès", "Clients");
    getClients();
}

//Modifier un clients
window.updateClient = async function(id) {
    document.getElementById('typeForm').value = "update"; 
    document.getElementById('clientId').value = id;

    const clients = await window.api.fetchAll(
        "SELECT * FROM clients WHERE id=?", [id]
    );
    const c = clients[0];

function insererChampCode() {
        // Vérifie si le champ existe déjà
        if (document.getElementById('code')) return;

        // Crée le conteneur
    const div = document.createElement('div');
    div.className = 'mb-3';

    // Crée le label
    const label = document.createElement('label');
    label.setAttribute('for', 'code');
    label.className = 'form-label';
    label.textContent = 'Code';

      // Crée l'input code
        let codeInput = document.createElement('input');
        codeInput.type = 'text';
        codeInput.id = 'code';
        codeInput.name = 'code';
        codeInput.disabled = true; 
        codeInput.classList.add('form-control'); // si tu utilises Bootstrap ou autre
  
      // Insère l'input dans le formulaire (ex: avant le champ nom)
      const nomInput = document.getElementById('nom');
      nomInput.parentNode.insertBefore(codeInput, nomInput);

    // Assemble
    div.appendChild(label);
    div.appendChild(codeInput);

    // Insère avant le label "Nom"
        const nomLabel = document.querySelector('label[for="nom"]');
        const form = document.getElementById('addClientForm');
        form.insertBefore(div, nomLabel.parentNode);
    }

    insererChampCode();


    // Remplir les champs devis
        document.getElementById('code').value = c.code;
        document.getElementById('nom').value = c.nom;
        document.getElementById('telephone').value = c.telephone;
        document.getElementById('email').value = c.email;
        document.getElementById('adresse').value = c.adresse;

    // Transformer le bouton Ajouter en bouton Mettre à jour
    const addBtn = document.getElementById('addClient');
    addBtn.textContent = "Mettre à jour";
    }

// ENREGISTREMENT DES MODIFICATIONS DE client
async function updateClientSubmit(id) {
    // Update de la client
        const client = {
        code: document.getElementById(`code`).value,
        nom: document.getElementById(`nom`).value,
        telephone: document.getElementById(`telephone`).value,
        email: document.getElementById(`email`).value,
        adresse: document.getElementById(`adresse`).value,
        id: id
    };
    const values = [client.code, client.nom, client.telephone, client.email, client.adresse, id];
    await window.api.eQuery("UPDATE clients set code=?, nom=? , telephone=? , email=? , adresse=? WHERE id=? ", values);
    notifier("Client modifié avec succès", "Clients");
    await getClients();
    
    // Réinitialiser le formulaire
    document.getElementById('typeForm').value = "add";
    const addBtn = document.getElementById('addClient');
    addBtn.textContent = "Ajouter";
    }
    
    
//CHOISIR entre add ou update
    document.getElementById('addClient').onclick = async function(event) {
        event.preventDefault()
        const mode = document.getElementById('typeForm').value;
    
        if(mode === "add") {
            await addClient();       // fonction qui gère l'ajout
        } else if(mode === "update") {
            const id = document.getElementById('clientId').value;
            await updateClientSubmit(id);  // fonction qui gère la mise à jour
        }
        //Fermer la modale après succès
        const modalEl = document.getElementById('addClientModal');
        const modalInstance = bootstrap.Modal.getInstance(modalEl) 
            || new bootstrap.Modal(modalEl);
        modalInstance.hide();
    }
        
        });
