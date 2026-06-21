<script lang="ts">
    import HStack from "$lib/design-system/HStack.svelte";
    import AccountModal from "./account/AccountModal.svelte";
    import AppTopBar from "./chrome/AppTopBar.svelte";
    import ReadyVideoWorkspace from "./workspace/ReadyVideoWorkspace.svelte";
    import VideoActionPanel from "./workspace/VideoActionPanel.svelte";
    import VideoSidebar from "./sidebar/VideoSidebar.svelte";
    import {
        estimatedCostLabel,
        initialVideos,
        organization,
        promptPresets,
        transcriptText,
        user,
        type OrgMember,
        type VideoItem,
    } from "./homeModel";
    import {
        hstack,
        hstack_sidebar_closed,
        home,
        homeWrapper,
        homeWrapperWithControls,
    } from "./home.css";
    import {
        content,
        workspace,
        workspace_query,
        workspace_query_sidebar_open,
    } from "./workspace/workspace.css";

    /*
     * Future WASM boundary:
     * - WASM-owned state: videos, selectedVideoId, transcript blocks, account,
     *   organization, billing, prompts, uploads, and transcription jobs.
     * - WASM-driven callbacks: select/update video, upload/retry, configure/start
     *   transcription, edit transcript/account/org fields, member/billing actions.
     * - Local UI state only: element refs, popover/search visibility, scroll
     *   feather measurements, modal/tab presentation, and transient input drafts.
     */
    let videos = $state<VideoItem[]>(initialVideos);
    let transcript = $state(transcriptText.map((text, i) => ({
        start: i,
        end: i === transcriptText.length - 1 ? 5.1 : i + 1,
        text,
    })));

    let selectedVideoId = $state(initialVideos[0].id);
    let sidebarOpen = $state(true);
    let sidebarAnimating = $state(false);
    let currentTime = $state(0);
    let paused = $state(true);
    let playbackRate = $state(1);
    let duration = $state(0);
    let accountModalOpen = $state(false);
    let accountName = $state("Sawyer Powell");
    let organizationName = $state("US Zen");
    let organizationMemberState = $state<OrgMember[]>(organization.members);
    let accountAvatarUrl = $state("");
    let organizationLogoUrl = $state("");
    const organizationMembers = $derived(organizationMemberState.map((member) =>
        member.current ? { ...member, name: accountName } : member,
    ));
    const selectedVideo = $derived(
        videos.find((video) => video.id === selectedVideoId) ?? videos[0],
    );
    const workspacePinned = $derived(sidebarOpen || sidebarAnimating);
    function toggleSidebar() {
        sidebarAnimating = true;
        sidebarOpen = !sidebarOpen;
    }

    function finishSidebarAnimation(e: TransitionEvent) {
        if (e.propertyName === "width") {
            sidebarAnimating = false;
        }
    }

    function updateVideo(id: string, patch: Partial<VideoItem>) {
        videos = videos.map((video) => video.id === id ? { ...video, ...patch } : video);
    }

    function profileName(email: string) {
        return organizationMembers.find((member) => member.email === email)?.name ?? email;
    }

    function profileImageUrl(email: string) {
        return email === user.email ? accountAvatarUrl : "";
    }

    function selectVideo(video: VideoItem) {
        selectedVideoId = video.id;
        currentTime = 0;
        paused = true;
    }

    function renameSelectedVideo(title: string) {
        updateVideo(selectedVideo.id, { title });
    }

    function openOrgTranscription(title: string) {
        const video = videos.find((item) => item.title === title);
        if (!video) return;
        selectVideo(video);
        accountModalOpen = false;
    }

    function addUploads(files: FileList | null) {
        if (!files?.length) return;
        const created = Array.from(files).map((file, index) => ({
            id: `${Date.now()}-${index}-${file.name}`,
            title: file.name,
            date: "Just now",
            src: URL.createObjectURL(file),
            status: "uploading" as const,
            uploadProgress: 0,
            transcriptionProgress: 0,
            prompt: promptPresets[0],
            emailOnComplete: false,
            uploadedByEmail: user.email,
        }));
        videos = [...created, ...videos];
        selectedVideoId = created[0].id;
        created.forEach(simulateUpload);
    }

    function simulateUpload(video: VideoItem) {
        const timer = window.setInterval(() => {
            const current = videos.find((item) => item.id === video.id);
            if (!current || current.status !== "uploading") return window.clearInterval(timer);
            const uploadProgress = Math.min(1, current.uploadProgress + 0.12);
            updateVideo(video.id, {
                uploadProgress,
                status: uploadProgress >= 1 ? "uploaded" : "uploading",
            });
            if (uploadProgress >= 1) window.clearInterval(timer);
        }, 450);
    }

    function retryUpload(video: VideoItem) {
        updateVideo(video.id, { status: "uploading", uploadProgress: 0 });
        simulateUpload({ ...video, status: "uploading", uploadProgress: 0 });
    }

    function configureTranscription(video = selectedVideo) {
        updateVideo(video.id, { status: "configuring" });
    }

    function startTranscription() {
        const id = selectedVideo.id;
        updateVideo(id, { status: "queued", transcriptionProgress: 0 });
        window.setTimeout(() => {
            updateVideo(id, { status: "transcribing", transcriptionProgress: 0.08 });
            simulateTranscription(id);
        }, 700);
    }

    function simulateTranscription(id: string) {
        const timer = window.setInterval(() => {
            const current = videos.find((item) => item.id === id);
            if (!current || current.status !== "transcribing") return window.clearInterval(timer);
            const transcriptionProgress = Math.min(1, current.transcriptionProgress + 0.09);
            updateVideo(id, {
                transcriptionProgress,
                status: transcriptionProgress >= 1 ? "ready" : "transcribing",
                ...(transcriptionProgress >= 1
                    ? {
                        transcribedAt: "Just now",
                        transcribedByEmail: user.email,
                        estimatedTranscriptionCost: estimatedCostLabel(duration || 5),
                    }
                    : {}),
            });
            if (transcriptionProgress >= 1) window.clearInterval(timer);
        }, 550);
    }

    function updateAccountAvatar(files: FileList | null) {
        const file = files?.[0];
        if (!file) return;
        if (accountAvatarUrl) URL.revokeObjectURL(accountAvatarUrl);
        accountAvatarUrl = URL.createObjectURL(file);
    }

    function updateOrganizationLogo(files: FileList | null) {
        const file = files?.[0];
        if (!file) return;
        if (organizationLogoUrl) URL.revokeObjectURL(organizationLogoUrl);
        organizationLogoUrl = URL.createObjectURL(file);
    }

    function removeOrganizationMember(email: string) {
        organizationMemberState = organizationMemberState.filter((member) => member.email !== email);
    }

    function makeOrganizationAdmin(email: string) {
        organizationMemberState = organizationMemberState.map((member) =>
            member.email === email ? { ...member, role: "admin" } : member,
        );
    }

