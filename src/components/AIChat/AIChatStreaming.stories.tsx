/*
 * STORYBOOK ONLY — a faux-streaming conversation.
 *
 * Nothing here ships (tsup excludes *.stories.tsx) and nothing here is real AI:
 * replies are scripted and "streamed" word by word on timers, the way AI
 * product sites and design-system demos fake it.
 *
 * It doubles as the reference for the consumer side of the boundary. Read it
 * as the code a consuming app writes:
 *
 *   - `FauxMessage` / `FauxPart` stand in for the AI SDK's UIMessage parts. The
 *     design system never sees them.
 *   - `renderPart` is the consumer's ordinary `parts.map` switch — the ONE place
 *     SDK-shaped state becomes design-system props (`toToolState`).
 *   - Every clock is ticked HERE (`useNow`), every string is formatted HERE,
 *     and the context figures are kept in range HERE. The components only draw.
 *   - Markdown is rendered by Streamdown, the consumer's choice of renderer;
 *     AITextPart and the thinking transcript style its output via ds-chat-prose
 *     and animate it via `streamingAnimation` — Streamdown's own word
 *     animation stays OFF, so nothing here depends on it.
 */
import type { Meta, StoryObj } from "@storybook/react";
import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Streamdown } from "streamdown";
import { Button } from "../Button";
import { ButtonSize, ButtonVariant } from "../Button/constants";
import { IconSize, PlusIcon } from "../Icons";
import { BodyText, FontWeights } from "../Text";
import { AIContextGauge } from "./AIContextGauge";
import {
  STORY_EFFORT_STEPS,
  STORY_MODELS,
  StoryModelSelect,
} from "./AIModelSelect.stories";
import {
  AIPromptInput,
  AIPromptInputSubmit,
  AIPromptInputTextarea,
  AIPromptInputToolbar,
  AIPromptInputToolbarEnd,
  AIPromptInputToolbarStart,
} from "./AIPromptInput";
import { AITextPart } from "./AITextPart";
import { AIThinkingPart } from "./AIThinkingPart";
import { AIToolPart } from "./AIToolPart";
import { AITurnSummary } from "./AITurnSummary";
import { ChatDivider } from "./ChatDivider";
import {
  AIThinkingPartState,
  AIToolPartState,
  AIToolPartVariant,
} from "./constants";
import { UserMessageHeader } from "./UserMessageHeader";

// ── The consumer's message shape (an AI SDK stand-in) ─────────────────────────

type FauxPart =
  | { type: "text"; text: string; state: "streaming" | "done" }
  | {
      type: "reasoning";
      text: string;
      state: "streaming" | "done";
      startedAt: number;
      endedAt?: number;
    }
  | {
      type: "tool";
      toolName: keyof typeof TOOL_COPY;
      subject: string;
      state: "input-available" | "output-available" | "output-error";
      startedAt: number;
      endedAt?: number;
      tokens: number;
      errorText?: string;
    };

type FauxMessage = {
  id: string;
  role: "user" | "assistant";
  parts: FauxPart[];
  meta: {
    modelId: string;
    effort: string;
    startedAt: number;
    endedAt?: number;
    tokens?: number;
  };
};

// ── Scripts: what the fake model "says" ───────────────────────────────────────

type ScriptStep =
  | { kind: "reasoning"; text: string }
  | {
      kind: "tool";
      toolName: keyof typeof TOOL_COPY;
      subject: string;
      ms: number;
      fail?: string;
    }
  | { kind: "text"; text: string };

