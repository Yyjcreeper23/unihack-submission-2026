<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a id="readme-top"></a>



<!-- PROJECT SHIELDS -->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h3 align="center">HABITMON</h3>

  <p align="center">
    Gamify learning skills with your own collection of monsters. Complete quests, earn feed, and grow your habitat.
    <br />
    <a href="https://habitmon.life/"><strong>Live Demo »</strong></a>
    <br />
    <br />
    <a href="https://habitmon.life/">View Demo</a>
    &middot;
    <a href="https://devpost.com/software/habit-habitat?ref_content=my-projects-tab&ref_feature=my_projects">DevPost</a>
    &middot;
    <a href="https://github.com/Yyjcreeper23/unihack-submission-2026/issues">Report Bug</a>
    &middot;
    <a href="https://github.com/Yyjcreeper23/unihack-submission-2026/issues">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

HABITMON is a UniHack 2026 submission that gamifies skill learning. Tell Lumi what you want to learn, get a quest plan, complete tasks, and pull monsters into your habitat. Learning more skills unlocks special feed that can increase your monsters' size and speed.

Repo for our team's submission for UniHack 2026 — HABITMON.

**Results:**

* Honorable Mention for Best Design (second place among 1000+ participants)
* Honorable Mention for Most Fun Idea (second place among 1000+ participants)

How a session goes:

* **Goal** — tell Lumi what skill you want to learn
* **Quests** — AI + Elasticsearch build a learning plan of tasks
* **Habitat** — complete quests, gacha monsters into your field
* **Practice** — quiz monsters and pull study resources (videos, articles, docs)

