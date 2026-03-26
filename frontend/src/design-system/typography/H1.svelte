<script lang="ts">
    import type { Snippet } from "svelte";
    import { h1 } from "./headings.css";
    let { children }: { children: Snippet } = $props();
</script>

<h1 class={h1}>
    {@render children()}
</h1>
