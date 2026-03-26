<script lang="ts">
    import type { Snippet } from "svelte";
    import { buttonVariants } from "./design-system.css";
    let { variant = "primary", loading = false, onclick, children }: {
        variant?: "primary" | "secondary" | "ghost";
        loading?: boolean;
        onclick?: () => void;
        children: Snippet;
    } = $props();

    const variantKey = $derived(loading ? `${variant}-loading` as const : variant);
</script>

<button class={buttonVariants[variantKey]} {onclick}>
    {@render children()}
</button>
