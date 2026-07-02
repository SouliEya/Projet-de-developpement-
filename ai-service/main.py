import os
import re
import json
from typing import Optional
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

app = FastAPI(title="Smart Test Assistant — AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Models ──────────────────────────────────────────────────────────

class StoryInput(BaseModel):
    title: str
    description: str
    acceptanceCriteria: list[str] = []

class TestStep(BaseModel):
    stepNumber: int
    action: str
    expectedResult: str
    testData: Optional[str] = None

class GeneratedTestCase(BaseModel):
    title: str
    description: str
    preconditions: list[str]
    steps: list[TestStep]
    priority: str
    type: str

class GenerateResponse(BaseModel):
    testCases: list[GeneratedTestCase]
    count: int

class BugInput(BaseModel):
    title: str
    description: str

class ClassifyResponse(BaseModel):
    classification: str
    confidence: float
    details: dict

class PrioritizeInput(BaseModel):
    testId: str
    title: str
    executionCount: int = 0
    bugCount: int = 0
    businessCriticality: str = "medium"
    manualDuration: int = 10

class PrioritizeResponse(BaseModel):
    testId: str
    score: int
    recommendation: str

# ── Test Generation (rule-based fallback + OpenAI) ──────────────────

OPENAI_KEY = os.getenv("OPENAI_API_KEY", "")

def generate_with_openai(story: StoryInput) -> list[dict]:
    """Try generating tests via OpenAI API."""
    try:
        from openai import OpenAI
        client = OpenAI(api_key=OPENAI_KEY)

        criteria_text = "\n".join(f"- {c}" for c in story.acceptanceCriteria) if story.acceptanceCriteria else "Aucun"

        prompt = f"""Tu es un QA Engineer expert. Génère des cas de test détaillés pour cette User Story.

Titre: {story.title}
Description: {story.description}
Critères d'acceptation:
{criteria_text}

Génère entre 4 et 8 cas de test couvrant:
- Cas nominal (positif)
- Cas d'erreur (négatif)
- Cas limites
- Validation des champs

Pour chaque cas de test, fournis:
- title: titre du test
- description: description détaillée
- preconditions: liste de prérequis
- steps: liste d'étapes avec stepNumber, action, expectedResult
- priority: "critical", "high", "medium" ou "low"
- type: "functional", "security", "performance" ou "ux_ui"

Réponds UNIQUEMENT en JSON valide sous la forme: {{"testCases": [...]}}"""

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=3000
        )

        content = response.choices[0].message.content.strip()
        # Extract JSON from response
        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            data = json.loads(json_match.group())
            return data.get("testCases", [])
    except Exception as e:
        print(f"OpenAI error: {e}")

    return []

def generate_rule_based(story: StoryInput) -> list[dict]:
    """Generate test cases using rule-based approach."""
    tests = []

    # Positive test
    tests.append({
        "title": f"{story.title} — Cas nominal",
        "description": f"Vérifier le scénario positif: {story.description}",
        "preconditions": ["Utilisateur connecté", "Données de test préparées"],
        "steps": [
            {"stepNumber": 1, "action": "Accéder à la fonctionnalité", "expectedResult": "Page affichée correctement"},
            {"stepNumber": 2, "action": "Saisir les données valides", "expectedResult": "Données acceptées"},
            {"stepNumber": 3, "action": "Valider l'action", "expectedResult": "Résultat attendu obtenu"},
        ],
        "priority": "high",
        "type": "functional"
    })

    # Negative: invalid data
    tests.append({
        "title": f"{story.title} — Données invalides",
        "description": "Vérifier le comportement avec des données incorrectes",
        "preconditions": ["Utilisateur connecté"],
        "steps": [
            {"stepNumber": 1, "action": "Accéder à la fonctionnalité", "expectedResult": "Page affichée"},
            {"stepNumber": 2, "action": "Saisir des données invalides", "expectedResult": "Message d'erreur affiché"},
        ],
        "priority": "high",
        "type": "functional"
    })

    # Empty fields
    tests.append({
        "title": f"{story.title} — Champs vides",
        "description": "Vérifier la validation des champs obligatoires",
        "preconditions": ["Utilisateur connecté"],
        "steps": [
            {"stepNumber": 1, "action": "Accéder au formulaire", "expectedResult": "Formulaire affiché"},
            {"stepNumber": 2, "action": "Soumettre sans remplir les champs", "expectedResult": "Messages de validation affichés"},
        ],
        "priority": "medium",
        "type": "functional"
    })

    # Boundary test
    tests.append({
        "title": f"{story.title} — Valeurs limites",
        "description": "Tester les limites des champs (longueur max, caractères spéciaux)",
        "preconditions": ["Utilisateur connecté"],
        "steps": [
            {"stepNumber": 1, "action": "Saisir des valeurs aux limites (très long, caractères spéciaux)", "expectedResult": "Validation correcte ou troncature"},
        ],
        "priority": "medium",
        "type": "functional"
    })

    # Test for each acceptance criterion
    for i, criteria in enumerate(story.acceptanceCriteria):
        tests.append({
            "title": f"{story.title} — Critère #{i+1}: {criteria[:60]}",
            "description": f"Valider le critère d'acceptation: {criteria}",
            "preconditions": ["Utilisateur connecté", "Environnement de test prêt"],
            "steps": [
                {"stepNumber": 1, "action": "Préparer les conditions nécessaires", "expectedResult": "Environnement prêt"},
                {"stepNumber": 2, "action": f"Vérifier: {criteria}", "expectedResult": "Critère satisfait"},
            ],
            "priority": "high",
            "type": "functional"
        })

    # Security test if keywords found
    desc_lower = (story.description + story.title).lower()
    if any(kw in desc_lower for kw in ["connexion", "login", "password", "mot de passe", "auth", "email"]):
        tests.append({
            "title": f"{story.title} — Sécurité: Injection SQL",
            "description": "Tester la résistance aux injections SQL dans les champs de saisie",
            "preconditions": ["Application accessible"],
            "steps": [
                {"stepNumber": 1, "action": "Saisir des payloads SQL (ex: ' OR 1=1 --)", "expectedResult": "Tentative rejetée, pas d'accès non autorisé"},
            ],
            "priority": "critical",
            "type": "security"
        })
        tests.append({
            "title": f"{story.title} — Sécurité: Brute Force",
            "description": "Tester la protection contre les tentatives répétées",
            "preconditions": ["Application accessible"],
            "steps": [
                {"stepNumber": 1, "action": "Effectuer 10+ tentatives avec des données incorrectes", "expectedResult": "Compte verrouillé ou CAPTCHA affiché"},
            ],
            "priority": "critical",
            "type": "security"
        })

    return tests


