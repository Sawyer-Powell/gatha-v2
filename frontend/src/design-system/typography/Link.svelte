<script lang="ts">
    import type { Snippet } from "svelte";
    import { link, textSize } from "../design-system.css";
    let { href, size = "md", children }: {
        href: string;
        size?: "xs" | "sm" | "md" | "lg";
        children: Snippet;
    } = $props();
</script>

<a class="{link} {textSize[size]}" {href}>{@render children()}</a>