const SCRIPTS: ScriptStep[][] = [
  [
    {
      kind: "reasoning",
      text: "The user wants standard technical drawing annotations on the imported model. Before placing anything I should check what is already on the canvas, then load the **dimensioning practice** guidance so the dimensions follow convention.",
    },
    { kind: "tool", toolName: "view", subject: "ball bearing housing", ms: 1400 },
    { kind: "tool", toolName: "skill", subject: "dimensioning practice", ms: 500 },
    {
      kind: "text",
      text: `I’ve looked over the housing. Here’s the plan before I start drawing:

## Views
1. **Front view** — the bore and both mounting flanges
2. **Section A–A** — through the bearing seat, to show the shoulder depth
3. **Top view** — bolt-hole pattern only

## Dimensions
- Bore: \`Ø52 H7\` with a *true position* callout
- Flange thickness and overall length, chained from the datum face
- Bolt circle as \`4× Ø9 EQ SP on PCD 80\`

> Tolerances default to ISO 2768-m unless you tell me otherwise.

Shall I go ahead and place these on the sheet?`,
    },
  ],
  [
    {
      kind: "reasoning",
      text: "They want a quick dimension table. I'll read the current selection so the numbers match the model rather than guessing.",
    },
    { kind: "tool", toolName: "read", subject: "selection (14 entities)", ms: 1100 },
    {
      kind: "text",
      text: `Here are the key dimensions from the selection:

| Feature | Nominal | Tolerance |
| --- | --- | --- |
| Bore | Ø52 | H7 |
| Flange | 12 | ±0.1 |
| Overall length | 86 | ±0.2 |

The bolt holes are all **Ø9** on an 80 mm pitch circle.`,
    },
  ],
  [
    {
      kind: "reasoning",
      text: "Adding a leader to the chamfer. The drawing host has been flaky; if the call fails I should say so plainly rather than retry silently.",
    },
    {
      kind: "tool",
      toolName: "draw",
      subject: "chamfer leader",
      ms: 1600,
      fail: "Host disconnected",
    },
    {
      kind: "text",
      text: `I couldn’t place the leader — the drawing host dropped the connection mid-command, so **nothing was changed** on the sheet.

Reconnect AutoCAD and ask again, and I’ll pick up from the chamfer:

\`\`\`text
LEADER  →  pick chamfer edge  →  "1 × 45°"
\`\`\``,
    },
  ],
];

/* The consumer's copy for each tool, in each state. */
const TOOL_COPY = {
  view: {
    active: (s: string) => `Viewing ${s}`,
    done: (s: string) => `Viewed ${s}`,
  },
  read: {
    active: (s: string) => `Reading ${s}`,
    done: (s: string) => `Read ${s}`,
  },
  draw: {
    active: (s: string) => `Drawing ${s}`,
    done: (s: string) => `Drew ${s}`,
  },
  skill: {
    active: (s: string) => `Reading ${s} skill`,
    done: (s: string) => `Read ${s} skill`,
  },
} as const;

// ── Faux streaming engine ─────────────────────────────────────────────────────

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason);
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });

/** Split into 1–3 word chunks, keeping whitespace, like a token stream. */
function toChunks(text: string) {
  const words = text.match(/\S+\s*/g) ?? [];
  const chunks: string[] = [];
  for (let i = 0; i < words.length; ) {
    const n = 1 + Math.floor(Math.random() * 3);
    chunks.push(words.slice(i, i + n).join(""));
    i += n;
  }
  return chunks;
}

const estimateTokens = (text: string) =>
  Math.round((text.match(/\S+/g)?.length ?? 0) * 1.3);

let nextId = 0;
const newId = () => `m${++nextId}`;

type Patch = (id: string, fn: (m: FauxMessage) => FauxMessage) => void;

const patchLastPart = (
  m: FauxMessage,
  fn: (p: FauxPart) => FauxPart,
): FauxMessage => ({ ...m, parts: [...m.parts.slice(0, -1), fn(m.parts.at(-1)!)] });