**Live app** (desktop and tablet): [https://habitmon.life/](https://habitmon.life/)

**DevPost:** [https://devpost.com/software/habit-habitat?ref_content=my-projects-tab&ref_feature=my_projects](https://devpost.com/software/habit-habitat?ref_content=my-projects-tab&ref_feature=my_projects)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

* [![React][React.js]][React-url]
* [![Vite][Vite.js]][Vite-url]
* [![Flask][Flask]][Flask-url]
* [![Elasticsearch][Elasticsearch]][Elasticsearch-url]
* [![OpenAI][OpenAI]][OpenAI-url]

Frontend is React + Vite. Backend is Flask with Elasticsearch for skill/quest search and OpenAI for learning plans, quiz questions, and resource suggestions. UI uses Press Start 2P for that pixel-game feel.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

Spin up a local copy with Elasticsearch, the Flask backend, and the Vite frontend.

### Prerequisites

* Node.js
* Python 3
* Elasticsearch (Docker one-liner below, or Elastic Cloud)
* API key: OpenAI

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/Yyjcreeper23/unihack-submission-2026.git
   cd unihack-submission-2026
   ```
2. Start Elasticsearch (local Docker)
   ```powershell
   docker run -d -p 9200:9200 -e "discovery.type=single-node" -e "xpack.security.enabled=false" docker.elastic.co/elasticsearch/elasticsearch:8.17.2
   ```
   Or skip Docker and use Elastic Cloud — set `ELASTIC_CLOUD_ID` / `ELASTIC_API_KEY` (or username/password) in `backend/.env` instead.
3. Backend
   ```powershell
   cd backend
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   copy .env.example .env
   ```
   Fill in `backend/.env`:
   ```text
   FLASK_APP=run.py
   FLASK_ENV=development
   ELASTICSEARCH_URL=http://localhost:9200
   ELASTICSEARCH_INDEX=learning_skills
   ELASTICSEARCH_QUEST_INDEX=learning_skills
   OPENAI_API_KEY=
   OPENAI_MODEL=gpt-4.1-mini
   OPENAI_RESOURCE_MODEL=gpt-4.1-mini
   OPENAI_QUESTION_MODEL=gpt-4.1-mini
   ```
   Optionally seed sample documents:
   ```powershell
   python seed_elastic.py
   ```
   Then run:
   ```powershell
   python run.py
   ```
   Backend listens on `http://localhost:8080`.
4. Frontend (new terminal)
   ```powershell
   cd frontend
   npm install
   copy .env.example .env
   ```
   Fill in `frontend/.env`:
   ```text
   VITE_API_BASE_URL=http://localhost:8080
   ```
   Then run:
   ```powershell
   npm run dev
   ```
5. Open the Vite URL (usually `http://localhost:5173`) and set a skill goal with Lumi.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

Demo is available for **desktop and tablet**: [https://habitmon.life/](https://habitmon.life/)

1. Open the app and tell Lumi what skill you want to learn
2. Wait for your learning plan (quests) to load
3. Complete each quest — finishing one triggers a monster gacha pull
4. Click monsters in your habitat to quiz them or open study resources
5. When all quests are done, start a new skill to keep growing the collection

Backend health check: `GET http://localhost:8080/health`

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap

- [x] Skill goal → AI/Elasticsearch learning plan (quests)
- [x] Habitat with monster collection + gacha on quest complete
- [x] Quiz and study resources for quests/monsters
- [x] Local save (localStorage) + live deploy ([habitmon.life](https://habitmon.life/))
- [ ] Stronger mobile support (demo is desktop/tablet today)
- [ ] CI workflow and badges
- [ ] Auth / multi-device sync beyond localStorage
- [ ] Richer Elasticsearch seeding and skill coverage

See the [open issues](https://github.com/Yyjcreeper23/unihack-submission-2026/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

This is a UniHack team project, but issues and PRs are welcome if you want to poke at it.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

UniHack 2026 team — HABITMON

* Project Link: [https://github.com/Yyjcreeper23/unihack-submission-2026](https://github.com/Yyjcreeper23/unihack-submission-2026)
* Live Demo: [https://habitmon.life/](https://habitmon.life/)
* DevPost: [https://devpost.com/software/habit-habitat?ref_content=my-projects-tab&ref_feature=my_projects](https://devpost.com/software/habit-habitat?ref_content=my-projects-tab&ref_feature=my_projects)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

Docs and third-party stuff used on this project.

### Events / hosting

* [UniHack 2026](https://unihack.net/)
* [DevPost](https://devpost.com/)
* [habitmon.life](https://habitmon.life/)

### APIs / services

* [OpenAI](https://platform.openai.com/docs)
* [Elasticsearch](https://www.elastic.co/docs/)
* [Google Fonts (Press Start 2P)](https://fonts.google.com/specimen/Press+Start+2P)

### Frontend

* [React / React DOM](https://react.dev/)
* [Vite](https://vite.dev/)

### Backend

* [Flask](https://flask.palletsprojects.com/)
* [elasticsearch (Python client)](https://elasticsearch-py.readthedocs.io/)
* [openai (Python)](https://github.com/openai/openai-python)
* [python-dotenv](https://github.com/theskumar/python-dotenv)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/Yyjcreeper23/unihack-submission-2026.svg?style=for-the-badge
[contributors-url]: https://github.com/Yyjcreeper23/unihack-submission-2026/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/Yyjcreeper23/unihack-submission-2026.svg?style=for-the-badge
[forks-url]: https://github.com/Yyjcreeper23/unihack-submission-2026/network/members
[stars-shield]: https://img.shields.io/github/stars/Yyjcreeper23/unihack-submission-2026.svg?style=for-the-badge
[stars-url]: https://github.com/Yyjcreeper23/unihack-submission-2026/stargazers
[issues-shield]: https://img.shields.io/github/issues/Yyjcreeper23/unihack-submission-2026.svg?style=for-the-badge
[issues-url]: https://github.com/Yyjcreeper23/unihack-submission-2026/issues
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://react.dev/
[Vite.js]: https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white
[Vite-url]: https://vite.dev/
[Flask]: https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white
[Flask-url]: https://flask.palletsprojects.com/
[Elasticsearch]: https://img.shields.io/badge/Elasticsearch-005571?style=for-the-badge&logo=elasticsearch&logoColor=white
[Elasticsearch-url]: https://www.elastic.co/
[OpenAI]: https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white
[OpenAI-url]: https://platform.openai.com/
