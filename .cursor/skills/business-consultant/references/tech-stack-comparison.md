# Tech Stack Comparison
## Przewodnik doboru narzędzi

> "Agnostycyzm technologiczny - dobieram narzędzia do problemu, nie problem do narzędzi"

---

## Matryca decyzyjna - szybki wybór

### Automatyzacja procesów

| Kryterium | Make | n8n | Zapier | Custom (Python) |
|-----------|------|-----|--------|-----------------|
| **Najlepsze dla** | Większość przypadków | Self-hosted, złożone | Proste integracje | Niestandardowe |
| **Krzywa uczenia** | Niska | Średnia | Bardzo niska | Wysoka |
| **Koszt** | Średni | Niski (self-host) | Wysoki | Tylko hosting |
| **Skalowalność** | Dobra | Bardzo dobra | Ograniczona | Nieograniczona |
| **Vendor lock-in** | Średni | Niski | Wysoki | Brak |
| **Wsparcie zespołu** | Dobre | Średnie | Bardzo dobre | Wymaga devów |

### Bazy danych / Backend

| Kryterium | Airtable | Supabase | SQL Server | BigQuery |
|-----------|----------|----------|------------|----------|
| **Najlepsze dla** | MVP, operacje | Aplikacje web | Enterprise | Analityka |
| **Nietechniczny user** | ✅ Świetne | ⚠️ Średnie | ❌ Słabe | ❌ Słabe |
| **API** | Proste | Zaawansowane | Pełne | Zaawansowane |
| **Koszt przy skali** | Wysoki | Niski | Średni | Zmienny |
| **Relacje danych** | Ograniczone | Pełne | Pełne | Ograniczone |

### AI / LLM

| Kryterium | OpenAI GPT-4 | Claude | Perplexity | Lokalne LLM |
|-----------|--------------|--------|------------|-------------|
| **Najlepsze dla** | Większość | Długi kontekst | Research | Prywatność |
| **Koszt** | Średni | Średni | Niski | Infrastruktura |
| **Jakość** | Bardzo wysoka | Bardzo wysoka | Wysoka (search) | Zmienna |
| **Prywatność** | ⚠️ Cloud | ⚠️ Cloud | ⚠️ Cloud | ✅ Lokalne |
| **Integracje** | Świetne | Dobre | Ograniczone | Wymaga pracy |

---

## Szczegółowe porównania

### Make vs n8n vs Zapier

#### Make (Make.com, dawniej Integromat)

**Kiedy wybierać:**
- Klient potrzebuje wizualnego buildera
- Średnio-złożone procesy (5-20 kroków)
- Zespół nietechniczny będzie utrzymywał
- Potrzebne natywne integracje z popularnymi SaaS
- Budget pozwala na SaaS

**Mocne strony:**
- Najlepszy wizualny interfejs
- Bogata biblioteka integracji (1500+)
- Dobre debugowanie i logi
- Rozsądny pricing przy średnim użyciu
- Dobra dokumentacja

**Słabe strony:**
- Vendor lock-in (scenariusze nie eksportowalne)
- Koszty rosną przy dużej skali
- Ograniczenia w custom logic
- Brak self-hosted opcji

**Pricing orientation:**
- Free: 1000 ops/miesiąc
- Core: ~$9/miesiąc (10k ops)
- Pro: ~$16/miesiąc (10k ops + features)
- Enterprise: custom

---

#### n8n

**Kiedy wybierać:**
- Self-hosted wymagane (bezpieczeństwo, compliance)
- Złożona logika biznesowa
- Zespół ma podstawy techniczne
- Długoterminowo, duża skala
- Potrzebna customizacja

**Mocne strony:**
- Self-hosted = pełna kontrola
- Open-source (fair-code)
- Bardzo elastyczne (custom nodes, code)
- Niski koszt przy skali
- Aktywna społeczność

**Słabe strony:**
- Wymaga hostingu i utrzymania
- Mniej natywnych integracji niż Make
- Stroma krzywa uczenia
- UI mniej intuicyjny

**Pricing orientation:**
- Self-hosted: darmowe (koszt infra)
- Cloud: od ~$20/miesiąc
- Enterprise: custom

---

#### Zapier

**Kiedy wybierać:**
- Bardzo proste integracje (A → B)
- Klient już używa i zna
- Szybki prototyp
- Brak budżetu na wdrożenie

**Mocne strony:**
- Najprostszy w użyciu
- Największa biblioteka integracji (6000+)
- Bardzo szybki setup
- Dobre dla 1-osobowych firm

**Słabe strony:**
- Bardzo drogi przy skali
- Ograniczona logika (multi-step drogi)
- Słabe debugowanie
- Wysoki vendor lock-in

**Pricing orientation:**
- Free: 100 tasks/miesiąc
- Starter: ~$20/miesiąc (750 tasks)
- Professional: ~$50/miesiąc (2k tasks)
- Szybko robi się drogie!

---

#### Rekomendacja domyślna

```
Prosty case (< 5 kroków, niski wolumen)     → Zapier
Typowy case (5-20 kroków, SaaS)             → Make
Złożony case lub self-hosted                → n8n
Niestandardowy / bardzo duża skala          → Python/Custom
```

---

### Airtable vs Supabase vs Notion

#### Airtable

**Kiedy wybierać:**
- Zespół nietechniczny musi pracować z danymi
- Potrzebne widoki (Kanban, kalendarz, galeria)
- MVP / szybkie prototypowanie
- Integracje z Make/Zapier kluczowe
- Baza < 50k rekordów

**Mocne strony:**
- Najlepszy UX dla nietechnicznych
- Świetne widoki i filtry
- Łatwe API
- Formularze, automatyzacje wbudowane
- Extensions marketplace

