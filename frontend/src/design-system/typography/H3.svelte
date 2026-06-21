<script lang="ts">
    import type { Snippet } from "svelte";
    import { h3 } from "./headings.css";
    let { classname = "", children }: {
        classname?: string;
        children: Snippet;
        } = $props();
</script>

<h3 class="{h3} {classname}">{@render children()}</h3>
