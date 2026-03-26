<script lang="ts">
    import type { Snippet } from "svelte";
    import { h4 } from "./headings.css";
    let { children }: { children: Snippet } = $props();
</script>

<h4 class={h4}>{@render children()}</h4>
