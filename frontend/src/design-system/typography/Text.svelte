<script lang="ts">
    import type { Snippet } from "svelte";
    import { text, textSize } from "../design-system.css";
    let { size = "md", children }: {
        size?: "xs" | "sm" | "md" | "lg";
        children: Snippet;
    } = $props();
</script>

<span class="{text} {textSize[size]}">{@render children()}</span>
