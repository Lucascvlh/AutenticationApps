import requests
def verificar_chave_remota(chave, sistema):
    url = f'http://localhost:5000/verificar-chave/{sistema}/{chave}'  # Endereço do servidor Flask

    try:
        response = requests.post(url)
        if response.status_code == 200:
            return response.json()['mensagem']
        else:
            return response.json()['mensagem']
    except requests.RequestException as e:
        return f'Erro na requisição: {str(e)}'