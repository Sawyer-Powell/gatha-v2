<script lang="ts">
    import { logo } from "./design-system.css";
    let { classname = "" }: { classname?: string } = $props();
</script>

<span class="{logo} {classname}">gatha</span>
