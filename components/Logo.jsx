import "../styles/Logo.css"

const Logo = ({ size = "medium" }) => {
  return (
    <div className={`logo logo-${size}`}>
      <span className="logo-x">X</span>
      <span className="logo-pend">pend</span>
    </div>
  )
}

export default Logo
