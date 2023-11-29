from flask import Flask, request, jsonify
from flask_cors import CORS
from data.connection.connectMongo import client
import secrets
import hashlib
import uuid
import jwt
from datetime import datetime, timedelta, timezone

app = Flask(__name__)
CORS(app)

db = client['backend']
collection = db['MagaluAutentication']
collectionLogs = db['Logs']
collectionLogin = db['Users']

def countedExe(router):
    count ={
        '_id': str(uuid.uuid4()),
        'router': router,
        'date': datetime.datetime.now().strftime("%Y-%m-%d"),
        'hour': datetime.datetime.now().strftime("%H:%M:%S")
    }

    collectionLogs.insert_one(count)

@app.route('/registerUser', methods=['POST'])
def registerUser():
    data = request.json
    user = data['user']
    password = data['password']

    existUser = collectionLogin.find_one({'user': str(user).upper().strip()})
    
    if existUser:
        return jsonify({'mensagem': 'Usuário já existente!'})
    else:
        newUser = {
            '_id': str(uuid.uuid4()),
            'user': str(user).upper().strip(),
            'password': password,
            'create_at': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'update_at': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        collectionLogin.insert_one(newUser)
        return jsonify({'mensagem': 'Usuário cadastrado com sucesso.'})

@app.route('/autentication', methods=['POST'])
def autentication():
    data = request.json
    user = data['user']
    password = data['password']
    userLogon = collectionLogin.find_one({'user': str(user).upper().strip(), 'password': password})
    if userLogon:
        token = jwt.encode({'user': user, 'exp': datetime.now(timezone.utc) + timedelta(minutes=30)}, password)
        return jsonify({'token': token}), 200
    else:
        return jsonify({'mensagem': 'Usuário inválida ou senha inválida'}), 403

@app.route('/sistemas', methods=['GET'])
def get_sistemas():
    systems = list(collection.find({}))
    for system in systems:
        system['id'] = str(system['_id'])
        del system['_id']

    return jsonify(systems)

@app.route('/cadastro-sistema', methods=['POST'])
def registerSystem():
    data = request.json
    receivedName = data['name']

    existSystem = collection.find_one({'name': receivedName})
    
    if existSystem:
        return jsonify({'mensagem': 'Nome já existente!'})
    else:
        newSystem = {
            '_id': str(uuid.uuid4()),
            'name': receivedName,
            'key': generatedKey(),
            'showKey': False,
            'create_at': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'update_at': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        collection.insert_one(newSystem)
        return jsonify({'mensagem': 'Sistema cadastrado com sucesso.'})

@app.route('/atualizar-chave/<string:sistema_id>', methods=['PUT'])
def updateKey(sistema_id):
    keyRandom = secrets.token_urlsafe(32)
    generatedKey = hashlib.sha256(keyRandom.encode()).hexdigest()

    # Atualiza o sistema com o ID fornecido
    result = collection.update_one(
        {'_id': sistema_id},
        {'$set': {'key': generatedKey,
                  'update_at': datetime.now().strftime("%Y-%m-%d %H:%M:%S")}},
    )

    if result.modified_count > 0:
        return generatedKey 
    else:
        return None 
        
@app.route('/verificar-chave/<string:name>/<key>', methods=['POST'])
def checkKey(name, key):
    system = collection.find_one({'name': name, 'key': key})
    
    if system:
        countedExe('POST/Verificar')
        return jsonify({'mensagem': 'Validado'}), 200
    else:
        return jsonify({'mensagem': 'Chave inválida ou sistema não encontrado'}), 403
    
@app.route('/gerar-chave', methods=['POST'])
def generatedKey():
    allDocuments = collection.count_documents({})
    
    if allDocuments >= 0:
        keyRandom = secrets.token_urlsafe(32)
        generatedKey = hashlib.sha256(f"{allDocuments}-{keyRandom}".encode()).hexdigest()
        return generatedKey
    return None
    
@app.route('/deletar-sistema/<string:id>', methods=['DELETE'])
def deleteSystem(id):
    system = collection.find_one({'_id': id})
    if system:
        name = system.get('name', 'nome não encontrado')  # Obtém o name do sistema
        result = collection.delete_one({'_id': id})
        if result.deleted_count > 0:
            return jsonify({'mensagem': f'Sistema {name} deletado com sucesso.'}), 200
        else:
            return jsonify({'mensagem': f'Sistema {name} não encontrado.'}), 404
    else:
        return jsonify({'mensagem': f'Sistema com ID {id} não encontrado.'}), 404
    

if __name__ == '__main__':
    app.run(host='0.0.0.0',debug=True )
