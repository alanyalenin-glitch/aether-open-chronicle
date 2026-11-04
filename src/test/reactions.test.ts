import { describe, expect, it } from "vitest";
import { REACTIONS, normalizePost, reactTo, reactionCount, type Post } from "@/lib/store";

const base: Post = {
  id: "p1",
  userId: "u1",
  text: "hola",
  createdAt: 0,
  reactions: [{ emoji: "👍", userId: "u2" }],
  comments: [],
};

describe("reacciones del feed", () => {
  it("ofrece exactamente los cuatro emojis pedidos", () => {
    expect(REACTIONS).toEqual(["😆", "😍", "😭", "👍"]);
  });

  it("suma el contador del emoji pulsado sin tocar los demás", () => {
    const next = reactTo(base, "me", "😍");
    expect(reactionCount(next, "😍")).toBe(1);
    expect(reactionCount(next, "👍")).toBe(1);
    expect(reactionCount(next, "😆")).toBe(0);
  });

  it("acumula uno por cada persona que reacciona con el mismo emoji", () => {
    let p = reactTo(base, "u1", "😭");
    p = reactTo(p, "u3", "😭");
    expect(reactionCount(p, "😭")).toBe(2);
  });

  it("quitar: volver a pulsar el mismo emoji resta ese contador", () => {
    const once = reactTo(base, "me", "😆");
    expect(reactionCount(once, "😆")).toBe(1);
    expect(reactionCount(reactTo(once, "me", "😆"), "😆")).toBe(0);
  });

  it("cambiar de emoji mueve la reacción de esa persona, no la duplica", () => {
    const second = reactTo(reactTo(base, "me", "😆"), "me", "😍");
    expect(reactionCount(second, "😆")).toBe(0);
    expect(reactionCount(second, "😍")).toBe(1);
    expect(second.reactions.filter((r) => r.userId === "me")).toHaveLength(1);
  });

  it("los 'me gusta' guardados en versiones anteriores pasan a ser 👍", () => {
    const p = normalizePost({ id: "x", userId: "u1", text: "t", createdAt: 1, likes: ["u2", "u3"], comments: [] });
    expect(reactionCount(p, "👍")).toBe(2);
    expect(p.reactions.every((r) => r.emoji === "👍")).toBe(true);
  });
});
