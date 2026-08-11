// This module provides utilities for exporting calendar.
// Export-only dependencies are loaded after the user requests an export.

const PNG_OPTIONS = {
  quality: 1,
  pixelRatio: 2,
  backgroundColor: '#ffffff',
  style: {
    colorScheme: 'light',
  },
  filter: (node: HTMLElement) => {
    if (node instanceof Element) {
      const tagName = node.tagName?.toLowerCase();
      return tagName !== 'script' && tagName !== 'noscript';
    }
    return true;
  },
};

async function renderCalendarPng(element: HTMLElement) {
  const htmlToImage = await import('html-to-image');
  return htmlToImage.toPng(element, PNG_OPTIONS);
}

export const exportAsImage = async (elementId: string): Promise<void> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with id "${elementId}" not found`);
      alert(`Element kalender tidak ditemukan. Pastikan kalender sudah dimuat.`);
      return;
    }

    // Scroll element into view first
    element.scrollIntoView({ behavior: 'instant', block: 'start' });
    
    // Wait for rendering to complete
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const dataUrl = await renderCalendarPng(element);

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `hari-libur-${new Date().getFullYear()}.png`;
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
    // Dynamic import for jspdf
    const jsPDFModule = await import('jspdf');
    const jsPDF = jsPDFModule.jsPDF;
    
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with id "${elementId}" not found`);
      alert(`Element kalender tidak ditemukan. Pastikan kalender sudah dimuat.`);
      return;
    }

    // Scroll element into view first
    element.scrollIntoView({ behavior: 'instant', block: 'start' });
    
    // Wait for rendering to complete
    await new Promise(resolve => setTimeout(resolve, 300));

    const dataUrl = await renderCalendarPng(element);

    // Create an image to get dimensions
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = dataUrl;
    });
    
    const imgWidth = img.width;
    const imgHeight = img.height;
    
    const pdf = new jsPDF({
      orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
      unit: 'px',
      format: [imgWidth / 2, imgHeight / 2], // Scale down for reasonable file size
    });

    pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth / 2, imgHeight / 2);
    pdf.save(`hari-libur-${new Date().getFullYear()}.pdf`);
  } catch (error) {
    console.error('Failed to export as PDF:', error);
    alert('Gagal mengekspor PDF. Silakan coba lagi.');
  }
};
