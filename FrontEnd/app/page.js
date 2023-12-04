"use client"
import { useState } from 'react';
import { CiLogin } from "react-icons/ci";
import styles from '../styles/page.module.css'
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
      const form = document.getElementById('loginForm');
      const formData = new FormData(form);
      const user = formData.get('user');
      const password = formData.get('password');
      const userField = document.getElementById('userField');
      const passwordField = document.getElementById('passwordField');
      userField.classList.remove(styles.errorBorder);
      passwordField.classList.remove(styles.errorBorder);
      if (user === '' || password === ''){
        alert('Preencha os dados corretamente.')
        if (user === '') {
          userField.classList.add(styles.errorBorder);
        }
        if (password === '') {
          passwordField.classList.add(styles.errorBorder);
        }
      }else{
        try{
          const response = await axios.post('https://18.221.207.251:5000/autentication', {
            user,
            password,
          }, {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
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
            }
            userField.classList.remove(styles.errorBorder);
            passwordField.classList.remove(styles.errorBorder);
          } catch{
            userField.classList.add(styles.errorBorder);
            passwordField.classList.add(styles.errorBorder);
            alert('Login ou senha inválido.')
          }        
      }
  }
  return (
    <main className={styles.main}>
      <div className={styles.loginContainer}>
        <form className={styles.loginForm} id='loginForm' onSubmit={handleLoginSubmit}>
          <p>Usuário:</p>
          <input
            id="userField"
            type="text"
            name="user"
            value={user}
            onChange={handleUserChange}
          />
          <p>Senha:</p>
          <input
            id="passwordField"
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
