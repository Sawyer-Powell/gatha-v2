<script module lang="ts">
    export interface VideoPlayerProps {
        /** Source URL of the video to play. */
        src?: string;
        /** Title shown in the player chrome. */
        title?: string;
        /** Playback position in seconds. Bindable. */
        currentTime?: number;
        /** Whether playback is paused. Bindable. */
        paused?: boolean;
        /** Playback speed multiplier. Bindable. */
        playbackRate?: number;
    }
</script>

<script lang="ts">
    import { Pause, Play } from "phosphor-svelte";
    import { FastForward, Rabbit, Rewind, Turtle } from "@lucide/svelte";
    import { vars } from "../app.css";
    import {
        buttonVariants,
        videoChrome,
        videoChromeStack,
        videoControlButton,
        videoControlCluster,
        videoDuration,
        videoElement,
        videoFrame,
        videoPlayer,
        videoScrubber,
        videoShortcut,
        videoSpeedControl,
        videoSpeedIcon,
        videoSpeedSlider,
        videoSpeedValue,
        videoTimeEdit,
        videoTimeInput,
        videoTitle,
    } from "./design-system.css";

    let {
        src = undefined,
        title = "Video preview",
        currentTime = $bindable(0),
        paused = $bindable(true),
        playbackRate = $bindable(1),
    }: VideoPlayerProps = $props();

    const SKIP_SECONDS = 10;
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

    let duration = $state(0);
    let timeDraft = $state("00:00");

    const progress = $derived(duration ? (currentTime / duration) * 100 : 0);
    const speedIndex = $derived(Math.max(0, speeds.indexOf(playbackRate)));
    const speedLabel = $derived(`${playbackRate.toFixed(2)}x`);

    // The native range thumb is inset by its own radius at each end (~8% of the
    // ~100px track), so the fill edge and notch dots map into this 8%–92% band
    // to line up with where the thumb actually stops.
    const dotPosition = (i: number) =>
        speeds.length > 1 ? 8 + (i / (speeds.length - 1)) * 84 : 50;
    const speedProgress = $derived(dotPosition(speedIndex));

    // Dots on the orange fill use a light color; dots on the bare track use the
    // dark foreground — so both halves stay legible.
    const speedDots = $derived(
        speeds
            .map((_, i) => {
                const color =
                    i <= speedIndex
                        ? vars.colors.background
                        : vars.colors.foreground;
                return `radial-gradient(circle at ${dotPosition(i)}% 50%, ${color} 0 1.5px, transparent 2px)`;
            })
            .join(", "),
    );

    function formatTime(seconds: number) {
        const safe = Math.max(0, Math.floor(seconds || 0));
        const h = Math.floor(safe / 3600);
        const m = String(Math.floor((safe % 3600) / 60)).padStart(2, "0");
        const s = String(safe % 60).padStart(2, "0");
        return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
    }

    function parseTime(value: string) {
        const parts = value.trim().split(":").map(Number);
        if (parts.some(Number.isNaN)) return null;
        return parts.reduce((total, part) => total * 60 + part, 0);
    }

    function seek(seconds: number) {
        currentTime = Math.max(0, Math.min(seconds, duration || seconds));
    }

    function commitTimeEdit() {
        const next = parseTime(timeDraft);
        if (next === null) timeDraft = formatTime(currentTime);
        else seek(next);
    }

    function setSpeed(index: number) {
        const clamped = Math.max(0, Math.min(speeds.length - 1, Math.round(index)));
        playbackRate = speeds[clamped];
    }

    // Keep the editable timestamp synced to playback unless it's being typed in.
    $effect(() => {
        if (document.activeElement?.id !== "video-time-edit") {
            timeDraft = formatTime(currentTime);
        }
    });

    function handleShortcut(e: KeyboardEvent) {
        const el = e.target as HTMLElement | null;
        if (
            el?.tagName === "INPUT" ||
            el?.tagName === "TEXTAREA" ||
            el?.isContentEditable
        ) {
            return;
        }
        const actions: Record<string, () => void> = {
            " ": () => (paused = !paused),
            ArrowLeft: () => seek(currentTime - SKIP_SECONDS),
            ArrowRight: () => seek(currentTime + SKIP_SECONDS),
        };
        const action = actions[e.key];
        if (action) {
            e.preventDefault();
            action();
        }
    }

    function handleSpeedKeydown(e: KeyboardEvent) {
        const targets: Record<string, number> = {
            ArrowLeft: speedIndex - 1,
            ArrowDown: speedIndex - 1,
            ArrowRight: speedIndex + 1,
            ArrowUp: speedIndex + 1,
            Home: 0,
            End: speeds.length - 1,
        };
        if (e.key in targets) {
            e.preventDefault();
            setSpeed(targets[e.key]);
        }
    }
