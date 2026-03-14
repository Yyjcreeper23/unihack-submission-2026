import os
from typing import Any

from elasticsearch import Elasticsearch


class ElasticsearchService:
    def __init__(self) -> None:
        self.index_name = os.getenv('ELASTICSEARCH_INDEX', 'learning_skills')
        self.quest_index_name = os.getenv('ELASTICSEARCH_QUEST_INDEX', self.index_name)
        self._client = None

    @property
    def client(self) -> Elasticsearch:
        if self._client is None:
            self._client = self._build_client()
        return self._client

    def _build_client(self) -> Elasticsearch:
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

    def search_learning_topics(self, prompt: str, size: int = 8) -> dict[str, Any]:
        body = {
            'size': size,
            'query': {
                'multi_match': {
                    'query': prompt,
                    'fields': [
                        'name^4',
                        'title^4',
                        'aliases^3',
                        'description^2',
                        'skills^2',
                        'content',
                        'category',
                        'tags^2',
                    ],
                    'type': 'best_fields',
                    'fuzziness': 'AUTO',
                }
            },
        }
        return self.client.search(index=self.index_name, body=body)

    def get_quest_document(self, quest_id: str) -> dict[str, Any] | None:
        try:
            response = self.client.get(index=self.quest_index_name, id=quest_id)
            return response.get('_source')
        except Exception:
            query = {
                'size': 1,
                'query': {
                    'bool': {
                        'should': [
                            {'term': {'quest_id.keyword': quest_id}},
                            {'term': {'skill_id.keyword': quest_id}},
                            {'term': {'id.keyword': quest_id}},
                        ],
                        'minimum_should_match': 1,
                    }
                },
            }
            response = self.client.search(index=self.quest_index_name, body=query)
            hits = response.get('hits', {}).get('hits', [])
            if not hits:
                return None
            source = hits[0].get('_source', {})
            source.setdefault('quest_id', hits[0].get('_id'))
            return source
