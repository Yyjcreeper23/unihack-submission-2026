import json
import os

from dotenv import load_dotenv
from elasticsearch import Elasticsearch

load_dotenv()

INDEX_NAME = os.getenv('ELASTICSEARCH_INDEX', 'learning_skills')
DATA_FILE = 'data/sample_documents.json'


def build_client() -> Elasticsearch:
    cloud_id = os.getenv('ELASTIC_CLOUD_ID')
    api_key = os.getenv('ELASTIC_API_KEY')
    username = os.getenv('ELASTIC_USERNAME')
    password = os.getenv('ELASTIC_PASSWORD')
    url = os.getenv('ELASTICSEARCH_URL')

    if cloud_id and api_key:
        return Elasticsearch(cloud_id=cloud_id, api_key=api_key)
    if cloud_id and username and password:
        return Elasticsearch(cloud_id=cloud_id, basic_auth=(username, password))
    if url and api_key:
        return Elasticsearch(hosts=[url], api_key=api_key)
    if url and username and password:
        return Elasticsearch(hosts=[url], basic_auth=(username, password))
    if url:
        return Elasticsearch(hosts=[url])
    return Elasticsearch('http://localhost:9200')


def main() -> None:
    client = build_client()

    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        docs = json.load(f)

    if not client.indices.exists(index=INDEX_NAME):
        client.indices.create(index=INDEX_NAME)

    for doc in docs:
        doc_id = doc.get('skill_id') or doc.get('quest_id')
        client.index(index=INDEX_NAME, id=doc_id, document=doc)

    client.indices.refresh(index=INDEX_NAME)
    print(f'Seeded {len(docs)} documents into index: {INDEX_NAME}')


if __name__ == '__main__':
    main()
