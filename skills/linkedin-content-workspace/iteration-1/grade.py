#!/usr/bin/env python3
"""Grade linkedin-content eval outputs against assertions."""

import json
import os
import re

BANNED_WORDS = [
    "moze", "mozesz", "tylko", "zaledwie", "po prostu", "bardzo", "naprawde",
    "doslownie", "wlasciwie", "tak naprawde", "z pewnoscia", "prawdopodobnie",
    "w zasadzie", "ogolnie", "moglby", "mogloby", "byc moze", "zglebiaj",
    "rozpoczac", "ruszyc", "pouczajacy", "szanowny", "rzucic swiatlo na",
    "wyjas nic", "tworzyc", "opracowac", "tworzenie", "opracowywanie",
    "wyobraz sobie", "sfera", "obszar", "przelom", "zmiana zasad gry",
    "odblokowac", "uwolnic", "odkryc", "wystrzelec", "gwaltownie wzrosnac",
    "otchlan", "nie jestes sam", "nie jestes sama", "w swiecie, w ktorym",
    "zrewolucjonizowac", "zaklucajacy", "wywrotowy", "wykorzystac",
    "wykorzystujac", "wejsc w szczegoly", "zaglebi sie", "gobelin",
    "tkanina", "oswietlic", "ujawnic", "odslonic", "kluczowy", "zlozony",
    "skomplikowany", "objasnic", "stad", "dlatego", "ponadto", "jednak",
    "ujarzmmic", "ekscytujacy", "przelomowy", "najnowoczesniejszy",
    "niezwykly", "ono", "okaze sie", "rzut oka na", "wglad w",
    "poruszanie sie po", "nawigowanie po", "krajobraz", "otoczenie",
    "razacy", "wyrazny", "swiadectwo", "dowod", "podsumowujac", "na koniec",
    "co wiecej", "zwiekszyc", "wzmocnic", "gwaltownie rosnacy",
    "szybko rosnacy", "otworzylo", "umozliwilo", "potezny", "silny",
    "zapytania", "ciagle zmieniajacy sie", "stale rozwijajacy sie",
    "game changer", "przełomowe", "zrewolucjonizować", "niezwykłe",
    "przełomowy", "niezwykły"
]

BASE = os.path.dirname(os.path.abspath(__file__))


def read_post(eval_name, variant):
    path = os.path.join(BASE, eval_name, variant, "outputs", "post.md")
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def find_banned(text):
    text_lower = text.lower()
    found = []
    for word in BANNED_WORDS:
        if word.lower() in text_lower:
            found.append(word)
    return found


def has_em_dash(text):
    return "—" in text or "\u2014" in text


def starts_with_banned_opening(text):
    first_line = text.strip().split("\n")[0].lower()
    banned_openings = ["cześć", "czesc", "dzisiaj chciałbym", "dzisiaj chcialbym", "hej"]
    return any(first_line.startswith(b) for b in banned_openings)


def has_question_mark_in_last_lines(text, n=5):
    lines = [l for l in text.strip().split("\n") if l.strip()]
    last = "\n".join(lines[-n:])
    return "?" in last


def has_hashtags(text):
    return bool(re.search(r"#\w+", text))


def count_ideas(text):
    # Count numbered items like "1.", "2.", etc. or "## Post 1", "## Post 2"
    numbered = re.findall(r"^\s*\d+[\.\)]", text, re.MULTILINE)
    headers = re.findall(r"^##\s+Post\s+\d", text, re.MULTILINE)
    return max(len(numbered), len(headers))


def has_hooks_per_idea(text):
    hooks = re.findall(r"(?i)hook:", text)
    return len(hooks)


