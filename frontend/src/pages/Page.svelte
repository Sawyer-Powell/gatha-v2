<script lang="ts">
    import Button from "$lib/design-system/Button.svelte";
    import HStack from "$lib/design-system/HStack.svelte";
    import VideoPlayer from "$lib/design-system/VideoPlayer.svelte";
    import VStack from "$lib/design-system/VStack.svelte";
    import { ShareFat, SidebarSimple, TrashSimple } from "phosphor-svelte";
    import TranscriptionBlock from "./TranscriptionBlock.svelte";
    import {
        content,
        contentWrapper,
        hstack,
        hstack_sidebar_closed,
        page,
        pageWrapper,
        sidebar_closed,
        sidebar_list,
        sidebar_shell,
        transcription_panel,
        top_bar,
        top_bar_actions,
        top_bar_title,
        workspace,
        workspace_query,
        workspace_query_sidebar_open,
        video_stage,
        video_entry_content,
        video_entry_title,
        video_thumbnail,
        video_date,
        video_frame_layout,
        video_player_layout,
    } from "./page.css";

    const videos = [
        {
            id: "diamond-sutra-1",
            title: "diamond_sutra_292387.mp4",
            date: "Sun Mar 22, 11:53AM",
            src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        },
        {
            id: "diamond-sutra-2",
            title: "diamond_sutra_292387.mp4",
            date: "Sun Mar 22, 11:53AM",
            src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        },
    ];

    const transcriptText = [
        "A quiet frame opens, giving the transcript room to lead.",
        "The video stays available without stealing the whole workspace.",
        "Each block tracks playback and can seek inside its own range.",
        "Focus follows the current line without turning the UI into a carnival.",
        "This is enough structure to replace later with real transcript data.",
    ];
    let transcript = $state(transcriptText.map((text, i) => ({
        start: i,
        end: i === transcriptText.length - 1 ? 5.1 : i + 1,
        text,
    })));

    let selectedVideoId = $state(videos[0].id);
    let sidebarOpen = $state(true);
    let sidebarAnimating = $state(false);
    let currentTime = $state(0);
    let paused = $state(true);
    let playbackRate = $state(1);
    let duration = $state(0);
    const selectedVideo = $derived(
        videos.find((video) => video.id === selectedVideoId) ?? videos[0],
    );
    const workspacePinned = $derived(sidebarOpen || sidebarAnimating);
    const activeTranscriptIndex = $derived.by(() => {
        const index = transcript.findIndex(
            (block, i) =>
                currentTime >= block.start &&
                (currentTime < block.end || i === transcript.length - 1),
        );
        return index === -1 ? 0 : index;
    });

    function toggleSidebar() {
        sidebarAnimating = true;
        sidebarOpen = !sidebarOpen;
    }

    function finishSidebarAnimation(e: TransitionEvent) {
        if (e.propertyName === "width") {
            sidebarAnimating = false;
        }
    }
</script>

<section class={page}>
    <div class={pageWrapper}>
        <div class={top_bar}>
            <Button
                variant="ghost"
                shape="circle"
                pressed={sidebarOpen}
                ariaLabel={sidebarOpen ? "Hide video list" : "Show video list"}
                onclick={toggleSidebar}
            >
                <SidebarSimple size={18} />
            </Button>
            <div class={top_bar_title}>{selectedVideo.title}</div>
            <div class={top_bar_actions}>
                <Button
                    variant="primary"
                    shape="circle"
                    ariaLabel="Share video"
                >
                    <ShareFat size={18} />
                </Button>
                <Button
                    variant="secondary"
                    shape="circle"
                    ariaLabel="Delete video"
                >
                    <TrashSimple size={18} />
                </Button>
            </div>
        </div>

        <HStack
            justify="between"
            align="stretch"
            classname="{hstack} {sidebarOpen ? '' : hstack_sidebar_closed}"
        >
            <div
                class="{sidebar_shell} {sidebarOpen ? '' : sidebar_closed}"
                ontransitionend={finishSidebarAnimation}
            >
                <div class={sidebar_list}>
                    <VStack gap="sm">
                        {#each videos as video}
                            <Button
                                variant="ghost"
                                shape="square"
                                pressed={selectedVideoId === video.id}
                                onclick={() => (selectedVideoId = video.id)}
                            >
                                <span class={video_entry_content}>
                                    <span class={video_thumbnail} aria-hidden="true"></span>
                                    <span>
                                        <span class={video_entry_title}>{video.title}</span>
                                        <span class={video_date}>{video.date}</span>
                                    </span>
                                </span>
                            </Button>
                        {/each}
                    </VStack>
                </div>
            </div>
            <div class="{workspace_query} {workspacePinned ? workspace_query_sidebar_open : ''}">
                <div class={workspace}>
                    <div class={content}>
                        <div class={contentWrapper}>
                            <section class={video_stage} aria-label="Video preview">
                                <VideoPlayer
                                    classname={video_player_layout}
                                    frameClassname={video_frame_layout}
                                    title={selectedVideo.title}
                                    src={selectedVideo.src}
                                    shortcuts
                                    bind:currentTime
                                    bind:paused
                                    bind:playbackRate
                                    bind:duration
                                />
                            </section>
                            <section class={transcription_panel} aria-label="Transcription">
                                {#each transcript as block, i}
                                    <TranscriptionBlock
                                        index={i + 1}
                                        currentTime={currentTime}
                                        start={block.start}
                                        end={block.end}
                                        mediaDuration={duration}
                                        active={i === activeTranscriptIndex}
                                        onseek={(time) => (currentTime = time)}
                                        bind:text={block.text}
                                    />
                                {/each}
                            </section>
                        </div>
                    </div>
                </div>
            </div></HStack
        >
    </div>
</section>
