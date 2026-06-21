<script lang="ts">
    import type { Snippet } from "svelte";
    import { h1 } from "./headings.css";
    let { classname = "", children }: {
        classname?: string;
        children: Snippet;
    } = $props();
</script>

<h1 class="{h1} {classname}">
    {@render children()}
</h1>
