// This module provides utilities for exporting calendar
// The actual dependencies (html2canvas, jspdf) need to be loaded dynamically

export const exportAsImage = async (elementId: string): Promise<void> => {
  try {
    const html2canvas = (await import('html2canvas')).default;
    const element = document.getElementById(elementId);
    if (!element) throw new Error('Element not found');

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `hari-libur-${new Date().toISOString().split('T')[0]}.png`;
    link.click();
  } catch (error) {
    console.error('Failed to export as image:', error);
    alert('Gagal mengekspor gambar. Pastikan browser mendukung fitur ini.');
  }
};

export const exportAsPDF = async (elementId: string): Promise<void> => {
  try {
    const jsPDF = (await import('jspdf')).jsPDF;
    const html2canvas = (await import('html2canvas')).default;
    const element = document.getElementById(elementId);
    if (!element) throw new Error('Element not found');

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`hari-libur-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Failed to export as PDF:', error);
    alert('Gagal mengekspor PDF. Pastikan browser mendukung fitur ini.');
  }
};
