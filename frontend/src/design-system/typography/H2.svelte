<script lang="ts">
    import type { Snippet } from "svelte";
    import { h2 } from "./headings.css";
    let { children }: { children: Snippet } = $props();
</script>

<h2 class={h2}>{@render children()}</h2>
