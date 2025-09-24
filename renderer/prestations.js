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
//---------------------------

    document.getElementById('addPrestationModal').addEventListener('show.bs.modal', () => {
        addPrestationForm.reset();
      });
//----------------GetPrestation--------------------
    async function getPrestation() {
        const prestations = await window.api.fetchAll("SELECT * FROM prestation");
        console.log(prestations)
        const tbody = document.getElementById('bodyTable')
        tbody.innerHTML='';
        prestations.forEach(prestation => {
            tbody.innerHTML +=`
                <tr data-id="${prestation.id}" >
                    <td class="w-25">${prestation.code}</td>
                    <td class="w-50">${prestation.name}</td>
                    <td class="w-25">${prestation.pu}</td>
                </tr>
            `;
        });
    }
    getPrestation();

//------------fucntion pour autogenerer le code------------------------
async function genererCodePrestation() {
    try {
      const rows= await window.api.fetchAll(
        `SELECT code FROM prestation ORDER BY id DESC LIMIT 1`
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
          console.error('Erreur lors de la génération du code prestation :', error);
          return 'REF001'; // Valeur par défaut en cas d'erreur
        }
      }
  

//ajouter un prestation ---------------------------

async function addPrestation() {
            const code = await genererCodePrestation();
            const name = document.getElementById('nom').value;
            const pu= document.getElementById('pu').value;
        // Convertir l'objet en tableau dans le bon ordre
        
        await window.api.eQuery("INSERT INTO prestation (code, name, pu) VALUES (?, ?, ?)", [code, name, pu]);
        notifier("Prestation ajoutée avec succès", "Prestations");
        getPrestation();
    
    
        // Réinitialiser le formulaire
        document.getElementById('typeForm').value = "add";
        document.getElementById('nom').value = "";
        document.getElementById('pu').value = "";
        
    }

//------------------Import d'excel---------------------------------
document.getElementById('importBtn').addEventListener('click', async () => {
    const data = await window.excelAPI.importTable('prestation', 'code');
    if (data) {
        console.log('Données importées :', data);
      // Tu peux les afficher dans ton interface ici
    }
    getPrestation();
});
//-----------------------Export d'excel--------------------------------------
// Export avec modèle Excel
document.getElementById('exportBtn').addEventListener('click', async () => {
  const template = 'model/modele_export_prestation.xlsx'; // chemin vers ton modèle
  const success = await window.excelAPI.exportTable('prestation', template);
  if (success) alert('Prestations exportées avec modèle 🎉');
});
    
//supprimer un prestation
    window.deletePrestation = async function(id) {
        await window.api.eQuery("DELETE FROM prestation WHERE id=?", [id]);
        notifier("Prestation supprimée avec succès", "Prestations");
        getPrestation();
    }

//Modifier une Prestation
    window.updatePrestation = async function(id) {
        document.getElementById('typeForm').value = "update"; 
        document.getElementById('prestationId').value = id;
        

        const prestation = await window.api.fetchAll(
            "SELECT * FROM prestation WHERE id=?", [id]
        );
        const p = prestation[0];

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
            const form = document.getElementById('addPrestationForm');
            form.insertBefore(div, nomLabel.parentNode);
        }

        insererChampCode();

        // Remplir les champs devis
            document.getElementById('code').value = p.code;
            document.getElementById('nom').value = p.name;
            document.getElementById('pu').value = p.pu;

        // Transformer le bouton Ajouter en bouton Mettre à jour
        const addBtn = document.getElementById('addPrestation');
        addBtn.textContent = "Mettre à jour";
        }

// ENREGISTREMENT DES MODIFICATIONS DE PRESTATION
async function updatePrestationSubmit(id) {
    // Update de la prestation
    const prestation = {
        code: document.getElementById('code').value,
        name: document.getElementById('nom').value,
        pu: document.getElementById('pu').value,
        id: id
    };
    const valuesPrestation = [prestation.code, prestation.name, prestation.pu, prestation.id]

    await window.api.eQuery(
        "UPDATE prestation SET code=?, name=?, pu=? WHERE id=?",
        valuesPrestation
    );
    notifier("Prestation modifiée avec succès", "Prestations");
    await getPrestation();

    // Réinitialiser le formulaire
    document.getElementById('typeForm').value = "add";
    const addBtn = document.getElementById('addPrestation');
    addBtn.textContent = "Ajouter";

}

//CHOISIR entre add ou update
document.getElementById('addPrestation').onclick = async function(event) {
    event.preventDefault()
    const mode = document.getElementById('typeForm').value;

    if(mode === "add") {
        await addPrestation();       // fonction qui gère l'ajout
    } else if(mode === "update") {
        const id = document.getElementById('prestationId').value;
        await updatePrestationSubmit(id);  // fonction qui gère la mise à jour
    }
    //Fermer la modale après succès
    const modalEl = document.getElementById('addPrestationModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl) 
        || new bootstrap.Modal(modalEl);
    modalInstance.hide();
}
    
    });