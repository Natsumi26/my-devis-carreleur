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
                    <td><input id="nom-${prestation.id}" value="${prestation.name}" disabled></td>
                    <td><input id="pu-${prestation.id}" value="${prestation.pu}" disabled></td>
                    <td>
                        <button class="btn btn-sm btn-primary me-1" onclick="updatePrestation(${prestation.id}, this)"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="deletePrestation(${prestation.id})"><i class="bi bi-trash3"></i></button>
                    </td>
                </tr>
            `;
        });
    }
    getPrestation();

    //ajouter un prestation
    const addPrestationForm = document.getElementById('addPrestationForm');
    addPrestationForm.addEventListener('submit', async function addPrestation() {
            const name = document.getElementById('nom').value;
            const pu= document.getElementById('pu').value;
        console.log('name')
        // Convertir l'objet en tableau dans le bon ordre
        await window.api.eQuery("INSERT INTO prestation (name, pu) VALUES (?, ?)", [name, pu]);
        getPrestation();
    
        // Fermer la modale
        const modal = bootstrap.Modal.getInstance(document.getElementById('addPrestationModal'));
        modal.hide();
    
        // Réinitialiser le formulaire
        addPrestationForm.reset();
    })

    
    //supprimer un prestation
    window.deletePrestation = async function(id) {
        await window.api.eQuery("DELETE FROM prestation WHERE id=?", [id]);
        getPrestation();
    }
    //Modifier une Prestation
    window.updatePrestation = async function(id, btn) {
        const inputs = [
            document.getElementById(`nom-${id}`),
            document.getElementById(`pu-${id}`),
        ]
    
        if(btn.innerHTML === "Modifier" ) {
            inputs.forEach(input => input.disabled = false);
            btn.innerText = "Sauvegarder";
        } else {
            const prestation = {
            name: document.getElementById(`nom-${id}`).value,
            pu: document.getElementById(`pu-${id}`).value,
        };
        const values = [prestation.name, prestation.pu, id];
        await window.api.eQuery("UPDATE prestation set name=? , pu=? WHERE id=? ", values);
        inputs.forEach(input => input.disabled = true);
        btn.innerText = "Modifier";
        getPrestation();
        }
        
        
    }
    
    });