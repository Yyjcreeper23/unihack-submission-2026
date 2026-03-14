import json
import os
from pathlib import Path

from dotenv import load_dotenv
from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk

load_dotenv()

SKILL_INDEX = os.getenv("ELASTICSEARCH_INDEX", "learning_skills")
QUEST_INDEX = os.getenv("ELASTICSEARCH_QUEST_INDEX", "learning_quests")
DATA_FILE = os.getenv("DATA_FILE", "data/dataset.json")


def build_client() -> Elasticsearch:
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


def load_dataset(file_path: str) -> dict:
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"Data file not found: {file_path}")

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, dict):
        raise ValueError("Dataset must be a JSON object with top-level 'skills' and 'quests' arrays.")

    skills = data.get("skills", [])
    quests = data.get("quests", [])

    if not isinstance(skills, list) or not isinstance(quests, list):
        raise ValueError("'skills' and 'quests' must both be arrays.")

    return {
        "skills": skills,
        "quests": quests,
    }


def ensure_index_exists(client: Elasticsearch, index_name: str) -> None:
    if not client.indices.exists(index=index_name):
        client.indices.create(index=index_name)
        print(f"Created index: {index_name}")
    else:
        print(f"Index already exists: {index_name}")


def build_bulk_actions(docs: list[dict], index_name: str, id_field: str):
    for doc in docs:
        if not isinstance(doc, dict):
            continue

        doc_id = doc.get(id_field)
        action = {
            "_index": index_name,
            "_source": doc,
        }

        if doc_id is not None:
            action["_id"] = str(doc_id)

        yield action


def upload_docs(client: Elasticsearch, docs: list[dict], index_name: str, id_field: str) -> None:
    if not docs:
        print(f"No documents found for index: {index_name}")
        return

    ensure_index_exists(client, index_name)

    print(f"Uploading {len(docs)} docs to {index_name}...")
    success, errors = bulk(
        client,
        build_bulk_actions(docs, index_name, id_field),
        raise_on_error=False,
        stats_only=False,
    )

    client.indices.refresh(index=index_name)

    print(f"Indexed {success} documents into index: {index_name}")

    if errors:
        print(f"Encountered {len(errors)} errors in {index_name}. First few:")
        for err in errors[:5]:
            print(json.dumps(err, indent=2, ensure_ascii=False))
    else:
        print(f"No bulk errors reported for {index_name}.")


def main() -> None:
    print("Connecting to Elasticsearch...")
    client = build_client()

    try:
        info = client.info()
        cluster_name = info.get("cluster_name", "unknown")
        print(f"Connected successfully. Cluster: {cluster_name}")
    except Exception as e:
        raise RuntimeError(f"Failed to connect to Elasticsearch: {e}") from e

    print(f"Loading dataset from: {DATA_FILE}")
    dataset = load_dataset(DATA_FILE)

    skills = dataset["skills"]
    quests = dataset["quests"]

    print(f"Loaded {len(skills)} skills")
    print(f"Loaded {len(quests)} quests")

    upload_docs(client, skills, SKILL_INDEX, "skill_id")
    upload_docs(client, quests, QUEST_INDEX, "quest_id")


if __name__ == "__main__":
    main()