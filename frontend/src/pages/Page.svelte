<script lang="ts">
    import Button from "$lib/design-system/Button.svelte";
    import HStack from "$lib/design-system/HStack.svelte";
    import VideoPlayer from "$lib/design-system/VideoPlayer.svelte";
    import H3 from "$lib/design-system/typography/H3.svelte";
    import VStack from "$lib/design-system/VStack.svelte";
    import { ShareFat, SidebarSimple, TrashSimple } from "phosphor-svelte";
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
        video_panel,
        video_entry_content,
        video_entry_title,
        video_thumbnail,
        video_date,
    } from "./page.css";

    const videos = [
        {
            id: "diamond-sutra-1",
            title: "diamond_sutra_292387.mp4",
            date: "Sun Mar 22, 11:53AM",
        },
        {
            id: "diamond-sutra-2",
            title: "diamond_sutra_292387.mp4",
            date: "Sun Mar 22, 11:53AM",
        },
    ];

    let selectedVideoId = $state(videos[0].id);
    let sidebarOpen = $state(true);
    let currentTime = $state(0);
    let paused = $state(true);
    let playbackRate = $state(1);
    const selectedVideo = $derived(
        videos.find((video) => video.id === selectedVideoId) ?? videos[0],
    );
</script>

<section class={page}>
    <div class={pageWrapper}>
        <div class={top_bar}>
            <Button
                variant="ghost"
                shape="circle"
                pressed={sidebarOpen}
                ariaLabel={sidebarOpen ? "Hide video list" : "Show video list"}
                onclick={() => (sidebarOpen = !sidebarOpen)}
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
            <div class="{sidebar_shell} {sidebarOpen ? '' : sidebar_closed}">
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
            <div class={workspace_query}>
                <div class={workspace}>
                    <div class={content}>
                        <div class={contentWrapper}>
                            <section class={transcription_panel}>
                                <H3>{selectedVideo.title}</H3>
                            </section>
                        </div>
                    </div>

                    <aside class={video_panel} aria-label="Video preview">
                        <VideoPlayer
                            title={selectedVideo.title}
                            bind:currentTime
                            bind:paused
                            bind:playbackRate
                        />
                    </aside>
                </div>
            </div></HStack
        >
    </div>
</section>
