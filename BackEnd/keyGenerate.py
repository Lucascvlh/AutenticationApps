from flask import Flask, request, jsonify
from flask_cors import CORS
from api.connectMongo import client
import secrets
import hashlib
import uuid

app = Flask(__name__)
CORS(app)
sistemas = []

db = client['backend']
collection = db['magalu']

@app.route('/sistemas', methods=['GET'])
def get_sistemas():
    sistemas = list(collection.find({}))  # Obtém todos os sistemas da coleção 'magalu'

    # Transforma o _id do MongoDB para id para o front-end
    for sistema in sistemas:
        sistema['id'] = str(sistema['_id'])
        del sistema['_id']
    
    return jsonify(sistemas)

@app.route('/cadastro-sistema', methods=['POST'])
def cadastro_sistema():
    dados = request.json
    nome_recebido = dados['nome']

    sistema_existente = collection.find_one({'nome': nome_recebido})
    
    if sistema_existente:
        # Sistema já existe, atualize os dados se necessário
        # Supondo que você queira atualizar a chave e mostrar_chave
        collection.update_one(
            {'nome': nome_recebido},
            {'$set': {'chave': gerar_chave(), 'mostrar_chave': False}}
        )
        return jsonify({'mensagem': 'Sistema atualizado com sucesso.'})
    
    # Se o sistema não existir, crie um novo
    novo_id = str(uuid.uuid4())
    novo_sistema = {
        '_id': novo_id,
        'nome': nome_recebido,
        'chave': gerar_chave(),
        'mostrar_chave': False
    }
    collection.insert_one(novo_sistema)

    return jsonify({'mensagem': 'Sistema cadastrado com sucesso.'})

@app.route('/atualizar-chave/<string:sistema_id>', methods=['PUT'])
def atualizar_chave(sistema_id):
    chave_aleatoria = secrets.token_urlsafe(32)
    chave_gerada = hashlib.sha256(chave_aleatoria.encode()).hexdigest()

    # Atualiza o sistema com o ID fornecido
    result = collection.update_one(
        {'_id': sistema_id},
        {'$set': {'chave': chave_gerada}}
    )
    
    if result.modified_count > 0:
        return chave_gerada  # Retorna a nova chave gerada se o documento foi atualizado
    else:
        return None  # Retorna None se o documento com o ID fornecido não foi encontrado
        
@app.route('/verificar-chave/<string:nome>/<chave>', methods=['POST'])
def verificar_chave(nome, chave):
    chave_recebida = chave

    sistema = collection.find_one({'nome': nome, 'chave': chave_recebida})
    
    if sistema:
        return jsonify({'mensagem': 'Validado'}), 200
    else:
        return jsonify({'mensagem': 'Chave inválida ou sistema não encontrado'}), 403
    
@app.route('/gerar-chave', methods=['POST'])
def gerar_chave():
    total_documentos = collection.count_documents({})
    
    if total_documentos >= 0:
        chave_aleatoria = secrets.token_urlsafe(32)
        chave_gerada = hashlib.sha256(f"{total_documentos}-{chave_aleatoria}".encode()).hexdigest()
        return chave_gerada

    return None
    
@app.route('/deletar-sistema/<string:id>', methods=['DELETE'])
def deletar_sistema(id):
    db = client['backend']
    collection = db['magalu']

    sistema = collection.find_one({'_id': id})
    
    if sistema:
        nome = sistema.get('nome', 'Nome não encontrado')  # Obtém o nome do sistema
        result = collection.delete_one({'_id': id})
        if result.deleted_count > 0:
            return jsonify({'mensagem': f'Sistema {nome} deletado com sucesso.'}), 200
        else:
            return jsonify({'mensagem': f'Sistema {nome} não encontrado.'}), 404
    else:
        return jsonify({'mensagem': f'Sistema com ID {id} não encontrado.'}), 404


if __name__ == '__main__':
    app.run(host='0.0.0.0')
