import kyaukseMemory from '../assets/kyaukse-memory.png'
import mandalayMemory from '../assets/mandalay-memory.png'
import pyinOoLwinMemory from '../assets/pyin-oo-lwin-memory.png'
import sagaingMemory from '../assets/sagaing-memory.png'

export const albumAssets: Record<string, { image: string; color: string }> = {
  mandalay: { image: mandalayMemory, color: '#b3483e' },
  mdy: { image: mandalayMemory, color: '#b3483e' },
  sagaing: { image: sagaingMemory, color: '#244f67' },
  'kyouk se': { image: kyaukseMemory, color: '#8a4c34' },
  kyaukse: { image: kyaukseMemory, color: '#8a4c34' },
  'pyin oo lwin': { image: pyinOoLwinMemory, color: '#2f7d59' },
}

export const fallbackAlbumAsset = { image: mandalayMemory, color: '#1f4b45' }
