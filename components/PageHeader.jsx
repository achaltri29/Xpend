"use client"

import { useRef, useEffect } from "react"
import { useAnimation } from "../contexts/AnimationContext"
import "../styles/PageHeader.css"

const PageHeader = ({ title, children }) => {
  const headerRef = useRef(null)
  const titleRef = useRef(null)
  const actionsRef = useRef(null)
  const { registerAnimation } = useAnimation()

  useEffect(() => {
    registerAnimation("pageHeader", headerRef.current, {
      translateY: [-20, 0],
      opacity: [0, 1],
      duration: 600,
      easing: "easeOutQuad",
    })

    registerAnimation("pageTitle", titleRef.current, {
      translateX: [-20, 0],
      opacity: [0, 1],
      duration: 600,
      delay: 200,
      easing: "easeOutQuad",
    })

    registerAnimation("pageActions", actionsRef.current, {
      translateX: [20, 0],
      opacity: [0, 1],
      duration: 600,
      delay: 300,
      easing: "easeOutQuad",
    })
  }, [registerAnimation])

  return (
    <div className="page-header" ref={headerRef} data-animation-id="pageHeader">
      <h1 className="page-title" ref={titleRef} data-animation-id="pageTitle">
        {title}
      </h1>
      <div className="page-actions" ref={actionsRef} data-animation-id="pageActions">
        {children}
      </div>
    </div>
  )
}

export default PageHeader
