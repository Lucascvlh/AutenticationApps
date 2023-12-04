# Use a imagem base do Python
FROM python:3.9

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos necessários para o contêiner
COPY requirements.txt /app/
COPY src /app/src/

# Instala as dependências do Python
RUN pip install --no-cache-dir -r requirements.txt

# Define o comando para iniciar sua aplicação
CMD ["python", ".keyGenerate.py"]

