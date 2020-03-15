from sklearn.externals import joblib
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import pandas as pd
# Imports nltk ---------------------------------------------
import nltk
from nltk.stem.snowball import SnowballStemmer
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.feature_extraction.text import CountVectorizer
from bs4 import BeautifulSoup
from random import randrange


def load(path):
    df = pd.read_csv(path)

    perguntas = []
    respostas = []
    id_repostas = []

    for row in df.iterrows():
        row = row[1]
        perguntas.append(BeautifulSoup(
            row.get("perguntas"), 'html.parser').get_text())
        respostas.append(BeautifulSoup(
            row.get("respostas"), 'html.parser').get_text())
        id_repostas.append(row.get("idResp"))

    return perguntas, respostas, id_repostas


cv = CountVectorizer()
perguntas, respostas, id_repostas = load("./QueryResults.csv")
stemmer = SnowballStemmer('portuguese')
stopwords = nltk.corpus.stopwords.words('portuguese')


app = Flask(__name__)
model = joblib.load(open('model.pkl', 'rb'))

caracteresIgnorados = ['\t', '\n']
pergunta_processed = []
for pergunta in perguntas:
    tokenizedText = nltk.word_tokenize(pergunta, language='portuguese')
    stemmedText = [stemmer.stem(
        t) for t in tokenizedText if t not in stopwords and not t in caracteresIgnorados]
    pergunta_processed.append(" ".join(stemmedText))
X_counts = cv.fit_transform(pergunta_processed)
tf_transformer = TfidfTransformer(use_idf=True).fit(X_counts)
text_tf = tf_transformer.transform(X_counts)


def process_new(new):
    tokenizedText = nltk.word_tokenize(new)
    stemmedText = [stemmer.stem(t)
                   for t in tokenizedText if t not in stopwords]

    text = [word for word in stemmedText if not word in caracteresIgnorados]
    text = " ".join(text)
    cv_text = cv.transform([text])

    return tf_transformer.transform(cv_text)


def classify_new(new):

    processed_new = process_new(new).toarray()
    y = model.predict(processed_new)
    index = int(id_repostas.index(y))
    print(index)
    print("{}: {}".format('KNN Reposta: ', respostas[index]))
    return respostas[index]


@app.route('/')
def home():
    return jsonify(
        ativo='true',
    )


@app.route('/response', methods=['POST'])
def novaPergunta():
    content = request.get_json()
    resposta = classify_new(content['pergunta'])
    return jsonify(
        resposta=resposta,
    )


@app.route('/pergunta', methods=['GET'])
def perguntaSugerida():
    arrayNumber = randrange(len(perguntas))
    return jsonify(
        pergunta=perguntas[arrayNumber],
        resposta=respostas[arrayNumber],
    )


if __name__ == "__main__":
    CORS(app)
    app.run(debug=True)
