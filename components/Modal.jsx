"use client"

import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { FaTimes } from "react-icons/fa"
import anime from "animejs"
import "../styles/Modal.css"

const Modal = ({ isOpen, onClose, title, children, size = "medium", showCloseButton = true }) => {
  const modalRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"

      // Animate modal opening
      anime({
        targets: modalRef.current,
        opacity: [0, 1],
        duration: 300,
        easing: "easeOutQuad",
      })

      anime({
        targets: contentRef.current,
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 400,
        easing: "easeOutQuad",
      })
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  const handleClose = () => {
    // Animate modal closing
    anime({
      targets: contentRef.current,
      translateY: [0, 20],
      opacity: [1, 0],
      duration: 300,
      easing: "easeInQuad",
    })

    anime({
      targets: modalRef.current,
      opacity: [1, 0],
      duration: 300,
      easing: "easeInQuad",
      complete: onClose,
    })
  }

  const handleBackdropClick = (e) => {
    if (e.target === modalRef.current) {
      handleClose()
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div className="modal-backdrop" ref={modalRef} onClick={handleBackdropClick}>
      <div className={`modal-content modal-${size}`} ref={contentRef}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          {showCloseButton && (
            <button className="modal-close" onClick={handleClose}>
              <FaTimes />
            </button>
          )}
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body,
  )
}

export default Modal
