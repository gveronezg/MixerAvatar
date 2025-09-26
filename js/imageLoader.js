export function loadImage(src){
  return new Promise((resolve,reject)=>{
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Erro carregando ' + src));
    img.src = src;
  });
}

/**
 * Desenha a imagem ocupando todo o canvas sem distorcer,
 * preservando proporção, com suavização de pixels.
 */
export async function drawSmoothImage(ctx, img, canvasWidth, canvasHeight) {
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'low';

  // Calcula proporção da imagem
  const imgRatio = img.width / img.height;
  const canvasRatio = canvasWidth / canvasHeight;

  let drawWidth, drawHeight, offsetX, offsetY;

  if (canvasRatio > imgRatio) {
    // Canvas mais largo que a imagem
    drawHeight = canvasHeight;
    drawWidth = drawHeight * imgRatio;
    offsetX = (canvasWidth - drawWidth) / 2;
    offsetY = 0;
  } else {
    // Canvas mais alto que a imagem
    drawWidth = canvasWidth;
    drawHeight = drawWidth / imgRatio;
    offsetX = 0;
    offsetY = (canvasHeight - drawHeight) / 2;
  }

  // Desenha a imagem suavizada, ocupando todo o canvas proporcionalmente
  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}

export function imageExists(url){
  return new Promise((resolve,reject)=>{
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => reject(false);
    img.src = url;
  });
}