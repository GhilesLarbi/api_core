import { useEffect, useState, type RefObject } from 'react'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function useScrollEdges<T extends HTMLElement>(
  ref: RefObject<T | null>
) {
  const [edges, setEdges] = useState({ top: false, bottom: false })

  useEffect(() => {
    const node = ref.current
    if (!node) return

    function measure() {
      if (!node) return
      const { scrollTop, scrollHeight, clientHeight } = node
      setEdges({
        top: scrollTop > 1,
        bottom: scrollTop + clientHeight < scrollHeight - 1,
      })
    }

    measure()
    node.addEventListener('scroll', measure, { passive: true })

    const resize = new ResizeObserver(measure)
    resize.observe(node)
    const mutation = new MutationObserver(measure)
    mutation.observe(node, { childList: true, subtree: true })

    return () => {
      node.removeEventListener('scroll', measure)
      resize.disconnect()
      mutation.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return edges
}
