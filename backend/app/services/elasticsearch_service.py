from __future__ import annotations

import os
from typing import Any

from elasticsearch import Elasticsearch


class ElasticsearchService:
    def __init__(self) -> None:
        self.client = self._build_client()
        self.index_name = os.getenv("ELASTICSEARCH_INDEX", "learning_skills")
        self.quest_index_name = os.getenv("ELASTICSEARCH_QUEST_INDEX", "learning_quests")

    def _build_client(self) -> Elasticsearch:
        cloud_id = os.getenv("ELASTIC_CLOUD_ID")
        api_key = os.getenv("ELASTIC_API_KEY")
        username = os.getenv("ELASTIC_USERNAME")
        password = os.getenv("ELASTIC_PASSWORD")
        url = os.getenv("ELASTICSEARCH_URL")

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

        return Elasticsearch("http://localhost:9200")

    def search_learning_topics(self, *, prompt: str, size: int = 5) -> dict[str, Any]:
        query = {
            "size": size,
            "query": {
                "bool": {
                    "should": [
                        {
                            "multi_match": {
                                "query": prompt,
                                "fields": [
                                    "name^4",
                                    "aliases^4",
                                    "category^2",
                                    "description^2",
                                    "skill_id^3",
                                ],
                                "type": "best_fields",
                                "fuzziness": "AUTO",
                            }
                        },
                        {
                            "match_phrase_prefix": {
                                "name": {
                                    "query": prompt,
                                    "boost": 5
                                }
                            }
                        },
                        {
                            "match_phrase_prefix": {
                                "aliases": {
                                    "query": prompt,
                                    "boost": 4
                                }
                            }
                        },
                    ],
                    "minimum_should_match": 1,
                }
            },
        }
        return self.client.search(index=self.index_name, body=query)

    def get_quests_for_skill(self, *, skill_id: str, size: int = 8) -> list[dict[str, Any]]:
        query = {
            "size": size,
            "sort": [
                {"order": {"order": "asc"}},
                {"_score": {"order": "desc"}},
            ],
            "query": {
                "bool": {
                    "should": [
                        {"term": {"skill_id.keyword": skill_id}},
                        {"term": {"skill_id": skill_id}},
                    ],
                    "minimum_should_match": 1,
                }
            },
        }

        response = self.client.search(index=self.quest_index_name, body=query)
        hits = response.get("hits", {}).get("hits", [])

        quests = []
        for hit in hits:
            source = hit.get("_source", {})
            source.setdefault("quest_id", hit.get("_id"))
            quests.append(source)

        return quests

    def get_quest_document(self, quest_id: str) -> dict[str, Any] | None:
        try:
            response = self.client.get(index=self.quest_index_name, id=quest_id)
            source = response.get("_source", {})
            source.setdefault("quest_id", response.get("_id"))
            return source
        except Exception:
            query = {
                "size": 1,
                "query": {
                    "bool": {
                        "should": [
                            {"term": {"quest_id.keyword": quest_id}},
                            {"term": {"quest_id": quest_id}},
                            {"term": {"id.keyword": quest_id}},
                        ],
                        "minimum_should_match": 1,
                    }
                },
            }
            response = self.client.search(index=self.quest_index_name, body=query)
            hits = response.get("hits", {}).get("hits", [])
            if not hits:
                return None

            source = hits[0].get("_source", {})
            source.setdefault("quest_id", hits[0].get("_id"))
            return source