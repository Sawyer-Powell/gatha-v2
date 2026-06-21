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
        /** Whether to show the detached playback controls. */
        controls?: boolean;
        /** Optional override for the back transport action. */
        onstepbackward?: () => void;
        /** Optional override for the forward transport action. */
        onstepforward?: () => void;
        /** Disables the back transport action. */
        stepBackwardDisabled?: boolean;
        /** Disables the forward transport action. */
        stepForwardDisabled?: boolean;
        /** Accessible label for the back transport action. */
        stepBackwardLabel?: string;
        /** Accessible label for the forward transport action. */
        stepForwardLabel?: string;
        /** Enables global keyboard shortcuts for the active workbench view. */
        shortcuts?: boolean;
    }
</script>

<script lang="ts">
    import { Pause, Play } from "phosphor-svelte";
    import { FastForward, Rabbit, Rewind, Turtle } from "@lucide/svelte";
    import { formatClockTime, parseClockTime } from "$lib/utils/time";
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
        videoSpeedControl,
        videoSpeedIcon,
        videoSpeedSlider,
        videoSpeedStepButton,
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
        controls = true,
        onstepbackward = undefined,
        onstepforward = undefined,
        stepBackwardDisabled = false,
        stepForwardDisabled = false,
        stepBackwardLabel = "Rewind 10 seconds",
        stepForwardLabel = "Forward 10 seconds",
        shortcuts = false,
    }: VideoPlayerProps = $props();

    const SKIP_SECONDS = 10;
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

    let timeDraft = $state("00:00");
    let editingTime = $state(false);
    let aspectRatio = $state(16 / 9);

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

    function seek(seconds: number) {
        currentTime = Math.max(0, Math.min(seconds, duration || seconds));
    }

    function updateAspectRatio(e: Event) {
        const video = e.currentTarget as HTMLVideoElement;
        if (video.videoWidth > 0 && video.videoHeight > 0) {
            aspectRatio = video.videoWidth / video.videoHeight;
        }
    }

    function commitTimeEdit() {
        const next = parseClockTime(timeDraft);
        if (next === null) timeDraft = formatClockTime(currentTime);
        else seek(next);
    }

    function setSpeed(index: number) {
        const clamped = Math.max(0, Math.min(speeds.length - 1, Math.round(index)));
        playbackRate = speeds[clamped];
    }

    function stepBackward() {
        if (stepBackwardDisabled) return;
        if (onstepbackward) onstepbackward();
        else seek(currentTime - SKIP_SECONDS);
    }

    function stepForward() {
        if (stepForwardDisabled) return;
        if (onstepforward) onstepforward();
        else seek(currentTime + SKIP_SECONDS);
    }

    $effect(() => {
        if (!editingTime) {
            timeDraft = formatClockTime(currentTime);
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
            ArrowLeft: stepBackward,
            ArrowRight: stepForward,
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

<section
    class="{videoPlayer} {classname}"
    aria-label={title}
    style={`--video-aspect-ratio: ${aspectRatio}`}
>
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
            onloadedmetadata={updateAspectRatio}
        >
            <track kind="captions" />
        </video>
    </div>
</section>

{#if controls}
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
                            timeDraft = formatClockTime(currentTime);
                            e.currentTarget.blur();
                        }
                    }}
                />
                <span class={videoDuration}>/ {formatClockTime(duration)}</span>
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
                    title={`${stepBackwardLabel} (←)`}
                    aria-label={stepBackwardLabel}
                    disabled={stepBackwardDisabled}
                    onclick={stepBackward}
                >
                    <Rewind size={16} />
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
                </button>

                <button
                    class="{buttonVariants.secondary} {videoControlButton}"
                    type="button"
                    title={`${stepForwardLabel} (→)`}
                    aria-label={stepForwardLabel}
                    disabled={stepForwardDisabled}
                    onclick={stepForward}
                >
                    <FastForward size={16} />
                </button>
            </div>

            <div class={videoSpeedControl}>
                <button
                    class={videoSpeedStepButton}
                    type="button"
                    title="Decrease playback speed"
                    aria-label="Decrease playback speed"
                    disabled={speedIndex <= 0}
                    onclick={() => setSpeed(speedIndex - 1)}
                >
                    <Turtle class={videoSpeedIcon} size={16} aria-hidden="true" />
                </button>
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
                <button
                    class={videoSpeedStepButton}
                    type="button"
                    title="Increase playback speed"
                    aria-label="Increase playback speed"
                    disabled={speedIndex >= speeds.length - 1}
                    onclick={() => setSpeed(speedIndex + 1)}
                >
                    <Rabbit class={videoSpeedIcon} size={16} aria-hidden="true" />
                </button>
                <span class={videoSpeedValue}>{speedLabel}</span>
            </div>
        </div>
    </div>
{/if}
