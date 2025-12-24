from flask import Flask, render_template, request, jsonify
import os

app = Flask(__name__, template_folder='.', static_folder='.')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat')
def chat():
    return render_template('chat.html')

@app.route('/companion')
def companion():
    return render_template('companion.html')

@app.route('/about')
def about():
    return render_template('about.html')

if __name__ == '__main__':
    app.run(debug=True)
