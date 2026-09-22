/**
 * OPTIONAL, NOT ENABLED BY DEFAULT extension point.
 *
 * The "Ask Visor" chatbot in this project is a real keyword/full-text
 * search (see search.service.ts) — it does not call any LLM. This file
 * exists only to document where an LLM-backed summarizer could be wired
 * in later, gated behind OPENAI_API_KEY, without pretending that
 * integration exists today.
 *
 * Nothing in this project imports or calls this function. It is dead code
 * on purpose, kept for the roadmap item in docs/ROADMAP.md. If you wire
 * this up, remove this comment and add a real test that exercises it
 * against a live API key before claiming it works.
 */
export async function summarizeWithLlm(_prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'summarizeWithLlm is not enabled: OPENAI_API_KEY is not set, and this function is not called anywhere in the app.',
    );
  }
  throw new Error(
    'summarizeWithLlm is a documented extension point only. Implement the provider call here before using it.',
  );
}
