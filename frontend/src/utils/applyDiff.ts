export function hashmap(value: any): boolean {
  let keys = Object.keys(value);
  return keys.includes("altered") && keys.includes("removed");
}

type HashMapUpdate = {
  altered: any[];
  removed: string[];
};

function apply_hashmap_update(source: any, value: HashMapUpdate) {
  for (var [k, v] of Object.entries(value.altered)) {
    source[k] = v;
  }
  for (var removed of value.removed) {
    delete source[removed];
  }
}

export function option(value: any): boolean {
  return value == "None" || value == "Some";
}

export function array(value: any): boolean {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    (Object.keys(value[0]).includes("Inserted") ||
      Object.keys(value[0]).includes("Removed") ||
      Object.keys(value[0]).includes("Altered"))
  );
}

type VecOfStructs =
  | { Inserted: { index: number; changes: any[] } }
  | { Removed: { index: number; len: number } }
  | { Altered: { index: number; changes: (string | number | Object)[] } };

function apply_vec_update(store: any[], value: VecOfStructs) {
  if ("Inserted" in value) {
    store.splice(value.Inserted.index, 0, ...value.Inserted.changes);
  } else if ("Removed" in value) {
    store.splice(value.Removed.index, value.Removed.len);
  } else if ("Altered" in value) {
    for (var [i, v] of value.Altered.changes.entries()) {
      const idx = value.Altered.index + i;
      if (
        typeof v === "object" &&
        v !== null &&
        typeof store[idx] === "object"
      ) {
        applyDiff(store[idx], v);
      } else {
        store[idx] = v;
      }
    }
  }
}

export function applyDiff(
  store: Record<string, any>,
  diff: Record<string, any>,
) {
  for (const [key, value] of Object.entries(diff)) {
    if (value == null || value == undefined || value === "NoChange") {
      continue;
    }

    if (value === "None") {
      store[key] = null;
    } else if (typeof value === "object" && value !== null && "Some" in value) {
      store[key] = (value as any).Some;
    } else if (hashmap(value)) {
      apply_hashmap_update(store[key], value as HashMapUpdate);
    } else if (array(value)) {
      for (const op of value as VecOfStructs[]) {
        apply_vec_update(store[key], op);
      }
    } else if (typeof value !== "object") {
      store[key] = value;
    } else if (typeof store[key] !== "object" || store[key] === null) {
      store[key] = value;
    } else {
      applyDiff(store[key], value);
    }
  }
}
