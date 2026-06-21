<script lang="ts">
    import type { Snippet } from "svelte";
    import { vstack, vstackGap, alignVariants } from "./design-system.css";
    let { gap = "md", align = "stretch", classname = "", children }: {
        gap?: "xs" | "sm" | "md" | "lg" | "xl";
        align?: "start" | "center" | "end" | "stretch";
        classname?: string;
        children: Snippet;
    } = $props();
</script>

<div class="{vstack} {vstackGap[gap]} {alignVariants[align]} {classname}">
    {@render children()}
</div>
