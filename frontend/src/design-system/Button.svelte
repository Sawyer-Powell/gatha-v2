<script lang="ts">
    import type { Snippet } from "svelte";
    import {
        buttonPressedVariants,
        buttonShapeVariants,
        buttonVariants,
    } from "./design-system.css";
    let { variant = "primary", shape = "pill", pressed = false, loading = false, ariaLabel, onclick, children }: {
        variant?: "primary" | "secondary" | "ghost";
        shape?: "pill" | "square" | "circle";
        pressed?: boolean;
        loading?: boolean;
        ariaLabel?: string;
        onclick?: () => void;
        children: Snippet;
    } = $props();

    const variantKey = $derived(loading ? `${variant}-loading` as const : variant);
</script>

<button
    class="{buttonVariants[variantKey]} {buttonShapeVariants[shape]} {pressed
        ? buttonPressedVariants[variant]
        : ''}"
    aria-pressed={pressed}
    aria-label={ariaLabel}
    {onclick}
>
    {@render children()}
</button>
