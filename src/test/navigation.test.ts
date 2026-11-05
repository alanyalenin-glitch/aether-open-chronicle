import { describe, expect, it } from "vitest";
import { searchLuna, lunaActivity } from "@/lib/navigation";
import type { User, Post } from "@/lib/store";

const user: User = { id: "u1", name: "Lucía Ríos", handle: "lucia", bio: "Música", hue: 185, private: { fullName: "Lucía Elena Ríos Pérez", email: "privado@example.com", birthDate: "1998-01-01", zodiac: "Capricornio", faceVerified: true } };
const post: Post = { id: "p1", userId: "me", text: "Amanecer en la montaña", createdAt: 100, reactions: [], comments: [{ id: "k1", userId: "u1", text: "Precioso", at: 200 }] };
describe("Luna navigation", () => {
  it("finds public users regardless of accents or case", () => {
    expect(searchLuna("LUCIA", [user], []).users.map((u) => u.id)).toEqual(["u1"]);
  });
  it("finds feed posts by text", () => {
    expect(searchLuna("montana", [], [post]).posts.map((p) => p.id)).toEqual(["p1"]);
  });
  it("does not search or return private registration data", () => {
    expect(searchLuna("privado@example.com", [user], []).users).toEqual([]);
    expect(searchLuna("Lucia", [user], []).users[0]).not.toHaveProperty("private");
  });
  it("returns no results for an empty query", () => {
    expect(searchLuna("  ", [user], [post])).toEqual({ users: [], posts: [] });
  });
  it("includes incoming messages and comments on own posts in chronological order", () => {
    const activity = lunaActivity("me", [post], [{ id: "c1", withId: "u1", messages: [{ from: "u1", text: "Hola", at: 300 }] }]);
    expect(activity.map((item) => item.id)).toEqual(["c1", "k1"]);
  });
  it("excludes own messages and comments on other users posts", () => {
    expect(lunaActivity("me", [{ ...post, userId: "u2" }], [{ id: "c1", withId: "u1", messages: [{ from: "me", text: "Hola", at: 300 }] }])).toEqual([]);
  });
});