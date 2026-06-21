<script module lang="ts">
    export interface ProgressBarProps {
        value?: number;
        ariaLabel?: string;
        classname?: string;
    }
</script>

<script lang="ts">
    import { progressBar } from "./design-system.css";

    let {
        value = 0,
        ariaLabel = "Progress",
        classname = "",
    }: ProgressBarProps = $props();

    const ratio = $derived(Math.min(1, Math.max(0, value)));
</script>

<span
    class="{progressBar} {classname}"
    role="progressbar"
    aria-label={ariaLabel}
    aria-valuemin="0"
    aria-valuemax="100"
    aria-valuenow={Math.round(ratio * 100)}
    style={`--progress-ratio: ${ratio}`}
></span>