def grade_eval1(variant):
    text = read_post("case-study-from-notes", variant)
    banned = find_banned(text)
    assertions = [
        {"text": "post-in-polish", "passed": bool(re.search(r"[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]|ktory|ktorych|zrobilismy", text, re.IGNORECASE)), "evidence": "Text contains Polish words"},
        {"text": "no-banned-words", "passed": len(banned) == 0, "evidence": f"Found: {banned}" if banned else "No banned words found"},
        {"text": "no-em-dash", "passed": not has_em_dash(text), "evidence": "Em dash found" if has_em_dash(text) else "No em dash"},
        {"text": "has-hook", "passed": not starts_with_banned_opening(text), "evidence": f"First line: {text.strip().split(chr(10))[0][:60]}"},
        {"text": "has-cta", "passed": has_question_mark_in_last_lines(text), "evidence": "Question mark in last lines" if has_question_mark_in_last_lines(text) else "No CTA found"},
        {"text": "has-concrete-numbers", "passed": bool(re.search(r"(6\s*h|15\s*min|120\s*h|120\s*godzin)", text, re.IGNORECASE)), "evidence": "Key numbers from brief present"},
        {"text": "has-hashtags", "passed": has_hashtags(text), "evidence": "Hashtags found" if has_hashtags(text) else "No hashtags"},
        {"text": "length-in-range", "passed": 800 <= len(text) <= 2000, "evidence": f"Length: {len(text)} chars"},
    ]
    return assertions


def grade_eval2(variant):
    text = read_post("brainstorm-topics", variant)
    idea_count = count_ideas(text)
    hook_count = has_hooks_per_idea(text)
    assertions = [
        {"text": "has-5-ideas", "passed": idea_count >= 5, "evidence": f"Found {idea_count} ideas"},
        {"text": "has-hooks", "passed": hook_count >= 4, "evidence": f"Found {hook_count} hooks (looking for 'Hook:' labels)"},
        {"text": "ai-agents-topic", "passed": bool(re.search(r"(agent|multi-agent|wieloagentow|multi.agent)", text, re.IGNORECASE)), "evidence": "AI agents topic present"},
    ]
    return assertions


def grade_eval3(variant):
    text = read_post("optimize-existing-post", variant)
    original = "Cześć wszystkim! Dzisiaj chciałbym podzielić się z Wami moimi przemyśleniami na temat sztucznej inteligencji w biznesie. Uważam że AI to naprawdę przełomowe narzędzie które może zrewolucjonizować sposób w jaki pracujemy. W naszej firmie wykorzystujemy AI do wielu zadań i muszę powiedzieć że rezultaty są niezwykłe. Jeśli jeszcze nie korzystacie z AI to naprawdę warto spróbować bo to game changer. Dajcie znać co myślicie!"
    banned = find_banned(text)
    # Check specifically for the words that were in the original
    original_banned = [w for w in ["przełomowe", "zrewolucjonizować", "niezwykłe", "game changer", "naprawde", "naprawdę"] if w.lower() in text.lower()]
    assertions = [
        {"text": "no-banned-words", "passed": len(original_banned) == 0, "evidence": f"Original banned words still present: {original_banned}" if original_banned else "Original banned words removed"},
        {"text": "shorter-than-original", "passed": len(text) <= len(original) * 1.5, "evidence": f"Original: {len(original)} chars, New: {len(text)} chars"},
        {"text": "has-hook", "passed": not starts_with_banned_opening(text), "evidence": f"First line: {text.strip().split(chr(10))[0][:60]}"},
        {"text": "has-specifics", "passed": bool(re.search(r"\d+", text)), "evidence": "Contains specific numbers" if re.search(r"\d+", text) else "No specifics found"},
    ]
    return assertions


def save_grading(eval_name, variant, assertions):
    path = os.path.join(BASE, eval_name, variant, "grading.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump({"expectations": assertions}, f, indent=2, ensure_ascii=False)
    passed = sum(1 for a in assertions if a["passed"])
    total = len(assertions)
    print(f"  {eval_name}/{variant}: {passed}/{total} passed")


def main():
    print("Grading linkedin-content evals...\n")

    for variant in ["with_skill", "without_skill"]:
        save_grading("case-study-from-notes", variant, grade_eval1(variant))
    for variant in ["with_skill", "without_skill"]:
        save_grading("brainstorm-topics", variant, grade_eval2(variant))
    for variant in ["with_skill", "without_skill"]:
        save_grading("optimize-existing-post", variant, grade_eval3(variant))

    print("\nDone!")


if __name__ == "__main__":
    main()
