const PDFDocument = require("pdfkit");
const fs = require("fs");

function generateFacture(factureData, outputPath= null) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    // Si outputPath est fourni, on écrit dans un fichier
    if (outputPath) {
      doc.pipe(fs.createWriteStream(outputPath));
    } else {
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    }

    doc.on('error', err => reject(err));

  // --- Contour de page ---
  doc.rect(5, 5, doc.page.width - 10, doc.page.height - 10).stroke();

  // --- Logo ---
  // Assure-toi d'avoir un logo.png dans le dossier assets par exemple
  try {
    doc.image('././assets/logo_entreprise.png', 50, 45, { width: 100 });
  } catch (err) {
    console.warn("Logo introuvable");
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
  doc
    .fontSize(12)
    .text(`Date de la facture : ${factureData.facture.date_facture}`)
    .text(`Numéro de la facture : ${factureData.facture.number}`)
    .moveDown();

    // --- Tableau prestations ---
    const startX = 50;
    let y = doc.y+ 20;
  
    // Largeurs des colonnes
        const colPresta = 250; // largeur réduite
        const colPU = 70;
        const colQty = 70;
        const colTotal = 90;
        const colSpacing = 10; // espacement entre colonnes

    // En-têtes
    doc.rect(startX, y - 5,  colPresta + colPU + colQty + colTotal + colSpacing * 3, 20).fillAndStroke('#f0f0f0', 'black'); // Fond gris pour l'entête
    doc.fillColor('black').font('Helvetica-Bold').fontSize(12)
        .text("Prestation", startX +5, y)
        .text("PU (€)", startX + colPresta + colSpacing, y, { width: colPU, align: "right" })
        .text("Quantité", startX + colPresta + colPU + colSpacing * 2, y, { width: colQty, align: "right" })
        .text("Total (€)", startX + colPresta + colPU + colQty + colSpacing * 3, y, { width: colTotal, align: "right" });
  
    y += 25;
    doc.font('Helvetica').fontSize(12);


    factureData.facture_prestation.forEach((facture_presta, index) => {
    
        if (index % 2 === 0) doc.rect(startX, y - 3, colPresta + colPU + colQty + colTotal + colSpacing * 3, 20).fill('#f9f9f9').fillColor('black');

        doc.text(facture_presta.prestation.name, startX+5, y, { width: colPresta  })
            .text(facture_presta.prestation.pu.toFixed(2), startX + colPresta + colSpacing, y, { width: colPU, align: "right" })
            .text(facture_presta.quantity, startX + colPresta + colPU + colSpacing * 2, y, { width: colQty, align: "right" })
            .text(facture_presta.sous_total.toFixed(2), startX + colPresta + colPU + colQty + colSpacing * 3, y, { width: colTotal, align: "right" })
    
        y += 20;
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



  // Finalise le PDF
  doc.end();
});
}

module.exports = {generateFacture};
