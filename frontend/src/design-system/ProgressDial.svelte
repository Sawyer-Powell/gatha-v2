<script module lang="ts">
    export interface ProgressDialProps {
        value?: number;
        ariaLabel?: string;
        classname?: string;
    }
</script>

<script lang="ts">
    import { progressDial } from "./design-system.css";

    let {
        value = 0,
        ariaLabel = "Progress",
        classname = "",
    }: ProgressDialProps = $props();

    const ratio = $derived(Math.min(1, Math.max(0, value)));
</script>

<span
    class="{progressDial} {classname}"
    role="progressbar"
    aria-label={ariaLabel}
    aria-valuemin="0"
    aria-valuemax="100"
    aria-valuenow={Math.round(ratio * 100)}
    style={`--progress-ratio: ${ratio}; --progress-degrees: ${ratio * 360}deg`}
></span>
