from __future__ import annotations

from typing import Any

from .openai_service import OpenAIService


class ResourceService:
    def __init__(self) -> None:
        pass

    def generate_resources(self, *, quest: dict[str, Any], max_results: int, resource_types: list[str]) -> dict[str, Any]:
        prompt = f'''You are a learning-resource recommender.
        
IMPORTANT OUTPUT RULES:
- Output RAW JSON only.
- DO NOT wrap the JSON in markdown.
- DO NOT use ```json or ``` code blocks.
- The first character of the response must be {{ and the last must be }}.
- Do not include explanations before or after the JSON.

Return ONLY valid JSON with this exact shape:
{{
  "quest_id": "string",
  "resources": [
    {{
      "resource_id": "string",
      "type": "youtube|article|documentation|course",
      "title": "string",
      "url": "string",
      "source": "string",
      "summary": "string",
      "relevance_score": 0.0
    }}
  ]
}}

Rules:
- Find recent and useful learning resources for the quest.
- Prioritize YouTube and official docs when relevant.
- Use at most {max_results} resources.
- Allowed resource types: {resource_types}.
- Keep summaries short and practical.
- Relevance score must be between 0 and 1.
- quest_id must be {quest['quest_id']}.

Quest title: {quest['title']}
Quest description: {quest['description']}
Learning objectives: {quest.get('learning_objectives', [])}
Keywords: {quest.get('keywords', [])}
'''
        tools = [
            {
                'type': 'web_search_preview',
                'search_context_size': 'medium',
            }
        ]
        openai_service = OpenAIService()
        return openai_service.create_structured_json(
            prompt=prompt,
            model=openai_service.resource_model,
            tools=tools,
        )
