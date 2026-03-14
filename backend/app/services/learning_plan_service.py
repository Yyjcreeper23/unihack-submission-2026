from __future__ import annotations

import hashlib
from typing import Any

from .elasticsearch_service import ElasticsearchService
from ..utils.errors import APIError


class LearningPlanService:
    def __init__(self) -> None:
        self.es = ElasticsearchService()

    def generate_learning_plan(self, *, prompt: str, max_quests: int) -> dict[str, Any]:
        skill_response = self.es.search_learning_topics(prompt=prompt, size=3)
        skill_hits = skill_response.get("hits", {}).get("hits", [])

        if not skill_hits:
            raise APIError(
                "NO_MATCHING_TOPICS",
                "No matching topics were found in Elasticsearch. Index your learning topics first.",
                404,
            )

        quests: list[dict[str, Any]] = []
        seen_quest_ids: set[str] = set()
        matched_skills: list[dict[str, Any]] = []

        for skill_hit in skill_hits:
            skill_source = skill_hit.get("_source", {})
            skill_id = (
                skill_source.get("skill_id")
                or skill_source.get("id")
                or skill_hit.get("_id")
            )

            if not skill_id:
                continue

            matched_skills.append(
                {
                    "skill_id": skill_id,
                    "name": skill_source.get("name") or skill_id,
                    "score": skill_hit.get("_score", 0),
                }
            )

            skill_quests = self.es.get_quests_for_skill(skill_id=skill_id, size=max_quests)

            for quest in skill_quests:
                quest_id = quest.get("quest_id")
                if not quest_id or quest_id in seen_quest_ids:
                    continue

                seen_quest_ids.add(quest_id)
                quests.append(
                    {
                        "quest_id": quest_id,
                        "skill_id": quest.get("skill_id"),
                        "title": quest.get("title") or quest_id,
                        "description": quest.get("description") or "No description available.",
                        "difficulty": quest.get("difficulty") or "beginner",
                        "order": quest.get("order", len(quests) + 1),
                        "learning_objectives": quest.get("learning_objectives", []),
                        "keywords": quest.get("keywords") or [],
                        "estimated_minutes": quest.get("estimated_minutes"),
                        "category": quest.get("category"),
                    }
                )

                if len(quests) >= max_quests:
                    break

            if len(quests) >= max_quests:
                break

        if not quests:
            raise APIError(
                "NO_MATCHING_QUESTS",
                "Matching skills were found, but no quests were found for those skills.",
                404,
            )

        quests.sort(key=lambda q: (q.get("order") is None, q.get("order", 999999)))

        # Re-number plan order sequentially for API consumers
        for idx, quest in enumerate(quests, start=1):
            quest["plan_order"] = idx

        plan_hash = hashlib.md5(prompt.encode("utf-8")).hexdigest()[:12]

        return {
            "plan_id": f"plan_{plan_hash}",
            "goal": prompt,
            "quests": quests,
            "matched_skills": matched_skills,
            "source": "elasticsearch",
            "total_hits": len(quests),
        }

    def get_quest(self, quest_id: str) -> dict[str, Any]:
        source = self.es.get_quest_document(quest_id)
        if not source:
            raise APIError("QUEST_NOT_FOUND", f'Quest "{quest_id}" was not found.', 404)

        return {
            "quest_id": source.get("quest_id") or source.get("id") or quest_id,
            "skill_id": source.get("skill_id"),
            "title": source.get("title") or source.get("name") or quest_id,
            "description": source.get("description") or source.get("summary") or "No description available.",
            "difficulty": source.get("difficulty") or source.get("level") or "beginner",
            "learning_objectives": source.get("learning_objectives") or source.get("objectives") or [],
            "keywords": source.get("keywords") or source.get("aliases") or source.get("tags") or [],
            "category": source.get("category"),
            "estimated_minutes": source.get("estimated_minutes"),
            "order": source.get("order"),
            "raw_document": source,
        }