@app.post("/api/generate-tests", response_model=GenerateResponse)
async def generate_tests(story: StoryInput):
    """Generate test cases from a User Story."""
    test_cases = []

    if OPENAI_KEY:
        test_cases = generate_with_openai(story)

    if not test_cases:
        test_cases = generate_rule_based(story)

    return GenerateResponse(testCases=test_cases, count=len(test_cases))


# ── Bug Classification (keyword-based + optional ML) ────────────────

BUG_KEYWORDS = {
    "performance": ["lent", "slow", "timeout", "latence", "lag", "mémoire", "memory", "cpu", "charge", "load", "performance"],
    "security": ["injection", "xss", "csrf", "auth", "token", "permission", "accès", "sécurité", "security", "vulnerability", "faille"],
    "ux_ui": ["affichage", "design", "css", "style", "bouton", "button", "responsive", "alignement", "couleur", "police", "ui", "ux", "layout"],
    "regression": ["régression", "regression", "fonctionnait", "avant", "précédente", "version", "cassé", "broken"],
    "functional": ["erreur", "error", "bug", "fonctionnel", "ne fonctionne pas", "incorrect", "échoue", "fail", "crash", "exception"],
}

@app.post("/api/classify-bug", response_model=ClassifyResponse)
async def classify_bug(bug: BugInput):
    """Classify a bug based on its description."""
    text = f"{bug.title} {bug.description}".lower()
    scores = {}

    for category, keywords in BUG_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text)
        if score > 0:
            scores[category] = score

    if not scores:
        return ClassifyResponse(
            classification="functional",
            confidence=50.0,
            details={"message": "Classification par défaut, aucun mot-clé détecté"}
        )

    total = sum(scores.values())
    best_category = max(scores, key=scores.get)
    confidence = round((scores[best_category] / total) * 100, 1) if total > 0 else 50.0
    confidence = min(confidence, 98.0)

    return ClassifyResponse(
        classification=best_category,
        confidence=confidence,
        details={cat: round((s / total) * 100, 1) for cat, s in scores.items()}
    )


# ── Test Prioritization ────────────────────────────────────────────

@app.post("/api/prioritize-tests", response_model=list[PrioritizeResponse])
async def prioritize_tests(tests: list[PrioritizeInput]):
    """Score tests for automation prioritization."""
    results = []

    for t in tests:
        score = 0
        # Frequency: max 30 pts
        score += min(t.executionCount * 3, 30)
        # Bugs: max 25 pts
        score += min(t.bugCount * 5, 25)
        # Criticality: max 25 pts
        crit_map = {"critical": 25, "high": 20, "medium": 12, "low": 5}
        score += crit_map.get(t.businessCriticality, 12)
        # Manual duration: max 20 pts
        score += min(t.manualDuration, 20)

        score = min(score, 100)

        if score >= 75:
            rec = "Automatisation fortement recommandée"
        elif score >= 50:
            rec = "Automatisation recommandée"
        elif score >= 30:
            rec = "Automatisation optionnelle"
        else:
            rec = "Faible priorité d'automatisation"

        results.append(PrioritizeResponse(testId=t.testId, score=score, recommendation=rec))

    results.sort(key=lambda x: x.score, reverse=True)
    return results


# ── Health Check ────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "service": "AI Service", "openai_configured": bool(OPENAI_KEY)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
