from __future__ import annotations

import hashlib
from typing import Any

from .elasticsearch_service import ElasticsearchService
from ..utils.errors import APIError


class LearningPlanService:
    def __init__(self) -> None:
        self.es = ElasticsearchService()

    def generate_learning_plan(self, *, prompt: str, max_quests: int) -> dict[str, Any]:
        response = self.es.search_learning_topics(prompt=prompt, size=max_quests)
        hits = response.get('hits', {}).get('hits', [])
        if not hits:
            raise APIError(
                'NO_MATCHING_TOPICS',
                'No matching topics were found in Elasticsearch. Index your learning topics first.',
                404,
            )

        quests: list[dict[str, Any]] = []
        for order, hit in enumerate(hits, start=1):
            source = hit.get('_source', {})
            quest_id = source.get('quest_id') or source.get('skill_id') or source.get('id') or hit.get('_id')
            title = source.get('title') or source.get('name') or f'Quest {order}'
            description = source.get('description') or source.get('summary') or 'No description available.'
            difficulty = source.get('difficulty') or source.get('level') or 'beginner'
            objectives = source.get('learning_objectives') or source.get('objectives') or []
            keywords = source.get('keywords') or source.get('aliases') or source.get('tags') or []
            quests.append(
                {
                    'quest_id': quest_id,
                    'title': title,
                    'description': description,
                    'difficulty': difficulty,
                    'order': order,
                    'learning_objectives': objectives,
                    'keywords': keywords,
                    'source_score': hit.get('_score', 0),
                }
            )

        plan_hash = hashlib.md5(prompt.encode('utf-8')).hexdigest()[:12]
        return {
            'plan_id': f'plan_{plan_hash}',
            'goal': prompt,
            'quests': quests,
            'source': 'elasticsearch',
            'total_hits': response.get('hits', {}).get('total', {}).get('value', len(quests)),
        }

    def get_quest(self, quest_id: str) -> dict[str, Any]:
        source = self.es.get_quest_document(quest_id)
        if not source:
            raise APIError('QUEST_NOT_FOUND', f'Quest "{quest_id}" was not found.', 404)

        return {
            'quest_id': source.get('quest_id') or source.get('skill_id') or source.get('id') or quest_id,
            'title': source.get('title') or source.get('name') or quest_id,
            'description': source.get('description') or source.get('summary') or 'No description available.',
            'difficulty': source.get('difficulty') or source.get('level') or 'beginner',
            'learning_objectives': source.get('learning_objectives') or source.get('objectives') or [],
            'keywords': source.get('keywords') or source.get('aliases') or source.get('tags') or [],
            'category': source.get('category'),
            'raw_document': source,
        }
