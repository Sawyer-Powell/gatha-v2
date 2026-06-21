<script lang="ts">
    import { spacerSize } from "./design-system.css";
    let { size = "md", classname = "" }: {
        size?: "xs" | "sm" | "md" | "lg" | "xl";
        classname?: string;
    } = $props();
</script>

<div class="{spacerSize[size]} {classname}"></div>
