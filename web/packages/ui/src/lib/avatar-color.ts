import { type CSSProperties } from 'react'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function avatarTint(seed: string): CSSProperties {
  let hash = 0
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) | 0
  }
  const hue = (Math.abs(hash) % 12) * 30
  return { '--avatar-hue': hue } as CSSProperties
}
