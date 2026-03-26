<script lang="ts">
    import type { Snippet } from "svelte";
    import { italic } from "./design-system.css";
    let { children }: { children: Snippet } = $props();
</script>

<em class={italic}>{@render children()}</em>
