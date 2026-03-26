<script lang="ts">
    import type { Snippet } from "svelte";
    import { cardPadding } from "./design-system.css";
    let {
        padding = "md",
        children,
    }: {
        padding?: "sm" | "md" | "lg" | "xl";
        children: Snippet;
    } = $props();
</script>

<div class={cardPadding[padding]}>
    {@render children()}
</div>
