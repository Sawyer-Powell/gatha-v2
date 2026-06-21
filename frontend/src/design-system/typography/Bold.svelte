<script lang="ts">
    import type { Snippet } from "svelte";
    import { bold } from "../design-system.css";
    let { classname = "", children }: {
        classname?: string;
        children: Snippet;
    } = $props();
</script>

<strong class="{bold} {classname}">{@render children()}</strong>
