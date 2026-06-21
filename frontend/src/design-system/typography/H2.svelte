<script lang="ts">
    import type { Snippet } from "svelte";
    import { h2 } from "./headings.css";
    let { classname = "", children }: {
        classname?: string;
        children: Snippet;
    } = $props();
</script>

<h2 class="{h2} {classname}">{@render children()}</h2>
