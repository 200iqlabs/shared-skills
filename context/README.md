# Context — dane uzytkownika

Ten katalog przechowuje pliki kontekstowe specyficzne dla Twojej organizacji. Pliki te sa uzywane przez skille do personalizacji porad i rekomendacji.

## Jak skonfigurowac

**Opcja 1 (zalecana):** Uruchom skill `environment-setup` — przeprowadzi Cie krok po kroku przez tworzenie wszystkich plikow kontekstowych.

**Opcja 2 (reczna):** Skopiuj szablony z `context/templates/` i uzupelnij dane:
```bash
cp context/templates/company.template.md context/company.md
# Edytuj context/company.md — zamien [DO UZUPELNIENIA] na swoje dane
```

## Dostepne typy kontekstu

| Plik | Uzywany przez | Zawartosc |
|------|---------------|-----------|
| `company.md` | legal, tax-advisor, cfo | Dane firmy, forma prawna, struktura zespolu |
| `consultant-profile.md` | business-consultant | Filozofia konsultingowa, doswiadczenie, podejscie |
| `projects-portfolio.md` | business-consultant | Zrealizowane projekty, case studies, wzorce architektoniczne |
| `author-profile.md` | linkedin-content | Persona autora, audiencja, przyklady postow |
| `finances.md` | cfo | Budzet, cele finansowe, struktura kosztow |
| `legal-entities.md` | legal, tax-advisor | Podmioty prawne, relacje, backlog dokumentow |

## Wazne

- Pliki `context/*.md` (poza README.md) sa w `.gitignore` — Twoje dane nie trafia do repozytorium
- Szablony w `context/templates/` sa dystrybuowane z repozytorium
- Nie usuwaj tego pliku README.md — jest sledzony przez git
