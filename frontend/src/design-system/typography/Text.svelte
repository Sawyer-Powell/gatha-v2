<script lang="ts">
    import type { Snippet } from "svelte";
    import { text, textSize } from "../design-system.css";
    let { size = "md", classname = "", children }: {
        size?: "xs" | "sm" | "md" | "lg";
        classname?: string;
        children: Snippet;
    } = $props();
</script>

<span class="{text} {textSize[size]} {classname}">{@render children()}</span>
