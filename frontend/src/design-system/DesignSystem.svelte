<script lang="ts">
    import H1 from "$lib/design-system/typography/H1.svelte";
    import H2 from "$lib/design-system/typography/H2.svelte";
    import H3 from "$lib/design-system/typography/H3.svelte";
    import H4 from "$lib/design-system/typography/H4.svelte";
    import Bold from "$lib/design-system/typography/Bold.svelte";
    import Link from "$lib/design-system/typography/Link.svelte";
    import Italic from "$lib/design-system/Italic.svelte";
    import Spacer from "$lib/design-system/Spacer.svelte";
    import HStack from "$lib/design-system/HStack.svelte";
    import VStack from "$lib/design-system/VStack.svelte";
    import Grid from "$lib/design-system/Grid.svelte";
    import Switch from "$lib/design-system/Switch.svelte";
    import Input from "$lib/design-system/Input.svelte";
    import Button from "$lib/design-system/Button.svelte";
    import Card from "$lib/design-system/Card.svelte";
    import Logo from "$lib/design-system/Logo.svelte";
    import Modal from "$lib/design-system/Modal.svelte";
    import Slider from "$lib/design-system/Slider.svelte";
    import Dropdown from "$lib/design-system/Dropdown.svelte";
    import Combobox from "$lib/design-system/Combobox.svelte";
    import VideoPlayer from "$lib/design-system/VideoPlayer.svelte";
    import { MagnifyingGlass } from "phosphor-svelte";

    let switchOn = $state(false);
    let sliderValue = $state(0.5);
    let primaryLoading = $state(false);
    let secondaryLoading = $state(false);
    let ghostLoading = $state(false);
    let inputValue = $state("");
    let modalOpen = $state(false);
    let dropdownValue = $state<string | null>(null);
    let comboboxValues = $state<string[]>([]);
</script>

<VStack gap="lg">
    <Logo />

    <Spacer size="lg" />

    <H2>Video Player</H2>
    <VideoPlayer
        title="diamond_sutra_292387.mp4"
        src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
    />

    <Spacer size="sm" />

    <H1>Heading 1</H1>
    <H2>Heading 2</H2>
    <H3>Heading 3</H3>
    <H4>Heading 4</H4>
    <p><Bold>Bold text</Bold></p>
    <p><Italic>Italic text</Italic></p>
    <p><Link href="#">This is a link</Link></p>

    <Spacer size="lg" />

    <H2>Spacing</H2>
    <HStack gap="sm">
        <Spacer size="xs" />
        <Spacer size="sm" />
        <Spacer size="md" />
        <Spacer size="lg" />
        <Spacer size="xl" />
    </HStack>

    <Spacer size="lg" />

    <H2>Layout</H2>
    <H3>HStack</H3>
    <HStack gap="md">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
    </HStack>

    <H3>VStack</H3>
    <VStack gap="md">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
    </VStack>

    <H3>Grid (3 columns)</H3>
    <Grid cols={3} gap="md">
        <div>Cell 1</div>
        <div>Cell 2</div>
        <div>Cell 3</div>
        <div>Cell 4</div>
        <div>Cell 5</div>
        <div>Cell 6</div>
    </Grid>

    <Spacer size="lg" />

    <H2>Inputs</H2>
    <VStack gap="sm">
        <Input
            size="sm"
            placeholder="Small input"
            value={inputValue}
            oninput={(v) => (inputValue = v)}
        />
        <Input
            size="md"
            placeholder="Medium input"
            value={inputValue}
            oninput={(v) => (inputValue = v)}
        />
        <Input
            size="lg"
            placeholder="Large input"
            value={inputValue}
            oninput={(v) => (inputValue = v)}
        />
        <Input
            placeholder="With icon"
            icon={MagnifyingGlass}
            value={inputValue}
            oninput={(v) => (inputValue = v)}
        />
        <Input
            placeholder="Clearable"
            clearable
            value={inputValue}
            oninput={(v) => (inputValue = v)}
        />
        <Input
            size="lg"
            placeholder="Icon + clearable"
            icon={MagnifyingGlass}
            clearable
            value={inputValue}
            oninput={(v) => (inputValue = v)}
        />
    </VStack>
    <Switch checked={switchOn} onchange={(v) => (switchOn = v)} />

    <H3>Slider</H3>
    <Slider value={sliderValue} onchange={(v) => sliderValue = v} />
    <p>{sliderValue.toFixed(2)}</p>
    <H4>Vertical</H4>
    <div style="height: 8rem;">
        <Slider direction="vertical" value={sliderValue} onchange={(v) => sliderValue = v} />
    </div>

    <Spacer size="lg" />

    <H2>Buttons</H2>
    <HStack gap="md">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
    </HStack>
    <H3>Rounded Square</H3>
    <HStack gap="md">
        <Button variant="primary" shape="square">Primary</Button>
        <Button variant="secondary" shape="square">Secondary</Button>
        <Button variant="ghost" shape="square">Ghost</Button>
    </HStack>
    <H3>Loading (click to start, switch to reset)</H3>
    <HStack gap="md">
        <Button variant="primary" loading={primaryLoading} onclick={() => primaryLoading = true}>Primary</Button>
        <Button variant="secondary" loading={secondaryLoading} onclick={() => secondaryLoading = true}>Secondary</Button>
        <Button variant="ghost" loading={ghostLoading} onclick={() => ghostLoading = true}>Ghost</Button>
        <Switch checked={primaryLoading || secondaryLoading || ghostLoading} onchange={() => { primaryLoading = false; secondaryLoading = false; ghostLoading = false; }} label="Reset loading" />
    </HStack>

    <Spacer size="lg" />

    <H2>Card</H2>
    <Card>
        <p>This is a card with some content inside.</p>
    </Card>

    <Spacer size="lg" />

    <H2>Dropdown</H2>
    <Dropdown
        options={["Apple", "Banana", "Cherry", "Date", "Elderberry"]}
        value={dropdownValue}
        placeholder="Pick a fruit"
        onchange={(v) => dropdownValue = v}
    />
    <p>Selected: {dropdownValue ?? "none"}</p>

    <H3>Combobox</H3>
    <Combobox
        options={["Apple", "Banana", "Cherry", "Date", "Elderberry", "Fig", "Grape", "Honeydew"]}
        values={comboboxValues}
        placeholder="Search fruits..."
        onchange={(v) => comboboxValues = v}
    />
    <p>Selected: {comboboxValues.length ? comboboxValues.join(", ") : "none"}</p>

    <Spacer size="lg" />

    <H2>Modal</H2>
    <Button onclick={() => (modalOpen = !modalOpen)}>Toggle Modal</Button>
    <Modal open={modalOpen}>
        <VStack gap="md">
            <H3>Modal Title</H3>
            <p>This is modal content with a backdrop blur.</p>
            <Button onclick={() => (modalOpen = false)}>Close</Button>
        </VStack>
    </Modal>
</VStack>
