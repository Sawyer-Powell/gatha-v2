<script lang="ts">
    import type { Snippet } from "svelte";
    import { italic } from "./design-system.css";
    let { classname = "", children }: {
        classname?: string;
        children: Snippet;
    } = $props();
</script>

<em class="{italic} {classname}">{@render children()}</em>
