// This module provides utilities for exporting calendar
// The actual dependencies (html2canvas, jspdf) need to be loaded dynamically

// Suppress console warnings during export (html2canvas doesn't support lab() colors from Tailwind v4)
const suppressColorWarnings = () => {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const message = args[0]?.toString() || '';
    if (message.includes('unsupported color function') || message.includes('lab')) {
      return; // Suppress this warning
    }
    originalWarn.apply(console, args);
  };
  return () => {
    console.warn = originalWarn;
  };
};

export const exportAsImage = async (elementId: string): Promise<void> => {
  const restoreConsole = suppressColorWarnings();
  
  try {
    // Dynamic import for client-side only
    const html2canvasModule = await import('html2canvas');
    const html2canvas = html2canvasModule.default;
    
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with id "${elementId}" not found`);
      alert(`Element kalender tidak ditemukan. Pastikan kalender sudah dimuat.`);
      restoreConsole();
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
      ignoreElements: (el) => {
        // Ignore elements that might cause issues
        return el.tagName === 'SCRIPT' || el.tagName === 'STYLE';
      },
      onclone: (clonedDoc, clonedElement) => {
        // Force white background
        clonedElement.style.backgroundColor = '#ffffff';
        
        // Remove dark mode class from html
        clonedDoc.documentElement.classList.remove('dark');
        
        // Remove dark mode classes from all elements
        clonedElement.querySelectorAll('*').forEach((child) => {
          if (child instanceof HTMLElement) {
            child.className = child.className.replace(/dark:[^\s]+/g, '');
          }
        });
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
  } finally {
    restoreConsole();
  }
};

export const exportAsPDF = async (elementId: string): Promise<void> => {
  const restoreConsole = suppressColorWarnings();
  
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
      restoreConsole();
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
      ignoreElements: (el) => {
        return el.tagName === 'SCRIPT' || el.tagName === 'STYLE';
      },
      onclone: (clonedDoc, clonedElement) => {
        clonedElement.style.backgroundColor = '#ffffff';
        clonedDoc.documentElement.classList.remove('dark');
        
        clonedElement.querySelectorAll('*').forEach((child) => {
          if (child instanceof HTMLElement) {
            child.className = child.className.replace(/dark:[^\s]+/g, '');
          }
        });
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
  } finally {
    restoreConsole();
  }
};
