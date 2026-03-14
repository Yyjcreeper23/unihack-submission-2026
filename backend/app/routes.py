from flask import Blueprint, jsonify, request

from .services.learning_plan_service import LearningPlanService
from .services.resource_service import ResourceService
from .services.question_service import QuestionService
from .utils.errors import APIError

api_bp = Blueprint('api', __name__)

learning_plan_service = LearningPlanService()
resource_service = ResourceService()
question_service = QuestionService()


@api_bp.errorhandler(APIError)
def handle_api_error(err: APIError):
    response = jsonify({'error': {'code': err.code, 'message': err.message}})
    response.status_code = err.status_code
    return response


@api_bp.post('/learning-plans')
def create_learning_plan():
    body = request.get_json(silent=True) or {}
    prompt = (body.get('prompt') or '').strip()
    max_quests = int(body.get('max_quests', 8))

    if not prompt:
        raise APIError('INVALID_REQUEST', 'Field "prompt" is required.', 400)

    result = learning_plan_service.generate_learning_plan(prompt=prompt, max_quests=max_quests)
    return jsonify(result)


@api_bp.get('/quests/<quest_id>')
def get_quest(quest_id: str):
    result = learning_plan_service.get_quest(quest_id)
    return jsonify(result)


@api_bp.post('/quests/<quest_id>/resources')
def get_quest_resources(quest_id: str):
    body = request.get_json(silent=True) or {}
    max_results = int(body.get('max_results', 5))
    resource_types = body.get('resource_types') or ['youtube', 'article', 'documentation']

    quest = learning_plan_service.get_quest(quest_id)
    result = resource_service.generate_resources(
        quest=quest,
        max_results=max_results,
        resource_types=resource_types,
    )
    return jsonify(result)


@api_bp.post('/generate-question')
def generate_question():
    body = request.get_json(silent=True) or {}
    quest_id = body.get('quest_id')
    question_type = body.get('question_type', 'multiple_choice')
    difficulty = body.get('difficulty', 'easy')
    monster = body.get('monster') or {}

    if not quest_id:
        raise APIError('INVALID_REQUEST', 'Field "quest_id" is required.', 400)

    quest = learning_plan_service.get_quest(quest_id)
    result = question_service.generate_question(
        quest=quest,
        question_type=question_type,
        difficulty=difficulty,
        monster=monster,
    )
    return jsonify(result)