async function playScript(
  id: string,
  script: ScriptStep[],
  patch: Patch,
  signal: AbortSignal,
) {
  for (const step of script) {
    if (step.kind === "tool") {
      patch(id, (m) => ({
        ...m,
        parts: [
          ...m.parts,
          {
            type: "tool",
            toolName: step.toolName,
            subject: step.subject,
            state: "input-available",
            startedAt: Date.now(),
            tokens: 80 + Math.floor(Math.random() * 300),
          },
        ],
      }));
      await sleep(step.ms, signal);
      patch(id, (m) =>
        patchLastPart(m, (p) =>
          p.type === "tool"
            ? {
                ...p,
                state: step.fail ? "output-error" : "output-available",
                errorText: step.fail,
                endedAt: Date.now(),
              }
            : p,
        ),
      );
      continue;
    }

    const startedAt = Date.now();
    patch(id, (m) => ({
      ...m,
      parts: [
        ...m.parts,
        step.kind === "reasoning"
          ? { type: "reasoning", text: "", state: "streaming", startedAt }
          : { type: "text", text: "", state: "streaming" },
      ],
    }));
    // Reasoning streams a touch slower than prose, as it does in practice.
    const pace = step.kind === "reasoning" ? 55 : 28;
    for (const chunk of toChunks(step.text)) {
      await sleep(pace + Math.random() * pace, signal);
      patch(id, (m) =>
        patchLastPart(m, (p) =>
          p.type === "tool" ? p : { ...p, text: p.text + chunk },
        ),
      );
    }
    patch(id, (m) =>
      patchLastPart(m, (p) =>
        p.type === "reasoning"
          ? { ...p, state: "done", endedAt: Date.now() }
          : p.type === "text"
            ? { ...p, state: "done" }
            : p,
      ),
    );
  }
}

/** Settle whatever was in flight — what a real stop leaves behind. */
function settle(m: FauxMessage): FauxMessage {
  const now = Date.now();
  const parts = m.parts.map((p): FauxPart => {
    if (p.type === "tool" && p.state === "input-available")
      return { ...p, state: "output-error", errorText: "Stopped", endedAt: now };
    if (p.type === "reasoning" && p.state === "streaming")
      return { ...p, state: "done", endedAt: now };
    if (p.type === "text" && p.state === "streaming")
      return { ...p, state: "done" };
    return p;
  });
  const tokens = parts.reduce(
    (sum, p) =>
      sum + (p.type === "tool" ? p.tokens : estimateTokens(p.text)),
    0,
  );
  return { ...m, parts, meta: { ...m.meta, endedAt: now, tokens } };
}

// ── The consumer's clock and formatting ───────────────────────────────────────

/** Ticks only while something is live. The components hold no timers. */
function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(timer);
  }, [active]);
  return now;
}

