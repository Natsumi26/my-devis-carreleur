window.addEventListener('DOMContentLoaded', () => {
//---------------------------

    document.getElementById('addPrestationModal').addEventListener('show.bs.modal', () => {
        addPrestationForm.reset();
      });
    
    async function getPrestation() {
        const prestations = await window.api.fetchAll("SELECT * FROM prestation");
        console.log(prestations)
        const tbody = document.getElementById('prestationsTable')
        tbody.innerHTML='';
        prestations.forEach(prestation => {
            tbody.innerHTML +=`
                <tr>
                    <td>${prestation.id}</td>
                    <td>${prestation.name}</td>
                    <td>${prestation.pu}</td>
                    <td>
                        <button data-bs-toggle="modal" data-bs-target="#addPrestationModal" class="btn btn-sm btn-outline-primary me-4" onclick="updatePrestation(${prestation.id}, this)"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deletePrestation(${prestation.id})"><i class="bi bi-trash3"></i></button>
                    </td>
                </tr>
            `;
        });
    }
    getPrestation();

    //ajouter un prestation

async function addPrestation() {

            const name = document.getElementById('nom').value;
            const pu= document.getElementById('pu').value;
        // Convertir l'objet en tableau dans le bon ordre
        
        await window.api.eQuery("INSERT INTO prestation (name, pu) VALUES (?, ?)", [name, pu]);
        notifier("Prestation ajoutée avec succès", "Prestations");
        getPrestation();
    
    
        // Réinitialiser le formulaire
        document.getElementById('typeForm').value = "add";
        document.getElementById('nom').value = "";
        document.getElementById('pu').value = "";
        
    }

    
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

        // Remplir les champs devis
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
        name: document.getElementById('nom').value,
        pu: document.getElementById('pu').value,
        id: id
    };
    const valuesPrestation = [prestation.name, prestation.pu, prestation.id]

    await window.api.eQuery(
        "UPDATE prestation SET name=?, pu=? WHERE id=?",
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