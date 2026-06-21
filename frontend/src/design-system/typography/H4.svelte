<script lang="ts">
    import type { Snippet } from "svelte";
    import { h4 } from "./headings.css";
    let { classname = "", children }: {
        classname?: string;
        children: Snippet;
    } = $props();
</script>

<h4 class="{h4} {classname}">{@render children()}</h4>
