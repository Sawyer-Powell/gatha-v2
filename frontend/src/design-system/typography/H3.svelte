<script lang="ts">
    import type { Snippet } from "svelte";
    import { h3 } from "./headings.css";
    let { children }: { children: Snippet } = $props();
</script>

<h3 class={h3}>{@render children()}</h3>
