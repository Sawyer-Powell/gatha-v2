<script lang="ts">
    import type { Snippet } from "svelte";
    import { bold } from "../design-system.css";
    let { children }: { children: Snippet } = $props();
</script>

<strong class={bold}>{@render children()}</strong>
