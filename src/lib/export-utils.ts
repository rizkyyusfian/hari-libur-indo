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

    // Scroll element into view first
    element.scrollIntoView({ behavior: 'instant', block: 'start' });
    
    // Wait for rendering to complete
    await new Promise(resolve => setTimeout(resolve, 300));

    // Get element's bounding rect for proper positioning
    const rect = element.getBoundingClientRect();
    
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      allowTaint: true,
      windowWidth: document.documentElement.scrollWidth,
      windowHeight: document.documentElement.scrollHeight,
      x: 0,
      y: 0,
      width: element.scrollWidth,
      height: element.scrollHeight,
      onclone: (clonedDoc) => {
        // Ensure the cloned element has white background
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.backgroundColor = '#ffffff';
          // Remove dark mode classes
          clonedElement.classList.remove('dark');
          // Set all text to dark color
          const allElements = clonedElement.querySelectorAll('*');
          allElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.style) {
              htmlEl.classList.remove('dark:bg-slate-900', 'dark:text-gray-100', 'dark:text-white');
            }
          });
        }
      }
    });

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
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

    // Scroll element into view first
    element.scrollIntoView({ behavior: 'instant', block: 'start' });
    
    // Wait for rendering to complete
    await new Promise(resolve => setTimeout(resolve, 300));

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      allowTaint: true,
      windowWidth: document.documentElement.scrollWidth,
      windowHeight: document.documentElement.scrollHeight,
      x: 0,
      y: 0,
      width: element.scrollWidth,
      height: element.scrollHeight,
      onclone: (clonedDoc) => {
        // Ensure the cloned element has white background
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.backgroundColor = '#ffffff';
        }
      }
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
    pdf.save(`hari-libur-${new Date().getFullYear()}.pdf`);
  } catch (error) {
    console.error('Failed to export as PDF:', error);
    alert('Gagal mengekspor PDF. Silakan coba lagi.');
  }
};
