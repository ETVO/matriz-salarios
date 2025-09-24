import html2canvas from "html2canvas-pro"
import jsPDF from "jspdf";

export async function exportPDF() {
	try {

		// hide only the last TH (new sector)
		const newSectorTH = document.getElementById("newSectorTH");
		if (newSectorTH) newSectorTH.style.display = "none";

		const table = document.getElementById("salary-table");
		const canvas = await html2canvas(table, { scale: 3, useCORS: true });
		const imgData = canvas.toDataURL("image/png");

		const margin = 1.5;
		const pxToCm = 0.0264583;

		const orientation = canvas.width > canvas.height ? "l" : "p"
		const tableWidthCm = canvas.width * pxToCm + margin * 2;
		const tableHeightCm = canvas.height * pxToCm + margin * 2;

		const pdf = new jsPDF(orientation, "cm", [tableHeightCm, tableWidthCm]);

		const imgWidth = canvas.width * pxToCm;
		const imgHeight = canvas.height * pxToCm;
		pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);

		pdf.save("salarios.pdf");
	} finally {
		// restore the TH
		const newSectorTH = document.getElementById("newSectorTH");
		if (newSectorTH) newSectorTH.style.display = "table-cell";
	}
};