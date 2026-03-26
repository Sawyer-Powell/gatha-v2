<script lang="ts">
    import { spacerSize } from "./design-system.css";
    let { size = "md" }: { size?: "xs" | "sm" | "md" | "lg" | "xl" } = $props();
</script>

<div class={spacerSize[size]}></div>
