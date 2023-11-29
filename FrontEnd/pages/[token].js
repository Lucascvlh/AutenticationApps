import { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import axios from 'axios';
import { FaTrash, FaEye, FaSyncAlt, FaEyeSlash } from 'react-icons/fa';
import { ImExit } from "react-icons/im";
import '../styles/geradorchave.css';
import { useRouter } from 'next/router';

export default function GeradorChave() {
    const [sistemas, setSistemas] = useState([]);
    const [novoSistema, setNovoSistema] = useState('');
    const [validToken, setValidToken] = useState(false);
    const { token } = useRouter().query;

    const fetchSistemas = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/sistemas`);
            setSistemas(response.data);
        } catch (error) {
            alert('Erro:', error);
        }
    };

    useEffect(() => {
        if (token) {
            const storedToken = localStorage.getItem('token');
            if (token === storedToken) {
                setValidToken(true);
                fetchSistemas();
            } else {
                setValidToken(false);
                alert('Token inválido!');
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
        const response = await axios.put(`http://localhost:5000/atualizar-chave/${id}`);
        const novaChave = response.data;
        // Atualizar o estado com a nova chave
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
            const response = await axios.post('http://localhost:5000/cadastro-sistema', { name: novoSistema });
            setNovoSistema(''); // Limpa o campo depois de adicionar o sistema
            fetchSistemas(); // Atualiza a lista de sistemas após adicionar o novo sistema
            alert(response.data.mensagem)
        } catch (error) {
            alert('Erro:', error);
        }
    };

    const deletar_chave = async(id) =>{
        try{
            const response = await axios.delete(`http://localhost:5000/deletar-sistema/${id}`);
            alert(response.data.mensagem); // Mensagem de sucesso ou erro
            // Atualizar a lista de sistemas após a exclusão, se necessário
            fetchSistemas();
        } catch(error){
            alert('Error', error)
        }
    }

    const voltarParaHome = () => {
        window.location.href = '/'; // Redirecionamento para a raiz do seu site
    };

    return (
        <div >
            <header className='header'>
                <Analytics />
                <h1 className='title'>Controle de chaves</h1>
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet"></link>
                <button onClick={voltarParaHome}>
                        <ImExit size={25} />
                </button>
            </header>
            <div>
                <input
                    className='input-sistema'
                    type="text"
                    value={novoSistema}
                    onChange={(e) => setNovoSistema(e.target.value)}
                    placeholder="Nome do novo sistema"
                />
                <button className='add-button' onClick={handleNovoSistema}>Adicionar</button>
            </div>
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
                            <td>{sistema.showKey ? sistema.key : '*'.repeat(62)}</td>
                            <td>
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
            <footer>
                <p>Sistema desenvolvido por Lucas Carvalho</p>
            </footer>
        </div>
    );
}
