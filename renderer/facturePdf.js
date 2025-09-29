const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require('path');
const { app } = require('electron');

async function generateFacture(factureData, outputPath= null) {
    const logoFileName = factureData.entreprise[0].logo_path;
    const logoPath = path.join(app.getPath('userData'), 'logo_entreprise', logoFileName);
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    // Si outputPath est fourni, on écrit dans un fichier
    if (outputPath) {
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);
      stream.on('finish', () => resolve(outputPath)); // ← résout la promesse
      stream.on('error', reject);
    } else {
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    }

    doc.on('error', err => reject(err));

  // --- Contour de page ---
  doc.rect(5, 5, doc.page.width - 10, doc.page.height - 10).stroke();

  // --- Logo ---
  // Assure-toi d'avoir un logo.png dans le dossier assets par exemple
   if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 45, {
        width: 100, // largeur fixe
        height: 100, // hauteur limite
        fit: [100, 100], // adapte l’image dans ce cadre
        valign: 'top'
      });
    } else {
      console.warn("Logo introuvable :", logoPath);
    }

  // --- En-tête ---
  doc
    .fontSize(20)
    .text("FACTURE",0, 50, { align: "center" })
    .moveDown();

  // --- Infos société ---
  doc
    .fontSize(12)
    .text(`Entreprise : ${factureData.entreprise[0].name}`, 50, 150)
    .text(`Téléphone : ${factureData.entreprise[0].telephone}`)
    .text(`Adresse : ${factureData.entreprise[0].adresse}`, {
      width: 200, // largeur de la zone
      align: 'left'
    })
    .moveDown();

  // --- Infos client ---
  doc
    .fontSize(12)
    .text(`Client : ${factureData.clients.nom}`, 325, 200, { width: 250 })
    .text(`Adresse : ${factureData.clients.adresse}`,325, doc.y, { width: 250 })
    .text(`Téléphone : ${factureData.clients.telephone}`,325, doc.y, { width: 250 })
    .moveDown();
  
  // --- Devis associé ---
  doc
    .fontSize(12)
    .text(`Devis associé : ${factureData.devis.number}`, 50, 280, { align: "left", width: 200 })
    .moveDown();

  // --- Date facture ---

  const date = new Date(factureData.facture.date_facture);
  const dateFr = date.toLocaleDateString("fr-FR"); // ex: 18/09/2025
  doc
    .fontSize(12)
    .text(`Date de la facture : ${dateFr}`)
    .text(`Numéro de la facture : ${factureData.facture.number}`)
    .moveDown();

    // --- Tableau prestations ---
    const startX = 50;
    let y = doc.y+ 20;
  
    // Largeurs des colonnes
    const colPresta = 200; // largeur réduite
    const colPU = 70;
    const colQty = 60;
    const colUni = 70;
    const colTotal = 70;
    const colSpacing = 10; // espacement entre colonnes

    // En-têtes
    doc.rect(startX, y - 5,  colPresta + colPU + colQty + colUni + colTotal + colSpacing * 4, 20).fillAndStroke('#f0f0f0', 'black'); // Fond gris pour l'entête
    doc.fillColor('black').font('Helvetica-Bold').fontSize(12)
        .text("Prestation", startX +5, y)
        .text("PU (€)", startX + colPresta + colSpacing, y, { width: colPU, align: "right" })
        .text("Quantité", startX + colPresta + colPU + colSpacing * 2, y, { width: colQty, align: "right" })
        .text("Unité", startX + colPresta + colPU + colQty + colSpacing * 3, y, { width: colUni, align: "right" })
        .text("Total (€)", startX + colPresta + colPU + colQty + colUni + colSpacing * 4, y, { width: colTotal, align: "right" });
  
    y += 25;
    doc.font('Helvetica').fontSize(12);


    factureData.facture_prestation.forEach((facture_presta, index) => {
    
        if (index % 2 === 0) doc.rect(startX, y - 3, colPresta + colPU + colQty + colUni + colTotal + colSpacing * 4, 20).fill('#f9f9f9').fillColor('black');

        doc.text(facture_presta.prestation.name, startX+5, y, { width: colPresta  })
            .text(facture_presta.prestation.pu.toFixed(2), startX + colPresta + colSpacing, y, { width: colPU, align: "right" })
            .text(facture_presta.quantity, startX + colPresta + colPU + colSpacing * 2, y, { width: colQty, align: "right" })
            .text(facture_presta.unite, startX + colPresta + colPU + colQty + colSpacing * 3, y, { width: colUni, align: "right" })
            .text(facture_presta.sous_total.toFixed(2), startX + colPresta + colPU + colQty + colUni + colSpacing * 4, y, { width: colTotal, align: "right" })
    
        y += 25;
      });

// Ligne avant total
      doc.moveTo(startX, y).lineTo(560, y).stroke();
      y += 10;

// calcul du plus de la tva
const tva = factureData.facture.total_HT*(factureData.facture.taux_tva/100);

// Total HT
doc.fontSize(12).text("Total HT :", 300, y, { width: 160, align: "right" });
doc.text(factureData.facture.total_HT.toFixed(2) + " €", 480, y, { width: 80, align: "right" });
y += 20;

// TVA
doc.fontSize(12).text(`TVA (${factureData.facture.taux_tva}%) :`, 300, y, { width: 160, align: "right" });
doc.text(tva.toFixed(2) + " €", 480, y, { width: 80, align: "right" });
y += 20;

// Total TTC
doc.fontSize(14).text("TOTAL TTC :", 300, y, { width: 160, align: "right" });
doc.text(factureData.facture.total_TTC.toFixed(2) + " €", 480, y, { width: 80, align: "right" });
y += 40;

if (factureData.acomptes && factureData.acomptes.length > 0){

    //Les acomptes
    doc.fontSize(12).text("Les acomptes versés:", 300,y, {width: 160, align: "left"});
    y += 25;

    let totalAcompte = 0;
    factureData.acomptes.forEach((acompte) => {
    const dateAc = new Date(acompte.date_acompte);
    const dateAcFr = dateAc.toLocaleDateString("fr-FR"); // ex: 18/09/2025

      doc.text(dateAcFr, 300, y, { width: 80 })
          .text(acompte.montant.toFixed(2) + " €", 380, y, { width: 80, align: "right" })
          .text("par "+acompte.mode_payement, 480, y, { width: 100, align: "left" })
      y += 25;
      totalAcompte += acompte.montant
      
    });
    y += 25
    //Reste à payer 

  const reste = parseFloat(factureData.facture.total_TTC) - parseFloat(totalAcompte);
  doc.fontSize(14).text("Reste à payer :  ", 300, y, {width: 150, align: "left"});
  doc.text(reste + " €", 400, y , { width: 80, align: "right" })
  y += 25
  }


  // Finalise le PDF
  doc.end();
});
}

module.exports = {generateFacture};
