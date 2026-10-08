const sanitizeFileName = (value: string) => value.replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "") || "invoice";

export const downloadInvoicePdf = async (element: HTMLElement, fileName: string) => {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    ignoreElements: (node) => node.classList?.contains("print-hidden") ?? false,
  });

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const margin = 6;
  const pageWidth = pdf.internal.pageSize.getWidth() - margin * 2;
  const pageHeight = pdf.internal.pageSize.getHeight() - margin * 2;
  const imageHeight = (canvas.height * pageWidth) / canvas.width;
  const imageData = canvas.toDataURL("image/jpeg", 0.95);

  let offset = 0;
  pdf.addImage(imageData, "JPEG", margin, margin, pageWidth, imageHeight);
  while (imageHeight - offset > pageHeight) {
    offset += pageHeight;
    pdf.addPage();
    pdf.addImage(imageData, "JPEG", margin, margin - offset, pageWidth, imageHeight);
  }

  pdf.save(`${sanitizeFileName(fileName)}.pdf`);
};
