<script lang="ts">
    import Button from "$lib/design-system/Button.svelte";
    import HStack from "$lib/design-system/HStack.svelte";
    import H3 from "$lib/design-system/typography/H3.svelte";
    import VStack from "$lib/design-system/VStack.svelte";
    import {
        content,
        contentWrapper,
        hstack,
        page,
        pageWrapper,
        video_date,
    } from "./page.css";
</script>

<section class={page}>
    <div class={pageWrapper}>
        <HStack justify="between" align="start" classname={hstack}>
            <VStack gap="sm">
                <div>
                    <Button variant="ghost">diamond_sutra_292387.mp4</Button>
                    <div class={video_date}>Sun Mar 22, 11:53AM</div>
                </div>
                <div>
                    <Button variant="ghost">diamond_sutra_292387.mp4</Button>
                    <div class={video_date}>Sun Mar 22, 11:53AM</div>
                </div>
            </VStack>
            <div class={content}>
                <div class={contentWrapper}>
                    <H3>diamond_sutra_292387.mp4</H3>
                </div>
            </div></HStack
        >
    </div>
</section>
