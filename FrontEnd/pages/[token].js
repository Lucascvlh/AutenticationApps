import { useState, useEffect } from 'react';
import { FaTrash, FaEye, FaSyncAlt, FaEyeSlash } from 'react-icons/fa';
import { FaRegPaste } from "react-icons/fa6";
import { AiOutlineEdit } from "react-icons/ai";
import { GiCancel } from "react-icons/gi";
import { ImExit } from "react-icons/im";
import { MdSaveAlt } from "react-icons/md";
import { useRouter } from 'next/router';
import axios from 'axios';
import '../styles/geradorchave.css';

export default function GeradorChave() {
    const [sistemas, setSistemas] = useState([]);
    const [novoUser, setNovoUser] = useState([]);
    const [novoSistema, setNovoSistema] = useState('');
    const [validToken, setValidToken] = useState(false);
    const { token } = useRouter().query;

    const fetchSistemas = async () => {
        try {
            const response = await axios.get(`https://18.221.207.251:5000/sistemas`);
            setSistemas(response.data);
        } catch (error) {
            alert('Erro:', error);
        }
    };

    const fetchUser = async () => {
        try{
            const response = await axios.get('https://18.221.207.251:5000/listUser')
            setNovoUser(response.data)
        }catch(error){
            console.log(error)
        }
    }

    useEffect(() => {
        if (token) {
            const storedToken = localStorage.getItem('token');
            if (token === storedToken) {
                setValidToken(true);
                fetchSistemas();
                fetchUser();
            } else {
                setValidToken(false);
            }
        }
    }, [token]);

    if (!validToken) {
        return <div>Token inválido ou ausente!</div>;
    }

    const toggleChave = (sistema) => {
        const novaLista = sistemas.map((s) =>
            s.id === sistema.id ? { ...s, showKey: !s.showKey } : s
        );
        setSistemas(novaLista);
    };

    const atualizar_chave = async (id) => {
    try {
        const response = await axios.put(`https://18.221.207.251:5000/atualizar-chave/${id}`);
        const novaChave = response.data;
        setSistemas(prevSistemas => {
            return prevSistemas.map(sistema => {
                if (sistema.id === id) {
                    return { ...sistema, key: novaChave };
                }
                return sistema;
            });
        });
        } catch (error) {
            alert('Erro ao gerar a chave:', error);
            }
    };

    const handleNovoSistema = async () => {
        try {
            const response = await axios.post('https://18.221.207.251:5000/cadastro-sistema', { name: novoSistema });
            setNovoSistema(''); 
            fetchSistemas(); 
            alert(response.data.mensagem)
        } catch (error) {
            alert('Erro:', error);
        }
    };

    const deletar_chave = async(id) =>{
        const name = sistemas.find((s) =>
            s.id === id
        );
        const nomeSistema = prompt(`Digite "${name.name}" do sistema para confirmar a exclusão:`);
        if (nomeSistema === name.name){
            try{
                const response = await axios.delete(`https://18.221.207.251:5000/deletar-sistema/${id}`);
                alert(response.data.mensagem);
                fetchSistemas();
            } catch(error){
                alert('Error', error)
            }
        }
        else{
            alert('Operação de exclusão cancelada.');
        }
    }

    function copyText(text) {
        navigator.clipboard.writeText(text)
            .then(() => {
            alert(`Chave copiada com sucesso.`);
            })
            .catch((err) => {
            console.error('Erro ao copiar:', err);
            alert('Houve um erro ao copiar a chave.');
            });
        }

    const create_user = async () => {
        const user = document.getElementById('user').value;
        const password = document.getElementById('password').value;
        try{
            const response = await axios.post('https://18.221.207.251:5000/registerUser', {
                user,
                password
            });
            fetchUser()
            alert(response.data.mensagem)
        }catch(error){
            console.log(error)
        }
    }

    const editUser = (userId) => {
        const updatedUsers = novoUser.map(user => {
        if (user.id === userId) {
            return { ...user, isEditing: true }; // Define o modo de edição para o usuário específico
        }
        return user;
        });
        setNovoUser(updatedUsers);
    }

    const saveUser = async (userId) => {
        const userToSave = novoUser.find(user => user.id === userId);
        try {
            // Chama a rota de atualização do usuário no backend
            const response = await axios.put(`https://18.221.207.251:5000/updateUser/${userId}`, {
                user: userToSave.user,
                password: userToSave.password
            });
            alert(response.data.message)

            // Remove o modo de edição do usuário e atualiza os dados localmente
            const updatedUsers = novoUser.map(user => {
                if (user.id === userId) {
                return { ...user, isEditing: false };
                }
                return user;
            });
            setNovoUser(updatedUsers);
            fetchUser()
        } catch (error) {
            if (error.response && error.response.status === 400) {
                alert('O nome de usuário já existe. Escolha outro.');
            } else {
                // Exibe um alerta com o erro padrão caso contrário
                console.error(error);
                alert('Ocorreu um erro ao salvar o usuário.');
            }
        }
    };

    const handleInputChange = (userId, field, value) => {
        const updatedUsers = novoUser.map(user => {
        if (user.id === userId) {
            return { ...user, [field]: value };
        }
        return user;
        });
        setNovoUser(updatedUsers);
    };

    const cancelEdit = (userId) => {
        novoUser.map(user => {
        if (user.id === userId) {
            fetchUser()
            }
        });

        
    };

    const deleteUser = async (userId) => {
        try {
            const response = await axios.delete(`https://18.221.207.251:5000/deleteUser/${userId}`);
            alert(response.data.mensagem);
            fetchUser()
            // Aqui você pode adicionar lógica para atualizar a interface após a exclusão
        } catch (error) {
            console.error(error);
            alert('Ocorreu um erro ao excluir o usuário.');
        }
    };

    const voltarParaHome = () => {
        window.location.href = '/';
    };

    return (
        <div className='content'>
            <header className='header'>
                <h1 className='title'>Controle de chaves</h1>
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet"></link>
                <button onClick={voltarParaHome}>
                        <ImExit size={25} />
                </button>
            </header>
            <input
                className='input-sistema'
                type="text"
                value={novoSistema}
                onChange={(e) => setNovoSistema(e.target.value)}
                placeholder="Nome do novo sistema"
            />
            <button className='add-button' onClick={handleNovoSistema}>Adicionar</button>
            <table border="1" className='table'>
                <thead>
                    <tr>
                        <th>SISTEMA</th>
                        <th>CHAVE</th>
                        <th>AÇÕES</th>
                    </tr>
                </thead>
                <tbody>
                    {sistemas.map((sistema) => (
                        <tr key={sistema.id}>
                            <td>{sistema.name}</td>
                            <td>{sistema.showKey ? sistema.key :'*'.repeat(92)}</td>
                            <td>
                                <button className='paste-button' onClick={() => copyText(sistema.key)}><FaRegPaste /></button>
                                <button className='update-button' onClick={() => atualizar_chave(sistema.id)}><FaSyncAlt /></button>
                                <button className='toggle-button' onClick={() => toggleChave(sistema)}>
                                    {sistema.showKey ? <FaEyeSlash/> : <FaEye />}
                                </button>
                                <button className='delete-button' onClick={() => deletar_chave(sistema.id)}><FaTrash /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className='container'>
                <div className='createUser'>
                    <h2>Cadastrar usuário</h2>
                    <div>
                        <label htmlFor='username'>Usuário : </label>
                        <input 
                            className='input-sistema'
                            type="text" 
                            name="user" 
                            id="user" 
                            placeholder='Nome de usuário'/>
                        <label htmlFor='password'>Senha : </label>
                        <input 
                            className='input-sistema'
                            type="password" 
                            name="password" 
                            id="password" 
                            placeholder='Senha do usuário'/>
                    </div>
                    <button className='create-user' onClick={() => create_user()}>Criar</button>
                </div>
                <div className="user-list-section">
                    <h2>Usuários Cadastrados</h2>
                    <table border="1" className='table' id='tableUser'>
                        <thead>
                            <tr>
                                <th>NOME</th>
                                <th>SENHA</th>
                                <th>AÇÕES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {novoUser.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        {user.isEditing ? (
                                        <input
                                            type="text"
                                            value={user.user}
                                            onChange={(e) => handleInputChange(user.id, 'user', e.target.value)} // Atualiza o valor localmente enquanto digita
                                        />
                                        ) : (
                                        <span className="user-name">{user.user}</span>
                                        )}
                                    </td>
                                    <td>
                                        {user.isEditing ? (
                                        <input
                                            type="text"
                                            value={user.password}
                                            onChange={(e) => handleInputChange(user.id, 'password', e.target.value)} // Atualiza o valor localmente enquanto digita
                                        />
                                        ) : (
                                        <span className="user-password" >{user.password.replace(/./g, '*')}</span>
                                        )}
                                    </td>
                                    <td>
                                        {user.isEditing ? (
                                        <div>
                                            <button className="save-btn" onClick={() => saveUser(user.id, user)}>
                                            <MdSaveAlt />
                                            </button>
                                            <button className='delete-button' onClick={() => cancelEdit(user.id)}>
                                               <GiCancel /> 
                                            </button>
                                        </div>
                                        ) : (
                                        <div>
                                            <button className="edit-btn" onClick={() => editUser(user.id)}>
                                            <AiOutlineEdit />
                                            </button>
                                            <button className="delete-button" onClick={() => deleteUser(user.id)}>
                                            <FaTrash />
                                            </button>
                                        </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                    </table>
                </div>
            </div>
            
            <footer>
                <p>Sistema desenvolvido por Lucas Carvalho</p>
            </footer>
        </div>
    );
}
