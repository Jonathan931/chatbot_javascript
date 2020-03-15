import numpy as np
import pandas as pd
import math

# Imports sklearn ------------------------------------------
from sklearn.externals import joblib

# tfidf
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.neighbors import KNeighborsClassifier

# Imports nltk ---------------------------------------------
import nltk
from nltk.stem.snowball import SnowballStemmer


from bs4 import BeautifulSoup


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


perguntas, respostas, id_repostas = load("./QueryResults.csv")

stemmer = SnowballStemmer('portuguese')
stopwords = nltk.corpus.stopwords.words('portuguese')

caracteresIgnorados = ['\t', '\n']
pergunta_processed = []
for pergunta in perguntas:
    tokenizedText = nltk.word_tokenize(pergunta, language='portuguese')
    stemmedText = [stemmer.stem(
        t) for t in tokenizedText if t not in stopwords and not t in caracteresIgnorados]
    pergunta_processed.append(" ".join(stemmedText))

cv = CountVectorizer()

X_counts = cv.fit_transform(pergunta_processed)
tf_transformer = TfidfTransformer(use_idf=True).fit(X_counts)
text_tf = tf_transformer.transform(X_counts)

trainText = text_tf.toarray()

model = KNeighborsClassifier(algorithm='auto', leaf_size=30, metric='minkowski',
                             metric_params=None, n_jobs=None, n_neighbors=5, p=2,
                             weights='distance')
model.fit(trainText, id_repostas)

joblib.dump(model, 'model.pkl')
