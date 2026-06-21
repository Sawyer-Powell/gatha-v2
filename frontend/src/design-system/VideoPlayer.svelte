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
        /** Video duration in seconds. Bindable once metadata loads. */
        duration?: number;
        /** Optional class applied to the video player shell. */
        classname?: string;
        /** Optional class applied to the video frame. */
        frameClassname?: string;
        /** Enables global keyboard shortcuts for the active workbench view. */
        shortcuts?: boolean;
    }
</script>

<script lang="ts">
    import { Pause, Play } from "phosphor-svelte";
    import { FastForward, Rabbit, Rewind, Turtle } from "@lucide/svelte";
    import RangeInput, { type RangeDot } from "./RangeInput.svelte";
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
    } from "./design-system.css";

    let {
        src = undefined,
        title = "Video preview",
        currentTime = $bindable(0),
        paused = $bindable(true),
        playbackRate = $bindable(1),
        duration = $bindable(0),
        classname = "",
        frameClassname = "",
        shortcuts = false,
    }: VideoPlayerProps = $props();

    const SKIP_SECONDS = 10;
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

    let timeDraft = $state("00:00");
    let editingTime = $state(false);

    const speedIndex = $derived(Math.max(0, speeds.indexOf(playbackRate)));
    const speedLabel = $derived(`${playbackRate.toFixed(2)}x`);

    const dotRatio = (i: number) =>
        speeds.length > 1 ? i / (speeds.length - 1) : 0.5;
    const speedDots: RangeDot[] = $derived(
        speeds
            .slice(1, -1)
            .map((_, dotIndex) => {
                const i = dotIndex + 1;
                return {
                    ratio: dotRatio(i),
                    active: i <= speedIndex,
                };
            }),
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

    $effect(() => {
        if (!editingTime) {
            timeDraft = formatTime(currentTime);
        }
    });

    $effect(() => {
        if (!shortcuts) return;
        window.addEventListener("keydown", handleShortcut);
        return () => window.removeEventListener("keydown", handleShortcut);
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

<section class="{videoPlayer} {classname}" aria-label={title}>
    <div class="{videoFrame} {frameClassname}">
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
</section>

<div class={videoChrome} role="group" aria-label={`Playback controls for ${title}`}>
    <div class={videoChromeStack}>
        <div class={videoTimeEdit}>
            <input
                class={videoTimeInput}
                value={timeDraft}
                aria-label="Edit timestamp"
                onfocus={() => (editingTime = true)}
                oninput={(e) => (timeDraft = e.currentTarget.value)}
                onblur={() => {
                    editingTime = false;
                    commitTimeEdit();
                }}
                onkeydown={(e) => {
                    if (e.key === "Enter") {
                        editingTime = false;
                        commitTimeEdit();
                        e.currentTarget.blur();
                    }
                    if (e.key === "Escape") {
                        editingTime = false;
                        timeDraft = formatTime(currentTime);
                        e.currentTarget.blur();
                    }
                }}
            />
            <span class={videoDuration}>/ {formatTime(duration)}</span>
        </div>

        <RangeInput
            classname={videoScrubber}
            min={0}
            max={duration || 0}
            step="0.01"
            value={currentTime}
            ariaLabel="Scrub video timeline"
            disabled={duration === 0}
            oninput={seek}
        />

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
            <RangeInput
                classname={videoSpeedSlider}
                min={0}
                max={speeds.length - 1}
                step={1}
                value={speedIndex}
                dots={speedDots}
                ariaLabel={`Playback speed: ${speedLabel}`}
                title={`Playback speed: ${speedLabel}`}
                oninput={setSpeed}
                onkeydown={handleSpeedKeydown}
            />
            <Rabbit class={videoSpeedIcon} size={16} aria-hidden="true" />
            <span class={videoSpeedValue}>{speedLabel}</span>
        </div>
    </div>
</div>
