<script lang="ts">
    import type { Snippet } from "svelte";
    import { gridGap } from "./design-system.css";
    let { cols = 2, gap = "md", children }: {
        cols?: number;
        gap?: "xs" | "sm" | "md" | "lg" | "xl";
        children: Snippet;
    } = $props();
</script>

<div class={gridGap[gap]} style="display: grid; grid-template-columns: repeat({cols}, 1fr);">
    {@render children()}
</div>