**Słabe strony:**
- Drogi przy skali (rekordy + użytkownicy)
- Ograniczenia relacji (linked records)
- Wolne API przy dużych zbiorach
- 100k rekordów limit na bazę
- Vendor lock-in

**Pricing:**
- Free: 1000 rekordów/baza
- Team: $20/user/miesiąc
- Business: $45/user/miesiąc

---

#### Supabase

**Kiedy wybierać:**
- Potrzebna prawdziwa relacyjna baza (PostgreSQL)
- Aplikacja webowa / mobilna
- Real-time subscriptions
- Row Level Security potrzebne
- Zespół techniczny

**Mocne strony:**
- Pełny PostgreSQL
- Open-source, self-hostable
- Real-time z pudełka
- Auth, Storage, Edge Functions
- Bardzo konkurencyjny pricing

**Słabe strony:**
- Wymaga wiedzy SQL
- UI mniej przyjazne dla nietechnicznych
- Mniej gotowych integracji no-code
- Learning curve

**Pricing:**
- Free: 500MB DB, 1GB storage
- Pro: $25/miesiąc (8GB DB)
- Team: $599/miesiąc

---

#### Kiedy co

```
Nietechniczny zespół + operacje         → Airtable
Aplikacja + developer                   → Supabase
Dokumentacja + lekkie dane              → Notion
Enterprise + compliance                 → SQL Server
Analityka + duże dane                   → BigQuery
```

---

### Chatboty: VAPI vs Custom (n8n + OpenAI)

#### VAPI

**Kiedy wybierać:**
- Voice-first (telefon, asystent głosowy)
- Szybkie wdrożenie voicebota
- Potrzebna latency < 500ms
- Integracje telefoniczne (Twilio)

**Mocne strony:**
- Specjalizacja w voice
- Niska latencja
- Łatwa integracja z telefonią
- Dobre TTS/STT

**Słabe strony:**
- Ograniczony do voice
- Pricing per minuta (drożeje)
- Mniej elastyczny niż custom

---

#### Custom (n8n/Make + OpenAI + Qdrant)

**Kiedy wybierać:**
- Potrzebna pełna kontrola
- RAG z własnych dokumentów
- Multi-channel (web, messenger, email)
- Złożona logika biznesowa
- Long-term, duża skala

**Mocne strony:**
- Pełna elastyczność
- Własna baza wiedzy (RAG)
- Multi-channel
- Kontrola kosztów

**Słabe strony:**
- Wymaga developmentu
- Dłuższy time-to-market
- Trzeba utrzymywać

---

### Vector Databases dla RAG

| Kryterium | Qdrant | Pinecone | Weaviate | Chroma |
|-----------|--------|----------|----------|--------|
| **Self-hosted** | ✅ | ❌ | ✅ | ✅ |
| **Managed** | ✅ | ✅ | ✅ | ❌ |
| **Filtering** | Świetne | Dobre | Świetne | Podstawowe |
| **Pricing** | Niski | Średni | Niski | Free |
| **Python SDK** | ✅ | ✅ | ✅ | ✅ |
| **Scale** | Duża | Bardzo duża | Duża | Mała |

**Rekomendacja:**
- MVP / prototyp → Chroma (lokalne)
- Produkcja self-hosted → Qdrant
- Produkcja managed → Pinecone lub Qdrant Cloud

---

## Quick Decision Framework

### Pytania do klienta

1. **Kto będzie utrzymywał system?**
   - Nietechniczny → Make, Airtable
   - Techniczny → n8n, Supabase, custom

2. **Jaki jest budżet operacyjny?**
   - Minimalizacja kosztów → self-hosted (n8n, Supabase)
   - Koszty nie są priorytetem → managed SaaS

3. **Jak ważna jest prywatność/compliance?**
   - Krytyczna → self-hosted, on-premise
   - Standard → cloud OK

4. **Jaka jest przewidywana skala?**
   - < 10k operacji/miesiąc → cokolwiek
   - > 100k operacji/miesiąc → uwaga na koszty Zapier/Make

5. **Czy jest zespół dev?**
   - Nie → no-code first
   - Tak → rozważ custom

---

## Red Flags - kiedy NIE używać

### Make/Zapier
❌ > 100k operacji miesięcznie (koszty)
❌ Wymagania real-time (< 1s latency)
❌ Złożone transformacje danych
❌ Self-hosted wymagane

### Airtable
❌ > 50k rekordów w bazie
❌ Skomplikowane relacje danych
❌ Wielu użytkowników (koszty)
❌ Wymagania transakcyjności

### No-code ogólnie
❌ Algorytmy ML/AI custom
❌ Przetwarzanie dużych plików
❌ Wymagania wydajnościowe
❌ Złożona logika domenowa

---

## Template rekomendacji dla klienta

```markdown
## Rekomendacja technologiczna

### Główne komponenty

| Warstwa | Narzędzie | Uzasadnienie |
|---------|-----------|--------------|
| Automatyzacja | [X] | [Dlaczego] |
| Dane | [X] | [Dlaczego] |
| AI | [X] | [Dlaczego] |
| Interfejs | [X] | [Dlaczego] |

### Alternatywy rozważane

| Alternatywa | Dlaczego odrzucona |
|-------------|-------------------|
| [X] | [Powód] |

### Ryzyka technologiczne

1. [Ryzyko] → Mitygacja: [...]

### Koszty operacyjne (szacunek)

| Komponent | Koszt/miesiąc |
|-----------|---------------|
| [X] | [Y] zł |
| **Razem** | **[Z] zł** |
```
