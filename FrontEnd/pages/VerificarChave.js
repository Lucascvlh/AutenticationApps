import Head from 'next/head';
import { useState } from 'react';

export default function VerificarChave() {
    const [mensagem, setMensagem] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);
        const chave = formData.get('chave');

        try {
            const response = await fetch('http://localhost:5000/verificar-chave', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ chave }),
            });

            if (response.status === 200) {
                setMensagem('Chave válida. Programa executado.');
            } else {
                setMensagem('Chave inválida. Entre em contato com o administrador.');
            }
        } catch (error) {
            console.error('Erro:', error);
        }
    };

    return (
        <div>
            <Head>
                <title>Verificação de Chave</title>
            </Head>
            <h1>Verificação de Chave</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="chaveInput">Chave:</label>
                <input type="text" id="chaveInput" name="chave" required />
                <button type="submit">Verificar Chave</button>
            </form>
            <div>{mensagem}</div>
        </div>
    );
}
