<script lang="ts">
    import type { Snippet } from "svelte";
    import { gridGap } from "./design-system.css";
    let { cols = 2, gap = "md", classname = "", children }: {
        cols?: number;
        gap?: "xs" | "sm" | "md" | "lg" | "xl";
        classname?: string;
        children: Snippet;
    } = $props();
</script>

<div class="{gridGap[gap]} {classname}" style="display: grid; grid-template-columns: repeat({cols}, 1fr);">
    {@render children()}
</div>