const seconds = (ms: number) => Math.max(1, Math.round(ms / 1000));
const fmtTool = (ms: number) =>
  ms < 10_000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms / 1000)}s`;
const fmtTokens = (n: number) =>
  n < 1000 ? `${n} tokens` : `${(n / 1000).toFixed(1)}k tokens`;
const fmtWorked = (ms: number) => {
  const s = Math.round(ms / 1000);
  return s >= 60 ? `Worked for ${Math.floor(s / 60)}m ${s % 60}s` : `Worked for ${s}s`;
};

/* SDK state → design-system state. The whole of the "adapter". */
const toToolState = (state: Extract<FauxPart, { type: "tool" }>["state"]) =>
  state === "input-available"
    ? AIToolPartState.active
    : state === "output-error"
      ? AIToolPartState.error
      : AIToolPartState.complete;

const Markdown = ({ text, live }: { text: string; live: boolean }) => (
  <Streamdown
    mode={live ? "streaming" : "static"}
    isAnimating={live}
    controls={false}
  >
    {text}
  </Streamdown>
);

// ── The consumer's parts.map ──────────────────────────────────────────────────

function renderPart(part: FauxPart, now: number): ReactNode {
  switch (part.type) {
    case "text":
      return (
        <AITextPart streamingAnimation={part.state === "streaming"}>
          <Markdown text={part.text} live={part.state === "streaming"} />
        </AITextPart>
      );

    case "reasoning": {
      const live = part.state === "streaming";
      const elapsed = (part.endedAt ?? now) - part.startedAt;
      return (
        <AIThinkingPart
          state={live ? AIThinkingPartState.thinking : AIThinkingPartState.thought}
          label={live ? "Thinking" : `Thought for ${seconds(elapsed)}s`}
          meta={
            live
              ? `${seconds(elapsed)}s • ${fmtTokens(estimateTokens(part.text))}`
              : undefined
          }
          streamingAnimation={live}
        >
          {part.text ? <Markdown text={part.text} live={live} /> : undefined}
        </AIThinkingPart>
      );
    }

    case "tool": {
      const state = toToolState(part.state);
      const copy = TOOL_COPY[part.toolName];
      const elapsed = (part.endedAt ?? now) - part.startedAt;
      if (state === AIToolPartState.error) {
        return (
          <AIToolPart state={state} meta={part.errorText}>
            Failed to use tool
          </AIToolPart>
        );
      }
      return (
        <AIToolPart
          state={state}
          variant={
            part.toolName === "skill"
              ? AIToolPartVariant.skill
              : AIToolPartVariant.simple
          }
          meta={`${fmtTool(elapsed)} • ${fmtTokens(part.tokens)}`}
        >
          {state === AIToolPartState.active
            ? copy.active(part.subject)
            : copy.done(part.subject)}
        </AIToolPart>
      );
    }
  }
}

const textOf = (m: FauxMessage) =>
  m.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .filter(Boolean)
    .join("\n\n");

const modelLabel = (id: string) =>
  STORY_MODELS.find((m) => m.id === id)?.label ?? id;
const effortLabel = (value: string) =>
  STORY_EFFORT_STEPS.find((s) => s.value === value)?.label ?? value;

// ── The chat panel ────────────────────────────────────────────────────────────

const CONTEXT_BUDGET = 200_000;
/* The history the prompt re-sends each turn, as a consumer would estimate it. */
const SYSTEM_PROMPT_TOKENS = 3_200;

function FauxChat({ autoSend }: { autoSend?: string }) {
  const [messages, setMessages] = useState<FauxMessage[]>([]);
  const [responding, setResponding] = useState(false);
  const [modelId, setModelId] =
    useState<(typeof STORY_MODELS)[number]["id"]>("opus-5");
  const [effort, setEffort] = useState("medium");
  const abortRef = useRef<AbortController | null>(null);
  const scriptIndex = useRef(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const stickToBottom = useRef(true);
  const now = useNow(responding);

  const patch = useCallback<Patch>((id, fn) => {
    setMessages((all) => all.map((m) => (m.id === id ? fn(m) : m)));
  }, []);

  const send = useCallback(
    async (text: string) => {
      const started = Date.now();
      const assistantId = newId();
      const meta = { modelId, effort, startedAt: started };
      setMessages((all) => [
        ...all,
        {
          id: newId(),
          role: "user",
          parts: [{ type: "text", text, state: "done" }],
          meta,
        },
        { id: assistantId, role: "assistant", parts: [], meta },
      ]);
      stickToBottom.current = true;
      setResponding(true);

      const controller = new AbortController();
      abortRef.current = controller;
      const script = SCRIPTS[scriptIndex.current++ % SCRIPTS.length];
      try {
        // "Submitted": a beat before the first token, as a real request has.
        await sleep(450, controller.signal);
        await playScript(assistantId, script, patch, controller.signal);
      } catch {
        // Aborted — settle() below records whatever had arrived.
      } finally {
        patch(assistantId, settle);
        setResponding(false);
        abortRef.current = null;
      }
    },
    [modelId, effort, patch],
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);

  useEffect(() => () => abortRef.current?.abort(), []);

  const didAutoSend = useRef(false);
  useEffect(() => {
    if (autoSend && !didAutoSend.current) {
      didAutoSend.current = true;
      void send(autoSend);
    }
  }, [autoSend, send]);

  // Follow the stream unless the reader has scrolled up.
  useEffect(() => {
    const el = scrollRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Context in use: the consumer's estimate, kept inside the budget by the
  // consumer — the gauge itself never clamps.
  const used = Math.min(
    messages.length === 0
      ? 0
      : SYSTEM_PROMPT_TOKENS +
          messages.reduce(
            (sum, m) =>
              sum +
              m.parts.reduce(
                (s, p) =>
                  s + (p.type === "tool" ? p.tokens : estimateTokens(p.text)),
                0,
              ),
            0,
          ),
    CONTEXT_BUDGET,
  );

  // Group into turns: each user message heads the assistant replies after it.
  const turns: FauxMessage[][] = [];
  for (const m of messages) {
    if (m.role === "user" || turns.length === 0) turns.push([m]);
    else turns[turns.length - 1].push(m);
  }

  return (
    <div className="flex h-[720px] w-[460px] flex-col overflow-hidden rounded-normal border border-solid border-border-primary bg-surface-page">
      <div
        ref={scrollRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          stickToBottom.current =
            el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        }}
        className="relative flex min-h-0 flex-1 flex-col overflow-y-auto px-rg"
      >
        {turns.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <BodyText className="text-text-tertiary">
              Ask anything — replies are scripted and faux-streamed.
            </BodyText>
          </div>
        ) : (
          <div className="flex flex-col gap-md pb-md pt-rg">
            <ChatDivider>Today</ChatDivider>
            {turns.map((turn, index) => {
              const [head, ...replies] = turn;
              const previous = turns[index - 1]?.[0];
              const switched =
                previous &&
                (previous.meta.modelId !== head.meta.modelId ||
                  previous.meta.effort !== head.meta.effort);
              return (
                // Each turn is its own container, so its sticky header is
                // pushed away by the next turn's — the consumer's layout.
                <div key={head.id} className="flex flex-col gap-rg">
                  {switched ? (
                    <ChatDivider>
                      Switched to{" "}
                      <BodyText as="span" fontWeight={FontWeights.medium}>
                        {modelLabel(head.meta.modelId)}
                      </BodyText>{" "}
                      {effortLabel(head.meta.effort)}
                    </ChatDivider>
                  ) : null}
                  <div className="sticky top-0 z-10 bg-surface-page pt-xs">
                    <UserMessageHeader className="line-clamp-4">
                      {textOf(head)}
                    </UserMessageHeader>
                  </div>
                  {replies.map((reply) => {
                    const settled = reply.meta.endedAt !== undefined;
                    return (
                      <Fragment key={reply.id}>
                        {reply.parts.map((part, i) => (
                          <Fragment key={i}>{renderPart(part, now)}</Fragment>
                        ))}
                        {settled ? (
                          <AITurnSummary
                            label={fmtWorked(
                              reply.meta.endedAt! - reply.meta.startedAt,
                            )}
                            meta={fmtTokens(reply.meta.tokens ?? 0)}
                            copyValue={textOf(reply)}
                          />
                        ) : null}
                      </Fragment>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="px-rg pb-rg">
        <AIPromptInput
          onSubmit={(text) => void send(text)}
          responding={responding}
          onStop={stop}
        >
          <AIPromptInputTextarea placeholder="Ask Aspect" />
          <AIPromptInputToolbar>
            <AIPromptInputToolbarStart>
              <Button
                variant={ButtonVariant.secondary}
                size={ButtonSize.iconSm}
                aria-label="More actions"
              >
                <PlusIcon size={IconSize.md} />
              </Button>
              <AIContextGauge
                used={used}
                budget={CONTEXT_BUDGET}
                aria-label="Context used"
              />
            </AIPromptInputToolbarStart>
            <AIPromptInputToolbarEnd>
              <StoryModelSelect
                modelId={modelId}
                onModelChange={setModelId}
                effort={effort}
                onEffortChange={setEffort}
              />
              <AIPromptInputSubmit />
            </AIPromptInputToolbarEnd>
          </AIPromptInputToolbar>
        </AIPromptInput>
      </div>
    </div>
  );
}

const meta = {
  title: "AI Chat/Streaming Demo",
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Starts streaming a reply on load. Send more to cycle through the scripts —
 * the third one fails a tool call; change the model between turns to see the
 * switch divider; press stop mid-stream to see what a stop leaves behind. */
export const Conversation: Story = {
  render: () => (
    <FauxChat autoSend="Take this model of a ball bearing housing and mark it up with standard technical drawing annotations and dimensions." />
  ),
};

/** An empty chat, for trying the composer from scratch. */
export const EmptyChat: Story = {
  render: () => <FauxChat />,
};
