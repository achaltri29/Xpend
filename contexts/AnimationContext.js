"use client"

import { createContext, useContext, useRef, useEffect } from "react"
import anime from "animejs"

const AnimationContext = createContext()

export const useAnimation = () => useContext(AnimationContext)

export const AnimationProvider = ({ children }) => {
  const animationRefs = useRef({})

  // Register an element for animation
  const registerAnimation = (id, element, options = {}) => {
    if (!element) return

    animationRefs.current[id] = {
      element,
      options,
    }
  }

  // Play an animation
  const playAnimation = (id, customOptions = {}) => {
    const animation = animationRefs.current[id]

    if (!animation) return

    const { element, options } = animation

    return anime({
      targets: element,
      ...options,
      ...customOptions,
    })
  }

  // Animate entrance of elements when they come into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target
            const animationId = element.dataset.animationId

            if (animationId && animationRefs.current[animationId]) {
              playAnimation(animationId)
            }
          }
        })
      },
      { threshold: 0.1 },
    )

    // Observe all elements with data-animation-id attribute
    document.querySelectorAll("[data-animation-id]").forEach((element) => {
      observer.observe(element)
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  return <AnimationContext.Provider value={{ registerAnimation, playAnimation }}>{children}</AnimationContext.Provider>
}
