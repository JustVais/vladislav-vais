const CLOUD = 'duoo4ajch'
const BASE = `https://res.cloudinary.com/${CLOUD}/image/upload`

// Миниатюра для сетки — маленькая, низкое качество, быстрая загрузка
export function cloudinaryGrid(publicId: string) {
  return `${BASE}/w_600,h_600,c_fill,q_60,f_auto/${publicId}`
}

// Превью для лайтбокса — нативное соотношение сторон, низкое качество, быстрая загрузка
export function cloudinaryPreview(publicId: string) {
  return `${BASE}/w_900,q_20,f_auto/${publicId}`
}

// Полный экран — высокое качество, c_limit не обрезает, просто ограничивает максимум
// 3000px покрывает MacBook Retina (2880px) и iPhone с DPR 3 (~1060px физических)
export function cloudinaryFull(publicId: string) {
  return `${BASE}/c_limit,w_3000,q_90,f_auto/${publicId}`
}
