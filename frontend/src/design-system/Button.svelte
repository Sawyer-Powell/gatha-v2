<script lang="ts">
    import type { Snippet } from "svelte";
    import {
        buttonPressedVariants,
        buttonShapeVariants,
        buttonVariants,
    } from "./design-system.css";
    let {
        variant = "primary",
        shape = "pill",
        type = "button",
        pressed = false,
        loading = false,
        disabled = false,
        ariaLabel,
        classname = "",
        onclick,
        onkeydown,
        children,
    }: {
        variant?: "primary" | "secondary" | "ghost";
        shape?: "pill" | "square" | "circle";
        type?: "button" | "submit" | "reset";
        pressed?: boolean;
        loading?: boolean;
        disabled?: boolean;
        ariaLabel?: string;
        classname?: string;
        onclick?: (event: MouseEvent) => void;
        onkeydown?: (event: KeyboardEvent) => void;
        children: Snippet;
    } = $props();

    const variantKey = $derived(
        loading ? (`${variant}-loading` as const) : variant,
    );
</script>

<button
    {type}
    class="{buttonVariants[variantKey]} {buttonShapeVariants[shape]} {pressed
        ? buttonPressedVariants[variant]
        : ''} {classname}"
    aria-pressed={pressed}
    aria-label={ariaLabel}
    aria-busy={loading}
    disabled={disabled || loading}
    {onclick}
    onkeydown={(event) => onkeydown?.(event)}
>
    {@render children()}
</button>
