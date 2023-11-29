"use client"
import { useState } from 'react';
import styles from '../styles/page.module.css'
import { CiLogin } from "react-icons/ci";
import axios from 'axios';

export default function Home() {
  const [user, setUser] = useState(''); // Estado para o campo de login
  const [password, setPassword] = useState(''); // Estado para o campo de senha

  const handleUserChange = (e) => {
    setUser(e.target.value); // Atualiza o estado com o valor do campo de login
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value); // Atualiza o estado com o valor do campo de senha
  };

  const handleLoginSubmit = async (event) => {
      event.preventDefault();
      const form = document.getElementById('loginForm'); // substitua 'seuFormulario' pelo ID do seu formulário
      const formData = new FormData(form);
      const user = formData.get('user');
      const password = formData.get('password');
      console.log(user)
      console.log(password)
    try{
      const response = await axios.post('http://18.221.207.251:5000/autentication', {
        user,
        password,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          "Access-Control-Allow-Headers": "Origin, X-Request-Width, Content-Type, Accept"
        },
      });
        if (response.status === 200) {
          const data = await response.data
          const { token } = data
          if (token){
            localStorage.setItem('token', token)
            window.location.href =`/${token}`
          }
          else{
            alert('Token inválido!')
          }
        } else {
          alert('Usuário ou senha inválida!')
        }
      } catch(e){
        alert(e)
      }
    // Use 'login' e 'password' conforme necessário, por exemplo:
    
  }
  return (
    <main className={styles.main}>
      <div className={styles.loginContainer}>
        <form className={styles.loginForm} id='loginForm' onSubmit={handleLoginSubmit}>
          <p>Usuário:</p>
          <input
            type="text"
            name="user"
            value={user}
            onChange={handleUserChange}
          />
          <p>Senha:</p>
          <input
            type="password"
            name="password"
            value={password}
            onChange={handlePasswordChange}
          />
          <button type='submit'><CiLogin/></button>
        </form>
      </div>
      <div className={styles.grid}>
      </div>
    </main>
  )
}
