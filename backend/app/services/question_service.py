from __future__ import annotations

from typing import Any

from .openai_service import OpenAIService


class QuestionService:
    def __init__(self) -> None:
        pass

    def generate_question(
        self,
        *,
        quest: dict[str, Any],
        question_type: str,
        difficulty: str,
        monster: dict[str, Any],
    ) -> dict[str, Any]:
        monster_name = monster.get('name', 'Quest Monster')
        monster_tone = monster.get('tone', 'playful')
        monster_type = monster.get('type', 'default_monster')

        prompt = f'''You are generating a revision question for a learning game.

IMPORTANT OUTPUT RULES:
- Output RAW JSON only.
- DO NOT wrap the JSON in markdown.
- DO NOT use ```json or ``` code blocks.
- The first character of the response must be {{ and the last must be }}.
- Do not include explanations before or after the JSON.

Return ONLY valid JSON with this exact shape:
{{
  "question_id": "string",
  "quest_id": "string",
  "monster": {{
    "type": "string",
    "name": "string",
    "tone": "string"
  }},
  "question_type": "string",
  "difficulty": "string",
  "question": "string",
  "options": ["string"],
  "answer": "string",
  "explanation": "string"
}}

Rules:
- Generate exactly one revision question.
- If question_type is multiple_choice, provide 4 options.
- If question_type is true_false, provide 2 options: ["True", "False"].
- If question_type is short_answer, options must be an empty list.
- Keep the question aligned with the quest only.
- Make the question reasonable for {difficulty} difficulty.
- quest_id must be {quest['quest_id']}.
- monster.type must be {monster_type}.
- monster.name must be {monster_name}.
- monster.tone must be {monster_tone}.

Quest title: {quest['title']}
Quest description: {quest['description']}
Learning objectives: {quest.get('learning_objectives', [])}
Keywords: {quest.get('keywords', [])}
Question type: {question_type}
Difficulty: {difficulty}
'''
        openai_service = OpenAIService()
        return openai_service.create_structured_json(
            prompt=prompt,
            model=openai_service.question_model,
        )
