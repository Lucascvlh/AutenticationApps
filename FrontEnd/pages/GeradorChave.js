import { useState, useEffect } from 'react';
import axios from 'axios';

export default function GeradorChave() {
    const [sistemas, setSistemas] = useState([]);
    const [novoSistema, setNovoSistema] = useState('');

    const fetchSistemas = async () => {
        try {
            const response = await axios.get('http://localhost:5000/sistemas');
            setSistemas(response.data);
        } catch (error) {
            alert('Erro:', error);
        }
    };

    useEffect(() => {
        fetchSistemas();
    }, []);

    const toggleChave = (sistema) => {
        const novaLista = sistemas.map((s) =>
            s.id === sistema.id ? { ...s, mostrarChave: !s.mostrarChave } : s
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
                    return { ...sistema, chave: novaChave };
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
            const response = await axios.post('http://localhost:5000/cadastro-sistema', { nome: novoSistema });
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
            console.log(id)
            alert(response.data.mensagem); // Mensagem de sucesso ou erro
            // Atualizar a lista de sistemas após a exclusão, se necessário
            fetchSistemas();
        } catch(error){
            alert('Error', error)
        }
    }

    return (
        <div>
            <h1>Gerador de Chave Hash</h1>
            <div>
                <input
                    type="text"
                    value={novoSistema}
                    onChange={(e) => setNovoSistema(e.target.value)}
                    placeholder="Nome do novo sistema"
                />
                <button onClick={handleNovoSistema}>Adicionar</button>
            </div>
            <table border="1">
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
                            <td>{sistema.nome}</td>
                            <td>{sistema.mostrarChave ? sistema.chave : '*'.repeat(62)}</td>
                            <td>
                                <button onClick={() => atualizar_chave(sistema.id)}>Atualizar Chave</button>
                                <button onClick={() => toggleChave(sistema)}>
                                    {sistema.mostrarChave ? 'Ocultar' : 'Ver'}
                                </button>
                                <button onClick={() => deletar_chave(sistema.id)}>Deletar Chave</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
