<script module lang="ts">
    export interface TranscriptionBlockProps {
        index: number;
        start: number;
        end: number;
        text: string;
        currentTime: number;
        mediaDuration?: number;
        active?: boolean;
        optionMode?: boolean;
        ontext?: (text: string) => void;
        onseek?: (time: number) => void;
        onselect?: () => void;
    }
</script>

<script lang="ts">
    import { tick } from "svelte";
    import {
        selectableSurface,
        selectableSurfaceActive,
    } from "$lib/design-system/design-system.css";
    import AutoSizeTextarea from "$lib/design-system/AutoSizeTextarea.svelte";
    import RangeInput from "$lib/design-system/RangeInput.svelte";
    import { formatClockTime } from "$lib/utils/time";
    import {
        transcription_block,
        transcription_index,
        transcription_meta,
        transcription_progress_exit,
        transcription_progress_shell,
        transcription_text,
        transcription_textarea,
        transcription_time,
    } from "./workspace.css";

    let {
        index,
        start,
        end,
        text,
        currentTime,
        mediaDuration = 0,
        active = false,
        optionMode = false,
        ontext,
        onseek,
        onselect,
    }: TranscriptionBlockProps = $props();

    let blockEl = $state<HTMLElement>();
    let renderScrubber = $state(false);
    let scrubberExiting = $state(false);
    let scrubDisplayTime = $state<number | null>(null);
    let scrubSeekTime = $state<number | null>(null);
    const SCRUB_GUARD_SECONDS = 0.08;
    const visualEnd = $derived(
        mediaDuration > start && mediaDuration < end ? mediaDuration : end,
    );
    const guardedEnd = $derived(Math.max(start, visualEnd - SCRUB_GUARD_SECONDS));
    const playbackDisplayTime = $derived(Math.min(visualEnd, Math.max(start, currentTime)));
    const scrubTime = $derived(scrubDisplayTime ?? playbackDisplayTime);
    const ghostClass = $derived(
        `${selectableSurface} ${transcription_block}`,
    );
    const activeClass = $derived(
        `${ghostClass} ${selectableSurfaceActive}`,
    );
    $effect(() => {
        if (active) {
            renderScrubber = true;
            scrubberExiting = false;
            tick().then(() => {
                const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                blockEl?.scrollIntoView({
                    block: "nearest",
                    behavior: prefersReducedMotion ? "auto" : "smooth",
                });
            });
        } else if (renderScrubber) {
            scrubberExiting = true;
        }
    });

    $effect(() => {
        if (!active) {
            scrubDisplayTime = null;
            scrubSeekTime = null;
        } else if (
            scrubSeekTime !== null &&
            Math.abs(currentTime - scrubSeekTime) > 0.03
        ) {
            scrubDisplayTime = null;
            scrubSeekTime = null;
        }
    });

    function selectBlock() {
        if (optionMode) {
            onselect?.();
            return;
        }
        if (!active) onseek?.(start);
    }

    function seekWithinBlock(displayTime: number) {
        const seekTime = Math.min(displayTime, guardedEnd);
        scrubDisplayTime = displayTime;
        scrubSeekTime = seekTime;
        onseek?.(seekTime);
    }

    function finishScrubberExit() {
        if (!scrubberExiting) return;
        renderScrubber = false;
        scrubberExiting = false;
    }
</script>

{#snippet blockContent()}
    <div class={transcription_index}>#{index}</div>
    <div>
        <div class={transcription_meta}>
            <span class={transcription_time}>{formatClockTime(start)} - {formatClockTime(end)}</span>
        </div>
        {#if active}
            <AutoSizeTextarea
                classname="{transcription_text} {transcription_textarea}"
                value={text}
                ariaLabel={`Edit transcript block ${index}`}
                oninput={(next) => ontext?.(next)}
            />
        {:else}
            <p class={transcription_text}>{text}</p>
        {/if}
    </div>
{/snippet}

{#if optionMode && !active}
    <button
        bind:this={blockEl}
        class={ghostClass}
        type="button"
        onclick={selectBlock}
    >
        {@render blockContent()}
    </button>
{:else if active || renderScrubber}
    <article
        bind:this={blockEl}
        class={active ? activeClass : ghostClass}
        aria-current={active ? "true" : undefined}
    >
        {@render blockContent()}
        {#if renderScrubber}
            <div
                class="{transcription_progress_shell} {scrubberExiting
                    ? transcription_progress_exit
                    : ''}"
                onanimationend={finishScrubberExit}
            >
                <RangeInput
                    min={start}
                    max={visualEnd}
                    step="0.01"
                    value={scrubTime}
                    ariaLabel={`Seek transcript block ${index}`}
                    disabled={!active}
                    oninput={seekWithinBlock}
                />
            </div>
        {/if}
    </article>
{:else}
    <button
        bind:this={blockEl}
        class={ghostClass}
        type="button"
        onclick={selectBlock}
    >
        {@render blockContent()}
    </button>
{/if}
