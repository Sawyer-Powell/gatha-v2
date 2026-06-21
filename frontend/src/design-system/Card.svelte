<script lang="ts">
    import type { Snippet } from "svelte";
    import { cardPadding } from "./design-system.css";
    let {
        padding = "md",
        classname = "",
        children,
    }: {
        padding?: "sm" | "md" | "lg" | "xl";
        classname?: string;
        children: Snippet;
    } = $props();
</script>

<div class="{cardPadding[padding]} {classname}">
    {@render children()}
</div>
