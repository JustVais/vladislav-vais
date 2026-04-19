const CLOUD = 'duoo4ajch'
const BASE = `https://res.cloudinary.com/${CLOUD}/image/upload`

// Миниатюра для сетки — маленькая, низкое качество, быстрая загрузка
export function cloudinaryGrid(publicId: string) {
  return `${BASE}/w_600,h_600,c_fill,q_60,f_auto/${publicId}`
}

// Полный экран — высокое качество
export function cloudinaryFull(publicId: string) {
  return `${BASE}/q_90,f_auto/${publicId}`
}
