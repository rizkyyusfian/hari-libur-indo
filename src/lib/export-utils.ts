// This module provides utilities for exporting calendar
// Using html-to-image instead of html2canvas (better support for modern CSS like lab() colors)

import * as htmlToImage from 'html-to-image';

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
    
    const dataUrl = await htmlToImage.toPng(element, {
      quality: 1,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      style: {
        // Ensure light mode styling
        colorScheme: 'light',
      },
      filter: (node) => {
        // Filter out script and style tags
        if (node instanceof Element) {
          const tagName = node.tagName?.toLowerCase();
          return tagName !== 'script' && tagName !== 'noscript';
        }
        return true;
      },
    });

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

    const dataUrl = await htmlToImage.toPng(element, {
      quality: 1,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      style: {
        colorScheme: 'light',
      },
      filter: (node) => {
        if (node instanceof Element) {
          const tagName = node.tagName?.toLowerCase();
          return tagName !== 'script' && tagName !== 'noscript';
        }
        return true;
      },
    });

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
