import json
import os
from typing import Any

from openai import OpenAI


class OpenAIService:
    def __init__(self) -> None:
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise RuntimeError('OPENAI_API_KEY is not set.')
        self.client = OpenAI(api_key=api_key)
        self.model = os.getenv('OPENAI_MODEL', 'gpt-4.1-mini')
        self.resource_model = os.getenv('OPENAI_RESOURCE_MODEL', self.model)
        self.question_model = os.getenv('OPENAI_QUESTION_MODEL', self.model)

    def _extract_text(self, response: Any) -> str:
        if hasattr(response, 'output_text') and response.output_text:
            return response.output_text
        try:
            return response.output[0].content[0].text
        except Exception as exc:
            raise RuntimeError('OpenAI response did not contain text output.') from exc

    def create_structured_json(self, *, prompt: str, model: str | None = None, tools: list[dict[str, Any]] | None = None) -> dict[str, Any]:
        response = self.client.responses.create(
            model=model or self.model,
            tools=tools or [],
            input=prompt,
        )
        text = self._extract_text(response)
        return json.loads(text)
