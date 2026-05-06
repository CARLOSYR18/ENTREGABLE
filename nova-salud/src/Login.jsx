import { useState } from 'react'

export default function Login({ onLogin }) {
  const [selectedRole, setSelectedRole] = useState('usuario')

  const handleLogin = (e) => {
    e.preventDefault()

    const form = new FormData(e.target)
    const email = form.get('email')
    const password = form.get('password')

    if (!email || !password) {
      alert('Completa todos los campos')
      return
    }

    onLogin({ email, role: selectedRole })
  }

  return (
    <>
      <style>{styles}</style>

      <div className="login-page">
        <div className="login-left">
          <div className="circle circle-one"></div>
          <div className="circle circle-two"></div>

          <div className="login-content">
            <h1>Bienvenido</h1>
            <p>Ingresa para continuar en Nova Salud</p>

            <div className="roles">
              <button
                type="button"
                className={selectedRole === 'usuario' ? 'active' : ''}
                onClick={() => setSelectedRole('usuario')}
              >
                Usuario
              </button>

              <button
                type="button"
                className={selectedRole === 'vendedor' ? 'active' : ''}
                onClick={() => setSelectedRole('vendedor')}
              >
                Vendedor
              </button>
            </div>

            <form onSubmit={handleLogin}>
              <input type="email" name="email" placeholder="Correo" />
              <input type="password" name="password" placeholder="Contraseña" />

              <button className="login-btn" type="submit">
                Login
              </button>
            </form>

            <span className="forgot">¿Olvidaste tu contraseña?</span>
          </div>
        </div>

        <div className="login-right">
          <div className="right-circle"></div>

          <div className="right-content">
            <h2>¿Nuevo aquí?</h2>
            <p>
              Crea una cuenta para acceder a tus productos, ventas o información.
            </p>

            <button className="signup-btn">Sign Up</button>
          </div>
        </div>
      </div>
    </>
  )
}

const styles = `
* {
  box-sizing: border-box;
  font-family: Arial, Helvetica, sans-serif;
}

html, body, #root {
  margin: 0;
  width: 100%;
  height: 100%;
}

/* PANTALLA COMPLETA */
.login-page {
  width: 100vw;
  height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1.15fr;
  overflow: hidden;
  background: white;
}

/* LADO AZUL */
.login-left {
  position: relative;
  background: linear-gradient(135deg, #4f8ee8, #235ebd);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.login-left::after {
  content: "";
  position: absolute;
  right: -150px;
  top: -5%;
  width: 340px;
  height: 110%;
  background: white;
  border-radius: 50%;
  z-index: 1;
}

.login-content {
  width: 100%;
  max-width: 520px;
  color: white;
  text-align: center;
  position: relative;
  z-index: 3;
  padding: 30px;
}

.login-content h1 {
  font-size: 54px;
  margin: 0 0 18px;
}

.login-content p {
  font-size: 22px;
  margin-bottom: 42px;
}

.roles {
  display: flex;
  gap: 8px;
  background: rgba(255,255,255,0.25);
  padding: 8px;
  border-radius: 18px;
  margin-bottom: 28px;
}

.roles button {
  flex: 1;
  border: none;
  padding: 18px;
  border-radius: 15px;
  background: transparent;
  color: white;
  font-size: 21px;
  font-weight: bold;
  cursor: pointer;
}

.roles .active {
  background: white;
  color: #235ebd;
}

form {
  display: flex;
  flex-direction: column;
  gap: 26px;
}

input {
  width: 100%;
  border: none;
  border-radius: 18px;
  padding: 25px 28px;
  font-size: 24px;
  outline: none;
}

.login-btn {
  border: none;
  border-radius: 18px;
  padding: 25px;
  background: #ff9026;
  color: white;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
}

.login-btn:hover {
  background: #f97316;
}

.forgot {
  display: block;
  margin-top: 28px;
  font-size: 18px;
  font-weight: bold;
}

/* LADO BLANCO */
.login-right {
  position: relative;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.right-content {
  text-align: center;
  max-width: 520px;
  padding: 30px;
}

.right-content h2 {
  font-size: 44px;
  margin: 0 0 28px;
  color: #111;
}

.right-content p {
  font-size: 25px;
  line-height: 1.5;
  color: #333;
  margin-bottom: 45px;
}

.signup-btn {
  width: 360px;
  padding: 24px;
  border: none;
  border-radius: 16px;
  background: #2f65c7;
  color: white;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
}

.signup-btn:hover {
  background: #2555aa;
}

/* CÍRCULOS */
.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255,255,255,0.12);
}

.circle-one {
  width: 470px;
  height: 470px;
  left: -160px;
  bottom: -170px;
}

.circle-two {
  width: 320px;
  height: 320px;
  right: -40px;
  top: -95px;
}

.right-circle {
  position: absolute;
  width: 360px;
  height: 360px;
  right: -100px;
  bottom: -120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #5397e9, #2566c8);
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .login-page {
    grid-template-columns: 1fr;
  }

  .login-left::after {
    display: none;
  }

  .login-right {
    display: none;
  }

  .login-content h1 {
    font-size: 38px;
  }

  .login-content p {
    font-size: 16px;
  }

  input,
  .login-btn,
  .roles button {
    font-size: 16px;
    padding: 15px;
  }
}
`