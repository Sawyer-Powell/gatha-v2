<script lang="ts">
    import type { Snippet } from "svelte";
    import { vstack, vstackGap, alignVariants } from "./design-system.css";
    let { gap = "md", align = "stretch", children }: {
        gap?: "xs" | "sm" | "md" | "lg" | "xl";
        align?: "start" | "center" | "end" | "stretch";
        children: Snippet;
    } = $props();
</script>

<div class="{vstack} {vstackGap[gap]} {alignVariants[align]}">
    {@render children()}
</div>
