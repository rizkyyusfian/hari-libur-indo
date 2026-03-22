// This module provides utilities for exporting calendar
// The actual dependencies (html2canvas, jspdf) need to be loaded dynamically

export const exportAsImage = async (elementId: string): Promise<void> => {
  try {
    // Dynamic import for client-side only
    const html2canvasModule = await import('html2canvas');
    const html2canvas = html2canvasModule.default;
    
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with id "${elementId}" not found`);
      alert(`Element kalender tidak ditemukan. Pastikan kalender sudah dimuat.`);
      return;
    }

    // Wait a brief moment to ensure rendering is complete
    await new Promise(resolve => setTimeout(resolve, 100));

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      allowTaint: true,
      scrollX: 0,
      scrollY: -window.scrollY,
    });

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `hari-libur-${new Date().toISOString().split('T')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Failed to export as image:', error);
    alert('Gagal mengekspor gambar. Silakan coba lagi.');
  }
};

export const exportAsPDF = async (elementId: string): Promise<void> => {
  try {
    // Dynamic imports for client-side only
    const jsPDFModule = await import('jspdf');
    const jsPDF = jsPDFModule.jsPDF;
    const html2canvasModule = await import('html2canvas');
    const html2canvas = html2canvasModule.default;
    
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with id "${elementId}" not found`);
      alert(`Element kalender tidak ditemukan. Pastikan kalender sudah dimuat.`);
      return;
    }

    // Wait a brief moment to ensure rendering is complete
    await new Promise(resolve => setTimeout(resolve, 100));

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      allowTaint: true,
      scrollX: 0,
      scrollY: -window.scrollY,
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Calculate dimensions to fit on page
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    const pdf = new jsPDF({
      orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
      unit: 'px',
      format: [imgWidth / 2, imgHeight / 2], // Scale down for reasonable file size
    });

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth / 2, imgHeight / 2);
    pdf.save(`hari-libur-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Failed to export as PDF:', error);
    alert('Gagal mengekspor PDF. Silakan coba lagi.');
  }
};
