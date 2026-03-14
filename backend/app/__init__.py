from dotenv import load_dotenv
from flask import Flask
from .routes import api_bp


def create_app() -> Flask:
    load_dotenv()
    app = Flask(__name__)
    app.register_blueprint(api_bp)

    @app.get('/health')
    def health():
        return {'status': 'ok'}

    return app
