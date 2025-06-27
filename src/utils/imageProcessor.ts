const isRowMostlyWhite = (ctx: CanvasRenderingContext2D, y: number, width: number, threshold = 250, ratio = 0.95): boolean => {
  const data = ctx.getImageData(0, y, width, 1).data;
  let whitePixels = 0;
  for (let x = 0; x < width; x++) {
    const i = x * 4;
    if (data[i] >= threshold && data[i + 1] >= threshold && data[i + 2] >= threshold) {
      whitePixels++;
    }
  }
  return whitePixels / width > ratio;
};

const detectBottomWhiteMargin = (ctx: CanvasRenderingContext2D, width: number, height: number): number => {
  let margin = 0;
  while (margin < height && isRowMostlyWhite(ctx, height - 1 - margin, width)) {
    margin++;
  }
  return margin;
};

const detectTopWhiteMargin = (ctx: CanvasRenderingContext2D, width: number, height: number): number => {
  let margin = 0;
  while (margin < height && isRowMostlyWhite(ctx, margin, width)) {
    margin++;
  }
  return margin;
};

export const processComicImage = (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        if (!tempCtx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        tempCtx.drawImage(img, 0, 0);

        const bottomMargin = detectBottomWhiteMargin(tempCtx, img.width, img.height);
        const topCrop = detectTopWhiteMargin(tempCtx, img.width, img.height - bottomMargin);

        // Calculate panel dimensions using the remaining drawable area
        const drawableHeight = img.height - topCrop - bottomMargin;
        const panelWidth = img.width / 2;
        const panelHeight = drawableHeight / 3;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        canvas.width = panelWidth;
        canvas.height = panelHeight;

        const panels: string[] = [];

        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 2; col++) {
            ctx.clearRect(0, 0, panelWidth, panelHeight);
            ctx.drawImage(
              img,
              col * panelWidth,
              topCrop + row * panelHeight,
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