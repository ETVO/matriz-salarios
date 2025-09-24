import html2canvas from "html2canvas-pro"
import jsPDF from "jspdf";
import { safeFilename, getTableTitleForExport } from "./helpers";


export async function exportPDF() {
	try {
		const tableTitlePromise = getTableTitleForExport();

		const newSectorTH = document.getElementById("newSectorTH");
		if (newSectorTH) newSectorTH.style.display = "none";

		const table = document.getElementById("salary-table");
		if (!table.querySelector('th')) { alert('Não há registros para exportar.'); return; }
		const canvas = await html2canvas(table, { scale: 3, useCORS: true });
		const imgData = canvas.toDataURL("image/png");

		const margin = 1.5;
		const pxToCm = 0.0264583;

		const orientation = canvas.width > canvas.height ? "l" : "p";
		const tableWidthCm = canvas.width * pxToCm + margin * 2;
		const tableHeightCm = canvas.height * pxToCm + margin * 2 + 2; // extra 2cm for title

		const pdf = new jsPDF(orientation, "cm", [tableHeightCm, tableWidthCm]);

		const imgWidth = canvas.width * pxToCm;
		const imgHeight = canvas.height * pxToCm;

		// Title
		const tableTitle = await tableTitlePromise; // await Promise resolve
		pdf.setFont("helvetica", "bold");
		pdf.setFontSize(36);
		const titleWidth = pdf.getTextWidth(tableTitle);
		const titleX = (tableWidthCm - titleWidth) / 2; // center horizontally
		pdf.text(tableTitle, titleX, margin + 0.75); // draw title a bit below top margin

		// epr-works
		const EPR = 'epr-works'; // await Promise resolve
		pdf.setFont("helvetica", "bold");
		pdf.setFontSize(24);
		pdf.setTextColor('#90a1b9');
		const eprWidth = pdf.getTextWidth(EPR);
		const eprX = 5; // center horizontally
		pdf.text(EPR, eprX, margin + 0.75, { charSpace: .05 }); // draw title a bit below top margin


		// Image (table) placed below title
		const tableY = margin + 3; // push table down by ~2cm
		pdf.addImage(imgData, "PNG", margin, tableY, imgWidth, imgHeight);

		// Create filename
		const filename = safeFilename(tableTitle);

		// Save
		pdf.save(filename + ".pdf");

	} finally {
		const newSectorTH = document.getElementById("newSectorTH");
		if (newSectorTH) newSectorTH.style.display = "table-cell";
	}
}