</script>

<section class={home}>
    <div class="{homeWrapper} {homeWrapperWithControls}">
        <AppTopBar
            {sidebarOpen}
            video={selectedVideo}
            {accountName}
            {accountAvatarUrl}
            ontoggleSidebar={toggleSidebar}
            onrenameVideo={renameSelectedVideo}
            onopenAccount={() => (accountModalOpen = true)}
        />

        <HStack
            justify="between"
            align="stretch"
            classname="{hstack} {sidebarOpen ? '' : hstack_sidebar_closed}"
        >
            <VideoSidebar
                {videos}
                members={organizationMembers}
                {selectedVideoId}
                open={sidebarOpen}
                {profileName}
                {profileImageUrl}
                onselect={selectVideo}
                onfiles={addUploads}
                ontransitionend={finishSidebarAnimation}
            />
            <div class="{workspace_query} {workspacePinned ? workspace_query_sidebar_open : ''}">
                <div class={workspace}>
                    <div class={content}>
                        {#if selectedVideo.status === "ready"}
                            <ReadyVideoWorkspace
                                video={selectedVideo}
                                {transcript}
                                bind:currentTime
                                bind:paused
                                bind:playbackRate
                                bind:duration
                                {profileName}
                                {profileImageUrl}
                            />
                        {:else}
                            <VideoActionPanel
                                video={selectedVideo}
                                bind:currentTime
                                bind:paused
                                bind:playbackRate
                                bind:duration
                                {profileName}
                                {profileImageUrl}
                                onupdate={updateVideo}
                                onretryUpload={retryUpload}
                                onconfigure={configureTranscription}
                                onstart={startTranscription}
                            />
                        {/if}
                    </div>
                </div>
            </div></HStack
        >
        <AccountModal
            open={accountModalOpen}
            bind:accountName
            bind:organizationName
            {organizationMembers}
            {accountAvatarUrl}
            {organizationLogoUrl}
            onclose={() => (accountModalOpen = false)}
            onavatar={updateAccountAvatar}
            onlogo={updateOrganizationLogo}
            onremoveMember={removeOrganizationMember}
            onmakeAdmin={makeOrganizationAdmin}
            onopenTranscription={openOrgTranscription}
        />
    </div>
</section>
