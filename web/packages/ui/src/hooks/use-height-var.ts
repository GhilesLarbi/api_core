import { useLayoutEffect, useRef } from 'react'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function useHeightVar<T extends HTMLElement>(property: string) {
  const ref = useRef<T>(null)

  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return

    const publish = () => {
      const { height } = node.getBoundingClientRect()
      document.documentElement.style.setProperty(property, `${height}px`)
    }

    publish()
    const observer = new ResizeObserver(publish)
    observer.observe(node)
    return () => {
      observer.disconnect()
      document.documentElement.style.removeProperty(property)
    }
  }, [property])

  return ref
}
