<script lang="ts">
    import type { Snippet } from "svelte";
    import { link, textSize } from "../design-system.css";
    let { href, size = "md", classname = "", children }: {
        href: string;
        size?: "xs" | "sm" | "md" | "lg";
        classname?: string;
        children: Snippet;
    } = $props();
</script>

<a class="{link} {textSize[size]} {classname}" {href}>{@render children()}</a>