</script>

<svelte:window onkeydown={handleShortcut} />

<section class={videoPlayer}>
    <div class={videoFrame}>
        <video
            bind:currentTime
            bind:duration
            bind:paused
            bind:playbackRate
            class={videoElement}
            {src}
            preload="metadata"
            playsinline
        >
            <track kind="captions" />
        </video>
    </div>

    <div class={videoChrome}>
        <input
            class={videoScrubber}
            type="range"
            min="0"
            max={duration || 0}
            step="0.01"
            value={currentTime}
            style={`--progress: ${progress}%`}
            aria-label="Scrub video timeline"
            disabled={duration === 0}
            oninput={(e) => seek(e.currentTarget.valueAsNumber)}
        />

        <div class={videoChromeStack}>
            <div class={videoTitle}>{title}</div>

            <div class={videoTimeEdit}>
                <input
                    id="video-time-edit"
                    class={videoTimeInput}
                    value={timeDraft}
                    aria-label="Edit timestamp"
                    oninput={(e) => (timeDraft = e.currentTarget.value)}
                    onblur={commitTimeEdit}
                    onkeydown={(e) => {
                        if (e.key === "Enter") commitTimeEdit();
                        if (e.key === "Escape")
                            timeDraft = formatTime(currentTime);
                    }}
                />
                <span class={videoDuration}>/ {formatTime(duration)}</span>
            </div>

            <div class={videoControlCluster}>
                <button
                    class="{buttonVariants.secondary} {videoControlButton}"
                    type="button"
                    title="Rewind 10s (←)"
                    aria-label="Rewind 10 seconds"
                    onclick={() => seek(currentTime - SKIP_SECONDS)}
                >
                    <Rewind size={16} />
                    <span class={videoShortcut} aria-hidden="true">←</span>
                </button>

                <button
                    class="{buttonVariants.primary} {videoControlButton}"
                    type="button"
                    title="Play or pause (Space)"
                    aria-label={paused ? "Play video" : "Pause video"}
                    onclick={() => (paused = !paused)}
                >
                    {#if paused}
                        <Play size={16} weight="bold" />
                    {:else}
                        <Pause size={16} weight="bold" />
                    {/if}
                    <span class={videoShortcut} aria-hidden="true">Space</span>
                </button>

                <button
                    class="{buttonVariants.secondary} {videoControlButton}"
                    type="button"
                    title="Forward 10s (→)"
                    aria-label="Forward 10 seconds"
                    onclick={() => seek(currentTime + SKIP_SECONDS)}
                >
                    <FastForward size={16} />
                    <span class={videoShortcut} aria-hidden="true">→</span>
                </button>
            </div>

            <div class={videoSpeedControl}>
                <Turtle class={videoSpeedIcon} size={16} aria-hidden="true" />
                <input
                    class={videoSpeedSlider}
                    type="range"
                    min="0"
                    max={speeds.length - 1}
                    step="1"
                    value={speedIndex}
                    style={`--speed-progress: ${speedProgress}%; --speed-dots: ${speedDots}`}
                    aria-label={`Playback speed: ${speedLabel}`}
                    title={`Playback speed: ${speedLabel}`}
                    oninput={(e) => setSpeed(e.currentTarget.valueAsNumber)}
                    onkeydown={handleSpeedKeydown}
                />
                <Rabbit class={videoSpeedIcon} size={16} aria-hidden="true" />
                <span class={videoSpeedValue}>{speedLabel}</span>
            </div>
        </div>
    </div>
</section>
