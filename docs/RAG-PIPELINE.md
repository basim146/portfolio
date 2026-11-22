# RAG pipeline (Module 4)

**Goal:** answer visitors' questions about Muhammad Basim using only information from his CV and projects, and never invent facts.

```
CV / projects / skills / education / links
        │  (written once as short labelled passages)
        ▼
 1. COLLECT   api/_lib/knowledge.json  (17 passages: profile, education, certifications, skills, each project, contact + links, services…)
        ▼
 2. CHUNK     each passage is one small chunk with id, title and zone (the page section it belongs to)
        ▼
 3. EMBED     Gemini embedding model (gemini-embedding-001) turns every chunk into a vector
        ▼
 4. INDEX     vectors are kept in an in-memory vector index (built on the first request, reused while the server is warm)
        ▼
 5. RETRIEVE  the visitor's question is embedded the same way; cosine similarity picks the top 4 chunks; scores below 0.55 are dropped
        ▼
 6. GENERATE  Gemini (gemini-2.5-flash) receives ONLY those chunks + the question and must answer from them, in the visitor's language, in under 90 words
        ▼
 7. CITE      the answer comes back with the matching chunks; the chat shows "See: …" links that jump to the right section of the page
```

## Not inventing facts
- If retrieval finds nothing above the threshold, the server answers with a fixed "I don't have that information" message (translated into the six site languages) without calling the LLM.
- The prompt tells the model to use only the context, to reply with that same message when the context lacks the answer, and to ignore instructions hidden in the question.
- Without `GEMINI_API_KEY` the app falls back to keyword (TF-IDF) retrieval and quotes the best chunk word for word, so it cannot hallucinate.

## Safety
Messages are limited to 500 characters and 20 per minute per visitor; the API key lives in an environment variable and never reaches the browser.

## Extra credit built on top
Multilingual answers (English, Urdu, French, Turkish, German, Arabic), voice questions (browser speech recognition), spoken answers (speech synthesis), source citations.

## Updating the knowledge
Edit `api/_lib/knowledge.json` (add or change a passage), redeploy. No other step is needed because the index is rebuilt automatically.
