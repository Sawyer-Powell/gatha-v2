<script lang="ts">
    import type { Snippet } from "svelte";
    import {
        hstack,
        hstackGap,
        alignVariants,
        justifyVariants,
    } from "./design-system.css";
    let {
        gap = "md",
        align = "center",
        justify = "start",
        classname = "",
        children,
    }: {
        gap?: "xs" | "sm" | "md" | "lg" | "xl";
        align?: "start" | "center" | "end" | "stretch";
        justify?: "start" | "center" | "end" | "between";
        children: Snippet;
        classname?: string;
    } = $props();
</script>

<div
    class="{hstack} {hstackGap[gap]} {alignVariants[align]} {justifyVariants[
        justify
    ]} {classname}"
>
    {@render children()}
</div>
