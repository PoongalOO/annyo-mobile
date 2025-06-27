export const processComicImage = (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Calculate panel dimensions (2 columns, 3 rows)
        const panelWidth = img.width / 2;
        const panelHeight = img.height / 3;
        
        canvas.width = panelWidth;
        canvas.height = panelHeight;
        
        const panels: string[] = [];
        
        // Extract each panel
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 2; col++) {
            ctx.clearRect(0, 0, panelWidth, panelHeight);
            ctx.drawImage(
              img,
              col * panelWidth,
              row * panelHeight,
              panelWidth,
              panelHeight,
              0,
              0,
              panelWidth,
              panelHeight
            );
            
            panels.push(canvas.toDataURL('image/jpeg', 0.9));
          }
        }
        
        resolve(panels);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export const createCoverImage = (panels: string[]): string => {
  // Return the first panel as cover
  return panels[0] || '';
};