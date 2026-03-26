<script lang="ts">
    import type { Snippet } from "svelte";
    import { modalBackdrop, modalContent } from "./design-system.css";
    let { open = false, children }: {
        open: boolean;
        children: Snippet;
    } = $props();

    $effect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    });
</script>

<div class={modalBackdrop} data-open={open}>
    <div class={modalContent}>
        {@render children()}
    </div>
</div>
