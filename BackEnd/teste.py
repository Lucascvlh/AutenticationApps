from dotenv import load_dotenv
import os
from api.autentication import verificar_chave_remota

load_dotenv()

# Exemplo de uso
sistema = 'Download Sistema'
chave_para_verificar = os.getenv('KEYMASTER')
resultado = verificar_chave_remota(chave_para_verificar, sistema)
print(resultado)
