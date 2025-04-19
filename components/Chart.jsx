"use client"

import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"
import anime from "animejs"
import "../styles/Chart.css"

const ChartComponent = ({ type, data, options = {}, height = 300, className = "" }) => {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  useEffect(() => {
    if (chartRef.current) {
      // Destroy previous chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }

      // Create new chart
      const ctx = chartRef.current.getContext("2d")

      // Default options based on chart type
      const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
        animation: {
          duration: 1000,
          easing: "easeOutQuad",
          onComplete: () => {
            // Animate the chart container
            anime({
              targets: chartRef.current.parentNode,
              scale: [0.98, 1],
              opacity: [0.8, 1],
              duration: 300,
              easing: "easeOutQuad",
            })
          },
        },
      }

      // Create chart
      chartInstance.current = new Chart(ctx, {
        type,
        data,
        options: { ...defaultOptions, ...options },
      })
    }

    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [type, data, options])

  return (
    <div className={`chart-container ${className}`} style={{ height }}>
      <canvas ref={chartRef}></canvas>
    </div>
  )
}

export default ChartComponent
