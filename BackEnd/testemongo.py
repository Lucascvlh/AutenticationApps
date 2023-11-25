from flask import Flask, request, jsonify
app = Flask(__name__)

@app.route('/', methods=['GET'])
def get_sistemas():
    return jsonify({'mensagem':'conectado ao mongo'})

if __name__ == '__main__':
    app.run(debug=True)