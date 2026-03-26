import { describe, it, expect } from "vitest";
import { applyDiff } from "$lib/utils/applyDiff";

describe("applyDiff", () => {
  describe("primitives", () => {
    it("applies changed string", () => {
      const state = { username: "", password: "" };
      applyDiff(state, { username: "Alice", password: null });
      expect(state.username).toBe("Alice");
      expect(state.password).toBe("");
    });

    it("applies changed boolean", () => {
      const state = { flag: false, count: 0, score: 0.0 };
      applyDiff(state, { flag: true, count: 0, score: 0.0 });
      expect(state.flag).toBe(true);
    });

    it("applies changed number", () => {
      const state = { flag: false, count: 0, score: 0.0 };
      applyDiff(state, { flag: null, count: 42, score: 3.14 });
      expect(state.count).toBe(42);
      expect(state.score).toBe(3.14);
    });

    it("skips null fields", () => {
      const state = { username: "Alice", password: "secret" };
      applyDiff(state, { username: null, password: null });
      expect(state.username).toBe("Alice");
      expect(state.password).toBe("secret");
    });
  });

  describe("enums", () => {
    it("skips NoChange", () => {
      const state = { status: "Idle" };
      applyDiff(state, { status: "NoChange" });
      expect(state.status).toBe("Idle");
    });

    it("applies unit variant change", () => {
      const state = { status: "Idle" };
      applyDiff(state, { status: "Active" });
      expect(state.status).toBe("Active");
    });

    it("applies data variant change", () => {
      const state = { status: "Idle" };
      applyDiff(state, { status: { Error: "timeout" } });
      expect(state.status).toEqual({ Error: "timeout" });
    });

    it("applies data variant to unit variant", () => {
      const state = { status: { Error: "timeout" } };
      applyDiff(state, { status: "Idle" });
      expect(state.status).toBe("Idle");
    });
  });

  describe("options", () => {
    it("skips NoChange", () => {
      const state = { maybe: null };
      applyDiff(state, { maybe: "NoChange" });
      expect(state.maybe).toBe(null);
    });

    it("applies None", () => {
      const state = { maybe: "hello" as string | null };
      applyDiff(state, { maybe: "None" });
      expect(state.maybe).toBe(null);
    });

    it("applies Some", () => {
      const state = { maybe: null as string | null };
      applyDiff(state, { maybe: { Some: "hello" } });
      expect(state.maybe).toBe("hello");
    });

    it("applies Some change", () => {
      const state = { maybe: "hello" as string | null };
      applyDiff(state, { maybe: { Some: "world" } });
      expect(state.maybe).toBe("world");
    });
  });

  describe("nested structs", () => {
    it("applies nested field change", () => {
      const state = { inner: { value: 1 }, label: "hello" };
      applyDiff(state, { inner: { value: 2 }, label: null });
      expect(state.inner.value).toBe(2);
      expect(state.label).toBe("hello");
    });

    it("applies outer field change only", () => {
      const state = { inner: { value: 1 }, label: "hello" };
      applyDiff(state, { inner: { value: 0 }, label: "world" });
      expect(state.label).toBe("world");
    });
  });

  describe("vecs", () => {
    it("skips empty diff", () => {
      const state = { items: ["a", "b"] };
      applyDiff(state, { items: [] });
      expect(state.items).toEqual(["a", "b"]);
    });

    it("applies Inserted", () => {
      const state = { items: ["a", "b"] };
      applyDiff(state, {
        items: [{ Inserted: { index: 2, changes: ["c"] } }],
      });
      expect(state.items).toEqual(["a", "b", "c"]);
    });

    it("applies Removed", () => {
      const state = { items: ["a", "b", "c"] };
      applyDiff(state, {
        items: [{ Removed: { index: 2, len: 1 } }],
      });
      expect(state.items).toEqual(["a", "b"]);
    });

    it("applies Altered", () => {
      const state = { items: ["a", "b"] };
      applyDiff(state, {
        items: [{ Altered: { index: 0, changes: ["x"] } }],
      });
      expect(state.items).toEqual(["x", "b"]);
    });

    it("applies insert from empty", () => {
      const state = { items: [] as string[] };
      applyDiff(state, {
        items: [{ Inserted: { index: 0, changes: ["a", "b"] } }],
      });
      expect(state.items).toEqual(["a", "b"]);
    });

    it("applies remove all", () => {
      const state = { items: ["a", "b"] };
      applyDiff(state, {
        items: [{ Removed: { index: 0, len: 2 } }],
      });
      expect(state.items).toEqual([]);
    });

    it("applies reorder (remove + insert)", () => {
      const state = { items: ["a", "b"] };
      applyDiff(state, {
        items: [
          { Removed: { index: 0, len: 1 } },
          { Inserted: { index: 2, changes: ["a"] } },
        ],
      });
      expect(state.items).toEqual(["b", "a"]);
    });

    it("applies multi insert", () => {
      const state = { items: ["a"] };
      applyDiff(state, {
        items: [{ Inserted: { index: 1, changes: ["b", "c"] } }],
      });
      expect(state.items).toEqual(["a", "b", "c"]);
    });
  });

  describe("vec of structs", () => {
    it("applies Altered with struct diff", () => {
      const state = { items: [{ name: "apple", qty: 1 }] };
      applyDiff(state, {
        items: [{ Altered: { index: 0, changes: [{ name: null, qty: 2 }] } }],
      });
      expect(state.items[0]).toEqual({ name: "apple", qty: 2 });
    });

    it("applies Inserted struct", () => {
      const state = { items: [{ name: "apple", qty: 1 }] };
      applyDiff(state, {
        items: [
          { Inserted: { index: 1, changes: [{ name: "banana", qty: 2 }] } },
        ],
      });
      expect(state.items).toEqual([
        { name: "apple", qty: 1 },
        { name: "banana", qty: 2 },
      ]);
    });
  });

  describe("hashmaps", () => {
    it("skips no change", () => {
      const state = { data: { key1: "val1", key2: "val2" } };
      applyDiff(state, { data: { altered: {}, removed: [] } });
      expect(state.data).toEqual({ key1: "val1", key2: "val2" });
    });

    it("applies altered", () => {
      const state = { data: { key1: "val1", key2: "val2" } };
      applyDiff(state, { data: { altered: { key1: "changed" }, removed: [] } });
      expect(state.data).toEqual({ key1: "changed", key2: "val2" });
    });

    it("applies removed", () => {
      const state = { data: { key1: "val1", key2: "val2" } };
      applyDiff(state, { data: { altered: {}, removed: ["key2"] } });
      expect(state.data).toEqual({ key1: "val1" });
    });

    it("applies add key", () => {
      const state = { data: { key1: "val1" } };
      applyDiff(state, { data: { altered: { key2: "val2" }, removed: [] } });
      expect(state.data).toEqual({ key1: "val1", key2: "val2" });
    });

    it("applies empty to items", () => {
      const state = { data: {} as Record<string, string> };
      applyDiff(state, {
        data: { altered: { key1: "val1", key2: "val2" }, removed: [] },
      });
      expect(state.data).toEqual({ key1: "val1", key2: "val2" });
    });
  });
});
